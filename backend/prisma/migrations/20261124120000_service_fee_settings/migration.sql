-- Phí di chuyển & phụ phí dịch vụ do admin cấu hình (trang Quản Lý Dịch Vụ → Phụ phí & phí di chuyển).
-- Giá trị khởi tạo theo bảng phụ phí đề xuất. Không ghi đè nếu đã có cấu hình.
INSERT INTO "system_configs" ("key", "value", "description") VALUES
  ('TRAVEL_FREE_DISTANCE_KM', '5', 'Số km di chuyển đầu tiên được miễn phí'),
  ('TRAVEL_SURCHARGE_PER_KM', '5000', 'Phí di chuyển mỗi km vượt thêm (VND)'),
  ('SERVICE_SURCHARGES',
   '[{"label":"Lông dài, dày","minFee":30000,"maxFee":80000},{"label":"Gỡ lông rối","minFee":50000,"maxFee":150000},{"label":"Chăm sóc mèo cần thêm thời gian","minFee":30000,"maxFee":70000},{"label":"Phục vụ ngoài giờ","minFee":50000,"maxFee":null}]',
   'Phụ phí có thể phát sinh (hiển thị cho khách, thống nhất trước khi thực hiện)')
ON CONFLICT ("key") DO NOTHING;
