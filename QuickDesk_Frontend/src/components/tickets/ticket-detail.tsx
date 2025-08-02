"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MessageSquare, Send, Paperclip, ThumbsUp, ThumbsDown, Share2, Tag, EyeOff } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { setCurrentTicket, updateTicket, addConversation, voteTicket } from "@/lib/features/tickets/ticketSlice"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/hooks/use-toast"

export function TicketDetail() {
  const dispatch = useAppDispatch()
  const { currentTicket } = useAppSelector((state) => state.tickets)
  const { user } = useAppSelector((state) => state.auth)
  const { users } = useAppSelector((state) => state.users)
  const [newMessage, setNewMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInternalNote, setIsInternalNote] = useState(false)

  if (!currentTicket) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No ticket selected</p>
      </div>
    )
  }

  const creator = users.find((u) => u.id === currentTicket.createdBy)
  const assignee = users.find((u) => u.id === currentTicket.assignedTo)
  const userVoteType = currentTicket.upvotes.includes(user?.id || "")
    ? "upvote"
    : currentTicket.downvotes.includes(user?.id || "")
      ? "downvote"
      : null

  const handleBack = () => {
    dispatch(setCurrentTicket(null))
  }

  const handleStatusChange = (newStatus: string) => {
    const updatedTicket = {
      ...currentTicket,
      status: newStatus as any,
      updatedAt: new Date().toISOString(),
    }
    dispatch(updateTicket(updatedTicket))
  }

  const handleAssigneeChange = (newAssignee: string) => {
    const updatedTicket = {
      ...currentTicket,
      assignedTo: newAssignee === "unassigned" ? undefined : newAssignee,
      updatedAt: new Date().toISOString(),
    }
    dispatch(updateTicket(updatedTicket))
  }

  const handleVote = (voteType: "upvote" | "downvote") => {
    if (!user) return
    dispatch(voteTicket({ ticketId: currentTicket.id, userId: user.id, voteType }))
    toast({
      title: voteType === "upvote" ? "Upvoted" : "Downvoted",
      description: `You ${voteType}d this ticket.`,
    })
  }

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/tickets/${currentTicket.id}`
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link Copied",
      description: "Ticket link has been copied to clipboard.",
    })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return

    setIsSubmitting(true)

    const conversation = {
      id: Date.now().toString(),
      message: newMessage,
      author: user.id,
      authorName: user.name,
      authorRole: user.role,
      timestamp: new Date().toISOString(),
      isInternal: isInternalNote,
    }

    dispatch(addConversation({ ticketId: currentTicket.id, conversation }))
    setNewMessage("")
    setIsInternalNote(false)
    setIsSubmitting(false)

    toast({
      title: isInternalNote ? "Internal Note Added" : "Reply Sent",
      description: isInternalNote ? "Your internal note has been added." : "Your reply has been sent to the user.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const canModifyTicket = user?.role === "admin" || user?.role === "agent"
  const canReply = user?.role === "admin" || user?.role === "agent" || user?.id === currentTicket.createdBy

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="border-gray-300 hover:bg-gray-50 bg-transparent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tickets
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{currentTicket.subject}</h1>
          <p className="text-gray-600">Ticket #{currentTicket.id}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Voting System */}
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("upvote")}
              className={`h-8 w-8 p-0 hover:bg-green-100 ${
                userVoteType === "upvote" ? "bg-green-100 text-green-600" : "text-gray-600"
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-gray-600 min-w-[30px] text-center">
              {currentTicket.upvotes.length - currentTicket.downvotes.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("downvote")}
              className={`h-8 w-8 p-0 hover:bg-red-100 ${
                userVoteType === "downvote" ? "bg-red-100 text-red-600" : "text-gray-600"
              }`}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Share Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="border-gray-300 hover:bg-gray-50 bg-transparent"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Card className="border-gray-200 shadow-professional">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-gray-900">{currentTicket.subject}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${getStatusColor(currentTicket.status)} text-xs`}>
                      {currentTicket.status.replace("-", " ")}
                    </Badge>
                    <Badge className={`${getPriorityColor(currentTicket.priority)} text-xs`}>
                      {currentTicket.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-gray-300">
                      {currentTicket.category}
                    </Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>Created {formatDistanceToNow(new Date(currentTicket.createdAt), { addSuffix: true })}</p>
                  <p>Updated {formatDistanceToNow(new Date(currentTicket.updatedAt), { addSuffix: true })}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-gray-700">{currentTicket.description}</p>

              {/* Tags */}
              {currentTicket.tags && currentTicket.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <div className="flex gap-1">
                    {currentTicket.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversation Thread */}
          <Card className="border-gray-200 shadow-professional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <MessageSquare className="h-5 w-5" />
                Conversation ({currentTicket.conversations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentTicket.conversations.map((conversation, index) => {
                  const author = users.find((u) => u.id === conversation.author)
                  const isCurrentUser = conversation.author === user?.id
                  const isInternal = conversation.isInternal && (user?.role === "admin" || user?.role === "agent")

                  // Don't show internal notes to regular users
                  if (conversation.isInternal && user?.role === "user") {
                    return null
                  }

                  return (
                    <div key={conversation.id} className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={author?.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary text-white">{author?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 ${isCurrentUser ? "text-right" : ""}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{conversation.authorName}</span>
                          <Badge variant="outline" className="text-xs border-gray-300">
                            {conversation.authorRole}
                          </Badge>
                          {conversation.isInternal && (
                            <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1">
                              <EyeOff className="h-3 w-3" />
                              Internal
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-lg text-sm ${
                            conversation.isInternal
                              ? "bg-orange-50 border border-orange-200 mr-8"
                              : isCurrentUser
                                ? "bg-primary text-primary-foreground ml-8"
                                : "bg-gray-50 mr-8"
                          }`}
                        >
                          {conversation.message}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Reply Form */}
              {canReply && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3">
                    {(user?.role === "admin" || user?.role === "agent") && (
                      <div className="flex items-center space-x-2">
                        <Switch id="internal-note" checked={isInternalNote} onCheckedChange={setIsInternalNote} />
                        <Label htmlFor="internal-note" className="text-sm text-gray-700 flex items-center gap-1">
                          <EyeOff className="h-4 w-4" />
                          Internal note (only visible to agents and admins)
                        </Label>
                      </div>
                    )}

                    <Textarea
                      placeholder={isInternalNote ? "Add an internal note..." : "Type your reply..."}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="border-gray-300 focus:border-primary focus:ring-primary min-h-[100px]"
                    />
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50 bg-transparent">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Attach File
                      </Button>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSubmitting}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Sending..." : isInternalNote ? "Add Note" : "Send Reply"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <Card className="border-gray-200 shadow-professional">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Created By</label>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={creator?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary text-white">{creator?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-900">{creator?.name}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Assigned To</label>
                {canModifyTicket ? (
                  <Select value={currentTicket.assignedTo || "unassigned"} onValueChange={handleAssigneeChange}>
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-primary focus:ring-primary">
                      <SelectValue placeholder="Assign to agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users
                        .filter((u) => u.role === "agent" || u.role === "admin")
                        .map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    {assignee ? (
                      <>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={assignee.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-primary text-white">{assignee.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-900">{assignee.name}</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">Unassigned</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                {canModifyTicket ? (
                  <Select value={currentTicket.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-primary focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(currentTicket.status)} text-xs`}>
                      {currentTicket.status.replace("-", " ")}
                    </Badge>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <div className="mt-1">
                  <Badge className={`${getPriorityColor(currentTicket.priority)} text-xs`}>
                    {currentTicket.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <p className="text-sm mt-1 text-gray-900">{currentTicket.category}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Votes</label>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-green-600">
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-sm font-medium">{currentTicket.upvotes.length}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-600">
                    <ThumbsDown className="h-4 w-4" />
                    <span className="text-sm font-medium">{currentTicket.downvotes.length}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Created</label>
                <p className="text-sm mt-1 text-gray-900">
                  {formatDistanceToNow(new Date(currentTicket.createdAt), { addSuffix: true })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Last Updated</label>
                <p className="text-sm mt-1 text-gray-900">
                  {formatDistanceToNow(new Date(currentTicket.updatedAt), { addSuffix: true })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
