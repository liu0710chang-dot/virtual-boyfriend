// 专门适配 Pages Router 的代码，和你的项目路径完全匹配
export default async function handler(req, res) {
  // 从URL里拿你传的密码
  const userPwd = req.query.pwd;

  // 验证密码（直接写死，不用环境变量，避免部署问题）
  if (userPwd !== 'sk_live_a123456789') {
    return res.status(401).json({ error: '未授权' });
  }

  // 验证成功，返回结果
  return res.status(200).json({
    success: true,
    message: '✅ 部署成功！授权通过！'
  });
}