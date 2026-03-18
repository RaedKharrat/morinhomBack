import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(query?: {
    search?: string;
    category?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ products: ProductDocument[]; total: number }> {
    const filter: any = {};
    const page = query?.page || 1;
    const limit = query?.limit || 12;

    if (query?.search) {
      filter.$text = { $search: query.search };
    }

    if (query?.category) {
      filter.category = query.category;
    }

    if (query?.featured !== undefined) {
      filter.featured = query.featured;
    }

    if (query?.minPrice !== undefined || query?.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
      if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
    }

    const sort: any = {};
    if (query?.sortBy) {
      sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    const total = await this.productModel.countDocuments(filter).exec();
    const products = await this.productModel
      .find(filter)
      .populate('category')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { products, total };
  }

  async findById(id: string): Promise<ProductDocument> {
    const product = await this.productModel
      .findById(id)
      .populate('category')
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const data = { ...createProductDto };
    if (data.category === '') {
      delete data.category;
    }
    const product = new this.productModel(data);
    return (await product.save()).populate('category');
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDocument> {
    const data = { ...updateProductDto };
    if (data.category === '') {
      delete data.category;
    }
    const product = await this.productModel
      .findByIdAndUpdate(id, data, { returnDocument: 'after' })
      .populate('category')
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async delete(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }
}
