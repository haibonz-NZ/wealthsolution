import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, PieChart, Target } from "lucide-react";
import { CaseService, type WealthCase } from "@/services/case";
import { toast } from "sonner";

// Placeholder components for other tabs
import { AssetList } from "@/components/Asset/AssetList";
import { PainPointList } from "@/components/PainPoint/PainPointList";
// import { ReportTab } from "@/components/Report/ReportTab"; // Replaced by new split tabs
import { CaseGenerationTab } from "@/components/Report/CaseGenerationTab";
import { PlanningTab } from "@/components/Report/PlanningTab";
import { FullReportTab } from "@/components/Report/FullReportTab";
import { FileText, Sparkles, BookOpen, ScrollText } from "lucide-react";


// We will implement MemberTab in the next step, using placeholder for now to build structure
import { MemberList } from "@/components/Member/MemberList";

interface CaseDetailProps {
  caseId: string;
  onBack: () => void;
}

export default function CaseDetail({ caseId, onBack }: CaseDetailProps) {
  const [caseData, setCaseData] = useState<WealthCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCase = async () => {
      try {
        // In a real app we'd get by ID directly, here we simulate getting user cases and finding one
        // Ideally CaseService should have getCaseById. Let's add it or assume getUserCases is enough if we have user context.
        // But wait, CaseService currently only has getUserCases. Let's assume we can fetch it or just iterate.
        // Actually, let's just use what we have or Mock it. 
        // For simplicity, let's assume we can find it from the full list or implement getCaseById in CaseService.
        // Let's implement a simple getCaseById helper in this file using the existing service pattern if needed,
        // or better, update CaseService. But I can't update CaseService in this turn effortlessly without extra steps.
        // I'll try to find it from local storage directly for now or just rely on passed data? 
        // No, best is to add getCaseById to CaseService. I'll do that quickly or just read all cases.
        // I'll read all cases from localStorage for now since I can't import getCases from service (it's not exported).
        // Wait, I can just fetch all cases for the current user? But I don't have userId passed here easily without prop drilling.
        // Let's just update CaseService to have getCaseById in the same file write if possible? No, I'll stick to what I can do.
        
        // Let's modify CaseService to export getCaseById in the next step or just implementation it here?
        // Accessing localStorage directly is a bit dirty but works for this demo.
        const casesStr = localStorage.getItem('wealth_cases');
        const cases = casesStr ? JSON.parse(casesStr) : [];
        const found = cases.find((c: any) => c.id === caseId);
        
        if (found) {
          setCaseData(found);
        } else {
          toast.error("找不到该案例");
          onBack();
        }
      } catch (e) {
        toast.error("加载失败");
      } finally {
        setLoading(false);
      }
    };
    loadCase();
  }, [caseId]);

  if (loading) return <div className="p-8 text-center">加载中...</div>;
  if (!caseData) return null;

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col">
      {/* Header */}
      <header className="bg-background border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            {caseData.name}
            <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
              {caseData.status === 'draft' ? '草稿' : '进行中'}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground">ID: {caseData.id}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-6xl p-6">
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 bg-muted/50">
            <TabsTrigger value="members" className="gap-2 flex-1 min-w-[100px]">
              <Users className="h-4 w-4" /> 家族成员
            </TabsTrigger>
            <TabsTrigger value="assets" className="gap-2 flex-1 min-w-[100px]">
              <PieChart className="h-4 w-4" /> 资产状况
            </TabsTrigger>
            <TabsTrigger value="pain_points" className="gap-2 flex-1 min-w-[100px]">
              <Target className="h-4 w-4" /> 痛点需求
            </TabsTrigger>
            
            {/* Divider or Visual Separation for Generated Content */}
            <div className="w-px h-6 bg-border mx-1 hidden md:block self-center" />

            <TabsTrigger value="case_generation" className="gap-2 flex-1 min-w-[100px]">
              <ScrollText className="h-4 w-4 text-indigo-500" /> 案例生成
            </TabsTrigger>
            <TabsTrigger value="planning" className="gap-2 flex-1 min-w-[100px]">
              <Sparkles className="h-4 w-4 text-amber-500" /> 智能规划
            </TabsTrigger>
            <TabsTrigger value="smart_report" className="gap-2 flex-1 min-w-[100px]">
              <BookOpen className="h-4 w-4 text-emerald-500" /> 智能报告
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            {/* We will replace this with real component in next step */}
             <MemberList caseId={caseId} />
          </TabsContent>

          <TabsContent value="assets">
            <div className="bg-background rounded-lg border p-6 min-h-[400px]">
              <AssetList caseId={caseId} />
            </div>
          </TabsContent>

          <TabsContent value="pain_points">
            <div className="bg-background rounded-lg border p-6 min-h-[400px]">
              <PainPointList caseId={caseId} />
            </div>
          </TabsContent>

          {/* New Tabs Content */}
          <TabsContent value="case_generation">
            <div className="bg-background rounded-lg border p-6 min-h-[400px]">
              <CaseGenerationTab caseId={caseId} />
            </div>
          </TabsContent>

          <TabsContent value="planning">
            <div className="bg-background rounded-lg border p-6 min-h-[400px]">
              <PlanningTab caseId={caseId} />
            </div>
          </TabsContent>

          <TabsContent value="smart_report">
            <div className="bg-background rounded-lg border p-6 min-h-[400px]">
              <FullReportTab caseId={caseId} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
