import type { Region } from "./member";

export type AssetType = "real_estate" | "equity" | "cash" | "insurance" | "trust" | "fund" | "crypto" | "other";
export type Currency = "CNY" | "USD" | "HKD" | "SGD" | "GBP" | "AUD" | "CAD" | "JPY" | "EUR";
export type HoldingType = "individual" | "joint" | "company" | "trust" | "nominee";

export const ASSET_TYPE_LABELS: Record<string, string> = {
  real_estate: "房产",
  equity: "公司股权",
  cash: "现金/理财",
  insurance: "人寿保单",
  trust: "信托权益",
  fund: "基金/股票",
  crypto: "数字货币",
  other: "其他"
};

export const HOLDING_TYPE_LABELS: Record<string, string> = {
  individual: "个人直持",
  joint: "联名持有",
  company: "公司持有",
  trust: "信托持有",
  nominee: "代持 (高危)",
};

export const CURRENCY_LABELS: Record<string, string> = {
  CNY: "人民币 (CNY)",
  USD: "美元 (USD)",
  HKD: "港币 (HKD)",
  SGD: "新币 (SGD)",
  GBP: "英镑 (GBP)",
  AUD: "澳元 (AUD)",
  CAD: "加元 (CAD)",
  JPY: "日元 (JPY)",
  EUR: "欧元 (EUR)"
};

export interface Asset {
  id: string;
  caseId: string;
  name: string; // Asset Name e.g. "Manhattan Condo"
  type: AssetType;
  customType?: string;
  
  location: Region;
  
  ownerId: string; // FamilyMember ID
  
  holdingType: HoldingType;
  
  currency: Currency;
  marketValue: number; // Current Value
  costBase?: number;   // Original Cost (for CGT/Exit Tax)
  
  isPassive?: boolean; // For equity/company -> CFC risk
  
  notes?: string;

  // Legacy fields
  originalValue?: number;
  value?: number; // mapped to marketValue
  holderId?: string; // mapped to ownerId
  holderName?: string;
  income?: number;
  incomeNotes?: string;
}

export const AssetService = {
  getAssetsByCase: async (caseId: string): Promise<Asset[]> => {
    const allAssets = JSON.parse(localStorage.getItem("wealth_assets") || "[]");
    return allAssets.filter((a: Asset) => a.caseId === caseId);
  },

  addAsset: async (asset: Omit<Asset, "id">): Promise<Asset> => {
    const newAsset = { 
      ...asset, 
      id: `ast-${Date.now()}`,
      valueInUSD: 0 // Placeholder, will be calculated on display or save if needed
    };
    const allAssets = JSON.parse(localStorage.getItem("wealth_assets") || "[]");
    allAssets.push(newAsset);
    localStorage.setItem("wealth_assets", JSON.stringify(allAssets));
    return newAsset;
  },

  updateAsset: async (id: string, updates: Partial<Asset>): Promise<Asset> => {
    const allAssets = JSON.parse(localStorage.getItem("wealth_assets") || "[]");
    const index = allAssets.findIndex((a: Asset) => a.id === id);
    if (index === -1) throw new Error("Asset not found");
    
    const updatedAsset = { ...allAssets[index], ...updates };
    allAssets[index] = updatedAsset;
    localStorage.setItem("wealth_assets", JSON.stringify(allAssets));
    return updatedAsset;
  },

  deleteAsset: async (id: string): Promise<void> => {
    const allAssets = JSON.parse(localStorage.getItem("wealth_assets") || "[]");
    const filtered = allAssets.filter((a: Asset) => a.id !== id);
    localStorage.setItem("wealth_assets", JSON.stringify(filtered));
  }
};
