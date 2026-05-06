# 你的空闲男友 - 项目文档

## 项目概述

这是一个 AI 虚拟男友聊天应用，用户可以选择 4 种不同类型的虚拟男友进行聊天体验。

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui
- **Styling**: Tailwind CSS 4
- **AI 能力**: coze-coding-dev-sdk (LLM + TTS + Image Generation)

## 功能特性

### 主页功能
- 粉嫩恋爱风格 UI 设计
- 4 个预设角色（霸总、小奶狗、青梅竹马、校园学霸）
- 4 种背景音乐选择（Web Audio API 合成）
- 角色选中状态和音乐预览

### 聊天功能
- 微信风格聊天界面
- 流式 LLM 对话回复
- 自动 TTS 语音合成播放
- 位置触发 AI 生图（当用户说"我在XXX"时，虚拟男友分享同一位置的"自拍"）

## 目录结构

```
src/
├── app/
│   ├── api/
│   │   ├── llm/route.ts      # LLM 对话 API
│   │   ├── tts/route.ts      # TTS 语音合成 API
│   │   └── image/route.ts    # 图像生成 API
│   ├── chat/
│   │   └── page.tsx          # 聊天页面
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # 主页（角色选择）
├── lib/
│   ├── characters.ts         # 角色配置
│   └── utils.ts
└── components/ui/            # shadcn/ui 组件库
```

## 角色配置

| 角色 | 名称 | 性格 | TTS 音色 |
|------|------|------|----------|
| 霸总 | 陆子轩 | 冷酷霸道但宠溺 | zh_male_taocheng_uranus_bigtts |
| 小奶狗 | 林小奶 | 黏人可爱会撒娇 | saturn_zh_male_shuanglangshaonian_tob |
| 青梅竹马 | 顾青梅 | 温柔体贴陪伴型 | zh_male_m191_uranus_bigtts |
| 校园学霸 | 江学霸 | 傲娇调侃但关心人 | saturn_zh_male_tiancaitongzhuo_tob |

## 启动命令

- **开发环境**: `pnpm dev` (端口 5000)
- **生产构建**: `pnpm build`
- **生产启动**: `pnpm start`

## 环境变量

无需配置，SDK 会自动加载环境变量。

## 注意事项

1. 数据不持久化（刷新页面聊天记录清空）
2. 不支持 NSFW 内容
3. 背景音乐使用 Web Audio API 合成，仅提供简单旋律
4. 图像生成基于位置关键词触发，每次生成新图片
