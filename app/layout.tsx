import "./globals.css";
import WorkerHeader from "./components/WorkerHeader";

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
