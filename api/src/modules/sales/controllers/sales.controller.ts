import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SalesService } from '../services/sales.service';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201, description: 'Sale created successfully' })
  async createSale(@Body() createSaleDto: any) {
    // TODO: Implement
    return { message: 'Sale creation endpoint - To be implemented' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  @ApiResponse({ status: 200, description: 'Sale found' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  async getSale(@Param('id') id: string) {
    // TODO: Implement
    return { message: `Get sale ${id} - To be implemented` };
  }
}
