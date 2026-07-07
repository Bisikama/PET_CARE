#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const readline = require("readline/promises");

// Color constants
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  red: "\x1b[31m",
  bgBlue: "\x1b[44m",
  bgGreen: "\x1b[42m",
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const BACKEND_DIR = path.join(__dirname, "backend");

// Simple Env Parser to read .env or .env.test manually to prevent pollution
function loadEnv(envFileName) {
  const filePath = path.join(BACKEND_DIR, envFileName);
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const env = {};
  content.split(/\r?\n/).forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith("#")) return;
    const index = line.indexOf("=");
    if (index === -1) return;
    let key = line.substring(0, index).trim();
    let value = line.substring(index + 1).trim();
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value;
  });
  return env;
}

// Executes a command using spawn and streams output in real-time
function executeCommand(command, args, envVars = {}, cwd = BACKEND_DIR) {
  return new Promise((resolve) => {
    const finalEnv = { ...process.env, ...envVars };

    console.log(
      `\n${colors.cyan}${colors.bright}> [EXEC] ${command} ${args.join(" ")}${colors.reset}`,
    );

    const child = spawn(command, args, {
      cwd,
      env: finalEnv,
      stdio: "inherit",
      shell: true, // Important for Windows npm/npx
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log(
          `\n${colors.green}${colors.bright}✔ Lệnh thực thi thành công!${colors.reset}\n`,
        );
        resolve(true);
      } else {
        console.log(
          `\n${colors.red}${colors.bright}✘ Lệnh thất bại với mã thoát: ${code}${colors.reset}\n`,
        );
        resolve(false);
      }
    });
  });
}

// Scans test directories and returns available spec files
function getTestFiles(dir, isE2E = false) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== "node_modules" && file !== "dist") {
        results = results.concat(getTestFiles(fullPath, isE2E));
      }
    } else {
      const isMatch = isE2E
        ? file.endsWith(".e2e-spec.ts")
        : file.endsWith(".spec.ts");
      if (isMatch) {
        results.push(path.relative(BACKEND_DIR, fullPath));
      }
    }
  });
  return results;
}

// Visual layout decorator
function printHeader(title) {
  const line = "=".repeat(60);
  console.log(`\n${colors.magenta}${colors.bright}${line}`);
  console.log(`  ${title.toUpperCase()}`);
  console.log(`${line}${colors.reset}\n`);
}

