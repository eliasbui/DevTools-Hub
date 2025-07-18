import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Settings as SettingsIcon, 
  Key, 
  BarChart3, 
  CreditCard, 
  Bell, 
  Shield, 
  Download,
  Upload,
  LogOut,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';

interface UsageStats {
  toolsUsedToday: number;
  dailyLimit: number;
  favoriteTools: Array<{ toolId: string; usageCount: number }>;
  totalUsage: number;
}

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string | null;
}

export function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch usage statistics
  const { data: usageStats } = useQuery<UsageStats>({
    queryKey: ['/api/user/usage-stats'],
    enabled: !!user
  });

  // Fetch API keys
  const { data: apiKeys } = useQuery<ApiKey[]>({
    queryKey: ['/api/user/api-keys'],
    enabled: !!user
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName?: string; lastName?: string }) => {
      return apiRequest('/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/user/delete', {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully."
      });
      setTimeout(() => {
        window.location.href = "/api/logout";
      }, 1000);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateProfileMutation.mutate({
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string
    });
  };

  const exportData = async () => {
    try {
      const response = await apiRequest('/api/user/export', {
        method: 'GET'
      });
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'devtools-hub-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data exported",
        description: "Your data has been exported successfully."
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const usagePercentage = usageStats 
    ? Math.min((usageStats.toolsUsedToday / usageStats.dailyLimit) * 100, 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-4xl mx-auto p-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="w-8 h-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Email */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback>{user?.email ? getInitials(user.email) : 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">User ID: {user?.id}</p>
                </div>
              </div>

              <Separator />

              {/* Profile Form */}
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={user?.firstName || ''}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={user?.lastName || ''}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>

              <Separator />

              {/* Theme Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Appearance</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark theme
                    </p>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>
                Track your tool usage and limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Daily Usage */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Daily Usage</span>
                  <span className="font-medium">
                    {usageStats?.toolsUsedToday || 0} / {usageStats?.dailyLimit || 100}
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {usagePercentage >= 100 
                    ? 'Daily limit reached. Upgrade to Pro for unlimited usage.'
                    : `${100 - usagePercentage}% of daily limit remaining`
                  }
                </p>
              </div>

              <Separator />

              {/* Favorite Tools */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Most Used Tools</h3>
                {usageStats?.favoriteTools && usageStats.favoriteTools.length > 0 ? (
                  <div className="space-y-2">
                    {usageStats.favoriteTools.slice(0, 5).map((tool, index) => (
                      <div key={tool.toolId} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                        <span className="text-sm">{tool.toolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <Badge variant="secondary">{tool.usageCount} uses</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No usage data yet</p>
                )}
              </div>

              <Separator />

              {/* Total Usage */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Total Operations</p>
                  <p className="text-sm text-muted-foreground">
                    Since account creation
                  </p>
                </div>
                <p className="text-2xl font-bold">{usageStats?.totalUsage || 0}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your API keys for programmatic access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  API access is available for Pro and Enterprise users. Upgrade your plan to generate API keys.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Plan */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Free Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      100 operations per day
                    </p>
                  </div>
                  <Badge>Active</Badge>
                </div>
                <Button className="w-full">
                  Upgrade to Pro
                </Button>
              </div>

              {/* Available Plans */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Available Plans</h3>
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Pro</h4>
                        <p className="text-sm text-muted-foreground">
                          Unlimited operations, API access, priority support
                        </p>
                      </div>
                      <p className="text-2xl font-bold">$9.99<span className="text-sm font-normal">/mo</span></p>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Team</h4>
                        <p className="text-sm text-muted-foreground">
                          Everything in Pro + team features
                        </p>
                      </div>
                      <p className="text-2xl font-bold">$19.99<span className="text-sm font-normal">/user/mo</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
              <CardDescription>
                Manage your security settings and data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Export Data */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Management</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Export Your Data</p>
                    <p className="text-sm text-muted-foreground">
                      Download all your data in JSON format
                    </p>
                  </div>
                  <Button onClick={exportData} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Logout */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Sign Out</p>
                  <p className="text-sm text-muted-foreground">
                    Sign out from all devices
                  </p>
                </div>
                <Button
                  onClick={() => window.location.href = '/api/logout'}
                  variant="outline"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>

              <Separator />

              {/* Delete Account */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                <div className="p-4 border border-destructive rounded-lg">
                  <p className="font-medium mb-2">Delete Account</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  {!showDeleteConfirm ? (
                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Are you sure? This action cannot be undone.
                        </AlertDescription>
                      </Alert>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => deleteAccountMutation.mutate()}
                          variant="destructive"
                          disabled={deleteAccountMutation.isPending}
                        >
                          {deleteAccountMutation.isPending ? 'Deleting...' : 'Yes, Delete My Account'}
                        </Button>
                        <Button
                          onClick={() => setShowDeleteConfirm(false)}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}