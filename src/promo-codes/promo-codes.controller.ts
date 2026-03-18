import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPromoCodeDto: CreatePromoCodeDto) {
    return this.promoCodesService.create(createPromoCodeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.promoCodesService.findAll();
  }

  @Post('validate/:code')
  validate(@Param('code') code: string, @Body('total') total: number) {
    return this.promoCodesService.validateCode(code, total);
  }

  @Post('increment-usage/:code')
  incrementUsage(@Param('code') code: string) {
    return this.promoCodesService.incrementUsage(code);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.promoCodesService.delete(id);
  }
}
