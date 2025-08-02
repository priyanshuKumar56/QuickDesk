"use client"

import type React from "react"
import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { requestUpgrade } from "@/lib/features/auth/auth-slice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Bell, Shield, Save, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function Settings() {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { toast } = useToast()

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [upgradeReason, setUpgradeReason] = useState("")

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    ticketUpdates: true,
    newComments: true,
    statusChanges: true,
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Success",
      description: "Profile updated successfully!",
    })
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (profileData.newPassword !== profileData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive",
      })
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setProfileData({
      ...profileData,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })

    toast({
      title: "Success",
      description: "Password changed successfully!",
    })
  }

  const handleUpgradeRequest = async () => {
    try {
      await dispatch(requestUpgrade({ reason: upgradeReason })).unwrap()
      setUpgradeReason("")
      toast({
        title: "Success",
        description: "Upgrade request submitted successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit upgrade request",
        variant: "destructive",
      })
    }
  }

  const handleNotificationUpdate = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    toast({
      title: "Success",
      description: "Notification preferences updated!",
    })
  }

  const canRequestUpgrade = user?.role === "end_user" && !user?.upgradeRequest

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Settings */}
      <Card className="backdrop-blur-xl bg-white/80 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xl">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="capitalize">{user?.role?.replace("_", " ")} Account</Badge>
                {user?.upgradeRequest && (
                  <Badge
                    className={
                      user.upgradeRequest.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                        : user.upgradeRequest.status === "approved"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                    }
                  >
                    Upgrade {user.upgradeRequest.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="backdrop-blur-sm bg-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="backdrop-blur-sm bg-white/50"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Admin Upgrade Request */}
      {canRequestUpgrade && (
        <Card className="backdrop-blur-xl bg-white/80 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              Request Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Request admin privileges to manage users, categories, and access advanced features.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upgrade-reason">Reason for Request</Label>
                <Textarea
                  id="upgrade-reason"
                  placeholder="Please explain why you need admin access..."
                  value={upgradeReason}
                  onChange={(e) => setUpgradeReason(e.target.value)}
                  rows={3}
                  className="backdrop-blur-sm bg-white/50"
                />
              </div>
              <Button
                onClick={handleUpgradeRequest}
                disabled={!upgradeReason.trim()}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                Submit Upgrade Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Password Change */}
      <Card className="backdrop-blur-xl bg-white/80 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={profileData.currentPassword}
                onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                className="backdrop-blur-sm bg-white/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={profileData.newPassword}
                  onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                  className="backdrop-blur-sm bg-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={profileData.confirmPassword}
                  onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                  className="backdrop-blur-sm bg-white/50"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="backdrop-blur-xl bg-white/80 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
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
                <h4 className="font-medium text-gray-900">New Comments</h4>
                <p className="text-sm text-gray-600">Notify when someone comments on your tickets</p>
              </div>
              <Switch
                checked={notifications.newComments}
                onCheckedChange={(checked) => setNotifications({ ...notifications, newComments: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Status Changes</h4>
                <p className="text-sm text-gray-600">Get notified when ticket status changes</p>
              </div>
              <Switch
                checked={notifications.statusChanges}
                onCheckedChange={(checked) => setNotifications({ ...notifications, statusChanges: checked })}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleNotificationUpdate}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