// Prints the test scenarios documentation
function printScenarios() {
  printHeader("Danh Sách Kịch Bản Kiểm Thử (Test Scenarios)");

  console.log(
    `${colors.cyan}${colors.bright}=== I. UNIT TESTS (Kiểm Thử Đơn Vị - 11 Suites, 48 Tests) ===${colors.reset}`,
  );

  console.log(
    `\n${colors.yellow}${colors.bright}1. LoginUserUseCase${colors.reset} (login-user.use-case.spec.ts)`,
  );
  console.log("   - Đăng nhập thành công với tài khoản Supabase local.");
  console.log(
    "   - Xử lý xung đột khi có sự sai lệch Supabase ID (ID mismatch -> Conflict).",
  );
  console.log(
    "   - Từ chối đăng nhập khi email chưa được xác thực (Not verified -> Forbidden).",
  );
  console.log(
    "   - Đăng nhập thành công với tài khoản cũ dùng bcrypt (Legacy bcrypt - không gọi Supabase).",
  );
  console.log(
    "   - Từ chối đăng nhập khi tài khoản bcrypt sai mật khẩu (Unauthorized).",
  );
  console.log(
    "   - Xử lý tài khoản local chưa hoàn thiện (thiếu password/Supabase ID -> Conflict).",
  );
  console.log(
    "   - Tự động đồng bộ JIT (Just-In-Time) từ Supabase nếu tài khoản local chưa tồn tại.",
  );
  console.log(
    "   - Từ chối đăng nhập đối với tài khoản đang bị khóa (isActive = false -> Forbidden).",
  );

  console.log(
    `\n${colors.yellow}${colors.bright}2. RegisterUserUseCase${colors.reset} (register-user.use-case.spec.ts)`,
  );
  console.log(
    "   - Đăng ký thành công: chuẩn hóa email, gọi Supabase signUp, tạo user local.",
  );
  console.log("   - Từ chối đăng ký nếu email local đã tồn tại (Conflict).");
  console.log(
    "   - Kịch bản Obfuscation của Supabase (trả về thành công nhưng không tạo local user nếu đã có trên Supabase).",
  );
  console.log("   - Giữ nguyên ngoại lệ khi Supabase báo lỗi đăng ký.");
  console.log(
    "   - Giữ nguyên ngoại lệ khi lưu thông tin user local thất bại.",
  );

  console.log(
    `\n${colors.yellow}${colors.bright}3. VerifyEmailOtpUseCase${colors.reset} (verify-email-otp.use-case.spec.ts)`,
  );
  console.log(
    "   - Xác thực OTP thành công: đồng bộ thông tin user, kích hoạt tài khoản, tạo & lưu refresh token.",
  );
  console.log("   - Báo lỗi chính xác khi OTP không hợp lệ hoặc đã hết hạn.");
  console.log(
    "   - Xử lý khi Supabase không trả về thông tin user sau khi xác thực.",
  );
  console.log(
    "   - Từ chối xác thực nếu tài khoản local đang bị khóa (isActive = false).",
  );

  console.log(
    `\n${colors.yellow}${colors.bright}4. GoogleIdTokenSignInUseCase${colors.reset} (google-id-token-sign-in.use-case.spec.ts)`,
  );
  console.log("   - Đăng nhập Google thành công, JIT sync tài khoản.");
  console.log("   - Xử lý lỗi khi Google token không hợp lệ.");
  console.log("   - Từ chối khi tài khoản Google không cung cấp email.");
  console.log(
    "   - Từ chối đăng nhập nếu tài khoản local tương ứng đang bị khóa.",
  );

  console.log(
    `\n${colors.yellow}${colors.bright}5. RefreshAuthSessionUseCase${colors.reset} (refresh-auth-session.use-case.spec.ts)`,
  );
  console.log(
    "   - Gia hạn token thành công: xoá token cũ trước khi tạo và lưu token mới.",
  );
  console.log("   - Từ chối nếu mã hash refresh token không tồn tại.");
  console.log("   - Từ chối nếu refresh token thuộc về người dùng khác.");
  console.log("   - Từ chối và dọn dẹp nếu refresh token đã hết hạn.");
  console.log(
    "   - Từ chối nếu tài khoản người dùng đã bị khoá hoặc không tìm thấy.",
  );

  console.log(
    `\n${colors.yellow}${colors.bright}6. AuthController & AuthService${colors.reset} (auth.controller.spec.ts & auth.service.spec.ts)`,
  );
  console.log(
    "   - Đảm bảo các hàm controller/service gọi đúng use-case tương ứng (Register, Login, Google Sign-in, Refresh, Logout).",
  );

  console.log(
    `\n${colors.yellow}${colors.bright}7. PrismaRefreshTokenRepository${colors.reset} (prisma-refresh-token.repository.spec.ts)`,
  );
  console.log("   - Tìm kiếm token bằng hash.");
  console.log("   - Xóa token cũ bằng hash hoặc id.");
  console.log("   - Xóa hàng loạt token đã hết hạn của một user.");
  console.log(
    "   - Tạo mới token và map chính xác các trường camelCase sang snake_case của DB.",
  );

  console.log(
    `\n${colors.yellow}${colors.bright}8. CreateAddressUseCase${colors.reset} (create-address.use-case.spec.ts)`,
  );
  console.log(
    "   - Tạo địa chỉ thành công và tự động gỡ bỏ cờ mặc định (unset default) của các địa chỉ cũ nếu địa chỉ mới là mặc định (isDefault = true).",
  );
  console.log(
    "   - Không gỡ bỏ cờ mặc định của các địa chỉ khác nếu địa chỉ mới không phải là mặc định.",
  );

  console.log(
    `\n${colors.yellow}${colors.bright}9. DiscoverProvidersUseCase${colors.reset} (discover-providers.use-case.spec.ts)`,
  );
  console.log("   - Báo lỗi NotFoundException nếu truyền petId không tồn tại.");
  console.log(
    "   - Báo lỗi NotFoundException nếu truyền addressId không tồn tại.",
  );
  console.log(
    "   - Tìm kiếm & xếp hạng đối tác (providers) phù hợp theo tổng điểm (score) dựa trên các tiêu chí: kinh nghiệm, khoảng cách Quận/Huyện, rating, slots trống ngày mai, trust badges.",
  );

  console.log(
    `\n${colors.yellow}${colors.bright}10. CreateServiceUseCase${colors.reset} (create-service.use-case.spec.ts)`,
  );
  console.log("   - Tạo dịch vụ mới thành công khi không trùng tên.");
  console.log("   - Ném lỗi ConflictException nếu trùng tên dịch vụ.");

  console.log(
    `\n\n${colors.cyan}${colors.bright}=== II. END-TO-END TESTS (Kiểm Thử Tích Hợp - E2E) ===${colors.reset}`,
  );

  console.log(
    `\n${colors.yellow}${colors.bright}1. Auth E2E Flow${colors.reset} (auth.e2e-spec.ts)`,
  );
  console.log(
    "   - [Đăng ký]: Kiểm tra đăng ký thành công, lọc bỏ thông tin nhạy cảm, chặn trùng email, chặn vai trò ADMIN.",
  );
  console.log(
    "   - [Đăng nhập]: Chặn mật khẩu sai, trả về JWT Access Token & Refresh Cookie HttpOnly.",
  );
  console.log(
    "   - [Phiên đa thiết bị]: Cho phép duy trì nhiều phiên đăng nhập song song trên các thiết bị khác nhau.",
  );
  console.log(
    "   - [Chặn tài khoản khóa]: Khóa tài khoản (isActive=false) sẽ chặn đăng nhập ngay lập tức.",
  );
  console.log(
    "   - [Bảo vệ API]: Bảo vệ các endpoint khỏi token giả mạo, phân quyền chính xác giữa CUSTOMER, PROVIDER và ADMIN.",
  );
  console.log(
    "   - [Làm mới Token]: Xoay vòng Refresh Token (Token Rotation) và ngăn chặn dùng lại token cũ (Replay Attack).",
  );
  console.log(
    "   - [Đăng xuất]: Thu hồi (invalidate) đúng refresh token của thiết bị hiện tại mà không ảnh hưởng thiết bị khác.",
  );

  console.log(
    `\n${colors.yellow}${colors.bright}2. Booking & Concurrency Flow${colors.reset} (booking.e2e-spec.ts)`,
  );
  console.log(
    "   - [Tìm kiếm đối tác]: Tìm kiếm dịch vụ phù hợp cho thú cưng tại địa bàn hoạt động của Provider.",
  );
  console.log(
    "   - [Đặt lịch]: Tạo yêu cầu đặt lịch và chuyển trạng thái slot làm việc sang tạm khóa (RESERVED_FOR_PROVIDER_RESPONSE).",
  );
  console.log(
    "   - [Chống đặt trùng - Concurrency Lock]: Gửi đồng thời 5 request đặt lịch cùng 1 slot. Hệ thống phải đảm bảo CHỈ CÓ 1 request thành công, 4 request còn lại báo lỗi 409 Conflict.",
  );
  console.log(
    "   - [Chấp nhận đặt lịch]: Provider chấp nhận đặt lịch, chuyển trạng thái slot thành BOOKED.",
  );
  console.log(
    "   - [Từ chối đặt lịch]: Provider từ chối đặt lịch, giải phóng slot về trạng thái AVAILABLE.",
  );
  console.log("");
}

