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
    <div className="flex min-h-screen w-full items-center justify-center bg-rose-400 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full flex justify-center"
      >
        <Card className="w-full max-w-2xl border-rose-100 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden border">
          <div className="h-2 bg-rose-500 opacity-20 w-full" />
          
          <CardHeader className="text-center space-y-8 pt-12 px-6">
            
            {/* --- Evenly Spaced Header Icons --- */}
            <div className="flex items-center justify-center gap-4 md:gap-8">
              
              {/* Left Sticker: bday-icon.png */}
              <motion.div 
                initial={{ rotate: -15, scale: 0 }}
                animate={{ rotate: -15, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="w-24 h-24 md:w-32 md:h-32 shrink-0"
              >
                <img 
                  src="/background-stickers/bday-icon.png" 
                  alt="Birthday Sticker" 
                  className="w-full h-full object-contain"
                />
              </motion.div>

              {/* --- REPLACED: Central Shantal Photo Circle --- */}
              {/* We increased the size to match the side stickers and added a white border for pop */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="bg-rose-100 w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center shadow-md shrink-0 overflow-hidden border-[5px] border-white relative z-10"
              >
                <img 
                  src="/background-stickers/shantal-sticker.png" 
                  alt="Shantal" 
                  // Using object-cover ensures her photo fills the circle perfectly
                  className="w-full h-full object-cover"
                />
              </motion.div>
              {/* --------------------------------------------- */}

              {/* Right Sticker: loopy2.png */}
              <motion.div 
                initial={{ rotate: 15, scale: 0 }}
                animate={{ rotate: 15, scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="w-24 h-24 md:w-32 md:h-32 shrink-0"
              >
                <img 
                  src="/background-stickers/loopy2.png" 
                  alt="Loopy Sticker" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </div>
            
            <div className="space-y-2 pt-4">
              <CardTitle className="text-5xl md:text-6xl font-bold text-stone-800 tracking-tight font-[family-name:var(--font-handwritten)]">
                Shantal's Vault
              </CardTitle>
              <CardDescription className="text-stone-400 text-xl italic font-serif">
                "A secret place for our love letters."
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-8 pb-12 pt-6 px-6 md:px-16">
            <Button 
              onClick={handleLogin}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-10 rounded-2xl text-2xl transition-all active:scale-95 shadow-lg shadow-rose-200 group"
            >
              <span className="flex items-center gap-3">
                Sign in with Google
                <span className="group-hover:translate-x-1 transition-transform">💌</span>
              </span>
            </Button>
            
            <div className="border-t border-stone-100 pt-8 text-center">
              <p className="text-[12px] text-stone-300 uppercase tracking-[0.5em] font-bold">
                From Andrei with Love
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Background Decoration */}
      <div className="fixed bottom-0 left-0 p-8 pointer-events-none opacity-20 hidden sm:block">
        <Heart className="w-24 h-24 text-white rotate-12" />
      </div>
      <div className="fixed top-0 right-0 p-8 pointer-events-none opacity-20 hidden sm:block">
        <Heart className="w-16 h-16 text-white -rotate-12" />
      </div>
    </div>
  );
}