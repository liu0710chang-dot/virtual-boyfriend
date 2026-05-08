import { AIClient, ChatRequest, ChatResponse, ImageRequest, ImageResponse, TTSRequest, TTSResponse } from './types';

export class OpenRouterClient implements AIClient {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  chat = {
    generate: async (request: ChatRequest): Promise<ChatResponse> => {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: request.model || 'google/gemini-3-flash-preview',
          messages: request.messages,
          temperature: request.temperature || 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content
      };
    },

    generateStream: async function* (this: OpenRouterClient, request: ChatRequest): AsyncGenerator<string> {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: request.model || 'google/gemini-3-flash-preview',
          messages: request.messages,
          temperature: request.temperature || 0.9,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    }
  };

  tts = {
    synthesize: async (request: TTSRequest): Promise<TTSResponse> => {
      throw new Error('OpenRouter does not support TTS');
    }
  };

  image = {
    generate: async (request: ImageRequest): Promise<ImageResponse> => {
      throw new Error('OpenRouter does not support image generation');
    }
  };
}