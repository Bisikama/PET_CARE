-- Rút gọn mô tả 2 gói dịch vụ: bảng giá theo cân nặng, hạng mục bao gồm và phụ phí
-- đã được hiển thị có cấu trúc trên trang Dịch vụ, mô tả chỉ còn câu giới thiệu.
-- Chỉ cập nhật khi mô tả vẫn là bản gốc của migration 20261124100000 (không ghi đè nội dung admin đã sửa).

UPDATE "services"
SET "description" = 'Tắm sạch, sấy khô và chải lông thơm tho — chăm sóc cơ bản định kỳ cho bé.'
WHERE "id" = 'a23b1234-abcd-4234-8f01-000000000101'
  AND "description" LIKE 'Gói tắm cơ bản: tắm và sấy khô, chải lông, khử mùi.%';

UPDATE "services"
SET "description" = 'Vệ sinh toàn diện từ lông, tai, móng đến bàn chân — bé sạch sẽ và gọn gàng từ đầu đến chân.'
WHERE "id" = 'a23b1234-abcd-4234-8f01-000000000102'
  AND "description" LIKE 'Gói vệ sinh toàn diện: tắm và sấy khô%';
