import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Heart, User, LogOut, Settings, ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import PageContainer from './PageContainer.jsx';
import { useStoreCart } from '../../context/useStoreCart';
import { useWishlist } from '../../context/useWishlist';
import api from '../../api';
import type { Category } from '../../lib/categoryData';

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { itemCount } = useStoreCart();
  const { itemCount: wishlistCount } = useWishlist();
  const isHomeActive = location.pathname === '/' && !location.hash;
  const isAboutActive = location.pathname === '/about';
  const isShopActive = location.pathname === '/shop';
  const isOffersActive = location.pathname === '/offers';
  const isContactActive = location.pathname === '/contact';

  useEffect(() => {
    let mounted = true;
    api.get<{ categories?: Category[] }>('/categories')
      .then(({ data }) => {
        if (!mounted) return;
        const fetchedCategories = Array.isArray(data?.categories) ? data.categories : [];
        setCategories(fetchedCategories
          .filter((category) => category.status !== 'Inactive' && typeof category.categoryName === 'string')
          .map((category) => ({
            ...category,
            subCategories: Array.isArray(category.subCategories)
              ? category.subCategories.filter((subCategory): subCategory is string => typeof subCategory === 'string' && Boolean(subCategory.trim()))
              : [],
          })));
      })
      .catch((error: unknown) => {
        console.error('Failed to load navbar categories:', error);
        if (mounted) setCategoriesError(true);
      })
      .finally(() => {
        if (mounted) setCategoriesLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed top-10 z-50 w-full border-b border-gray-100 bg-white/95 font-sans shadow-sm backdrop-blur-md">
      <div className="relative h-16">
      <PageContainer className="flex h-full items-center justify-between gap-2">
      {/* Left: Logo */}
      <Link to="/" onClick={closeMobileMenu} className="flex min-w-0 shrink items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-accent font-bold text-white">S</div>
        <span className="hidden truncate text-base font-bold tracking-tight text-gray-900 sm:block lg:text-xl">Sri Vengateshwara</span>
      </Link>

      {/* Center: Nav Links */}
      <nav aria-label="Main navigation" className="hidden items-center gap-4 whitespace-nowrap text-xs font-bold text-gray-600 lg:flex xl:gap-6 xl:text-sm">
        <Link to="/" aria-current={isHomeActive ? 'page' : undefined} className={`transition-colors hover:text-secondary-dark ${isHomeActive ? 'text-secondary-dark' : ''}`}>Home</Link>
        <Link to="/about" aria-current={isAboutActive ? 'page' : undefined} className={`transition-colors hover:text-secondary-dark ${isAboutActive ? 'text-secondary-dark' : ''}`}>About</Link>
        <Link to="/shop" aria-current={isShopActive ? 'page' : undefined} className={`transition-colors hover:text-secondary-dark ${isShopActive ? 'text-secondary-dark' : ''}`}>Shop</Link>
        

        <div className="relative group/category-menu">
          <button
            type="button"
            aria-current={location.hash === '#products' ? 'location' : undefined}
            aria-haspopup="true"
            className={`flex items-center gap-1 rounded transition-colors hover:text-secondary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-dark ${location.hash === '#products' ? 'text-secondary-dark' : ''}`}
          >
            Category
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover/category-menu:rotate-180 group-focus-within/category-menu:rotate-180" />
          </button>
          <div className="invisible pointer-events-none absolute left-0 top-full z-[70] w-[min(480px,calc(100vw-2rem))] rounded-xl border border-gray-100 bg-white opacity-0 shadow-xl transition-[opacity,visibility] duration-150 group-hover/category-menu:visible group-hover/category-menu:pointer-events-auto group-hover/category-menu:opacity-100 group-focus-within/category-menu:visible group-focus-within/category-menu:pointer-events-auto group-focus-within/category-menu:opacity-100">
            {categoriesLoading ? (
              <p className="px-4 py-3 text-sm text-gray-500">Loading categories...</p>
            ) : categoriesError ? (
              <p role="alert" className="px-4 py-3 text-sm text-red-600">Unable to load categories.</p>
            ) : categories.length ? (
              <div className="grid grid-cols-2">
                <div className="max-h-[min(70vh,640px)] overflow-y-auto py-2">
                  {categories.map(({ categoryName }) => (
                    <Link
                      key={categoryName}
                      to={`/shop?category=${encodeURIComponent(categoryName)}`}
                      onMouseEnter={() => setHoveredCategory(categoryName)}
                      onFocus={() => setHoveredCategory(categoryName)}
                      className={`flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-brand-50 hover:text-secondary-dark focus-visible:bg-brand-50 focus-visible:text-secondary-dark ${hoveredCategory === categoryName ? 'bg-brand-50 text-secondary-dark' : 'text-gray-600'}`}
                    >
                      {categoryName}
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </Link>
                  ))}
                </div>
                <div className="max-h-[min(70vh,640px)] overflow-y-auto border-l border-gray-100 py-2">
                  {categories.find((category) => category.categoryName === hoveredCategory) ? (
                    <>
                      <Link
                        to={`/shop?category=${encodeURIComponent(hoveredCategory)}`}
                        className="block border-b border-gray-100 px-4 py-2.5 text-sm font-bold text-secondary-dark hover:bg-brand-50"
                      >
                        View all {hoveredCategory}
                      </Link>
                      {categories.find((category) => category.categoryName === hoveredCategory)?.subCategories.map((subCategory) => (
                        <Link
                          key={subCategory}
                          to={`/shop?category=${encodeURIComponent(hoveredCategory)}&subCategory=${encodeURIComponent(subCategory)}`}
                          className="block px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-brand-50 hover:text-secondary-dark focus-visible:bg-brand-50 focus-visible:text-secondary-dark"
                        >
                          {subCategory}
                        </Link>
                      ))}
                    </>
                  ) : (
                    <p className="px-4 py-3 text-sm text-gray-500">Hover over a category to view its subcategories.</p>
                  )}
                </div>
              </div>
            ) : <p className="px-4 py-3 text-sm text-gray-500">No categories available.</p>}
          </div>
        </div>
        <Link to="/offers" aria-current={isOffersActive ? 'page' : undefined} className={`transition-colors hover:text-secondary-dark ${isOffersActive ? 'text-secondary-dark' : ''}`}>Offers</Link>
        <Link to="/contact" aria-current={isContactActive ? 'page' : undefined} className={`transition-colors hover:text-secondary-dark ${isContactActive ? 'text-secondary-dark' : ''}`}>Contact Us</Link>

        
      </nav>

      {/* Right: Icons & Profile */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Cart & Fav Icons */}
        <Link to="/wishlist" aria-label={`Wishlist, ${wishlistCount} ${wishlistCount === 1 ? 'item' : 'items'}`} className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-secondary sm:h-9 sm:w-9">
          <Heart className="w-5 h-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">{wishlistCount}</span>
        </Link>
        <Link to="/cart" aria-label={`Shopping cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`} className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-secondary sm:h-9 sm:w-9">
          <ShoppingCart className="w-5 h-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#5a1112] text-[9px] font-bold text-white">{itemCount}</span>
        </Link>

        <div className="mx-1 hidden h-4 w-px bg-gray-200 sm:block"></div>

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
                    to="/account"
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
            className="hidden items-center gap-2 rounded-lg bg-[#5a1112] px-3 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-[#3f0b0c] sm:flex sm:px-4"
          >
            <User className="w-4 h-4" />
            Login
          </Link>
        )}

        <button
          type="button"
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-primary transition hover:bg-brand-50 lg:hidden"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      </PageContainer>
      {isMobileMenuOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="absolute inset-x-0 top-full max-h-[calc(100vh-104px)] overflow-y-auto border-t border-gray-100 bg-white px-5 py-3 shadow-xl lg:hidden">
          <div className="mx-auto flex max-w-[1700px] flex-col">
            <Link to="/" onClick={closeMobileMenu} aria-current={isHomeActive ? 'page' : undefined} className={`rounded-lg px-3 py-3 text-sm font-semibold hover:bg-brand-50 ${isHomeActive ? 'text-secondary-dark' : 'text-gray-700'}`}>Home</Link>
            <Link to="/about" onClick={closeMobileMenu} aria-current={isAboutActive ? 'page' : undefined} className={`rounded-lg px-3 py-3 text-sm font-semibold hover:bg-brand-50 ${isAboutActive ? 'text-secondary-dark' : 'text-gray-700'}`}>About</Link>
            <Link to="/shop" onClick={closeMobileMenu} aria-current={isShopActive ? 'page' : undefined} className={`rounded-lg px-3 py-3 text-sm font-semibold hover:bg-brand-50 ${isShopActive ? 'text-secondary-dark' : 'text-gray-700'}`}>Shop</Link>
            <Link to="/offers" onClick={closeMobileMenu} aria-current={isOffersActive ? 'page' : undefined} className={`rounded-lg px-3 py-3 text-sm font-semibold hover:bg-brand-50 ${isOffersActive ? 'text-secondary-dark' : 'text-gray-700'}`}>Offers</Link>
            <div className="border-t border-gray-100 py-2">
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Categories</p>
              {categoriesLoading ? (
                <p className="px-3 py-2 text-sm text-gray-500">Loading categories...</p>
              ) : categoriesError ? (
                <p role="alert" className="px-3 py-2 text-sm text-red-600">Unable to load categories.</p>
              ) : categories.length ? categories.map(({ categoryName, subCategories }) => (
                <details key={categoryName} className="group/mobile-category">
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-secondary-dark">
                    {categoryName}
                    <ChevronDown className="h-4 w-4 transition-transform group-open/mobile-category:rotate-180" />
                  </summary>
                  <div className="pb-2 pl-3">
                    <Link
                      to={`/shop?category=${encodeURIComponent(categoryName)}`}
                      onClick={closeMobileMenu}
                      className="block rounded-lg px-3 py-2 text-xs font-semibold text-secondary-dark hover:bg-brand-50"
                    >
                      View all {categoryName}
                    </Link>
                    {subCategories.map((subCategory) => (
                      <Link
                        key={subCategory}
                        to={`/shop?category=${encodeURIComponent(categoryName)}&subCategory=${encodeURIComponent(subCategory)}`}
                        onClick={closeMobileMenu}
                        className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-brand-50 hover:text-secondary-dark"
                      >
                        {subCategory}
                      </Link>
                    ))}
                  </div>
                </details>
              )) : <p className="px-3 py-2 text-sm text-gray-500">No categories available.</p>}
            </div>
            <div className="border-t border-gray-100 py-2">
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Pages</p>
              {user && <Link to="/account" onClick={closeMobileMenu} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-secondary-dark">My Account</Link>}
              <Link to="/contact" onClick={closeMobileMenu} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-secondary-dark">Contact us</Link>
              <Link to="/terms-and-conditions" onClick={closeMobileMenu} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-secondary-dark">Terms and Conditions</Link>
            </div>
            {!user && <Link to="/login" onClick={closeMobileMenu} className="mt-2 rounded-lg bg-[#5a1112] px-3 py-3 text-center text-sm font-bold text-white hover:bg-[#3f0b0c]">Login</Link>}
          </div>
        </nav>
      )}
      </div>
    </header>
  );
}
