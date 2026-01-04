"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Edit3, Trash2, Plus, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchDrafts = async () => {
      const { data, error } = await supabase
        .from('letters')
        .select('*')
        .eq('is_draft', true)
        .order('created_at', { ascending: false });
      
      if (!error) setDrafts(data || []);
      setLoading(false);
    };
    fetchDrafts();
  }, [supabase]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    await supabase.from('letters').delete().eq('id', deleteId);
    setDrafts(drafts.filter(d => d.id !== deleteId));
    setDeleteId(null);
    setIsDeleting(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
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

        {loading ? (
          <div className="flex justify-center py-20 text-stone-300"><Loader2 className="animate-spin w-10 h-10" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((draft) => (
              <motion.div key={draft.id} whileHover={{ scale: 1.02 }} className="relative group">
                <Card className="border-stone-200 shadow-sm bg-white overflow-hidden h-full flex flex-col">
                  <CardContent className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                        Saved {new Date(draft.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button onClick={() => setDeleteId(draft.id)} variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-stone-800 mb-2">{draft.title}</h2>
                    <p className="text-stone-500 text-sm italic line-clamp-3">"{draft.content}"</p>
                  </CardContent>
                  <div className="p-4 bg-stone-50 border-t border-stone-100">
                    <Link href={`/dashboard/create?id=${draft.id}`}>
                      <Button variant="ghost" className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 gap-2 text-sm font-bold">
                        <Edit3 className="w-4 h-4" />
                        CONTINUE WRITING
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
            
            <Link href="/dashboard/create" className="group">
              <div className="border-2 border-dashed border-stone-200 rounded-xl h-full min-h-[200px] flex flex-col items-center justify-center text-stone-300 group-hover:border-rose-200 group-hover:text-rose-400 group-hover:bg-rose-50/30 transition-all">
                <Plus className="w-10 h-10 mb-2" />
                <span className="font-bold text-xs uppercase tracking-widest">Start New Draft</span>
              </div>
            </Link>
          </div>
        )}
      </div>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl">
              <AlertTriangle className="mx-auto text-rose-500 w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-4">Discard this draft?</h3>
              <div className="flex flex-col gap-2">
                <Button onClick={handleDelete} disabled={isDeleting} className="bg-rose-500 hover:bg-rose-600 rounded-full">
                  {isDeleting ? <Loader2 className="animate-spin" /> : "Delete Forever"}
                </Button>
                <Button variant="ghost" onClick={() => setDeleteId(null)} className="rounded-full">Cancel</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}