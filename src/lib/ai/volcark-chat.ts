import { ChatRequest, ChatResponse } from './types';

export class VolcArkChatClient {
  private apiKey: string;
  private baseUrl: string = 'https://ark.cn-beijing.volces.com/api/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  chat = {
    generate: async (request: ChatRequest): Promise<ChatResponse> => {
      const formattedMessages = request.messages.map(msg => ({
        role: msg.role,
        content: [{ type: 'input_text', text: msg.content }]
      }));

      const response = await fetch(`${this.baseUrl}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'doubao-seed-2-0-pro-260215',
          input: formattedMessages
        })
      });

      if (!response.ok) {
        throw new Error(`${response.status}`);
      }

      const data = await response.json();
      const content = this.extractContent(data);
      
      return { content };
    }
  };

  private extractContent(data: any): string {
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
    return '收到你的消息了';
  }
}