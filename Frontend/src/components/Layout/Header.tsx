import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Plus, UserPlus, FileText, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const currentPageTitle = (() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') return 'Dashboard';
    if (location.pathname === '/admin/loans' && location.search === '?mode=return') return 'Gold Return';
    const pageTitles: Record<string, string> = {
      '/admin/customers': 'Customers',
      '/admin/loans': 'Loans',
      '/admin/payments': 'Payments',
      '/admin/dealers': 'Dealers',
      '/admin/reports': 'Reports',
      '/admin/products/all': 'All Products',
      '/admin/products/add': 'Add Product',
      '/admin/products/category': 'Categories',
      '/admin/products/stock': 'Stock Details',
      '/admin/marketing/banners': 'Banner Management',
      '/admin/marketing/videos': 'Video Management',
    };
    return pageTitles[location.pathname]
      || (location.pathname.startsWith('/admin/products/') ? 'Products' : 'Admin Panel');
  })();

  const handleQuickAction = (path: string) => {
    setIsQuickActionsOpen(false);
    navigate(path);
  };

  const handleAddAgent = () => {
    setIsQuickActionsOpen(false);
    toast('Agent creation is not yet available.', { icon: '⚠️' });
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 lg:px-6 shadow-sm z-10 shrink-0 relative">
      <div className="flex min-w-0 items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex min-w-0 flex-col justify-center">
          <h1 className="truncate text-base font-bold leading-tight text-[#4b1715] sm:text-lg">{currentPageTitle}</h1>
          <p className="truncate text-xs leading-tight text-gray-500 sm:text-sm">Welcome to Sri Venkateswara Gold Shop</p>
        </div>
      </div>
      
      {/* Center Search Bar & Quick Actions */}
      <div className="ml-auto mr-3 hidden items-center gap-3 lg:flex">
        <div className="flex w-72 items-center overflow-hidden rounded-md border border-gray-300 bg-white transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full px-4 py-2.5 text-sm text-gray-700 outline-none" 
          />
          <button className="px-3 text-gray-400 hover:text-gray-600">
            <Search className="w-4 h-4"/>
          </button>
        </div>
        
        <div className="relative">
          <button 
            className="px-3 py-2.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors focus:outline-none"
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
          >
            <Plus className="w-4 h-4"/>
          </button>

          {isQuickActionsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsQuickActionsOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden transform origin-top-right animate-in fade-in zoom-in duration-150">
                <div className="px-4 py-2.5 bg-gray-50/50 border-b border-gray-100">
                  <span className="text-[13px] font-bold text-gray-900">Quick Actions</span>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    onClick={() => handleQuickAction('/admin/customers/new')}
                  >
                    <UserPlus className="w-4 h-4 text-gray-500" />
                    Add Customer
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    onClick={() => handleQuickAction('/admin/loans/new')}
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    Add Loan
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    onClick={handleAddAgent}
                  >
                    <UserPlus className="w-4 h-4 text-gray-500" />
                    Add Agent
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Notifications and Profile */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
            onClick={() => setIsNotificationsOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5a1112] text-[#f3c64e] transition-colors hover:bg-[#3f0b0c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9a441] focus-visible:ring-offset-2"
          >
            <Bell className="h-5 w-5" />
          </button>
          {isNotificationsOpen && (
            <>
              <button
                type="button"
                aria-label="Close notifications"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setIsNotificationsOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-72 rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-100 px-4 py-3">
                  <h2 className="text-sm font-bold text-gray-900">Notifications</h2>
                </div>
                <p className="px-4 py-6 text-center text-sm text-gray-500">No notifications yet.</p>
              </div>
            </>
          )}
        </div>

        <div className="relative">
        <button 
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-1.5 pr-3 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#74180f]"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          <div className="w-9 h-9 rounded-full bg-[#5a1112] flex items-center justify-center text-[#f3c64e] text-[15px] font-medium shadow-sm">
            {user?.username?.[0]?.toUpperCase() || 'S'}
          </div>
          <span className="text-[15px] font-medium text-[#111827] hidden sm:block">
            {user?.username || 'Guest'}
          </span>
        </button>

        {isProfileOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsProfileOpen(false)}
            ></div>
            
            <div className="absolute right-0 mt-2 w-[220px] bg-red-600 rounded-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-200 z-50 py-1 overflow-hidden transform origin-top-right animate-in fade-in zoom-in duration-150">
              <div className="px-4 py-2.5">
                <p className="text-[13px] font-bold text-gray-900">{user?.username || 'Account'} - My Account</p>
              </div>
              
              <div className="h-px bg-gray-100"></div>
              
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setIsProfileOpen(false)}>
                  Profile
                </button>
                <NavLink 
                  to="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className={({ isActive }) => 
                    `block px-4 py-2 text-sm transition-colors mx-1 rounded ${isActive ? 'bg-[#1b64f3] text-white font-medium' : 'text-gray-700 hover:bg-gray-50'}`
                  }
                >
                  Settings
                </NavLink>
              </div>
              
              <div className="h-px bg-gray-100"></div>
              
              <div className="py-1">
                <button 
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </header>
  );
}
