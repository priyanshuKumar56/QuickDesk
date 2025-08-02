"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserPlus, Clock, CheckCircle, XCircle, Eye, MessageSquare } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { updateRequest } from "@/lib/features/roleRequests/roleRequestSlice"
import { updateUser } from "@/lib/features/users/userSlice"
// import { toast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

export function RoleRequestsManagement() {
  const dispatch = useAppDispatch()
  const { requests } = useAppSelector((state) => state.roleRequests)
  const { users } = useAppSelector((state) => state.users)
  const { user: currentUser } = useAppSelector((state) => state.auth)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [adminComment, setAdminComment] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApproveRequest = async (request, comment = "") => {
    setIsProcessing(true)

    // Simulate API call
    setTimeout(() => {
      // Update the request
      const updatedRequest = {
        ...request,
        status: "approved" as const,
        reviewedAt: new Date().toISOString(),
        reviewedBy: currentUser?.id,
        adminComment: comment,
      }

      dispatch(updateRequest(updatedRequest))

      // Update the user's role
      const user = users.find((u) => u.id === request.userId)
      if (user) {
        dispatch(updateUser({ ...user, role: request.requestedRole }))
      }

      setIsProcessing(false)
      setAdminComment("")
      setSelectedRequest(null)

      // toast({
      //   title: "Request Approved",
      //   description: `${request.userName} has been promoted to ${request.requestedRole}.`,
      // })
    }, 1000)
  }

  const handleRejectRequest = async (request, comment = "") => {
    setIsProcessing(true)

    // Simulate API call
    setTimeout(() => {
      const updatedRequest = {
        ...request,
        status: "rejected" as const,
        reviewedAt: new Date().toISOString(),
        reviewedBy: currentUser?.id,
        adminComment: comment,
      }

      dispatch(updateRequest(updatedRequest))

      setIsProcessing(false)
      setAdminComment("")
      setSelectedRequest(null)

      toast({
        title: "Request Rejected",
        description: `${request.userName}'s role request has been rejected.`,
      })
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
        return <Clock className="h-4 w-4 text-gray-600" />
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

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const processedRequests = requests.filter((r) => r.status !== "pending")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Role Upgrade Requests</h2>
        <p className="text-gray-600">Review and manage user role upgrade requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-200 shadow-professional">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-professional">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {requests.filter((r) => r.status === "approved").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-professional">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {requests.filter((r) => r.status === "rejected").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="border-gray-200 shadow-professional">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <UserPlus className="h-5 w-5" />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => {
                const user = users.find((u) => u.id === request.userId)

                return (
                  <Card key={request.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-primary text-white">
                              {request.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{request.userName}</h3>
                              <Badge variant="outline" className="text-xs border-gray-300 capitalize">
                                {request.currentRole} → {request.requestedRole}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{request.userEmail}</p>
                            <p className="text-sm text-gray-700 mb-2">{request.reason}</p>
                            <p className="text-xs text-gray-500">
                              Requested {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRequest(request)}
                                className="border-gray-300 hover:bg-gray-50"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Review Role Request</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium">User:</span>
                                    <span className="text-sm">{request.userName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium">Current Role:</span>
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {request.currentRole}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium">Requested Role:</span>
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {request.requestedRole}
                                    </Badge>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Reason:</Label>
                                  <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded">{request.reason}</p>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="admin-comment">Admin Comment (Optional)</Label>
                                  <Textarea
                                    id="admin-comment"
                                    placeholder="Add a comment for the user..."
                                    value={adminComment}
                                    onChange={(e) => setAdminComment(e.target.value)}
                                    className="border-gray-300 focus:border-primary focus:ring-primary"
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleApproveRequest(request, adminComment)}
                                    disabled={isProcessing}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {isProcessing ? "Processing..." : "Approve"}
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectRequest(request, adminComment)}
                                    disabled={isProcessing}
                                    variant="outline"
                                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    {isProcessing ? "Processing..." : "Reject"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Processed Requests */}
      {processedRequests.length > 0 && (
        <Card className="border-gray-200 shadow-professional">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Processed Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processedRequests.slice(0, 5).map((request) => {
                const user = users.find((u) => u.id === request.userId)

                return (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">{request.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{request.userName}</p>
                        <p className="text-xs text-gray-500">
                          {request.currentRole} → {request.requestedRole}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(request.status)} text-xs border flex items-center gap-1`}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </Badge>
                      {request.adminComment && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Admin Comment</DialogTitle>
                            </DialogHeader>
                            <p className="text-sm text-gray-600">{request.adminComment}</p>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {requests.length === 0 && (
        <Card className="border-gray-200 shadow-professional">
          <CardContent className="p-12 text-center">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No role requests yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
