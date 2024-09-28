// import module
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import multer, { diskStorage } from "multer";

export const fileValidation = {
  image: ["image/jpeg", "image/png", "image/gif"], // تم تعديل "image/jpg" إلى "image/jpeg"
  file: ["application/pdf", "application/msword"],
  video: ["video/mp4"],
};

export const fileUpload = ({ folder, allowFile = fileValidation.image }) => {
  const storage = diskStorage({
    destination: (req, file, cb) => {
      const fullpath = path.resolve(`uploads/${folder}`);
      if (!fs.existsSync(fullpath)) {
        fs.mkdirSync(fullpath, { recursive: true });
      }
      cb(null, fullpath); // استخدم المسار الكامل هنا
    },
    filename: (req, file, cb) => {
      cb(null, nanoid() + "-" + file.originalname); // استخدم file.originalname
    },
  });

  const fileFilter = (req, file, cb) => {
    console.log("File mimetype:", file.mimetype); // أضف log للتحقق من نوع الملف
    if (allowFile.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("invalid file format"), false);
  };

  return multer({ storage, fileFilter });
};
