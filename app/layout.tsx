// src/app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@/styles/globals.scss';
import TopNavigation from '@/components/layout/TopNavigation';

export const metadata = {
  title: 'Pinterest Clone',
  description: 'Hệ thống lưu trữ hình ảnh',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body style={{ backgroundColor: '#ffffff' }}>
        {/* Component Navigation được gọi ở đây */}
        <TopNavigation />
        
        {/* Phần nội dung thay đổi theo từng trang */}
        {children}
      </body>
    </html>
  );
}