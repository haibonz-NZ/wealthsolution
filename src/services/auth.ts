export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  memberLevel: 'basic' | 'professional' | 'enterprise';
  token: string;
}

interface StoredUser extends User {
  password?: string;
}

const STORAGE_KEY_USERS = 'wealth_users';
const STORAGE_KEY_CURRENT_USER = 'wealth_current_user';

// 预设邀请码
const VALID_INVITATION_CODES = ['INVITE2026', 'WEALTH888', 'VIP999'];

// 获取所有用户
const getUsers = (): StoredUser[] => {
  const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
  return usersStr ? JSON.parse(usersStr) : [];
};

// 保存新用户
const saveUser = (user: StoredUser) => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

// 初始化管理员账号
const initAdmin = () => {
  const users = getUsers();
  const adminEmail = '4142254@qq.com';
  // 如果管理员不存在，则创建
  if (!users.find(u => u.email === adminEmail)) {
    const adminUser: StoredUser = {
      id: 'admin-001',
      email: adminEmail,
      password: 'V7a2a5zr4800',
      name: '超级管理员',
      role: 'admin',
      memberLevel: 'enterprise',
      token: 'mock-admin-token'
    };
    saveUser(adminUser);
    console.log('Admin account initialized');
  }
};

export const AuthService = {
  init: () => {
    try {
      initAdmin();
    } catch (e) {
      console.error('Failed to init admin', e);
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      const { password: _, ...safeUser } = user; // 移除密码
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(safeUser));
      return safeUser;
    }
    throw new Error('邮箱或密码错误');
  },

  register: async (email: string, password: string, invitationCode: string, name: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // 1. 校验邀请码
    if (!VALID_INVITATION_CODES.includes(invitationCode)) {
      throw new Error('无效的邀请码，请联系客服获取');
    }

    // 2. 检查邮箱是否已存在
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('该邮箱已被注册');
    }

    // 3. 创建新用户
    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      role: 'user',
      memberLevel: 'basic', // 默认基础会员
      token: `mock-token-${Date.now()}`
    };

    saveUser(newUser);
    
    // 自动登录
    const { password: _, ...safeUser } = newUser;
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(safeUser));
    return safeUser;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
  }
};
