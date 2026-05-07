import { NextRequest, NextResponse } from 'next/server';
import { createAIClient } from '@/lib/ai/client';

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const { text, speaker } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: '文本不能为空' }, { status: 400 });
    }
    
    // 使用角色专属音色，确保是男生声音
    const maleSpeakers: Record<string, string> = {
      'zh_male_taocheng_uranus_bigtts': 'zh_male_taocheng_uranus_bigtts',      // 霸总音
      'zh_male_m191_uranus_bigtts': 'zh_male_m191_uranus_bigtts',              // 温柔少年音
      'saturn_zh_male_shuanglangshaonian_tob': 'saturn_zh_male_shuanglangshaonian_tob',  // 爽朗少年音
      'saturn_zh_male_tiancaitongzhuo_tob': 'saturn_zh_male_tiancaitongzhuo_tob',      // 天才少年音
    };
    
    // 如果传入的 speaker 是男声则使用，否则使用默认男声
    const selectedSpeaker = maleSpeakers[speaker || ''] || 'zh_male_m191_uranus_bigtts';
    
    const client = createAIClient(request.headers);
    const response = await client.tts.synthesize({
      text,
      speaker: selectedSpeaker
    });
    
    const endTime = Date.now();
    console.log(`[TTS] ${endTime - startTime}ms - ${process.env.TTS_PROVIDER || 'coze'} - Speaker: ${selectedSpeaker} - Success`);
    
    return NextResponse.json({ 
      audioUri: response.audioUri,
      audioSize: response.audioSize,
      speaker: selectedSpeaker
    });
  } catch (error: any) {
    console.error('[TTS] Error:', error.message);
    // 如果 TTS API 失败，返回特殊标记让客户端降级到 Web Speech API
    return NextResponse.json({ 
      error: mapError(error),
      fallback: true  // 告诉客户端可以降级使用 Web Speech API
    }, { status: getStatusCode(error) });
  }
}

function mapError(error: any): string {
  if (error.message.includes('401')) {
    return 'API Key 无效，请检查配置';
  } else if (error.message.includes('403')) {
    return '权限不足，无法访问 API';
  } else if (error.message.includes('429')) {
    return '请求过于频繁，请稍后再试';
  } else if (error.message.includes('500')) {
    return '服务器内部错误';
  } else if (error.message.includes('503')) {
    return '服务不可用，请稍后再试';
  } else {
    return '语音合成失败';
  }
}

function getStatusCode(error: any): number {
  if (error.message.includes('401')) {
    return 401;
  } else if (error.message.includes('403')) {
    return 403;
  } else if (error.message.includes('429')) {
    return 429;
  } else if (error.message.includes('500')) {
    return 500;
  } else if (error.message.includes('503')) {
    return 503;
  } else {
    return 500;
  }
}