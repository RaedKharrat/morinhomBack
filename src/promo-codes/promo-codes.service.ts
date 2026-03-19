import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PromoCode, PromoCodeDocument, DiscountType, PromoType } from './schemas/promo-code.schema';
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

  async validateCode(code: string, cart: any[]): Promise<{ 
    discount: number, 
    discountValue: number, 
    discountType: string,
    type: string 
  }> {
    const promoCode = await this.promoCodeModel.findOne({ 
      code: code.toUpperCase(), 
      isActive: true 
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found or inactive');
    }

    const currentTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

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

    // ── CLASSIC: Cart-wide Discount ──
    if (promoCode.type === PromoType.CLASSIC || !promoCode.type) {
      if (promoCode.discountType === DiscountType.PERCENTAGE) {
        discount = (currentTotal * promoCode.discountValue) / 100;
      } else {
        discount = Math.min(promoCode.discountValue, currentTotal);
      }
    } 
    // ── PRODUCT_SPECIFIC: Only on targeted items ──
    else if (promoCode.type === PromoType.PRODUCT_SPECIFIC) {
      const discountedTotal = cart
        .filter(item => promoCode.applicableProducts.includes(item.productId))
        .reduce((acc, item) => acc + (item.price * item.quantity), 0);

      if (discountedTotal === 0) {
        throw new BadRequestException('This code is not applicable to any items in your cart');
      }

      if (promoCode.discountType === DiscountType.PERCENTAGE) {
        discount = (discountedTotal * promoCode.discountValue) / 100;
      } else {
        discount = Math.min(promoCode.discountValue, discountedTotal);
      }
    }
    // ── BUNDLE: Buy X Get Y Free ──
    else if (promoCode.type === PromoType.BUNDLE) {
      const eligibleItems = cart.filter(item => 
        promoCode.applicableProducts.length === 0 || 
        promoCode.applicableProducts.includes(item.productId)
      );

      if (eligibleItems.length === 0) {
        throw new BadRequestException('Your cart does not contain eligible items for this bundle offer');
      }

      // Calculate total eligible quantity
      const totalQty = eligibleItems.reduce((acc, item) => acc + item.quantity, 0);
      const denominator = promoCode.buyQty + promoCode.getQty;

      if (totalQty < denominator) {
        throw new BadRequestException(`Add at least ${denominator} eligible items to activate this offer`);
      }

      // We give the 'getQty' items for free.
      // Usually, we give the cheapest items for free in a mix-and-match bundle.
      // Sort items by price ascending to find the "free" ones.
      const individualPrices = eligibleItems.flatMap(item => Array(item.quantity).fill(item.price)).sort((a, b) => a - b);
      
      const freeItemsCount = Math.floor(totalQty / denominator) * promoCode.getQty;
      discount = individualPrices.slice(0, freeItemsCount).reduce((acc, p) => acc + p, 0);
    }

    return { 
      discount, 
      discountValue: promoCode.discountValue,
      discountType: promoCode.discountType,
      type: promoCode.type || PromoType.CLASSIC
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
