import { useState } from "react";
import { useLocation } from "wouter";
import { WizardLayout } from "../WizardLayout";
import { useWizard } from "@/contexts/WizardContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Building2, Landmark, Wallet, Briefcase, Coins } from "lucide-react";

const ASSET_TYPES = [
  { id: 'real_estate', label: '房产', icon: Building2 },
  { id: 'equity', label: '公司股权', icon: Briefcase },
  { id: 'cash', label: '现金/理财', icon: Wallet },
  { id: 'insurance', label: '保险/信托', icon: Landmark },
  { id: 'crypto', label: '另类资产', icon: Coins },
];

export default function AssetsStep() {
  const [, setLocation] = useLocation();
  const { data, updateData } = useWizard();
  
  const [domesticVal, setDomesticVal] = useState(data.assets.domestic);
  const [foreignVal, setForeignVal] = useState(data.assets.foreign);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(data.assets.types);

  const toggleType = (id: string) => {
    if (selectedTypes.includes(id)) {
      setSelectedTypes(selectedTypes.filter(t => t !== id));
    } else {
      setSelectedTypes([...selectedTypes, id]);
    }
  };

  const getLabel = (val: number) => {
    if (val === 0) return "< 1000万";
    if (val === 1) return "1000万 - 5000万";
    if (val === 2) return "5000万 - 1亿";
    return "> 1亿";
  };

  const handleNext = () => {
    updateData({ 
      assets: {
        domestic: domesticVal,
        foreign: foreignVal,
        types: selectedTypes
      }
    });
    setLocation("/wizard/pain-points");
  };

  return (
    <WizardLayout 
      step={2} 
      totalSteps={3} 
      title="资产画像速描" 
      subtitle="无需精确数字，仅需勾选大概区间，系统将评估体量风险。"
    >
      <div className="space-y-8 flex-1">
        
        {/* Value Sliders */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <Label className="text-white/80">境内资产预估 (RMB)</Label>
              <span className="text-primary font-mono text-lg">{getLabel(domesticVal)}</span>
            </div>
            <Slider 
              value={[domesticVal]} 
              onValueChange={(v) => setDomesticVal(v[0])} 
              max={3} 
              step={1} 
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-white/30 px-1">
              <span>初级</span>
              <span>中产</span>
              <span>富裕</span>
              <span>顶豪</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <Label className="text-white/80">境外资产预估 (USD)</Label>
              <span className="text-primary font-mono text-lg">{getLabel(foreignVal).replace('万', '0k').replace('亿', '0M')}</span>
            </div>
            <Slider 
              value={[foreignVal]} 
              onValueChange={(v) => setForeignVal(v[0])} 
              max={3} 
              step={1} 
              className="py-2"
            />
          </div>
        </div>

        {/* Asset Types Grid */}
        <div className="space-y-3">
          <Label className="text-white/80">持有资产类别 (多选)</Label>
          <div className="grid grid-cols-3 gap-3">
            {ASSET_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedTypes.includes(type.id);
              return (
                <Card 
                  key={type.id}
                  onClick={() => toggleType(type.id)}
                  className={`cursor-pointer border transition-all duration-200 flex flex-col items-center justify-center p-3 gap-2 h-24 ${isSelected ? 'bg-primary/20 border-primary shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-white/50'}`} />
                  <span className={`text-xs ${isSelected ? 'text-primary font-bold' : 'text-white/60'}`}>{type.label}</span>
                </Card>
              );
            })}
          </div>
        </div>

      </div>

      <div className="mt-8">
        <Button 
          size="lg" 
          onClick={handleNext} 
          disabled={selectedTypes.length === 0}
          className="w-full h-12 bg-primary text-background font-bold hover:bg-primary/90"
        >
          下一步
        </Button>
      </div>
    </WizardLayout>
  );
}
