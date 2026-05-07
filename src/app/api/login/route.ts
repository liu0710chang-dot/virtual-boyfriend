import { NextRequest, NextResponse } from 'next/server';

// 模拟用户数据库（实际应用中应该使用数据库）
const users: Record<string, { username: string; password: string }> = {
  'test@example.com': { username: 'testuser', password: 'password123' },
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // --- 注释掉 Turnstile 验证 ---
    /*
    const { turnstileToken } = await request.json();
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
      return Response.json({ message: '人机验证失败，请重试' }, { status: 403 });
    }
    */

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
