import "./globals.css";

export const metadata = {
  title: "CLEANHUB MVP",
  description: "CLEANHUB - MVP Fase 1"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <div className="container">
          <header className="header">
            <div className="brand">CLEANHUB</div>
          </header>
          <main className="main">{children}</main>
          <footer className="footer">MVP • Fase 1</footer>
        </div>
      </body>
    </html>
  );
}
