export const errorMiddleware = (err, req, res, next) => {
  const statusCode = Number(err?.statusCode) || 500;
  const message = err?.message || "Internal Server Error";
  return res.status(statusCode).json({ success: false, message });
};
