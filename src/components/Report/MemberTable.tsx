import { type FamilyMember, RELATION_LABELS } from "@/services/member";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface MemberTableProps {
  members: FamilyMember[];
}

export function MemberTable({ members }: MemberTableProps) {
  return (
    <div className="rounded-md border bg-white text-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="w-[100px]">姓名/关系</TableHead>
            <TableHead>国籍 (Passport)</TableHead>
            <TableHead>税务居民 (Tax Residency)</TableHead>
            <TableHead>常住地</TableHead>
            <TableHead>健康状况</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">
                <div>{member.name}</div>
                <div className="text-[10px] text-muted-foreground">{RELATION_LABELS[member.relation]}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal">{member.nationality}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                    {member.taxResidencies.map(r => (
                        <Badge key={r} variant="secondary" className="text-[10px] px-1 py-0">{r}</Badge>
                    ))}
                </div>
              </TableCell>
              <TableCell>{member.residence}</TableCell>
              <TableCell>
                {member.healthStatus === 'healthy' ? (
                  <span className="text-green-600">健康</span>
                ) : member.healthStatus === 'sub_healthy' ? (
                  <span className="text-amber-600">亚健康</span>
                ) : (
                  <span className="text-red-600 font-bold">重疾风险</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
