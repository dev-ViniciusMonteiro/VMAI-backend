// test/chat.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ChatModule } from '../src/chat/chat.module';
import { ConfigModule } from '@nestjs/config';

describe('ChatController (e2e)', () => {
  let app: INestApplication; // Explicitly typed as INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), ChatModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/chat (POST) deve retornar 200 e um result', async () => {
    const messageHistory = [
      { role: 'user', content: 'Olá' },
      { role: 'assistant', content: 'Oi, tudo bem?' },
      { role: 'user', content: 'Qual seu nome?' },
    ];

    interface ChatResponse {
      result: string;
    }

    const response = await request(
      app.getHttpServer() as unknown as import('http').Server,
    ) // Explicitly cast to the correct type
      .post('/chat')
      .send({ messageHistory })
      .expect(201);

    const responseBody = response.body as ChatResponse;

    expect(responseBody).toHaveProperty('result');
    expect(typeof responseBody.result).toBe('string');
  });

  afterAll(async () => {
    await app.close();
  });
});
