import multer from "multer";
import path from "node:path";
import { Request } from "express";
import { AppError } from "./errorHandler";

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Only JPEG, JPG and PNG images are allowed", 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

export const formatImage = (file: Express.Multer.File): string => {
  const ext = path.extname(file.originalname);
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};
