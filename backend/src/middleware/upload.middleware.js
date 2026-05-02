import multer from "multer";

const fileFilter = (req, file, cb) => {
  if (/jpeg|jpg|png|webp/.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only images allowed"), false);
};

export default multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

