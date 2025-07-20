// Role-based Access Control (RBAC) utilities for AI4AgriWeather

export type UserRole = 'farmer' | 'extension_officer' | 'researcher' | 'admin' | 'cooperative_member' | 'agribusiness';

export interface Permission {
  resource: string;
  action: string;
}

// Define role capabilities
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  farmer: [
    { resource: 'knowledge_entries', action: 'create' },
    { resource: 'knowledge_entries', action: 'read_own' },
    { resource: 'knowledge_entries', action: 'update_own' },
    { resource: 'knowledge_entries', action: 'delete_own' },
    { resource: 'profile', action: 'read_own' },
    { resource: 'profile', action: 'update_own' },
    { resource: 'templates', action: 'read' },
    { resource: 'knowledge_entries', action: 'export_own' },
  ],
  
  extension_officer: [
    { resource: 'knowledge_entries', action: 'create' },
    { resource: 'knowledge_entries', action: 'read_own' },
    { resource: 'knowledge_entries', action: 'read_shared' },
    { resource: 'knowledge_entries', action: 'update_own' },
    { resource: 'knowledge_entries', action: 'delete_own' },
    { resource: 'knowledge_entries', action: 'share' },
    { resource: 'knowledge_entries', action: 'export_own' },
    { resource: 'profile', action: 'read_own' },
    { resource: 'profile', action: 'update_own' },
    { resource: 'templates', action: 'read' },
    { resource: 'templates', action: 'create' },
    { resource: 'farmers', action: 'view_list' },
    { resource: 'analytics', action: 'view_basic' },
  ],
  
  researcher: [
    { resource: 'knowledge_entries', action: 'create' },
    { resource: 'knowledge_entries', action: 'read_own' },
    { resource: 'knowledge_entries', action: 'read_shared' },
    { resource: 'knowledge_entries', action: 'read_research' },
    { resource: 'knowledge_entries', action: 'update_own' },
    { resource: 'knowledge_entries', action: 'delete_own' },
    { resource: 'knowledge_entries', action: 'share' },
    { resource: 'knowledge_entries', action: 'export_own' },
    { resource: 'knowledge_entries', action: 'export_research' },
    { resource: 'profile', action: 'read_own' },
    { resource: 'profile', action: 'update_own' },
    { resource: 'templates', action: 'read' },
    { resource: 'templates', action: 'create' },
    { resource: 'templates', action: 'modify' },
    { resource: 'analytics', action: 'view_advanced' },
    { resource: 'data', action: 'export_aggregated' },
  ],
  
  admin: [
    { resource: '*', action: '*' }, // Admin has all permissions
  ],
  
  cooperative_member: [
    { resource: 'knowledge_entries', action: 'create' },
    { resource: 'knowledge_entries', action: 'read_own' },
    { resource: 'knowledge_entries', action: 'read_cooperative' },
    { resource: 'knowledge_entries', action: 'update_own' },
    { resource: 'knowledge_entries', action: 'delete_own' },
    { resource: 'knowledge_entries', action: 'share_cooperative' },
    { resource: 'knowledge_entries', action: 'export_own' },
    { resource: 'profile', action: 'read_own' },
    { resource: 'profile', action: 'update_own' },
    { resource: 'templates', action: 'read' },
    { resource: 'cooperative', action: 'view' },
    { resource: 'cooperative', action: 'participate' },
  ],
  
  agribusiness: [
    { resource: 'knowledge_entries', action: 'create' },
    { resource: 'knowledge_entries', action: 'read_own' },
    { resource: 'knowledge_entries', action: 'read_business' },
    { resource: 'knowledge_entries', action: 'update_own' },
    { resource: 'knowledge_entries', action: 'delete_own' },
    { resource: 'knowledge_entries', action: 'share_business' },
    { resource: 'knowledge_entries', action: 'export_own' },
    { resource: 'profile', action: 'read_own' },
    { resource: 'profile', action: 'update_own' },
    { resource: 'templates', action: 'read' },
    { resource: 'analytics', action: 'view_business' },
    { resource: 'market_data', action: 'access' },
  ],
};

// Permission checking utility
export const hasPermission = (
  userRole: UserRole | null | undefined,
  resource: string,
  action: string
): boolean => {
  if (!userRole) return false;
  
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  
  // Check for admin wildcard permissions
  if (permissions.some(p => p.resource === '*' && p.action === '*')) {
    return true;
  }
  
  // Check for specific permission
  return permissions.some(p => 
    (p.resource === resource || p.resource === '*') &&
    (p.action === action || p.action === '*')
  );
};

