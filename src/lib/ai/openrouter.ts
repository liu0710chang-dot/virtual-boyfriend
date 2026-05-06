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