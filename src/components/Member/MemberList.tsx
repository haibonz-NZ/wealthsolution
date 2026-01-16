import { useState, useEffect } from "react";
import { MemberService, type FamilyMember, RELATION_LABELS } from "@/services/member";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, User, Loader2, Plus, Globe, Edit } from "lucide-react";
import { MemberForm } from "./MemberForm";
import { FamilyTree } from "./FamilyTree";
import { toast } from "sonner";

interface MemberListProps {
  caseId: string;
}

export function MemberList({ caseId }: MemberListProps) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>(undefined);

  useEffect(() => {
    loadMembers();
  }, [caseId]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await MemberService.getMembersByCase(caseId);
      setMembers(data);
    } catch (e) {
      toast.error("加载成员失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除该成员吗？")) return;
    try {
      await MemberService.deleteMember(id);
      setMembers(members.filter(m => m.id !== id));
      toast.success("已删除");
    } catch (e) {
      toast.error("删除失败");
    }
  };

  const handleFormSuccess = (member: FamilyMember) => {
    const index = members.findIndex(m => m.id === member.id);
    if (index !== -1) {
      // Update existing member
      const newMembers = [...members];
      newMembers[index] = member;
      setMembers(newMembers);
    } else {
      // Add new member
      setMembers([...members, member]);
    }
    setShowForm(false);
    setEditingMember(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">成员列表 ({members.length})</h3>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> 添加成员
          </Button>
        )}
      </div>

      {showForm && (
        <MemberForm 
          caseId={caseId} 
          memberToEdit={editingMember}
          onSuccess={handleFormSuccess} 
          onCancel={() => {
            setShowForm(false);
            setEditingMember(undefined);
          }} 
        />
      )}

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
      ) : members.length === 0 && !showForm ? (
        <div className="text-center p-12 border border-dashed rounded-lg bg-muted/10">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">暂无家族成员，请点击右上角添加</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(member => (
              <Card key={member.id} className="relative group hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-start gap-4">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                    <AvatarFallback className={member.gender === 'male' ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"}>
                      {member.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-start">
                      <div className="font-semibold">{member.name}</div>
                      <Badge variant="outline">{RELATION_LABELS[member.relation]}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.age}岁 · {member.nationality} · {member.residence}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.healthStatus !== 'healthy' && (
                        <Badge variant="destructive" className="text-xs h-5 px-1.5">
                          健康: {member.healthStatus}
                        </Badge>
                      )}
                      {member.hasImmigrationStatus && (
                        <Badge variant="secondary" className="text-xs h-5 px-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200">
                          <Globe className="w-3 h-3 mr-1" /> 移民: {member.immigrationCountry}
                        </Badge>
                      )}
                      {member.hasSmallCountryIdentity && (
                        <Badge variant="outline" className="text-xs h-5 px-1.5 border-amber-500 text-amber-600">
                          小国身份: {member.smallCountryName}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => {
                        setEditingMember(member);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      onClick={() => handleDelete(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Family Tree Visualization */}
          {members.length > 0 && <FamilyTree members={members} />}
        </>
      )}
    </div>
  );
}
