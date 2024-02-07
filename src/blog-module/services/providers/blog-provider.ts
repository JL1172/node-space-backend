import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import sanitize = require('sanitize-filename');
import { PNG } from 'pngjs';
import * as jpeg from 'jpeg-js';
@Injectable()
export class SanitizeFileNameProvider {
  private filesList: Array<Express.Multer.File> = [];
  private readonly sanitize = sanitize;
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
  private isPngValid: PNG = new PNG({ filterType: 4 });
  private isJpegJpgValid: typeof jpeg = jpeg;
  async scanImage(img: Express.Multer.File) {
    try {
      const buffer = img.buffer.subarray(0, 8).toString('hex').toUpperCase();
      if (this.magic_png_no === buffer) {
        await new Promise((resolve, reject) => {
          this.isPngValid.parse(img.buffer, (error, data) => {
            if (error) {
              reject(
                `Invalid File Type, Must Be PNG, JPG, JPEG, Error: ${error}`,
              );
            } else {
              resolve(data);
            }
          });
        });
        this.result = true;
        return this.result;
      } else {
        if (buffer.slice(0, 8) === this.magic_jpeg_jpg_no) {
          const imgDataValidity = this.isJpegJpgValid.decode(img.buffer, {
            useTArray: true,
          });
          if (!imgDataValidity) {
            throw new HttpException(
              `Invalid File Type, Must Be PNG, JPG, JPEG, file name: ${img.originalname}`,
              HttpStatus.UNPROCESSABLE_ENTITY,
            );
          } else {
            this.result = true;
            return this.result;
          }
        } else {
          this.result = false;
          throw new HttpException(
            `Invalid File Type, Must Be PNG, JPG, JPEG, file name: ${img.originalname}`,
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }
    } catch (err) {
      throw new HttpException(err, HttpStatus.UNPROCESSABLE_ENTITY);
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

/*
Stream {
  _events: [Object: null prototype] {},
  _eventsCount: 0,
  _maxListeners: undefined,
  width: 0,
  height: 0,
  data: null,
  gamma: 0,
  writable: true,
  readable: true,
  _parser: Stream {
    _events: [Object: null prototype] {
      error: [Function: bound emit],
      close: [Array],
      metadata: [Function: bound ],
      gamma: [Function: bound ],
      parsed: [Function: bound ]
    },
    _eventsCount: 5,
    _maxListeners: undefined,
    _buffers: null,
    _buffered: 4,
    _reads: null,
    _paused: false,
    _encoding: 'utf8',
    writable: false,
    _parser: {
      _options: [Object],
      _hasIHDR: false,
      _hasIEND: false,
      _emittedHeadersFinished: false,
      _palette: [],
      _colorType: 0,
      _chunks: [Object],
      read: [Function: bound ],
      error: [Function: bound ],
      metadata: [Function: bound ],
      gamma: [Function: bound emit],
      transColor: [Function: bound ],
      palette: [Function: bound ],
      parsed: undefined,
      inflateData: [Function: bound ],
      finished: [Function: bound ],
      simpleTransparency: [Function: bound ],
      headersFinished: [Function: bound ]
    },
    _options: {
      filterType: 4,
      checkCRC: true,
      deflateChunkSize: 32768,
      deflateLevel: 9,
      deflateStrategy: 3,
      inputHasAlpha: true,
      deflateFactory: [Function: value],
      bitDepth: 8,
      colorType: 6,
      inputColorType: 6
    },
    [Symbol(shapeMode)]: false,
    [Symbol(kCapture)]: false
  },
  _packer: Stream {
    _events: [Object: null prototype] {
      data: [Function: bound emit],
      end: [Function: bound emit],
      error: [Function: bound emit]
    },
    _eventsCount: 3,
    _maxListeners: undefined,
    _packer: { _options: [Object] },
    _deflate: Deflate {
      _writeState: [Uint32Array],
      _events: [Object],
      _readableState: [ReadableState],
      _writableState: [WritableState],
      allowHalfOpen: true,
      _maxListeners: undefined,
      _eventsCount: 1,
      bytesWritten: 0,
      _handle: [Zlib],
      _outBuffer: <Buffer b0 43 09 03 00 00 00 00 03 00 00 00 00 00 00 00 20 4a 68 dd fd 7f 00 00 60 56 77 dd fd 7f 00 00 28 27 ae 07 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ... 32718 more bytes>,
      _outOffset: 0,
      _chunkSize: 32768,
      _defaultFlushFlag: 0,
      _finishFlushFlag: 4,
      _defaultFullFlushFlag: 3,
      _info: undefined,
      _maxOutputLength: 4294967296,
      _level: 9,
      _strategy: 3,
      [Symbol(shapeMode)]: true,
      [Symbol(kCapture)]: false,
      [Symbol(kCallback)]: null,
      [Symbol(kError)]: null
    },
    readable: true,
    [Symbol(shapeMode)]: false,
    [Symbol(kCapture)]: false
  },
  [Symbol(shapeMode)]: false,
  [Symbol(kCapture)]: false
}

*/
