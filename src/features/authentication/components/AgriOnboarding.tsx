import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';
import { Textarea } from '@/shared/components/ui/textarea';
import { 
  Wheat, 
  MapPin, 
  Users, 
  Ruler, 
  Calendar,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sprout,
  Tractor
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/authentication';
import { useToast } from '@/shared/hooks/use-toast';
import { COMMON_CROPS_TANZANIA, TANZANIA_REGIONS } from '@/utils/agricultureTemplates';

interface OnboardingData {
  full_name: string;
  farm_name: string;
  farm_location: string;
  farm_size: number;
  farm_size_unit: string;
  primary_crops: string[];
  farming_experience: number;
  farming_type: string;
  region: string;
  user_role: string;
  phone_number: string;
  preferred_language: string;
}

interface AgriOnboardingProps {
  onComplete: () => void;
}

const AgriOnboarding = ({ onComplete }: AgriOnboardingProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    full_name: '',
    farm_name: '',
    farm_location: '',
    farm_size: 0,
    farm_size_unit: 'hectares',
    primary_crops: [],
    farming_experience: 0,
    farming_type: 'mixed',
    region: '',
    user_role: 'farmer',
    phone_number: '',
    preferred_language: 'english'
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCrop = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      primary_crops: prev.primary_crops.includes(crop)
        ? prev.primary_crops.filter(c => c !== crop)
        : [...prev.primary_crops, crop]
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) {
      toast({
        title: t('onboarding.error'),
        description: t('onboarding.userNotAuthenticated'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: t('onboarding.welcomeMessage'),
        description: t('onboarding.profileSetupSuccess'),
      });

      onComplete();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: t('onboarding.error'),
        description: t('onboarding.profileSaveError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle>{t('onboarding.personalInfo')}</CardTitle>
              <CardDescription>
                {t('onboarding.personalInfoDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t('onboarding.fullName')} *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => updateFormData('full_name', e.target.value)}
                    placeholder={t('onboarding.fullNamePlaceholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">{t('onboarding.phoneNumber')}</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => updateFormData('phone_number', e.target.value)}
                    placeholder={t('onboarding.phoneNumberPlaceholder')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user_role">{t('onboarding.yourRole')}</Label>
                  <Select value={formData.user_role} onValueChange={(value) => updateFormData('user_role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('onboarding.selectRole')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farmer">{t('onboarding.farmer')}</SelectItem>
                      <SelectItem value="extension_officer">{t('onboarding.extensionOfficer')}</SelectItem>
                      <SelectItem value="researcher">{t('onboarding.researcher')}</SelectItem>
                      <SelectItem value="cooperative_member">{t('onboarding.cooperativeMember')}</SelectItem>
                      <SelectItem value="agribusiness">{t('onboarding.agribusiness')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_language">{t('onboarding.preferredLanguage')}</Label>
                  <Select value={formData.preferred_language} onValueChange={(value) => updateFormData('preferred_language', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('onboarding.selectLanguage')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">{t('onboarding.english')}</SelectItem>
                      <SelectItem value="swahili">{t('onboarding.swahili')}</SelectItem>
                      <SelectItem value="both">{t('onboarding.both')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="farming_experience">{t('onboarding.yearsExperience')}</Label>
                <Input
                  id="farming_experience"
                  type="number"
                  value={formData.farming_experience}
                  onChange={(e) => updateFormData('farming_experience', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle>{t('onboarding.farmLocation')}</CardTitle>
              <CardDescription>
                {t('onboarding.farmLocationDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="farm_name">{t('onboarding.farmName')}</Label>
                <Input
                  id="farm_name"
                  value={formData.farm_name}
                  onChange={(e) => updateFormData('farm_name', e.target.value)}
                  placeholder={t('onboarding.farmNamePlaceholder')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farm_location">{t('onboarding.farmLocationLabel')}</Label>
                  <Input
                    id="farm_location"
                    value={formData.farm_location}
                    onChange={(e) => updateFormData('farm_location', e.target.value)}
                    placeholder={t('onboarding.villageWardPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">{t('onboarding.region')}</Label>
                  <Select value={formData.region} onValueChange={(value) => updateFormData('region', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('onboarding.selectRegion')} />
                    </SelectTrigger>
                    <SelectContent>
                      {TANZANIA_REGIONS.map(region => (
                        <SelectItem key={region} value={region}>
                          {region.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farm_size">{t('onboarding.farmSize')}</Label>
                  <Input
                    id="farm_size"
                    type="number"
                    value={formData.farm_size}
                    onChange={(e) => updateFormData('farm_size', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farm_size_unit">{t('onboarding.unit')}</Label>
                  <Select value={formData.farm_size_unit} onValueChange={(value) => updateFormData('farm_size_unit', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hectares">{t('onboarding.hectares')}</SelectItem>
                      <SelectItem value="acres">{t('onboarding.acres')}</SelectItem>
                      <SelectItem value="square_meters">{t('onboarding.squareMeters')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="farming_type">{t('onboarding.typeOfFarming')}</Label>
                <Select value={formData.farming_type} onValueChange={(value) => updateFormData('farming_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('onboarding.selectFarmingType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subsistence">{t('onboarding.subsistence')}</SelectItem>
                    <SelectItem value="commercial">{t('onboarding.commercial')}</SelectItem>
                    <SelectItem value="mixed">{t('onboarding.mixed')}</SelectItem>
                    <SelectItem value="organic">{t('onboarding.organic')}</SelectItem>
                    <SelectItem value="livestock">{t('onboarding.livestock')}</SelectItem>
                    <SelectItem value="aquaculture">{t('onboarding.aquaculture')}</SelectItem>
                    <SelectItem value="horticulture">{t('onboarding.horticulture')}</SelectItem>
                    <SelectItem value="agroforestry">{t('onboarding.agroforestry')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Wheat className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle>{t('onboarding.primaryCrops')}</CardTitle>
              <CardDescription>
                {t('onboarding.selectCrops')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COMMON_CROPS_TANZANIA.map(crop => (
                  <div
                    key={crop}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.primary_crops.includes(crop)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleCrop(crop)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.primary_crops.includes(crop)}
                        readOnly
                      />
                      <span className="text-sm font-medium">
                        {crop.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {formData.primary_crops.length > 0 && (
                <div className="mt-4">
                  <Label>{t('onboarding.selectedCrops')}</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.primary_crops.map(crop => (
                      <Badge key={crop} variant="secondary" className="bg-green-100 text-green-800">
                        {crop.replace('_', ' ').toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle>{t('onboarding.almostDone')}</CardTitle>
              <CardDescription>
                {t('onboarding.reviewInformation')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">{t('onboarding.fullName')}:</span>
                  <span>{formData.full_name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">{t('onboarding.role')}:</span>
                  <span>{t(`onboarding.${formData.user_role}`)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">{t('onboarding.farm')}:</span>
                  <span>{formData.farm_name || t('onboarding.notSpecified')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">{t('onboarding.location')}:</span>
                  <span>{formData.farm_location}, {formData.region}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">{t('onboarding.farmSize')}:</span>
                  <span>{formData.farm_size} {t(`onboarding.${formData.farm_size_unit}`)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">{t('onboarding.experience')}:</span>
                  <span>{formData.farming_experience} {t('onboarding.years')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">{t('onboarding.primaryCrops')}:</span>
                  <span>{formData.primary_crops.length} {t('onboarding.selected')}</span>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Sprout className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">{t('onboarding.whatsNext')}</span>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• {t('onboarding.accessPersonalized')}</li>
                  <li>• {t('onboarding.getWeatherForecasts')}</li>
                  <li>• {t('onboarding.receiveCropAdvice')}</li>
                  <li>• {t('onboarding.connectWithFarmers')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{t('onboarding.welcomeMessage')}</h1>
            <span className="text-sm text-gray-500">{t('onboarding.step')} {currentStep} {t('onboarding.of')} {totalSteps}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step content */}
        <div className="flex justify-center mb-8">
          {renderStep()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('onboarding.previous')}</span>
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !formData.full_name) ||
                (currentStep === 2 && (!formData.region || formData.farm_size <= 0))
              }
              className="flex items-center space-x-2"
            >
              <span>{t('onboarding.next')}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t('onboarding.settingUp')}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>{t('onboarding.completeSetup')}</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgriOnboarding;