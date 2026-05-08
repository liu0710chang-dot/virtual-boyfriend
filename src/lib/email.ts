// 邮件发送功能 - 使用 Resend SDK

import { Resend } from 'resend';

// 初始化 Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// 模拟用户数据库
const mockUsers = [
  { id: '1', email: '1335776598@qq.com', username: '小可爱' },
  { id: '2', email: 'user2@example.com', username: '甜心宝贝' },
  { id: '3', email: 'user3@example.com', username: '小仙女' },
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

// 发送单封邮件（使用 Resend SDK）
async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  const { data, error } = await resend.emails.send({
    from: '我的测试邮件 <onboarding@resend.dev>',
    to: [to],
    subject,
    html: `<p>${body}</p>`,
  });

  if (error) {
    console.error(`❌ 发送邮件失败:`, error);
    throw error;
  }

  console.log(`📧 发送邮件到: ${to}`, data);
}

// 给所有用户发送每日情话
export async function sendDailyLoveLetterToAll(): Promise<void> {
  console.log('🚀 开始发送每日情话...');
  
  for (const user of mockUsers) {
    try {
      const loveLetter = getRandomLoveLetter(user.username);
      const subject = '💌 你的每日情话到啦！';
      
      await sendEmail(user.email, subject, loveLetter);
      
      console.log(`✅ 成功发送给 ${user.username}`);
    } catch (error) {
      console.error(`❌ 发送给 ${user.username} 失败:`, error);
    }
  }
  
  console.log('🎉 每日情话发送完成！');
}