import { ChatRequest, ChatResponse, ImageRequest, ImageResponse, TTSRequest, TTSResponse } from './types';

export interface AIClient {
  chat: {
    generate: (request: ChatRequest) => Promise<ChatResponse>;
  };
  image: {
    generate: (request: ImageRequest) => Promise<ImageResponse>;
  };
  tts: {
    synthesize: (request: TTSRequest) => Promise<TTSResponse>;
  };
}
