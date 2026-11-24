-- Gói dịch vụ hệ thống: chỉ bán 2 gói Basic Bath (từ 149.000đ) và Clean Care (từ 229.000đ).
-- Giá niêm yết theo cân nặng (service_pricing_rules), áp dụng cho chó và mèo.
-- Biên cân nặng: "Dưới 5" = 0–4.99 | "5–10" = 5–10 | "Trên 10–15" = 10.01–15 | ... | trên 30 kg: báo giá riêng (không có dòng giá).
-- Chỉ thêm / ngừng bán dữ liệu, không xoá gì: booking cũ vẫn giữ nguyên lịch sử.

-- 1. Hai gói dịch vụ
INSERT INTO "services" ("id", "name", "description", "category", "base_price", "duration_minutes", "is_active")
VALUES
  ('a23b1234-abcd-4234-8f01-000000000101', 'Basic Bath',
   'Gói tắm cơ bản: tắm và sấy khô, chải lông, khử mùi. Thời gian dự kiến 30–60 phút. '
   || 'Giá theo cân nặng: dưới 5 kg 149.000đ; 5–10 kg 189.000đ; trên 10–15 kg 229.000đ; trên 15–20 kg 279.000đ; trên 20–30 kg 349.000đ; trên 30 kg báo giá riêng. '
   || 'Phụ phí (thống nhất với khách trước khi thực hiện): lông dài, dày 30.000–80.000đ; gỡ lông rối 50.000–150.000đ; '
   || 'chăm sóc mèo cần thêm thời gian 30.000–70.000đ; phục vụ ngoài giờ 50.000đ. Di chuyển miễn phí trong 5 km, vượt thêm 5.000đ/km.',
   'Grooming', 149000, 60, true),
  ('a23b1234-abcd-4234-8f01-000000000102', 'Clean Care',
   'Gói vệ sinh toàn diện: tắm và sấy khô, chải lông, khử mùi, vệ sinh tai, cắt và mài móng, vệ sinh bàn chân, cạo lông vùng vệ sinh. Thời gian dự kiến 60–90 phút. '
   || 'Giá theo cân nặng: dưới 5 kg 229.000đ; 5–10 kg 269.000đ; trên 10–15 kg 319.000đ; trên 15–20 kg 379.000đ; trên 20–30 kg 449.000đ; trên 30 kg báo giá riêng. '
   || 'Phụ phí (thống nhất với khách trước khi thực hiện): lông dài, dày 30.000–80.000đ; gỡ lông rối 50.000–150.000đ; '
   || 'chăm sóc mèo cần thêm thời gian 30.000–70.000đ; phục vụ ngoài giờ 50.000đ. Di chuyển miễn phí trong 5 km, vượt thêm 5.000đ/km.',
   'Grooming', 229000, 90, true)
ON CONFLICT ("id") DO NOTHING;

-- 2. Bảng giá theo cân nặng (chó và mèo cùng giá)
INSERT INTO "service_pricing_rules" ("service_id", "pet_species", "min_weight", "max_weight", "price", "duration_minutes")
SELECT v.service_id::uuid, sp.species, v.min_w, v.max_w, v.price, v.duration
FROM (VALUES
  ('a23b1234-abcd-4234-8f01-000000000101',  0.00,  4.99, 149000, 60),
  ('a23b1234-abcd-4234-8f01-000000000101',  5.00, 10.00, 189000, 60),
  ('a23b1234-abcd-4234-8f01-000000000101', 10.01, 15.00, 229000, 60),
  ('a23b1234-abcd-4234-8f01-000000000101', 15.01, 20.00, 279000, 60),
  ('a23b1234-abcd-4234-8f01-000000000101', 20.01, 30.00, 349000, 60),
  ('a23b1234-abcd-4234-8f01-000000000102',  0.00,  4.99, 229000, 90),
  ('a23b1234-abcd-4234-8f01-000000000102',  5.00, 10.00, 269000, 90),
  ('a23b1234-abcd-4234-8f01-000000000102', 10.01, 15.00, 319000, 90),
  ('a23b1234-abcd-4234-8f01-000000000102', 15.01, 20.00, 379000, 90),
  ('a23b1234-abcd-4234-8f01-000000000102', 20.01, 30.00, 449000, 90)
) AS v(service_id, min_w, max_w, price, duration)
CROSS JOIN (VALUES ('Dog'), ('Cat')) AS sp(species)
WHERE NOT EXISTS (
  SELECT 1 FROM "service_pricing_rules" r
  WHERE r."service_id" = v.service_id::uuid AND r."pet_species" = sp.species
    AND r."min_weight" = v.min_w AND r."deleted_at" IS NULL
);

