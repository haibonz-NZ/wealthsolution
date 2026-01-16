import { useState, useEffect } from "react";
import { MemberService, type FamilyMember } from "@/services/member";
import { AssetService, type Asset } from "@/services/asset";
import { PainPointService, type PainPoint } from "@/services/painPoint";
import { SmartReportView } from "./SmartReportView";
import { Loader2 } from "lucide-react";

interface TabProps {
  caseId: string;
}

export function CaseGenerationTab({ caseId }: TabProps) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [caseId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mems, assts, pps] = await Promise.all([
        MemberService.getMembersByCase(caseId),
        AssetService.getAssetsByCase(caseId),
        PainPointService.getByCase(caseId)
      ]);
      setMembers(mems);
      setAssets(assts);
      setPainPoints(pps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <SmartReportView 
      caseId={caseId}
      members={members}
      assets={assets}
      painPoints={painPoints}
    />
  );
}
