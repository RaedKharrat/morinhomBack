import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
    await this.seedCategories();
    await this.seedProducts();
  }

  private async seedAdmin() {
    const existingAdmin = await this.userModel.findOne({ email: 'admin@morinhom.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.userModel.create({
        email: 'admin@morinhom.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
      });
      this.logger.log('✅ Admin user seeded: admin@morinhom.com / admin123');
    }
  }

  private async seedCategories() {
    const count = await this.categoryModel.countDocuments();
    if (count === 0) {
      const categories = [
        { name: 'Luxury Watches', description: 'Timeless horological masterpieces' },
        { name: 'Engagement Rings', description: 'Exquisite rings for eternal promises' },
        { name: 'Golden Necklaces', description: 'Handcrafted 18K and 24K gold elegance' },
        { name: 'Artisan Bracelets', description: 'Traditional and modern wrist adornments' },
        { name: 'Heritage Earrings', description: 'Capturing Tunisian jewelry traditions' },
        { name: 'Diamond Collections', description: 'Rare gems and brilliant diamond settings' },
      ];
      await this.categoryModel.insertMany(categories);
      this.logger.log('✅ Jewelry Categories seeded');
    }
  }

  private async seedProducts() {
    const count = await this.productModel.countDocuments();
    if (count === 0) {
      const categories = await this.categoryModel.find();
      const getCategoryId = (name: string) =>
        categories.find((c) => c.name === name)?._id;

      const products = [
        {
          name: 'Royal Sapphire Chronograph',
          description:
            'A masterpiece of Tunisian horology, featuring a sapphire crystal face, Swiss-made movement, and a genuine leather strap. Water-resistant up to 100m.',
          shortDescription: 'Premium sapphire crystal chronograph',
          price: 1850.00,
          category: getCategoryId('Luxury Watches'),
          images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80'],
          featured: true,
          inStock: true,
        },
        {
          name: 'Eternal Diamond Solitaire',
          description:
            'A breathtaking 1.5 carat GIA-certified diamond set in a polished 18K white gold band. The ultimate expression of love and commitment.',
          shortDescription: '1.5k GIA Diamond, 18K White Gold',
          price: 4200.00,
          category: getCategoryId('Engagement Rings'),
          images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80'],
          featured: true,
          inStock: true,
        },
        {
          name: 'Carthage Heritage Necklace',
          description:
            'Inspired by ancient Carthaginian designs, this 24K solid gold necklace features intricate filigree work by master Tunisian artisans.',
          shortDescription: '24K Solid Gold Artisan Necklace',
          price: 2900.00,
          category: getCategoryId('Golden Necklaces'),
          images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'],
          featured: true,
          inStock: true,
        },
        {
          name: 'Emerald Grace Earrings',
          description:
            'Elegant drop earrings featuring vibrant Colombian emeralds surrounded by a halo of micro-pave diamonds in rose gold.',
          shortDescription: 'Colombian Emerald & Diamond Drops',
          price: 1450.00,
          category: getCategoryId('Heritage Earrings'),
          images: ['https://images.unsplash.com/photo-1535633302703-b0703af2939a?w=800&q=80'],
          featured: false,
          inStock: true,
        },
        {
          name: 'Obsidian Midnight Watch',
          description:
            'Sleek all-black minimalist design with a ceramic bezel and automatic movement. A bold statement of modern luxury.',
          shortDescription: 'Modern Ceramic Automatic Watch',
          price: 1200.00,
          category: getCategoryId('Luxury Watches'),
          images: ['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80'],
          featured: false,
          inStock: true,
        },
        {
          name: 'Infinity Pearl Bracelet',
          description:
            'Carefully selected South Sea pearls woven into an infinity-link 18K yellow gold chain. Timeless sophistication.',
          shortDescription: 'South Sea Pearls, 18K Gold',
          price: 850.00,
          category: getCategoryId('Artisan Bracelets'),
          images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'],
          featured: true,
          inStock: true,
        },
        {
          name: 'Rose Quartz Eternity Ring',
          description:
            'A delicate band of pave diamonds highlighting a stunning central rose quartz stone. Handcrafted for maximum brilliance.',
          shortDescription: 'Rose Quartz & Diamond Pave',
          price: 680.00,
          category: getCategoryId('Engagement Rings'),
          images: ['https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=800&q=80'],
          featured: false,
          inStock: true,
        },
        {
          name: 'Amethyst Sovereign Pendant',
          description:
            'A deep purple amethyst set in a regal gold frame. This pendant represents wisdom and power, inspired by royal heritage.',
          shortDescription: 'Amethyst & 21K Gold Pendant',
          price: 520.00,
          category: getCategoryId('Golden Necklaces'),
          images: ['https://images.unsplash.com/photo-1599643477877-530eb83ba8e8?w=800&q=80'],
          featured: false,
          inStock: true,
        },
      ];

      await this.productModel.insertMany(products);
      this.logger.log('✅ Jewelry Products seeded');
    }
  }
}
