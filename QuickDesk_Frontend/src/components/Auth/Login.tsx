import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Ticket, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const demoAccounts = [
    { email: 'admin@quickdesk.com', role: 'Admin', password: 'admin123' },
    { email: 'agent@quickdesk.com', role: 'Support Agent', password: 'agent123' },
    { email: 'user@quickdesk.com', role: 'End User', password: 'user123' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg mb-4">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to QuickDesk</h1>
          <p className="text-gray-600">Sign in to access your help desk</p>
        </div>

        <div className="card-glass mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-glass w-full pl-11 pr-4 py-3"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-glass w-full pl-11 pr-11 py-3"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200/50">
            <p className="text-center text-sm text-gray-600 mb-4">
              Don't have an account? <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">Sign up</Link>
            </p>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="card-glass">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Demo Accounts:</h3>
          <div className="space-y-2">
            {demoAccounts.map((account, index) => (
              <button
                key={index}
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-white/50 transition-colors text-sm"
              >
                <div className="font-medium text-gray-800">{account.role}</div>
                <div className="text-gray-600">{account.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;