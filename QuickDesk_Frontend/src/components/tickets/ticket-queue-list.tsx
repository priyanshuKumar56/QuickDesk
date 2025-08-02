"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, MessageSquare, Filter, Search, ThumbsUp, ThumbsDown, Share2, UserPlus, Tag } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { setCurrentTicket, setFilters, updateTicket, voteTicket } from "@/lib/features/tickets/ticketSlice"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/hooks/use-toast"

interface TicketQueueListProps {
  queueType: "my-tickets" | "all-tickets" | "unassigned"
}

export function TicketQueueList({ queueType }: TicketQueueListProps) {
  const dispatch = useAppDispatch()
  const { tickets, filters } = useAppSelector((state) => state.tickets)
  const { user } = useAppSelector((state) => state.auth)
  const { users } = useAppSelector((state) => state.users)
  const [searchTerm, setSearchTerm] = useState("")

  const handleTicketClick = (ticket: any) => {
    dispatch(setCurrentTicket(ticket))
  }

  const handleAssignToMe = (ticket: any) => {
    const updatedTicket = {
      ...ticket,
      assignedTo: user?.id,
      status: "in-progress" as const,
      updatedAt: new Date().toISOString(),
    }
    dispatch(updateTicket(updatedTicket))
    toast({
      title: "Ticket Assigned",
      description: `Ticket "${ticket.subject}" has been assigned to you.`,
    })
  }

  const handleVote = (ticketId: string, voteType: "upvote" | "downvote") => {
    if (!user) return
    dispatch(voteTicket({ ticketId, userId: user.id, voteType }))
    toast({
      title: voteType === "upvote" ? "Upvoted" : "Downvoted",
      description: `You ${voteType}d this ticket.`,
    })
  }

  const handleShare = (ticket: any) => {
    const shareUrl = `${window.location.origin}/tickets/${ticket.id}`
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link Copied",
      description: "Ticket link has been copied to clipboard.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "status-open"
      case "in-progress":
        return "status-in-progress"
      case "resolved":
        return "status-resolved"
      case "closed":
        return "status-closed"
      default:
        return "status-open"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "priority-urgent"
      case "high":
        return "priority-high"
      case "medium":
        return "priority-medium"
      case "low":
        return "priority-low"
      default:
        return "priority-medium"
    }
  }

  const getFilteredTickets = () => {
    let filteredTickets = tickets

    // Filter by queue type
    switch (queueType) {
      case "my-tickets":
        filteredTickets = tickets.filter((t) => t.assignedTo === user?.id)
        break
      case "unassigned":
        filteredTickets = tickets.filter((t) => !t.assignedTo)
        break
      case "all-tickets":
      default:
        filteredTickets = tickets
        break
    }

    // Apply other filters
    filteredTickets = filteredTickets.filter((ticket) => {
      const matchesSearch =
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filters.status === "all" || ticket.status === filters.status
      const matchesPriority = filters.priority === "all" || ticket.priority === filters.priority
      const matchesCategory = filters.category === "all" || ticket.category === filters.category

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory
    })

    return filteredTickets
  }

  const filteredTickets = getFilteredTickets()

  const getQueueTitle = () => {
    switch (queueType) {
      case "my-tickets":
        return "My Assigned Tickets"
      case "unassigned":
        return "Unassigned Tickets"
      case "all-tickets":
      default:
        return "All Tickets"
    }
  }

  const getQueueDescription = () => {
    switch (queueType) {
      case "my-tickets":
        return "Tickets assigned to you"
      case "unassigned":
        return "Tickets waiting for assignment"
      case "all-tickets":
      default:
        return "All tickets in the system"
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-gray-200 shadow-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>

            <Select value={filters.status} onValueChange={(value) => dispatch(setFilters({ status: value }))}>
              <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(value) => dispatch(setFilters({ priority: value }))}>
              <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => dispatch(setFilters({ category: value }))}>
              <SelectTrigger className="border-gray-300 focus:border-primary focus:ring-primary">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Email & Communication">Email & Communication</SelectItem>
                <SelectItem value="Software & Applications">Software & Applications</SelectItem>
                <SelectItem value="Network & Infrastructure">Network & Infrastructure</SelectItem>
                <SelectItem value="Hardware & Equipment">Hardware & Equipment</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                dispatch(setFilters({ status: "all", priority: "all", category: "all" }))
                setSearchTerm("")
              }}
              className="border-gray-300 hover:bg-gray-50"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card className="border-gray-200 shadow-professional">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">
                {getQueueTitle()} ({filteredTickets.length})
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{getQueueDescription()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tickets found in this queue</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const creator = users.find((u) => u.id === ticket.createdBy)
                const assignee = users.find((u) => u.id === ticket.assignedTo)
                const hasUserVoted =
                  ticket.upvotes.includes(user?.id || "") || ticket.downvotes.includes(user?.id || "")
                const userVoteType = ticket.upvotes.includes(user?.id || "")
                  ? "upvote"
                  : ticket.downvotes.includes(user?.id || "")
                    ? "downvote"
                    : null

                return (
                  <Card
                    key={ticket.id}
                    className="border-gray-200 hover:shadow-professional-lg cursor-pointer transition-all duration-200 hover:border-primary/50"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0" onClick={() => handleTicketClick(ticket)}>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold truncate text-gray-900">{ticket.subject}</h3>
                            <Badge className={`${getStatusColor(ticket.status)} text-xs border`}>
                              {ticket.status.replace("-", " ")}
                            </Badge>
                            <Badge className={`${getPriorityColor(ticket.priority)} text-xs border`}>
                              {ticket.priority}
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>

                          {/* Tags */}
                          {ticket.tags && ticket.tags.length > 0 && (
                            <div className="flex items-center gap-1 mb-3">
                              <Tag className="h-3 w-3 text-gray-400" />
                              {ticket.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs border-gray-300">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={creator?.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">{creator?.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{creator?.name}</span>
                            </div>

                            {assignee && (
                              <div className="flex items-center gap-1">
                                <span>→</span>
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={assignee?.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">{assignee?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{assignee?.name}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{ticket.conversations.length} replies</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          {/* Voting System */}
                          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleVote(ticket.id, "upvote")
                              }}
                              className={`h-8 w-8 p-0 hover:bg-green-100 ${
                                userVoteType === "upvote" ? "bg-green-100 text-green-600" : "text-gray-600"
                              }`}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <span className="text-xs font-medium text-gray-600 min-w-[20px] text-center">
                              {ticket.upvotes.length - ticket.downvotes.length}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleVote(ticket.id, "downvote")
                              }}
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
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShare(ticket)
                            }}
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>

                          {/* Assign to Me (for unassigned tickets) */}
                          {queueType === "unassigned" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAssignToMe(ticket)
                              }}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Assign to Me
                            </Button>
                          )}

                          <Badge variant="outline" className="text-xs border-gray-300">
                            {ticket.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
