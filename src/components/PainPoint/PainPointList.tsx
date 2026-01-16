import { useState, useEffect } from "react";
import { PainPointService, type PainPoint, type PainPointType, PAIN_POINT_LABELS, PAIN_POINT_DESCRIPTIONS } from "@/services/painPoint";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, X, ArrowUp, ArrowDown, Save, Target } from "lucide-react";
import { toast } from "sonner";

interface PainPointListProps {
  caseId: string;
}

export function PainPointList({ caseId }: PainPointListProps) {
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    loadData();
  }, [caseId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await PainPointService.getByCase(caseId);
      setPainPoints(data);
    } catch (e) {
      toast.error("加载数据失败");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (type: PainPointType) => {
    // Check if already exists
    if (painPoints.find(p => p.type === type)) {
      toast.info("该痛点已添加");
      return;
    }

    try {
      const newPoint = await PainPointService.addOrUpdate(caseId, type, "");
      setPainPoints([...painPoints, newPoint].sort((a, b) => a.priority - b.priority));
      toast.success("已添加");
    } catch (e) {
      toast.error("添加失败");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await PainPointService.remove(id);
      setPainPoints(painPoints.filter(p => p.id !== id));
      toast.success("已移除");
    } catch (e) {
      toast.error("移除失败");
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= painPoints.length) return;

    const newPoints = [...painPoints];
    const [moved] = newPoints.splice(index, 1);
    newPoints.splice(newIndex, 0, moved);

    setPainPoints(newPoints);
    
    // Save new order
    const orderedIds = newPoints.map(p => p.id);
    try {
      await PainPointService.reorder(caseId, orderedIds);
    } catch (e) {
      toast.error("排序保存失败");
    }
  };

  const startEdit = (p: PainPoint) => {
    setEditingId(p.id);
    setEditDescription(p.description || "");
  };

  const saveDescription = async (id: string, type: PainPointType) => {
    try {
      const updated = await PainPointService.addOrUpdate(caseId, type, editDescription);
      setPainPoints(painPoints.map(p => p.id === id ? updated : p));
      setEditingId(null);
      toast.success("描述已更新");
    } catch (e) {
      toast.error("保存失败");
    }
  };

  if (loading) return <div className="text-center p-8"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      {/* Left: Selection Area */}
      <div className="lg:col-span-5 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              选择关注痛点
            </CardTitle>
            <CardDescription>
              点击标签添加到右侧列表
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(PAIN_POINT_LABELS) as PainPointType[]).map((type) => {
              const isSelected = painPoints.some(p => p.type === type);
              return (
                <Button
                  key={type}
                  variant={isSelected ? "secondary" : "outline"}
                  className={`justify-start h-auto py-3 px-4 text-left whitespace-normal ${isSelected ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:text-primary'}`}
                  onClick={() => handleAdd(type)}
                  disabled={isSelected}
                >
                  <div>
                    <div className="font-medium">{PAIN_POINT_LABELS[type]}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 font-normal line-clamp-2">
                      {PAIN_POINT_DESCRIPTIONS[type]}
                    </div>
                  </div>
                  {isSelected && <Plus className="ml-auto h-4 w-4 rotate-45" />}
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Right: Selected List */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="min-h-[500px]">
          <CardHeader>
            <CardTitle className="text-base">已选痛点需求 ({painPoints.length})</CardTitle>
            <CardDescription>
              您可以调整优先级并补充详细描述
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {painPoints.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg bg-muted/10">
                <p className="text-muted-foreground">暂无选择，请从左侧添加</p>
              </div>
            ) : (
              painPoints.map((p, index) => (
                <div key={p.id} className="group border rounded-lg p-4 bg-card hover:shadow-sm transition-all relative">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        {index + 1}
                      </Badge>
                      <h4 className="font-semibold">{PAIN_POINT_LABELS[p.type]}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7" 
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7" 
                        disabled={index === painPoints.length - 1}
                        onClick={() => handleMove(index, 'down')}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleRemove(p.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {editingId === p.id ? (
                    <div className="space-y-2">
                      <Textarea 
                        value={editDescription} 
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder={`请输入${PAIN_POINT_LABELS[p.type]}的具体需求...`}
                        className="text-sm min-h-[80px]"
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>取消</Button>
                        <Button size="sm" onClick={() => saveDescription(p.id, p.type)}>
                          <Save className="h-3 w-3 mr-1" /> 保存
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="text-sm text-muted-foreground min-h-[40px] p-2 rounded hover:bg-muted/50 cursor-pointer border border-transparent hover:border-border transition-colors"
                      onClick={() => startEdit(p)}
                    >
                      {p.description || <span className="italic opacity-50">点击添加详细描述...</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
