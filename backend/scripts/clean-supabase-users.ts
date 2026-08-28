import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const emailsToDelete = [
  'customer@example.com',
  'provider@example.com',
  'admin@example.com',
  'customer_govap@example.com',
  'provider_govap@example.com',
];

async function cleanUsers() {
  console.log('🚀 Đang quét danh sách tài khoản trên Supabase Auth...');

  const { data: { users }, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    console.error('❌ Không thể lấy danh sách users:', error.message);
    process.exit(1);
  }

  const targetUsers = users.filter((user) => user.email && emailsToDelete.includes(user.email));

  if (targetUsers.length === 0) {
    console.log('✅ Không tìm thấy tài khoản test nào cần xóa trên Supabase Auth.');
    return;
  }

  console.log(`🔍 Tìm thấy ${targetUsers.length} tài khoản test trên Supabase Auth. Bắt đầu xóa...`);

  for (const user of targetUsers) {
    console.log(`🧹 Đang xóa user: ${user.email} (ID: ${user.id})...`);
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error(`❌ Lỗi khi xóa ${user.email}:`, deleteError.message);
    } else {
      console.log(`✅ Đã xóa thành công: ${user.email}`);
    }
  }

  console.log('🎉 Đã dọn dẹp sạch sẽ các tài khoản test trên Supabase Auth!');
}

cleanUsers().catch((err) => {
  console.error('❌ Lỗi không xác định:', err);
  process.exit(1);
});
