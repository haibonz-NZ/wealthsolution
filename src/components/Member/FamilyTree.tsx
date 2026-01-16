import { useMemo } from "react";
import { type FamilyMember, GENERATION_LEVEL, RELATION_LABELS } from "@/services/member";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Heart, Star, Cloud, HeartCrack } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";

interface FamilyTreeProps {
  members: FamilyMember[];
}

interface TreeNode {
  member: FamilyMember;
  x: number;
  y: number;
  isGhost?: boolean; // If true, render as a reference node (e.g. duplicate Self in past section)
}

interface TreeEdge {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'solid' | 'dashed' | 'step';
  icon?: 'heart' | 'broken_heart' | 'star';
  iconSize?: 'large' | 'small';
}

const NODE_WIDTH = 140;
const NODE_HEIGHT = 100;
const GAP_X = 40;
const SPOUSE_GAP = 60;
const LEVEL_HEIGHT = 180;

// --- Helper Functions ---

// Filter for Main Tree
const isMainTreeMember = (m: FamilyMember) => {
  // Exclude Ex-spouses and their specific descendants
  if (m.relation.includes('ex_')) return false;
  return true;
};

// Filter for Self's Past Relations
const isSelfPastMember = (m: FamilyMember) => {
  return m.relation === 'self_ex_spouse' || 
         m.relation === 'self_ex_son' || 
         m.relation === 'self_ex_daughter' ||
         m.relation === 'self_ex_son_in_law' || 
         m.relation === 'self_ex_daughter_in_law' ||
         m.relation === 'self_ex_grandson' || 
         m.relation === 'self_ex_granddaughter';
};

// Filter for Spouse's Past Relations
const isSpousePastMember = (m: FamilyMember) => {
  return false; // Deprecated relations removed
};

// Layout Engine (Reusable)
const calculateTreeLayout = (
  targetMembers: FamilyMember[], 
  rootMember?: FamilyMember, // Who is the anchor? (Self or Spouse)
  spouseMember?: FamilyMember // Current spouse
) => {
    const nodes: TreeNode[] = [];
    const edges: TreeEdge[] = [];
    const nodeMap = new Map<string, TreeNode>();

    // 1. Identify Key Groups within this subset
    const self = targetMembers.find(m => m.relation === 'self');
    const spouse = targetMembers.find(m => m.relation === 'spouse');
    // ... (Other groups are same as before but limited to targetMembers)
    
    // Group children by parentId logic remains same
    const childrenMap = new Map<string, FamilyMember[]>();
    targetMembers.forEach(m => {
      if ((GENERATION_LEVEL[m.relation] || 0) > 0) {
        if (m.relation.includes('in_law')) return;
        let pid = m.parentId;
        if (!pid && GENERATION_LEVEL[m.relation] === 1 && self) {
           // Heuristic fallback
           pid = self.id;
        }
        if (pid) {
          if (!childrenMap.has(pid)) childrenMap.set(pid, []);
          childrenMap.get(pid)?.push(m);
        }
      }
    });

    // Recursive Measure
    interface LayoutUnit {
      main: FamilyMember;
      spouses: FamilyMember[];
      width: number;
      childrenWidth: number;
      subtreeWidth: number;
      childrenUnits: LayoutUnit[];
    }

    const measureSubtree = (member: FamilyMember): LayoutUnit => {
      const mySpouses = targetMembers.filter(m => m.partnerId === member.id);
      if (member.relation === 'self') {
         const s = targetMembers.filter(m => m.relation === 'spouse');
         mySpouses.push(...s);
      }

      const unitNodeCount = 1 + mySpouses.length;
      const unitWidth = unitNodeCount * NODE_WIDTH + (unitNodeCount - 1) * SPOUSE_GAP;

      const rawChildren = childrenMap.get(member.id) || [];
      mySpouses.forEach(s => {
        const stepKids = childrenMap.get(s.id);
        if (stepKids) rawChildren.push(...stepKids);
      });
      const uniqueChildren = Array.from(new Set(rawChildren));
      
      const childrenUnits = uniqueChildren.map(measureSubtree);
      
      const childrenTotalWidth = childrenUnits.reduce((sum, child) => sum + child.subtreeWidth, 0) 
        + Math.max(0, childrenUnits.length - 1) * GAP_X;

      return {
        main: member,
        spouses: mySpouses,
        width: unitWidth,
        childrenWidth: childrenTotalWidth,
        subtreeWidth: Math.max(unitWidth, childrenTotalWidth),
        childrenUnits
      };
    };

    const renderSubtree = (unit: LayoutUnit, x: number, y: number) => {
      const centerX = x + unit.subtreeWidth / 2;
      const startX = centerX - unit.width / 2;
      let currentX = startX;
      
      nodes.push({ member: unit.main, x: currentX, y });
      nodeMap.set(unit.main.id, { member: unit.main, x: currentX, y });
      const mainNodeX = currentX;
      currentX += NODE_WIDTH + SPOUSE_GAP;

      unit.spouses.forEach(sp => {
        nodes.push({ member: sp, x: currentX, y });
        nodeMap.set(sp.id, { member: sp, x: currentX, y });
        
        edges.push({
          id: `e-c-${unit.main.id}-${sp.id}`,
          x1: mainNodeX + NODE_WIDTH, y1: y + NODE_HEIGHT/2,
          x2: currentX, y2: y + NODE_HEIGHT/2,
          type: 'solid', icon: 'heart', iconSize: 'small'
        });
        currentX += NODE_WIDTH + SPOUSE_GAP;
      });

      if (unit.childrenUnits.length > 0) {
        const nextY = y + LEVEL_HEIGHT;
        const childrenStartX = centerX - unit.childrenWidth / 2;
        let childCurrentX = childrenStartX;

        let sourceX = mainNodeX + NODE_WIDTH / 2;
        if (unit.spouses.length > 0) {
           const sp = unit.spouses[0]; 
           const spNode = nodeMap.get(sp.id);
           if (spNode) sourceX = (mainNodeX + spNode.x + NODE_WIDTH) / 2;
        }
        
        const midY = y + NODE_HEIGHT + (LEVEL_HEIGHT - NODE_HEIGHT)/2;
        edges.push({ id: `e-down-${unit.main.id}`, x1: sourceX, y1: y + NODE_HEIGHT/2, x2: sourceX, y2: midY, type: 'step' });

        let minChildX = Number.MAX_VALUE;
        let maxChildX = Number.MIN_VALUE;

        unit.childrenUnits.forEach(childUnit => {
          const childUnitCenterX = childCurrentX + childUnit.subtreeWidth / 2;
          renderSubtree(childUnit, childCurrentX, nextY);
          
          const childMainX = childUnitCenterX - (childUnit.width / 2) + (NODE_WIDTH / 2); 
          edges.push({ id: `e-up-${childUnit.main.id}`, x1: childMainX, y1: midY, x2: childMainX, y2: nextY, type: 'step' });

          minChildX = Math.min(minChildX, childMainX);
          maxChildX = Math.max(maxChildX, childMainX);
          childCurrentX += childUnit.subtreeWidth + GAP_X;
        });

        edges.push({ id: `e-bar-${unit.main.id}`, x1: minChildX, y1: midY, x2: maxChildX, y2: midY, type: 'step' });
      }
    };

    // Execution Logic
    // We only perform standard layout for Self/Spouse as roots. 
    // Ancestors are handled differently (bottom-up visual tweak) or just standard recursive if we treat Grandparent as root?
    // User wants "Parents above".
    
    // For this specific Refactor, I will reuse the exact logic from previous step for the Main Tree
    // BUT I will modify it to accept `members` subset.
    // The previous implementation had a "bottom-up" ancestor layout + "top-down" descendant layout.
    // I will inline the main tree logic inside the Main Component for stability, and use a simpler logic for Past Relations.
    
    return { nodes, edges };
};


