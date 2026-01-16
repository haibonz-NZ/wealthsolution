import { toast } from "sonner";

export const DataService = {
  // 导出所有数据
  exportAllData: () => {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        version: "1.1",
        // Business Data
        wealth_users: localStorage.getItem("wealth_users"),
        wealth_cases: localStorage.getItem("wealth_cases"),
        wealth_family_members: localStorage.getItem("wealth_family_members"),
        wealth_assets: localStorage.getItem("wealth_assets"),
        wealth_pain_points: localStorage.getItem("wealth_pain_points"),
        wealth_reports: localStorage.getItem("wealth_reports"),
        wealth_current_user: localStorage.getItem("wealth_current_user"),
        
        // System Settings
        wealth_ai_key: localStorage.getItem("wealth_ai_key"),
        wealth_ai_model: localStorage.getItem("wealth_ai_model"),
        wealth_proxy_mode: localStorage.getItem("wealth_proxy_mode"),
        wealth_proxy_url: localStorage.getItem("wealth_proxy_url"),
        wealth_repo_url: localStorage.getItem("wealth_repo_url"),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wealth_solution_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("完整数据备份已下载（含设置）");
    } catch (e) {
      console.error(e);
      toast.error("导出失败");
    }
  },

  // 导入数据
  importData: async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = JSON.parse(text);
          
          if (!data.version) {
            throw new Error("无效的备份文件格式");
          }

          // Restore Business Data
          if (data.wealth_users) localStorage.setItem("wealth_users", data.wealth_users);
          if (data.wealth_cases) localStorage.setItem("wealth_cases", data.wealth_cases);
          if (data.wealth_family_members) localStorage.setItem("wealth_family_members", data.wealth_family_members);
          if (data.wealth_assets) localStorage.setItem("wealth_assets", data.wealth_assets);
          if (data.wealth_pain_points) localStorage.setItem("wealth_pain_points", data.wealth_pain_points);
          if (data.wealth_reports) localStorage.setItem("wealth_reports", data.wealth_reports);
          if (data.wealth_current_user) localStorage.setItem("wealth_current_user", data.wealth_current_user);

          // Restore System Settings
          if (data.wealth_ai_key) localStorage.setItem("wealth_ai_key", data.wealth_ai_key);
          if (data.wealth_ai_model) localStorage.setItem("wealth_ai_model", data.wealth_ai_model);
          if (data.wealth_proxy_mode) localStorage.setItem("wealth_proxy_mode", data.wealth_proxy_mode);
          if (data.wealth_proxy_url) localStorage.setItem("wealth_proxy_url", data.wealth_proxy_url);
          if (data.wealth_repo_url) localStorage.setItem("wealth_repo_url", data.wealth_repo_url);

          toast.success("数据与设置恢复成功，即将刷新页面...");
          setTimeout(() => {
            window.location.reload();
            resolve();
          }, 1500);
        } catch (err) {
          console.error(err);
          toast.error("导入失败：文件格式错误");
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  },

  // 加载演示案例数据
  loadDemoData: () => {
    try {
      const currentUserStr = localStorage.getItem("wealth_current_user");
      if (!currentUserStr) {
        toast.error("请先登录系统");
        return;
      }
      const currentUser = JSON.parse(currentUserStr);
      const userId = currentUser.id;
      const caseId = `case-demo-${Date.now()}`;

      // 1. Create Case
      const newCase = {
        id: caseId,
        userId: userId,
        title: "李氏家族全球传承规划 (演示)",
        description: "高净值家族跨国资产配置与传承架构设计案例。",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 2. Create Members
      const members = [
        {
          id: `mem-self-${Date.now()}`,
          caseId: caseId,
          name: "李建国",
          relation: "self",
          age: 55,
          gender: "male",
          nationality: "CN",
          taxResidencies: ["CN"],
          residence: "中国 (深圳)",
          healthStatus: "healthy",
          maritalStatus: "married",
          notes: "家族企业创始人，风险偏好稳健。"
        },
        {
          id: `mem-spouse-${Date.now()}`,
          caseId: caseId,
          name: "王美玲",
          relation: "spouse",
          age: 52,
          gender: "female",
          nationality: "CN",
          taxResidencies: ["CN", "OTHER"], // St Kitts
          residence: "中国 (深圳)",
          healthStatus: "healthy",
          maritalStatus: "married",
          hasSmallCountryIdentity: true,
          smallCountryName: "圣基茨",
          partnerId: `mem-self-${Date.now()}` 
        },
        {
          id: `mem-son-${Date.now()}`,
          caseId: caseId,
          name: "李思远",
          relation: "son",
          age: 26,
          gender: "male",
          nationality: "CN",
          taxResidencies: ["CN", "US"],
          daysInCountry: 330, // Substantial Presence
          residence: "美国 (纽约)",
          healthStatus: "healthy",
          maritalStatus: "single",
          hasImmigrationStatus: true,
          immigrationCountry: "美国 (绿卡)",
          parentId: `mem-self-${Date.now()}`,
          notes: "美股上市公司工程师，未婚。"
        },
        {
          id: `mem-daughter-${Date.now()}`,
          caseId: caseId,
          name: "李思涵",
          relation: "daughter",
          age: 22,
          gender: "female",
          nationality: "CN",
          taxResidencies: ["UK"], // Non-dom potentially
          domicile: false,
          residence: "英国 (伦敦)",
          healthStatus: "healthy",
          maritalStatus: "single",
          parentId: `mem-self-${Date.now()}`,
          notes: "伦敦大学学院研究生在读。"
        },
        {
          id: `mem-father-in-law-${Date.now()}`,
          caseId: caseId,
          name: "王老爷子",
          relation: "father_in_law",
          age: 80,
          gender: "male",
          nationality: "CN",
          taxResidencies: ["CN"],
          residence: "中国 (上海)",
          healthStatus: "critical", // 重疾
          maritalStatus: "widowed",
          notes: "配偶父亲，需考虑医疗备用金。"
        }
      ];
      
      // Fix partner/parent links
      members[1].partnerId = members[0].id;
      members[0].partnerId = members[1].id;
      members[2].parentId = members[0].id;
      members[3].parentId = members[0].id;

      // 3. Create Assets
      const assets = [
        {
          id: `ast-1-${Date.now()}`,
          caseId: caseId,
          name: "深圳湾一号豪宅",
          type: "real_estate",
          location: "CN",
          ownerId: members[0].id, // Li Jianguo
          holdingType: "individual",
          currency: "CNY",
          marketValue: 80000000,
          costBase: 50000000,
          notes: "自住，无贷款"
        },
        {
          id: `ast-2-${Date.now()}`,
          caseId: caseId,
          name: "银行大额存单 & 理财",
          type: "cash",
          location: "CN",
          ownerId: members[1].id, // Wang Meiling
          holdingType: "individual",
          currency: "CNY",
          marketValue: 50000000,
          costBase: 50000000,
          income: 1500000,
          incomeNotes: "年化3%"
        },
        {
          id: `ast-3-${Date.now()}`,
          caseId: caseId,
          name: "腾讯/阿里蓝筹股",
          type: "equity",
          location: "HK",
          ownerId: members[0].id, // Li Jianguo
          holdingType: "nominee", // Risk!
          isPassive: true,
          currency: "HKD",
          marketValue: 20000000,
          costBase: 15000000,
          notes: "目前由亲戚代持，需还原"
        },
        {
          id: `ast-4-${Date.now()}`,
          caseId: caseId,
          name: "曼哈顿公寓 (自住)",
          type: "real_estate",
          location: "US",
          ownerId: members[2].id, // Li Siyuan
          holdingType: "individual",
          currency: "USD",
          marketValue: 3000000,
          costBase: 2500000,
          notes: "儿子自住"
        },
        {
          id: `ast-5-${Date.now()}`,
          caseId: caseId,
          name: "李氏家族不可撤销信托",
          type: "trust",
          location: "OTHER", // Cayman
          ownerId: members[0].id, // Grantor
          holdingType: "trust",
          currency: "USD",
          marketValue: 10000000,
          costBase: 10000000,
          notes: "设立于开曼群岛，受益人为全家"
        }
      ];

      // 4. Create Pain Points
      const painPoints = [
        {
          id: `pp-1-${Date.now()}`,
          caseId: caseId,
          type: "tax_optimization",
          description: "儿子持有美国绿卡，担心家族信托分配收益时面临美国高额赠与税和所得税风险。"
        },
        {
          id: `pp-2-${Date.now()}`,
          caseId: caseId,
          type: "wealth_succession",
          description: "二代目前未婚，担心未来婚变导致家族股权外流，希望建立婚前财产隔离防火墙。"
        },
        {
          id: `pp-3-${Date.now()}`,
          caseId: caseId,
          type: "asset_protection",
          description: "岳父重疾可能产生大额医疗开支，且国内企业面临经营转型，需隔离家企债务风险。"
        }
      ];

      // Save to localStorage
      const existingCases = JSON.parse(localStorage.getItem("wealth_cases") || "[]");
      const existingMembers = JSON.parse(localStorage.getItem("wealth_family_members") || "[]");
      const existingAssets = JSON.parse(localStorage.getItem("wealth_assets") || "[]");
      const existingPainPoints = JSON.parse(localStorage.getItem("wealth_pain_points") || "[]");

      localStorage.setItem("wealth_cases", JSON.stringify([...existingCases, newCase]));
      localStorage.setItem("wealth_family_members", JSON.stringify([...existingMembers, ...members]));
      localStorage.setItem("wealth_assets", JSON.stringify([...existingAssets, ...assets]));
      localStorage.setItem("wealth_pain_points", JSON.stringify([...existingPainPoints, ...painPoints]));

      toast.success("演示案例已导入！");
      setTimeout(() => window.location.reload(), 1000);

    } catch (e) {
      console.error(e);
      toast.error("导入演示数据失败");
    }
  }
};
