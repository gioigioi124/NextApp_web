import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

// __dirname = ...apps/api/src/modules/upload (dev) or ...apps/api/dist/modules/upload (prod)
// Go up 3 levels from src/modules/upload → apps/api, then into uploads
const API_ROOT = join(__dirname, '..', '..', '..');
const UPLOADS_PATH = join(API_ROOT, 'uploads');

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_PATH,
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return cb(new BadRequestException('Chỉ cho phép tải lên tệp ảnh!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn tệp để tải lên!');
    }
    const url = `http://localhost:8000/api/v1/upload/files/${file.filename}`;
    return { url, filename: file.filename };
  }

  @Get('files/:filename')
  serveFile(@Param('filename') filename: string, @Res() res: any) {
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    const filePath = join(UPLOADS_PATH, safeFilename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File không tồn tại');
    }
    return res.sendFile(filePath);
  }
}
