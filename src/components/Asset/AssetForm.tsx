import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetService, type Asset, type AssetType, type Currency, type HoldingType, ASSET_TYPE_LABELS, HOLDING_TYPE_LABELS, CURRENCY_LABELS } from "@/services/asset";
import { MemberService, type FamilyMember, type Region, RELATION_LABELS } from "@/services/member";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

interface AssetFormProps {
  caseId: string;
  assetToEdit?: Asset;
  onSuccess: (asset: Asset) => void;
  onCancel: () => void;
}

const REGIONS: { value: Region; label: string }[] = [
  { value: "CN", label: "中国大陆" },
  { value: "HK", label: "香港" },
  { value: "US", label: "美国" },
  { value: "UK", label: "英国" },
  { value: "CA", label: "加拿大" },
  { value: "AU", label: "澳大利亚" },
  { value: "SG", label: "新加坡" },
  { value: "JP", label: "日本" },
  { value: "OTHER", label: "其他离岸" }
];

export function AssetForm({ caseId, assetToEdit, onSuccess, onCancel }: AssetFormProps) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  
  // Core Fields
  const [name, setName] = useState(assetToEdit?.name || "");
  const [type, setType] = useState<AssetType>(assetToEdit?.type || "cash");
  const [customType, setCustomType] = useState(assetToEdit?.customType || "");
  const [location, setLocation] = useState<Region>(assetToEdit?.location || "CN");
  
  const [ownerId, setOwnerId] = useState(assetToEdit?.ownerId || "");
  const [holdingType, setHoldingType] = useState<HoldingType>(assetToEdit?.holdingType || "individual");
  
  const [currency, setCurrency] = useState<Currency>(assetToEdit?.currency || "USD");
  const [marketValue, setMarketValue] = useState(assetToEdit?.marketValue?.toString() || "");
  const [costBase, setCostBase] = useState(assetToEdit?.costBase?.toString() || "");
  
  const [isPassive, setIsPassive] = useState(assetToEdit?.isPassive || false);
  const [notes, setNotes] = useState(assetToEdit?.notes || "");

  useEffect(() => {
    const loadMembers = async () => {
      const data = await MemberService.getMembersByCase(caseId);
      setMembers(data);
      if (!assetToEdit && data.length > 0) {
        const self = data.find(m => m.relation === 'self');
        if (self) setOwnerId(self.id);
      }
    };
    loadMembers();
  }, [caseId, assetToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !marketValue) {
      toast.error("请填写必填项");
      return;
    }

    setLoading(true);
    try {
      const assetData = {
        caseId,
        name,
        type,
        customType: type === 'other' ? customType : undefined,
        location,
        ownerId,
        holdingType,
        currency,
        marketValue: parseFloat(marketValue),
        costBase: parseFloat(costBase) || 0,
        isPassive: (type === 'equity' || type === 'fund') ? isPassive : undefined,
        notes
      };

      let result;
      if (assetToEdit) {
        result = await AssetService.updateAsset(assetToEdit.id, assetData);
        toast.success("资产更新成功");
      } else {
        result = await AssetService.addAsset(assetData);
        toast.success("资产添加成功");
      }
      onSuccess(result);
    } catch (e) {
      toast.error("保存失败");
    } finally {
      setLoading(false);
    }
  };

  // Logic Helpers
  const showPassiveCheck = type === 'equity' || type === 'fund';
  const showCostBase = true; // Always good for tax calculation

  return (
    <Card className="mb-6 border-2 border-primary/10">
      <CardHeader>
        <CardTitle>{assetToEdit ? "编辑资产" : "录入新资产"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-6">
          {/* 1. 基础信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>资产名称 <span className="text-red-500">*</span></Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="例如: 曼哈顿公寓" required />
            </div>
            <div className="space-y-2">
              <Label>资产类型</Label>
              <Select value={type} onValueChange={(v: AssetType) => setType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSET_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 2. 权属与架构 */}
          <div className="p-4 bg-muted/20 rounded-lg space-y-4 border border-border/50">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary" />
              权属架构 (风险核心)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>实际权益人 (Owner)</Label>
                <Select value={ownerId} onValueChange={setOwnerId}>
                  <SelectTrigger><SelectValue placeholder="选择家族成员" /></SelectTrigger>
                  <SelectContent>
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} ({RELATION_LABELS[m.relation]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>持有方式 (Holding)</Label>
                <Select value={holdingType} onValueChange={(v: HoldingType) => setHoldingType(v)}>
                  <SelectTrigger className={holdingType === 'nominee' ? 'border-red-500 text-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(HOLDING_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key} className={key === 'nominee' ? 'text-red-500 font-bold' : ''}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {holdingType === 'nominee' && (
                  <p className="text-[10px] text-red-500 animate-pulse">⚠️ 代持架构面临极高的法律与道德风险</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>资产所在地 (Jurisdiction)</Label>
              <Select value={location} onValueChange={(v: Region) => setLocation(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {showPassiveCheck && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="passive" checked={isPassive} onCheckedChange={(c) => setIsPassive(!!c)} />
                <Label htmlFor="passive" className="font-normal cursor-pointer">
                  是否为被动资产 (Passive Income)? 
                  <span className="text-xs text-muted-foreground ml-2">(*影响 CFC/PFIC 判定)</span>
                </Label>
              </div>
            )}
          </div>

          {/* 3. 价值信息 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>原币种</Label>
              <Select value={currency} onValueChange={(v: Currency) => setCurrency(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CURRENCY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>取得成本 (Cost)</Label>
              <Input type="number" value={costBase} onChange={e => setCostBase(e.target.value)} placeholder="0.00" />
              <p className="text-[10px] text-muted-foreground">用于计算资本利得税</p>
            </div>
            <div className="space-y-2">
              <Label>当前市价 (Market)</Label>
              <Input type="number" value={marketValue} onChange={e => setMarketValue(e.target.value)} placeholder="0.00" required />
              <p className="text-[10px] text-muted-foreground">用于计算遗产税</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>备注说明</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="信托架构细节、保单具体条款等..." />
          </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-3 bg-muted/10 p-4">
          <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存资产
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
