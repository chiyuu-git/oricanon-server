import { ObjectSchema } from '@hapi/joi';
import {
	ArgumentMetadata,
	BadRequestException,
	Injectable,
	PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
	constructor(private schema: ObjectSchema) {}

	transform(value: any, metadata: ArgumentMetadata) {
		const { error } = this.schema.validate(value);
		if (error) {
			throw new BadRequestException('Validation failed');
		}
		return value;
	}
}

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
	async transform(value: any, { metatype: metaType }: ArgumentMetadata) {
		if (!metaType || !this.toValidate(metaType)) {
			return value;
		}
		const object = plainToClass(metaType, value);
		const errors = await validate(object);
		if (errors.length > 0) {
			throw new BadRequestException('Validation failed');
		}
		return value;
	}

	private toValidate(metatype: Function): boolean {
		const types: Function[] = [String, Boolean, Number, Array, Object];
		return !types.includes(metatype);
	}
}