export function FamilyTree({ members }: FamilyTreeProps) {
  // 1. Partition Members
  const mainMembers = useMemo(() => members.filter(isMainTreeMember), [members]);
  
  const selfPastMembers = useMemo(() => {
    const list = members.filter(isSelfPastMember);
    const self = members.find(m => m.relation === 'self');
    if (list.length > 0 && self) list.push({ ...self, relation: 'self' }); // Clone self for context
    return list;
  }, [members]);

  const spousePastMembers = useMemo(() => {
    const list = members.filter(isSpousePastMember);
    const spouse = members.find(m => m.relation === 'spouse');
    if (list.length > 0 && spouse) list.push({ ...spouse, relation: 'spouse' }); // Clone spouse
    return list;
  }, [members]);

  // 2. Layout Main Tree (Reusing the robust "Anti-Overlap" logic from previous version)
  const mainLayout = useMemo(() => {
    if (!mainMembers.length) return { nodes: [], edges: [], width: 0, height: 0 };
    
    // ... (Paste previous "FamilyTree" logic here but operating on mainMembers) ...
    // Since I cannot paste 500 lines easily, I will implement the critical simplified version 
    // that uses the Unit-based layout for descendants which worked well.
    // And standard layout for ancestors.
    
    return calculateMainLayout(mainMembers);
  }, [mainMembers]);

  // 3. Layout Past Relations (Mini Trees)
  // These are simpler: Root (Self/Spouse) - Broken Heart - Ex -> Children
  const renderPastTree = (root: FamilyMember, exMembers: FamilyMember[], offsetId: string) => {
    // Ex-Spouse
    const exSpouse = exMembers.find(m => m.relation.includes('ex_spouse'));
    if (!exSpouse) return null;

    const nodes: TreeNode[] = [];
    const edges: TreeEdge[] = [];
    
    // Position Root (Self/Spouse) at 0,0
    const rootNode = { member: root, x: 0, y: 0, isGhost: true };
    const exNode = { member: exSpouse, x: NODE_WIDTH + 60, y: 0 }; // 60 gap for broken heart
    
    nodes.push(rootNode, exNode);
    
    // Edge
    edges.push({
        id: `e-${offsetId}`,
        x1: NODE_WIDTH, y1: NODE_HEIGHT/2,
        x2: NODE_WIDTH + 60, y2: NODE_HEIGHT/2,
        type: 'dashed', icon: 'broken_heart', iconSize: 'small'
    });

    // Children
    const children = exMembers.filter(m => (GENERATION_LEVEL[m.relation] || 0) > 0);
    // Group children (simple row)
    if (children.length > 0) {
        const level1Y = LEVEL_HEIGHT;
        const totalW = children.length * NODE_WIDTH + (children.length - 1) * GAP_X;
        const centerX = (rootNode.x + NODE_WIDTH + exNode.x) / 2; // Broken heart center
        
        const startX = centerX - totalW / 2;
        children.forEach((c, i) => {
            const cx = startX + i * (NODE_WIDTH + GAP_X);
            nodes.push({ member: c, x: cx, y: level1Y });
            
            // Connect: Heart -> Down -> Child
            // Simplified: Direct lines from heart center for mini tree
            edges.push({
                id: `e-${c.id}`,
                x1: centerX, y1: NODE_HEIGHT/2 + 15, // Below heart
                x2: cx + NODE_WIDTH/2, y2: level1Y,
                type: 'step'
            });
        });
        
        // Adjust Bounds
        const minX = Math.min(0, startX);
        if (minX < 0) {
            const shift = -minX;
            nodes.forEach(n => n.x += shift);
            edges.forEach(e => { e.x1 += shift; e.x2 += shift; });
        }
    }
    
    const maxX = Math.max(...nodes.map(n => n.x + NODE_WIDTH));
    const maxY = Math.max(...nodes.map(n => n.y + NODE_HEIGHT));
    
    return { nodes, edges, width: maxX, height: maxY };
  };

  const selfPastLayout = useMemo(() => {
      const self = selfPastMembers.find(m => m.relation === 'self');
      if (!self) return null;
      return renderPastTree(self, selfPastMembers, 'self-past');
  }, [selfPastMembers]);

  const spousePastLayout = useMemo(() => {
      const spouse = spousePastMembers.find(m => m.relation === 'spouse');
      if (!spouse) return null;
      return renderPastTree(spouse, spousePastMembers, 'spouse-past');
  }, [spousePastMembers]);


  if (!members.length) return null;

  return (
    <div className="space-y-8">
      {/* 1. Main Family Tree */}
      <Card className="border-dashed bg-slate-50/50 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">家族核心关系图谱</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto flex justify-center p-0 min-h-[500px]">
           <GraphView layout={mainLayout} />
        </CardContent>
      </Card>

      {/* 2. Past Relationships Section (Conditional) */}
      {(selfPastLayout || spousePastLayout) && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 text-muted-foreground px-2">
                <HeartCrack className="w-4 h-4" />
                <h3 className="text-sm font-semibold">过往婚姻 / 前任关系分支</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                {selfPastLayout && (
                    <Card className="border-dashed bg-stone-50/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">本人 - 前任关系</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-auto p-4">
                            <GraphView layout={selfPastLayout} isMini />
                        </CardContent>
                    </Card>
                )}
                {spousePastLayout && (
                    <Card className="border-dashed bg-stone-50/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">配偶 - 前任关系</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-auto p-4">
                            <GraphView layout={spousePastLayout} isMini />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
      )}
    </div>
  );
}

// --- Sub Components ---

import { useRef, useEffect, useState } from "react";

function GraphView({ layout, isMini = false }: { layout: { nodes: TreeNode[], edges: TreeEdge[], width: number, height: number }, isMini?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        if (!containerRef.current) return;
        
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const containerWidth = entry.contentRect.width;
                // If isMini, we want to force shrink it more aggressively to fit small card
                // If Main tree, we want to maximize size within container (padding = 0 or small)
                
                const padding = isMini ? 10 : 20; 
                const availableWidth = containerWidth - padding;
                const requiredWidth = layout.width;
                
                let newScale = 1;
                
                if (isMini) {
                    // For mini view, shrink to fit, max 0.8
                    newScale = Math.min(0.8, availableWidth / requiredWidth); 
                } else {
                    // For main view, ALWAYS fit to width to prevent overflow in reports.
                    // Max scale is 1.0 (don't scale up pixelatedly), but shrink as much as needed.
                    const fitScale = availableWidth / requiredWidth;
                    newScale = Math.min(1.0, fitScale);
                }
                
                setScale(newScale);
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [layout.width, isMini]);

    if (!layout || layout.nodes.length === 0) return <div className="p-8 text-muted-foreground text-sm">暂无数据</div>;
    
    return (
        <div ref={containerRef} className={`w-full overflow-x-auto overflow-y-hidden flex justify-center origin-top ${isMini ? 'h-[200px] items-center' : ''}`}>
            <div 
                style={{ 
                    width: layout.width, 
                    height: layout.height + 40, // Add padding to height to prevent bottom cropping
                    position: 'relative', 
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    // Adjust margin bottom only if not mini (mini has fixed container)
                    marginBottom: isMini ? 0 : -(layout.height * (1 - scale)) + 20
                }}
            >
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {layout.edges.map((e) => {
                const color = e.type === 'dashed' ? '#94a3b8' : '#334155';
                if (e.type === 'dashed') {
                    return <line key={e.id} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={color} strokeWidth="2" strokeDasharray="6 4" />;
                } else if (e.type === 'solid') {
                    return <line key={e.id} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={color} strokeWidth="2" />;
                } else {
                    return (
                        <path 
                            key={e.id} 
                            d={`M ${e.x1} ${e.y1} V ${(e.y1+e.y2)/2} H ${e.x2} V ${e.y2}`} 
                            stroke="#64748b" 
                            strokeWidth="2" 
                            fill="none" 
                        />
                    );
                }
            })}
          </svg>
          
          {layout.edges.map((e) => {
              if (!e.icon) return null;
              const size = e.iconSize === 'large' ? 24 : 16;
              const offset = size / 2;
              let cx, cy;
              if (e.type === 'step') {
                  cx = e.x1; cy = e.y1; 
              } else {
                  cx = (e.x1 + e.x2) / 2;
                  cy = (e.y1 + e.y2) / 2;
              }

              return (
                  <div 
                    key={`icon-${e.id}`}
                    className="absolute z-10 bg-slate-50 rounded-full" 
                    style={{
                        left: cx - offset,
                        top: cy - offset,
                        width: size,
                        height: size
                    }}
                  >
                      {e.icon === 'heart' && <Heart className={`w-full h-full text-red-500 fill-red-500`} />}
                      {e.icon === 'broken_heart' && <HeartCrack className={`w-full h-full text-slate-400 fill-slate-200`} />} 
                      {e.icon === 'star' && <Star className={`w-full h-full text-amber-500 fill-amber-500`} />}
                  </div>
              );
          })}

          {layout.nodes.map((n) => {
            const isUnhealthy = n.member.healthStatus && n.member.healthStatus !== 'healthy';
            const borderColor = isUnhealthy ? 'border-red-400' : (n.member.relation === 'self' ? 'border-[#d4af37]' : 'border-slate-200');
            const bgColor = isUnhealthy ? 'bg-red-50' : (n.member.relation === 'self' ? 'bg-[#d4af37]/20' : 'bg-gray-100');
            const nameColor = isUnhealthy ? 'text-red-700 font-bold' : '';

            return (
            <div
              key={n.member.id + (n.isGhost ? '-ghost' : '')}
              className={`absolute flex flex-col p-2 rounded-lg border shadow-sm hover:shadow-md transition-shadow text-xs 
                ${n.isGhost ? 'opacity-70 border-dashed bg-slate-50' : `${bgColor} ${borderColor}`}
              `}
              style={{
                left: n.x,
                top: n.y,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
              }}
            >
              <div className={`truncate text-sm mb-1 ${nameColor || 'font-bold'}`}>
                {n.member.name}
              </div>
              <div className="flex items-center justify-between mb-1">
                <Badge className="px-1 py-0 text-[10px] h-4 max-w-[80px] truncate bg-[#d4af37]/10 text-[#856404] hover:bg-[#d4af37]/20 border border-[#d4af37]/20 shadow-none" title={RELATION_LABELS[n.member.relation]}>
                    {RELATION_LABELS[n.member.relation]}
                </Badge>
                <span className="text-muted-foreground scale-90">{n.member.age}岁</span>
              </div>
              
              {!n.isGhost && (
                  <div className="space-y-0.5 text-[10px] text-muted-foreground border-t pt-1 mt-1">
                    <div className="flex justify-between truncate" title={n.member.nationality}>
                        <span>国: {n.member.nationality}</span>
                    </div>
                    <div className="truncate" title={n.member.residence}>
                        住: {n.member.residence}
                    </div>
                    {n.member.healthStatus !== 'healthy' && (
                        <div className="text-red-500 font-medium">
                            健: {n.member.healthStatus === 'critical' ? '重疾' : '亚健康'}
                        </div>
                    )}
                  </div>
              )}
            </div>
          )})}
        </div>
      </div>
    );
}

// ----------------------------------------------------------------------
// Re-implementing the robust Main Layout Logic from previous step 
// but encapsulated in a function to keep the component clean
// ----------------------------------------------------------------------
function calculateMainLayout(members: FamilyMember[]) {
    const nodes: TreeNode[] = [];
    const edges: TreeEdge[] = [];
    
    // Copy-paste logic from previous robust version
    // --- 1. Identify Members & Groups ---
    const self = members.find(m => m.relation === 'self');
    const spouse = members.find(m => m.relation === 'spouse');
    const selfSiblings = members.filter(m => m.relation === 'brother' || m.relation === 'sister');
    const spouseSiblings = members.filter(m => (m.relation as string) === 'brother_in_law' || (m.relation as string) === 'sister_in_law');

    const father = members.find(m => m.relation === 'father');
    const mother = members.find(m => m.relation === 'mother');
    const fatherInLaw = members.find(m => m.relation === 'father_in_law');
    const motherInLaw = members.find(m => m.relation === 'mother_in_law');

    const paternalGF = members.find(m => (m.relation as string) === 'paternal_grandfather' || (m.relation as string) === 'grandfather');
    const paternalGM = members.find(m => (m.relation as string) === 'paternal_grandmother' || (m.relation as string) === 'grandmother');
    const maternalGF = members.find(m => (m.relation as string) === 'maternal_grandfather');
    const maternalGM = members.find(m => (m.relation as string) === 'maternal_grandmother');
    
    const spousePaternalGF = members.find(m => (m.relation as string) === 'spouse_paternal_grandfather' || (m.relation as string) === 'spouse_grandfather');
    const spousePaternalGM = members.find(m => (m.relation as string) === 'spouse_paternal_grandmother' || (m.relation as string) === 'spouse_grandmother');
    const spouseMaternalGF = members.find(m => (m.relation as string) === 'spouse_maternal_grandfather');
    const spouseMaternalGM = members.find(m => (m.relation as string) === 'spouse_maternal_grandmother');

    const commonChildren = members.filter(m => m.relation === 'son' || m.relation === 'daughter');
    const childrenSpouses = members.filter(m => m.relation === 'son_in_law' || m.relation === 'daughter_in_law');

    const grandChildren = members.filter(m => GENERATION_LEVEL[m.relation] === 2 && (m.relation as string) !== 'grandson_in_law' && (m.relation as string) !== 'granddaughter_in_law');
    const grandChildrenSpouses = members.filter(m => (m.relation as string) === 'grandson_in_law' || (m.relation as string) === 'granddaughter_in_law');
    
    const greatGrandChildren = members.filter(m => GENERATION_LEVEL[m.relation] === 3);

    // --- 2. Calculate Dynamic Gaps ---
    const GP_HALF_WIDTH = 175; 
    const NODE_HALF_WIDTH = 70; 
    
    const hasPatGP = !!(paternalGF || paternalGM);
    const hasMatGP = !!(maternalGF || maternalGM);
    const hasSpousePatGP = !!(spousePaternalGF || spousePaternalGM);
    const hasSpouseMatGP = !!(spouseMaternalGF || spouseMaternalGM);

    const reqParentsDist = (hasPatGP ? GP_HALF_WIDTH : NODE_HALF_WIDTH) + (hasMatGP ? GP_HALF_WIDTH : NODE_HALF_WIDTH) + GAP_X;
    const parentsGap = Math.max(40, reqParentsDist - NODE_WIDTH); 

    const reqInLawsDist = (hasSpousePatGP ? GP_HALF_WIDTH : NODE_HALF_WIDTH) + (hasSpouseMatGP ? GP_HALF_WIDTH : NODE_HALF_WIDTH) + GAP_X;
    const inLawsGap = Math.max(40, reqInLawsDist - NODE_WIDTH);

    const selfRightBound = (father || mother) 
        ? ((NODE_WIDTH + parentsGap) / 2) + (hasMatGP ? GP_HALF_WIDTH : NODE_HALF_WIDTH)
        : NODE_HALF_WIDTH;

    const spouseLeftBound = (fatherInLaw || motherInLaw)
        ? ((NODE_WIDTH + inLawsGap) / 2) + (hasSpousePatGP ? GP_HALF_WIDTH : NODE_HALF_WIDTH)
        : NODE_HALF_WIDTH;

    const reqCoupleDist = selfRightBound + spouseLeftBound + GAP_X;
    const coupleGap = Math.max(40, reqCoupleDist - NODE_WIDTH); 

    // --- 3. Layout Strategy ---
    const level0Y = LEVEL_HEIGHT * 2.5; 
    let currentX = 50;

    const selfSibNodes: TreeNode[] = [];
    selfSiblings.forEach(m => {
        const node = { member: m, x: currentX, y: level0Y };
        selfSibNodes.push(node);
        nodes.push(node);
        currentX += NODE_WIDTH + GAP_X;
    });
    if (selfSiblings.length > 0) currentX += 20;

    let selfNode: TreeNode | undefined;
    if (self) {
        selfNode = { member: self, x: currentX, y: level0Y };
        nodes.push(selfNode);
        currentX += NODE_WIDTH;
    }

    let spouseNode: TreeNode | undefined;
    if (spouse) {
        currentX += coupleGap; 
        spouseNode = { member: spouse, x: currentX, y: level0Y };
        nodes.push(spouseNode);
        currentX += NODE_WIDTH + GAP_X;
    } else {
        currentX += GAP_X;
    }

    const spouseSibNodes: TreeNode[] = [];
    if (spouseSiblings.length > 0) currentX += 20;
    spouseSiblings.forEach(m => {
        const node = { member: m, x: currentX, y: level0Y };
        spouseSibNodes.push(node);
        nodes.push(node);
        currentX += NODE_WIDTH + GAP_X;
    });

    const level0Width = currentX;

    const layoutCoupleAbove = (p1: FamilyMember | undefined, p2: FamilyMember | undefined, targetCenterX: number, y: number, gap: number) => {
        let n1, n2;
        let centerX = targetCenterX;
        if (p1 && p2) {
            const pairW = NODE_WIDTH * 2 + gap; 
            const start = targetCenterX - pairW / 2;
            n1 = { member: p1, x: start, y };
            n2 = { member: p2, x: start + NODE_WIDTH + gap, y };
            nodes.push(n1, n2);
            edges.push({ id: `e-${p1.id}-${p2.id}`, x1: n1.x + NODE_WIDTH, y1: y + NODE_HEIGHT/2, x2: n2.x, y2: y + NODE_HEIGHT/2, type: 'solid', icon: 'heart', iconSize: 'small' });
            centerX = (n1.x + NODE_WIDTH + n2.x) / 2;
        } else if (p1) {
            n1 = { member: p1, x: targetCenterX - NODE_WIDTH/2, y };
            nodes.push(n1);
            centerX = n1.x + NODE_WIDTH/2;
        } else if (p2) {
            n2 = { member: p2, x: targetCenterX - NODE_WIDTH/2, y };
            nodes.push(n2);
            centerX = n2.x + NODE_WIDTH/2;
        }
        return { n1, n2, centerX };
    };

    const levelMinus1Y = LEVEL_HEIGHT * 1.5;
    const levelMinus2Y = LEVEL_HEIGHT * 0.5;

    const selfCenterX = selfNode ? (selfNode.x + NODE_WIDTH/2) : (level0Width/2);
    const { n1: fNode, n2: mNode, centerX: selfParentsCX } = layoutCoupleAbove(father, mother, selfCenterX, levelMinus1Y, parentsGap);

    const spouseCenterX = spouseNode ? (spouseNode.x + NODE_WIDTH/2) : 0;
    const { n1: filNode, n2: milNode, centerX: spouseParentsCX } = layoutCoupleAbove(fatherInLaw, motherInLaw, spouseCenterX, levelMinus1Y, inLawsGap);

    if (fNode) layoutCoupleAbove(paternalGF, paternalGM, fNode.x + NODE_WIDTH/2, levelMinus2Y, 40);
    if (mNode) layoutCoupleAbove(maternalGF, maternalGM, mNode.x + NODE_WIDTH/2, levelMinus2Y, 40);
    if (filNode) layoutCoupleAbove(spousePaternalGF, spousePaternalGM, filNode.x + NODE_WIDTH/2, levelMinus2Y, 40);
    if (milNode) layoutCoupleAbove(spouseMaternalGF, spouseMaternalGM, milNode.x + NODE_WIDTH/2, levelMinus2Y, 40);

    const level1Y = LEVEL_HEIGHT * 3.5;

    const layoutChildrenUnits = (kids: FamilyMember[], spouses: FamilyMember[], centerX: number, parentY: number, levelY: number) => {
        if (!kids.length) return;
        const units: { kid: FamilyMember, spouse?: FamilyMember }[] = [];
        const unmatchedSpouses = [...spouses];
        kids.forEach(k => {
            const sIndex = unmatchedSpouses.findIndex(s => s.partnerId === k.id);
            if (sIndex >= 0) {
                units.push({ kid: k, spouse: unmatchedSpouses[sIndex] });
                unmatchedSpouses.splice(sIndex, 1);
            } else {
                units.push({ kid: k });
            }
        });
        
        let totalW = 0;
        units.forEach((u, i) => {
            if (u.spouse) totalW += (NODE_WIDTH * 2 + 40); 
            else totalW += NODE_WIDTH;
            if (i < units.length - 1) totalW += GAP_X;
        });
        
        const startX = centerX - totalW / 2;
        let currentUnitX = startX;
        const kidNodes: TreeNode[] = [];
        
        units.forEach(u => {
            const kNode = { member: u.kid, x: currentUnitX, y: levelY };
            kidNodes.push(kNode);
            nodes.push(kNode);
            
            if (u.spouse) {
                const sNode = { member: u.spouse, x: currentUnitX + NODE_WIDTH + 40, y: levelY };
                nodes.push(sNode);
                edges.push({ id: `e-${u.kid.id}-${u.spouse.id}`, x1: kNode.x + NODE_WIDTH, y1: kNode.y + NODE_HEIGHT/2, x2: sNode.x, y2: sNode.y + NODE_HEIGHT/2, type: 'solid', icon: 'heart', iconSize: 'small' });
                currentUnitX += (NODE_WIDTH * 2 + 40) + GAP_X;
            } else {
                currentUnitX += NODE_WIDTH + GAP_X;
            }
        });

        const midY = (parentY + levelY) / 2;
        edges.push({ id: `e-down-${centerX}`, x1: centerX, y1: parentY, x2: centerX, y2: midY, type: 'step' });
        const minX = kidNodes[0].x + NODE_WIDTH/2;
        const lastKidNode = kidNodes[kidNodes.length-1];
        const maxX = lastKidNode.x + NODE_WIDTH/2;
        edges.push({ id: `e-bar-${centerX}`, x1: minX, y1: midY, x2: maxX, y2: midY, type: 'step' });
        kidNodes.forEach(k => {
            edges.push({ id: `e-k-${k.member.id}`, x1: k.x + NODE_WIDTH/2, y1: midY, x2: k.x + NODE_WIDTH/2, y2: k.y, type: 'step' });
        });
    };

    if (selfNode && spouseNode) {
        const heartX = (selfNode.x + NODE_WIDTH + spouseNode.x) / 2;
        const heartY = selfNode.y + NODE_HEIGHT/2;
        layoutChildrenUnits(commonChildren, childrenSpouses, heartX, heartY, level1Y);
        edges.push({ id: 'e-self-spouse', x1: selfNode.x + NODE_WIDTH, y1: selfNode.y + NODE_HEIGHT/2, x2: spouseNode.x, y2: spouseNode.y + NODE_HEIGHT/2, type: 'solid', icon: 'heart', iconSize: 'large' });
    }

    // Sibling Chains
    if (selfSibNodes.length > 0) {
        for (let i = 0; i < selfSibNodes.length - 1; i++) {
            edges.push({ id: `e-sib-${i}`, x1: selfSibNodes[i].x + NODE_WIDTH, y1: level0Y + NODE_HEIGHT/2, x2: selfSibNodes[i+1].x, y2: level0Y + NODE_HEIGHT/2, type: 'dashed' });
        }
        if (selfNode) {
            const last = selfSibNodes[selfSibNodes.length-1];
            edges.push({ id: `e-sib-self`, x1: last.x + NODE_WIDTH, y1: level0Y + NODE_HEIGHT/2, x2: selfNode.x, y2: level0Y + NODE_HEIGHT/2, type: 'dashed' });
        }
    }
    if (spouseSibNodes.length > 0 && spouseNode) {
        const first = spouseSibNodes[0];
        edges.push({ id: `e-spouse-sib`, x1: spouseNode.x + NODE_WIDTH, y1: level0Y + NODE_HEIGHT/2, x2: first.x, y2: level0Y + NODE_HEIGHT/2, type: 'dashed' });
        for (let i = 0; i < spouseSibNodes.length - 1; i++) {
            edges.push({ id: `e-spsib-${i}`, x1: spouseSibNodes[i].x + NODE_WIDTH, y1: level0Y + NODE_HEIGHT/2, x2: spouseSibNodes[i+1].x, y2: level0Y + NODE_HEIGHT/2, type: 'dashed' });
        }
    }

    const level2Y = LEVEL_HEIGHT * 4.5;
    const level3Y = LEVEL_HEIGHT * 5.5;

    // Descendants Recursion
    const layoutDescendantsUnits = (descendants: FamilyMember[], descendantSpouses: FamilyMember[], potentialParents: FamilyMember[], parentLevelY: number, targetY: number) => {
        const parentGroups: Record<string, FamilyMember[]> = {};
        descendants.forEach(d => {
            if (d.parentId) {
                if (!parentGroups[d.parentId]) parentGroups[d.parentId] = [];
                parentGroups[d.parentId].push(d);
            }
        });

        potentialParents.forEach(p => {
            const kids = parentGroups[p.id];
            // Fix: Check strictly for children existence before calculating positions or drawing lines
            if (kids && kids.length > 0) {
                const parentNode = nodes.find(n => n.member.id === p.id);
                let startX = 0;
                let startY = 0;
                if (parentNode) {
                    const coupleEdge = edges.find(e => 
                        (e.type === 'solid' && e.icon === 'heart') &&
                        ((Math.abs(e.x1 - (parentNode.x + NODE_WIDTH)) < 1 && Math.abs(e.y1 - (parentNode.y + NODE_HEIGHT/2)) < 1) || 
                         (Math.abs(e.x2 - (parentNode.x)) < 1 && Math.abs(e.y2 - (parentNode.y + NODE_HEIGHT/2)) < 1))
                    );
                    if (coupleEdge) {
                        startX = (coupleEdge.x1 + coupleEdge.x2) / 2;
                        startY = coupleEdge.y1; 
                    } else {
                        startX = parentNode.x + NODE_WIDTH/2;
                        startY = parentNode.y + NODE_HEIGHT;
                    }
                    layoutChildrenUnits(kids, descendantSpouses, startX, startY, targetY);
                }
            }
        });
    };

    const potentialLevel1Parents = [...commonChildren];
    layoutDescendantsUnits(grandChildren, grandChildrenSpouses, potentialLevel1Parents, level1Y + NODE_HEIGHT, level2Y);
    layoutDescendantsUnits(greatGrandChildren, [], grandChildren, level2Y + NODE_HEIGHT, level3Y);

    // Only draw upward line if parents exist AND their nodes are actually rendered
    // Check if parent nodes exist in the nodes array
    const hasRenderedParents = nodes.some(n => n.member.relation === 'father' || n.member.relation === 'mother');
    if ((father || mother) && hasRenderedParents && selfParentsCX && selfNode) {
        const heartY = levelMinus1Y + NODE_HEIGHT/2;
        edges.push({ id: 'e-parents-self', x1: selfParentsCX, y1: heartY, x2: selfNode.x + NODE_WIDTH/2, y2: selfNode.y, type: 'step' });
    }

    const hasRenderedInLaws = nodes.some(n => n.member.relation === 'father_in_law' || n.member.relation === 'mother_in_law');
    if ((fatherInLaw || motherInLaw) && hasRenderedInLaws && spouseParentsCX && spouseNode) {
        const heartY = levelMinus1Y + NODE_HEIGHT/2;
        edges.push({ id: 'e-inlaws-spouse', x1: spouseParentsCX, y1: heartY, x2: spouseNode.x + NODE_WIDTH/2, y2: spouseNode.y, type: 'step' });
    }
    
    // Connect GPs
    const getCoupleCenter = (p1?: FamilyMember, p2?: FamilyMember) => {
        const n1 = nodes.find(n => n.member === p1);
        const n2 = nodes.find(n => n.member === p2);
        if (n1 && n2) return (n1.x + NODE_WIDTH + n2.x) / 2;
        if (n1) return n1.x + NODE_WIDTH/2;
        if (n2) return n2.x + NODE_WIDTH/2;
        return null;
    };
    const patGPCX = getCoupleCenter(paternalGF, paternalGM);
    if (patGPCX && fNode) edges.push({ id: 'e-pgp-f', x1: patGPCX, y1: levelMinus2Y + NODE_HEIGHT/2, x2: fNode.x + NODE_WIDTH/2, y2: fNode.y, type: 'step' });
    
    const matGPCX = getCoupleCenter(maternalGF, maternalGM);
    if (matGPCX && mNode) edges.push({ id: 'e-mgp-m', x1: matGPCX, y1: levelMinus2Y + NODE_HEIGHT/2, x2: mNode.x + NODE_WIDTH/2, y2: mNode.y, type: 'step' });
    
    const spGPCX = getCoupleCenter(spousePaternalGF, spousePaternalGM);
    if (spGPCX && filNode) edges.push({ id: 'e-spgp-fil', x1: spGPCX, y1: levelMinus2Y + NODE_HEIGHT/2, x2: filNode.x + NODE_WIDTH/2, y2: filNode.y, type: 'step' });
    
    const smGPCX = getCoupleCenter(spouseMaternalGF, spouseMaternalGM);
    if (smGPCX && milNode) edges.push({ id: 'e-smgp-mil', x1: smGPCX, y1: levelMinus2Y + NODE_HEIGHT/2, x2: milNode.x + NODE_WIDTH/2, y2: milNode.y, type: 'step' });

    // Finalize Bounds & Symmetric Centering
    // Goal: Ensure Self+Spouse center point is exactly at canvas width / 2
    
    // 1. Find Core Center (Self + Spouse)
    let coreCenterX = 0;
    if (selfNode && spouseNode) {
        coreCenterX = (selfNode.x + NODE_WIDTH + spouseNode.x) / 2; // Center of the gap between them
    } else if (selfNode) {
        coreCenterX = selfNode.x + NODE_WIDTH / 2;
    } else if (spouseNode) {
        coreCenterX = spouseNode.x + NODE_WIDTH / 2;
    } else {
        // Fallback: center of all nodes
        const allX = nodes.map(n => n.x);
        coreCenterX = (Math.min(...allX) + Math.max(...allX)) / 2;
    }

    // 2. Calculate Wings
    // Current bounds relative to 0
    const currentMinX = Math.min(...nodes.map(n => n.x));
    const currentMaxX = Math.max(...nodes.map(n => n.x + NODE_WIDTH));
    
    const leftWing = coreCenterX - currentMinX;
    const rightWing = currentMaxX - coreCenterX;
    
    const maxWing = Math.max(leftWing, rightWing) + 50; // Add padding
    
    // 3. Create Symmetric Canvas
    const finalWidth = Math.max(maxWing * 2, 1000); // Minimum 1000px wide
    const canvasCenterX = finalWidth / 2;
    
    // 4. Shift Everything
    const shiftX = canvasCenterX - coreCenterX;
    
    nodes.forEach(n => n.x += shiftX);
    edges.forEach(e => { e.x1 += shiftX; e.x2 += shiftX; });

    // 5. Calculate Height
    const allY = nodes.map(n => n.y);
    const maxY = Math.max(...allY);
    const height = maxY + NODE_HEIGHT + 50;

    return { nodes, edges, width: finalWidth, height };
}
