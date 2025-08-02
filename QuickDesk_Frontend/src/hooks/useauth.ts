import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../Redux_mnagement/store/store';
import { loginStart, loginSuccess, loginFailure, logout } from '../Redux_mnagement/store/slices/authSlice';
import type { User } from '../Redux_mnagement/store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  const login = async (email: string, password: string) => {
    dispatch(loginStart());
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data based on email
      const mockUser: User = {
        id: '1',
        email,
        name: email.includes('admin') ? 'Admin User' : email.includes('agent') ? 'Support Agent' : 'End User',
        role: email.includes('admin') ? 'admin' : email.includes('agent') ? 'agent' : 'user',
        avatar: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2`,
        department: email.includes('agent') ? 'Technical Support' : undefined,
      };
      
      dispatch(loginSuccess(mockUser));
    } catch (error) {
      dispatch(loginFailure('Invalid credentials'));
    }
  };

  const register = async (email: string, password: string, name: string) => {
    dispatch(loginStart());
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role: 'user',
        avatar: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2`,
      };
      
      dispatch(loginSuccess(newUser));
    } catch (error) {
      dispatch(loginFailure('Registration failed'));
    }
  };

  const signOut = () => {
    dispatch(logout());
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    signOut,
  };
};