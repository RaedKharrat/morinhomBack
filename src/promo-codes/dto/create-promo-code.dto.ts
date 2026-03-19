import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, IsOptional, IsBoolean, IsDateString, IsArray } from 'class-validator';
import { DiscountType, PromoType } from '../schemas/promo-code.schema';

export class CreatePromoCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(PromoType)
  @IsOptional()
  type?: PromoType = PromoType.CLASSIC;

  @IsEnum(DiscountType)
  @IsNotEmpty()
  discountType: DiscountType;

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number = 0;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableProducts?: string[] = [];

  @IsOptional()
  @IsNumber()
  @Min(0)
  buyQty?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  getQty?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  usageLimit?: number = 0;
}
