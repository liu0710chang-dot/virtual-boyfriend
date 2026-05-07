import { NextRequest, NextResponse } from 'next/server';

// 模拟用户数据库（实际应用中应该使用数据库）
const users: Record<string, { username: string; password: string }> = {
  'test@example.com': { username: 'testuser', password: 'password123' },
};

export async function POST(request: NextRequest) {
  try {
    // 从请求体中拿到前端传来的 turnstile token
    const { turnstileToken, ...loginData } = await request.json();
    const { email, password } = loginData;

    // 去 Cloudflare 验证这个 token 是不是真的
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

    // 如果验证失败，直接拒绝
    if (!verifyResult.success) {
      return Response.json(
        { error: '人机验证失败，请重试' },
        { status: 403 }
      );
    }

    // 验证用户（模拟）
    const user = users[email];
    if (!user || user.password !== password) {
      return NextResponse.json(
        { message: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        email,
        username: user.username,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}
