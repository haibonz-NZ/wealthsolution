import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WizardLayoutProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onBack?: () => void;
  showBack?: boolean;
}

export function WizardLayout({ step, totalSteps, title, subtitle, children, onBack, showBack = true }: WizardLayoutProps) {
  const [, setLocation] = useLocation();
  const progress = (step / totalSteps) * 100;

  const handleBack = () => {
    if (onBack) onBack();
    else window.history.back();
  };

  return (
    <div className="min-h-screen bg-[#FFF2CC] text-[#0C2340] flex flex-col relative overflow-hidden font-sans">
      {/* Background Texture: Subtle Paper/Grain */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 pointer-events-none mix-blend-multiply"></div>

      {/* Header / Progress - Copper Timeline */}
      <div className="relative z-20 w-full fixed top-0 left-0 bg-[#FFF2CC]/80 backdrop-blur-md border-b border-[#B87845]/10">
        <div className="h-1 w-full bg-[#B87845]/10">
            <motion.div 
                className="h-full bg-[#B87845]" 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            />
        </div>
        
        <div className="px-6 py-4 flex items-center justify-between">
          {showBack ? (
            <Button variant="ghost" size="icon" onClick={handleBack} className="text-[#0C2340]/60 hover:text-[#B87845] hover:bg-[#B87845]/10">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          ) : <div className="w-10" />}
          
          <div className="text-xs font-mono text-[#B87845] tracking-widest font-bold">
            STEP {step} / {totalSteps}
          </div>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Content Area - Vertical Sliding Canvas */}
      <div className="flex-1 flex flex-col relative z-10 px-6 pb-10 pt-24 max-w-md mx-auto w-full justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-[#0C2340] mb-3 font-heading">{title}</h1>
          {subtitle && <p className="text-[#0C2340]/60 text-sm leading-relaxed max-w-xs mx-auto">{subtitle}</p>}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            // Vertical Slide Transition
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-1 flex flex-col w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
