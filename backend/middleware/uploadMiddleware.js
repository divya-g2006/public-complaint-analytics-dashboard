import path from "path";
import multer from "multer";

function ensureSafeFilename(filename) {
  const base = path.basename(filename);
  return base.replace(/[^a-zA-Z0-9._-]/g, "_");
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = ensureSafeFilename(path.basename(file.originalname, ext));
    cb(null, `${Date.now()}_${safeName}${ext}`);
  }
});

function fileFilter(_req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    cb(new Error("Only .jpg, .png, .webp images are allowed."));
    return;
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});

