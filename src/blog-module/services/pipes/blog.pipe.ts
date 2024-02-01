import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class BlogPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {//eslint-disable-line
    return value;
  }
}
