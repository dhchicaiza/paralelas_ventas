import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  @Post('inventory')
  @ApiOperation({ summary: 'Receive inventory webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleInventoryWebhook(@Body() body: any, @Headers() headers: any) {
    this.logger.log('Received inventory webhook', body);
    // TODO: Implement webhook handler
    return { received: true };
  }

  @Post('dispatch')
  @ApiOperation({ summary: 'Receive dispatch webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleDispatchWebhook(@Body() body: any, @Headers() headers: any) {
    this.logger.log('Received dispatch webhook', body);
    // TODO: Implement webhook handler
    return { received: true };
  }
}
