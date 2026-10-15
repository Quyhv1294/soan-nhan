-- Hoàn lại 1 lượt soạn khi AI lỗi (lượt được trừ trước khi gọi AI).
-- Chạy file này một lần trong Supabase → SQL Editor. Chưa chạy thì app vẫn hoạt động, chỉ là lượt không được hoàn.
create or replace function public.hoan_luot_soan()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then return; end if;
  update public.users set luot_da_dung = greatest(luot_da_dung - 1, 0) where id = auth.uid();
end;
$$;
revoke all on function public.hoan_luot_soan() from public;
grant execute on function public.hoan_luot_soan() to authenticated;
