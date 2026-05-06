import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '你的空闲男友',
  description: '选择一个心仪的虚拟男友，开始聊天吧~',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
