"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ImagePlus, X, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

export default function CreateLetterPage() {
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSealing, setIsSealing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("id");

  useEffect(() => {
    if (draftId) {
      const loadDraft = async () => {
        const { data, error } = await supabase
          .from('letters')
          .select('*')
          .eq('id', draftId)
          .single();
        
        if (data && !error) {
          setTitle(data.title);
          setContent(data.content);
          setPreviews(data.images || []);
        }
      };
      loadDraft();
    }
  }, [draftId, supabase]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles((prev) => [...prev, ...fileArray]);
      const newPreviews = fileArray.map(file => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveLetter = async (isDraft: boolean) => {
    if (!title && !isDraft) {
      alert("Please add a title before sealing! ❤️");
      return;
    }
    
    isDraft ? setIsDrafting(true) : setIsSealing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const uploadedImageUrls: string[] = [...previews.filter(url => url.startsWith('http'))];

      for (const file of selectedFiles) {
        const filePath = `${user.id}/${Math.random()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('letter-images').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('letter-images').getPublicUrl(filePath);
        uploadedImageUrls.push(publicUrl);
      }

      const letterData = {
        title: title || "Untitled Draft",
        content: content,
        user_id: user.id,
        sender_name: user.email === "andreicatigan@gmail.com" ? "Andrei" : "Shantal",
        is_draft: isDraft,
        images: uploadedImageUrls,
      };

      const { error: dbError } = draftId 
        ? await supabase.from('letters').update(letterData).eq('id', draftId)
        : await supabase.from('letters').insert(letterData);

      if (dbError) throw dbError;

      router.push(isDraft ? "/dashboard/drafts" : "/dashboard");
      router.refresh();
      
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    } finally {
      setIsDrafting(false);
      setIsSealing(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 p-3 sm:p-6 md:p-8 flex flex-col items-center">
      
      {/* --- Responsive Navigation Header --- */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 gap-4">
        <Link href="/dashboard" className="self-start sm:self-auto">
          <Button variant="ghost" className="text-stone-500 hover:text-rose-600 gap-2 rounded-full px-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Vault</span>
          </Button>
        </Link>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => handleSaveLetter(true)}
            disabled={isDrafting || isSealing}
            className="flex-1 sm:flex-none rounded-full border-rose-200 text-rose-500 hover:bg-rose-50 h-10 md:h-11"
          >
            {isDrafting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Draft"}
          </Button>
          <Button 
            onClick={() => handleSaveLetter(false)}
            disabled={isSealing || isDrafting}
            className="flex-1 sm:flex-none bg-rose-500 hover:bg-rose-600 rounded-full px-4 md:px-8 shadow-md h-10 md:h-11 transition-transform active:scale-95"
          >
            {isSealing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Seal Letter 💌"
            )}
          </Button>
        </div>
      </div>

      <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

      {/* --- Responsive Stationery Paper --- */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="w-full max-w-4xl bg-[#fdfcf0] min-h-[80vh] md:min-h-[85vh] shadow-2xl rounded-sm border border-stone-200 p-6 sm:p-10 md:p-16 relative overflow-hidden"
      >
        {/* Lined Paper Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')]" />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Title Header */}
          <div className="border-b border-rose-100 pb-4 md:pb-6 mb-6 md:mb-10">
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title..."
              className="w-full bg-transparent border-none outline-none text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 placeholder:text-stone-300 font-[family-name:var(--font-handwritten)]"
            />
          </div>

          {/* Writing Area */}
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="flex-1 w-full bg-transparent border-none outline-none text-base sm:text-lg md:text-xl text-stone-700 leading-relaxed placeholder:text-stone-200 font-serif italic resize-none min-h-[350px] md:min-h-[400px]"
          />

          {/* Picture Attachment Section */}
          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-stone-100">
            <p className="text-stone-400 text-[10px] md:text-xs uppercase tracking-widest mb-4 font-bold">Attached Memories</p>
            
            <div className="flex flex-wrap gap-3 md:gap-4">
              <AnimatePresence>
                {previews.map((url, index) => (
                  <motion.div 
                    key={url} 
                    initial={{ scale: 0.8, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0.8, opacity: 0 }} 
                    className="relative w-24 sm:w-28 md:w-32 aspect-[3/4] bg-white p-1 shadow-md border border-stone-100 shrink-0"
                  >
                    <img src={url} className="w-full h-full object-cover rounded-sm" alt="Memory" />
                    <button 
                      onClick={() => removeImage(index)} 
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg active:scale-90 transition-transform"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add Photo Button */}
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="w-24 sm:w-28 md:w-32 aspect-[3/4] border-2 border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center text-stone-300 hover:text-rose-400 hover:border-rose-200 hover:bg-rose-50/30 transition-all group shrink-0"
              >
                <ImagePlus className="w-6 h-6 md:w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[8px] md:text-[10px] font-bold">ADD PHOTO</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}