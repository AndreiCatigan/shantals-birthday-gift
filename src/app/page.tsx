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
import { useRouter } from "next/navigation";

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

  // 1. Fetch letters from Supabase
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

  // 2. Delete Logic
  const confirmDelete = async () => {
    if (!letterToDelete) return;
    setIsDeleting(true);

    try {
      // Cleanup images from storage first
      if (letterToDelete.images && letterToDelete.images.length > 0) {
        for (const url of letterToDelete.images) {
          const path = url.split('letter-images/')[1];
          if (path) {
            await supabase.storage.from('letter-images').remove([path]);
          }
        }
      }

      const { error } = await supabase
        .from('letters')
        .delete()
        .eq('id', letterToDelete.id);

      if (error) throw error;

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
      
      {/* --- SIGN OUT (TOP LEFT) --- */}
      <div className="max-w-5xl mx-auto flex justify-start mb-6 md:mb-8">
        <Button 
          variant="ghost" 
          onClick={handleSignOut} 
          className="rounded-full text-stone-400 hover:text-rose-500 hover:bg-rose-50 gap-2 px-3 md:px-4 text-xs md:text-sm"
        >
          <LogOut className="w-3.5 h-3.5 md:w-4 h-4" />
          Sign Out
        </Button>
      </div>

      <div className="max-w-5xl mx-auto">
        
        {/* --- MAIN HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 border-b border-rose-100 pb-6 gap-6">
            <div className="w-full md:w-auto">
                {/* Corrected margin to align perfectly with Drafts page title */}
                <div className="flex items-center gap-2 mb-1 md:-mt-2">
                  <FolderHeart className="text-rose-500 w-5 h-5 md:w-6 h-6" />
                  <span className="text-[10px] md:text-xs uppercase tracking-widest text-stone-400 font-bold">Private Vault</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-stone-800 font-[family-name:var(--font-handwritten)]">
                  Your Letters
                </h1>
            </div>
            
            {/* Buttons Group */}
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
                  <Button className="w-full bg-rose-500 hover:bg-rose-600 rounded-full px-6 shadow-lg shadow-rose-200 gap-2 h-10 md:h-11 transition-transform active:scale-95">
                      <Plus className="w-4 h-4" />
                      <span className="text-xs md:text-sm">Write New Letter</span>
                  </Button>
                </Link>
            </div>
        </header>

        {/* --- LETTERS GRID --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <Loader2 className="w-8 h-8 md:w-10 h-10 animate-spin mb-4" />
            <p className="font-serif italic text-sm md:text-base text-stone-300">Unlocking the vault...</p>
          </div>
        ) : letters.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-[2rem] bg-stone-100/30">
             <p className="text-stone-400 font-serif italic text-lg mb-4 px-6">The vault is currently empty. Start writing your first letter to Shantal!</p>
             <Link href="/dashboard/create">
               <Button variant="link" className="text-rose-500 font-bold tracking-widest text-xs uppercase underline-offset-8">
                 WRITE THE FIRST ONE 💌
               </Button>
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
            {letters.map((letter) => (
              <motion.div 
                key={letter.id}
                whileHover={isDeleteMode ? { scale: 1.02 } : { y: -10 }}
                onClick={() => isDeleteMode ? setLetterToDelete(letter) : setSelectedLetter(letter)}
                className="relative cursor-pointer group"
              >
                <div className={`bg-[#fdfcf0] w-full aspect-[4/3] shadow-md rounded-sm border transition-colors relative overflow-hidden flex flex-col justify-center items-center p-6 ${isDeleteMode ? 'border-rose-300 ring-2 ring-rose-100' : 'border-stone-200'}`}>
                  
                  {isDeleteMode && (
                    <div className="absolute inset-0 bg-rose-50/40 flex items-center justify-center z-30">
                      <div className="bg-white p-2 rounded-full shadow-lg border border-rose-200">
                        <Trash2 className="w-5 h-5 md:w-6 h-6 text-rose-500" />
                      </div>
                    </div>
                  )}

                  {/* Envelope Flap Detail */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-stone-100/30 border-b border-stone-200/50" 
                       style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                  
                  <h2 className="text-lg md:text-xl font-semibold text-stone-700 text-center z-10 line-clamp-1 px-4">{letter.title}</h2>
                  <p className="text-[10px] text-stone-400 mt-2 z-10 uppercase tracking-widest">{formatDate(letter.created_at)}</p>
                  
                  {/* Wax Seal Detail */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 md:w-10 md:h-10 bg-rose-600 rounded-full shadow-inner border-2 border-rose-700 flex items-center justify-center z-20 group-hover:scale-110 transition-transform">
                     <span className="text-white text-[10px] md:text-xs font-serif italic">
                       {letter.sender_name?.charAt(0) || 'S'}
                     </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. Delete Confirmation Modal */}
      <AnimatePresence>
        {letterToDelete && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-rose-500 w-6 h-6 md:w-8 h-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-stone-800 mb-2">Are you sure?</h3>
              <p className="text-sm md:text-base text-stone-500 mb-6 md:mb-8 font-serif italic">
                You are about to remove "<span className="font-bold text-stone-700">{letterToDelete.title}</span>". This memory will be gone forever.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="bg-rose-500 hover:bg-rose-600 rounded-full py-5 md:py-6 text-base md:text-lg"
                >
                  {isDeleting ? <Loader2 className="animate-spin" /> : "Yes, Delete Forever"}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setLetterToDelete(null)}
                  className="rounded-full text-stone-400"
                >
                  No, Keep It
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Expanded Letter Modal */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-3 md:p-6"
          >
            <div className="absolute inset-0" onClick={() => {setSelectedLetter(null); setCurrentImgIndex(0);}} />
            <motion.div 
              className="bg-[#fdfcf0] w-full max-w-5xl max-h-[90vh] md:max-h-[85vh] rounded-[1.5rem] md:rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden relative border border-white/20 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => { setSelectedLetter(null); setCurrentImgIndex(0); }} 
                className="absolute top-4 right-4 md:top-6 md:right-6 z-30 p-2 bg-white/80 md:bg-white/50 hover:bg-rose-100 rounded-full shadow-md"
              >
                <X className="w-5 h-5 md:w-6 h-6" />
              </button>

              {/* Text Side */}
              <div className="flex-1 p-6 md:p-12 lg:p-16 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')]">
                <span className="text-rose-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                  {formatDate(selectedLetter.created_at)}
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-stone-800 mt-2 md:mt-4 mb-6 md:mb-8 font-[family-name:var(--font-handwritten)]">
                  {selectedLetter.title}
                </h2>
                <div className="prose prose-stone max-w-none">
                  <p className="text-base md:text-xl text-stone-700 whitespace-pre-wrap font-serif italic leading-relaxed">
                    {selectedLetter.content}
                  </p>
                </div>
                <div className="mt-8 md:mt-12">
                   <p className="font-[family-name:var(--font-handwritten)] text-2xl md:text-3xl text-rose-500">
                     With love, {selectedLetter.sender_name}
                   </p>
                </div>
              </div>

              {/* Image Side (Polaroid) */}
              {selectedLetter.images && selectedLetter.images.length > 0 && (
                <div className="w-full md:w-[42%] bg-stone-100/40 p-6 md:p-10 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-stone-200">
                  <div className="relative w-full max-w-[260px] md:max-w-[320px] aspect-[4/5] bg-white p-3 md:p-4 shadow-xl rotate-1 border border-stone-100 flex flex-col shrink-0">
                    <div className="flex-1 overflow-hidden relative bg-stone-200 rounded-sm">
                      <img 
                        src={selectedLetter.images[currentImgIndex]} 
                        alt="Memory" 
                        className="w-full h-full object-cover" 
                      />
                      {selectedLetter.images.length > 1 && (
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2">
                          <button 
                            onClick={() => setCurrentImgIndex(i => i > 0 ? i - 1 : selectedLetter.images.length - 1)} 
                            className="bg-white/90 p-1.5 rounded-full shadow-md active:scale-90"
                          >
                            <ChevronLeft className="w-4 h-4 md:w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setCurrentImgIndex(i => i < selectedLetter.images.length - 1 ? i + 1 : 0)} 
                            className="bg-white/90 p-1.5 rounded-full shadow-md active:scale-90"
                          >
                            <ChevronRight className="w-4 h-4 md:w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 md:mt-4 text-center text-stone-400 font-serif italic text-xs md:text-sm tracking-wide">
                       {selectedLetter.images.length > 1 ? `Memory ${currentImgIndex + 1}/${selectedLetter.images.length}` : 'Special Memory'}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}