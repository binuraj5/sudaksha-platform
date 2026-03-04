'use client';

import { useState } from 'react';
import { Eye, User, LogIn, LogOut, AlertTriangle } from 'lucide-react';

interface ImpersonationModeProps {
  onImpersonate: (userId: string, userType: 'student' | 'trainer') => void;
  onStopImpersonating: () => void;
  isImpersonating: boolean;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    type: 'student' | 'trainer';
  };
}

export default function ImpersonationMode({
  onImpersonate,
  onStopImpersonating,
  isImpersonating,
  currentUser
}: ImpersonationModeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserList, setShowUserList] = useState(false);

  // Mock user data - in real app, this would come from API
  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', type: 'student' as const, status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', type: 'trainer' as const, status: 'active' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', type: 'student' as const, status: 'active' },
    { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', type: 'trainer' as const, status: 'active' },
    { id: '5', name: 'David Brown', email: 'david@example.com', type: 'student' as const, status: 'inactive' },
  ];

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImpersonate = (userId: string, userType: 'student' | 'trainer') => {
    onImpersonate(userId, userType);
    setShowUserList(false);
    setSearchQuery('');
  };

  if (isImpersonating && currentUser) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Impersonation Mode Active</h3>
            <p className="text-xs text-red-600 mt-1">
              You are viewing as: <strong>{currentUser.name}</strong> ({currentUser.type})
            </p>
            <p className="text-xs text-red-500 mt-1">
              {currentUser.email}
            </p>
          </div>
          <button
            onClick={onStopImpersonating}
            className="flex-shrink-0 p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
            title="Stop Impersonating"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Impersonation Button */}
      <button
        onClick={() => setShowUserList(!showUserList)}
        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Impersonation Mode"
      >
        <Eye className="w-4 h-4" />
        <span className="text-sm">View as User</span>
      </button>

      {/* User Search Dropdown */}
      {showUserList && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Select User to Impersonate</h3>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No users found
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleImpersonate(user.id, user.type)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                          user.type === 'trainer' ? 'bg-purple-500' : 'bg-blue-500'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.type === 'trainer' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <LogIn className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">Click to impersonate this user</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              <strong>Warning:</strong> You will be able to see exactly what this user sees. All actions will be logged.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
