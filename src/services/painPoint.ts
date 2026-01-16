export type PainPointType = 
  | 'tax_optimization'
  | 'local_tax_optimization'
  | 'crs_optimization'
  | 'tax_filing'
  | 'asset_protection'
  | 'identity_planning'
  | 'wealth_succession'
  | 'compliance'
  | 'investment_diversification'
  | 'privacy_protection'
  | 'business_succession'
  | 'philanthropy'
  | 'other';

export const PAIN_POINT_LABELS: Record<PainPointType, string> = {
  tax_optimization: '全球税务筹划',
  local_tax_optimization: '本地税务优化',
  crs_optimization: 'CRS优化',
  tax_filing: '税务申报',
  asset_protection: '资产保护',
  identity_planning: '身份规划',
  wealth_succession: '家族传承',
  compliance: '合规整改',
  investment_diversification: '投资多元化',
  privacy_protection: '隐私保护',
  business_succession: '企业传承',
  philanthropy: '慈善规划',
  other: '其他'
};

export const PAIN_POINT_DESCRIPTIONS: Record<PainPointType, string> = {
  tax_optimization: '跨国资产配置税务筹划、遗产税规避',
  local_tax_optimization: '居住国/籍国本地税务合规与优化',
  crs_optimization: 'CRS/FATCA 信息交换合规与应对策略',
  tax_filing: '本地的个人所得税。海外资产以及海外企业申报与合规。',
  asset_protection: '资产隔离、婚姻风险防范、债务防火墙',
  identity_planning: '海外身份配置、通行便利、子女教育',
  wealth_succession: '代际财富传递、防败家子、遗嘱与信托',
  compliance: '存量资产合规、资金出入境合规、架构重组',
  investment_diversification: '全球资产配置、抗通胀、风险分散',
  privacy_protection: '信息保密、避免财富外露、去实名化',
  business_succession: '家族企业接班、股权治理、二代培养',
  philanthropy: '家族慈善基金、社会影响力投资',
  other: '其他特定需求或综合性问题'
};

export interface PainPoint {
  id: string;
  caseId: string;
  type: PainPointType;
  description?: string; // 用户补充的详细描述
  priority: number; // 排序优先级，越小越靠前
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY_PAIN_POINTS = 'wealth_pain_points';

const getPainPoints = (): PainPoint[] => {
  const str = localStorage.getItem(STORAGE_KEY_PAIN_POINTS);
  return str ? JSON.parse(str) : [];
};

const savePainPoints = (list: PainPoint[]) => {
  localStorage.setItem(STORAGE_KEY_PAIN_POINTS, JSON.stringify(list));
};

export const PainPointService = {
  getByCase: async (caseId: string): Promise<PainPoint[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const all = getPainPoints();
    return all
      .filter(p => p.caseId === caseId)
      .sort((a, b) => a.priority - b.priority);
  },

  addOrUpdate: async (caseId: string, type: PainPointType, description?: string): Promise<PainPoint> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const all = getPainPoints();
    
    // Check if exists
    const existingIndex = all.findIndex(p => p.caseId === caseId && p.type === type);
    
    if (existingIndex >= 0) {
      // Update
      const updated = {
        ...all[existingIndex],
        description,
        updatedAt: new Date().toISOString()
      };
      all[existingIndex] = updated;
      savePainPoints(all);
      return updated;
    } else {
      // Add
      const currentCasePoints = all.filter(p => p.caseId === caseId);
      const maxPriority = currentCasePoints.length > 0 
        ? Math.max(...currentCasePoints.map(p => p.priority)) 
        : 0;
        
      const newItem: PainPoint = {
        id: `pp-${Date.now()}`,
        caseId,
        type,
        description,
        priority: maxPriority + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      all.push(newItem);
      savePainPoints(all);
      return newItem;
    }
  },

  remove: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const all = getPainPoints();
    const filtered = all.filter(p => p.id !== id);
    savePainPoints(filtered);
  },

  updatePriority: async (id: string, newPriority: number): Promise<void> => {
    // 简单的交换逻辑或重新排序逻辑
    // 这里为了简化，我们只更新单个 Item，但在列表中通常是重排整个列表
    // 更实用的接口是 batchUpdatePriorities
    // 暂时保留这个接口备用
  },

  reorder: async (caseId: string, orderedIds: string[]): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const all = getPainPoints();
    const otherCasePoints = all.filter(p => p.caseId !== caseId);
    const targetCasePoints = all.filter(p => p.caseId === caseId);
    
    const reordered = targetCasePoints.map(p => {
      const index = orderedIds.indexOf(p.id);
      return {
        ...p,
        priority: index === -1 ? 999 : index + 1
      };
    });
    
    savePainPoints([...otherCasePoints, ...reordered]);
  }
};
