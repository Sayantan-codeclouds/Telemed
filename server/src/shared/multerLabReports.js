import multer from "multer";
import path from "path";
import fs from "fs";
import { LAB_REPORT_MIME_EXTENSIONS } from "./uploadTypes.js";

const uploadPath = path.join(
  process.cwd(),
  "src",
  "uploads",
  "lab-reports"
);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },

  filename(req, file, cb) {
    const ext = LAB_REPORT_MIME_EXTENSIONS[file.mimetype];
    const userId = req.patient?._id || req.doctor?._id || "user";
    const sanitizedName = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 30);
    cb(null, `${userId}-${Date.now()}-${sanitizedName}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (LAB_REPORT_MIME_EXTENSIONS[file.mimetype]) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF and image files (PNG, JPG, WEBP) are allowed for lab reports."),
      false
    );
  }
};

export default multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
});
