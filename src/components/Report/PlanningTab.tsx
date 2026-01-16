import { useState, useEffect } from "react";
import { ReportSectionViewer } from "./ReportSectionViewer";
import { ReportService } from "@/services/report";

interface TabProps {
  caseId: string;
}

export function PlanningTab({ caseId }: TabProps) {
  const [content, setContent] = useState("");

  useEffect(() => {
    const report = ReportService.getReportByCase(caseId);
    if (report?.planning) {
      setContent(report.planning);
    }
  }, [caseId]);

  const handleGenerate = async () => {
    const text = await ReportService.generatePlanning(caseId);
    
    const currentReport = ReportService.getReportByCase(caseId) || {
      id: `rep-${Date.now()}`,
      caseId,
      caseStatement: "",
      planning: "",
      fullReport: "",
      createdAt: new Date().toISOString()
    };
    
    const updatedReport = { ...currentReport, planning: text };
    ReportService.saveReport(updatedReport);
    
    return text;
  };

  return (
    <ReportSectionViewer
      title="智能深度分析与规划"
      description="AI 深度挖掘潜在风险（如婚姻混同、税务合规、传承控制权），并提供综合规划方案。"
      content={content}
      onGenerate={handleGenerate}
      buttonText="开始智能规划分析"
    />
  );
}
