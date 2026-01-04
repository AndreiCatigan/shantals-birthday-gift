"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, FolderHeart, X, ChevronLeft, ChevronRight, 
  FileText, LogOut, Loader2, Trash2, AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation"; // Fixed the import here

// This map tells the front-end which image to show for each ID in the database
const STICKER_MAP: Record<string, string> = {
  'bday-icon': '/stickers/bday-icon.png',
  'loopy1': '/stickers/loopy1.png',
  'loopy2': '/stickers/loopy2.png',
  'loopy3': '/stickers/loopy3.png',
  'loopy4': '/stickers/loopy4.png',
  'melody1': '/stickers/melody1.png',
  'melody2': '/stickers/melody2.png',
  'melody3': '/stickers/melody3.png',
  'melody4': '/stickers/melody4.png',
};

export default function DashboardPage() {
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchLetters();
  }, [supabase]);

  const fetchLetters = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('is_draft', false)
      .order('created_at', { ascending: false });

    if (!error) setLetters(data || []);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const confirmDelete = async () => {
    if (!letterToDelete) return;
    setIsDeleting(true);
    try {
      // 1. Delete from Database
      const { error: dbError } = await supabase.from('letters').delete().eq('id', letterToDelete.id);
      if (dbError) throw dbError;

      // 2. Cleanup Storage
      if (letterToDelete.images && letterToDelete.images.length > 0) {
        for (const url of letterToDelete.images) {
          const path = url.split('letter-images/')[1];
          if (path) await supabase.storage.from('letter-images').remove([path]);
        }
      }

      setLetters(letters.filter(l => l.id !== letterToDelete.id));
      setLetterToDelete(null);
      setIsDeleteMode(false);
    } catch (err) { 
      console.error(err); 
      alert("Failed to delete the letter.");
    } finally { 
      setIsDeleting(false); 
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-6 md:p-12 relative overflow-x-hidden">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <div className="max-w-5xl mx-auto flex justify-start mb-6 md:mb-8">
        <Button variant="ghost" onClick={handleSignOut} className="rounded-full text-stone-400 hover:text-rose-500 hover:bg-rose-50 gap-2 px-3 text-xs md:text-sm">
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </Button>
      </div>

      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 border-b border-rose-100 pb-6 gap-6">
            <div className="w-full md:w-auto">
                <div className="flex items-center gap-2 mb-2">
                <FolderHeart className="text-rose-500 w-5 h-5 md:w-6 h-6" />
                <span className="text-[10px] md:text-xs uppercase tracking-widest text-stone-400 font-bold">Private Vault</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-stone-800 font-[family-name:var(--font-handwritten)]">Your Letters</h1>
            </div>
            
            <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
                <Button 
                  variant={isDeleteMode ? "destructive" : "ghost"} 
                  onClick={() => setIsDeleteMode(!isDeleteMode)} 
                  className={`rounded-full gap-2 transition-all flex-1 md:flex-none h-10 md:h-11 ${!isDeleteMode ? 'text-stone-400 hover:text-rose-500' : ''}`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-xs md:text-sm">{isDeleteMode ? "Cancel" : "Manage"}</span>
                </Button>
                <Link href="/dashboard/drafts" className="flex-1 md:flex-none">
                  <Button variant="outline" className="w-full rounded-full border-rose-200 text-rose-500 hover:bg-rose-50 gap-2 h-10 md:h-11">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs md:text-sm">Drafts</span>
                  </Button>
                </Link>
                <Link href="/dashboard/create" className="w-full md:w-auto">
                  <Button className="w-full bg-rose-500 hover:bg-rose-600 rounded-full px-6 shadow-lg shadow-rose-200 gap-2 h-10 md:h-11 text-white font-bold">
                    <Plus className="w-4 h-4" />
                    <span className="text-xs md:text-sm">Write New Letter</span>
                  </Button>
                </Link>
            </div>
        </header>

        {/* --- LETTERS GRID --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400"><Loader2 className="animate-spin mb-4" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
            {letters.map((letter) => (
              <motion.div 
                key={letter.id} 
                whileHover={isDeleteMode ? { scale: 1.02 } : { y: -10 }} 
                onClick={() => {
                  if (isDeleteMode) {
                    setLetterToDelete(letter);
                  } else {
                    setSelectedLetter(letter);
                  }
                }} 
                className="relative cursor-pointer group"
              >
                <div className={`bg-[#fdfcf0] w-full aspect-[4/3] shadow-md rounded-sm border transition-colors relative overflow-hidden flex flex-col justify-center items-center p-6 ${isDeleteMode ? 'border-rose-300 ring-2 ring-rose-100' : 'border-stone-200'}`}>
                  
                  {/* DISPLAY STICKER ON ENVELOPE (TOP LEFT) */}
                  {letter.sticker_id && STICKER_MAP[letter.sticker_id] && (
                    <img 
                      src={STICKER_MAP[letter.sticker_id]} 
                      className="absolute top-2 left-2 w-10 h-10 md:w-14 md:h-14 object-contain z-20 -rotate-12 drop-shadow-md" 
                      alt="Sticker" 
                    />
                  )}

                  {isDeleteMode && (
                    <div 
                      className="absolute inset-0 bg-rose-50/60 flex items-center justify-center z-30"
                      onClick={(e) => { e.stopPropagation(); setLetterToDelete(letter); }}
                    >
                      <div className="bg-white p-3 rounded-full shadow-xl border border-rose-200">
                        <Trash2 className="w-6 h-6 text-rose-500" />
                      </div>
                    </div>
                  )}

                  <div className="absolute top-0 left-0 w-full h-1/2 bg-stone-100/30 border-b border-stone-200/50" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                  <h2 className="text-lg md:text-xl font-semibold text-stone-700 text-center z-10 line-clamp-1 px-4">{letter.title}</h2>
                  <p className="text-[10px] text-stone-400 mt-2 z-10 uppercase tracking-widest">{formatDate(letter.created_at)}</p>
                  
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 md:w-10 md:h-10 bg-rose-600 rounded-full shadow-inner border-2 border-rose-700 flex items-center justify-center z-20 group-hover:scale-110 transition-transform">
                     <span className="text-white text-[10px] md:text-xs font-serif italic">{letter.sender_name?.charAt(0) || 'S'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      
      {/* Expanded Letter View */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-3 md:p-6">
            <div className="absolute inset-0" onClick={() => setSelectedLetter(null)} />
            <motion.div className="bg-[#fdfcf0] w-full max-w-5xl max-h-[90vh] md:max-h-[85vh] rounded-[1.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden relative border border-white/20 z-10" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedLetter(null)} className="absolute top-4 right-4 md:top-6 md:right-6 z-30 p-2 bg-white/80 rounded-full shadow-md"><X className="w-5 h-5" /></button>

              <div className="flex-1 p-6 md:p-12 lg:p-16 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')]">
                <span className="text-rose-400 font-bold uppercase tracking-widest text-[10px]">{formatDate(selectedLetter.created_at)}</span>
                
                <div className="flex justify-between items-start mt-2 mb-6 border-b border-rose-100 pb-4">
                  <h2 className="text-3xl md:text-5xl font-bold text-stone-800 font-[family-name:var(--font-handwritten)] leading-tight">{selectedLetter.title}</h2>
                  {/* DISPLAY STICKER INSIDE THE LETTER */}
                  {selectedLetter.sticker_id && STICKER_MAP[selectedLetter.sticker_id] && (
                    <img src={STICKER_MAP[selectedLetter.sticker_id]} className="w-16 h-16 md:w-20 md:h-20 object-contain rotate-6" alt="Sticker" />
                  )}
                </div>

                <p className="text-base md:text-xl text-stone-700 whitespace-pre-wrap font-serif italic leading-relaxed">{selectedLetter.content}</p>
                <div className="mt-8"><p className="font-[family-name:var(--font-handwritten)] text-2xl text-rose-500">With love, {selectedLetter.sender_name}</p></div>
              </div>

              {selectedLetter.images && selectedLetter.images.length > 0 && (
                <div className="w-full md:w-[42%] bg-stone-100/40 p-6 flex items-center justify-center border-t md:border-l border-stone-200">
                  <div className="relative w-full max-w-[260px] aspect-[4/5] bg-white p-3 shadow-xl rotate-1">
                    <img src={selectedLetter.images[currentImgIndex]} className="w-full h-full object-cover rounded-sm" alt="Memory" />
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {letterToDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[1.5rem] p-6 md:p-8 max-w-sm w-full shadow-2xl text-center">
              <AlertTriangle className="text-rose-500 w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold text-stone-800 mb-2">Are you sure?</h3>
              <p className="text-sm md:text-base text-stone-500 mb-6 font-serif italic">This memory will be gone forever.</p>
              <div className="flex flex-col gap-3">
                <Button onClick={confirmDelete} disabled={isDeleting} className="bg-rose-500 hover:bg-rose-600 text-white rounded-full py-5 md:py-6 text-base font-bold">{isDeleting ? <Loader2 className="animate-spin" /> : "Yes, Delete Forever"}</Button>
                <Button variant="ghost" onClick={() => setLetterToDelete(null)} className="rounded-full text-stone-400">Cancel</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}