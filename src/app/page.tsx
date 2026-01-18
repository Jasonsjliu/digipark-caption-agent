import { CaptionGenerator } from '@/components/CaptionGenerator';
import { Logo } from '@/components/Logo';

export default function Home() {
    return (
        <div className="min-h-screen relative overflow-auto custom-scrollbar flex flex-col font-sans selection:bg-purple-500/30">

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex-1 flex flex-col items-center">

                {/* Header / Logo (Top Left) */}
                <header className="absolute top-0 left-0 w-full px-6 py-6 flex justify-between items-start z-50">
                    {/* Pure CSS Logo */}
                    <div className="-ml-2 scale-75 origin-top-left md:scale-90 transition-transform">
                        <Logo />
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                        <a href="/history" className="text-[10px] bg-white/5 border border-white/5 hover:bg-white/10 px-4 py-1.5 rounded-full text-indigo-100/40 hover:text-indigo-100 transition-all uppercase tracking-[0.2em] backdrop-blur-sm">
                            📜 History
                        </a>
                        <a href="/keywords" className="text-[10px] bg-white/5 border border-white/5 hover:bg-white/10 px-4 py-1.5 rounded-full text-indigo-100/40 hover:text-indigo-100 transition-all uppercase tracking-[0.2em] backdrop-blur-sm">
                            Keyword Library →
                        </a>
                    </div>
                </header>

                {/* Main Interface (Centered Content) */}
                <main className="w-full pb-20 mt-32 md:mt-40">
                    <CaptionGenerator />
                </main>

                <footer className="py-8 text-center text-[10px] text-white/10 font-mono uppercase tracking-widest">
                    © 2026 Digipark Inc.
                </footer>
            </div>
        </div>
    );
}
