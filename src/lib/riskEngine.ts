// Define types locally for Advisor Web to avoid dependency on Client App
export type IdentityRegion = "CN" | "HK" | "US" | "UK" | "CA" | "AU" | "SG" | "JP" | "EU" | "OTHER";

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

export interface RiskResult {
  code: string;
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  desc: string;
  legalRef?: string;
}

export const RiskEngine = {
  analyze: (data: WizardData): RiskResult[] => {
    const risks: RiskResult[] = [];
    const { identities, assets } = data;

    // --- R1: US Global Tax ---
    // Condition: Any member is US citizen, Green Card holder, or meets Substantial Presence Test
    const usPersons = identities.filter(m => 
      m.region === 'US' || 
      (m.meta?.daysInCountry && m.meta.daysInCountry >= 183) ||
      (m.meta?.citizenship === true) // Assuming meta.citizenship tracks US citizenship
    );

    if (usPersons.length > 0) {
      risks.push({
        code: 'US_GLOBAL_TAX',
        level: 'HIGH',
        desc: `检测到 ${usPersons.length} 位家庭成员（${usPersons.map(p => p.role).join(', ')}）属于美国税务居民。其全球范围内的收入（工资、投资、租金等）均需向美国国税局 (IRS) 申报并纳税。`,
        legalRef: 'IRC Section 7701(b)'
      });
    }

    // --- R2: US PFIC (Passive Foreign Investment Company) ---
    // Condition: US Person holds Non-US Fund/ETF
    // Simplified check: Asset type 'fund' or 'equity' in Non-US location
    const hasNonUSFund = assets.types.includes('fund') || assets.types.includes('equity'); // Simplified
    // In a real app, we'd check specific assets linked to specific owners. 
    // Here we check global asset types + US Person existence for high-level warning.
    if (usPersons.length > 0 && hasNonUSFund) {
        risks.push({
            code: 'US_PFIC',
            level: 'HIGH',
            desc: '美籍人士持有非美注册的共同基金、ETF或被动投资公司股份，可能触发 PFIC 惩罚性税制，最高税率可超 50% 且含利息罚款。',
            legalRef: 'IRC Section 1297'
        });
    }

    // --- R3: US CFC (Controlled Foreign Corporation) ---
    // Condition: US Person holds >10% of Non-US Company
    // Simplified: Asset type 'equity' + US Person
    if (usPersons.length > 0 && assets.types.includes('equity')) {
        risks.push({
            code: 'US_CFC',
            level: 'HIGH',
            desc: '美籍人士若持有非美公司 10% 以上投票权或价值，可能被认定为持有受控外国企业 (CFC)。Subpart F 条款可能导致未分配利润被穿透征税。',
            legalRef: 'IRC Subpart F'
        });
    }

    // --- R4: US Foreign Trust (3520/3520A) ---
    // Condition: US Person is beneficiary/grantor of Foreign Trust
    const hasTrust = assets.types.includes('trust');
    if (usPersons.length > 0 && hasTrust) {
        risks.push({
            code: 'US_FOREIGN_TRUST',
            level: 'HIGH',
            desc: '美籍人士作为离岸信托的委托人或受益人，必须年度申报 Form 3520/3520-A。漏报面临账户总值 35% 起的巨额罚款。',
            legalRef: 'IRC Section 6048 & 6677'
        });
    }

    // --- R5: Canada/Australia Departure Tax ---
    // Condition: CA/AU Resident planning to leave (Simplified: just having the identity triggers the warning for now)
    const caAuPersons = identities.filter(m => ['CA', 'AU'].includes(m.region));
    if (caAuPersons.length > 0) {
        risks.push({
            code: 'DEPARTURE_TAX_RISK',
            level: 'HIGH',
            desc: '加拿大或澳大利亚税务居民若未来计划切断税务联系（离境），名下全球资产（特定豁免除外）将被视为按市价出售 (Deemed Disposition)，需即时缴纳资本利得税。',
            legalRef: 'Canada ITA s. 128.1 / Australia ITAA 1997 CGT Event I1'
        });
    }

    // --- R6: Japan Inheritance Tax ---
    // Condition: JP Resident > 10 years (Simplified: Just JP identity)
    const jpPersons = identities.filter(m => m.region === 'JP');
    if (jpPersons.length > 0) {
        risks.push({
            code: 'JP_INHERITANCE_TAX',
            level: 'HIGH',
            desc: '日本实行全球资产继承税制。若被继承人或继承人在日本居住超过 10 年，全球境内的资产转移（赠与/继承）均面临最高 55% 的累进税率。',
            legalRef: 'Japan Inheritance Tax Law'
        });
    }

    // --- R7: UK Non-Dom ---
    // Condition: UK Resident
    const ukPersons = identities.filter(m => m.region === 'UK');
    if (ukPersons.length > 0) {
        risks.push({
            code: 'UK_NON_DOM',
            level: 'MEDIUM',
            desc: '英国税务居民若拥有非居籍 (Non-Dom) 身份，可利用汇款制 (Remittance Basis) 豁免海外收入税。但该制度正面临改革，需关注窗口期。',
            legalRef: 'UK Finance Act'
        });
    }

    // --- R8: CRS/FATCA Exposure ---
    // Condition: Cross-border assets (simplified)
    if (data.assets.foreign > 0) {
        risks.push({
            code: 'CRS_EXPOSURE',
            level: 'MEDIUM',
            desc: '金融账户涉税信息自动交换 (CRS) 已覆盖全球 100+ 辖区。您的海外金融资产信息将被穿透并反馈给税务居民国。',
            legalRef: 'OECD CRS Standard'
        });
    }

    return risks;
  }
};
