import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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
        title: "Error",
        description: "User not authenticated",
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
        title: "Welcome to AI4AgriWeather!",
        description: "Your profile has been set up successfully.",
      });

      onComplete();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: "Error",
        description: "Failed to save profile information. Please try again.",
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
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Let's start with some basic information about you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => updateFormData('full_name', e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => updateFormData('phone_number', e.target.value)}
                    placeholder="+255 123 456 789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user_role">Your Role</Label>
                  <Select value={formData.user_role} onValueChange={(value) => updateFormData('user_role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farmer">Farmer</SelectItem>
                      <SelectItem value="extension_officer">Extension Officer</SelectItem>
                      <SelectItem value="researcher">Researcher</SelectItem>
                      <SelectItem value="cooperative_member">Cooperative Member</SelectItem>
                      <SelectItem value="agribusiness">Agribusiness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_language">Preferred Language</Label>
                  <Select value={formData.preferred_language} onValueChange={(value) => updateFormData('preferred_language', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="swahili">Kiswahili</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="farming_experience">Years of Farming Experience</Label>
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
              <CardTitle>Farm Location & Size</CardTitle>
              <CardDescription>
                Tell us about your farm location and size
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="farm_name">Farm Name</Label>
                <Input
                  id="farm_name"
                  value={formData.farm_name}
                  onChange={(e) => updateFormData('farm_name', e.target.value)}
                  placeholder="Green Valley Farm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farm_location">Farm Location/Village</Label>
                  <Input
                    id="farm_location"
                    value={formData.farm_location}
                    onChange={(e) => updateFormData('farm_location', e.target.value)}
                    placeholder="Village/Ward name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select value={formData.region} onValueChange={(value) => updateFormData('region', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
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
                  <Label htmlFor="farm_size">Farm Size</Label>
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
                  <Label htmlFor="farm_size_unit">Unit</Label>
                  <Select value={formData.farm_size_unit} onValueChange={(value) => updateFormData('farm_size_unit', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hectares">Hectares</SelectItem>
                      <SelectItem value="acres">Acres</SelectItem>
                      <SelectItem value="square_meters">Square Meters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="farming_type">Type of Farming</Label>
                <Select value={formData.farming_type} onValueChange={(value) => updateFormData('farming_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select farming type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subsistence">Subsistence Farming</SelectItem>
                    <SelectItem value="commercial">Commercial Farming</SelectItem>
                    <SelectItem value="mixed">Mixed Farming</SelectItem>
                    <SelectItem value="organic">Organic Farming</SelectItem>
                    <SelectItem value="livestock">Livestock</SelectItem>
                    <SelectItem value="aquaculture">Aquaculture</SelectItem>
                    <SelectItem value="horticulture">Horticulture</SelectItem>
                    <SelectItem value="agroforestry">Agroforestry</SelectItem>
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
              <CardTitle>Primary Crops</CardTitle>
              <CardDescription>
                Select the main crops you grow or are interested in
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
                  <Label>Selected Crops:</Label>
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
              <CardTitle>Almost Done!</CardTitle>
              <CardDescription>
                Review your information and complete setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Full Name:</span>
                  <span>{formData.full_name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Role:</span>
                  <span>{formData.user_role.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Farm:</span>
                  <span>{formData.farm_name || 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Location:</span>
                  <span>{formData.farm_location}, {formData.region}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Farm Size:</span>
                  <span>{formData.farm_size} {formData.farm_size_unit}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Experience:</span>
                  <span>{formData.farming_experience} years</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Primary Crops:</span>
                  <span>{formData.primary_crops.length} selected</span>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Sprout className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">What's Next?</span>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Access personalized agricultural knowledge entries</li>
                  <li>• Get weather forecasts for your region</li>
                  <li>• Receive crop-specific farming advice</li>
                  <li>• Connect with other farmers in your area</li>
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
            <h1 className="text-2xl font-bold text-gray-900">Welcome to AI4AgriWeather</h1>
            <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
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
            <span>Previous</span>
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
              <span>Next</span>
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
                  <span>Setting up...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Complete Setup</span>
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