import { useState, useEffect } from "react";
import { type FamilyMember } from "@/services/member";
import { type Asset } from "@/services/asset";
import { type PainPoint } from "@/services/painPoint";
import { ReportService, type GeneratedReport, type ReportContent } from "@/services/report";
import { FamilyTree } from "@/components/Member/FamilyTree";
import { MemberTable } from "@/components/Report/MemberTable";
import { AssetAnalysis } from "@/components/Report/AssetAnalysis";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer, RefreshCw, Sparkles, Loader2, Save, History, Palette } from "lucide-react";
import { toast } from "sonner";
import { SimpleMarkdown } from "@/components/SimpleMarkdown";
import { RiskAnalysis } from "@/components/Report/RiskAnalysis";

interface SmartReportViewProps {
  caseId: string;
  members: FamilyMember[];
  assets: Asset[];
  painPoints: PainPoint[];
}

const THEMES = {
  professional: "font-serif bg-white text-slate-900",
  modern: "font-sans bg-white text-gray-900",
  luxury: "font-serif bg-[#fafaf9] text-[#44403c]", // Stone/Warm
  minimal: "font-sans bg-white text-black"
};

const THEME_LABELS = {
  professional: "专业经典 (Professional)",
  modern: "现代商务 (Modern)",
  luxury: "尊贵雅致 (Luxury)",
  minimal: "极简主义 (Minimal)"
};

const ReportSectionHeader = ({ title, theme }: { title: string, theme: string }) => {
  let styleClass = "";
  switch(theme) {
    case 'modern':
      styleClass = "bg-blue-600 text-white border-l-0 rounded-md";
      break;
    case 'luxury':
      styleClass = "bg-[#44403c] text-[#d6d3d1] border-l-4 border-[#a8a29e]";
      break;
    case 'minimal':
      styleClass = "bg-transparent text-black border-b-2 border-black px-0";
      break;
    default: // professional
      styleClass = "bg-slate-900 text-white border-l-4 border-slate-600";
  }

  return (
    <div className={`${styleClass} px-6 py-3 text-lg font-bold uppercase tracking-wide mb-6 print:bg-slate-900 print:text-white`}>
      {title}
    </div>
  );
};

export function SmartReportView({ caseId, members, assets, painPoints }: SmartReportViewProps) {
  const [content, setContent] = useState<ReportContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<keyof typeof THEMES>("professional");
  const [history, setHistory] = useState<GeneratedReport['history']>([]);
  const [currentReport, setCurrentReport] = useState<GeneratedReport | null>(null);
  const [showAccessCodeDialog, setShowAccessCodeDialog] = useState(false);
  const [tempAccessCode, setTempAccessCode] = useState("");

  useEffect(() => {
    loadReportData();
  }, [caseId]);

  const loadReportData = () => {
    const report = ReportService.getReportByCase(caseId);
    if (report) {
      setCurrentReport(report);
      if (report.content) setContent(report.content);
      if (report.history) setHistory(report.history);
    }
  };

  const generateContent = async () => {
    setLoading(true);
    try {
      const result = await ReportService.generateSmartReportContent(caseId);
      setContent(result);
      
      // Auto-save generated content
      const baseReport = currentReport || {
        id: `rep-${Date.now()}`,
        caseId,
        caseStatement: "",
        planning: "",
        fullReport: "",
        createdAt: new Date().toISOString(),
        history: []
      };

      const updated = { ...baseReport, content: result };
      ReportService.saveReport(updated);
      setCurrentReport(updated);
      
      toast.success("智能报告生成完毕");
    } catch (e: any) {
      if (e.message && (e.message.includes('401') || e.message.includes('Access Code'))) {
          setShowAccessCodeDialog(true);
      } else {
          toast.error("生成失败，请重试");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccessCode = () => {
    if (!tempAccessCode) {
        toast.error("请输入访问密码");
        return;
    }
    localStorage.setItem("wealth_access_code", tempAccessCode);
    setShowAccessCodeDialog(false);
    // Retry generation
    generateContent();
  };

  const handleSaveVersion = () => {
    if (!content) return;
    
    const baseReport = currentReport || {
        id: `rep-${Date.now()}`,
        caseId,
        caseStatement: "",
        planning: "",
        fullReport: "",
        createdAt: new Date().toISOString(),
        history: []
    };

    const newVersion = {
      id: `ver-${Date.now()}`,
      timestamp: new Date().toISOString(),
      content: content
    };
    
    const newHistory = [newVersion, ...(history || [])];
    const updatedReport = { ...baseReport, history: newHistory, content: content };
    
    ReportService.saveReport(updatedReport);
    setHistory(newHistory);
    setCurrentReport(updatedReport);
    
    toast.success("当前版本已保存至历史记录");
  };

  const loadVersion = (version: any) => {
    if (confirm("确定要加载此历史版本吗？当前未保存的内容将丢失。")) {
        setContent(version.content);
        toast.info(`已加载版本: ${new Date(version.timestamp).toLocaleString()}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!content && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center animate-pulse border border-slate-200">
          <Sparkles className="w-10 h-10 text-slate-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">准备生成智能家族报告</h2>
          <p className="text-muted-foreground max-w-md">
            系统将整合家族结构、资产分布与痛点需求，为您生成一份专业级分析报告。
          </p>
        </div>
        <Button size="lg" onClick={generateContent} className="h-12 px-8 text-lg bg-slate-900 hover:bg-slate-800 text-white">
          开始生成报告
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <Loader2 className="w-12 h-12 text-slate-900 animate-spin" />
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-slate-900">正在生成专业报告...</p>
          <p className="text-sm text-muted-foreground">正在进行深度风险分析与资产数据校准</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 justify-center">
      <Dialog open={showAccessCodeDialog} onOpenChange={setShowAccessCodeDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>请输入访问密码</DialogTitle>
                <DialogDescription>
                    为了防止服务滥用，管理员开启了访问控制。请输入 Access Code 以继续。
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="code" className="text-right">
                        访问密码
                    </Label>
                    <Input
                        id="code"
                        type="password"
                        value={tempAccessCode}
                        onChange={(e) => setTempAccessCode(e.target.value)}
                        className="col-span-3"
                        placeholder="请输入密码"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSaveAccessCode}>保存并重试</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Report Area */}
      <div className={`flex-1 max-w-[210mm] min-h-screen pb-20 print:pb-0 ${THEMES[theme]}`} id="report-container">
        
        {/* Header Actions (Hidden in Print) */}
        <div className="flex justify-between items-center print:hidden border-b pb-4 mb-8 bg-white/80 backdrop-blur sticky top-0 z-10 p-4 rounded-b-lg shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-900">报告预览</h1>
            <p className="text-muted-foreground text-xs">生成时间: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2">
            <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                    <Palette className="w-3 h-3 mr-2" />
                    <SelectValue placeholder="选择主题" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(THEME_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                        <History className="w-3 h-3 mr-2" /> 历史记录
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>报告历史版本</SheetTitle>
                        <SheetDescription>点击版本可恢复内容。请注意备份。</SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                        <div className="space-y-3">
                            {history && history.length > 0 ? history.map((ver) => (
                                <div key={ver.id} className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => loadVersion(ver)}>
                                    <div className="font-medium text-sm">版本 {new Date(ver.timestamp).toLocaleDateString()}</div>
                                    <div className="text-xs text-muted-foreground">{new Date(ver.timestamp).toLocaleTimeString()}</div>
                                    <div className="mt-2 text-xs line-clamp-2 text-slate-500">{ver.content.summary.substring(0, 50)}...</div>
                                </div>
                            )) : (
                                <div className="text-center text-muted-foreground py-10 text-sm">暂无保存的历史版本</div>
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            <Button variant="outline" onClick={handleSaveVersion} size="sm" className="h-8 text-xs">
              <Save className="w-3 h-3 mr-2" /> 保存
            </Button>
            <Button variant="outline" onClick={generateContent} size="sm" className="h-8 text-xs">
              <RefreshCw className="w-3 h-3 mr-2" /> 重新生成
            </Button>
            <Button onClick={handlePrint} size="sm" className="h-8 text-xs bg-slate-900 text-white hover:bg-slate-800">
              <Printer className="w-3 h-3 mr-2" /> 打印
            </Button>
          </div>
        </div>

        {/* Report Title (Print Only) */}
        <div className="hidden print:block text-center mb-12 mt-8">
          <h1 className="text-4xl font-bold mb-2">家族财富全景分析报告</h1>
          <p className="opacity-60 text-sm uppercase tracking-widest">Confidential & Proprietary</p>
        </div>

        {/* Section 1: Executive Summary */}
        <section className="space-y-4 break-inside-avoid">
          <ReportSectionHeader title="1. 执行摘要 (Executive Summary)" theme={theme} />
          <div className="px-2 text-lg leading-loose text-justify opacity-90">
            <SimpleMarkdown>{content?.summary || ''}</SimpleMarkdown>
          </div>
        </section>

        {/* Section 2: Family Structure */}
        <section className="space-y-8 break-inside-avoid">
          <ReportSectionHeader title="2. 家族结构 (Family Structure)" theme={theme} />
          
          {/* 2.1 Table */}
          <div className="space-y-4 px-2">
            <h3 className="text-lg font-bold border-l-4 border-current pl-3 opacity-80">2.1 家族成员名录</h3>
            <MemberTable members={members} />
          </div>

          {/* 2.2 Tree */}
          <div className="space-y-4 px-2 pt-4">
            <h3 className="text-lg font-bold border-l-4 border-current pl-3 opacity-80">2.2 家族关系图谱</h3>
            {/* Fixed Layout: Ensure container has explicit width for ResizeObserver to work */}
            <div className="border border-slate-200 p-4 print:border-none print:p-0 bg-white min-h-[500px] w-full overflow-hidden rounded-lg">
              <FamilyTree members={members} />
            </div>
          </div>
        </section>

        {/* Section 3: Asset Overview */}
        <section className="space-y-6 break-before-page">
          <ReportSectionHeader title="3. 资产全貌 (Financial Overview)" theme={theme} />
          <div className="px-2">
            <AssetAnalysis assets={assets} />
          </div>
        </section>

        {/* Section 4: Risk Analysis */}
        <section className="space-y-4 break-before-page">
          <ReportSectionHeader title="4. 痛点与风险深度剖析 (Risk Analysis)" theme={theme} />
          
          {/* Rule Engine Results (Traffic Lights) */}
          <div className="px-2 mb-6">
            <h3 className="text-sm font-bold border-l-4 border-red-500 pl-3 mb-4 opacity-80">4.1 核心合规风险预警 (自动扫描)</h3>
            <RiskAnalysis members={members} assets={assets} />
          </div>

          <div className="px-2 text-lg leading-loose text-justify opacity-90">
            <h3 className="text-sm font-bold border-l-4 border-slate-500 pl-3 mb-2 opacity-80">4.2 深度法理分析</h3>
            <SimpleMarkdown>{content?.analysis || ''}</SimpleMarkdown>
          </div>
        </section>

        {/* Section 5: Conclusion */}
        <section className="space-y-4 break-inside-avoid">
          <ReportSectionHeader title="5. 战略建议 (Strategic Suggestions)" theme={theme} />
          <div className="px-2 text-lg leading-loose text-justify opacity-90">
            <SimpleMarkdown>{content?.conclusion || ''}</SimpleMarkdown>
          </div>
        </section>

        {/* Footer for Print */}
        <div className="hidden print:flex justify-between text-xs opacity-50 border-t border-current pt-4 mt-12">
          <span>Wealth Solution Family Office System</span>
          <span>{new Date().getFullYear()} © All Rights Reserved</span>
        </div>
      </div>
    </div>
  );
}
