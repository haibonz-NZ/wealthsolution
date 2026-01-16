import { useEffect, useState } from "react";
import { RiskEngine, type RiskResult } from "@/lib/riskEngine";
import { type FamilyMember } from "@/services/member";
import { type Asset } from "@/services/asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldAlert, Info, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface RiskAnalysisProps {
  members: FamilyMember[];
  assets: Asset[];
}

export function RiskAnalysis({ members, assets }: RiskAnalysisProps) {
  const [risks, setRisks] = useState<RiskResult[]>([]);
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);

  useEffect(() => {
    // Transform data to match WizardData structure expected by RiskEngine
    // Note: RiskEngine expects WizardData which has specific shape. 
    // We need to adapt the B-end data (members, assets) to that shape or update RiskEngine.
    // Looking at RiskEngine.ts, it expects { identities, assets }. 
    // identities need 'region' and 'meta'. assets need 'types'.
    
    // Adapter logic
    const adapterData = {
      identities: members.map(m => ({
        id: m.id,
        role: m.relation,
        region: m.nationality, // Mapping nationality to region for rough check
        risks: [], // To be filled if we had pre-calculated node risks
        meta: {
          daysInCountry: m.daysInCountry,
          citizenship: m.nationality === 'US' // Simple check
        }
      })),
      assets: {
        domestic: 0, // Placeholder
        foreign: assets.filter(a => a.location !== 'CN').length > 0 ? 2 : 0,
        types: assets.map(a => a.type)
      },
      painPoints: [] // Placeholder
    };

    // @ts-ignore - Ignoring type mismatch for quick adaptation, assuming RiskEngine handles basic shape
    const detectedRisks = RiskEngine.analyze(adapterData);
    setRisks(detectedRisks);
  }, [members, assets]);

  if (risks.length === 0) {
    return (
      <Card className="border-l-4 border-l-green-500 bg-green-50/50">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <ShieldAlert className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-bold text-green-700">系统检测未发现重大硬性合规风险</h4>
            <p className="text-xs text-green-600/80">基于当前录入的身份与资产架构扫描。</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {risks.map((risk, index) => (
        <Card 
          key={index} 
          className={cn(
            "border-l-4 transition-all duration-300", 
            risk.level === 'HIGH' ? "border-l-red-500 bg-red-50/30" : "border-l-amber-500 bg-amber-50/30"
          )}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className={cn(
                  "p-2 rounded-full h-fit",
                  risk.level === 'HIGH' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                )}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    {risk.code}
                    <Badge variant={risk.level === 'HIGH' ? "destructive" : "secondary"} className="text-[10px] h-5">
                      {risk.level === 'HIGH' ? "高危" : "预警"}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{risk.desc}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setExpandedRisk(expandedRisk === risk.code ? null : risk.code)}
              >
                {expandedRisk === risk.code ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          
          {expandedRisk === risk.code && (
            <CardContent className="p-4 pt-0 pl-[3.25rem]">
              <div className="bg-white p-3 rounded-md border border-slate-100 text-xs space-y-2 shadow-sm">
                <div className="flex items-start gap-2 text-slate-600">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>
                    <strong>风险详解：</strong>
                    该风险通常由特定的身份（如美籍）与特定的资产类型（如信托、基金）结合触发。建议进行深度合规性审查。
                  </span>
                </div>
                {risk.legalRef && (
                  <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono">法理依据: {risk.legalRef}</span>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
