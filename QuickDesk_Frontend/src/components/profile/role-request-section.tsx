"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
// import { addRequest } from "@/lib/features/roleRequests/roleRequestSlice"
// import { toast } from "@/hooks/use-toast"

export function RoleRequestSection() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { userRequest } = useAppSelector((state) => state.roleRequests)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestData, setRequestData] = useState({
    requestedRole: "agent" as "agent" | "admin",
    reason: "",
  })

  const handleSubmitRequest = async () => {
    if (!user || !requestData.reason.trim()) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const newRequest = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        currentRole: user.role,
        requestedRole: requestData.requestedRole,
        reason: requestData.reason,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
      }

      // dispatch(addRequest(newRequest))
      setIsSubmitting(false)
      setRequestData({ requestedRole: "agent", reason: "" })

      // toast({
      //   title: "Request Submitted",
      //   description: "Your role upgrade request has been submitted for admin review.",
      // })
    }, 1000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "approved":
        return "bg-green-50 text-green-700 border-green-200"
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  // Don't show for admins
  if (user?.role === "admin") {
    return null
  }

  return (
    <Card className="border-gray-200 shadow-professional">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <UserPlus className="h-5 w-5" />
          Role Upgrade Request
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userRequest ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have a {userRequest.requestedRole} role request that is currently{" "}
                <strong>{userRequest.status}</strong>.
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <Badge className={`${getStatusColor(userRequest.status)} text-xs border flex items-center gap-1`}>
                  {getStatusIcon(userRequest.status)}
                  {userRequest.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Requested Role:</span>
                <Badge variant="outline" className="text-xs border-gray-300 capitalize">
                  {userRequest.requestedRole}
                </Badge>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Reason:</span>
                <p className="text-sm text-gray-600 mt-1">{userRequest.reason}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Submitted:</span>
                <span className="text-sm text-gray-600">{new Date(userRequest.createdAt).toLocaleDateString()}</span>
              </div>

              {userRequest.adminComment && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Admin Comment:</span>
                  <p className="text-sm text-gray-600 mt-1">{userRequest.adminComment}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Request to become a support agent or admin to help manage the help desk system.
            </p>

            <div className="space-y-2">
              <Label htmlFor="requested-role">Requested Role</Label>
              <Select
                value={requestData.requestedRole}
                onValueChange={(value: "agent" | "admin") => setRequestData({ ...requestData, requestedRole: value })}
              >
                <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Support Agent</SelectItem>
                  {user?.role === "agent" && <SelectItem value="admin">Administrator</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Request</Label>
              <Textarea
                id="reason"
                placeholder="Please explain why you would like this role and how you can contribute..."
                value={requestData.reason}
                onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                className="border-gray-300 focus:border-primary focus:ring-primary min-h-[100px]"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Role Responsibilities:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {requestData.requestedRole === "agent" ? (
                  <>
                    <li>• Respond to and resolve user tickets</li>
                    <li>• Update ticket status and priority</li>
                    <li>• Communicate with users about their issues</li>
                    <li>• Escalate complex issues to administrators</li>
                  </>
                ) : (
                  <>
                    <li>• Manage all system users and permissions</li>
                    <li>• Oversee ticket categories and workflows</li>
                    <li>• Access system analytics and reports</li>
                    <li>• Approve role upgrade requests</li>
                  </>
                )}
              </ul>
            </div>

            <Button
              onClick={handleSubmitRequest}
              disabled={isSubmitting || !requestData.reason.trim()}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Submitting Request..." : "Submit Role Request"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
