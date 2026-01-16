import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberService, type FamilyMember, type FamilyRelation, type Region, RELATION_LABELS, GENERATION_LEVEL } from "@/services/member";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

interface MemberFormProps {
  caseId: string;
  onSuccess: (member: FamilyMember) => void;
  onCancel: () => void;
  memberToEdit?: FamilyMember;
}

const REGIONS: { value: Region; label: string }[] = [
  { value: "CN", label: "中国大陆 (CN)" },
  { value: "HK", label: "中国香港 (HK)" },
  { value: "US", label: "美国 (US)" },
  { value: "UK", label: "英国 (UK)" },
  { value: "CA", label: "加拿大 (CA)" },
  { value: "AU", label: "澳大利亚 (AU)" },
  { value: "SG", label: "新加坡 (SG)" },
  { value: "JP", label: "日本 (JP)" },
  { value: "OTHER", label: "其他 (Other)" }
];

export function MemberForm({ caseId, onSuccess, onCancel, memberToEdit }: MemberFormProps) {
  const [loading, setLoading] = useState(false);
  const [existingMembers, setExistingMembers] = useState<FamilyMember[]>([]);
  
  // Basic Info
  const [name, setName] = useState(memberToEdit?.name || "");
  const [relation, setRelation] = useState<FamilyRelation>(memberToEdit?.relation || "self");
  const [parentId, setParentId] = useState<string>(memberToEdit?.parentId || ""); 
  const [partnerId, setPartnerId] = useState<string>(memberToEdit?.partnerId || "");
  const [age, setAge] = useState(memberToEdit?.age?.toString() || "");
  const [gender, setGender] = useState<"male" | "female">(memberToEdit?.gender || "male");
  const [healthStatus, setHealthStatus] = useState<FamilyMember["healthStatus"]>(memberToEdit?.healthStatus || "healthy");
  const [maritalStatus, setMaritalStatus] = useState<FamilyMember["maritalStatus"]>(memberToEdit?.maritalStatus || "single");
  
  // Tax & Residency Info
  const [nationality, setNationality] = useState<Region>(memberToEdit?.nationality || "CN");
  // Robust initialization for taxResidencies to handle legacy data
  const [taxResidencies, setTaxResidencies] = useState<Region[]>(() => {
    if (memberToEdit?.taxResidencies && Array.isArray(memberToEdit.taxResidencies)) {
      return memberToEdit.taxResidencies;
    }
    return ["CN"];
  });
  const [daysInCountry, setDaysInCountry] = useState(memberToEdit?.daysInCountry?.toString() || "");
  const [domicile, setDomicile] = useState(memberToEdit?.domicile ?? true); // Default True (Domiciled)
  
  const [notes, setNotes] = useState(memberToEdit?.notes || "");

  useEffect(() => {
    const load = async () => {
      const members = await MemberService.getMembersByCase(caseId);
      setExistingMembers(members);
    };
    load();
  }, [caseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    try {
      const memberData: any = {
        caseId,
        name,
        relation,
        parentId: parentId || undefined,
        partnerId: partnerId || undefined,
        age: parseInt(age) || 0,
        gender,
        healthStatus,
        maritalStatus,
        nationality,
        taxResidencies,
        notes,
        // Optional logic fields
        daysInCountry: (taxResidencies.includes('US') || taxResidencies.includes('UK') || taxResidencies.includes('JP')) ? parseInt(daysInCountry) || 0 : undefined,
        domicile: taxResidencies.includes('UK') ? domicile : undefined,
      };

      if (memberToEdit) {
        const updatedMember = await MemberService.updateMember(memberToEdit.id, memberData);
        toast.success("成员信息更新成功");
        onSuccess(updatedMember);
      } else {
        const newMember = await MemberService.addMember(memberData);
        toast.success("成员添加成功");
        onSuccess(newMember);
      }
    } catch (e) {
      toast.error("保存失败");
    } finally {
      setLoading(false);
    }
  };

  const toggleTaxResidency = (region: Region) => {
    setTaxResidencies(prev => {
      const list = Array.isArray(prev) ? prev : [];
      return list.includes(region) ? list.filter(r => r !== region) : [...list, region];
    });
  };

  // Logic Helpers
  const showDaysInput = taxResidencies.some(r => ['US', 'UK', 'JP'].includes(r));
  const showDomicileInput = taxResidencies.includes('UK');

  // Parent Selection Logic
  const showParentSelect = 
    (GENERATION_LEVEL[relation] === 2 || GENERATION_LEVEL[relation] === 3) &&
    !relation.includes('_in_law');

  // Partner Selection Logic
  const showPartnerSelect = 
    relation === 'son_in_law' || relation === 'daughter_in_law' ||
    relation === 'self_ex_son_in_law' || relation === 'self_ex_daughter_in_law';

  const getParentOptions = () => {
    if (relation === 'self_ex_grandson' || relation === 'self_ex_granddaughter') {
      return existingMembers.filter(m => m.relation === 'self_ex_son' || m.relation === 'self_ex_daughter');
    }
    if (GENERATION_LEVEL[relation] === 2) {
      return existingMembers.filter(m => GENERATION_LEVEL[m.relation] === 1);
    }
    if (GENERATION_LEVEL[relation] === 3) {
      return existingMembers.filter(m => GENERATION_LEVEL[m.relation] === 2);
    }
    return [];
  };

  const getPartnerOptions = () => {
    if (relation === 'son_in_law') return existingMembers.filter(m => m.relation === 'daughter');
    if (relation === 'daughter_in_law') return existingMembers.filter(m => m.relation === 'son');
    // ... add more pairs if needed
    return [];
  };

  return (
    <Card className="mb-6 border-2 border-primary/10">
      <CardHeader>
        <CardTitle>{memberToEdit ? "编辑成员信息" : "录入成员信息"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-6">
          {/* 1. 基础信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>姓名 <span className="text-red-500">*</span></Label>
              <Input value={name} onChange={e => setName(e.target.value)} required placeholder="请输入姓名" />
            </div>
            <div className="space-y-2">
              <Label>关系</Label>
              <Select value={relation} onValueChange={(v: FamilyRelation) => setRelation(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RELATION_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 2. 身份与税务 (核心升级) */}
          <div className="p-4 bg-muted/20 rounded-lg space-y-4 border border-border/50">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" />
              税务身份判定 (关键)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>国籍 (护照)</Label>
                <Select value={nationality} onValueChange={(v: Region) => setNationality(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>婚姻状态 (影响资产隔离)</Label>
                <Select value={maritalStatus} onValueChange={(v: any) => setMaritalStatus(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">未婚</SelectItem>
                    <SelectItem value="married">已婚</SelectItem>
                    <SelectItem value="divorced">离异</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>税务居民身份 (可多选)</Label>
              <div className="grid grid-cols-3 gap-2">
                {REGIONS.map(r => (
                  <div key={r.value} className="flex items-center space-x-2 border p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => toggleTaxResidency(r.value)}>
                    <Checkbox id={`tr-${r.value}`} checked={taxResidencies.includes(r.value)} onCheckedChange={() => toggleTaxResidency(r.value)} />
                    <Label htmlFor={`tr-${r.value}`} className="cursor-pointer font-normal text-xs">{r.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Fields based on Tax Residency */}
            {(showDaysInput || showDomicileInput) && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                {showDaysInput && (
                  <div className="space-y-2 animate-in fade-in">
                    <Label>年居住天数 (针对 US/UK/JP)</Label>
                    <Input type="number" value={daysInCountry} onChange={e => setDaysInCountry(e.target.value)} placeholder="例如: 183" />
                    <p className="text-[10px] text-muted-foreground">用于判定实质居住测试</p>
                  </div>
                )}
                {showDomicileInput && (
                  <div className="space-y-2 animate-in fade-in">
                    <Label>英国居籍 (Domicile)</Label>
                    <div className="flex items-center space-x-2 h-10">
                      <Checkbox id="domicile" checked={domicile} onCheckedChange={(c) => setDomicile(!!c)} />
                      <Label htmlFor="domicile" className="font-normal">是 (Domiciled)</Label>
                    </div>
                    <p className="text-[10px] text-muted-foreground">未勾选则视为 Non-Dom (汇款制)</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. 个人详情 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>年龄</Label>
              <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>性别</Label>
              <Select value={gender} onValueChange={(v: any) => setGender(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>健康状况</Label>
              <Select value={healthStatus} onValueChange={(v: any) => setHealthStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">健康</SelectItem>
                  <SelectItem value="sub_healthy">亚健康</SelectItem>
                  <SelectItem value="critical">重疾 (需关注)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditional Parent/Partner Selection */}
          {(showParentSelect || showPartnerSelect) && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/10 rounded-md">
              {showParentSelect && (
                <div className="space-y-2">
                  <Label>关联父母</Label>
                  <Select value={parentId} onValueChange={setParentId}>
                    <SelectTrigger><SelectValue placeholder="选择父母" /></SelectTrigger>
                    <SelectContent>
                      {getParentOptions().map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {showPartnerSelect && (
                <div className="space-y-2">
                  <Label>关联配偶</Label>
                  <Select value={partnerId} onValueChange={setPartnerId}>
                    <SelectTrigger><SelectValue placeholder="选择配偶" /></SelectTrigger>
                    <SelectContent>
                      {getPartnerOptions().map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>备注</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="其他详细情况..." />
          </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-3 bg-muted/10 p-4">
          <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存成员
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
