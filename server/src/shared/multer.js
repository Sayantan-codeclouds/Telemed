import multer from "multer";
import path from "path";
import fs from "fs";
import { IMAGE_MIME_EXTENSIONS } from "./uploadTypes.js";

const uploadPath = path.join(
  process.cwd(),
  "src",
  "uploads",
  "profile-images"
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

    const ext = IMAGE_MIME_EXTENSIONS[file.mimetype];

    // Support Patient, Doctor and future Admin

    const userId =
      req.patient?._id ||
      req.doctor?._id ||
      req.admin?._id;

    if (!userId) {
      return cb(
        new Error("Unauthorized upload."),
        null
      );
    }

    cb(
      null,
      `${userId}-${Date.now()}${ext}`
    );

  },

});

const fileFilter = (req, file, cb) => {

  if (IMAGE_MIME_EXTENSIONS[file.mimetype]) {

    cb(null, true);

  } else {

    cb(
      new Error("Only image files (JPG, PNG, WEBP, GIF, BMP, AVIF, HEIC) are allowed."),
      false
    );

  }

};

export default multer({

  storage,

  fileFilter,

  limits: {

    fileSize: 5 * 1024 * 1024,

  },

});