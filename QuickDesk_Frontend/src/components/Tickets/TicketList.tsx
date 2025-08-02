import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  SortAsc, 
  Plus, 
  Calendar,
  User,
  Tag,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { RootState } from '../../store';
import { setFilters } from '../../store/slices/ticketsSlice';

const TicketList: React.FC = () => {
  const dispatch = useDispatch();
  const { tickets, filters } = useSelector((state: RootState) => state.tickets);
  const { categories } = useSelector((state: RootState) => state.categories);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter tickets based on user role and current filters
  const filteredTickets = tickets
    .filter(ticket => {
      // Role-based filtering
      if (user?.role === 'user') {
        return ticket.createdBy === user.id;
      }
      
      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return ticket.title.toLowerCase().includes(searchLower) ||
               ticket.description.toLowerCase().includes(searchLower);
      }
      
      return true;
    })
    .filter(ticket => {
      // Status filter
      if (filters.status && filters.status !== 'all') {
        return ticket.status === filters.status;
      }
      return true;
    })
    .filter(ticket => {
      // Priority filter
      if (filters.priority && filters.priority !== 'all') {
        return ticket.priority === filters.priority;
      }
      return true;
    })
    .filter(ticket => {
      // Category filter
      if (filters.category && filters.category !== 'all') {
        return ticket.categoryId === filters.category;
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {user?.role === 'user' ? 'My Tickets' : 'All Tickets'}
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button asChild>
          <Link to="/tickets/new" className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tickets..."
              value={filters.search}
              onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center space-x-3">
            <Select
              value={filters.status}
              onValueChange={(value) => dispatch(setFilters({ status: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value) => dispatch(setFilters({ priority: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.category}
              onValueChange={(value) => dispatch(setFilters({ category: value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as any)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="priority">Sort by Priority</SelectItem>
                  <SelectItem value="status">Sort by Status</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <SortAsc className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
              </Button>
            </div>
          </div>
        </div>
        </CardContent>
      </Card>

      {/* Tickets Grid */}
      <div className="grid gap-4">
        {filteredTickets.length > 0 ? filteredTickets.map((ticket) => (
          <Card
            key={ticket.id}
            className="hover:shadow-xl transition-all duration-300 group cursor-pointer"
          >
            <CardContent className="pt-6">
              <Link to={`/tickets/${ticket.id}`} className="block">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                    {ticket.title}
                  </h3>
                  <span className="text-sm text-gray-500 font-mono">#{ticket.id}</span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{ticket.description}</p>
                
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={ticket.status as any}>
                    {ticket.status.replace('-', ' ')}
                  </Badge>
                  <Badge variant={ticket.priority as any}>
                    {ticket.priority}
                  </Badge>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Tag className="w-3 h-3" />
                    <span>{ticket.category}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  {ticket.assignedTo && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>Assigned</span>
                    </div>
                  )}
                  {(ticket.upvotes > 0 || ticket.downvotes > 0) && (
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-3 h-3 text-green-600" />
                        <span>{ticket.upvotes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsDown className="w-3 h-3 text-red-600" />
                        <span>{ticket.downvotes}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
              </Link>
            </CardContent>
          </Card>
        )) : (
          <Card>
            <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No tickets found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or create a new ticket</p>
            <Button asChild>
              <Link to="/tickets/new">Create New Ticket</Link>
            </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TicketList;