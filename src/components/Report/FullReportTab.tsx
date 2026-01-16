import { useState, useEffect } from "react";
import { ReportSectionViewer } from "./ReportSectionViewer";
import { ReportService } from "@/services/report";

interface TabProps {
  caseId: string;
}

export function FullReportTab({ caseId }: TabProps) {
  const [content, setContent] = useState("");

  useEffect(() => {
    const report = ReportService.getReportByCase(caseId);
    if (report?.fullReport) {
      setContent(report.fullReport);
    }
  }, [caseId]);

  const handleGenerate = async () => {
    const text = await ReportService.generateProfessionalReport(caseId);
    
    const currentReport = ReportService.getReportByCase(caseId) || {
      id: `rep-${Date.now()}`,
      caseId,
      caseStatement: "",
      planning: "",
      fullReport: "",
      createdAt: new Date().toISOString()
    };
    
    const updatedReport = { ...currentReport, fullReport: text };
    ReportService.saveReport(updatedReport);
    
    return text;
  };

  return (
    <ReportSectionViewer
      title="专业版智能报告"
      description="生成包含封面、目录、深度分析、实施路线图及合规声明的完整专业文档。"
      content={content}
      onGenerate={handleGenerate}
      buttonText="生成专业版报告"
    />
  );
}
