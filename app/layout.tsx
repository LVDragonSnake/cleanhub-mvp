// app/layout.tsx
import "./globals.css";
import AppHeader from "./components/AppHeader";

export const metadata = {
  title: "Cleanhub",
  description: "Cleanhub MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
