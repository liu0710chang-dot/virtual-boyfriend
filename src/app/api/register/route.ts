import { NextRequest, NextResponse } from 'next/server';

// 模拟用户数据库
const users: Record<string, { username: string; password: string }> = {
  'test@example.com': { username: 'testuser', password: 'password123' },
};

export async function POST(request: NextRequest) {
  try {
    // 从请求体中拿到前端传来的 turnstile token
    const { turnstileToken, ...registrationData } = await request.json();
    const { email, password, username } = registrationData;

    /* 
    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      }
    );
 
    const verifyResult = await verifyResponse.json();
 
    if (!verifyResult.success) {
      return Response.json({ error: '人机验证失败，请重试' }, { status: 403 });
    }
    */

    // 检查邮箱是否已注册
    if (users[email]) {
      return NextResponse.json(
        { message: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 检查用户名是否已使用
    const existingUser = Object.values(users).find((u) => u.username === username);
    if (existingUser) {
      return NextResponse.json(
        { message: '该用户名已被使用' },
        { status: 400 }
      );
    }

    // 创建用户（模拟）
    users[email] = { username, password };

    return NextResponse.json({
      user: {
        email,
        username,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}
