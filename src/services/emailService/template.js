// emailerServices/template.js
const otpTemplate = (otp, appName, type) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
    <h2>${appName} - ${type}</h2>
    <p>Here is your OTP:</p>
    <h1 style="color: #2c3e50;">${otp}</h1>
    <p>This OTP will expire in 5 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  </div>
`;

const resetPassword = (url, appName) => `
  <h2>Reset your ${appName} password</h2>
  <p>Click below to reset your password:</p>
  <a href="${url}" target="_blank">${url}</a>
`;

const verifyEmail = (url, appName) => `
  <h2>Verify your ${appName} email</h2>
  <p>Click below to verify your account:</p>
  <a href="${url}" target="_blank">${url}</a>
`;

export default {
  otpTemplate,
  resetPassword,
  verifyEmail,
};