-- 3. Hạng mục bao gồm trong từng gói (provider tick theo checklist khi làm)
INSERT INTO "service_checklist_templates" ("service_id", "title", "is_required", "sort_order")
SELECT v.service_id::uuid, v.title, true, v.sort_order
FROM (VALUES
  ('a23b1234-abcd-4234-8f01-000000000101', 'Tắm và sấy khô', 1),
  ('a23b1234-abcd-4234-8f01-000000000101', 'Chải lông, khử mùi', 2),
  ('a23b1234-abcd-4234-8f01-000000000102', 'Tắm và sấy khô', 1),
  ('a23b1234-abcd-4234-8f01-000000000102', 'Chải lông, khử mùi', 2),
  ('a23b1234-abcd-4234-8f01-000000000102', 'Vệ sinh tai', 3),
  ('a23b1234-abcd-4234-8f01-000000000102', 'Cắt, mài móng', 4),
  ('a23b1234-abcd-4234-8f01-000000000102', 'Vệ sinh bàn chân', 5),
  ('a23b1234-abcd-4234-8f01-000000000102', 'Cạo lông vùng vệ sinh', 6)
) AS v(service_id, title, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM "service_checklist_templates" t
  WHERE t."service_id" = v.service_id::uuid AND t."title" = v.title AND t."deleted_at" IS NULL
);

-- 4. Đối tác đã được duyệt năng lực tắm/cắt tỉa (Grooming) => tự có năng lực cho 2 gói mới
--    (giữ nguyên loài & khoảng cân nặng đã duyệt). Giá khách trả lấy theo bảng giá hệ thống.
INSERT INTO "provider_services"
  ("provider_id", "service_id", "price", "pet_species", "min_weight", "max_weight", "status", "approved_by", "approved_at", "is_active")
SELECT ps."provider_id", n.id::uuid, n.base_price, ps."pet_species", ps."min_weight", ps."max_weight",
       'APPROVED'::"capability_status", ps."approved_by", COALESCE(ps."approved_at", now()), true
FROM "provider_services" ps
JOIN "services" s ON s."id" = ps."service_id"
CROSS JOIN (VALUES
  ('a23b1234-abcd-4234-8f01-000000000101', 149000),
  ('a23b1234-abcd-4234-8f01-000000000102', 229000)
) AS n(id, base_price)
WHERE s."category" = 'Grooming'
  AND s."id" NOT IN ('a23b1234-abcd-4234-8f01-000000000101', 'a23b1234-abcd-4234-8f01-000000000102')
  AND ps."status" = 'APPROVED'
  AND COALESCE(ps."is_active", true) = true
ON CONFLICT ("provider_id", "service_id", "pet_species", "min_weight", "max_weight") DO NOTHING;

-- 5. Ngừng bán mọi gói khác (không xoá: booking cũ vẫn tra cứu được). Admin mở bán lại được trong trang Quản Lý Dịch Vụ.
UPDATE "services" SET "is_active" = false
WHERE "id" NOT IN ('a23b1234-abcd-4234-8f01-000000000101', 'a23b1234-abcd-4234-8f01-000000000102')
  AND "is_active" IS DISTINCT FROM false;
