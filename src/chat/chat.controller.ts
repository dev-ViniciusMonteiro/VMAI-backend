// src/chat/chat.controller.ts
import { Controller, Post, Body, Res } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessageHistoryDto } from './dto/message-history.dto';
import { Response } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async postMessage(@Body() body: MessageHistoryDto, @Res() res: Response) {
    try {
      const result = await this.chatService.handleChat(body.messageHistory);
      res.json({ result });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }
}
