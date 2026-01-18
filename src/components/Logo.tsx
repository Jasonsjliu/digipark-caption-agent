import Link from 'next/link';

export function Logo() {
    return (
        <Link href="/" className="relative select-none flex flex-col items-center md:items-start group cursor-pointer hover:opacity-90 transition-opacity">
            {/* Minimalist Typographic Logo */}
            <div className="relative z-10">
                <h1 className="font-orbitron text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-sm group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-500">
                    DIGIPARK
                </h1>

                {/* Subtle underline accent */}
                <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-700 ease-out mt-1 opacity-0 group-hover:opacity-100" />
            </div>

            {/* Clean Subtitle */}
            <div className="flex items-center gap-2 mt-2 opacity-40 group-hover:opacity-80 transition-opacity duration-300">
                <span className="text-[10px] font-mono tracking-[0.3em] uppercase">Matrix Engine</span>
            </div>
        </Link>
    );
}
