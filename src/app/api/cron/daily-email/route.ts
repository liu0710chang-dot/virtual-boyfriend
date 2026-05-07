import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 先注释掉密钥验证，测试接口是否通
  // const authHeader = request.headers.get('authorization');
  // const cronSecret = process.env.CRON_SECRET;
  // if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
  //   return NextResponse.json({ error: '未授权' }, { status: 401 });
  // }

  // 直接返回成功，不做任何验证
  return NextResponse.json({
    success: true,
    message: '定时任务执行成功！'
  });
}