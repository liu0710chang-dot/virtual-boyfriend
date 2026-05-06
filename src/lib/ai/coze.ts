import { AIClient, ChatRequest, ChatResponse, ImageRequest, ImageResponse, TTSRequest, TTSResponse } from './types';
import { LLMClient, TTSClient, ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export class CozeClient implements AIClient {
  private llmClient: LLMClient;
  private ttsClient: TTSClient;
  private imageClient: ImageGenerationClient;

  constructor(headers?: Headers) {
    const customHeaders = headers ? HeaderUtils.extractForwardHeaders(headers) : {};
    const config = new Config();
    
    this.llmClient = new LLMClient(config, customHeaders);
    this.ttsClient = new TTSClient(config, customHeaders);
    this.imageClient = new ImageGenerationClient(config, customHeaders);
  }

  chat = {
    generate: async (request: ChatRequest): Promise<ChatResponse> => {
      const messages = (request.messages || []).map(m => ({
        ...m,
        role: m.role as 'user' | 'system' | 'assistant'
      }));
      const response = await this.llmClient.invoke(messages, {
        model: request.model || 'doubao-seed-1-8-251228',
        temperature: request.temperature || 0.9
      });
      return { content: response.content };
    }
  };

  tts = {
    synthesize: async (request: TTSRequest): Promise<TTSResponse> => {
      const response = await this.ttsClient.synthesize({
        uid: `user_${Date.now()}`,
        text: request.text,
        speaker: request.speaker || 'zh_female_xiaohe_uranus_bigtts',
        audioFormat: 'mp3'
      });
      return {
        audioUri: response.audioUri,
        audioSize: response.audioSize
      };
    }
  };

  image = {
    generate: async (request: ImageRequest): Promise<ImageResponse> => {
      const response = await this.imageClient.generate({
        prompt: request.prompt,
        size: request.size || '2K'
      });
      
      const helper = this.imageClient.getResponseHelper(response);
      if (helper.success) {
        return {
          imageUrls: helper.imageUrls,
          success: true
        };
      } else {
        return {
          imageUrls: [],
          success: false
        };
      }
    }
  };
}