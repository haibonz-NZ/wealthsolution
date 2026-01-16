import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { WizardLayout } from "../WizardLayout";
import { useWizard, type IdentityRegion, type RoleType, type IdentityNode } from "@/contexts/WizardContext";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { User, Users, Baby, Tent, Globe, AlertCircle, X } from "lucide-react";
import worldMap from "@/assets/world-map.jpeg";
import { USAssessment } from "@/components/RiskAssessment/USAssessment";
import { 
  DndContext, 
  DragOverlay, 
  useDraggable, 
  useDroppable, 
  type DragEndEvent, 
  type DragStartEvent 
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

// --- Configuration ---

const REGIONS: { id: IdentityRegion; label: string; x: number; y: number }[] = [
  { id: "CN", label: "中国大陆", x: 78, y: 35 },
  { id: "HK", label: "香港/新加坡", x: 80, y: 45 },
  { id: "US", label: "美国", x: 20, y: 30 }, // Focus on US interaction
  { id: "UK", label: "英国/欧洲", x: 48, y: 25 },
  { id: "AU", label: "澳洲/新西兰", x: 85, y: 75 },
  { id: "JP", label: "日本", x: 88, y: 32 },
  { id: "CA", label: "加拿大", x: 20, y: 20 }, // Separate CA for clarity if needed, or keep grouped
  { id: "OTHER", label: "其他离岸", x: 35, y: 55 }, 
];

const ROLES: { id: RoleType; label: string; icon: any }[] = [
  { id: 'self', label: '本人', icon: User },
  { id: 'spouse', label: '配偶', icon: Users },
  { id: 'child', label: '子女', icon: Baby },
  { id: 'parent', label: '父母', icon: Tent },
];

// --- Sub-components ---

function DraggableAvatar({ id, role, isOverlay = false }: { id: string, role: RoleType, isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: { role }
  });
  
  const RoleIcon = ROLES.find(r => r.id === role)?.icon || User;
  const label = ROLES.find(r => r.id === role)?.label;

  const style = {
    opacity: isDragging && !isOverlay ? 0.3 : 1,
    cursor: 'grab',
    touchAction: 'none'
  };

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes} 
      style={style}
      className={`flex flex-col items-center gap-1 transition-transform ${isOverlay ? 'scale-110 cursor-grabbing' : 'hover:scale-105'}`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-[#B87845] bg-[#FFF2CC] text-[#0C2340] shadow-md`}>
        <RoleIcon className="w-6 h-6" />
      </div>
      <span className="text-[10px] font-bold text-[#0C2340] bg-[#FFF2CC]/80 px-2 py-0.5 rounded-full backdrop-blur-sm">{label}</span>
    </div>
  );
}

function DropZone({ region, children }: { region: typeof REGIONS[0], children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: region.id,
  });

  return (
    <div 
      ref={setNodeRef}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
      style={{ left: `${region.x}%`, top: `${region.y}%` }}
    >
      {/* Target Area Visualization */}
      <div className={`w-16 h-16 rounded-full border-2 border-dashed transition-all duration-300 flex items-center justify-center
        ${isOver ? 'border-[#B87845] bg-[#B87845]/20 scale-125' : 'border-white/10 hover:border-white/30'}
      `}>
        {/* Region Label */}
        {!isOver && children && React.Children.count(children) === 0 && (
           <span className="text-[8px] text-white/50 text-center leading-tight">{region.label}</span>
        )}
      </div>
      
      {/* Placed Items Container */}
      <div className="absolute top-0 left-0 w-full h-full flex flex-wrap items-center justify-center content-center pointer-events-none">
        {children}
      </div>
    </div>
  );
}

// --- Main Page ---

