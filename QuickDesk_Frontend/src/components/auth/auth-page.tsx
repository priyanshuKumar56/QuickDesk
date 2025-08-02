"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { loginUser, registerUser, clearError } from "@/lib/features/auth/authSlice"
import { Ticket, HelpCircle, Shield, Building2, AlertCircle } from "lucide-react"

function LoginForm() {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.auth)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(loginUser({ email, password }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700 font-medium">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-gray-300 focus:border-primary focus:ring-primary"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-700 font-medium">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-gray-300 focus:border-primary focus:ring-primary"
          required
        />
      </div>
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="text-center text-sm text-gray-500 mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="font-medium mb-2">Demo accounts:</p>
        <div className="space-y-1">
          <p>admin@quickdesk.com (Admin)</p>
          <p>agent@quickdesk.com (Agent)</p>
          <p>user@quickdesk.com (User)</p>
          <p className="text-xs mt-2">Password: password123</p>
        </div>
      </div>
    </form>
  )
}

function RegisterForm() {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(registerUser(formData))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-700 font-medium">
          Full Name
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border-gray-300 focus:border-primary focus:ring-primary"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email" className="text-gray-700 font-medium">
          Email
        </Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border-gray-300 focus:border-primary focus:ring-primary"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="department" className="text-gray-700 font-medium">
          Department
        </Label>
        <Select onValueChange={(value) => setFormData({ ...formData, department: value })}>
          <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="it">IT Support</SelectItem>
            <SelectItem value="hr">Human Resources</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password" className="text-gray-700 font-medium">
          Password
        </Label>
        <Input
          id="reg-password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="border-gray-300 focus:border-primary focus:ring-primary"
          required
        />
      </div>
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  )
}

export default function AuthPage() {
  const dispatch = useAppDispatch()
  const { error } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Clear any previous errors when component mounts
    if (error) {
      dispatch(clearError())
    }
  }, [dispatch, error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23e2e8f0' fillOpacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
        <Building2 className="h-8 w-8 text-primary" />
      </div>
      <div className="absolute top-40 right-32 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <HelpCircle className="h-6 w-6 text-blue-600" />
      </div>
      <div className="absolute bottom-32 left-32 w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
        <Shield className="h-7 w-7 text-green-600" />
      </div>

      <Card className="w-full max-w-md shadow-professional-lg border-0 bg-white relative z-10">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Ticket className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">QuickDesk</CardTitle>
          <CardDescription className="text-gray-600">Professional Help Desk Solution</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
