import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum PromoType {
  CLASSIC = 'CLASSIC',                 // Standard cart-wide discount
  PRODUCT_SPECIFIC = 'PRODUCT_SPECIFIC', // Discount only on specific items
  BUNDLE = 'BUNDLE',                   // Buy X Get Y Free (or discounted)
}

@Schema({ timestamps: true })
export class PromoCode {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ default: false })
  isAutomatic: boolean;

  @Prop({ required: true, enum: PromoType, default: PromoType.CLASSIC })
  type: PromoType;

  @Prop({ required: true, enum: DiscountType, default: DiscountType.PERCENTAGE })
  discountType: DiscountType;

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  expiryDate: Date;

  @Prop({ default: 0 })
  minOrderAmount: number;

  @Prop({ type: [String], default: [] })
  applicableProducts: string[];

  @Prop({ default: 0 })
  buyQty: number;

  @Prop({ default: 0 })
  getQty: number;

  @Prop({ default: 0 })
  usageLimit: number;

  @Prop({ default: 0 })
  usageCount: number;
}

export type PromoCodeDocument = PromoCode & Document;
export const PromoCodeSchema = SchemaFactory.createForClass(PromoCode);
