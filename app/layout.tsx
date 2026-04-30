import type { Metadata, Viewport } from 'next';
import './globals.css';

const base = process.env.NODE_ENV === 'production' ? '/japanese-conversation-learn' : '';

export const metadata: Metadata = {
  title: '일본어 회화 학습',
  description: '체계적인 커리큘럼으로 배우는 일본어 회화',
  manifest: `${base}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '일어학습',
  },
  icons: {
    apple: `${base}/apple-touch-icon.png`,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a2e5a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
