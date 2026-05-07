import { NextRequest, NextResponse } from 'next/server';
// 这里替换成你项目里真实的发送邮件函数
import { sendDailyLoveLetterToAll } from '@/lib/email';

// 定时任务 GET 接口
export async function GET(request: NextRequest) {
  try {
    // 1. 安全验证：校验 CRON_SECRET 密钥
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 2. 执行核心逻辑：给所有用户发送每日情话邮件
    await sendDailyLoveLetterToAll();

    // 3. 返回成功结果
    return NextResponse.json({
      success: true,
      message: '每日情话邮件发送完成！'
    });

  } catch (error) {
    console.error('定时任务执行失败:', error);
    return NextResponse.json({ error: '任务执行失败' }, { status: 500 });
  }
}