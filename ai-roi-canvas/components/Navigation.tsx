'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  MessageSquare, 
  PieChart, 
  Map, 
  FileOutput,
  Sparkles
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Sparkles },
  { href: '/interview', label: 'Interview', icon: MessageSquare },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portfolio', label: 'Portfolio', icon: PieChart },
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/canvas', label: 'Export', icon: FileOutput },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--electric)] to-[var(--emerald-accent)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg gradient-text">
              AI ROI Canvas
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

