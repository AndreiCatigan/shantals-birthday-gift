"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FolderHeart, X, ChevronLeft, ChevronRight, FileText, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

// Mock Data for the Vault
const mockLetters = [
  { 
    id: 1, 
    date: "Jan 01, 2026", 
    title: "Our New Chapter", 
    sender: "Andrei",
    content: "Starting this year with you feels like a dream. I can't wait to see what adventures we have together. You are my greatest blessing.",
    images: ["/api/placeholder/400/500", "/api/placeholder/400/501"] 
  },
  { 
    id: 2, 
    date: "Dec 25, 2025", 
    title: "Christmas Morning", 
    sender: "Shantal",
    content: "The best gift wasn't under the tree, it was waking up next to you. Thank you for making every day feel like a holiday.",
    images: ["/api/placeholder/400/502"] 
  },
];

export default function DashboardPage() {
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12 relative overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-rose-100 pb-6 gap-4">
            <div>
                <div className="flex items-center gap-2 mb-2">
                <FolderHeart className="text-rose-500 w-6 h-6" />
                <span className="text-xs uppercase tracking-widest text-stone-400 font-bold">Private Vault</span>
                </div>
                <h1 className="text-4xl font-bold text-stone-800 font-[family-name:var(--font-handwritten)]">
                Your Letters
                </h1>
            </div>
            
            <div className="flex gap-3">
                {/* Logout Button */}
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut}
                  className="rounded-full text-stone-400 hover:text-rose-500 hover:bg-rose-50 gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </Button>

                {/* Drafts Link */}
                <Link href="/dashboard/drafts">
                  <Button variant="outline" className="rounded-full border-rose-200 text-rose-500 hover:bg-rose-50 gap-2">
                      <FileText className="w-4 h-4" />
                      Drafts
                  </Button>
                </Link>

                {/* Create New Letter Link */}
                <Link href="/dashboard/create">
                  <Button className="bg-rose-500 hover:bg-rose-600 rounded-full px-6 shadow-lg shadow-rose-200 gap-2 transition-transform active:scale-95">
                      <Plus className="w-4 h-4" />
                      Write New Letter
                  </Button>
                </Link>
            </div>
        </header>

        {/* Grid of Envelopes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {mockLetters.map((letter) => (
            <motion.div 
              key={letter.id}
              whileHover={{ y: -10 }}
              onClick={() => setSelectedLetter(letter)}
              className="relative cursor-pointer group"
            >
              <div className="bg-[#fdfcf0] w-full aspect-[4/3] shadow-md rounded-sm border border-stone-200 relative overflow-hidden flex flex-col justify-center items-center p-6">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-stone-100/30 border-b border-stone-200/50" 
                     style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                <h2 className="text-xl font-semibold text-stone-700 text-center z-10">{letter.title}</h2>
                <p className="text-[10px] text-stone-400 mt-2 z-10 uppercase tracking-widest">{letter.date}</p>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-rose-600 rounded-full shadow-inner border-2 border-rose-700 flex items-center justify-center z-20 group-hover:scale-110 transition-transform">
                   <span className="text-white text-xs font-serif italic">S</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Expanded Letter View (Modal) */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
          >
            <div className="absolute inset-0" onClick={() => setSelectedLetter(null)} />

            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
              className="bg-[#fdfcf0] w-full max-w-5xl max-h-[85vh] rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden relative border border-white/20 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => { setSelectedLetter(null); setCurrentImgIndex(0); }}
                className="absolute top-6 right-6 z-30 p-2 bg-white/50 hover:bg-rose-100 text-stone-600 hover:text-rose-600 rounded-full transition-colors shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Letter Content Side */}
              <div className="flex-1 p-8 md:p-12 lg:p-16 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')]">
                <span className="text-rose-400 font-bold uppercase tracking-widest text-xs">{selectedLetter.date}</span>
                <h2 className="text-4xl md:text-5xl font-bold text-stone-800 mt-4 mb-8 font-[family-name:var(--font-handwritten)]">
                  {selectedLetter.title}
                </h2>
                <div className="prose prose-stone max-w-none">
                  <p className="text-lg md:text-xl text-stone-700 leading-relaxed whitespace-pre-wrap font-serif italic">
                    {selectedLetter.content}
                  </p>
                </div>
                <div className="mt-12">
                   <p className="font-[family-name:var(--font-handwritten)] text-3xl text-rose-500">
                     With love, {selectedLetter.sender}
                   </p>
                </div>
              </div>

              {/* Photo Frame Side */}
              <div className="w-full md:w-[42%] bg-stone-100/40 p-6 md:p-10 flex flex-col items-center justify-center border-l border-stone-200">
                <div className="relative w-full max-w-[320px] aspect-[4/5] bg-white p-4 shadow-xl rotate-1 border border-stone-100 flex flex-col">
                  <div className="flex-1 overflow-hidden relative bg-stone-200 rounded-sm">
                    <img 
                      src={selectedLetter.images[currentImgIndex]} 
                      alt="Captured Memory" 
                      className="w-full h-full object-cover"
                    />
                    
                    {selectedLetter.images.length > 1 && (
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2">
                        <button 
                          onClick={() => setCurrentImgIndex((prev) => (prev > 0 ? prev - 1 : selectedLetter.images.length - 1))}
                          className="bg-white/90 p-1.5 rounded-full shadow-md hover:bg-white"
                        >
                          <ChevronLeft className="w-5 h-5 text-stone-700" />
                        </button>
                        <button 
                          onClick={() => setCurrentImgIndex((prev) => (prev < selectedLetter.images.length - 1 ? prev + 1 : 0))}
                          className="bg-white/90 p-1.5 rounded-full shadow-md hover:bg-white"
                        >
                          <ChevronRight className="w-5 h-5 text-stone-700" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-center text-stone-400 font-serif italic text-sm tracking-wide">
                    {selectedLetter.images.length > 1 ? `Memory ${currentImgIndex + 1}/${selectedLetter.images.length}` : 'Special Memory'}
                  </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}