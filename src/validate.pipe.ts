import {
    ArgumentMetadata,
    BadRequestException,
    Injectable,
    PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class MyValidationPipe implements PipeTransform<any> {
    async transform(value: any, { metatype: metaType }: ArgumentMetadata) {
        if (!metaType || !this.toValidate(metaType)) {
            return value;
        }
        const object = plainToClass(metaType, value);
        const errors = await validate(object);
        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }
        return value;
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    private toValidate(metatype: Function): boolean {
        // eslint-disable-next-line @typescript-eslint/ban-types
        const types: Function[] = [String, Boolean, Number, Array, Date, Object];
        return !types.includes(metatype);
    }
}
