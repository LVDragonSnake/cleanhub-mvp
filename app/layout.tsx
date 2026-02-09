import "./globals.css";
import Header from "../components/Header";

export const metadata = {
  title: "CLEANHUB MVP",
  description: "CLEANHUB - MVP Fase 1",
};

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <div className="container">
          <Header />
          <main className="main">{children}</main>
          <footer className="footer">MVP • Fase 1</footer>
        </div>
      </body>
    </html>
  );
}