// Main interactive menu loop
async function mainMenu() {
  const testEnv = loadEnv(".env.test");
  const devEnv = loadEnv(".env");

  while (true) {
    printHeader("Công cụ quản lý & chạy kiểm thử PetCare");

    console.log(
      ` 1. ${colors.green}Chạy toàn bộ Unit Tests${colors.reset} (npm run test)`,
    );
    console.log(
      ` 2. ${colors.green}Chạy Unit Tests ở chế độ theo dõi${colors.reset} (npm run test:watch)`,
    );
    console.log(
      ` 3. ${colors.green}Chạy Unit Tests và xuất báo cáo coverage${colors.reset} (npm run test:cov)`,
    );
    console.log(
      ` 4. ${colors.yellow}Chạy toàn bộ E2E Tests (Tự động migrate DB test)${colors.reset} (npm run test:db)`,
    );
    console.log(` 5. ${colors.yellow}Chạy một file test cụ thể${colors.reset}`);
    console.log(
      ` 6. ${colors.blue}Reset Database kiểm thử (test DB)${colors.reset}`,
    );
    console.log(
      ` 7. ${colors.cyan}Xem danh sách kịch bản test chi tiết (Scenarios)${colors.reset}`,
    );
    console.log(` 0. ${colors.red}Thoát${colors.reset}`);
    console.log("");

    const choice = await rl.question(
      `${colors.bright}Vui lòng chọn chức năng (0-7): ${colors.reset}`,
    );

    switch (choice.trim()) {
      case "1":
        await executeCommand("npx", ["jest"]);
        break;
      case "2":
        await executeCommand("npx", ["jest", "--watch"]);
        break;
      case "3":
        await executeCommand("npx", ["jest", "--coverage"]);
        break;
      case "4":
        {
          console.log(
            `\n${colors.yellow}Đang khởi tạo database kiểm thử...${colors.reset}`,
          );
          const resetSuccess = await executeCommand(
            "npx",
            ["prisma", "migrate", "deploy"],
            {
              ...testEnv,
              NODE_ENV: "test",
            },
          );
          if (resetSuccess) {
            console.log(
              `\n${colors.yellow}Đang chạy các E2E tests tuần tự...${colors.reset}`,
            );
            await executeCommand(
              "npx",
              ["jest", "--config", "./test/jest-e2e.json", "--runInBand"],
              {
                ...testEnv,
                NODE_ENV: "test",
              },
            );
          }
        }
        break;
      case "5":
        await selectAndRunSpecificTest(testEnv);
        break;
      case "6":
        {
          const confirm = await rl.question(
            `\n${colors.red}${colors.bright}CẢNH BÁO: Hành động này sẽ XÓA SẠCH database kiểm thử (pet_care_test). Bạn có muốn tiếp tục? (y/n): ${colors.reset}`,
          );
          if (confirm.trim().toLowerCase() === "y") {
            console.log(
              `\n${colors.yellow}Đang dọn dẹp và reset database kiểm thử...${colors.reset}`,
            );
            await executeCommand(
              "npx",
              ["prisma", "migrate", "reset", "--force"],
              {
                ...testEnv,
                NODE_ENV: "test",
              },
            );
          }
        }
        break;
      case "7":
        printScenarios();
        await rl.question(
          `\n${colors.cyan}Nhấn Enter để quay lại menu chính...${colors.reset}`,
        );
        break;
      case "0":
        console.log(
          `\n${colors.green}Cảm ơn bạn đã sử dụng. Hẹn gặp lại!${colors.reset}\n`,
        );
        rl.close();
        process.exit(0);
      default:
        console.log(
          `\n${colors.red}Lựa chọn không hợp lệ. Vui lòng thử lại!${colors.reset}\n`,
        );
    }
  }
}

