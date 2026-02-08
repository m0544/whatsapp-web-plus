import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      {/* App chrome: aligned with home + login flow */}
      <header className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold text-foreground hover:underline"
          >
            WhatsApp Web Plus
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              בית
            </Link>
            <span className="text-border">|</span>
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              התחבר / התנתק מ-WhatsApp
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
