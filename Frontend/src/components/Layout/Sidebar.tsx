import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Users, Coins, Briefcase, BarChart3, X, Wallet, Gem, Package, ChevronDown, Layers, List, PlusCircle, Archive, Megaphone, Image as ImageIcon, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [productsOpen, setProductsOpen] = useState(
    location.pathname.startsWith('/admin/products')
  );
  const [marketingOpen, setMarketingOpen] = useState(
    location.pathname.startsWith('/admin/marketing')
  );

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['admin', 'user'], end: true },
    { name: 'Customers', path: '/admin/customers', icon: Users, roles: ['admin'], end: true },
    { name: 'Loans', path: '/admin/loans', icon: Coins, roles: ['admin', 'user'], end: true },
    { name: 'Gold Return', path: '/admin/loans?mode=return', icon: Gem, roles: ['admin', 'user'], end: true },
    { name: 'Payments', path: '/admin/payments', icon: Wallet, roles: ['admin', 'user'], end: true },
    { name: 'Dealers', path: '/admin/dealers', icon: Briefcase, roles: ['admin'], end: true },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3, roles: ['admin'], end: true }
  ];

  const filteredNavItems = navItems.filter(item => 
    user && item.roles.some(role => role === user.role)
  );

  const productSectionActive = location.pathname.startsWith('/admin/products');
  const marketingSectionActive = location.pathname.startsWith('/admin/marketing');

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-gradient-to-b from-[#5a1112] to-[#3f0b0c] flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Company Switcher Box */}
        <div className="relative flex items-center justify-between border-b border-white/15 p-4 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center text-[#f3c64e]">
              <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" className="h-8 w-8">
                <path d="M16 3.5c-3.7 4.1-4.4 8.1 0 12.4 4.4-4.3 3.7-8.3 0-12.4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M13.7 15.2C9.8 8.8 6.9 8.4 5.4 9.3c-.3 4.9 2.8 8.1 8.6 9.1m4.3-3.2c3.9-6.4 6.8-6.8 8.3-5.9.3 4.9-2.8 8.1-8.6 9.1M8.1 15.2c.5 5.4 3.3 8.2 7.9 9.2 4.6-1 7.4-3.8 7.9-9.2M4 20.6c3.7 4.2 7.7 6 12 6s8.3-1.8 12-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 24.5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex min-w-0 flex-col overflow-hidden">
              <span className="truncate font-serif text-sm font-bold tracking-wide text-[#f3c64e]">Sri Venkateswara</span>
              <span className="truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-[#f8e8c1]">Thanga Maligai</span>
            </div>
          </div>

          <button 
            className="lg:hidden absolute top-2 right-2 p-1 rounded-md text-white/70 hover:bg-white/10"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto mt-2">
          <nav className="space-y-1.5">
            

           

            {filteredNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                className={() => {
                  const isActive = location.pathname + location.search === item.path;
                  return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#d9a441] text-[#35110c] shadow-md ring-1 ring-[#f3d36a]/70'
                      : 'text-[#f8e8c1] hover:bg-white/10 hover:text-white'
                  }`;
                }}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={() => setProductsOpen(!productsOpen)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                productSectionActive
                  ? 'bg-[#d9a441] text-[#35110c] shadow-md ring-1 ring-[#f3d36a]/70'
                  : 'text-[#f8e8c1] hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Package className="w-5 h-5" />
                Products
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
            </button>

             {productsOpen && (
              <div className="space-y-1 pl-8">
                <NavLink
                  to="/admin/products/all"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#d9a441] text-[#35110c] shadow-md ring-1 ring-[#f3d36a]/70'
                        : 'text-[#f8e8c1] hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <List className="w-4 h-4" />
                  All Products
                </NavLink>
                <NavLink
                  to="/admin/products/add"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#d9a441] text-[#35110c] shadow-md ring-1 ring-[#f3d36a]/70'
                        : 'text-[#f8e8c1] hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Product
                </NavLink>
                <NavLink
                  to="/admin/products/category"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#d9a441] text-[#35110c] shadow-md ring-1 ring-[#f3d36a]/70'
                        : 'text-[#f8e8c1] hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Layers className="w-4 h-4" />
                  Categories
                </NavLink>
                <NavLink
                  to="/admin/products/stock"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#d9a441] text-[#35110c] shadow-md ring-1 ring-[#f3d36a]/70'
                        : 'text-[#f8e8c1] hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Archive className="w-4 h-4" />
                  Stock Details
                </NavLink>
              </div>
            )}

            {user && ['admin', 'user'].includes(user.role) && (
              <>
                <button
                  type="button"
                  onClick={() => setMarketingOpen(!marketingOpen)}
                  aria-expanded={marketingOpen}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    marketingSectionActive
                      ? 'bg-[#d9a441] text-[#35110c] shadow-md ring-1 ring-[#f3d36a]/70'
                      : 'text-[#f8e8c1] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Megaphone className="w-5 h-5" />
                    Marketing
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${marketingOpen ? 'rotate-180' : ''}`} />
                </button>
                {marketingOpen && (
                  <div className="space-y-1 pl-8">
                    <NavLink
                      to="/admin/marketing/banners"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-[#d9a441] text-[#35110c] shadow-md ring-1 ring-[#f3d36a]/70'
                            : 'text-[#f8e8c1] hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      <ImageIcon className="w-4 h-4" />
                      Banner Management
                    </NavLink>
                    <NavLink
                      to="/admin/marketing/videos"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-[#d9a441] text-[#35110c] shadow-md ring-1 ring-[#f3d36a]/70'
                            : 'text-[#f8e8c1] hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      <Video className="w-4 h-4" />
                      Video Management
                    </NavLink>
                  </div>
                )}
              </>
            )}
          </nav>
        </div>
        {/* Signed-in user and storefront link */}
        <div className="border-t border-white/10 bg-[#3f0b0c] p-4">
          <Link
            to="/"
            onClick={onClose}
            className="mb-3 flex items-center gap-3 rounded-lg border border-white/15 px-3 py-2.5 text-sm font-semibold text-[#f8e8c1] transition-colors hover:border-[#f3d36a]/50 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            Back Home
          </Link>
          <div className="flex min-w-0 items-center gap-3 px-2 pt-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d9a441] text-sm font-bold uppercase text-[#35110c]">
              {user?.username?.trim().charAt(0) || user?.email?.trim().charAt(0) || '?'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.username || 'Signed in user'}</p>
              <p className="truncate text-xs text-[#f8e8c1]/75">{user?.email || 'No email available'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
