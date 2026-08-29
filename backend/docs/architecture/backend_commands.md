# Hướng Dẫn Sử Dụng Câu Lệnh Thực Thi & Chạy Test (Backend)

Tài liệu này tổng hợp toàn bộ các câu lệnh cần thiết để khởi chạy dự án, làm việc với cơ sở dữ liệu (Prisma), chạy các bộ kiểm thử (test), và đảm bảo chất lượng mã nguồn (lint & format) cho phần backend của hệ thống **PetCare**.

---

## 1. Điều Kiện Tiên Quyết (Prerequisites)

Trước khi thực thi các câu lệnh dưới đây, bạn cần đảm bảo:
* Đã cài đặt **Node.js** (khuyến nghị phiên bản LTS).
* Đã sao chép cấu hình môi trường từ các file mẫu:
  * Tạo file `.env` bằng cách sao chép từ [.env.example](file:///d:/SESSION_7/EXE/PET_LOVE/backend/.env.example) và điều chỉnh thông tin kết nối DB của bạn.
  * Tạo file `.env.test` bằng cách sao chép từ [.env.test.example](file:///d:/SESSION_7/EXE/PET_LOVE/backend/.env.test.example) (lưu ý: database kiểm thử phải kết thúc bằng `_test` để tránh làm mất dữ liệu thật).
* Chi tiết thiết kế cơ sở dữ liệu có thể tham khảo tại tài liệu [database.md](file:///d:/SESSION_7/EXE/PET_LOVE/backend/database.md).

---

## 2. Khởi Động Cơ Sở Dữ Liệu (Docker)

Nếu bạn sử dụng Docker để chạy PostgreSQL (được cấu hình sẵn trong [docker-compose.yml](file:///d:/SESSION_7/EXE/PET_LOVE/backend/docker-compose.yml)):

| Câu lệnh | Mục đích / Giải thích |
| :--- | :--- |
| `docker compose up -d` | Khởi động container chứa PostgreSQL ở chế độ chạy ngầm (detached mode) theo cấu hình của cổng kết nối và tài khoản từ file `.env`. |
| `docker compose down` | Dừng và xóa container chứa cơ sở dữ liệu PostgreSQL đang chạy. |

---

## 3. Cài Đặt Dự Án & Build

Các câu lệnh cơ bản để khởi tạo và chuẩn bị chạy dự án:

| Câu lệnh | Mục đích / Giải thích |
| :--- | :--- |
| `npm install` | Cài đặt toàn bộ các thư viện và dependencies cần thiết của backend được khai báo trong [package.json](file:///d:/SESSION_7/EXE/PET_LOVE/backend/package.json). |
| `npm run build` | Biên dịch toàn bộ mã nguồn TypeScript từ thư mục `src` sang mã nguồn JavaScript trong thư mục `dist` để chuẩn bị cho môi trường chạy chính thức (Production). |

---

## 4. Quản Lý Cơ Sở Dữ Liệu (Prisma ORM)

Hệ thống sử dụng Prisma để giao tiếp với PostgreSQL. Dưới đây là các câu lệnh làm việc với DB:

| Câu lệnh | Mục đích / Giải thích |
| :--- | :--- |
| `npx prisma generate` | Khởi tạo hoặc cập nhật lại Prisma Client dựa trên schema hiện tại. Câu lệnh này tự động chạy sau khi cập nhật database schema. |
| `npx prisma migrate dev --name <tên_migration>` | Tạo một file migration mới và áp dụng nó vào database phát triển (Development DB). Sử dụng khi bạn vừa thay đổi cấu trúc bảng trong file `schema.prisma`. |
| `npm run db:seed` | Thực thi file seed dữ liệu tại `prisma/seed.ts` để nạp các bản ghi mẫu ban đầu (như Roles, danh mục dịch vụ mẫu...) vào database. |
| `npm run db:reset` | Khôi phục database về trạng thái ban đầu: xóa sạch toàn bộ các bảng, chạy lại tất cả các tệp migrations từ đầu và tự động nạp lại dữ liệu seed mẫu. |
| `npx prisma studio` | Khởi chạy một giao diện web trực quan (thường ở địa chỉ `http://localhost:5555`) để bạn trực tiếp xem, sửa đổi, thêm và xóa dữ liệu trong database một cách nhanh chóng. |

---

## 5. Khởi Chạy Dự Án (Run Application)

Các lệnh để chạy NestJS server:

| Lệnh npm | Lệnh Nest gốc | Mục đích / Giải thích |
| :--- | :--- | :--- |
| `npm run start` | `nest start` | Khởi động server NestJS ở chế độ bình thường (không tự động tải lại khi thay đổi code). |
| `npm run start:dev` | `nest start --watch` | Khởi động server ở chế độ phát triển (Development). Tự động theo dõi các thay đổi của file nguồn `.ts` và restart lại server ngay lập tức. |
| `npm run start:debug` | `nest start --debug --watch` | Khởi động server ở chế độ gỡ lỗi (Debugging) kết hợp theo dõi file thay đổi. Bạn có thể kết nối VS Code Debugger hoặc Chrome DevTools thông qua cổng mặc định `9229`. |
| `npm run start:prod` | `node dist/main` | Khởi chạy ứng dụng JavaScript đã được biên dịch trước đó trong thư mục `dist` (dành cho môi trường Productive, yêu cầu chạy `npm run build` trước). |

---

## 6. Chạy Kiểm Thử (Run Tests)

Dự án sử dụng Jest để viết và chạy các bộ kiểm thử:

| Câu lệnh | Mục đích / Giải thích |
| :--- | :--- |
| `npm run test` | Khởi chạy toàn bộ các file Unit Test (có hậu tố `.spec.ts`) để kiểm tra logic riêng lẻ của các service, controller,... |
| `npm run test:watch` | Chạy Unit Test ở chế độ watch. Jest sẽ tự động chạy lại các ca kiểm thử liên quan khi phát hiện file code tương ứng được chỉnh sửa. |
| `npm run test:cov` | Chạy toàn bộ Unit Test và xuất ra một báo cáo về độ bao phủ mã nguồn (Code Coverage Report) trong thư mục `/coverage`. Báo cáo này cho biết có bao nhiêu % số dòng code đã được chạy qua kiểm thử. |
| `npm run test:e2e` | Chạy các bài kiểm thử tích hợp đầu cuối (End-to-End Test, các file có hậu tố `.e2e-spec.ts` trong thư mục `test`) để kiểm tra toàn bộ luồng request/response đi qua các API. |
| `npm run test:db` | **(Quan trọng)** Lệnh đặc thù cho môi trường PowerShell: thiết lập môi trường test (`NODE_ENV=test`), thực hiện migrate cấu trúc bảng lên cơ sở dữ liệu test (`npx prisma migrate deploy`), và chạy các bài kiểm thử E2E tuần tự (`--runInBand`) trên database test riêng biệt đó. |

---

## 7. Chất Lượng Mã Nguồn & Định Dạng (Lint & Format)

Để đảm bảo mã nguồn tuân thủ tiêu chuẩn chung và không có lỗi định dạng:

| Câu lệnh | Mục đích / Giải thích |
| :--- | :--- |
| `npm run lint` | Quét toàn bộ mã nguồn backend bằng ESLint để tìm kiếm các lỗi cú pháp, vi phạm quy tắc coding và tự động sửa các lỗi có thể sửa được (`--fix`). |
| `npm run format` | Định dạng lại toàn bộ các tệp `.ts` trong thư mục `src` và `test` bằng Prettier để đảm bảo tính nhất quán về khoảng trắng, dấu ngoặc, thụt đầu dòng,... |
