// app/layout.tsx
import "./globals.css";
import WorkerHeader from "./components/WorkerHeader";

export const metadata = {
  title: "Cleanhub",
  description: "Cleanhub MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <WorkerHeader />
        {children}
      </body>
    </html>
  );
}
