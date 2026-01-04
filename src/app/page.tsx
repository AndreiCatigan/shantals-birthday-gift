"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const supabase = createClient();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-stone-50 p-4 md:p-8">
      {/* 1. Added 'w-full' and 'flex justify-center' to the motion div.
          2. This ensures the container isn't squeezing the card.
      */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full flex justify-center"
      >
        {/* Increased to 'max-w-xl' (approx 576px) for a much more substantial feel.
            'w-full' ensures it shrinks for mobile phones.
        */}
        <Card className="w-full max-w-xl border-rose-100 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden border">
          {/* Decorative Top Bar */}
          <div className="h-2 bg-rose-400 opacity-20 w-full" />
          
          <CardHeader className="text-center space-y-4 pt-10 px-6">
            <div className="mx-auto bg-rose-50 w-24 h-24 rounded-full flex items-center justify-center shadow-inner">
              <Heart className="w-12 h-12 text-rose-500 fill-rose-500 animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <CardTitle className="text-5xl font-bold text-stone-800 tracking-tight font-[family-name:var(--font-handwritten)]">
                Shantal's Vault
              </CardTitle>
              <CardDescription className="text-stone-400 text-lg italic font-serif">
                "A secret place for our love letters."
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-8 pb-12 pt-6 px-6 md:px-12">
            <Button 
              onClick={handleLogin}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-8 rounded-2xl text-xl transition-all active:scale-95 shadow-lg shadow-rose-200 group"
            >
              <span className="flex items-center gap-3">
                Sign in with Google
                <span className="group-hover:translate-x-1 transition-transform">💌</span>
              </span>
            </Button>
            
            <div className="border-t border-stone-100 pt-6 text-center">
              <p className="text-[10px] text-stone-300 uppercase tracking-[0.4em] font-bold">
                From Andrei with Love
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Background Decoration */}
      <div className="fixed bottom-0 left-0 p-8 pointer-events-none opacity-20 hidden sm:block">
        <Heart className="w-24 h-24 text-rose-200 rotate-12" />
      </div>
      <div className="fixed top-0 right-0 p-8 pointer-events-none opacity-20 hidden sm:block">
        <Heart className="w-16 h-16 text-rose-200 -rotate-12" />
      </div>
    </div>
  );
}