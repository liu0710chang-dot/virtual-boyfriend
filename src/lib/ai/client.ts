import { AIClient } from './adapter';
import { OpenRouterClient } from './openrouter';
import { VolcArkChatClient } from './volcark-chat';
import { VolcArkImageClient } from './volcark-image';
import { VolcArkTTSClient } from './volcark-tts';
import { CozeClient } from './coze';
import type { ChatRequest, ChatResponse, ImageRequest, ImageResponse, TTSRequest, TTSResponse } from './types';

export function createAIClient(headers?: Headers): AIClient {
  const chatProvider = process.env.API_PROVIDER || 'openrouter';
  const imageProvider = process.env.IMAGE_PROVIDER || 'volcark';
  const ttsProvider = process.env.TTS_PROVIDER || 'volcark';
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  const volcArkChatApiKey = process.env.VOLC_ARK_CHAT_API_KEY || process.env.VOLC_ARK_API_KEY;
  const volcArkImageApiKey = process.env.VOLC_ARK_IMAGE_API_KEY;
  const volcArkTtsApiKey = process.env.VOLC_ARK_TTS_API_KEY;

  // 聊天客户端 - 添加多级回退逻辑
  let chatClient;
  if (chatProvider === 'openrouter' && openrouterApiKey) {
    const openRouterClient = new OpenRouterClient(openrouterApiKey);
    const volcArkChatClient = volcArkChatApiKey ? new VolcArkChatClient(volcArkChatApiKey) : null;
    const cozeClient = new CozeClient(headers);
    
    chatClient = {
      chat: {
        generate: async (request: ChatRequest): Promise<ChatResponse> => {
          // 尝试 OpenRouter
          try {
            const startTime = Date.now();
            const result = await openRouterClient.chat.generate(request);
            const endTime = Date.now();
            console.log(`[Chat] ${endTime - startTime}ms - OpenRouter - Success`);
            return result;
          } catch (error: any) {
            console.warn(`[Chat] OpenRouter failed (${error.message}), trying Volc Ark...`);
          }
          
          // 尝试火山引擎
          if (volcArkChatClient) {
            try {
              const startTime = Date.now();
              const result = await volcArkChatClient.chat.generate(request);
              const endTime = Date.now();
              console.log(`[Chat] ${endTime - startTime}ms - Volc Ark (fallback) - Success`);
              return result;
            } catch (error: any) {
              console.warn(`[Chat] Volc Ark failed (${error.message}), trying Coze...`);
            }
          }
          
          // 尝试 Coze
          try {
            const startTime = Date.now();
            const result = await cozeClient.chat.generate(request);
            const endTime = Date.now();
            console.log(`[Chat] ${endTime - startTime}ms - Coze (fallback) - Success`);
            return result;
          } catch (fallbackError) {
            console.error('[Chat] All providers failed:', fallbackError);
            throw fallbackError;
          }
        }
      }
    };
  } else if (chatProvider === 'volcark' && volcArkChatApiKey) {
    const volcArkChatClient = new VolcArkChatClient(volcArkChatApiKey);
    const cozeClient = new CozeClient(headers);
    
    chatClient = {
      chat: {
        generate: async (request: ChatRequest): Promise<ChatResponse> => {
          try {
            const startTime = Date.now();
            const result = await volcArkChatClient.chat.generate(request);
            const endTime = Date.now();
            console.log(`[Chat] ${endTime - startTime}ms - Volc Ark - Success`);
            return result;
          } catch (error: any) {
            console.warn(`[Chat] Volc Ark failed (${error.message}), falling back to Coze`);
            try {
              const startTime = Date.now();
              const result = await cozeClient.chat.generate(request);
              const endTime = Date.now();
              console.log(`[Chat] ${endTime - startTime}ms - Coze (fallback) - Success`);
              return result;
            } catch (fallbackError) {
              console.error('[Chat] Both Volc Ark and Coze failed:', fallbackError);
              throw fallbackError;
            }
          }
        }
      }
    };
  } else {
    chatClient = new CozeClient(headers);
  }

  // 图像客户端
  let imageClient;
  if (imageProvider === 'volcark' && volcArkImageApiKey) {
    const volcArkImageClient = new VolcArkImageClient(volcArkImageApiKey);
    const cozeClient = new CozeClient(headers);
    
    imageClient = {
      generate: async (request: ImageRequest): Promise<ImageResponse> => {
        try {
          const startTime = Date.now();
          const result = await volcArkImageClient.generate(request);
          const endTime = Date.now();
          console.log(`[Image] ${endTime - startTime}ms - Volc Ark - Success`);
          return result;
        } catch (error: any) {
          console.warn(`[Image] Volc Ark failed (${error.message}), falling back to Coze`);
          try {
            const startTime = Date.now();
            const result = await cozeClient.image.generate(request);
            const endTime = Date.now();
            console.log(`[Image] ${endTime - startTime}ms - Coze (fallback) - Success`);
            return result;
          } catch (fallbackError) {
            console.error('[Image] Both Volc Ark and Coze failed:', fallbackError);
            throw fallbackError;
          }
        }
      }
    };
  } else {
    imageClient = new CozeClient(headers).image;
  }

  // TTS 客户端
  let ttsClient;
  if (ttsProvider === 'volcark' && volcArkTtsApiKey) {
    const volcArkTtsClient = new VolcArkTTSClient(volcArkTtsApiKey);
    const cozeClient = new CozeClient(headers);
    
    ttsClient = {
      synthesize: async (request: TTSRequest): Promise<TTSResponse> => {
        try {
          const startTime = Date.now();
          const result = await volcArkTtsClient.synthesize(request);
          const endTime = Date.now();
          console.log(`[TTS] ${endTime - startTime}ms - Volc Ark - Success`);
          return result;
        } catch (error: any) {
          console.warn(`[TTS] Volc Ark failed (${error.message}), falling back to Coze`);
          try {
            const startTime = Date.now();
            const result = await cozeClient.tts.synthesize(request);
            const endTime = Date.now();
            console.log(`[TTS] ${endTime - startTime}ms - Coze (fallback) - Success`);
            return result;
          } catch (fallbackError) {
            console.error('[TTS] Both Volc Ark and Coze failed:', fallbackError);
            throw fallbackError;
          }
        }
      }
    };
  } else {
    ttsClient = new CozeClient(headers).tts;
  }

  return {
    chat: chatClient.chat,
    image: imageClient,
    tts: ttsClient
  };
}