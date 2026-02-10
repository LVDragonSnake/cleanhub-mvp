// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Cleanhub",
  description: "Cleanhub MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
