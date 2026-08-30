import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
});

const prisma = new PrismaClient({ adapter });

async function seedChecklistTemplates() {
  console.log('\n🚀 Bắt đầu nạp dữ liệu mẫu cho service_checklist_templates...\n');

  const checklistTemplatesData = [
    // Service 1: Chăm sóc chó tại nhà (a23b1234-abcd-4234-8f01-000000000001)
    {
      id: 'c23b1234-abcd-4234-8f03-000000000001',
      service_id: 'a23b1234-abcd-4234-8f01-000000000001',
      title: 'Kiểm tra tình trạng sức khỏe & tinh thần ban đầu của cún',
      description: 'Quan sát mắt, mũi, dáng đi và mức độ hòa đồng khi vừa đến nhà',
      is_required: true,
      sort_order: 1,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000002',
      service_id: 'a23b1234-abcd-4234-8f01-000000000001',
      title: 'Cho cún ăn theo khẩu phần & thay nước uống sạch mới',
      description: 'Định lượng thức ăn theo hướng dẫn của chủ nuôi, rửa sạch bát và châm nước sạch',
      is_required: true,
      sort_order: 2,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000003',
      service_id: 'a23b1234-abcd-4234-8f01-000000000001',
      title: 'Dọn dẹp vệ sinh khu vực chuồng/khay vệ sinh của cún',
      description: 'Thu dọn chất thải, khử mùi và lau sạch khu vực sinh hoạt của cún',
      is_required: true,
      sort_order: 3,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000004',
      service_id: 'a23b1234-abcd-4234-8f01-000000000001',
      title: 'Vận động nhẹ / Chơi đùa tương tác cùng cún',
      description: 'Chơi bóng, kéo co hoặc ném đồ chơi giải tỏa năng lượng (15-20 phút)',
      is_required: false,
      sort_order: 4,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000005',
      service_id: 'a23b1234-abcd-4234-8f01-000000000001',
      title: 'Chải lông & Kiểm tra ve rận/ký sinh trùng ngoài da',
      description: 'Chải mượt lông, kiểm tra sớm các nốt viêm da hoặc bọ chét nếu có',
      is_required: false,
      sort_order: 5,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000006',
      service_id: 'a23b1234-abcd-4234-8f01-000000000001',
      title: 'Chụp ảnh/video báo cáo tình trạng cho chủ nuôi trước khi về',
      description: 'Chụp ảnh nghiệm thu cún ăn uống đầy đủ, chuồng trại sạch sẽ và vui vẻ',
      is_required: true,
      sort_order: 6,
    },

    // Service 2: Dắt chó đi dạo (a23b1234-abcd-4234-8f01-000000000002)
    {
      id: 'c23b1234-abcd-4234-8f03-000000000011',
      service_id: 'a23b1234-abcd-4234-8f01-000000000002',
      title: 'Kiểm tra dây dắt, yếm/vòng cổ an toàn trước khi ra ngoài',
      description: 'Đảm bảo dây đeo chắc chắn, vừa vặn, không quá chật hoặc dễ tuột',
      is_required: true,
      sort_order: 1,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000012',
      service_id: 'a23b1234-abcd-4234-8f01-000000000002',
      title: 'Mang theo túi dọn vệ sinh & bình nước uống cho cún',
      description: 'Chuẩn bị đầy đủ dụng cụ dọn chất thải và nước bù khoáng khi đi dạo',
      is_required: true,
      sort_order: 2,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000013',
      service_id: 'a23b1234-abcd-4234-8f01-000000000002',
      title: 'Dắt cún đi dạo theo cung đường an toàn (30-40 phút)',
      description: 'Đi dạo trong công viên/khu dân cư, tránh các khu vực có chó dữ hoặc xe cộ',
      is_required: true,
      sort_order: 3,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000014',
      service_id: 'a23b1234-abcd-4234-8f01-000000000002',
      title: 'Thu dọn chất thải của cún trong suốt quá trình đi dạo',
      description: 'Nhặt và bỏ chất thải đúng nơi quy định để giữ gìn vệ sinh chung',
      is_required: true,
      sort_order: 4,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000015',
      service_id: 'a23b1234-abcd-4234-8f01-000000000002',
      title: 'Cho cún nghỉ ngơi giải lao & tiếp nước',
      description: 'Nghỉ ngơi tại bóng râm mát và cho cún uống nước đầy đủ',
      is_required: true,
      sort_order: 5,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000016',
      service_id: 'a23b1234-abcd-4234-8f01-000000000002',
      title: 'Lau sạch 4 bàn chân & kiểm tra dị vật trước khi vào nhà',
      description: 'Lau sạch bụi bẩn kẽ bàn chân, kiểm tra gai/dăm đâm vào đệm chân',
      is_required: true,
      sort_order: 6,
    },

    // Service 3: Chăm sóc mèo tại nhà (a23b1234-abcd-4234-8f01-000000000003)
    {
      id: 'c23b1234-abcd-4234-8f03-000000000021',
      service_id: 'a23b1234-abcd-4234-8f01-000000000003',
      title: 'Kiểm tra tình trạng sức khỏe & biểu hiện ban đầu của mèo',
      description: 'Tiếp cận nhẹ nhàng, quan sát biểu hiện và tạo sự tin tưởng cho mèo',
      is_required: true,
      sort_order: 1,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000022',
      service_id: 'a23b1234-abcd-4234-8f01-000000000003',
      title: 'Dọn sạch khay cát & thay/bổ sung cát mới nếu cần',
      description: 'Sàng lọc phân vón cục, đổ thêm cát mới và lau sạch xung quanh chậu cát',
      is_required: true,
      sort_order: 2,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000023',
      service_id: 'a23b1234-abcd-4234-8f01-000000000003',
      title: 'Cho mèo ăn hạt/pate và thay nước lọc tươi mới',
      description: 'Rửa sạch bát ăn/uống, châm nước lọc tươi mới và cho ăn đúng khẩu phần',
      is_required: true,
      sort_order: 3,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000024',
      service_id: 'a23b1234-abcd-4234-8f01-000000000003',
      title: 'Chơi đùa với cần câu mèo / Đồ chơi tương tác',
      description: 'Kích thích vận động nhẹ nhàng và giảm căng thẳng cho mèo',
      is_required: false,
      sort_order: 4,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000025',
      service_id: 'a23b1234-abcd-4234-8f01-000000000003',
      title: 'Chải lông rụng & Vệ sinh ghèn mắt/tai cơ bản',
      description: 'Dùng lược chải lông chuyên dụng và bông lau sạch ghèn mắt/tai nếu có',
      is_required: false,
      sort_order: 5,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000026',
      service_id: 'a23b1234-abcd-4234-8f01-000000000003',
      title: 'Chụp ảnh/video báo cáo tổng thể cho chủ nuôi',
      description: 'Gửi hình ảnh mèo vui vẻ, khay cát sạch và bát ăn đầy đủ',
      is_required: true,
      sort_order: 6,
    },

    // Service 4: Tắm rửa & Cắt tỉa lông thú cưng (a23b1234-abcd-4234-8f01-000000000004)
    {
      id: 'c23b1234-abcd-4234-8f03-000000000031',
      service_id: 'a23b1234-abcd-4234-8f01-000000000004',
      title: 'Kiểm tra tình trạng da, lông, mắt và tai trước khi tắm',
      description: 'Kiểm tra vết thương hở, nấm da, ve rận hoặc viêm tai trước khi thực hiện',
      is_required: true,
      sort_order: 1,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000032',
      service_id: 'a23b1234-abcd-4234-8f01-000000000004',
      title: 'Cắt mài móng & Vệ sinh sạch kẽ bàn chân',
      description: 'Cắt móng an toàn tránh phạm tủy và dũa mịn các cạnh sắc',
      is_required: true,
      sort_order: 2,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000033',
      service_id: 'a23b1234-abcd-4234-8f01-000000000004',
      title: 'Vệ sinh, nhổ lông tai & Vắt tuyến hôi hậu môn',
      description: 'Lau sạch ráy tai bằng dung dịch chuyên dụng và vắt tuyến mồ hôi hậu môn',
      is_required: true,
      sort_order: 3,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000034',
      service_id: 'a23b1234-abcd-4234-8f01-000000000004',
      title: 'Tắm dầu gội dưỡng ẩm/khử mùi & Xả sạch bằng nước ấm',
      description: 'Tắm massage 2 lần bằng sữa tắm chuyên dụng và xả sạch toàn bộ bọt',
      is_required: true,
      sort_order: 4,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000035',
      service_id: 'a23b1234-abcd-4234-8f01-000000000004',
      title: 'Sấy khô hoàn toàn chân lông & Chải tơ phồng lông',
      description: 'Sấy khô kiệt chân lông tránh ẩm mốc da và chải tơi phồng lông',
      is_required: true,
      sort_order: 5,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000036',
      service_id: 'a23b1234-abcd-4234-8f01-000000000004',
      title: 'Cắt tỉa lông tạo kiểu theo yêu cầu của khách hàng',
      description: 'Tỉa gọn lông mặt, lông chân, viền mông và tạo form dáng chuẩn',
      is_required: true,
      sort_order: 6,
    },
    {
      id: 'c23b1234-abcd-4234-8f03-000000000037',
      service_id: 'a23b1234-abcd-4234-8f01-000000000004',
      title: 'Xịt nước hoa dưỡng lông & Chụp ảnh thành quả (Before/After)',
      description: 'Xịt dưỡng thơm lông và chụp ảnh nghiệm thu thành phẩm gửi khách hàng',
      is_required: true,
      sort_order: 7,
    },
  ];

  let insertedCount = 0;
  for (const ct of checklistTemplatesData) {
    await prisma.service_checklist_templates.upsert({
      where: { id: ct.id },
      update: ct,
      create: ct,
    });
    insertedCount++;
  }

  console.log(`✅ Đã upsert thành công ${insertedCount} checklist templates cho 4 dịch vụ!\n`);
}

seedChecklistTemplates()
  .catch((e) => {
    console.error('❌ Lỗi khi seed checklist templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
