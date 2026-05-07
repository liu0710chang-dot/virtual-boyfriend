import { NextResponse } from 'next/server';
import { sendDailyLoveLetterToAll } from '@/lib/email';

export async function GET() {
  try {
    await sendDailyLoveLetterToAll();
    return NextResponse.json({
      success: true,
      message: '每日邮件发送完成',
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error('每日邮件发送失败：', error);
    return NextResponse.json(
      { error: '发送失败' },
      { status: 500 }
    );
  }
}