
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Settings, Wheat, Shield, Globe } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useLogout } from '@/services/authService';
import { useAuth } from '@/features/authentication';
import Logo from '@/components/ui/Logo';
import UserProfileDialog from '@/components/profile/UserProfileDialog';
import { getRoleInfo, type UserRole } from '@/utils/permissions';
import { useTranslation } from 'react-i18next';

interface DashboardHeaderProps {
  userEmail?: string;
}

const DashboardHeader = ({ userEmail }: DashboardHeaderProps) => {
  const { t, i18n } = useTranslation();
  const { logout } = useLogout();
  const { profile } = useAuth();
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const languages = [
    { code: 'ko', name: t('language.korean'), flag: '🇰🇷' },
    { code: 'en', name: t('language.english'), flag: '🇺🇸' },
    { code: 'sw', name: t('language.swahili'), flag: '🇹🇿' },
    { code: 'fr', name: t('language.french'), flag: '🇫🇷' },
    { code: 'ne', name: t('language.nepali'), flag: '🇳🇵' },
    { code: 'uz', name: t('language.uzbek'), flag: '🇺🇿' }
  ];

  const changeLanguage = async (langCode: string) => {
    console.log('Changing language to:', langCode);
    try {
      await i18n.changeLanguage(langCode);
      console.log('Language changed to:', i18n.language);
      console.log('Current translations:', i18n.getResourceBundle(i18n.language, 'translation'));
      // Force re-render
      window.location.reload();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const getUserInitial = () => {
    if (profile?.full_name) {
      return profile.full_name.charAt(0).toUpperCase();
    }
    if (userEmail) {
      return userEmail.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getRoleBadge = () => {
    if (!profile?.user_role) return null;
    const roleInfo = getRoleInfo(profile.user_role as UserRole);
    return (
      <Badge variant="secondary" className={`text-xs bg-${roleInfo.color}-100 text-${roleInfo.color}-800`}>
        {roleInfo.icon} {roleInfo.name}
      </Badge>
    );
  };

  return (
    <>
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo />
            <div>
              <h1 className="text-xl font-medium text-gray-900">{t('auth.title')}</h1>
              <p className="text-sm text-gray-500">{t('common.smartFarmAssistant')}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User info display */}
            {profile && (
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <div className="flex items-center space-x-2 justify-end">
                    <p className="text-sm font-medium text-gray-900">
                      {profile.full_name || 'User'}
                    </p>
                    {getRoleBadge()}
                  </div>
                  <p className="text-xs text-gray-500">
                    {profile.farm_name || profile.user_role?.replace('_', ' ') || 'Farmer'}
                  </p>
                </div>
                {profile.farm_location && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Wheat className="h-3 w-3 mr-1" />
                    <span>{profile.farm_location}</span>
                  </div>
                )}
              </div>
            )}

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-1 px-2">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">
                    {languages.find(lang => lang.code === i18n.language)?.flag || '🌐'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium text-gray-700">
                  {t('language.selectLanguage')}
                </div>
                <DropdownMenuSeparator />
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`cursor-pointer ${
                      i18n.language === lang.code ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors">
                    <span className="text-white font-medium">{getUserInitial()}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{profile?.full_name || 'User'}</div>
                  <div className="text-xs text-gray-500">{userEmail}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowProfileDialog(true)} className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  {t('common.profileSettings')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('common.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <UserProfileDialog 
        open={showProfileDialog} 
        onOpenChange={setShowProfileDialog} 
      />
    </>
  );
};

export default DashboardHeader;
