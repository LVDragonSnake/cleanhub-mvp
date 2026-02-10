import "./globals.css";
import AppShell from "./components/AppShell";

export const metadata = {
  title: "Cleanhub",
  description: "Cleanhub MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
