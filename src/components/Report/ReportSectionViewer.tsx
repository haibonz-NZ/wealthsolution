import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ReportSectionViewerProps {
  title: string;
  description: string;
  content?: string;
  onGenerate: () => Promise<string>;
  buttonText?: string;
  emptyStateText?: string;
}

export function ReportSectionViewer({ 
  title, 
  description, 
  content, 
  onGenerate,
  buttonText = "开始生成",
  emptyStateText = "暂无内容，请点击生成"
}: ReportSectionViewerProps) {
  const [loading, setLoading] = useState(false);
  const [displayContent, setDisplayContent] = useState(content || "");
  
  // Update display if prop changes (e.g. loaded from storage)
  useEffect(() => {
    if (content && !loading) {
      setDisplayContent(content);
    }
  }, [content, loading]);

  const streamText = async (text: string) => {
    let current = "";
    const speed = 3; // chars per tick
    for (let i = 0; i < text.length; i += speed) {
      current += text.substring(i, i + speed);
      setDisplayContent(current);
      await new Promise(r => setTimeout(r, 1));
    }
    setDisplayContent(text); // Ensure full text at end
  };

  const handleGenerate = async () => {
    setLoading(true);
    setDisplayContent("");
    
    try {
      const text = await onGenerate();
      await streamText(text);
      toast.success("生成完成");
    } catch (e) {
      toast.error("生成失败");
    } finally {
      setLoading(false);
    }
  };

  const hasContent = !!displayContent;

  if (!hasContent && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center border-2 border-dashed rounded-lg bg-muted/5">
        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2 max-w-md">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button size="lg" onClick={handleGenerate} className="gap-2">
          <Sparkles className="w-4 h-4" /> {buttonText}
        </Button>
      </div>
    );
  }

  return (
    <Card className="min-h-[500px] border-primary/10 shadow-sm">
      <CardHeader className="border-b bg-muted/5 pb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>
        {!loading && (
          <Button variant="outline" size="sm" onClick={handleGenerate} className="gap-2">
            <RefreshCw className="w-4 h-4" /> 重新生成
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        {loading && !displayContent && (
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Loader2 className="w-4 h-4 animate-spin" /> 正在分析与撰写中...
          </div>
        )}
        
        <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-p:leading-relaxed prose-li:marker:text-primary">
          <div className="whitespace-pre-wrap font-sans leading-relaxed">
            {displayContent}
          </div>
        </div>
        
        {loading && (
          <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
        )}
      </CardContent>
    </Card>
  );
}
