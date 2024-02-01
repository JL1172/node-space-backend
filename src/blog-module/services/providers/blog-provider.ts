import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import sanitize = require('sanitize-filename');

@Injectable()
export class SanitizeFileNameProvider {
  private filesList: Array<Express.Multer.File> = [];
  private readonly sanitize = sanitize;
  constructor() {
    this.filesList = [];
    this.sanitize = sanitize;
  }
  sanitizeNames(files: Array<Express.Multer.File>) {
    this.filesList = files.map((file) => {
      const sanitizedFileName = this.sanitize(file.originalname);
      return { ...file, originalname: sanitizedFileName };
    });
    return this.filesList;
  }
}

@Injectable()
export class ScanImageForMagicNumberProvider {
  private readonly magic_png_no: string = '89504E470D0A1A0A';
  private readonly magic_jpeg_jpg_no: string = 'FFD8FFE0';
  private result: boolean = false;
  scanImage(img: Express.Multer.File) {
    const buffer = img.buffer.subarray(0, 8).toString('hex').toUpperCase();
    if (this.magic_png_no === buffer) {
      this.result = true;
      return this.result;
    } else {
      if (buffer.slice(0, 8) === this.magic_jpeg_jpg_no) {
        this.result = true;
        return this.result;
      } else {
        this.result = false;
        throw new HttpException(
          `Invalid File Type, Must Be PNG, JPG, JPEG, file name: ${img.originalname}`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }
  }
}

@Injectable()
export class ReqStorageProvider {
  private reqStorage: Request;
  storeReq(req: Request) {
    this.reqStorage = req;
  }
  readReq() {
    return this.reqStorage;
  }
}
