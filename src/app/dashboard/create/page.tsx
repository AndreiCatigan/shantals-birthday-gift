"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";

export default function CreateLetterPage() {
  // 1. State to store the local URLs of the photos
  const [previews, setPreviews] = useState<string[]>([]);
  // 2. A "Ref" to talk to the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Create temporary URLs so we can see the images immediately
      const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-stone-100 p-4 md:p-8 flex flex-col items-center">
      
      {/* Top Navigation */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="text-stone-500 hover:text-rose-600 gap-2 rounded-full">
            <ArrowLeft className="w-4 h-4" />
            Back to Vault
          </Button>
        </Link>
        
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full border-rose-200 text-rose-500 hover:bg-rose-50">
            Save Draft
          </Button>
          <Button className="bg-rose-500 hover:bg-rose-600 rounded-full px-8 shadow-md">
            Seal Letter 💌
          </Button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleImageChange}
      />

      {/* The Stationery Paper */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl bg-[#fdfcf0] min-h-[85vh] shadow-2xl rounded-sm border border-stone-200 p-8 md:p-16 relative"
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')]" />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="border-b border-rose-100 pb-6 mb-10">
            <input 
              type="text" 
              placeholder="Title of your memory..."
              className="w-full bg-transparent border-none outline-none text-4xl font-bold text-stone-800 placeholder:text-stone-300 font-[family-name:var(--font-handwritten)]"
            />
          </div>

          {/* Writing Area */}
          <textarea 
            placeholder="Start writing your heart out here..."
            className="flex-1 w-full bg-transparent border-none outline-none text-xl text-stone-700 leading-relaxed placeholder:text-stone-200 font-serif italic resize-none min-h-[400px]"
          />

          {/* Picture Section */}
          <div className="mt-12 pt-8 border-t border-stone-100">
            <p className="text-stone-400 text-xs uppercase tracking-widest mb-4 font-bold">Attached Memories</p>
            
            <div className="flex flex-wrap gap-4">
              {/* Show selected images */}
              <AnimatePresence>
                {previews.map((url, index) => (
                  <motion.div 
                    key={url}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative w-32 aspect-[3/4] bg-white p-1 shadow-md border border-stone-100"
                  >
                    <img src={url} className="w-full h-full object-cover rounded-sm" alt="Memory" />
                    <button 
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* The "Add Photo" Button - This triggers the hidden input */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-32 aspect-[3/4] border-2 border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center text-stone-300 hover:text-rose-400 hover:border-rose-200 hover:bg-rose-50/30 transition-all group"
              >
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