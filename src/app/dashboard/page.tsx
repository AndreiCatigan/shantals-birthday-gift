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
    <div className="min-h-screen bg-stone-50 p-6 md:p-12 relative overflow-x-hidden">
      
      {/* --- TOP NAVIGATION BAR (Standalone Sign Out) --- */}
      <div className="max-w-5xl mx-auto flex justify-start mb-8">
        <Button 
          variant="ghost" 
          onClick={handleSignOut} 
          className="rounded-full text-stone-400 hover:text-rose-500 hover:bg-rose-50 gap-2 px-4"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>

      <div className="max-w-5xl mx-auto">
        
        {/* --- MAIN HEADER --- */}
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
            
            <div className="flex flex-wrap gap-3">
                <Button 
                  variant={isDeleteMode ? "destructive" : "ghost"}
                  onClick={() => setIsDeleteMode(!isDeleteMode)}
                  className={`rounded-full gap-2 transition-all ${!isDeleteMode ? 'text-stone-400 hover:text-rose-500' : ''}`}
                >
                    <Trash2 className="w-4 h-4" />
                    {isDeleteMode ? "Cancel" : "Manage"}
                </Button>

                <Link href="/dashboard/drafts">
                  <Button variant="outline" className="rounded-full border-rose-200 text-rose-500 hover:bg-rose-50 gap-2">
                      <FileText className="w-4 h-4" />
                      Drafts
                  </Button>
                </Link>

                <Link href="/dashboard/create">
                  <Button className="bg-rose-500 hover:bg-rose-600 rounded-full px-6 shadow-lg shadow-rose-200 gap-2 transition-transform active:scale-95">
                      <Plus className="w-4 h-4" />
                      Write New Letter
                  </Button>
                </Link>
            </div>
        </header>

        {/* --- GRID & STATES --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-serif italic">Unlocking the vault...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
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
                        <Trash2 className="w-6 h-6 text-rose-500" />
                      </div>
                    </div>
                  )}

                  <div className="absolute top-0 left-0 w-full h-1/2 bg-stone-100/30 border-b border-stone-200/50" 
                       style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                  <h2 className="text-xl font-semibold text-stone-700 text-center z-10 line-clamp-1 px-4">{letter.title}</h2>
                  <p className="text-[10px] text-stone-400 mt-2 z-10 uppercase tracking-widest">{formatDate(letter.created_at)}</p>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-rose-600 rounded-full shadow-inner border-2 border-rose-700 flex items-center justify-center z-20 group-hover:scale-110 transition-transform">
                     <span className="text-white text-xs font-serif italic">{letter.sender_name?.charAt(0) || 'S'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {letterToDelete && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-rose-500 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mb-2">Are you sure?</h3>
              <p className="text-stone-500 mb-8 font-serif italic">
                You are about to remove "<span className="font-bold text-stone-700">{letterToDelete.title}</span>". This memory will be gone forever.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="bg-rose-500 hover:bg-rose-600 rounded-full py-6 text-lg"
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

      <AnimatePresence>
        {selectedLetter && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
          >
            <div className="absolute inset-0" onClick={() => setSelectedLetter(null)} />
            <motion.div 
              className="bg-[#fdfcf0] w-full max-w-5xl max-h-[85vh] rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden relative border border-white/20 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSelectedLetter(null)} className="absolute top-6 right-6 z-30 p-2 bg-white/50 hover:bg-rose-100 rounded-full">
                <X className="w-6 h-6" />
              </button>

              <div className="flex-1 p-8 md:p-12 lg:p-16 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')]">
                <span className="text-rose-400 font-bold uppercase tracking-widest text-xs">{formatDate(selectedLetter.created_at)}</span>
                <h2 className="text-4xl md:text-5xl font-bold text-stone-800 mt-4 mb-8 font-[family-name:var(--font-handwritten)]">
                  {selectedLetter.title}
                </h2>
                <p className="text-lg md:text-xl text-stone-700 whitespace-pre-wrap font-serif italic">
                  {selectedLetter.content}
                </p>
                <div className="mt-12">
                   <p className="font-[family-name:var(--font-handwritten)] text-3xl text-rose-500">
                     With love, {selectedLetter.sender_name}
                   </p>
                </div>
              </div>

              {selectedLetter.images && selectedLetter.images.length > 0 && (
                <div className="w-full md:w-[42%] bg-stone-100/40 p-6 md:p-10 flex flex-col items-center justify-center border-l border-stone-200">
                  <div className="relative w-full max-w-[320px] aspect-[4/5] bg-white p-4 shadow-xl rotate-1 border border-stone-100 flex flex-col">
                    <div className="flex-1 overflow-hidden relative bg-stone-200 rounded-sm">
                      <img src={selectedLetter.images[currentImgIndex]} alt="Memory" className="w-full h-full object-cover" />
                      {selectedLetter.images.length > 1 && (
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2">
                          <button onClick={() => setCurrentImgIndex(i => i > 0 ? i - 1 : selectedLetter.images.length - 1)} className="bg-white/90 p-1 rounded-full shadow-md"><ChevronLeft/></button>
                          <button onClick={() => setCurrentImgIndex(i => i < selectedLetter.images.length - 1 ? i + 1 : 0)} className="bg-white/90 p-1 rounded-full shadow-md"><ChevronRight/></button>
                        </div>
                      )}
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