import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 简单密码验证
  const userPwd = request.nextUrl.searchParams.get('pwd');
  const cronPassword = process.env.CRON_PASSWORD;
  
  if (userPwd !== cronPassword) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  // ============ 下面是原来的所有代码，不用动！===========
  // 比如你原来写的发送邮件的代码，就放在这里

  return NextResponse.json({
    success: true,
    message: '定时任务执行成功！'
  });
}