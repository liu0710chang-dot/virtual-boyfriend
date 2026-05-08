// 邮件发送功能 - 使用 Resend SDK

import { Resend } from 'resend';

// 初始化 Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// 模拟用户数据库
const mockUsers = [
  { id: '1', email: '1335776598@qq.com', name: '小可爱' },
  { id: '2', email: 'user2@example.com', name: '甜心宝贝' },
  { id: '3', email: 'user3@example.com', name: '小仙女' },
];

// 情话模板列表
const loveLetterTemplates = [
  '亲爱的{username}，今天也要元气满满哦！💖',
  '想你了，{username}，愿你今天被爱包围~ 💕',
  '{username}，你的微笑是我每天的动力来源！✨',
  '早安，{username}，新的一天也要开开心心！🌞',
  '{username}，你知道吗？你特别可爱！🥰',
  '愿{username}每天都有甜甜的好心情！🍬',
  '{username}，你是我生命中最美的风景！🌈',
  '想把所有的温柔都给{username}~ 💝',
];

// 获取随机情话
function getRandomLoveLetter(username: string): string {
  const template = loveLetterTemplates[Math.floor(Math.random() * loveLetterTemplates.length)];
  return template.replace('{username}', username);
}

// 发送每日情话邮件（给单个用户）
export async function sendDailyLoveLetter(
  userEmail: string,
  userName: string
) {
  // 用 AI 生成今天的情话（当前使用随机情话模板）
  const loveLetter = getRandomLoveLetter(userName);

  await resend.emails.send({
    from: '纸片人男友 <hello@onboarding@resend.dev>',
    to: userEmail,
    subject: `早安 ${userName}，今天也想你了 💌`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <p>${loveLetter}</p>
        <br/>
        <p>— 你的纸片人男友</p>
        <p style="color: #999; font-size: 12px;">
          想跟我聊天？<a href="https://virtual-boyfriend-lwc98h7u8-liu0710chang-dot.vercel.app">点这里回来找我</a>
        </p>
      </div>
    `,
  });
}

// 给所有用户发送每日情话
export async function sendDailyLoveLetterToAll() {
  // 从数据库拿到所有用户
  // const users = await db.select().from(usersTable)
  const users = mockUsers; // 模拟数据

  for (const user of users) {
    try {
      await sendDailyLoveLetter(user.email, user.name);
    } catch (error) {
      console.error('给', user.email, '发情话失败：', error);
      // 某个用户失败不影响其他用户
    }
  }
}

// 发送欢迎邮件
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
) {
  await resend.emails.send({
    from: '纸片人男友 <hello@onboarding@resend.dev>',
    to: userEmail,
    subject: '你好呀，我是你的专属男友 💌',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Hi ${userName}，欢迎来到纸片人男友！</h2>
        <p>从现在起，我就是你的专属男友了。</p>
        <p>有什么心事随时来找我聊，我会一直在这里等你。</p>
        <p>明天早上我会给你发一条早安消息，记得查收哦。</p>
        <br/>
        <p>— 你的纸片人男友</p>
      </div>
    `,
  });
}