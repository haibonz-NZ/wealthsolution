import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, FileText, ArrowRight, Trash2 } from "lucide-react";
import { type WealthCase } from "@/services/case";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface CaseCardProps {
  data: WealthCase;
  onClick: (caseId: string) => void;
  onDelete?: (caseId: string) => void;
}

export function CaseCard({ data, onClick, onDelete }: CaseCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">已完成</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-600">进行中</Badge>;
      default:
        return <Badge variant="secondary">草稿</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-tight cursor-pointer hover:text-primary transition-colors" onClick={() => onClick(data.id)}>
              {data.name}
            </CardTitle>
            <CardDescription className="line-clamp-1 text-xs">
              ID: {data.id.split('-')[1]}
            </CardDescription>
          </div>
          {getStatusBadge(data.status)}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {data.description || "暂无描述"}
        </p>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(data.updatedAt), { addSuffix: true, locale: zhCN })}更新
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-end gap-2">
        {onDelete && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(data.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        <Button size="sm" variant="secondary" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors" onClick={() => onClick(data.id)}>
          进入管理 <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
