-- Chạy một lần cho database đã có bảng documents; không xóa/chuyển đổi tài liệu cũ.
-- Dự án mới dùng supabase/schema.sql đã có loại kế hoạch tháng.
begin;
alter table public.documents drop constraint if exists documents_loai_check;
alter table public.documents add constraint documents_loai_check
  check (loai in ('giao-an', 'khbd', 'phieu', 'tro-choi', 'tin-nhan', 'ke-hoach-tuan', 'ke-hoach-thang'));
comment on column public.documents.noi_dung is
  'JSON tài liệu; ke-hoach-thang dùng KeHoachThang phienBan=1, tuần/ngày và các khối chung nằm trong cùng tài liệu, ngày lịch YYYY-MM-DD.';
commit;
