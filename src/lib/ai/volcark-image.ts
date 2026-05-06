import { ImageRequest, ImageResponse } from './types';

export class VolcArkImageClient {
  private apiKey: string;
  private baseUrl: string = 'https://ark.cn-beijing.volces.com/api/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  generate = async (request: ImageRequest): Promise<ImageResponse> => {
    const response = await fetch(`${this.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'doubao-seedream-5-0-260128',
        prompt: request.prompt,
        sequential_image_generation: 'disabled',
        response_format: 'url',
        size: request.size || '2K',
        stream: false,
        watermark: true
      })
    });

    if (!response.ok) {
      throw new Error(`Volc Ark Image error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrls = this.extractImageUrls(data);
    
    return {
      imageUrls,
      success: imageUrls.length > 0
    };
  };

  private extractImageUrls(data: any): string[] {
    const imageUrls: string[] = [];
    if (data && data.data && Array.isArray(data.data)) {
      data.data.forEach((item: any) => {
        if (item.url) {
          imageUrls.push(item.url);
        }
      });
    }
    return imageUrls;
  }
}