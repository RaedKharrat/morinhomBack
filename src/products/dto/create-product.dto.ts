import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  oldPrice?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  inStock?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  featured?: boolean;
}
