import { HistoryPanel } from '@/components/HistoryPanel';
import { Logo } from '@/components/Logo';

export default function HistoryPage() {
    return (
        <div className="min-h-screen relative overflow-auto custom-scrollbar flex flex-col font-sans selection:bg-purple-500/30">
            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex-1 flex flex-col">

                {/* Header */}
                <header className="w-full py-6 flex justify-between items-center">
                    <div className="scale-75 origin-top-left md:scale-90 transition-transform -ml-2">
                        <Logo />
                    </div>
                    <a href="/" className="text-[10px] bg-white/5 border border-white/5 hover:bg-white/10 px-4 py-1.5 rounded-full text-indigo-100/40 hover:text-indigo-100 transition-all uppercase tracking-[0.2em] backdrop-blur-sm">
                        ← Back to Generator
                    </a>
                </header>

                {/* Main Content */}
                <main className="flex-1 pb-20">
                    <HistoryPanel />
                </main>

                <footer className="py-8 text-center text-[10px] text-white/10 font-mono uppercase tracking-widest">
                    © 2026 Digipark Inc.
                </footer>
            </div>
        </div>
    );
}
