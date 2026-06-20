import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, PlusCircle, Users, IndianRupee, LayoutDashboard } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // நிர்வாகி சரிபார்ப்பு (Admin check)
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (user?.role !== 'admin') {
    redirect('/');
  }

  const navItems = [
    { label: 'இதழ்கள் (Issues)', href: '/issues', icon: BookOpen },
    { label: 'புதிய இதழ் (New Issue)', href: '/issues/new', icon: PlusCircle },
    { label: 'சந்தாதாரர்கள் (Subscribers)', href: '/subscribers', icon: Users },
    { label: 'வருவாய் (Revenue)', href: '/revenue', icon: IndianRupee },
  ];

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* பக்கவாட்டு பட்டி (Sidebar) */}
      <aside className="w-64 border-r bg-card flex flex-col hidden md:flex">
        <div className="p-6 border-b">
          <Link href="/admin/issues" className="block">
            <Image
              src="/images/sattavillaku-logo.jpeg"
              alt="சட்டவிளக்கு"
              width={160}
              height={40}
              className="h-9 w-auto object-contain"
            />
          </Link>
          <p className="text-xs text-muted-foreground mt-2">ஆசிரியர் பலகை (Editor Dashboard)</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={`/admin${item.href === '/issues' ? '/issues' : item.href}`} // Quick fix for routing
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* முதன்மை பகுதி (Main Content) */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-background flex items-center px-6 md:hidden">
           <div className="font-serif font-bold text-lg text-primary">சட்டவிளக்கு ஆசிரியர் பலகை</div>
        </header>
        <div className="p-6 md:p-8 overflow-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
