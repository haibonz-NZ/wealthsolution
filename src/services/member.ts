// 8 Major Jurisdictions
export type Region = "CN" | "US" | "UK" | "CA" | "AU" | "SG" | "JP" | "HK" | "OTHER";

export type FamilyRelation = 
  | "self" 
  | "spouse" 
  | "child" 
  | "son" // Legacy alias for child
  | "daughter" // Legacy alias for child
  | "parent" 
  | "father" // Legacy alias for parent
  | "mother" // Legacy alias for parent
  | "father_in_law" 
  | "mother_in_law"
  | "grandchild"
  | "grandson" // Legacy
  | "granddaughter" // Legacy
  | "son_in_law" 
  | "daughter_in_law"
  | "brother"
  | "sister"
  | "self_ex_spouse"
  | "self_ex_son"
  | "self_ex_daughter"
  | "self_ex_son_in_law"
  | "self_ex_daughter_in_law"
  | "self_ex_grandson"
  | "self_ex_granddaughter";

export const RELATION_LABELS: Record<string, string> = {
  self: "本人",
  spouse: "配偶",
  child: "子女",
  son: "儿子",
  daughter: "女儿",
  parent: "父母",
  father: "父亲",
  mother: "母亲",
  father_in_law: "岳父/公公",
  mother_in_law: "岳母/婆婆",
  grandchild: "孙辈",
  grandson: "孙子/外孙",
  granddaughter: "孙女/外孙女",
  son_in_law: "女婿",
  daughter_in_law: "儿媳",
  brother: "兄弟",
  sister: "姐妹",
  self_ex_spouse: "前妻/前夫",
  self_ex_son: "前任子女(男)",
  self_ex_daughter: "前任子女(女)",
  self_ex_son_in_law: "前任女婿",
  self_ex_daughter_in_law: "前任儿媳",
  self_ex_grandson: "前任孙辈(男)",
  self_ex_granddaughter: "前任孙辈(女)",
};

export const GENERATION_LEVEL: Record<string, number> = {
  self: 1, spouse: 1, brother: 1, sister: 1, self_ex_spouse: 1,
  child: 2, son: 2, daughter: 2, son_in_law: 2, daughter_in_law: 2, self_ex_son: 2, self_ex_daughter: 2, self_ex_son_in_law: 2, self_ex_daughter_in_law: 2,
  parent: 0, father: 0, mother: 0, father_in_law: 0, mother_in_law: 0,
  grandchild: 3, grandson: 3, granddaughter: 3, self_ex_grandson: 3, self_ex_granddaughter: 3
};

export interface FamilyMember {
  id: string;
  caseId: string;
  name: string;
  relation: FamilyRelation;
  parentId?: string;
  partnerId?: string;
  age: number;
  gender: "male" | "female";
  
  // V2.0 Core Fields
  nationality: Region; // Primary Nationality
  taxResidencies: Region[]; // Multi-select
  daysInCountry?: number; // For US/UK/JP test
  domicile?: boolean; // For UK Non-Dom (True = Domiciled, False = Non-Dom)
  
  healthStatus: "healthy" | "sub_healthy" | "critical";
  maritalStatus: "single" | "married" | "divorced";
  
  // Legacy fields kept for backward compatibility if needed, but UI should focus on above
  residence?: string;
  notes?: string;
  
  // Deprecated but kept to avoid breaking old data immediately
  hasImmigrationStatus?: boolean;
  immigrationCountry?: string;
  residencyStatus?: string[];
  residencyStatusOther?: string;
  hasSmallCountryIdentity?: boolean;
  smallCountryName?: string;
  chinaDocumentsCancelled?: {
    hukou: boolean;
    idCard: boolean;
    passport: boolean;
  };
}

export const MemberService = {
  getMembersByCase: async (caseId: string): Promise<FamilyMember[]> => {
    const allMembers = JSON.parse(localStorage.getItem("wealth_family_members") || "[]");
    return allMembers.filter((m: FamilyMember) => m.caseId === caseId);
  },

  addMember: async (member: Omit<FamilyMember, "id">): Promise<FamilyMember> => {
    const newMember = { ...member, id: `mem-${Date.now()}` };
    const allMembers = JSON.parse(localStorage.getItem("wealth_family_members") || "[]");
    allMembers.push(newMember);
    localStorage.setItem("wealth_family_members", JSON.stringify(allMembers));
    return newMember;
  },

  updateMember: async (id: string, updates: Partial<FamilyMember>): Promise<FamilyMember> => {
    const allMembers = JSON.parse(localStorage.getItem("wealth_family_members") || "[]");
    const index = allMembers.findIndex((m: FamilyMember) => m.id === id);
    if (index === -1) throw new Error("Member not found");
    
    const updatedMember = { ...allMembers[index], ...updates };
    allMembers[index] = updatedMember;
    localStorage.setItem("wealth_family_members", JSON.stringify(allMembers));
    return updatedMember;
  },

  deleteMember: async (id: string): Promise<void> => {
    const allMembers = JSON.parse(localStorage.getItem("wealth_family_members") || "[]");
    const filtered = allMembers.filter((m: FamilyMember) => m.id !== id);
    localStorage.setItem("wealth_family_members", JSON.stringify(filtered));
  }
};
