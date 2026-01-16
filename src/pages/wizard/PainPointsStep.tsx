import { useState } from "react";
import { useLocation } from "wouter";
import { WizardLayout } from "../WizardLayout";
import { useWizard } from "@/contexts/WizardContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, UserX, FileWarning, Lock } from "lucide-react";

const PAIN_POINTS = [
  { id: 'tax', label: '全球税务合规/查税风险', desc: 'CRS穿透、美国税、遗产税', icon: FileWarning },
  { id: 'heirs', label: '二代传承/败家风险', desc: '子女婚变、挥霍、接班能力', icon: UserX },
  { id: 'frozen', label: '资产冻结/离境限制', desc: '外汇管制、账户关停', icon: Lock },
  { id: 'debt', label: '企业债务/连带责任', desc: '家企混同、无限责任', icon: AlertTriangle },
];

export default function PainPointsStep() {
  const [, setLocation] = useLocation();
  const { data, updateData } = useWizard();
  const [selected, setSelected] = useState<string[]>(data.painPoints);

  const togglePoint = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleNext = () => {
    updateData({ painPoints: selected });
    setLocation("/diagnosis");
  };

  return (
    <WizardLayout 
      step={3} 
      totalSteps={3} 
      title="核心隐忧" 
      subtitle="您最担心的财富风险是什么？（系统将重点扫描相关法律条款）"
    >
      <div className="flex-1 space-y-4">
        {PAIN_POINTS.map((point) => {
          const Icon = point.icon;
          const isSelected = selected.includes(point.id);
          return (
            <div 
              key={point.id}
              onClick={() => togglePoint(point.id)}
              className={`relative flex items-start space-x-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${isSelected ? 'bg-gradient-to-r from-primary/20 to-transparent border-primary/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
            >
              <div className={`mt-1 p-2 rounded-full ${isSelected ? 'bg-primary text-background' : 'bg-white/10 text-white/50'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className={`font-bold text-base mb-1 ${isSelected ? 'text-primary' : 'text-white/90'}`}>
                  {point.label}
                </div>
                <div className="text-xs text-white/50">{point.desc}</div>
              </div>
              <div className="flex items-center justify-center h-full">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-white/30'}`}>
                  {isSelected && <div className="w-2 h-2 bg-background rounded-full" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <Button 
          size="lg" 
          onClick={handleNext} 
          disabled={selected.length === 0}
          className="w-full h-12 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold hover:from-red-500 hover:to-red-400 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse"
        >
          开始生成诊断报告
        </Button>
      </div>
    </WizardLayout>
  );
}
