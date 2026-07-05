# 📖 Hướng Dẫn Sử Dụng và Thêm Mới API vào Swagger

Dự án Pet Care Backend đã được tích hợp sẵn Swagger để tự động tạo tài liệu API.
Bạn có thể truy cập để test API trực tiếp tại: **`http://localhost:3000/api/docs`** (chạy server bằng `npm run start:dev`).

Để giữ cho tài liệu Swagger luôn gọn gàng, dễ đọc và không bị xung đột, các thành viên trong team vui lòng tuân thủ các bước sau khi tạo một Controller, API hay DTO mới.

---

## 1. Gom nhóm API theo Module (Bắt buộc)
Khi tạo một Controller mới, bạn **PHẢI** dùng decorator `@ApiTags` trên đầu class để phân nhóm. Nếu không có dòng này, các API sẽ hiển thị chung chung (default) rất khó tìm.

```typescript
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users') // <-- BẮT BUỘC: Gom tất cả API trong file này vào nhóm "Users"
@Controller('users')
export class UsersController {
  // ...
}
```

---

## 2. Mô tả rõ chức năng của từng Endpoint
Để Fronend (hoặc các thành viên khác) nhìn vào biết API của bạn làm gì, hãy luôn thêm `@ApiOperation` trên mỗi phương thức route.

```typescript
import { Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

@Get()
@ApiOperation({ summary: 'Lấy danh sách tất cả người dùng' }) // <-- Mô tả chức năng API
getAllUsers() {
  return [];
}
```

---

## 3. Báo cho Swagger biết API cần Token (Ổ khóa bảo mật)
Nếu API của bạn yêu cầu người dùng phải đăng nhập (có dùng `@UseGuards(...)`), bạn **PHẢI** thêm `@ApiBearerAuth()` để Swagger hiển thị biểu tượng **ổ khóa**, cho phép truyền Access Token vào để test trực tiếp.

```typescript
import { Get } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@Get('me')
@ApiBearerAuth() // <-- Quan trọng: Bật chỗ điền JWT Token
@ApiOperation({ summary: 'Lấy thông tin cá nhân của user đang login' })
getProfile() {
  return {};
}
```

---

## 4. Định nghĩa dữ liệu gửi lên (DTO)
Để Swagger tạo form nhập liệu đẹp và tự động sinh dữ liệu mẫu (Request Body), hãy thêm `@ApiProperty` vào các thuộc tính bên trong file DTO (`.dto.ts`).

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ 
    example: 'Nguyễn Văn A', 
    description: 'Họ và tên của người dùng' 
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;
  
  @ApiProperty({ 
    example: '0901234567',
    description: 'Số điện thoại',
    required: false // Điền false nếu trường này là optional (?)
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
```

---

## 💡 Lưu Ý Quan Trọng Để Tránh Lỗi & Xung Đột
1. **Không trùng lặp Route:** Hãy chắc chắn rằng trong toàn bộ dự án (không riêng gì 1 controller), không có 2 API nào có cùng HTTP Method và cùng chung một đường dẫn URL (ví dụ có hai chỗ cùng định nghĩa `@Get('api/users')`).
2. **Khai báo DTO khác nhau:** Hãy tách biệt DTO của từng API (ví dụ `CreateUserDto` khác với `UpdateUserDto`) để Swagger không bị hiển thị sai schema khi test.
3. **Chỉ dùng Import từ `@nestjs/swagger`:** Đảm bảo tất cả decorator (`@ApiTags`, `@ApiOperation`, `@ApiProperty`,...) được import đúng từ package `@nestjs/swagger`.
