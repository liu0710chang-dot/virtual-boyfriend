import { NextRequest, NextResponse } from 'next/server';

// 模拟用户数据库（实际应用中应该使用数据库）
const users: Record<string, { username: string; password: string }> = {
  'test@example.com': { username: 'testuser', password: 'password123' },
};

export async function POST(request: NextRequest) {
  try {
    const { email, password, turnstileToken } = await request.json();

    // 验证 Turnstile 令牌
    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY || '',
        response: turnstileToken,
      }),
    });

    const turnstileData = await turnstileResponse.json();

    if (!turnstileData.success) {
      return NextResponse.json(
        { message: '验证失败，请重试' },
        { status: 400 }
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
