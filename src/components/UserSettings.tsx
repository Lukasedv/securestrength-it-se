import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Shield, 
  Gear, 
  Crown, 
  Download, 
  ArrowCounterClockwise,
  Warning,
  CheckCircle,
  XCircle
} from '@phosphor-icons/react'

interface UserSettings {
  username: string
  email: string
  workoutReminders: boolean
  darkMode: boolean
  workoutDifficulty: string
}

// VULNERABLE: Client-side authorization check (DO NOT USE IN PRODUCTION)
// This demonstrates CWE-290: Authentication Bypass by Alternate Path
// and CWE-602: Client-Side Enforcement of Server-Side Security
export function UserSettings({ onClose }: { onClose: () => void }) {
  const [userRole, setUserRole] = useState<string>(
    localStorage.getItem('userRole') || 'user'
  )
  const [settings, setSettings] = useState<UserSettings>({
    username: localStorage.getItem('username') || 'fitness_user',
    email: localStorage.getItem('email') || 'user@example.com',
    workoutReminders: true,
    darkMode: false,
    workoutDifficulty: 'intermediate'
  })

  // VULNERABLE: Role is determined purely from localStorage
  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'user'
    setUserRole(role)
  }, [])

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    
    // Persist basic settings to localStorage
    if (key === 'username') localStorage.setItem('username', value)
    if (key === 'email') localStorage.setItem('email', value)
  }

  // VULNERABLE: Admin functions accessible via client-side check only
  const exportAllUserData = () => {
    const userData = {
      settings,
      workoutHistory: JSON.parse(localStorage.getItem('workout-history') || '[]'),
      securityProgress: JSON.parse(localStorage.getItem('security-progress') || '{}'),
      userRole,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'securestrength-user-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // VULNERABLE: Dangerous admin function with no server validation
  const resetAppData = () => {
    if (confirm('Are you sure you want to reset ALL app data? This cannot be undone.')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500'
      case 'premium': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gear size={32} className="text-primary" />
          <div>
            <h1 className="text-2xl font-bold">User Settings</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${getRoleColor(userRole)} text-white`}>
                {userRole.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Current role: {userRole}
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield size={16} />
            Security
          </TabsTrigger>
          {/* VULNERABLE: Premium tab shown based on client-side role check */}
          {userRole === 'premium' && (
            <TabsTrigger value="premium" className="flex items-center gap-2">
              <Crown size={16} />
              Premium
            </TabsTrigger>
          )}
          {/* VULNERABLE: Admin tab shown based on client-side role check */}
          {userRole === 'admin' && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Warning size={16} />
              Admin
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Profile</CardTitle>
              <CardDescription>Manage your basic account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={settings.username}
                  onChange={(e) => handleSettingChange('username', e.target.value)}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Workout Reminders</p>
                    <p className="text-sm text-muted-foreground">Get notified about your workouts</p>
                  </div>
                  <Switch 
                    checked={settings.workoutReminders}
                    onCheckedChange={(checked) => handleSettingChange('workoutReminders', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                  </div>
                  <Switch 
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Information</CardTitle>
              <CardDescription>Educational security tips and vulnerability demonstrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start gap-3">
                  <Warning size={20} className="text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Educational Security Warning</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      This application demonstrates client-side authorization vulnerabilities. 
                      In a real application, role checks should ALWAYS be performed on the server.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Vulnerability Demonstration</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <XCircle size={16} className="text-red-500" />
                    <span>Client-side role validation (CWE-290)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle size={16} className="text-red-500" />
                    <span>localStorage-based authorization (CWE-602)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle size={16} className="text-red-500" />
                    <span>No server-side permission validation</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">Try This Attack:</h4>
                <code className="text-sm bg-blue-100 p-2 rounded block">
                  localStorage.setItem('userRole', 'admin')
                </code>
                <p className="text-sm text-blue-700 mt-2">
                  Open browser console and run this command, then refresh the settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VULNERABLE: Premium features accessible via client-side check */}
        {userRole === 'premium' && (
          <TabsContent value="premium" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown size={20} className="text-yellow-500" />
                  Premium Features
                </CardTitle>
                <CardDescription>Advanced features for premium users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Crown size={16} className="mr-2" />
                    Create Custom Workout Plan
                  </Button>
                  <Button className="w-full" variant="outline">
                    Advanced Statistics Dashboard
                  </Button>
                  <Button className="w-full" variant="outline">
                    Export Personal Training Reports
                  </Button>
                  <Button className="w-full" variant="outline">
                    Priority Security Tips
                  </Button>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm text-green-700">Premium features unlocked!</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* VULNERABLE: Admin panel accessible via client-side check */}
        {userRole === 'admin' && (
          <TabsContent value="admin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warning size={20} className="text-red-500" />
                  Admin Panel
                </CardTitle>
                <CardDescription>Dangerous administrative functions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-start gap-3">
                    <Warning size={20} className="text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800">Warning: Administrative Functions</h4>
                      <p className="text-sm text-red-700 mt-1">
                        These functions are protected only by client-side checks. In production, 
                        these would require proper server-side authorization.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={exportAllUserData}
                  >
                    <Download size={16} className="mr-2" />
                    Export All User Data
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    variant="destructive"
                    onClick={resetAppData}
                  >
                    <ArrowCounterClockwise size={16} className="mr-2" />
                    Reset All App Data
                  </Button>
                  
                  <Button className="w-full" variant="outline">
                    View System Logs
                  </Button>
                  
                  <Button className="w-full" variant="outline">
                    Manage All Users
                  </Button>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <h4 className="font-medium mb-2">System Status</h4>
                  <div className="text-sm space-y-1">
                    <div>Users: 1,337</div>
                    <div>Active Sessions: 42</div>
                    <div>Server Load: 23%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}