// Check if user can access knowledge entries of specific sharing level
export const canAccessKnowledgeEntry = (
  userRole: UserRole | null | undefined,
  entryOwnerId: string,
  currentUserId: string,
  sharingLevel: string = 'private'
): boolean => {
  if (!userRole || !currentUserId) return false;
  
  // Owner can always access their own entries
  if (entryOwnerId === currentUserId) {
    return hasPermission(userRole, 'knowledge_entries', 'read_own');
  }
  
  // Check sharing level permissions
  switch (sharingLevel) {
    case 'public':
      return hasPermission(userRole, 'knowledge_entries', 'read_shared');
    case 'cooperative':
      return hasPermission(userRole, 'knowledge_entries', 'read_cooperative');
    case 'research':
      return hasPermission(userRole, 'knowledge_entries', 'read_research');
    case 'business':
      return hasPermission(userRole, 'knowledge_entries', 'read_business');
    default:
      return false;
  }
};

// Get available sharing options based on user role
export const getAvailableSharingOptions = (userRole: UserRole | null | undefined): Array<{
  value: string;
  label: string;
  description: string;
}> => {
  const options = [
    { value: 'private', label: 'Private', description: 'Only you can see this entry' }
  ];
  
  if (!userRole) return options;
  
  if (hasPermission(userRole, 'knowledge_entries', 'share')) {
    options.push({
      value: 'public',
      label: 'Public',
      description: 'Share with other farmers and extension officers'
    });
  }
  
  if (hasPermission(userRole, 'knowledge_entries', 'share_cooperative')) {
    options.push({
      value: 'cooperative',
      label: 'Cooperative',
      description: 'Share with your cooperative members'
    });
  }
  
  if (hasPermission(userRole, 'knowledge_entries', 'share_business')) {
    options.push({
      value: 'business',
      label: 'Business',
      description: 'Share with business partners and suppliers'
    });
  }
  
  if (userRole === 'researcher' || userRole === 'admin') {
    options.push({
      value: 'research',
      label: 'Research',
      description: 'Share for agricultural research purposes'
    });
  }
  
  return options;
};

// Check if user can perform bulk operations
export const canPerformBulkOperation = (
  userRole: UserRole | null | undefined,
  operation: 'delete' | 'archive' | 'export' | 'duplicate',
  entriesOwnedByUser: boolean = true
): boolean => {
  if (!userRole) return false;
  
  switch (operation) {
    case 'delete':
      return entriesOwnedByUser && hasPermission(userRole, 'knowledge_entries', 'delete_own');
    case 'archive':
      return entriesOwnedByUser && hasPermission(userRole, 'knowledge_entries', 'update_own');
    case 'export':
      return hasPermission(userRole, 'knowledge_entries', 'export_own');
    case 'duplicate':
      return hasPermission(userRole, 'knowledge_entries', 'create');
    default:
      return false;
  }
};

// Get role display information
export const getRoleInfo = (role: UserRole): {
  name: string;
  description: string;
  color: string;
  icon: string;
} => {
  const roleInfo = {
    farmer: {
      name: 'Farmer',
      description: 'Individual farmer managing their own agricultural knowledge',
      color: 'green',
      icon: '🌾'
    },
    extension_officer: {
      name: 'Extension Officer',
      description: 'Agricultural extension officer providing guidance to farmers',
      color: 'blue',
      icon: '👩‍🌾'
    },
    researcher: {
      name: 'Researcher',
      description: 'Agricultural researcher studying farming practices and innovations',
      color: 'purple',
      icon: '🔬'
    },
    admin: {
      name: 'Administrator',
      description: 'System administrator with full access to all features',
      color: 'red',
      icon: '⚙️'
    },
    cooperative_member: {
      name: 'Cooperative Member',
      description: 'Member of an agricultural cooperative sharing knowledge with peers',
      color: 'orange',
      icon: '🤝'
    },
    agribusiness: {
      name: 'Agribusiness',
      description: 'Business entity involved in agricultural value chain',
      color: 'indigo',
      icon: '🏢'
    }
  };
  
  return roleInfo[role];
};

// Check if user has administrative privileges
export const isAdmin = (userRole: UserRole | null | undefined): boolean => {
  return userRole === 'admin';
};

// Check if user can manage templates
export const canManageTemplates = (userRole: UserRole | null | undefined): boolean => {
  return hasPermission(userRole, 'templates', 'create') || 
         hasPermission(userRole, 'templates', 'modify');
};

// Check if user can view analytics
export const canViewAnalytics = (userRole: UserRole | null | undefined): boolean => {
  return hasPermission(userRole, 'analytics', 'view_basic') ||
         hasPermission(userRole, 'analytics', 'view_advanced') ||
         hasPermission(userRole, 'analytics', 'view_business');
};

// Get analytics level based on role
export const getAnalyticsLevel = (userRole: UserRole | null | undefined): 'none' | 'basic' | 'advanced' | 'business' => {
  if (!userRole) return 'none';
  
  if (hasPermission(userRole, 'analytics', 'view_advanced')) return 'advanced';
  if (hasPermission(userRole, 'analytics', 'view_business')) return 'business';
  if (hasPermission(userRole, 'analytics', 'view_basic')) return 'basic';
  
  return 'none';
};