// Allows choosing a specific spec or e2e test file to run
async function selectAndRunSpecificTest(testEnv) {
  printHeader("Chạy một file test cụ thể");

  console.log(
    `${colors.cyan}Đang quét các file test trong dự án...${colors.reset}`,
  );
  const unitTests = getTestFiles(path.join(BACKEND_DIR, "src"), false);
  const e2eTests = getTestFiles(path.join(BACKEND_DIR, "test"), true);
  const allTests = [...unitTests, ...e2eTests];

  if (allTests.length === 0) {
    console.log(`${colors.red}Không tìm thấy file test nào!${colors.reset}\n`);
    return;
  }

  allTests.forEach((file, index) => {
    const isE2E = file.startsWith("test\\") || file.startsWith("test/");
    const typeLabel = isE2E
      ? `${colors.yellow}[E2E]${colors.reset}`
      : `${colors.green}[Unit]${colors.reset}`;
    console.log(
      `  ${(index + 1).toString().padStart(2, " ")}. ${typeLabel} ${file}`,
    );
  });
  console.log(`   0. Quay lại menu chính`);
  console.log("");

  const fileChoiceStr = await rl.question(
    `${colors.bright}Chọn số thứ tự file test để chạy (1-${allTests.length}): ${colors.reset}`,
  );
  const fileChoice = parseInt(fileChoiceStr.trim(), 10);

  if (isNaN(fileChoice) || fileChoice < 1 || fileChoice > allTests.length) {
    return; // Go back
  }

  const selectedFile = allTests[fileChoice - 1];
  const isE2E =
    selectedFile.startsWith("test\\") || selectedFile.startsWith("test/");

  if (isE2E) {
    console.log(
      `\n${colors.yellow}Đang chạy test E2E: ${selectedFile}${colors.reset}`,
    );
    await executeCommand(
      "npx",
      ["jest", "--config", "./test/jest-e2e.json", selectedFile, "--runInBand"],
      {
        ...testEnv,
        NODE_ENV: "test",
      },
    );
  } else {
    console.log(
      `\n${colors.green}Đang chạy test Unit: ${selectedFile}${colors.reset}`,
    );
    await executeCommand("npx", ["jest", selectedFile]);
  }

  await rl.question(
    `\n${colors.cyan}Nhấn Enter để quay lại menu chính...${colors.reset}`,
  );
}

mainMenu().catch((err) => {
  console.error("Lỗi nghiêm trọng trong CLI:", err);
  process.exit(1);
});
