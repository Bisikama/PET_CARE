interface EmailVerificationTemplateOptions {
  appName: string;
  otp: string;
  ttlMinutes: number;
  backgroundCid: string;
}

export function buildEmailVerificationTemplate({
  appName,
  otp,
  ttlMinutes,
  backgroundCid,
}: EmailVerificationTemplateOptions) {
  return `
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>[PET_CARE] - XÁC THỰC MÃ OTP</title>
  </head>
  <body style="margin:0; padding:0; background:#eef4f7; font-family:Arial, Helvetica, sans-serif; color:#173447;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef4f7;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 8px 24px rgba(20,53,72,.12);">
            <tr>
              <td
                background="cid:${backgroundCid}"
                valign="middle"
                style="height:277px; padding:32px; background-color:#153f56; background-image:url('cid:${backgroundCid}'); background-position:center; background-size:cover;"
              >
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding:24px; background:rgba(8,35,50,.82); border-radius:8px; text-align:center;">
                      <div style="font-size:14px; line-height:20px; color:#9eddf2; text-transform:uppercase; font-weight:700;">${appName}</div>
                      <h1 style="margin:8px 0 12px; font-size:30px; line-height:38px; color:#ffffff; font-weight:700;">Xác thực mã OTP</h1>
                      <p style="margin:0 0 18px; font-size:15px; line-height:23px; color:#e9f5f8;">Dùng mã dưới đây để hoàn tất xác thực email của bạn.</p>
                      <div style="display:inline-block; min-width:220px; padding:14px 20px; border-radius:8px; background:#ffc857; color:#173447; font-size:34px; line-height:42px; font-weight:800; letter-spacing:8px;">${otp}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 36px 12px;">
                <p style="margin:0 0 14px; font-size:16px; line-height:25px;">Xin chào,</p>
                <p style="margin:0 0 14px; font-size:16px; line-height:25px;">Mã OTP có hiệu lực trong <strong>${ttlMinutes} phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                <p style="margin:0; font-size:14px; line-height:22px; color:#637985;">Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email. Tài khoản của bạn vẫn được an toàn.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 36px 28px;">
                <div style="height:1px; background:#dce8ed;"></div>
                <p style="margin:18px 0 0; font-size:13px; line-height:20px; color:#78909b; text-align:center;">Email tự động từ ${appName}. Vui lòng không trả lời email này.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
