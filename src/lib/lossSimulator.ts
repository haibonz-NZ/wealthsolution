// Define types locally
export interface IdentityNode {
  id: string;
  role: string;
  region: string;
  risks: string[];
  meta?: {
    daysInCountry?: number;
    citizenship?: boolean;
  };
}

export interface WizardData {
  identities: IdentityNode[];
  assets: {
    domestic: number;
    foreign: number;
    types: string[];
  };
  painPoints: string[];
}

export interface LossBreakdown {
  label: string;
  amount: number;
  color: string;
}

export interface SimulationResult {
  totalUSD: number;
  lossAmount: number;
  remainingRatio: number;
  breakdown: LossBreakdown[];
}

export const LossSimulator = {
  calculate: (data: WizardData): SimulationResult => {
    // 1. Estimate Total Asset Value (USD)
    // Map levels to approximate values
    const domesticMap = [5000000, 30000000, 75000000, 200000000]; // RMB: <1000w, 1-5kw, 5-1e, >1e
    const foreignMap = [500000, 3000000, 12500000, 50000000];     // USD: <100w, 1-500w, 500-2000w, >2000w
    
    // Default to level 1/0 if not set, or use actual value if available (future expansion)
    const dLevel = data.assets.domestic || 0;
    const fLevel = data.assets.foreign || 0;

    const totalUSD = (domesticMap[dLevel] / 7.2) + foreignMap[fLevel];
    
    let lossAmount = 0;
    const breakdown: LossBreakdown[] = [];

    // --- Scenario A: Estate Tax Erosion ---
    // If US/UK/JP nexus exists
    const hasHighTaxRes = data.identities.some(n => ['US', 'UK', 'JP'].includes(n.region));
    
    if (hasHighTaxRes) {
      // Assumption: 40% of assets are exposed to these jurisdictions (or all if user is tax resident)
      // For simulation impact, we assume a significant portion.
      const exposedAssets = totalUSD * 0.5; 
      const taxRate = 0.40; // Average high tax rate
      const taxLoss = exposedAssets * taxRate;
      
      lossAmount += taxLoss;
      breakdown.push({ 
        label: "跨境遗产税 (US/UK/JP)", 
        amount: taxLoss, 
        color: "bg-red-500" 
      });
    }

    // --- Scenario B: Departure / Exit Tax ---
    // If CA/AU nexus exists
    const hasExitRisk = data.identities.some(n => ['CA', 'AU'].includes(n.region));
    if (hasExitRisk) {
      // Assumption: 50% of assets have unrealized gains, tax rate ~25%
      const exitLoss = totalUSD * 0.5 * 0.25;
      lossAmount += exitLoss;
      breakdown.push({ 
        label: "离境/视同售出税 (Exit Tax)", 
        amount: exitLoss, 
        color: "bg-orange-500" 
      });
    }

    // --- Scenario C: Legal & Administrative Friction ---
    // Probate costs, legal fees, frozen asset liquidity loss
    const legalLoss = totalUSD * 0.05; // 5% flat
    lossAmount += legalLoss;
    breakdown.push({ 
      label: "跨国行政/法律摩擦成本", 
      amount: legalLoss, 
      color: "bg-yellow-500" 
    });

    // Cap loss at 70% to be realistic (rarely goes to 0)
    if (lossAmount > totalUSD * 0.7) {
        lossAmount = totalUSD * 0.7;
    }

    const remainingRatio = Math.max(0, (totalUSD - lossAmount) / totalUSD);

    return {
      totalUSD,
      lossAmount,
      remainingRatio,
      breakdown
    };
  }
};
