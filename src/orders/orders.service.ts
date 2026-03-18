import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(orderData: any): Promise<Order> {
    const createdOrder = new this.orderModel(orderData);
    return createdOrder.save();
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Order | null> {
    return this.orderModel.findById(id).exec();
  }

  async updateStatus(id: string, status: string): Promise<Order | null> {
    return this.orderModel.findByIdAndUpdate(id, { status }, { returnDocument: 'after' }).exec();
  }

  async markAsRead(id: string): Promise<Order | null> {
    return this.orderModel.findByIdAndUpdate(id, { isAdminRead: true }, { returnDocument: 'after' }).exec();
  }

  async update(id: string, updateData: Partial<Order>): Promise<Order | null> {
    return this.orderModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }
}
