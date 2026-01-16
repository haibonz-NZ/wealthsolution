export interface WealthCase {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY_CASES = 'wealth_cases';

const getCases = (): WealthCase[] => {
  const casesStr = localStorage.getItem(STORAGE_KEY_CASES);
  return casesStr ? JSON.parse(casesStr) : [];
};

const saveCases = (cases: WealthCase[]) => {
  localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(cases));
};

export const CaseService = {
  // 获取用户的所有案例
  getUserCases: async (userId: string): Promise<WealthCase[]> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    const allCases = getCases();
    return allCases.filter(c => c.userId === userId).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  // 创建新案例
  createCase: async (userId: string, name: string, description?: string): Promise<WealthCase> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newCase: WealthCase = {
      id: `case-${Date.now()}`,
      userId,
      name,
      description,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const cases = getCases();
    cases.push(newCase);
    saveCases(cases);
    
    return newCase;
  },

  // 删除案例
  deleteCase: async (caseId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const cases = getCases();
    const newCases = cases.filter(c => c.id !== caseId);
    saveCases(newCases);
  },

  // 更新案例信息
  updateCase: async (caseId: string, updates: Partial<Pick<WealthCase, 'name' | 'description' | 'status'>>): Promise<WealthCase> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const cases = getCases();
    const index = cases.findIndex(c => c.id === caseId);
    
    if (index === -1) {
      throw new Error('案例不存在');
    }

    const updatedCase = {
      ...cases[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    cases[index] = updatedCase;
    saveCases(cases);
    return updatedCase;
  }
};
