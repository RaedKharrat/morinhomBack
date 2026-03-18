import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PromoCode, PromoCodeDocument, DiscountType } from './schemas/promo-code.schema';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectModel(PromoCode.name) private promoCodeModel: Model<PromoCodeDocument>,
  ) {}

  async create(createPromoCodeDto: CreatePromoCodeDto): Promise<PromoCode> {
    const promoCode = new this.promoCodeModel(createPromoCodeDto);
    return promoCode.save();
  }

  async findAll(): Promise<PromoCode[]> {
    return this.promoCodeModel.find().sort({ createdAt: -1 }).exec();
  }

  async validateCode(code: string, currentTotal: number): Promise<{ discount: number, discountValue: number, discountType: string }> {
    const promoCode = await this.promoCodeModel.findOne({ 
      code: code.toUpperCase(), 
      isActive: true 
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found or inactive');
    }

    // Check expiry
    if (promoCode.expiryDate && new Date() > promoCode.expiryDate) {
      throw new BadRequestException('Promo code has expired');
    }

    // Check usage limit
    if (promoCode.usageLimit > 0 && promoCode.usageCount >= promoCode.usageLimit) {
      throw new BadRequestException('Promo code usage limit reached');
    }

    // Check min order amount
    if (currentTotal < promoCode.minOrderAmount) {
      throw new BadRequestException(`Minimum order of ${promoCode.minOrderAmount} required for this code`);
    }

    let discount = 0;
    if (promoCode.discountType === DiscountType.PERCENTAGE) {
      discount = (currentTotal * promoCode.discountValue) / 100;
    } else {
      discount = Math.min(promoCode.discountValue, currentTotal);
    }

    return { 
      discount, 
      discountValue: promoCode.discountValue,
      discountType: promoCode.discountType 
    };
  }

  async incrementUsage(code: string) {
    return this.promoCodeModel.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usageCount: 1 } }
    ).exec();
  }

  async delete(id: string) {
    return this.promoCodeModel.findByIdAndDelete(id).exec();
  }
}
