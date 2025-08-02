"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Crown, Check, X, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UpgradeRequest {
  _id: string
  name: string
  email: string
  role: string
  upgradeRequest: {
    requestedRole: string
    requestedAt: string
    status: string
    reason?: string
  }
}

export function UpgradeRequests() {
  const [requests, setRequests] = useState<UpgradeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchUpgradeRequests()
  }, [])

  const fetchUpgradeRequests = async () => {
    try {
      const response = await fetch("/api/users/upgrade-requests")
      const data = await response.json()

      if (response.ok) {
        setRequests(data.upgradeRequests)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch upgrade requests",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch upgrade requests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRequest = async (userId: string, action: "approve" | "reject") => {
    try {
      const response = await fetch(`/api/users/upgrade-requests/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        })
        // Remove the request from the list
        setRequests((prev) => prev.filter((req) => req._id !== userId))
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to process request",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process request",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-xl bg-white/80 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            Admin Upgrade Requests
          </CardTitle>
        </CardHeader>
      </Card>

      {loading ? (
        <Card className="backdrop-blur-xl bg-white/80 border-white/20">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading upgrade requests...</p>
          </CardContent>
        </Card>
      ) : requests.length === 0 ? (
        <Card className="backdrop-blur-xl bg-white/80 border-white/20">
          <CardContent className="p-8 text-center">
            <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
            <p className="text-gray-600">All upgrade requests have been processed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request._id} className="backdrop-blur-xl bg-white/80 border-white/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                        {request.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900">{request.name}</h3>
                      <p className="text-sm text-gray-600">{request.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Current: {request.role.replace("_", " ")}
                        </Badge>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                          Requesting: {request.upgradeRequest.requestedRole}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right text-xs text-gray-500 mr-4">
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3" />
                        {new Date(request.upgradeRequest.requestedAt).toLocaleDateString()}
                      </div>
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                        {request.upgradeRequest.status}
                      </Badge>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleRequest(request._id, "approve")}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequest(request._id, "reject")}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>

                {request.upgradeRequest.reason && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Reason:</strong> {request.upgradeRequest.reason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
