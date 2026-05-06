import { AIClient, ChatRequest, ChatResponse, ImageRequest, ImageResponse } from './types';

export class VolcArkClient implements AIClient {
  private apiKey: string;
  private baseUrl: string = 'https://ark.cn-beijing.volces.com/api/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  chat: any = {
    generate: async (request: ChatRequest): Promise<ChatResponse> => {
      throw new Error('Volc Ark chat not implemented');
    }
  };

  tts: any = {
    synthesize: async () => {
      throw new Error('Volc Ark TTS not implemented');
    }
  };

  image = {
    generate: async (request: ImageRequest): Promise<ImageResponse> => {
      const response = await fetch(`${this.baseUrl}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'doubao-seed-2-0-pro-260215',
          input: [
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: request.prompt
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Volc Ark error: ${response.status}`);
      }

      const data = await response.json();
      const imageUrls = this.extractImageUrls(data);
      
      return {
        imageUrls,
        success: imageUrls.length > 0
      };
    }
  };

  private extractImageUrls(data: any): string[] {
    const imageUrls: string[] = [];
    if (data && data.output && Array.isArray(data.output)) {
      data.output.forEach((item: any) => {
        if (item.content && Array.isArray(item.content)) {
          item.content.forEach((content: any) => {
            if (content.type === 'output_image' && content.image_url) {
              imageUrls.push(content.image_url);
            }
          });
        }
      });
    }
    return imageUrls;
  }
}
