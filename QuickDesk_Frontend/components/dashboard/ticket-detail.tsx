"use client"

import type React from "react"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { updateTicketStatus, addComment } from "@/lib/features/tickets/tickets-slice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MessageSquare, User, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TicketDetailProps {
  onBack: () => void
}

export function TicketDetail({ onBack }: TicketDetailProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { currentTicket } = useSelector((state: RootState) => state.tickets)
  const { user } = useSelector((state: RootState) => state.auth)
  const { toast } = useToast()

  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  if (!currentTicket) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No ticket selected</p>
        <Button onClick={onBack} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await dispatch(
        updateTicketStatus({
          ticketId: currentTicket.id,
          status: newStatus as any,
        }),
      ).unwrap()

      toast({
        title: "Success",
        description: "Ticket status updated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket status.",
        variant: "destructive",
      })
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    setLoading(true)
    try {
      await dispatch(
        addComment({
          ticketId: currentTicket.id,
          content: comment,
          author: user!.id,
          authorName: user!.name,
        }),
      ).unwrap()

      setComment("")
      toast({
        title: "Success",
        description: "Comment added successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const canUpdateStatus = user?.role === "support_agent" || user?.role === "admin"
  const canComment = user?.role !== "end_user" || currentTicket.createdBy === user?.id

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="hover:bg-white/60">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {canUpdateStatus && (
          <Select value={currentTicket.status} onValueChange={handleStatusUpdate}>
            <SelectTrigger className="w-48 backdrop-blur-sm bg-white/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Ticket Header */}
      <Card className="backdrop-blur-xl bg-white/80 border-white/20">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold text-gray-900 mb-2">{currentTicket.subject}</CardTitle>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={`${getStatusColor(currentTicket.status)} text-xs`}>
                  {currentTicket.status.replace("_", " ")}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {currentTicket.category}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {currentTicket.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Ticket #{currentTicket.id}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(currentTicket.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {currentTicket.comments.length} comments
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{currentTicket.description}</p>
          </div>

          {currentTicket.attachments && currentTicket.attachments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments:</h4>
              <div className="flex flex-wrap gap-2">
                {currentTicket.attachments.map((attachment, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {attachment}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Timeline */}
      <Card className="backdrop-blur-xl bg-white/80 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comments & Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentTicket.comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet. Be the first to add one!</p>
            ) : (
              currentTicket.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-4 bg-white/50 rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs">
                      {comment.authorName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{comment.authorName}</span>
                      <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Comment */}
      {canComment && (
        <Card className="backdrop-blur-xl bg-white/80 border-white/20">
          <CardHeader>
            <CardTitle className="text-lg">Add Comment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddComment} className="space-y-4">
              <Textarea
                placeholder="Add your comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="backdrop-blur-sm bg-white/50"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading || !comment.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? "Adding..." : "Add Comment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
