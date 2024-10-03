// import modules
import multer, { diskStorage } from "multer";
import { AppError } from "./appError.js";
export const fileValidation = {
    file: ['application/pdf', 'application/msword']
}

export const cloudUpload = ({ allowFile = fileValidation.file } = {}) => {
    const storage = diskStorage({})
    const fileFilter = (req, file, cb) => {
        if (allowFile.includes(file.mimetype)) {
            return cb(null, true)
        }
        return cb(new AppError('invalid file format', 400), false)
    }
    return multer({ storage, fileFilter })

}