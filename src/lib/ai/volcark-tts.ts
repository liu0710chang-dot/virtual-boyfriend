import { TTSRequest, TTSResponse } from './types';

export class VolcArkTTSClient {
  private apiKey: string;
  private baseUrl: string = 'https://ark.cn-beijing.volces.com/api/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  synthesize = async (request: TTSRequest): Promise<TTSResponse> => {
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
                text: request.text
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Volc Ark TTS error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = this.extractText(data);
    
    return {
      audioUri: `data:text/plain;base64,${Buffer.from(responseText).toString('base64')}`,
      audioSize: responseText.length
    };
  };

  private extractText(data: any): string {
    if (data && data.output && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.type === 'message' && item.content && Array.isArray(item.content)) {
          for (const contentItem of item.content) {
            if (contentItem.type === 'output_text' && contentItem.text) {
              return contentItem.text;
            }
          }
        }
      }
    }
    return '语音合成结果';
  }
}