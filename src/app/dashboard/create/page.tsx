"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ImagePlus, X, Loader2, Smile } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

// Updated Sticker List from /public/stickers/
const AVAILABLE_STICKERS = [
  { id: 'bday-icon', url: '/stickers/bday-icon.png' },
  { id: 'loopy1', url: '/stickers/loopy1.png' },
  { id: 'loopy2', url: '/stickers/loopy2.png' },
  { id: 'loopy3', url: '/stickers/loopy3.png' },
  { id: 'loopy4', url: '/stickers/loopy4.png' },
  { id: 'melody1', url: '/stickers/melody1.png' },
  { id: 'melody2', url: '/stickers/melody2.png' },
  { id: 'melody3', url: '/stickers/melody3.png' },
  { id: 'melody4', url: '/stickers/melody4.png' },
];

export default function CreateLetterPage() {
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
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
          setSelectedSticker(data.sticker_id || null);
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
    if (!title && !isDraft) return alert("Please add a title! ❤️");
    isDraft ? setIsDrafting(true) : setIsSealing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const uploadedImageUrls: string[] = [...previews.filter(url => url.startsWith('http'))];

      for (const file of selectedFiles) {
        const filePath = `${user.id}/${Math.random()}.${file.name.split('.').pop()}`;
        await supabase.storage.from('letter-images').upload(filePath, file);
        const { data: { publicUrl } } = supabase.storage.from('letter-images').getPublicUrl(filePath);
        uploadedImageUrls.push(publicUrl);
      }

      const letterData = {
        title: title || "Untitled Draft",
        content,
        user_id: user.id,
        sender_name: user.email === "andreicatigan@gmail.com" ? "Andrei" : "Shantal",
        is_draft: isDraft,
        images: uploadedImageUrls,
        sticker_id: selectedSticker,
      };

      const { error: dbError } = draftId 
        ? await supabase.from('letters').update(letterData).eq('id', draftId)
        : await supabase.from('letters').insert(letterData);

      if (dbError) throw dbError;
      router.push(isDraft ? "/dashboard/drafts" : "/dashboard");
      router.refresh();
    } catch (error) { console.error(error); } finally {
      setIsDrafting(false);
      setIsSealing(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 p-3 sm:p-6 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 gap-4">
        <Link href="/dashboard" className="self-start sm:self-auto">
          <Button variant="ghost" className="text-stone-500 hover:text-rose-600 gap-2 rounded-full px-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Vault</span>
          </Button>
        </Link>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => handleSaveLetter(true)} disabled={isDrafting || isSealing} className="flex-1 sm:flex-none rounded-full border-rose-200 text-rose-500 h-10">
            {isDrafting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Draft"}
          </Button>
          <Button onClick={() => handleSaveLetter(false)} disabled={isSealing || isDrafting} className="flex-1 sm:flex-none bg-rose-500 hover:bg-rose-600 text-white rounded-full px-8 h-10 shadow-md">
            {isSealing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Seal Letter 💌"}
          </Button>
        </div>
      </div>

      <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-4xl bg-[#fdfcf0] min-h-[80vh] md:min-h-[85vh] shadow-2xl rounded-sm border border-stone-200 p-6 sm:p-10 md:p-16 relative overflow-hidden mb-10">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')]" />
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="border-b border-rose-100 pb-4 mb-6 md:mb-10 flex justify-between items-end">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title..." className="flex-1 bg-transparent border-none outline-none text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 font-[family-name:var(--font-handwritten)]" />
            {selectedSticker && (
              <img 
                src={AVAILABLE_STICKERS.find(s => s.id === selectedSticker)?.url} 
                className="w-12 h-12 md:w-16 md:h-16 object-contain rotate-6"
                alt="Selected sticker"
              />
            )}
          </div>

          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Start writing..." className="flex-1 w-full bg-transparent border-none outline-none text-base sm:text-lg md:text-xl text-stone-700 font-serif italic resize-none min-h-[350px]" />
          
          {/* Sticker Selection UI */}
          <div className="mt-8 pt-6 border-t border-stone-100">
            <div className="flex items-center gap-2 mb-4">
              <Smile className="w-4 h-4 text-stone-400" />
              <p className="text-stone-400 text-[10px] md:text-xs uppercase tracking-widest font-bold">Decorate your envelope</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {AVAILABLE_STICKERS.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => setSelectedSticker(selectedSticker === sticker.id ? null : sticker.id)}
                  className={`p-1.5 rounded-xl border-2 transition-all ${selectedSticker === sticker.id ? 'border-rose-500 bg-rose-50 scale-110' : 'border-transparent bg-stone-50 hover:bg-stone-100'}`}
                >
                  <img src={sticker.url} className="w-8 h-8 md:w-10 md:h-10 object-contain" alt="Sticker" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-100 flex flex-wrap gap-3">
            <AnimatePresence>
              {previews.map((url, index) => (
                <motion.div key={url} className="relative w-24 sm:w-28 md:w-32 aspect-[3/4] bg-white p-1 shadow-md border"><img src={url} className="w-full h-full object-cover rounded-sm" /><button onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1"><X className="w-3 h-3" /></button></motion.div>
              ))}
            </AnimatePresence>
            <button onClick={() => fileInputRef.current?.click()} className="w-24 sm:w-28 md:w-32 aspect-[3/4] border-2 border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center text-stone-300 hover:text-rose-400"><ImagePlus className="w-6 h-6 mb-2" /><span className="text-[8px] md:text-[10px] font-bold">ADD PHOTO</span></button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}