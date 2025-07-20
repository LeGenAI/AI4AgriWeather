import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Wheat,
  Globe,
  Edit,
  Save,
  X,
  Sprout,
  Tractor
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { COMMON_CROPS_TANZANIA, TANZANIA_REGIONS } from '@/utils/agricultureTemplates';

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserProfileDialog = ({ open, onOpenChange }: UserProfileDialogProps) => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    farm_name: '',
    farm_location: '',
    farm_size: 0,
    farm_size_unit: 'hectares',
    primary_crops: [] as string[],
    farming_experience: 0,
    farming_type: 'mixed',
    region: '',
    user_role: 'farmer',
    phone_number: '',
    preferred_language: 'english'
  });

  // Initialize form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        farm_name: profile.farm_name || '',
        farm_location: profile.farm_location || '',
        farm_size: profile.farm_size || 0,
        farm_size_unit: profile.farm_size_unit || 'hectares',
        primary_crops: profile.primary_crops || [],
        farming_experience: profile.farming_experience || 0,
        farming_type: profile.farming_type || 'mixed',
        region: profile.region || '',
        user_role: profile.user_role || 'farmer',
        phone_number: profile.phone_number || '',
        preferred_language: profile.preferred_language || 'english'
      });
    }
  }, [profile]);

  const updateFormData = (field: string, value: any) => {
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

  const handleSave = async () => {
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
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });

      await refreshProfile();
      setEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile values
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        farm_name: profile.farm_name || '',
        farm_location: profile.farm_location || '',
        farm_size: profile.farm_size || 0,
        farm_size_unit: profile.farm_size_unit || 'hectares',
        primary_crops: profile.primary_crops || [],
        farming_experience: profile.farming_experience || 0,
        farming_type: profile.farming_type || 'mixed',
        region: profile.region || '',
        user_role: profile.user_role || 'farmer',
        phone_number: profile.phone_number || '',
        preferred_language: profile.preferred_language || 'english'
      });
    }
    setEditing(false);
  };

  if (!profile) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-green-100 text-green-700 text-lg font-semibold">
                  {(formData.full_name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">User Profile</DialogTitle>
                <DialogDescription>
                  Manage your agricultural profile and farm information
                </DialogDescription>
              </div>
            </div>
            <Button
              variant={editing ? "outline" : "secondary"}
              onClick={() => setEditing(!editing)}
              disabled={loading}
            >
              {editing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="farm">Farm Details</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    {editing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => updateFormData('full_name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border text-sm">
                        {formData.full_name || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="p-2 bg-gray-50 rounded border text-sm text-gray-600">
                      <Mail className="h-4 w-4 inline mr-2" />
                      {user?.email || 'Not available'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    {editing ? (
                      <Input
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(e) => updateFormData('phone_number', e.target.value)}
                        placeholder="+255 123 456 789"
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border text-sm">
                        <Phone className="h-4 w-4 inline mr-2" />
                        {formData.phone_number || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user_role">Role</Label>
                    {editing ? (
                      <Select value={formData.user_role} onValueChange={(value) => updateFormData('user_role', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="farmer">Farmer</SelectItem>
                          <SelectItem value="extension_officer">Extension Officer</SelectItem>
                          <SelectItem value="researcher">Researcher</SelectItem>
                          <SelectItem value="cooperative_member">Cooperative Member</SelectItem>
                          <SelectItem value="agribusiness">Agribusiness</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border text-sm">
                        {formData.user_role?.replace('_', ' ') || 'Not specified'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farming_experience">Years of Experience</Label>
                    {editing ? (
                      <Input
                        id="farming_experience"
                        type="number"
                        value={formData.farming_experience}
                        onChange={(e) => updateFormData('farming_experience', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border text-sm">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        {formData.farming_experience} years
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="farm" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tractor className="h-5 w-5" />
                  <span>Farm Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farm_name">Farm Name</Label>
                    {editing ? (
                      <Input
                        id="farm_name"
                        value={formData.farm_name}
                        onChange={(e) => updateFormData('farm_name', e.target.value)}
                        placeholder="Enter farm name"
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border text-sm">
                        {formData.farm_name || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farm_location">Farm Location</Label>
                    {editing ? (
                      <Input
                        id="farm_location"
                        value={formData.farm_location}
                        onChange={(e) => updateFormData('farm_location', e.target.value)}
                        placeholder="Village/Ward name"
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border text-sm">
                        <MapPin className="h-4 w-4 inline mr-2" />
                        {formData.farm_location || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    {editing ? (
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
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border text-sm">
                        {formData.region?.replace('_', ' ').toUpperCase() || 'Not specified'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farming_type">Farming Type</Label>
                    {editing ? (
                      <Select value={formData.farming_type} onValueChange={(value) => updateFormData('farming_type', value)}>
                        <SelectTrigger>
                          <SelectValue />
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
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border text-sm">
                        {formData.farming_type?.replace('_', ' ') || 'Not specified'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farm_size">Farm Size</Label>
                    {editing ? (
                      <Input
                        id="farm_size"
                        type="number"
                        value={formData.farm_size}
                        onChange={(e) => updateFormData('farm_size', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.1"
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border text-sm">
                        {formData.farm_size || 'Not specified'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farm_size_unit">Unit</Label>
                    {editing ? (
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
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border text-sm">
                        {formData.farm_size_unit || 'hectares'}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="flex items-center space-x-2">
                    <Sprout className="h-4 w-4" />
                    <span>Primary Crops</span>
                  </Label>
                  
                  {editing ? (
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
                            <span className="text-sm">
                              {crop.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formData.primary_crops.length > 0 ? (
                        formData.primary_crops.map(crop => (
                          <Badge key={crop} variant="secondary" className="bg-green-100 text-green-800">
                            {crop.replace('_', ' ').toUpperCase()}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No crops selected</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preferred_language">Preferred Language</Label>
                  {editing ? (
                    <Select value={formData.preferred_language} onValueChange={(value) => updateFormData('preferred_language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="swahili">Kiswahili</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 bg-gray-50 rounded border text-sm">
                      {formData.preferred_language === 'both' ? 'English & Kiswahili' : 
                       formData.preferred_language === 'swahili' ? 'Kiswahili' : 'English'}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Account Information</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-gray-50 rounded border">
                      <span className="font-medium">Member since:</span><br />
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                    </div>
                    <div className="p-3 bg-gray-50 rounded border">
                      <span className="font-medium">Last updated:</span><br />
                      {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {editing && (
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;