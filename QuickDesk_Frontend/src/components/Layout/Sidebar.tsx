import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  Ticket, 
  Plus, 
  Users, 
  Settings, 
  BarChart3,
  FolderOpen,
  Bell
} from 'lucide-react';
import type { RootState } from '../../store';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/', roles: ['user', 'agent', 'admin'] },
    { icon: Ticket, label: 'My Tickets', path: '/tickets', roles: ['user', 'agent', 'admin'] },
    { icon: Plus, label: 'New Ticket', path: '/tickets/new', roles: ['user', 'agent', 'admin'] },
    { icon: FolderOpen, label: 'All Tickets', path: '/tickets/all', roles: ['agent', 'admin'] },
    { icon: Users, label: 'Users', path: '/users', roles: ['admin'] },
    { icon: BarChart3, label: 'Analytics', path: '/analytics', roles: ['agent', 'admin'] },
    { icon: Bell, label: 'Notifications', path: '/notifications', roles: ['user', 'agent', 'admin'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['user', 'agent', 'admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 glass rounded-r-2xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">QuickDesk</h1>
              <p className="text-sm text-gray-600">Help Desk</p>
            </div>
          </div>

          <nav className="space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-white/50 hover:text-primary-600'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary-600'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile section */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="glass rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <img 
                src={user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'} 
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;