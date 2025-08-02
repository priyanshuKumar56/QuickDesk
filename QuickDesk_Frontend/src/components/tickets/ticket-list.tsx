"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, MessageSquare, Filter, Search, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { setCurrentTicket, setFilters } from "@/lib/features/tickets/ticketSlice"
import { formatDistanceToNow } from "date-fns"
import { TicketQueueTabs } from "./ticket-queue-tabs"

export function TicketList() {
  const dispatch = useAppDispatch()
  const { tickets, filters } = useAppSelector((state) => state.tickets)
  const { user } = useAppSelector((state) => state.auth)
  const { users } = useAppSelector((state) => state.users)
  const [searchTerm, setSearchTerm] = useState("")

  // For agents and admins, show the queue tabs
  if (user?.role === "agent" || user?.role === "admin") {
    return <TicketQueueTabs />
  }

  const handleTicketClick = (ticket: any) => {
    dispatch(setCurrentTicket(ticket))
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

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filters.status === "all" || ticket.status === filters.status
    const matchesPriority = filters.priority === "all" || ticket.priority === filters.priority
    const matchesCategory = filters.category === "all" || ticket.category === filters.category

    // Filter by user role
    if (user?.role === "user") {
      return ticket.createdBy === user.id && matchesSearch && matchesStatus && matchesPriority && matchesCategory
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const getTicketStats = () => {
    const userTickets = user?.role === "user" ? tickets.filter((t) => t.createdBy === user.id) : tickets

    return {
      total: userTickets.length,
      open: userTickets.filter((t) => t.status === "open").length,
      inProgress: userTickets.filter((t) => t.status === "in-progress").length,
      resolved: userTickets.filter((t) => t.status === "resolved").length,
    }
  }

  const stats = getTicketStats()

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200 shadow-professional">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-professional">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-professional">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-professional">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
          <CardTitle className="text-gray-900">
            {user?.role === "user" ? "My Tickets" : "All Tickets"} ({filteredTickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tickets found</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const creator = users.find((u) => u.id === ticket.createdBy)
                const assignee = users.find((u) => u.id === ticket.assignedTo)

                return (
                  <Card
                    key={ticket.id}
                    className="border-gray-200 hover:shadow-professional-lg cursor-pointer transition-all duration-200 hover:border-primary/50"
                    onClick={() => handleTicketClick(ticket)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
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

                        <Badge variant="outline" className="ml-4 text-xs border-gray-300">
                          {ticket.category}
                        </Badge>
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
