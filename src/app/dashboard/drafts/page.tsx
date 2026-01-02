"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Edit3, Trash2, Plus } from "lucide-react"; // Added 'Plus' here
import Link from "next/link";
import { motion } from "framer-motion";

// Mock Data for Drafts
const mockDrafts = [
  { id: 1, lastSaved: "2 mins ago", title: "Thinking of you...", preview: "Today I saw something that reminded me of that time we..." },
  { id: 2, lastSaved: "Yesterday", title: "Untitled Letter", preview: "I don't know how to start this but..." },
];

export default function DraftsPage() {
  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-12 border-b border-stone-200 pb-6">
          <div>
            <Link href="/dashboard">
              <Button variant="ghost" className="p-0 hover:bg-transparent text-stone-400 hover:text-rose-500 gap-2 mb-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Vault
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-stone-800 font-[family-name:var(--font-handwritten)]">
              Your Drafts
            </h1>
          </div>
        </header>

        {/* Drafts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockDrafts.map((draft) => (
            <motion.div 
              key={draft.id}
              whileHover={{ scale: 1.02 }}
              className="relative group"
            >
              <Card className="border-stone-200 shadow-sm bg-white overflow-hidden h-full flex flex-col">
                <CardContent className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                      Saved {draft.lastSaved}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-stone-800 mb-2">{draft.title}</h2>
                  <p className="text-stone-500 text-sm italic line-clamp-3">"{draft.preview}"</p>
                </CardContent>
                
                <div className="p-4 bg-stone-50 border-t border-stone-100">
                  <Link href="/dashboard/create">
                    <Button variant="ghost" className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 gap-2 text-sm font-bold">
                      <Edit3 className="w-4 h-4" />
                      CONTINUE WRITING
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
          
          {/* Empty Draft Slot - The 'Plus' icon is used here */}
          <Link href="/dashboard/create" className="group">
            <div className="border-2 border-dashed border-stone-200 rounded-xl h-full min-h-[200px] flex flex-col items-center justify-center text-stone-300 group-hover:border-rose-200 group-hover:text-rose-400 group-hover:bg-rose-50/30 transition-all">
              <Plus className="w-10 h-10 mb-2" />
              <span className="font-bold text-xs uppercase tracking-widest">Start New Draft</span>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}