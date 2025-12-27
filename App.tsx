import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import ServiceList from './components/ServiceList';
import ChatInterface from './components/ChatInterface';
import AdminDashboard from './components/AdminDashboard';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Admin Route
  if (user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  // Client Route
  return (
    <div className="flex h-screen overflow-hidden bg-barber-black">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <ServiceList isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <ChatInterface 
        user={user} 
        onToggleSidebar={toggleSidebar} 
        onLogout={handleLogout}
      />
    </div>
  );
};

export default App;