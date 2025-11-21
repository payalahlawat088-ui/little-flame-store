import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Menu, 
  X, 
  Star, 
  Heart, 
  Instagram, 
  Twitter, 
  Facebook,
  Youtube, 
  ShoppingBag,
  Truck,
  ShieldCheck,
  Clock,
  MessageCircle,
  Send,
  Lock,
  Plus,
  Trash2,
  Edit, 
  ArrowLeft,
  Repeat,
  Settings, 
  BarChart, 
  Video, 
  Save,
  Image as ImageIcon,
  Phone,
  Mail,
  LogOut,
  List,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  addDoc,
  query,
  getDocs 
} from 'firebase/firestore';

// --- Firebase Init ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'little-flame-store';

// --- Initial Data ---
const INITIAL_CATEGORIES = ["All", "Electronics", "Fashion", "Home", "Accessories"];

const INITIAL_PRODUCTS = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 2499,
    wholesalePrice: 1750,
    moq: 5, 
    category: "Electronics",
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
      "", "", ""
    ],
    video: "",
    badge: "Best Seller",
    description: "High-fidelity sound with noise cancellation. Perfect for music lovers."
  },
  {
    id: "2",
    name: "Minimalist Leather Watch",
    price: 1899,
    wholesalePrice: 1300,
    moq: 10,
    category: "Accessories",
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1434056838489-2e3029803c1e?auto=format&fit=crop&w=800&q=80",
      "", "", "", ""
    ],
    video: "",
    badge: "New",
    description: "Genuine leather strap with a classic analog face."
  },
  {
    id: "3",
    name: "Smart Fitness Tracker",
    price: 3499,
    wholesalePrice: 2400,
    moq: 5,
    category: "Electronics",
    rating: 4.2,
    images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80",
        "", "", "", ""
    ],
    video: "",
    badge: "",
    description: "Track your steps, heart rate, and sleep patterns effortlessly."
  },
  {
    id: "4",
    name: "Denim Jacket Vintage",
    price: 1299,
    wholesalePrice: 900,
    moq: 5,
    category: "Fashion",
    rating: 4.6,
    images: [
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=800&q=80",
        "", "", "", ""
    ],
    video: "",
    badge: "Sale",
    description: "Classic vintage style denim jacket for a rugged look."
  }
];

const INITIAL_SETTINGS = {
  name: "Little Flame",
  logo: "",
  heroImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
  copyrightText: "2025 Little Flame",
  wholesaleMinQty: 5,
  contact: {
    whatsapp: "918295169888",
    email: "support@littleflame.com"
  },
  social: {
    instagram: "#",
    facebook: "#",
    youtube: "#"
  }
};

// --- Helper Components ---

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-[120] px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 text-white animate-in slide-in-from-right ${type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
      {type === 'error' ? <AlertTriangle className="h-5 w-5"/> : <CheckCircle className="h-5 w-5"/>}
      <span>{message}</span>
    </div>
  );
};

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full animate-in zoom-in-95">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Action</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 font-medium">Confirm</button>
        </div>
      </div>
    </div>
  );
};

// --- Main Components ---

