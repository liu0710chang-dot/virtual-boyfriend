export default async function handler(req, res) {
  // 直接写死密码，不用环境变量！
  const userPwd = req.query.pwd;

  // 验证密码
  if (userPwd !== 'sk_live_a123456789') {
    return res.status(401).json({ error: '未授权' });
  }

  // 验证成功，返回结果
  res.status(200).json({
    success: true,
    message: '✅ 授权通过！问题解决！'
  });
}