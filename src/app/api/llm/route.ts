import { NextRequest, NextResponse } from 'next/server';
import { createAIClient } from '@/lib/ai/client';

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const { messages, model, temperature, stream = true } = await request.json();
    
    // 如果请求流式响应
    if (stream) {
      const client = createAIClient(request.headers) as any;
      
      // 尝试流式响应
      if (client.chat.generateStream) {
        const stream = new ReadableStream({
          async start(controller) {
            try {
              const generator = client.chat.generateStream({
                messages,
                model,
                temperature
              });
              
              for await (const chunk of generator) {
                controller.enqueue(new TextEncoder().encode(chunk));
              }
              
              controller.close();
            } catch (error: any) {
              console.error('[LLM Stream] Error:', error.message);
              controller.error(error);
            }
          }
        });
        
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked'
          }
        });
      }
    }
    
    // 非流式响应（降级方案）
    const client = createAIClient(request.headers);
    const response = await client.chat.generate({
      messages,
      model,
      temperature
    });
    
    const endTime = Date.now();
    console.log(`[LLM] ${endTime - startTime}ms - ${process.env.API_PROVIDER || 'coze'} - Success`);
    
    return NextResponse.json({ content: response.content });
  } catch (error: any) {
    console.error('[LLM] Error:', error.message);
    return NextResponse.json({ error: mapError(error) }, { status: getStatusCode(error) });
  }
}

function mapError(error: any): string {
  if (error.message.includes('401')) {
    return 'API Key 无效，请检查配置';
  } else if (error.message.includes('403')) {
    return '权限不足，无法访问 API';
  } else if (error.message.includes('429')) {
    return '请求过于频繁，请稍后再试';
  } else if (error.message.includes('500')) {
    return '服务器内部错误';
  } else if (error.message.includes('503')) {
    return '服务不可用，请稍后再试';
  } else {
    return 'LLM 调用失败';
  }
}

function getStatusCode(error: any): number {
  if (error.message.includes('401')) {
    return 401;
  } else if (error.message.includes('403')) {
    return 403;
  } else if (error.message.includes('429')) {
    return 429;
  } else if (error.message.includes('500')) {
    return 500;
  } else if (error.message.includes('503')) {
    return 503;
  } else {
    return 500;
  }
}