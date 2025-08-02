import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Plus,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertTriangle,
    Ticket,
    Users,
    BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { RootState } from '../../Redux_mnagement/store/store';
import { useTickets } from '../../hooks/useTickets';
// import { formatDate } from '../../lib/utils';

const Dashboard: React.FC = () => {
    useTickets(); // Load mock data
    const { user } = useSelector((state: RootState) => state.auth);
    const { tickets } = useSelector((state: RootState) => state.tickets);

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        inProgress: tickets.filter(t => t.status === 'in-progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
    };

    const recentTickets = tickets.slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                Welcome back, {user?.name}!
                            </h1>
                            <p className="text-gray-600">
                                {user?.role === 'admin' ? 'Manage your help desk system' :
                                    user?.role === 'agent' ? 'Handle and resolve customer tickets' :
                                        'Track your support tickets and get help'}
                            </p>
                        </div>
                        <Button asChild>
                            <Link to="/tickets/new" className="flex items-center space-x-2">
                                <Plus className="w-4 h-4" />
                                <span>New Ticket</span>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Ticket className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Open</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.open}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">In Progress</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Resolved</p>
                                <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Tickets */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between mb-6">
                            <CardTitle>Recent Tickets</CardTitle>
                            <Link to="/tickets" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                                View all →
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>

                        <div className="space-y-4">
                            {recentTickets.length > 0 ? recentTickets.map((ticket) => (
                                <Link
                                    key={ticket.id}
                                    to={`/tickets/${ticket.id}`}
                                    className="block p-4 rounded-xl border border-gray-200/50 hover:bg-white/50 transition-all duration-200 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-800 mb-1">{ticket.title}</h3>
                                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ticket.description}</p>
                                            <div className="flex items-center space-x-3">
                                                <Badge variant={ticket.status as any} className="text-xs">
                                                    {ticket.status.replace('-', ' ')}
                                                </Badge>
                                                <Badge variant={ticket.priority as any} className="text-xs">
                                                    {ticket.priority}
                                                </Badge>
                                                <span className="text-xs text-gray-500">#{ticket.id}</span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {/* {formatDate(ticket.createdAt)} */}
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="text-center py-8">
                                    <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No tickets yet</p>
                                    <Link to="/tickets/new" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                                        Create your first ticket →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>

                        <div className="space-y-3">
                            <Link to="/tickets/new" className="flex items-center space-x-3 p-4 rounded-xl hover:bg-white/50 transition-colors group">
                                <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                                    <Plus className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Create Ticket</p>
                                    <p className="text-sm text-gray-600">Submit a new support request</p>
                                </div>
                            </Link>

                            <Link to="/tickets" className="flex items-center space-x-3 p-4 rounded-xl hover:bg-white/50 transition-colors group">
                                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                    <Ticket className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">View Tickets</p>
                                    <p className="text-sm text-gray-600">Check your ticket status</p>
                                </div>
                            </Link>

                            {(user?.role === 'agent' || user?.role === 'admin') && (
                                <>
                                    <Link to="/tickets/all" className="flex items-center space-x-3 p-4 rounded-xl hover:bg-white/50 transition-colors group">
                                        <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">All Tickets</p>
                                            <p className="text-sm text-gray-600">Manage all tickets</p>
                                        </div>
                                    </Link>

                                    <Link to="/analytics" className="flex items-center space-x-3 p-4 rounded-xl hover:bg-white/50 transition-colors group">
                                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                            <BarChart3 className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">Analytics</p>
                                            <p className="text-sm text-gray-600">View performance metrics</p>
                                        </div>
                                    </Link>
                                </>
                            )}

                            {user?.role === 'admin' && (
                                <Link to="/users" className="flex items-center space-x-3 p-4 rounded-xl hover:bg-white/50 transition-colors group">
                                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                        <Users className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Manage Users</p>
                                        <p className="text-sm text-gray-600">User administration</p>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;