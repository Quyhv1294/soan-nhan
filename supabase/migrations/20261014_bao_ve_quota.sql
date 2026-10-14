-- Giữ quyền sửa hồ sơ, chặn tự sửa/reset quota qua Supabase REST.
-- Có thể chạy trên database hiện có, không thay đổi dữ liệu.
begin;
revoke insert, update, delete on table public.users from public, anon, authenticated;
grant select on table public.users to authenticated;
grant insert (id, ho_ten, cap_hoc, do_tuoi, lop, bo_sach, ten_lop)
  on table public.users to authenticated;
grant update (id, ho_ten, cap_hoc, do_tuoi, lop, bo_sach, ten_lop)
  on table public.users to authenticated;
-- SECURITY DEFINER của tao_ho_so_moi/dung_luot_soan vẫn cập nhật được quota.
commit;
