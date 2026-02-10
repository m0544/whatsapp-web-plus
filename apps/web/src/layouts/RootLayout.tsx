import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, MessageCircle, LogIn } from 'lucide-react';

export function RootLayout() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-[var(--shadow)]">
        <div className="container max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg text-foreground flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary-foreground" />
            </span>
            WhatsApp Web Plus
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`p-2 rounded-lg transition-colors ${isActive('/') && !isActive('/dashboard') && !isActive('/templates') && location.pathname !== '/send' && location.pathname !== '/login' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
              aria-label="בית"
            >
              <Home className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className={`p-2 rounded-lg transition-colors ${isActive('/login') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
              aria-label="התחברות"
            >
              <LogIn className="w-5 h-5" />
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
