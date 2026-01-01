import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react"; // Import the high-quality icon

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <Card className="w-full max-w-md border-rose-100 shadow-xl bg-white/80 backdrop-blur-sm">
        
        <CardHeader className="text-center space-y-2">
          {/* High-quality Heart Icon with a soft pulse animation */}
          <div className="mx-auto bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mb-2">
            <Heart className="w-10 h-10 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
          
          {/* font-[family-name:var(--font-handwritten)] applies our new font */}
          <CardTitle className="text-5xl font-bold text-stone-800 tracking-tight font-[family-name:var(--font-handwritten)]">
            Shantal's Vault
          </CardTitle>
          
          <CardDescription className="text-stone-500 text-lg italic">
            "A secret place for our love letters."
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 pt-4">
          <Button 
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-8 rounded-2xl text-xl transition-all active:scale-95 shadow-lg shadow-rose-200"
          >
            Sign in with Google
          </Button>
          
          <div className="border-t border-stone-100 pt-6 text-center">
            <span className="text-xs text-stone-400 uppercase tracking-[0.3em] font-medium">
              From Andrei with Love
            </span>
          </div>
        </CardContent>
        
      </Card>
    </div>
  );
}