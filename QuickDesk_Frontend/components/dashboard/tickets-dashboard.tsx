"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import {
  setFilters,
  voteTicket,
  fetchTickets,
  setCurrentTicket,
  fetchTicketById,
} from "@/lib/features/tickets/tickets-slice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Plus,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react"

interface TicketsDashboardProps {
  onCreateTicket?: () => void
  onViewTicket?: () => void
}

export function TicketsDashboard({ onCreateTicket, onViewTicket }: TicketsDashboardProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { tickets, filters, loading } = useSelector((state: RootState) => state.tickets)
  const { categories } = useSelector((state: RootState) => state.categories)
  const { user } = useSelector((state: RootState) => state.auth)

  // Fetch tickets when filters change
  useEffect(() => {
    dispatch(fetchTickets())
  }, [dispatch, filters])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "closed":
        return <XCircle className="w-4 h-4 text-gray-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleVote = (ticketId: string, voteType: "up" | "down") => {
    dispatch(voteTicket({ ticketId, voteType }))
  }

  const handleTicketClick = async (ticket: any) => {
    await dispatch(fetchTicketById(ticket._id))
    dispatch(setCurrentTicket(ticket))
    onViewTicket?.()
  }

  const stats = [
    {
      title: "Total Tickets",
      value: tickets.length,
      icon: <AlertCircle className="w-5 h-5 text-blue-600" />,
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "Open",
      value: tickets.filter((t) => t.status === "open").length,
      icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
      color: "bg-orange-50 border-orange-200",
    },
    {
      title: "In Progress",
      value: tickets.filter((t) => t.status === "in_progress").length,
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "Resolved",
      value: tickets.filter((t) => t.status === "resolved").length,
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      color: "bg-green-50 border-green-200",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className={`backdrop-blur-xl bg-white/80 border-white/20 ${stat.color}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/50">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Actions */}
      <Card className="backdrop-blur-xl bg-white/80 border-white/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
            {(user?.role === "end_user" || user?.role === "support_agent") && (
              <Button
                onClick={onCreateTicket}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Ticket
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
                className="pl-10 backdrop-blur-sm bg-white/50"
              />
            </div>

            <Select value={filters.status} onValueChange={(value) => dispatch(setFilters({ status: value }))}>
              <SelectTrigger className="backdrop-blur-sm bg-white/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => dispatch(setFilters({ category: value }))}>
              <SelectTrigger className="backdrop-blur-sm bg-white/50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(value: "recent" | "priority" | "replies") => dispatch(setFilters({ sortBy: value }))}
            >
              <SelectTrigger className="backdrop-blur-sm bg-white/50">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="replies">Most Replies</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="backdrop-blur-xl bg-white/80 border-white/20">
            <CardContent className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Loading tickets...</p>
            </CardContent>
          </Card>
        ) : tickets.length === 0 ? (
          <Card className="backdrop-blur-xl bg-white/80 border-white/20">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.status !== "all" || filters.category !== "all"
                  ? "Try adjusting your filters to see more tickets."
                  : "Create your first ticket to get started."}
              </p>
              {(user?.role === "end_user" || user?.role === "support_agent") && (
                <Button
                  onClick={onCreateTicket}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Ticket
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card
              key={ticket._id}
              className="backdrop-blur-xl bg-white/80 border-white/20 hover:bg-white/90 transition-colors cursor-pointer"
              onClick={() => handleTicketClick(ticket)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(ticket.status)}
                      <h3 className="font-semibold text-gray-900 truncate">{ticket.subject}</h3>
                      <Badge className={`${getStatusColor(ticket.status)} text-xs`}>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      <Badge className={`${getPriorityColor(ticket.priority)} text-xs`}>{ticket.priority}</Badge>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ticket.description}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="text-xs bg-gray-200">
                            {ticket.createdByName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {ticket.createdByName || "Unknown"}
                      </span>
                      <span>{ticket.categoryName}</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {ticket.commentCount || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(ticket._id, "up")}
                        className={`h-8 w-8 p-0 ${ticket.userVote === "up" ? "bg-green-100 text-green-600" : "hover:bg-green-50"}`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <span className="text-xs font-medium text-gray-600">
                        {ticket.upvoteCount - ticket.downvoteCount}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(ticket._id, "down")}
                        className={`h-8 w-8 p-0 ${ticket.userVote === "down" ? "bg-red-100 text-red-600" : "hover:bg-red-50"}`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
