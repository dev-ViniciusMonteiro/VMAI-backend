// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetch } from 'undici';

@Injectable()
export class ChatService {
  private readonly API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly HTTP_REFERER = 'https://www.vmai.com.br';
  private readonly X_TITLE = 'chatsystem';

  constructor(private config: ConfigService) {}

  private buildSystemPrompt(context: string) {
    return [
      {
        role: 'system',
        content: 'Você é uma IA que responde com base no histórico.',
      },
      {
        role: 'user',
        content: `Histórico de mensagens para contexto:\n\n${context}\n\nAgora, responda à última mensagem ou informação apenas.`,
      },
    ];
  }

  private async callModel(model: string, messages: any[]) {
    const API_KEY = this.config.get<string>('OPENROUTER_API_KEY');

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'HTTP-Referer': this.HTTP_REFERER,
        'X-Title': this.X_TITLE,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages }),
    });

    if (!response.ok) throw new Error(`Model ${model} failed`);

    interface ApiResponse {
      choices?: { message?: { content?: string } }[];
    }

    const data: ApiResponse = (await response.json()) as ApiResponse;
    return data.choices?.[0]?.message?.content ?? 'Erro, sem resposta!';
  }

  async handleChat(messageHistory: { role: string; content: string }[]) {
    const context = messageHistory
      .slice(-5)
      .map(
        (msg, index) => `Mensagem ${index + 1} (${msg.role}): ${msg.content}`,
      )
      .join('\n');

    const systemPrompt = this.buildSystemPrompt(context);

    try {
      return await this.callModel('openai/gpt-4.1-nano', systemPrompt);
    } catch {
      return await this.callModel('deepseek/deepseek-r1:free', systemPrompt);
    }
  }
}
