'use client';

import { Calendar, Sparkles, Building2, User, TrendingUp } from 'lucide-react';

export function AnimatedBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Floating Icon Elements - Moving across entire screen */}
            <div className="absolute top-[10%] left-[15%] text-primary/10 animate-float-slow">
                <Calendar className="w-12 h-12" />
            </div>
            <div className="absolute top-[25%] right-[20%] text-secondary/10 animate-float-medium" style={{ animationDelay: '1s' }}>
                <Sparkles className="w-10 h-10" />
            </div>
            <div className="absolute bottom-[30%] left-[25%] text-primary/10 animate-float-fast" style={{ animationDelay: '2s' }}>
                <Building2 className="w-14 h-14" />
            </div>
            <div className="absolute top-[60%] right-[15%] text-accent/10 animate-float-slow" style={{ animationDelay: '0.5s' }}>
                <User className="w-11 h-11" />
            </div>
            <div className="absolute bottom-[15%] right-[40%] text-secondary/10 animate-float-medium" style={{ animationDelay: '1.5s' }}>
                <TrendingUp className="w-13 h-13" />
            </div>
            <div className="absolute top-[40%] left-[10%] text-primary/10 animate-float-fast" style={{ animationDelay: '3s' }}>
                <Calendar className="w-9 h-9" />
            </div>
            <div className="absolute bottom-[45%] right-[30%] text-accent/10 animate-float-slow" style={{ animationDelay: '2.5s' }}>
                <Sparkles className="w-12 h-12" />
            </div>
            <div className="absolute top-[70%] left-[35%] text-secondary/10 animate-float-medium" style={{ animationDelay: '1.2s' }}>
                <Building2 className="w-10 h-10" />
            </div>

            {/* Grid Pattern with Animation */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] animate-grid opacity-50" />
        </div>
    );
}
