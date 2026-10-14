-- Lược đồ cơ sở dữ liệu MVP (6 bảng). Chạy trong Supabase SQL Editor.
-- Không lưu tên trẻ hay thông tin phụ huynh (Nghị định 13/2023 về bảo vệ dữ liệu cá nhân).

create extension if not exists unaccent with schema extensions;

-- unaccent() chỉ là STABLE nên không dùng trực tiếp trong chỉ mục được; bọc lại thành IMMUTABLE.
create or replace function public.bo_dau(text) returns text
  language sql immutable parallel safe strict
  as $$ select extensions.unaccent('extensions.unaccent'::regdictionary, $1) $$;

create table public.users (
  id uuid primary key references auth.users on delete cascade,
  ho_ten text,
  cap_hoc text check (cap_hoc in ('mam-non', 'tieu-hoc')),
  do_tuoi text,                 -- 'nha-tre' | '3-4' | '4-5' | '5-6'
  lop smallint check (lop between 1 and 5),
  bo_sach text,
  ten_lop text,
  luot_da_dung int not null default 0,
  luot_lam_moi_ngay date not null default date_trunc('month', now())::date,
  tao_luc timestamptz not null default now()
);

-- Tự tạo hồ sơ tối thiểu sau khi người dùng đăng ký bằng Supabase Auth.
create or replace function public.tao_ho_so_moi()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.users (id, ho_ten) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists tao_ho_so_sau_dang_ky on auth.users;
create trigger tao_ho_so_sau_dang_ky after insert on auth.users
for each row execute procedure public.tao_ho_so_moi();

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  ten text not null,
  cap_hoc text not null default 'mam-non',
  la_mac_dinh boolean not null default false,  -- 20 chủ đề chuẩn
  user_id uuid references public.users on delete cascade  -- null nếu là chủ đề chuẩn
);

create table public.week_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users on delete cascade,
  topic_id uuid references public.topics,
  chu_de text not null,
  nhanh text,
  do_tuoi text not null,
  tu_ngay date not null,
  noi_dung jsonb not null,      -- KeHoachTuan.ngay
  cap_nhat timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users on delete cascade,
  week_plan_id uuid references public.week_plans on delete set null,
  loai text not null check (loai in ('giao-an', 'khbd', 'phieu', 'tro-choi', 'tin-nhan', 'ke-hoach-tuan', 'ke-hoach-thang')),
  tieu_de text not null,
  chu_de text,
  noi_dung jsonb not null,      -- GiaoAnMamNon | KeHoachBaiDay | ...
  cap_nhat timestamptz not null default now()
);
alter table public.documents drop constraint if exists documents_loai_check;
alter table public.documents add constraint documents_loai_check check (loai in ('giao-an', 'khbd', 'phieu', 'tro-choi', 'tin-nhan', 'ke-hoach-tuan', 'ke-hoach-thang'));
create index documents_user_idx on public.documents (user_id, cap_nhat desc);
create index documents_tim_kiem_idx on public.documents using gin (to_tsvector('simple', public.bo_dau(tieu_de || ' ' || coalesce(chu_de, ''))));

create table public.exports (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents on delete cascade,
  dinh_dang text not null check (dinh_dang in ('docx', 'pdf')),
  duong_dan text not null,      -- đường dẫn trong Supabase Storage
  tao_luc timestamptz not null default now()
);

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users on delete set null,
  document_id uuid references public.documents on delete set null,
  loai text not null,
  mo_hinh text not null,
  token_vao int,
  token_ra int,
  chi_phi_usd numeric(10, 6),
  danh_gia smallint check (danh_gia between 0 and 2),  -- 0 không dùng được, 1 sửa rồi dùng, 2 dùng ngay
  tao_luc timestamptz not null default now()
);

-- Bảo mật theo hàng: mỗi giáo viên chỉ thấy dữ liệu của mình.
alter table public.users enable row level security;
alter table public.week_plans enable row level security;
alter table public.documents enable row level security;
alter table public.exports enable row level security;
alter table public.generations enable row level security;
alter table public.topics enable row level security;

create policy "tu xem ho so" on public.users for all using (auth.uid() = id);
create policy "tu quan ly tuan" on public.week_plans for all using (auth.uid() = user_id);
create policy "tu quan ly tai lieu" on public.documents for all using (auth.uid() = user_id);
create policy "tu xem file xuat" on public.exports for select using (
  exists (select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid())
);
create policy "tu xem nhat ky" on public.generations for select using (auth.uid() = user_id);
create policy "xem chu de" on public.topics for select using (la_mac_dinh or auth.uid() = user_id);

-- Tăng quota trong một giao dịch để nhiều request đồng thời không vượt hạn mức.
create or replace function public.dung_luot_soan(p_limit integer default 20)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  used_count integer;
begin
  if uid is null then return false; end if;
  insert into public.users (id) values (uid) on conflict (id) do nothing;
  update public.users
    set luot_da_dung = case when luot_lam_moi_ngay < date_trunc('month', now())::date then 0 else luot_da_dung end,
        luot_lam_moi_ngay = date_trunc('month', now())::date
    where id = uid;
  select luot_da_dung into used_count from public.users where id = uid for update;
  if used_count >= greatest(p_limit, 0) then return false; end if;
  update public.users set luot_da_dung = luot_da_dung + 1 where id = uid;
  return true;
end;
$$;
revoke all on function public.dung_luot_soan(integer) from public;
grant execute on function public.dung_luot_soan(integer) to authenticated;

-- Người dùng chỉ được cập nhật thông tin hồ sơ, không được tự reset quota qua REST.
revoke insert, update, delete on table public.users from public, anon, authenticated;
grant select on table public.users to authenticated;
grant insert (id, ho_ten, cap_hoc, do_tuoi, lop, bo_sach, ten_lop)
  on table public.users to authenticated;
grant update (id, ho_ten, cap_hoc, do_tuoi, lop, bo_sach, ten_lop)
  on table public.users to authenticated;
