export interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  temperature?: number;
}

export interface ChatResponse {
  content: string;
}

export interface ImageRequest {
  prompt: string;
  size?: string;
}

export interface ImageResponse {
  imageUrls: string[];
  success: boolean;
}

export interface TTSRequest {
  text: string;
  speaker?: string;
}

export interface TTSResponse {
  audioUri: string;
  audioSize: number;
}

export interface AIClient {
  chat: {
    generate: (request: ChatRequest) => Promise<ChatResponse>;
  };
  tts: {
    synthesize: (request: TTSRequest) => Promise<TTSResponse>;
  };
  image: {
    generate: (request: ImageRequest) => Promise<ImageResponse>;
  };
}
