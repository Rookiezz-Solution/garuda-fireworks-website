export const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const minutes = Number(process.env.OTP_EXPIRY_MINUTES ?? 10);
  const expiry = new Date(Date.now() + minutes * 60 * 1000);
  return { otp, expiry };
};
