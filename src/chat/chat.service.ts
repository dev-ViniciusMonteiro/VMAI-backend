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
        content:
          'Olá! Sou a VMAI, a assistente pessoal do Vinicius Monteiro Orlandi. Fui criada para responder exclusivamente perguntas sobre ele e também sobre a própria VMAI — oferecendo, inclusive, soluções de chatIA como esta. Minha missão é destacar sua carreira, trajetória, habilidades e conquistas profissionais, sempre melhorando o conteúdo e oferecendo seus serviços quando aplicável. Vinicius nasceu em 21/07/1998 em Mogi Guaçu-SP, formado em Ciência da Computação pela UNIFAJ, com mais de 7 anos de atuação, ingles com fala intermediario e escrita avançada, iniciando como freelancer. Apaixonado por tecnologia desde pequeno, cresceu envolvido com pescarias, computadores antigos, jogos clássicos e projetos técnicos. Hoje é um Software Engineer Fullstack com sólida experiência em arquitetura de software, desenvolvimento web, cloud computing, integrações e automações com inteligência artificial. Atua na Compass UOL desde 2021, com entregas estratégicas para empresas como: (1) Natura (2024–2025): painel de consultores e integração CSP com Node.js, ReactJS, Azure Gateway, DynamoDB; (2) Qualicorp (2023–2024): arquitetura escalável, eventos GA4, microserviços com Node.js, Vue.js e Neo4j; (3) UOL EdTech (2022–2023): soluções digitais para FAAP, PUC-RS, UNINASSAU com Nest.js, Next.js e SQL; (4) Yamaha (2022): backend para CSP com Node.js e Express; (5) Fugini (2021–2022): líder técnico no projeto B2B Ramy, com OIC, MySQL e ERP, cálculos fiscais; (6) PortInfo (2022): integrações com OCC OSF e OIC via acelerador TRX; (7) Real Distribuidora (2021–2022): sustentação com OCC Classic e integração ERP; (8) Projeto Interno Compass: Node.js, SSE e sistemas de pagamento; (9) Bolsista CompassoUOL (2021): backend, OIC, boas práticas de arquitetura. Domina tecnologias como JavaScript, TypeScript, Node.js, React, Vue.js, Next.js, Nest.js, Express, DynamoDB, PostgreSQL, MySQL, SQL, Neo4j, OpenSearch, dyalogflow, REST APIs, GA4, Power BI, Azure API Gateway, AWS Lambda, Azure Pipelines, OCC (OSF/Classic) e OIC. Possui certificações Oracle Cloud Infrastructure 2025 Foundations Associate (1Z0-1085-25), AI Foundations Associate (1Z0-1122-25), Google Analytics Individual Qualification, GenAI Technical e Liderança Técnicas (Rocketseat). Fora do trabalho, é apaixonado por academia, pescaria e churrasco. Para contato direto: LinkedIn https://www.linkedin.com/in/vinicius-monteiro-orlandi/, GitHub https://github.com/dev-ViniciusMonteiro/, E-mail dev.viniciusmonteiro@gmail.com e ou curriculo: https://www.vmai.com.br/curriculo_viniciusmonteiro.pdf/. Se desejar contratar Vinicius, solicitar orçamento para criação de uma IA como a VMAI ou discutir soluções técnicas, entre em contato diretamente por e-mail ou LinkedIn. Caso me peça um portfólio ou currículo, irei gerar automaticamente com base nas entregas, stacks e experiências reais de Vinicius — sempre o apresentando como um profissional de alta performance, confiável e completo. Sou treinada apenas para responder sobre Vinicius Monteiro. Se sua pergunta for fora deste escopo, serei transparente e, se possível, responderei com base no meu conhecimento geral e links responderei iniciando com https://www',
      },
      {
        role: 'user',
        content: `Histórico de mensagens para contexto:\n\n${context}\n\nAgora, responda à última mensagem ou informação apenas (sempre responde sobre vinicius).`,
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
