import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Heart, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import PageContainer from './PageContainer.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isHomeActive = location.pathname === '/' && !location.hash;
  const isAboutActive = location.pathname === '/about';
  const isShopActive = location.pathname === '/' && location.hash === '#products';
  const isPagesActive = ['/contact', '/terms-and-conditions'].includes(location.pathname);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed top-10 z-50 h-16 w-full border-b border-gray-100 bg-white/80 font-sans backdrop-blur-md">
      <PageContainer className="flex h-full items-center justify-between">
      {/* Left: Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-accent rounded flex items-center justify-center text-white font-bold">S</div>
        <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">Sri Vengateshwara</span>
      </Link>

      {/* Center: Nav Links */}
      <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
        <Link to="/" aria-current={isHomeActive ? 'page' : undefined} className={`transition-colors hover:text-secondary-dark ${isHomeActive ? 'text-secondary-dark' : ''}`}>Home</Link>
        <Link to="/about" aria-current={isAboutActive ? 'page' : undefined} className={`transition-colors hover:text-secondary-dark ${isAboutActive ? 'text-secondary-dark' : ''}`}>About</Link>
        <Link to="/#products" aria-current={isShopActive ? 'location' : undefined} className={`transition-colors hover:text-secondary-dark ${isShopActive ? 'text-secondary-dark' : ''}`}>Shop</Link>
        <Link to="/#products" className="hover:text-secondary-dark transition-colors">Offers</Link>

        <div className="relative group">
          <button
            type="button"
            aria-current={location.hash === '#products' ? 'location' : undefined}
            className={`flex items-center gap-1 hover:text-secondary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-dark rounded ${location.hash === '#products' ? 'text-secondary-dark' : ''}`}
          >
            Category
            <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
          </button>
          <div className="invisible absolute left-0 top-full z-[70] mt-3 w-52 translate-y-2 rounded-xl border border-gray-100 bg-white py-2 opacity-0 shadow-xl transition-all duration-200 pointer-events-none group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
            {['Gold Rings', 'Gold Chains', 'Gold Necklaces', 'Gold Earrings'].map((category) => (
              <Link
                key={category}
                to="/#products"
                className="block px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-brand-50 hover:text-secondary-dark"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>

        <div className="relative group">
          <button
            type="button"
            aria-current={isPagesActive ? 'page' : undefined}
            className={`flex items-center gap-1 hover:text-secondary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-dark rounded ${isPagesActive ? 'text-secondary-dark' : ''}`}
          >
            Pages
            <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
          </button>
          <div className="invisible absolute left-0 top-full z-[70] mt-3 w-56 translate-y-2 rounded-xl border border-gray-100 bg-white py-2 opacity-0 shadow-xl transition-all duration-200 pointer-events-none group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
            <Link
              to="/contact"
              className="block px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-brand-50 hover:text-secondary-dark"
            >
              Contact us
            </Link>
            <Link
              to="/terms-and-conditions"
              className="block px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-brand-50 hover:text-secondary-dark"
            >
              Terms and Conditions
            </Link>
          </div>
        </div>
      </nav>

      {/* Right: Icons & Profile */}
      <div className="flex items-center gap-5">
        {/* Cart & Fav Icons */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-secondary">
          <Heart className="w-5 h-5" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
        </button>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-secondary">
          <ShoppingCart className="w-5 h-5" />
          <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
        </button>

        <div className="h-4 w-[1px] bg-gray-200 hidden sm:block mx-1"></div>

        {/* User Account / Login */}
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 focus:outline-none group bg-gray-50 hover:bg-gray-100 px-2.5 py-1.5 rounded-full transition-all border border-gray-100"
            >
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-bold text-gray-700 hidden lg:block">{user.username}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileOpen(false)}
                ></div>
                
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-2 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1">
                    <p className="text-[13px] font-bold text-gray-900 truncate">{user.username}</p>
                    <p className="text-[11px] text-gray-400 font-medium truncate">{user.email}</p>
                  </div>
                  
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}

                  <Link 
                    to="/admin"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Account
                  </Link>
                  
                  <div className="h-px bg-gray-50 mx-2 my-1"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link 
            to="/login"
            className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg font-bold hover:bg-primary-dark transition-all shadow-md text-sm"
          >
            <User className="w-4 h-4" />
            Login
          </Link>
        )}
      </div>
      </PageContainer>
    </header>
  );
}