export default function IdentityStep() {
  const [, setLocation] = useLocation();
  const { data, addIdentity, removeIdentity, updateIdentityRisks } = useWizard();
  
  // Drag State
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<RoleType | null>(null);

  // Modal State
  const [showUSModal, setShowUSModal] = useState(false);
  const [pendingIdentityId, setPendingIdentityId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveRole(event.active.data.current?.role as RoleType);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over) {
      const regionId = over.id as IdentityRegion;
      const role = active.data.current?.role as RoleType;
      
      // Check if this source is from the dock (new item)
      if (active.id.toString().startsWith('dock-')) {
        const newId = `id-${Date.now()}`;
        const newIdentity: IdentityNode = {
          id: newId,
          role,
          region: regionId,
          risks: []
        };
        
        addIdentity(newIdentity);

        // Trigger logic if US
        if (regionId === 'US') {
          setPendingIdentityId(newId);
          setShowUSModal(true);
        }
      } 
      // If moving existing item (implement if needed, for now just dock->map)
    }

    setActiveId(null);
    setActiveRole(null);
  };

  const handleRiskComplete = (risks: string[]) => {
    if (pendingIdentityId) {
      updateIdentityRisks(pendingIdentityId, risks);
      setPendingIdentityId(null);
    }
  };

  const handleDelete = (id: string) => {
    removeIdentity(id);
  };

  const handleNext = () => {
    setLocation("/wizard/assets");
  };

  // Prepare placed items for rendering
  const getPlacedItems = (regionId: string) => {
    return data.identities.filter(i => i.region === regionId).map(item => (
      <div key={item.id} className="relative group">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-[#B87845] bg-[#FFF2CC] text-[#0C2340] shadow-sm -ml-2 first:ml-0 z-10 relative`}>
          {(() => {
            const Icon = ROLES.find(r => r.id === item.role)?.icon || User;
            return <Icon className="w-4 h-4" />;
          })()}
        </div>
        {/* Delete Button */}
        <button 
          onClick={() => handleDelete(item.id)}
          className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
        >
          <X className="w-3 h-3" />
        </button>
        {/* Risk Badge */}
        {item.risks.length > 0 && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white z-20 animate-pulse" />
        )}
      </div>
    ));
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <WizardLayout 
        step={1} 
        totalSteps={3} 
        title="家族身份拓扑" 
        subtitle="请将下方家庭成员图标，拖拽至地图上的相应国家。"
        onBack={() => setLocation("/")}
      >
        <div className="flex-1 flex flex-col h-full">
          
          {/* Map Area (Drop Zone) */}
          <div className="relative flex-1 bg-[#0C2340] rounded-2xl overflow-hidden border-2 border-[#B87845]/30 shadow-2xl mb-6">
            <img src={worldMap} alt="World Map" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0C2340]/20 to-[#0C2340]/80 pointer-events-none"></div>
            
            {/* Grid Overlay */}
            <div 
              className="absolute inset-0 opacity-[0.15] pointer-events-none"
              style={{ backgroundImage: `linear-gradient(#B87845 1px, transparent 1px), linear-gradient(90deg, #B87845 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
            />

            {/* Drop Zones */}
            {REGIONS.map((region) => (
              <DropZone key={region.id} region={region}>
                {getPlacedItems(region.id)}
              </DropZone>
            ))}
          </div>

          {/* Avatar Dock (Source) */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[#B87845]/10">
            <div className="text-xs text-[#0C2340]/50 font-bold mb-3 uppercase tracking-wider text-center">身份托盘 (拖拽角色)</div>
            <div className="flex justify-center gap-6">
              {ROLES.map(role => (
                <DraggableAvatar key={role.id} id={`dock-${role.id}`} role={role.id} />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Button 
              size="lg" 
              onClick={handleNext} 
              disabled={data.identities.length === 0}
              className="w-full h-14 bg-[#B87845] text-white font-bold hover:bg-[#A66A3C] shadow-lg shadow-[#B87845]/20"
            >
              下一步
            </Button>
          </div>
        </div>

        {/* Drag Overlay Preview */}
        <DragOverlay>
          {activeId && activeRole ? (
            <DraggableAvatar id={activeId} role={activeRole} isOverlay />
          ) : null}
        </DragOverlay>

        {/* Logic Modal */}
        <USAssessment 
          open={showUSModal} 
          onOpenChange={setShowUSModal}
          onComplete={handleRiskComplete}
          roleLabel={ROLES.find(r => r.id === (data.identities.find(i => i.id === pendingIdentityId)?.role))?.label || "该成员"}
        />

      </WizardLayout>
    </DndContext>
  );
}
