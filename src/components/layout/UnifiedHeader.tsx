import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, LogOut, Settings, Wheat, Shield, Home, Cloud, 
  Sprout, MessageCircle, BookOpen, ArrowLeft, Menu, X, Globe 
} from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { useLogout } from '@/services/authService';
import { useAuth } from '@/features/authentication';
import Logo from '@/components/ui/Logo';
import UserProfileDialog from '@/components/profile/UserProfileDialog';
import { getRoleInfo, type UserRole } from '@/utils/permissions';

interface UnifiedHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showNavigation?: boolean; // New prop to control navigation visibility
  variant?: 'full' | 'minimal'; // 'full' for AppHeader style, 'minimal' for DashboardHeader style
}

const UnifiedHeader = ({ 
  title, 
  subtitle, 
  showBackButton = false, 
  onBackClick,
  showNavigation = true,
  variant = 'full'
}: UnifiedHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { logout } = useLogout();
  const { profile } = useAuth();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const languages = [
    { code: 'ko', name: t('language.korean'), flag: '🇰🇷' },
    { code: 'en', name: t('language.english'), flag: '🇺🇸' },
    { code: 'sw', name: t('language.swahili'), flag: '🇹🇿' },
    { code: 'fr', name: t('language.french'), flag: '🇫🇷' },
    { code: 'ne', name: t('language.nepali'), flag: '🇳🇵' },
    { code: 'uz', name: t('language.uzbek'), flag: '🇺🇿' }
  ];

  const navigationItems = [
    { path: '/', icon: Home, label: t('navigation.dashboard'), color: 'text-blue-600' },
    { path: '/weather', icon: Cloud, label: t('navigation.weather'), color: 'text-sky-600' },
    { path: '/crops', icon: Sprout, label: t('navigation.crops'), color: 'text-green-600' },
    { path: '/chat', icon: MessageCircle, label: t('navigation.chat'), color: 'text-purple-600' },
    { path: '/knowledge', icon: BookOpen, label: t('navigation.knowledge'), color: 'text-orange-600' },
  ];

  const changeLanguage = async (langCode: string) => {
    console.log('UnifiedHeader: Changing language to:', langCode);
    try {
      await i18n.changeLanguage(langCode);
      console.log('UnifiedHeader: Language changed to:', i18n.language);
      // Force re-render to apply language changes
      window.location.reload();
    } catch (error) {
      console.error('UnifiedHeader: Error changing language:', error);
    }
  };

  const getUserInitial = () => {
    if (profile?.full_name) {
      return profile.full_name.charAt(0).toUpperCase();
    }
    if (profile?.email) {
      return profile.email.charAt(0).toUpperCase();
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

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const getCurrentPageTitle = () => {
    if (title) return title;
    
    // For minimal variant, always show AI4AgriWeather
    if (variant === 'minimal') return t('auth.title');
    
    const currentNav = navigationItems.find(item => item.path === location.pathname);
    return currentNav?.label || t('auth.title');
  };

  const getCurrentPageSubtitle = () => {
    if (subtitle) return subtitle;
    
    // For minimal variant, always show Smart Farm Assistant
    if (variant === 'minimal') return t('common.smartFarmAssistant');
    
    const currentNav = navigationItems.find(item => item.path === location.pathname);
    if (currentNav) {
      switch (currentNav.path) {
        case '/': return t('dashboard.subtitle');
        case '/weather': return t('weather.subtitle');
        case '/crops': return t('crops.subtitle');
        case '/chat': return t('chat.subtitle');
        case '/knowledge': return t('knowledge.subtitle');
        default: return t('common.smartFarmAssistant');
      }
    }
    return t('common.smartFarmAssistant');
  };

  return (
    <>
      <header className="bg-white border-b px-4 sm:px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackClick}
                className="p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            <Logo />
            <div>
              <h1 className={`font-medium text-gray-900 ${variant === 'minimal' ? 'text-xl' : 'text-lg sm:text-xl'}`}>
                {getCurrentPageTitle()}
              </h1>
              <p className={`text-gray-500 ${variant === 'minimal' ? 'text-sm' : 'text-xs sm:text-sm'}`}>
                {getCurrentPageSubtitle()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop Navigation - Only show if showNavigation is true and variant is 'full' */}
            {showNavigation && variant === 'full' && (
              <nav className="hidden lg:flex items-center space-x-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => navigate(item.path)}
                      className={`flex items-center space-x-2 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? item.color : 'text-gray-600'}`} />
                      <span className={`text-sm ${isActive ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {item.label}
                      </span>
                    </Button>
                  );
                })}
              </nav>
            )}

            {/* User info display - Only show in minimal variant */}
            {variant === 'minimal' && profile && (
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

            {/* Mobile Menu Button - Only show if navigation is enabled */}
            {showNavigation && variant === 'full' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2"
              >
                {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0">
                  <div className={`bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors ${
                    variant === 'minimal' ? 'w-10 h-10' : 'w-8 h-8 sm:w-10 sm:h-10'
                  }`}>
                    <span className="text-white font-medium text-sm">{getUserInitial()}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{profile?.full_name || 'User'}</div>
                  <div className="text-xs text-gray-500">{profile?.email}</div>
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

        {/* Mobile Navigation Menu */}
        {showMobileMenu && showNavigation && variant === 'full' && (
          <div className="lg:hidden mt-4 pt-4 border-t">
            <nav className="grid grid-cols-2 gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => {
                      navigate(item.path);
                      setShowMobileMenu(false);
                    }}
                    className={`flex items-center space-x-2 justify-start ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? item.color : 'text-gray-600'}`} />
                    <span className={`text-sm ${isActive ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                      {item.label}
                    </span>
                  </Button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <UserProfileDialog 
        open={showProfileDialog} 
        onOpenChange={setShowProfileDialog} 
      />
    </>
  );
};

export default UnifiedHeader;