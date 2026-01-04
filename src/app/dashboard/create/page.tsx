"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ImagePlus, X, Loader2 } from "lucide-react";
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
  const [isDrafting, setIsDrafting] = useState(false); // Added for draft loading state
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("id");

  // Load draft if ID is present
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

  // The logic for both Sealing and Saving Draft
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
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
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
    <div className="min-h-screen bg-stone-100 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="text-stone-500 hover:text-rose-600 gap-2 rounded-full">
            <ArrowLeft className="w-4 h-4" />
            Back to Vault
          </Button>
        </Link>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleSaveLetter(true)}
            disabled={isDrafting || isSealing}
            className="rounded-full border-rose-200 text-rose-500 hover:bg-rose-50"
          >
            {isDrafting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Draft"}
          </Button>
          <Button 
            onClick={() => handleSaveLetter(false)}
            disabled={isSealing || isDrafting}
            className="bg-rose-500 hover:bg-rose-600 rounded-full px-8 shadow-md min-w-[140px]"
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

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-4xl bg-[#fdfcf0] min-h-[85vh] shadow-2xl rounded-sm border border-stone-200 p-8 md:p-16 relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')]" />
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="border-b border-rose-100 pb-6 mb-10">
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title of your memory..."
              className="w-full bg-transparent border-none outline-none text-4xl font-bold text-stone-800 placeholder:text-stone-300 font-[family-name:var(--font-handwritten)]"
            />
          </div>

          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your heart out here..."
            className="flex-1 w-full bg-transparent border-none outline-none text-xl text-stone-700 leading-relaxed placeholder:text-stone-200 font-serif italic resize-none min-h-[400px]"
          />

          <div className="mt-12 pt-8 border-t border-stone-100">
            <p className="text-stone-400 text-xs uppercase tracking-widest mb-4 font-bold">Attached Memories</p>
            <div className="flex flex-wrap gap-4">
              <AnimatePresence>
                {previews.map((url, index) => (
                  <motion.div key={url} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative w-32 aspect-[3/4] bg-white p-1 shadow-md border border-stone-100">
                    <img src={url} className="w-full h-full object-cover rounded-sm" alt="Memory" />
                    <button onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg hover:bg-rose-600 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button onClick={() => fileInputRef.current?.click()} className="w-32 aspect-[3/4] border-2 border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center text-stone-300 hover:text-rose-400 hover:border-rose-200 hover:bg-rose-50/30 transition-all group">
                <ImagePlus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">ADD PHOTO</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}