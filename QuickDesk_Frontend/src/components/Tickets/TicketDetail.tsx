import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ArrowLeft, 
  MessageSquare, 
  Paperclip, 
  Send, 
  ThumbsUp, 
  ThumbsDown,
  User,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { RootState } from '../../store';
import { updateTicket, addConversation, voteTicket, assignTicket } from '../../store/slices/ticketsSlice';
import { formatDateTime } from '../../lib/utils';
import type { Conversation } from '../../store/slices/ticketsSlice';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { tickets } = useSelector((state: RootState) => state.tickets);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const ticket = tickets.find(t => t.id === id);

  useEffect(() => {
    if (!ticket) {
      navigate('/tickets');
    }
  }, [ticket, navigate]);

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ticket not found</h3>
          <Button onClick={() => navigate('/tickets')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tickets
          </Button>
        </div>
      </div>
    );
  }

  const canManageTicket = user?.role === 'agent' || user?.role === 'admin';
  const canVote = user?.role === 'user' && ticket.createdBy !== user.id;

  const handleStatusChange = (newStatus: string) => {
    const updatedTicket = {
      ...ticket,
      status: newStatus as any,
      updatedAt: new Date().toISOString(),
    };
    dispatch(updateTicket(updatedTicket));
  };

  const handleAssignTicket = (agentId: string) => {
    dispatch(assignTicket({ ticketId: ticket.id, agentId }));
  };

  const handleVote = (voteType: 'up' | 'down') => {
    dispatch(voteTicket({ ticketId: ticket.id, voteType }));
  };

  const handleAddMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const conversation: Conversation = {
        id: Date.now().toString(),
        message: newMessage,
        author: user?.id || '',
        authorName: user?.name || '',
        createdAt: new Date().toISOString(),
        isInternal: false,
      };
      
      dispatch(addConversation({ ticketId: ticket.id, conversation }));
      setNewMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <AlertCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/tickets')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{ticket.title}</h1>
            <p className="text-gray-600">Ticket #{ticket.id}</p>
          </div>
        </div>
        
        {canVote && (
          <div className="flex items-center space-x-2">
            <Button
              variant={ticket.userVote === 'up' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleVote('up')}
              className="flex items-center space-x-1"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{ticket.upvotes}</span>
            </Button>
            <Button
              variant={ticket.userVote === 'down' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => handleVote('down')}
              className="flex items-center space-x-1"
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{ticket.downvotes}</span>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ticket Details</CardTitle>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(ticket.status)}
                  <Badge variant={ticket.status as any}>
                    {ticket.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>
              
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200/50">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Paperclip className="w-4 h-4 mr-1" />
                    Attachments
                  </h4>
                  <div className="space-y-1">
                    {ticket.attachments.map((attachment, index) => (
                      <div key={index} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                        {attachment}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Conversation ({ticket.conversations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ticket.conversations.map((conversation) => (
                  <div key={conversation.id} className="flex space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={`https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2`} />
                      <AvatarFallback>{conversation.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {conversation.authorName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(conversation.createdAt)}
                        </span>
                        {conversation.isInternal && (
                          <Badge variant="secondary" className="text-xs">Internal</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {conversation.message}
                      </div>
                    </div>
                  </div>
                ))}
                
                {ticket.conversations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Add Message */}
              <div className="mt-6 pt-6 border-t border-gray-200/50">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleAddMessage}
                      disabled={!newMessage.trim() || isSubmitting}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Tag className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Category</p>
                  <p className="text-sm text-gray-600">{ticket.category}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Priority</p>
                  <Badge variant={ticket.priority as any}>{ticket.priority}</Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Created</p>
                  <p className="text-sm text-gray-600">{formatDateTime(ticket.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Created by</p>
                  <p className="text-sm text-gray-600">User #{ticket.createdBy}</p>
                </div>
              </div>
              
              {ticket.assignedTo && (
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Assigned to</p>
                    <p className="text-sm text-gray-600">Agent #{ticket.assignedTo}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agent Actions */}
          {canManageTicket && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Agent Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Status
                  </label>
                  <Select value={ticket.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Assign to Agent
                  </label>
                  <Select value={ticket.assignedTo || ''} onValueChange={handleAssignTicket}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent1">Agent Smith</SelectItem>
                      <SelectItem value="agent2">Agent Johnson</SelectItem>
                      <SelectItem value="agent3">Agent Williams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Voting Stats */}
          {(ticket.upvotes > 0 || ticket.downvotes > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Helpful</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">{ticket.upvotes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ThumbsDown className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-gray-700">Not Helpful</span>
                    </div>
                    <span className="text-sm font-medium text-red-600">{ticket.downvotes}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;