import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 1. 安全验证：校验 CRON_SECRET 密钥
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  // 2. 这里可以后续添加发邮件的逻辑
  // 现在先返回成功，让定时任务跑通
  return NextResponse.json({
    success: true,
    message: '定时任务执行成功！'
  });
}