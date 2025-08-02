"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Shield, Camera, Save } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { updateProfile } from "@/lib/features/auth/authSlice"
import { RoleRequestSection } from "./role-request-section"

export function ProfileSettings() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [isUpdating, setIsUpdating] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    department: user?.department || "",
    bio: "",
  })
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    ticketUpdates: true,
    systemAlerts: false,
  })

  const handleProfileUpdate = async () => {
    setIsUpdating(true)

    // Simulate API call
    setTimeout(() => {
      dispatch(updateProfile(profileData))
      setIsUpdating(false)
    }, 1000)
  }

  const handleAvatarChange = () => {
    // Simulate avatar upload
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
    dispatch(updateProfile({ avatar: newAvatar }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture */}
            <Card className="border-gray-200 shadow-professional">
              <CardHeader>
                <CardTitle className="text-gray-900">Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Avatar className="h-32 w-32 mx-auto">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl bg-primary text-white">{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  onClick={handleAvatarChange}
                  className="border-gray-300 hover:bg-gray-50 bg-transparent"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Change Avatar
                </Button>
              </CardContent>
            </Card>

            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-gray-200 shadow-professional">
                <CardHeader>
                  <CardTitle className="text-gray-900">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="border-gray-300 focus:border-primary focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="border-gray-300 focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-gray-700 font-medium">
                      Department
                    </Label>
                    <Input
                      id="department"
                      value={profileData.department}
                      onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                      className="border-gray-300 focus:border-primary focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-gray-700 font-medium">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      className="border-gray-300 focus:border-primary focus:ring-primary"
                    />
                  </div>

                  <Button
                    onClick={handleProfileUpdate}
                    disabled={isUpdating}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>

              {/* Role Request Section */}
              <RoleRequestSection />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-gray-200 shadow-professional">
            <CardHeader>
              <CardTitle className="text-gray-900">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Push Notifications</h4>
                  <p className="text-sm text-gray-600">Receive push notifications in browser</p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Ticket Updates</h4>
                  <p className="text-sm text-gray-600">Get notified when tickets are updated</p>
                </div>
                <Switch
                  checked={notifications.ticketUpdates}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, ticketUpdates: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">System Alerts</h4>
                  <p className="text-sm text-gray-600">Receive system maintenance alerts</p>
                </div>
                <Switch
                  checked={notifications.systemAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, systemAlerts: checked })}
                />
              </div>

              <Button className="bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card className="border-gray-200 shadow-professional">
              <CardHeader>
                <CardTitle className="text-gray-900">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-gray-700 font-medium">
                    Current Password
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-gray-700 font-medium">
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-700 font-medium">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/90">Update Password</Button>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-professional">
              <CardHeader>
                <CardTitle className="text-gray-900">Account Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" className="border-gray-300 hover:bg-gray-50 bg-transparent">
                    Enable 2FA
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Login Sessions</h4>
                    <p className="text-sm text-gray-600">Manage your active sessions</p>
                  </div>
                  <Button variant="outline" className="border-gray-300 hover:bg-gray-50 bg-transparent">
                    View Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