const Navbar = ({ cartCount, wishlistCount, onCartClick, onWishlistClick, onSearchClick, isMobileMenuOpen, setIsMobileMenuOpen, onNavClick, shopMode, toggleShopMode, storeSettings }) => (
  <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavClick('Home')}>
          {storeSettings.logo ? (
            <img src={storeSettings.logo} alt="Logo" className="h-10 w-auto object-contain" />
          ) : (
            <ShoppingBag className="h-8 w-8 text-indigo-600" />
          )}
          <span className="ml-2 text-2xl font-bold text-gray-900 tracking-tight">{storeSettings.name}</span>
          {shopMode === 'wholesale' && (
            <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
              WHOLESALE
            </span>
          )}
        </div>

        <div className="hidden md:flex space-x-8 items-center">
          {['Home', 'Shop', 'New Arrivals', 'Support'].map((item) => (
            <button key={item} onClick={() => onNavClick(item)} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${item === 'Support' ? 'text-indigo-600 font-bold' : 'text-gray-600 hover:text-indigo-600'}`}>{item}</button>
          ))}
          <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200 ml-4">
            <button onClick={() => shopMode !== 'retail' && toggleShopMode('retail')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${shopMode === 'retail' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Retail</button>
            <button onClick={() => shopMode !== 'wholesale' && toggleShopMode('wholesale')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${shopMode === 'wholesale' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Wholesale</button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={onSearchClick} className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"><Search className="h-6 w-6" /></button>
          <button onClick={onWishlistClick} className="p-2 text-gray-500 hover:text-indigo-600 transition-colors relative"><Heart className="h-6 w-6" />{wishlistCount > 0 && <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-pink-500 rounded-full">{wishlistCount}</span>}</button>
          <button onClick={onCartClick} className="p-2 text-gray-500 hover:text-indigo-600 transition-colors relative"><ShoppingCart className="h-6 w-6" />{cartCount > 0 && <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-indigo-600 rounded-full">{cartCount}</span>}</button>
          <div className="md:hidden flex items-center"><button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-500">{isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button></div>
        </div>
      </div>
    </div>
    {isMobileMenuOpen && (
      <div className="md:hidden bg-white border-b border-gray-200 animate-in slide-in-from-top-5">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <div className="px-3 py-2 bg-gray-50 rounded-lg mb-2">
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Select Mode</p>
            <div className="flex space-x-2">
              <button onClick={() => { toggleShopMode('retail'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 text-center rounded-md text-sm font-bold transition-colors ${shopMode === 'retail' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>Retail</button>
              <button onClick={() => { toggleShopMode('wholesale'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 text-center rounded-md text-sm font-bold transition-colors ${shopMode === 'wholesale' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>Wholesale</button>
            </div>
          </div>
          {['Home', 'Shop', 'New Arrivals', 'Support'].map((item) => (<button key={item} onClick={() => { onNavClick(item); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">{item}</button>))}
        </div>
      </div>
    )}
  </nav>
);

const SearchOverlay = ({ isOpen, onClose, products, onProductClick }) => {
  const [query, setQuery] = useState('');
  if (!isOpen) return null;
  const filtered = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-start pt-20" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 flex items-center">
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <input type="text" placeholder="Search for products..." className="flex-1 outline-none text-lg" value={query} onChange={e => setQuery(e.target.value)} autoFocus />
          <button onClick={onClose}><X className="h-5 w-5 text-gray-500 hover:text-red-500"/></button>
        </div>
        {query && (
          <div className="max-h-96 overflow-y-auto">
            {filtered.length === 0 ? <div className="p-8 text-center text-gray-500">No products found.</div> : filtered.map(p => (
              <div key={p.id} onClick={() => { onProductClick(p); onClose(); }} className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded mr-4" />
                <div><p className="font-medium text-gray-900">{p.name}</p><p className="text-sm text-gray-500">₹{p.price}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Hero = ({ onViewDeals, storeSettings }) => (
  <div className="relative bg-gray-50 overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="relative z-10 pb-8 bg-gray-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
          <div className="sm:text-center lg:text-left">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block xl:inline">Beast Mode</span>{' '}
              <span className="block text-indigo-600 xl:inline">Is ON</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
              Welcome to {storeSettings.name}. Premium gear for the untamed spirit.
            </p>
            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
              <div className="rounded-md shadow">
                <a href="#shop" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-all hover:shadow-lg">
                  Shop Now
                </a>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <button onClick={onViewDeals} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10 transition-all">
                  View Deals
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
      <img className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" src={storeSettings.heroImage} alt="Shopping woman" />
    </div>
  </div>
);

const Features = () => (
  <div className="py-12 bg-white border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="bg-indigo-100 p-3 rounded-full"><Truck className="h-6 w-6 text-indigo-600" /></div>
          <div><h3 className="text-lg font-semibold text-gray-900">Free Shipping</h3><p className="text-gray-500 text-sm">On all orders over ₹500</p></div>
        </div>
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="bg-indigo-100 p-3 rounded-full"><ShieldCheck className="h-6 w-6 text-indigo-600" /></div>
          <div><h3 className="text-lg font-semibold text-gray-900">Secure Payment</h3><p className="text-gray-500 text-sm">100% secure transaction</p></div>
        </div>
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="bg-indigo-100 p-3 rounded-full"><Clock className="h-6 w-6 text-indigo-600" /></div>
          <div><h3 className="text-lg font-semibold text-gray-900">24/7 Support</h3><p className="text-gray-500 text-sm">Dedicated support team</p></div>
        </div>
      </div>
    </div>
  </div>
);

const ProductCard = ({ product, addToCart, toggleWishlist, isInWishlist, onProductClick, shopMode, storeSettings }) => {
  const displayPrice = shopMode === 'wholesale' ? (product.wholesalePrice || Math.floor(product.price * 0.7)) : product.price;
  const moq = shopMode === 'wholesale' ? (product.moq || 5) : 1;
  return (
  <div onClick={() => onProductClick(product)} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col cursor-pointer">
    {product.badge && <div className="absolute top-4 left-4 z-10 bg-black text-white text-xs font-bold px-2 py-1 rounded">{product.badge}</div>}
    {shopMode === 'wholesale' && <div className="absolute top-12 left-4 z-10 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded shadow-sm">Wholesale</div>}
    <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }} className={`absolute top-4 right-4 p-2 rounded-full shadow-md z-10 transition-colors ${isInWishlist ? 'bg-pink-500 text-white' : 'bg-white text-gray-400 hover:text-pink-500'}`}><Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} /></button>
    <div className="relative aspect-w-1 aspect-h-1 h-64 bg-gray-200 overflow-hidden">
      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover object-center absolute inset-0 transition-opacity duration-300 group-hover:opacity-0" />
      <img src={product.images[1] || product.images[0]} alt={product.name} className="w-full h-full object-cover object-center absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <button onClick={(e) => { e.stopPropagation(); addToCart(product, shopMode); }} className="absolute bottom-4 right-4 p-3 rounded-full bg-white text-indigo-600 shadow-lg transform translate-y-12 group-hover:translate-y-0 transition-transform duration-300 hover:bg-indigo-600 hover:text-white z-10"><ShoppingBag className="h-5 w-5" /></button>
    </div>
    <div className="p-5 flex flex-col flex-grow"><p className="text-sm text-gray-500 mb-1">{product.category}</p><h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{product.name}</h3><div className="flex items-center mb-2"><Star className="h-4 w-4 text-yellow-400 fill-current" /><span className="ml-1 text-sm text-gray-600">{product.rating}</span></div><div className="mt-auto flex justify-between items-end"><div><span className="text-xl font-bold text-indigo-600">₹{displayPrice}</span>{shopMode === 'wholesale' && <span className="ml-2 text-xs text-gray-400 line-through">₹{product.price}</span>}</div>{shopMode === 'wholesale' && <span className="text-xs font-medium text-gray-500">MOQ: {moq}</span>}</div></div>
  </div>
  );
};

const ProductDetails = ({ product, onBack, addToCart, toggleWishlist, isInWishlist, allProducts, onProductClick, shopMode, storeSettings }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const recommendations = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  useEffect(() => { window.scrollTo(0, 0); setSelectedImageIndex(0); }, [product]);
  const retailPrice = Number(product.price);
  const wholesalePrice = product.wholesalePrice ? Number(product.wholesalePrice) : Math.floor(retailPrice * 0.7);
  const displayPrice = shopMode === 'wholesale' ? wholesalePrice : retailPrice;
  const minQty = shopMode === 'wholesale' ? (product.moq || 5) : 1;
  const validImages = product.images.filter(img => img && img.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={onBack} className="mb-6 flex items-center text-indigo-600 font-medium hover:underline"><ArrowLeft className="h-5 w-5 mr-1" /> Back to Shop</button>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="bg-gray-100 p-4">
              <div className="aspect-w-1 aspect-h-1 w-full h-96 rounded-lg overflow-hidden mb-4 bg-white"><img src={validImages[selectedImageIndex] || "https://via.placeholder.com/400"} alt={product.name} className="w-full h-full object-contain" /></div>
              <div className="flex space-x-2 overflow-x-auto pb-2 hide-scrollbar">
                {validImages.map((img, idx) => (
                  <button key={idx} onClick={() => setSelectedImageIndex(idx)} className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-transparent hover:border-gray-300'}`}><img src={img} className="w-full h-full object-cover" alt={`View ${idx + 1}`} /></button>
                ))}
              </div>
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="flex justify-between items-start">
                <div className="uppercase tracking-wide text-sm text-indigo-600 font-semibold">{product.category}</div>
                {shopMode === 'wholesale' && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded border border-yellow-200">WHOLESALE PRICE</span>}
              </div>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900">{product.name}</h1>
              <div className="mt-2 flex items-center"><Star className="h-5 w-5 text-yellow-400 fill-current" /><span className="ml-2 text-gray-600">{product.rating} Rating</span></div>
              <p className="mt-6 text-gray-500 text-lg leading-relaxed">{product.description || "Experience premium quality with this amazing product."}</p>
              <div className="mt-8">
                <span className="text-3xl font-bold text-gray-900">₹{displayPrice}</span>
                {shopMode === 'wholesale' && <span className="ml-3 text-lg text-gray-400 line-through">₹{retailPrice}</span>}
                {shopMode === 'wholesale' && <p className="text-sm text-red-500 mt-1 font-medium">Minimum Order Quantity: {minQty} units</p>}
              </div>
              <div className="mt-8 flex space-x-4">
                <button onClick={() => addToCart(product, shopMode)} className="flex-1 bg-indigo-600 border border-transparent rounded-md py-4 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transition-all"><ShoppingBag className="h-5 w-5 mr-2" />Add to Cart {shopMode === 'wholesale' ? `(Min ${minQty})` : ''}</button>
                <button onClick={() => toggleWishlist(product)} className={`flex-none border border-transparent rounded-md py-4 px-4 flex items-center justify-center transition-colors ${isInWishlist ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500 hover:text-pink-500 hover:bg-gray-200'}`}><Heart className={`h-6 w-6 ${isInWishlist ? 'fill-current' : ''}`} /></button>
              </div>
            </div>
          </div>
        </div>
        {product.video && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-16 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center"><Video className="h-6 w-6 mr-2 text-indigo-600" /> Product Video</h2>
            <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden flex items-center justify-center">
              {product.video.includes('youtube') || product.video.includes('youtu.be') ? <div className="flex items-center justify-center h-64 bg-gray-100 text-gray-500"><p>YouTube Video Preview: {product.video}</p></div> : <video controls className="w-full h-full" src={product.video}>Your browser does not support the video tag.</video>}
            </div>
          </div>
        )}
        {recommendations.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended For You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recommendations.map(rec => (
                <div key={rec.id} onClick={() => onProductClick(rec)} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer overflow-hidden border border-gray-100 group">
                  <div className="h-48 bg-gray-200 relative">
                    <img src={rec.images[0]} alt={rec.name} className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500 group-hover:opacity-0" />
                    <img src={rec.images[1] || rec.images[0]} alt={rec.name} className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                  <div className="p-4"><h3 className="font-bold text-gray-900 truncate">{rec.name}</h3><p className="text-indigo-600 font-medium mt-1">₹{shopMode === 'wholesale' ? (rec.wholesalePrice || Math.floor(rec.price * 0.7)) : rec.price}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CartDrawer = ({ isOpen, onClose, cartItems, removeFromCart, updateQuantity, onCheckout, storeSettings }) => {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl">
            <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
              <div className="flex items-start justify-between"><h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2><div className="ml-3 h-7 flex items-center"><button onClick={onClose} className="-m-2 p-2 text-gray-400 hover:text-gray-500"><X className="h-6 w-6" /></button></div></div>
              <div className="mt-8">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12"><ShoppingBag className="mx-auto h-12 w-12 text-gray-300" /><p className="mt-4 text-gray-500">Your cart is empty.</p><button onClick={onClose} className="mt-4 text-indigo-600 font-medium hover:text-indigo-500">Start Shopping &rarr;</button></div>
                ) : (
                  <div className="flow-root">
                    <ul className="-my-6 divide-y divide-gray-200">
                      {cartItems.map((item) => (
                        <li key={item.id} className="py-6 flex">
                          <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden"><img src={item.images[0]} alt={item.name} className="w-full h-full object-center object-cover" /></div>
                          <div className="ml-4 flex-1 flex flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3>{item.name}</h3>
                                <p className="ml-4">₹{item.price * item.quantity}</p>
                              </div>
                              <div className="flex items-center mt-1">
                                <p className="text-sm text-gray-500">{item.category}</p>
                                {item.mode === 'wholesale' && (
                                  <span className="ml-2 text-[10px] font-bold bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">WHOLESALE (MOQ: {item.moq || 5})</span>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 flex items-end justify-between text-sm"><div className="flex items-center border rounded-md"><button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50" disabled={item.quantity <= (item.mode === 'wholesale' ? (item.moq || 5) : 1)}>-</button><span className="px-2 text-gray-900">{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">+</button></div><button type="button" onClick={() => removeFromCart(item.id)} className="font-medium text-indigo-600 hover:text-indigo-500">Remove</button></div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900"><p>Subtotal</p><p>₹{total}</p></div>
                <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                <div className="mt-6"><button onClick={onCheckout} className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"><MessageCircle className="h-5 w-5 mr-2" />Order on WhatsApp</button></div>
                <div className="mt-6 flex justify-center text-sm text-center text-gray-500"><p>or{' '}<button type="button" className="text-indigo-600 font-medium hover:text-indigo-500" onClick={onClose}>Continue Shopping<span aria-hidden="true"> &rarr;</span></button></p></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const WishlistDrawer = ({ isOpen, onClose, wishlist, addToCart, removeFromWishlist }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl">
            <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900">My Wishlist ({wishlist.length})</h2>
                <div className="ml-3 h-7 flex items-center">
                  <button onClick={onClose} className="-m-2 p-2 text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="mt-8">
                {wishlist.length === 0 ? (
                   <div className="text-center py-10 text-gray-500">Your wishlist is empty.</div>
                ) : (
                  <div className="flow-root">
                    <ul className="-my-6 divide-y divide-gray-200">
                      {wishlist.map((item) => (
                        <li key={item.id} className="py-6 flex">
                          <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-center object-cover" />
                          </div>
                          <div className="ml-4 flex-1 flex flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3>{item.name}</h3>
                                <p className="ml-4">₹{item.price}</p>
                              </div>
                            </div>
                            <div className="flex-1 flex items-end justify-between text-sm">
                              <button onClick={() => addToCart(item)} className="text-indigo-600 font-medium hover:text-indigo-500">Move to Cart</button>
                              <button onClick={() => removeFromWishlist(item.id)} className="text-red-600 font-medium hover:text-red-500">Remove</button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SupportChat = ({ isOpen, onClose, storeSettings }) => {
  const [messages, setMessages] = useState([
    { text: `Hi! Welcome to ${storeSettings.name} AI Support. How can I help you today?`, sender: 'bot' }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => { if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isOpen]);

  const openWhatsAppSupport = () => {
    const text = encodeURIComponent(`Hello ${storeSettings.name} Support, I need help.`);
    window.open(`https://wa.me/${storeSettings.contact.whatsapp}?text=${text}`, '_blank');
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      let botResponse = "";
      let isWhatsApp = false;
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes("order") || lowerInput.includes("track") || lowerInput.includes("help") || lowerInput.includes("human") || lowerInput.includes("whatsapp")) {
        botResponse = "For detailed support or tracking, please connect with our expert on WhatsApp.";
        isWhatsApp = true;
      } else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        botResponse = `Hello! Welcome to ${storeSettings.name}. How can I assist you?`;
      } else {
        botResponse = "I'm not sure about that. Would you like to chat with a human on WhatsApp?";
        isWhatsApp = true;
      }
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot', isWhatsApp }]);
    }, 1000);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-10">
      <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center"><MessageCircle className="h-5 w-5 mr-2" /><span className="font-bold">AI Support</span></div>
        <button onClick={onClose}><X className="h-5 w-5" /></button>
      </div>
      <div className="h-80 overflow-y-auto p-4 bg-gray-50 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>{msg.text}</div>
            {msg.isWhatsApp && (
              <button onClick={openWhatsAppSupport} className="mt-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 px-4 rounded-full flex items-center shadow-sm transition-colors"><MessageCircle className="h-3 w-3 mr-1" />Chat on WhatsApp</button>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 bg-white border-t border-gray-100 flex"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type a message..." className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-600" /><button onClick={handleSend} className="ml-2 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700"><Send className="h-4 w-4" /></button></div>
    </div>
  );
};

const AdminPanel = ({ isOpen, onClose, products, setProducts, storeSettings, setStoreSettings, isAuthenticated, onLogin, onLogout, categories, setCategories, storeStats, setStoreStats, onResetData, showToast, showConfirm, onSaveProduct, onDeleteProduct, onSaveSettings, onAddCategory, onDeleteCategory, onSaveStats }) => {
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [productForm, setProductForm] = useState({ id: null, name: '', price: '', wholesalePrice: '', moq: 5, category: 'Electronics', images: ["", "", "", "", "", ""], video: '', description: '' });
  const [settingsForm, setSettingsForm] = useState({ ...storeSettings });
  const [newCategory, setNewCategory] = useState('');
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [statsForm, setStatsForm] = useState({ ...storeStats });

  useEffect(() => { setSettingsForm({ ...storeSettings }); setStatsForm({ ...storeStats }); }, [storeSettings, storeStats, isOpen]);
  if (!isOpen) return null;

  const handleLoginClick = () => {
    onLogin(password);
  };

  const handleDeleteProductClick = (id) => {
    showConfirm("Are you sure you want to delete this product permanently?", () => {
      onDeleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast("Product deleted successfully");
    });
  };

  const handleDeleteCategoryClick = (cat) => {
    if(cat === 'All') return;
    showConfirm(`Delete category "${cat}"?`, () => {
        onDeleteCategory(cat);
    });
  };

  const handleEditClick = (p) => {
    const imgs = [...p.images];
    while(imgs.length < 6) imgs.push("");
    setProductForm({...p, images: imgs, moq: p.moq || 5 });
    setActiveTab('editor');
  };

  const handleSaveProductClick = () => {
    if (!productForm.name || !productForm.price) { showToast("Name and Retail Price are required!", 'error'); return; }
    const productData = { ...productForm, price: Number(productForm.price), wholesalePrice: productForm.wholesalePrice ? Number(productForm.wholesalePrice) : undefined, moq: productForm.moq ? Number(productForm.moq) : 5 };
    onSaveProduct(productData);
    setProductForm({ id: null, name: '', price: '', wholesalePrice: '', moq: 5, category: categories[1] || 'Electronics', images: ["", "", "", "", "", ""], video: '', description: '' });
  };

  const handleImageChange = (index, value) => { const newImages = [...productForm.images]; newImages[index] = value; setProductForm({...productForm, images: newImages}); };

  return (
    <div className="fixed inset-0 z-[60] bg-gray-900 flex items-center justify-center">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-gray-800 p-4 flex justify-between items-center text-white">
          <div className="flex items-center font-bold text-lg"><Lock className="h-5 w-5 mr-2" /> Admin Control Panel</div>
          <button onClick={onClose}><X className="h-5 w-5 hover:text-red-400"/></button>
        </div>
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
              <input type="password" placeholder="Enter Password" className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:border-indigo-600 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
              <button onClick={handleLoginClick} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">Unlock Panel</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            <div className="w-64 bg-gray-100 border-r border-gray-200 p-4 space-y-2 overflow-y-auto flex flex-col">
              <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left p-3 rounded-lg font-medium flex items-center ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-200 text-gray-700'}`}><BarChart className="h-4 w-4 mr-2" /> Dashboard</button>
              <button onClick={() => setActiveTab('products')} className={`w-full text-left p-3 rounded-lg font-medium flex items-center ${activeTab === 'products' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-200 text-gray-700'}`}><ShoppingBag className="h-4 w-4 mr-2" /> Products</button>
              <button onClick={() => setActiveTab('categories')} className={`w-full text-left p-3 rounded-lg font-medium flex items-center ${activeTab === 'categories' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-200 text-gray-700'}`}><List className="h-4 w-4 mr-2" /> Categories</button>
              <button onClick={() => { setProductForm({ id: null, name: '', price: '', wholesalePrice: '', moq: 5, category: categories[1] || 'Electronics', images: ["", "", "", "", "", ""], video: '', description: '' }); setActiveTab('editor'); }} className={`w-full text-left p-3 rounded-lg font-medium flex items-center ${activeTab === 'editor' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-200 text-gray-700'}`}><Plus className="h-4 w-4 mr-2" /> Add Product</button>
              <button onClick={() => setActiveTab('settings')} className={`w-full text-left p-3 rounded-lg font-medium flex items-center ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-200 text-gray-700'}`}><Settings className="h-4 w-4 mr-2" /> Settings</button>
              <div className="flex-1"></div>
              <button onClick={() => { 
                  showConfirm("Reset all data to defaults? This will clear custom data.", () => {
                      onResetData();
                  });
              }} className="w-full text-left p-3 rounded-lg font-medium flex items-center text-orange-600 hover:bg-orange-50"><RefreshCw className="h-4 w-4 mr-2" /> Reset All Data</button>
              <button onClick={onLogout} className="w-full text-left p-3 rounded-lg font-medium flex items-center text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4 mr-2" /> Logout</button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
              {activeTab === 'dashboard' && (
                <div>
                  <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Dashboard</h2><button onClick={() => isEditingStats ? onSaveStats(statsForm) : setIsEditingStats(true)} className="text-sm bg-indigo-600 text-white px-4 py-2 rounded">{isEditingStats ? 'Save Stats' : 'Edit Stats'}</button></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h3 className="text-gray-500 font-medium text-sm uppercase">Total Products</h3><p className="text-4xl font-bold text-gray-800 mt-2">{products.length}</p></div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h3 className="text-gray-500 font-medium text-sm uppercase">Total Sales (₹)</h3>{isEditingStats ? <input className="w-full p-2 border rounded mt-2" value={statsForm.sales} onChange={e => setStatsForm({...statsForm, sales: e.target.value})} /> : <p className="text-4xl font-bold text-green-600 mt-2">₹{storeStats.sales}</p>}</div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h3 className="text-gray-500 font-medium text-sm uppercase">Pending Orders</h3>{isEditingStats ? <input className="w-full p-2 border rounded mt-2" value={statsForm.orders} onChange={e => setStatsForm({...statsForm, orders: e.target.value})} /> : <p className="text-4xl font-bold text-purple-600 mt-2">{storeStats.orders}</p>}</div>
                  </div>
                </div>
              )}
              {activeTab === 'products' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Product List</h2>
                  <div className="space-y-4">
                    {products.map(p => (
                      <div key={p.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center"><img src={p.images[0]} className="w-16 h-16 rounded object-cover mr-4 border border-gray-200" alt="" /><div><p className="font-bold text-lg">{p.name}</p><p className="text-sm text-gray-500">Retail: ₹{p.price} | Wholesale: ₹{p.wholesalePrice || 'Auto'}</p></div></div>
                        <div className="flex space-x-2">
                          <button onClick={(e) => { e.stopPropagation(); handleEditClick(p); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded border border-blue-200"><Edit className="h-4 w-4" /></button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteProductClick(p.id); }} className="text-red-600 hover:bg-red-50 p-2 rounded border border-red-200"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'categories' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Manage Categories</h2>
                  <div className="flex mb-6"><input className="flex-1 p-3 border rounded-l-lg" placeholder="New Category Name" value={newCategory} onChange={e => setNewCategory(e.target.value)} /><button onClick={() => { onAddCategory(newCategory); setNewCategory(''); }} className="bg-green-600 text-white px-6 rounded-r-lg font-bold hover:bg-green-700">Add</button></div>
                  <div className="space-y-2">{categories.map(cat => (<div key={cat} className="flex justify-between items-center bg-white p-3 rounded border border-gray-200"><span className="font-medium">{cat}</span>{cat !== 'All' && <button onClick={() => handleDeleteCategoryClick(cat)} className="text-red-500 hover:bg-red-50 p-2"><Trash2 className="h-4 w-4"/></button>}</div>))}</div>
                </div>
              )}
              {activeTab === 'editor' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">{productForm.id ? 'Edit Product' : 'Add New Product'}</h2>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div><label className="block text-sm font-bold mb-1">Product Name</label><input className="w-full p-3 border rounded" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} /></div>
                       <div><label className="block text-sm font-bold mb-1">Category</label><select className="w-full p-3 border rounded" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>{categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-indigo-50 p-4 rounded-lg">
                       <div><label className="block text-sm font-bold mb-1">Retail Price (₹)</label><input className="w-full p-3 border rounded" type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} /></div>
                       <div><label className="block text-sm font-bold mb-1">Wholesale Price (₹)</label><input className="w-full p-3 border rounded" type="number" value={productForm.wholesalePrice} onChange={e => setProductForm({...productForm, wholesalePrice: e.target.value})} /></div>
                       <div><label className="block text-sm font-bold mb-1">Wholesale MOQ</label><input className="w-full p-3 border rounded" type="number" value={productForm.moq} onChange={e => setProductForm({...productForm, moq: e.target.value})} placeholder="Default: 5"/></div>
                    </div>
                    <div><label className="block text-sm font-bold mb-3">Images (Max 6)</label><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{productForm.images.map((img, index) => (<input key={index} className="w-full p-2 border rounded text-sm" value={img} onChange={e => handleImageChange(index, e.target.value)} placeholder={`Image URL ${index + 1}`} />))}</div></div>
                    <div><label className="block text-sm font-bold mb-1">Video URL</label><input className="w-full p-3 border rounded" value={productForm.video} onChange={e => setProductForm({...productForm, video: e.target.value})} /></div>
                    <div><label className="block text-sm font-bold mb-1">Description</label><textarea className="w-full p-3 border rounded h-24" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} /></div>
                    <button onClick={handleSaveProductClick} className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700"><Save className="h-5 w-5 inline mr-2" /> Save Product</button>
                  </div>
                </div>
              )}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Settings</h2>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
                    <div><h3 className="font-bold mb-4 border-b pb-2">Store Info</h3><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm mb-1">Store Name</label><input className="w-full p-3 border rounded" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} /></div><div><label className="block text-sm mb-1">Copyright Text</label><input className="w-full p-3 border rounded" value={settingsForm.copyrightText} onChange={e => setSettingsForm({...settingsForm, copyrightText: e.target.value})} /></div></div><div className="mt-4"><label className="block text-sm mb-1">Store Logo URL</label><input className="w-full p-3 border rounded" value={settingsForm.logo} onChange={e => setSettingsForm({...settingsForm, logo: e.target.value})} placeholder="https://..." /></div><div className="mt-4"><label className="block text-sm mb-1">Hero Image URL</label><input className="w-full p-3 border rounded" value={settingsForm.heroImage} onChange={e => setSettingsForm({...settingsForm, heroImage: e.target.value})} /></div></div>
                    <div><h3 className="font-bold mb-4 border-b pb-2">Business Logic</h3><div><label className="block text-sm mb-1">Wholesale Min Order Qty</label><input type="number" className="w-full p-3 border rounded" value={settingsForm.wholesaleMinQty} onChange={e => setSettingsForm({...settingsForm, wholesaleMinQty: Number(e.target.value)})} /></div></div>
                    <div><h3 className="font-bold mb-4 border-b pb-2">Contact Info</h3><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm mb-1">WhatsApp Number</label><input className="w-full p-3 border rounded" value={settingsForm.contact.whatsapp} onChange={e => setSettingsForm({...settingsForm, contact: {...settingsForm.contact, whatsapp: e.target.value}})} /></div><div><label className="block text-sm mb-1">Support Email</label><input className="w-full p-3 border rounded" value={settingsForm.contact.email} onChange={e => setSettingsForm({...settingsForm, contact: {...settingsForm.contact, email: e.target.value}})} /></div></div></div>
                    <div>
                      <h3 className="font-bold mb-4 border-b pb-2">Social Media Links</h3>
                      <div className="space-y-3">
                        <div><label className="block text-sm mb-1 flex items-center"><Instagram className="h-4 w-4 mr-2"/> Instagram URL</label><input className="w-full p-3 border rounded" value={settingsForm.social.instagram} onChange={e => setSettingsForm({...settingsForm, social: {...settingsForm.social, instagram: e.target.value}})} placeholder="#" /></div>
                        <div><label className="block text-sm mb-1 flex items-center"><Facebook className="h-4 w-4 mr-2"/> Facebook URL</label><input className="w-full p-3 border rounded" value={settingsForm.social.facebook} onChange={e => setSettingsForm({...settingsForm, social: {...settingsForm.social, facebook: e.target.value}})} placeholder="#" /></div>
                        <div><label className="block text-sm mb-1 flex items-center"><Youtube className="h-4 w-4 mr-2"/> YouTube URL</label><input className="w-full p-3 border rounded" value={settingsForm.social.youtube} onChange={e => setSettingsForm({...settingsForm, social: {...settingsForm.social, youtube: e.target.value}})} placeholder="#" /></div>
                      </div>
                    </div>
                    <button onClick={() => onSaveSettings(settingsForm)} className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700">Save Settings</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [storeSettings, setStoreSettings] = useState(INITIAL_SETTINGS);
  const [storeStats, setStoreStats] = useState({ sales: 45200, orders: 12 });
  
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [shopMode, setShopMode] = useState('retail');
  
  // Auth State with LocalStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('wb_admin_auth') === 'true';
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [viewMode, setViewMode] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };
  const showConfirm = (message, onConfirm) => { setConfirmModal({ isOpen: true, message, onConfirm: () => { onConfirm(); setConfirmModal({ isOpen: false, message: '', onConfirm: null }); } }); };

  // --- Auth Handlers ---
  const handleAdminLogin = (pwd) => {
    if (pwd === 'Vikas@admin@123') {
      setIsAuthenticated(true);
      localStorage.setItem('wb_admin_auth', 'true');
      showToast("Admin Logged In");
    } else {
      showToast('Incorrect Password!', 'error');
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('wb_admin_auth');
    showToast("Logged Out");
  };

  // --- Firebase Listeners ---
  useEffect(() => {
    const initAuth = async () => {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }
    };
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
        setUser(u);
    });
    
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubProducts = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'products'), (snapshot) => {
        const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (prods.length > 0) setProducts(prods);
    });

    const unsubConfig = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'config'), (snapshot) => {
        snapshot.docs.forEach(doc => {
            if (doc.id === 'mainSettings') setStoreSettings(doc.data());
            if (doc.id === 'categories') setCategories(doc.data().list || INITIAL_CATEGORIES);
            if (doc.id === 'stats') setStoreStats(doc.data());
        });
    });

    return () => { unsubProducts(); unsubConfig(); };
  }, [user]);

  // --- Firebase Actions ---
  const onSaveProduct = async (productData) => {
      if(!user) return;
      if (productData.id) {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', productData.id), productData);
          showToast("Product Updated Globally!");
      } else {
          const { id, ...data } = productData; 
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), data);
          showToast("New Product Added Globally!");
      }
  };

  const onDeleteProduct = async (id) => {
      if(!user) return;
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id));
      showToast("Product Deleted Globally!");
  };

  const onSaveSettings = async (newSettings) => {
      if(!user) return;
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'mainSettings'), newSettings);
      showToast("Settings Saved Globally!");
  };

  const onAddCategory = async (newCat) => {
      if(!user) return;
      const newList = [...categories, newCat];
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'categories'), { list: newList });
      showToast("Category Added!");
  };

  const onDeleteCategory = async (cat) => {
      if(!user) return;
      const newList = categories.filter(c => c !== cat);
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'categories'), { list: newList });
      showToast("Category Deleted!");
  };

  const onSaveStats = async (newStats) => {
      if(!user) return;
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'stats'), newStats);
      showToast("Stats Updated!");
  };

  const handleResetData = async () => {
      // Manual Reset Logic for demo
      showToast("Reset logic triggered (simulated).", "info");
  };


  let displayedProducts = products;
  if (viewMode === 'new') { displayedProducts = products.filter(p => p.badge === 'New' || p.badge === 'Best Seller'); }
  else if (viewMode === 'deals') { displayedProducts = products.filter(p => p.badge === 'Sale' || p.price < 2000); }
  else if (activeCategory !== "All") { displayedProducts = products.filter(p => p.category === activeCategory); }

  const addToCart = (product, mode = shopMode) => {
    const priceToUse = mode === 'wholesale' ? (product.wholesalePrice || Math.floor(product.price * 0.7)) : product.price;
    const minQty = mode === 'wholesale' ? (product.moq || 5) : 1;
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.mode === mode);
      if (existing) { return prev.map(item => (item.id === product.id && item.mode === mode) ? { ...item, quantity: item.quantity + 1 } : item); }
      return [...prev, { ...product, price: priceToUse, quantity: minQty, mode: mode, moq: product.moq || 5 }];
    });
    setIsCartOpen(true);
    showToast("Added to Cart!");
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(item => item.id !== id));
  const updateQuantity = (id, change) => { setCartItems(prev => prev.map(item => { if (item.id === id) { const minLimit = item.mode === 'wholesale' ? (item.moq || 5) : 1; return { ...item, quantity: Math.max(minLimit, item.quantity + change) }; } return item; })); };
  const toggleWishlist = (product) => { setWishlist(prev => { if (prev.find(item => item.id === product.id)) return prev.filter(item => item.id !== product.id); return [...prev, product]; }); showToast("Wishlist Updated"); };
  const handleNavClick = (item) => { setSelectedProduct(null); if (item === 'Support') setIsSupportOpen(true); else if (item === 'New Arrivals') { setViewMode('new'); setActiveCategory('All'); window.scrollTo({ top: 800, behavior: 'smooth' }); } else if (item === 'Shop') { setViewMode('shop'); setActiveCategory('All'); window.scrollTo({ top: 800, behavior: 'smooth' }); } else { setViewMode('home'); setActiveCategory('All'); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const handleProductClick = (product) => setSelectedProduct(product);
  const handleWhatsAppCheckout = () => { const phoneNumber = storeSettings.contact.whatsapp; const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0); let message = `Hello ${storeSettings.name},\nI would like to place a ${shopMode.toUpperCase()} order:\n\n`; cartItems.forEach(item => { message += `• ${item.name} ${item.mode === 'wholesale' ? '(Wholesale)' : ''}\n  Qty: ${item.quantity} | Price: ₹${item.price}\n`; }); message += `\n*Total: ₹${total}*\n`; window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank'); setIsCartOpen(false); setCartItems([]); };
  const toggleShopMode = (mode) => { if (mode) setShopMode(mode); else setShopMode(prev => prev === 'retail' ? 'wholesale' : 'retail'); };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmModal isOpen={confirmModal.isOpen} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })} />
      
      <Navbar cartCount={cartItems.reduce((a, c) => a + c.quantity, 0)} wishlistCount={wishlist.length} onCartClick={() => setIsCartOpen(true)} onWishlistClick={() => setIsWishlistOpen(true)} onSearchClick={() => setIsSearchOpen(true)} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} onNavClick={handleNavClick} shopMode={shopMode} toggleShopMode={toggleShopMode} storeSettings={storeSettings} />
      
      {selectedProduct ? (
        <ProductDetails product={selectedProduct} onBack={() => setSelectedProduct(null)} addToCart={addToCart} toggleWishlist={toggleWishlist} isInWishlist={!!wishlist.find(item => item.id === selectedProduct.id)} allProducts={products} onProductClick={handleProductClick} shopMode={shopMode} storeSettings={storeSettings} />
      ) : (
        <>
          <Hero onViewDeals={() => { setViewMode('deals'); window.scrollTo({ top: 800, behavior: 'smooth' }); }} storeSettings={storeSettings} />
          <Features />
          <main id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 space-y-4 md:space-y-0">
              <div className="flex items-baseline"><h2 className="text-3xl font-extrabold text-gray-900">{viewMode === 'new' ? 'New Arrivals' : viewMode === 'deals' ? 'Best Deals' : 'Featured Products'}</h2>{shopMode === 'wholesale' && <span className="ml-3 bg-yellow-100 text-yellow-800 text-sm font-bold px-2 py-1 rounded border border-yellow-300 animate-pulse">Wholesale Pricing Active</span>}</div>
              <div className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar space-x-2 w-full md:w-auto">{categories.map(cat => (<button key={cat} onClick={() => { setActiveCategory(cat); setViewMode('shop'); }} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat && viewMode !== 'new' && viewMode !== 'deals' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>{cat}</button>))}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">{displayedProducts.map(product => (<ProductCard key={product.id} product={product} addToCart={addToCart} toggleWishlist={toggleWishlist} isInWishlist={!!wishlist.find(item => item.id === product.id)} onProductClick={handleProductClick} shopMode={shopMode} storeSettings={storeSettings} />))}</div>
            {displayedProducts.length === 0 && <div className="text-center py-20"><p className="text-gray-500 text-lg">No products found.</p></div>}
          </main>
        </>
      )}

      <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1"><div className="flex items-center text-indigo-600 mb-4">{storeSettings.logo ? <img src={storeSettings.logo} className="h-8 w-auto mr-2"/> : <ShoppingBag className="h-8 w-8 mr-2"/>}<span className="text-xl font-bold text-gray-900">{storeSettings.name}</span></div><p className="text-gray-500 text-sm">Unleash the wild side of fashion. Premium gear for the untamed spirit.</p></div>
            <div><h4 className="font-bold text-gray-900 mb-4">Shop</h4><ul className="space-y-2 text-sm text-gray-500"><li><button onClick={() => handleNavClick('New Arrivals')} className="hover:text-indigo-600">New Arrivals</button></li><li><button onClick={() => {setActiveCategory('Electronics'); setViewMode('shop'); window.scrollTo({top:800,behavior:'smooth'})}} className="hover:text-indigo-600">Electronics</button></li></ul></div>
            <div><h4 className="font-bold text-gray-900 mb-4">Support</h4><ul className="space-y-2 text-sm text-gray-500"><li><button onClick={() => setIsSupportOpen(true)} className="hover:text-indigo-600">Live Chat</button></li><li><a href={`mailto:${storeSettings.contact.email}`} className="hover:text-indigo-600">Email Us</a></li></ul></div>
            <div><h4 className="font-bold text-gray-900 mb-4">Stay Connected</h4><div className="flex space-x-4"><a href={storeSettings.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors"><Instagram className="h-5 w-5"/></a><a href={storeSettings.social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors"><Facebook className="h-5 w-5"/></a><a href={storeSettings.social.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 transition-colors"><Youtube className="h-5 w-5"/></a></div></div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center"><p className="text-gray-400 text-sm">&copy; {storeSettings.copyrightText}. All rights reserved.</p><button onClick={() => setIsAdminOpen(true)} className="text-gray-300 hover:text-gray-600 mt-4 md:mt-0 p-2 flex items-center"><Lock className="h-4 w-4 mr-1" /> Admin</button></div>
        </div>
      </footer>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} removeFromCart={removeFromCart} updateQuantity={updateQuantity} onCheckout={handleWhatsAppCheckout} storeSettings={storeSettings} />
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} wishlist={wishlist} addToCart={addToCart} removeFromWishlist={(id) => setWishlist(prev => prev.filter(i => i.id !== id))} />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} products={products} onProductClick={handleProductClick} />
      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        products={products} 
        setProducts={setProducts} 
        storeSettings={storeSettings} 
        setStoreSettings={setStoreSettings} 
        isAuthenticated={isAuthenticated} 
        onLogin={handleAdminLogin} 
        onLogout={handleAdminLogout} 
        categories={categories} 
        setCategories={setCategories} 
        storeStats={storeStats} 
        setStoreStats={setStoreStats} 
        onResetData={handleResetData} 
        showToast={showToast} 
        showConfirm={showConfirm} 
        onSaveProduct={onSaveProduct} 
        onDeleteProduct={onDeleteProduct} 
        onSaveSettings={onSaveSettings} 
        onAddCategory={onAddCategory} 
        onDeleteCategory={onDeleteCategory} 
        onSaveStats={onSaveStats} 
      />
      <SupportChat isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} storeSettings={storeSettings} />
    </div>
  );
};

export default App;
