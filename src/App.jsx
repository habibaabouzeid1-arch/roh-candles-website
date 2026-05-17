import React, { useMemo, useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Sparkles, Leaf, Gift, Flame, Plus, Minus,
  Trash2, Moon, Sun, PackageCheck, BarChart3, Star, Search, X,
  CheckCircle, AlertTriangle, TrendingUp, Clock, Loader2, Database, WifiOff,
} from "lucide-react";

// ─── Products ─────────────────────────────────────────────────────────────────

const products = [
  {
    id: 1,
    name: "Strawbae Candle Handmade",
    category: "Best Seller",
    price: 25.99,
    originalPrice: 29.99,
    promo: "Buy 2 get 5% off",
    shipping: "Free shipping",
    stock: 8,
    image: "/images/strawbae.png.png",
    description: "A strawberry dessert-style handmade candle with a soft romantic look, perfect for room decor and gifts.",
    rating: 4.9,
    reviews: 124,
  },
  {
    id: 2,
    name: "Large Strawberry Candle Handmade",
    category: "Large Size",
    price: 35.99,
    originalPrice: 39.99,
    promo: "RM4 off",
    shipping: "Free shipping",
    stock: 5,
    image: "/images/large-strawberry.png",
    description: "A larger strawberry-inspired candle designed as a sweet gift piece and aesthetic table decor.",
    rating: 4.8,
    reviews: 89,
  },
  {
    id: 3,
    name: "Roh Matcha Candle M",
    category: "Matcha",
    price: 22.49,
    originalPrice: 24.99,
    promo: "10% off",
    shipping: "Free shipping",
    stock: 3,
    image: "/images/matcha.png.png",
    description: "A matcha-inspired handmade candle with fresh green tones and a calm cafe-style aesthetic.",
    rating: 4.7,
    reviews: 62,
  },
  {
    id: 4,
    name: "Roh Milo Candle",
    category: "Cozy",
    price: 22.49,
    originalPrice: 24.99,
    promo: "10% off",
    shipping: "Free shipping",
    stock: 2,
    image: "/images/milo.png.png",
    description: "A cozy Milo-inspired handmade candle made for warm, soft, comforting room decor.",
    rating: 4.6,
    reviews: 47,
  },
];

const scentPrices     = { Strawberry: 0, Vanilla: 2, Matcha: 3, Rose: 3 };
const sizePrices      = { Small: 0, Medium: 8, Large: 15 };
const packagingPrices = { Standard: 0, "Gift Box": 10, "Premium Ribbon": 6 };

const CART_KEY       = "rohCandlesCart_v3";
const ORDERS_KEY     = "rohCandlesOrders_v3";   // fallback when Supabase not configured
const ADMIN_PASSWORD = "roh2026";

const DB_CONNECTED = !!supabase; // true if env vars are set

// ─── Toast ────────────────────────────────────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, show };
}

function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold shadow-xl text-white ${
              t.type === "success" ? "bg-[#208761]" : "bg-[#c0392b]"
            }`}
          >
            {t.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Admin Gate ───────────────────────────────────────────────────────────────

function AdminGate({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput]       = useState("");
  const [error, setError]       = useState(false);

  const attempt = () => {
    if (input === ADMIN_PASSWORD) { setUnlocked(true); setError(false); }
    else setError(true);
  };

  if (unlocked) return children;

  return (
    <div className="mx-auto max-w-sm rounded-[2rem] bg-white p-8 text-center text-[#3d2a22] shadow-xl">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f4dfdf]">
        <BarChart3 size={28} className="text-[#8a3d3d]" />
      </div>
      <h4 className="mb-1 text-2xl font-extrabold">Admin Access</h4>
      <p className="mb-6 text-sm text-[#7c6257]">Enter password to view dashboard.</p>
      <input
        type="password"
        value={input}
        onChange={(e) => { setInput(e.target.value); setError(false); }}
        onKeyDown={(e) => e.key === "Enter" && attempt()}
        placeholder="Password"
        className={`mb-3 w-full rounded-2xl border p-3 outline-none focus:ring-2 focus:ring-[#6f8a4f] ${
          error ? "border-red-400" : "border-[#eadfd3]"
        }`}
      />
      {error && <p className="mb-3 text-xs text-red-500">Incorrect password. Try: roh2026</p>}
      <button
        onClick={attempt}
        className="w-full rounded-full bg-[#3d2a22] py-3 font-bold text-white hover:opacity-90 transition-opacity"
      >
        Unlock Dashboard
      </button>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [modalProduct,    setModalProduct]    = useState(null);

  const [scent,     setScent]     = useState("Strawberry");
  const [size,      setSize]      = useState("Medium");
  const [packaging, setPackaging] = useState("Standard");
  const [quantity,  setQuantity]  = useState(1);
  const [note,      setNote]      = useState("");

  const [cart,          setCart]          = useState([]);
  const [orders,        setOrders]        = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [placingOrder,  setPlacingOrder]  = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("All");

  const [customer, setCustomer] = useState({
    name: "", phone: "", delivery: "Pickup", payment: "Mock Payment",
  });
  const [checkoutErrors, setCheckoutErrors] = useState({});

  const { toasts, show: showToast } = useToast();

  // ── Cart: restore from localStorage ──────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch { localStorage.removeItem(CART_KEY); }
  }, []);

  const persistCart = useCallback((updated) => {
    setCart(updated);
    try { localStorage.setItem(CART_KEY, JSON.stringify(updated)); } catch {}
  }, []);

  // ── Orders: Supabase (if connected) or localStorage fallback ─────────────
  useEffect(() => {
    if (DB_CONNECTED) {
      fetchOrdersFromSupabase();

      // Realtime — admin dashboard updates live as orders come in
      const channel = supabase
        .channel("orders-realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrdersFromSupabase)
        .subscribe();

      return () => supabase.removeChannel(channel);
    } else {
      // No Supabase — load from localStorage
      try {
        const saved = localStorage.getItem(ORDERS_KEY);
        if (saved) setOrders(JSON.parse(saved));
      } catch { localStorage.removeItem(ORDERS_KEY); }
      setOrdersLoading(false);
    }
  }, []);

  const fetchOrdersFromSupabase = async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
    setOrdersLoading(false);
  };

  const persistOrdersLocally = useCallback((updated) => {
    setOrders(updated);
    try { localStorage.setItem(ORDERS_KEY, JSON.stringify(updated)); } catch {}
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() =>
    products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || p.category === filter;
      return matchesSearch && matchesFilter;
    }), [search, filter]);

  const customPrice = useMemo(() =>
    Number((
      selectedProduct.price +
      scentPrices[scent] +
      sizePrices[size] +
      packagingPrices[packaging]
    ).toFixed(2)),
    [selectedProduct, scent, size, packaging]);

  const total     = Number((customPrice * quantity).toFixed(2));
  const cartTotal = Number(cart.reduce((sum, item) => sum + item.price, 0).toFixed(2));
  const lowStock  = products.filter((p) => p.stock <= 3).length;

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!customer.name.trim()) errors.name = "Name is required.";
    if (!customer.phone.trim()) errors.phone = "Phone number is required.";
    else if (!/^[0-9+\-\s]{8,15}$/.test(customer.phone.trim())) errors.phone = "Enter a valid phone number.";
    return errors;
  };

  // ── Cart actions ──────────────────────────────────────────────────────────
  const addToCart = () => {
    const alreadyInCart = cart
      .filter((item) => item.product === selectedProduct.name)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (alreadyInCart + quantity > selectedProduct.stock) {
      showToast(`Only ${selectedProduct.stock} in stock!`, "error");
      return;
    }

    persistCart([...cart, {
      id: Date.now(),
      product: selectedProduct.name,
      image: selectedProduct.image,
      scent, size, packaging, quantity, note,
      price: total,
    }]);
    setNote("");
    showToast(`${selectedProduct.name} added to cart!`);
  };

  const removeFromCart = (id) => {
    persistCart(cart.filter((item) => item.id !== id));
    showToast("Item removed.", "error");
  };

  // ── Place order ───────────────────────────────────────────────────────────
  const placeOrder = async () => {
    if (cart.length === 0) { showToast("Your cart is empty.", "error"); return; }
    const errors = validate();
    if (Object.keys(errors).length > 0) { setCheckoutErrors(errors); return; }
    setCheckoutErrors({});
    setPlacingOrder(true);

    const trackingId = `ROH-${Math.floor(100000 + Math.random() * 900000)}`;

    if (DB_CONNECTED) {
      // ── Save to Supabase ──
      const { error } = await supabase.from("orders").insert([{
        tracking_id:   trackingId,
        customer_name: customer.name.trim(),
        phone:         customer.phone.trim(),
        delivery:      customer.delivery,
        payment:       customer.payment,
        total:         cartTotal,
        item_count:    cart.length,
        items:         JSON.stringify(cart),
        status:        "Order received",
      }]);

      setPlacingOrder(false);

      if (error) {
        console.error("Supabase insert error:", error.message);
        showToast("Order failed. Check Supabase table & policies.", "error");
        return;
      }

      showToast(`Order saved to Supabase! ID: ${trackingId}`);
    } else {
      // ── Fallback: save locally ──
      const localOrder = {
        id:            Date.now(),
        tracking_id:   trackingId,
        customer_name: customer.name.trim(),
        phone:         customer.phone.trim(),
        delivery:      customer.delivery,
        payment:       customer.payment,
        total:         cartTotal,
        item_count:    cart.length,
        items:         JSON.stringify(cart),
        status:        "Order received",
        created_at:    new Date().toISOString(),
      };
      persistOrdersLocally([localOrder, ...orders]);
      setPlacingOrder(false);
      showToast(`Order saved locally! ID: ${trackingId}`);
    }

    persistCart([]);
    setCustomer({ name: "", phone: "", delivery: "Pickup", payment: "Mock Payment" });
    setTimeout(() => document.getElementById("tracking")?.scrollIntoView({ behavior: "smooth" }), 400);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-[#1f1714] text-[#fffaf3]" : "bg-[#fffaf3] text-[#3d2a22]"}`}>

      {/* ── Header ── */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md ${darkMode ? "border-[#4d3930] bg-[#1f1714]/90" : "border-[#eadfd3] bg-[#fffaf3]/90"}`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6f8a4f] text-white">
              <Flame size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Roh Candles</h1>
              <p className="text-xs opacity-70">Handmade dessert-inspired candles</p>
            </div>
          </div>

          <div className="hidden gap-6 text-sm font-medium md:flex">
            {["shop", "customizer", "reviews", "admin", "cart"].map((s) => (
              <a key={s} href={`#${s}`} className="capitalize hover:opacity-60 transition-opacity">{s}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full bg-[#f4dfdf] p-3 text-[#3d2a22] hover:scale-105 transition-transform"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="#cart" className="relative flex items-center gap-2 rounded-full bg-[#f4dfdf] px-4 py-2 text-sm font-semibold text-[#3d2a22]">
              <ShoppingBag size={16} />
              Cart
              {cart.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#e13f6f] text-[10px] font-bold text-white">
                  {cart.length}
                </span>
              )}
            </a>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#f4dfdf] px-4 py-2 text-sm font-semibold text-[#8a3d3d]">
            <Sparkles size={16} /> Smart handmade candle ordering
          </p>
          <h2 className="text-5xl font-extrabold leading-tight md:text-6xl">
            Candles that look like desserts, gifts, and soft moments.
          </h2>
          <p className="mt-5 max-w-xl text-lg opacity-75">
            A real e-commerce prototype for Roh Candles — product search, custom orders, checkout, tracking, Supabase database, and admin dashboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#shop" className="rounded-full bg-[#3d2a22] px-6 py-3 font-semibold text-white shadow-lg hover:opacity-90 transition-opacity">
              Shop Candles
            </a>
            <a href="#customizer" className="rounded-full border border-[#3d2a22] px-6 py-3 font-semibold hover:bg-[#3d2a22] hover:text-white transition-colors">
              Build Your Candle
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-6">
            <Stat value="120+" label="Mock orders" />
            <Stat value="4.8★" label="Average rating" />
            <Stat value="100%" label="Handmade" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="rounded-[2rem] bg-white p-4 shadow-2xl">
            <img
              src="/images/hero-strawberry.png"
              alt="Roh Candles hero"
              className="h-[430px] w-full rounded-[1.5rem] object-cover"
              onError={(e) => { e.currentTarget.src = "/images/strawbae.png.png"; }}
            />
          </div>
        </motion.div>
      </section>

      {/* ── Shop ── */}
      <section id="shop" className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#6f8a4f]">Shop</p>
            <h3 className="text-4xl font-extrabold">Featured Candles</h3>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className={`flex items-center gap-2 rounded-full px-4 py-3 shadow ${darkMode ? "bg-[#2d201c]" : "bg-white text-[#3d2a22]"}`}>
              <Search size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candle..."
                className="w-40 bg-transparent outline-none"
                aria-label="Search products"
              />
              {search && (
                <button onClick={() => setSearch("")} className="opacity-50 hover:opacity-100" aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`rounded-full px-4 py-3 shadow outline-none ${darkMode ? "bg-[#2d201c] text-[#fffaf3]" : "bg-white text-[#3d2a22]"}`}
              aria-label="Filter by category"
            >
              {["All", "Best Seller", "Large Size", "Matcha", "Cozy"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-12 text-center text-[#7c6257] shadow">
            <Search size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No candles found for "{search}"</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <motion.div whileHover={{ y: -6 }} key={product.id} className="flex flex-col overflow-hidden rounded-[1.5rem] bg-white text-[#3d2a22] shadow-lg">
                <button onClick={() => setModalProduct(product)} className="w-full text-left">
                  <div className="relative">
                    <img src={product.image} alt={product.name} className="h-56 w-full object-cover" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#6f8a4f]">{product.category}</span>
                    {product.stock <= 3 && (
                      <span className="absolute right-4 top-4 rounded-full bg-[#ffe3ea] px-2 py-1 text-[10px] font-bold text-[#e13f6f]">Low Stock</span>
                    )}
                  </div>
                </button>
                <div className="flex flex-1 flex-col p-5">
                  <h4 className="font-bold leading-snug">{product.name}</h4>
                  <div className="mt-1 flex items-center gap-1 text-xs text-[#e1a43f]">
                    <Star size={12} fill="currentColor" />
                    <span className="font-semibold">{product.rating}</span>
                    <span className="text-[#9a8a82]">({product.reviews})</span>
                  </div>
                  <p className="mt-2 flex-1 text-xs text-[#7c6257]">{product.description}</p>
                  <div className="mt-4 flex items-end gap-2">
                    <p className="text-lg font-extrabold text-[#e13f6f]">RM {product.price.toFixed(2)}</p>
                    <p className="text-xs text-[#9a8a82] line-through">RM {product.originalPrice.toFixed(2)}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold">
                    <span className="rounded bg-[#dff7ef] px-2 py-1 text-[#208761]">{product.shipping}</span>
                    <span className="rounded bg-[#ffe3ea] px-2 py-1 text-[#e13f6f]">{product.promo}</span>
                    <span className="text-[#8b6f61]">Stock: {product.stock}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      showToast(`Customizing: ${product.name}`);
                      setTimeout(() => document.getElementById("customizer")?.scrollIntoView({ behavior: "smooth" }), 100);
                    }}
                    className="mt-4 w-full rounded-full bg-[#3d2a22] py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
                  >
                    Customize This
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ── Customizer ── */}
      <section id="customizer" className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-2">
        <div className={`rounded-[2rem] p-8 shadow-lg ${darkMode ? "bg-[#2d201c] text-[#fffaf3]" : "bg-[#efe7d8] text-[#3d2a22]"}`}>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#6f8a4f]">Customizer</p>
          <h3 className="text-4xl font-extrabold">Build Your Own Candle</h3>
          <div className="mt-8 space-y-6">
            <Selector label="Scent"     value={scent}     setValue={setScent}     options={Object.keys(scentPrices)}     prices={scentPrices} />
            <Selector label="Size"      value={size}       setValue={setSize}       options={Object.keys(sizePrices)}       prices={sizePrices} />
            <Selector label="Packaging" value={packaging}  setValue={setPackaging}  options={Object.keys(packagingPrices)}  prices={packagingPrices} />
            <div>
              <label className="mb-2 block font-bold">
                Gift Note <span className="text-xs font-normal opacity-50">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="E.g. Happy birthday, Sarah! 🎂"
                maxLength={200}
                className="h-24 w-full resize-none rounded-2xl border border-[#d8c9b8] bg-white p-4 text-[#3d2a22] outline-none focus:ring-2 focus:ring-[#6f8a4f]"
              />
              <p className="mt-1 text-right text-xs opacity-40">{note.length}/200</p>
            </div>
            <div>
              <label className="mb-2 block font-bold">Quantity</label>
              <div className="flex w-fit items-center gap-4 rounded-full bg-white px-4 py-3 shadow-sm">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="rounded-full bg-[#f4dfdf] p-2 hover:scale-105 transition-transform" aria-label="Decrease">
                  <Minus size={16} className="text-[#3d2a22]" />
                </button>
                <span className="w-6 text-center text-lg font-bold text-[#3d2a22]">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="rounded-full bg-[#cbd6b3] p-2 hover:scale-105 transition-transform" aria-label="Increase">
                  <Plus size={16} className="text-[#3d2a22]" />
                </button>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={addToCart}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3d2a22] px-6 py-4 font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
            >
              <ShoppingBag size={18} /> Add to Cart — RM {total.toFixed(2)}
            </motion.button>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 text-[#3d2a22] shadow-xl">
          <img src={selectedProduct.image} alt={selectedProduct.name} className="h-64 w-full rounded-[1.5rem] object-cover" />
          <div className={`mt-6 rounded-[1.5rem] p-5 ${darkMode ? "bg-[#2d201c]" : "bg-[#fffaf3]"}`}>
            <h4 className="text-2xl font-extrabold">{selectedProduct.name}</h4>
            <div className="mt-4 space-y-1">
              <SummaryRow label="Scent"     value={scent} />
              <SummaryRow label="Size"      value={size} />
              <SummaryRow label="Packaging" value={packaging} />
              <SummaryRow label="Qty"       value={quantity} />
              <SummaryRow label="Total"     value={`RM ${total.toFixed(2)}`} strong />
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section id="reviews" className="mx-auto max-w-7xl px-6 py-14">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#6f8a4f]">Social Proof</p>
        <h3 className="mb-8 text-4xl font-extrabold">What Customers Say</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { text: "The strawberry candle looks SO cute in my room!", name: "Ain S." },
            { text: "Packaging was aesthetic and perfect as a gift.", name: "Bella R." },
            { text: "Matcha candle is giving cafe vibes. Obsessed.", name: "Syira M." },
          ].map((review) => (
            <div key={review.name} className="rounded-[1.5rem] bg-white p-6 text-[#3d2a22] shadow-lg">
              <div className="mb-3 flex gap-0.5 text-[#e1a43f]">
                {[1,2,3,4,5].map((s) => <Star key={s} size={16} fill="currentColor" />)}
              </div>
              <p className="font-semibold">"{review.text}"</p>
              <p className="mt-3 text-sm text-[#9a8a82]">— {review.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Admin ── */}
      <section id="admin" className="mx-auto max-w-7xl px-6 py-14">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#6f8a4f]">Admin</p>
        <h3 className="mb-1 text-4xl font-extrabold">Business Dashboard</h3>

        {/* DB status indicator */}
        <p className={`mb-8 flex items-center gap-2 text-sm ${DB_CONNECTED ? "opacity-50" : "text-amber-600"}`}>
          {DB_CONNECTED
            ? <><Database size={13} /> Live data — powered by Supabase</>
            : <><WifiOff size={13} /> Supabase not configured — showing local data. Add VITE_SUPABASE_URL &amp; VITE_SUPABASE_ANON_KEY to .env.local</>
          }
        </p>

        <AdminGate>
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <DashboardCard icon={<TrendingUp />}    label="Products"        value={products.length} />
            <DashboardCard icon={<AlertTriangle />} label="Low Stock Items"  value={lowStock} alert />
            <DashboardCard icon={<ShoppingBag />}   label="Cart Items"      value={cart.length} />
            <DashboardCard icon={<PackageCheck />}  label="Total Orders"    value={orders.length} />
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center gap-3 rounded-[2rem] bg-white p-12 text-[#7c6257] shadow">
              <Loader2 size={24} className="animate-spin" />
              <span className="font-semibold">Loading orders…</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-10 text-center text-[#7c6257] shadow">
              <Clock size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No orders yet. Place a test order to see it here.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[1.5rem] bg-white text-[#3d2a22] shadow-lg">
              <div className="border-b border-[#eadfd3] px-5 py-4 text-lg font-extrabold">
                Order History ({orders.length})
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#eadfd3] bg-[#fffaf3] text-left text-xs uppercase text-[#7c6257]">
                      {["Tracking ID", "Customer", "Phone", "Delivery", "Items", "Total", "Date", "Status"].map((h) => (
                        <th key={h} className="whitespace-nowrap px-5 py-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-[#eadfd3] last:border-0 hover:bg-[#fffaf3] transition-colors">
                        <td className="whitespace-nowrap px-5 py-3 font-bold">{o.tracking_id}</td>
                        <td className="whitespace-nowrap px-5 py-3">{o.customer_name}</td>
                        <td className="whitespace-nowrap px-5 py-3">{o.phone}</td>
                        <td className="whitespace-nowrap px-5 py-3">{o.delivery}</td>
                        <td className="px-5 py-3 text-center">{o.item_count}</td>
                        <td className="whitespace-nowrap px-5 py-3 font-semibold">RM {Number(o.total).toFixed(2)}</td>
                        <td className="whitespace-nowrap px-5 py-3 text-[#9a8a82]">
                          {new Date(o.created_at).toLocaleString("en-MY", { dateStyle: "short", timeStyle: "short" })}
                        </td>
                        <td className="px-5 py-3">
                          <span className="whitespace-nowrap rounded-full bg-[#dff7ef] px-3 py-1 text-xs font-bold text-[#208761]">
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </AdminGate>
      </section>

      {/* ── Candle Care ── */}
      <section id="care" className="mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-[2rem] bg-[#6f8a4f] p-8 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <Leaf />
            <h3 className="text-3xl font-extrabold">Candle Care & Safety</h3>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              "Mostly made for decor and aesthetic display.",
              "Trim the wick before lighting.",
              "Never leave a burning candle unattended.",
              "Keep away from children, pets, curtains, and heat.",
            ].map((tip) => (
              <div key={tip} className="rounded-2xl bg-white/15 p-5 text-sm">{tip}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cart + Checkout ── */}
      <section id="cart" className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8 flex items-center gap-3">
          <Gift className="text-[#b44b4b]" />
          <h3 className="text-4xl font-extrabold">Order Summary</h3>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <AnimatePresence>
              {cart.length === 0 ? (
                <div className="rounded-[2rem] bg-white p-10 text-center text-[#3d2a22] shadow-lg">
                  <ShoppingBag size={36} className="mx-auto mb-3 opacity-25" />
                  <p className="text-lg font-semibold">Your cart is empty.</p>
                  <a href="#shop" className="mt-4 inline-block rounded-full bg-[#3d2a22] px-6 py-2 text-sm font-bold text-white">Browse candles</a>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex gap-4 rounded-[1.5rem] bg-white p-4 text-[#3d2a22] shadow-lg"
                  >
                    <img src={item.image} alt={item.product} className="h-28 w-28 flex-shrink-0 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-extrabold">{item.product}</h4>
                      <p className="mt-1 text-sm text-[#7c6257]">{item.size} · {item.scent} · {item.packaging}</p>
                      <p className="mt-1 text-sm">Qty: {item.quantity}</p>
                      {item.note && <p className="mt-2 text-xs italic text-[#8b6f61]">Note: {item.note}</p>}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-extrabold">RM {item.price.toFixed(2)}</p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-4 rounded-full bg-[#f4dfdf] p-2 text-[#8a3d3d] hover:scale-105 transition-transform"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Checkout */}
          <div className="h-fit rounded-[2rem] bg-white p-6 text-[#3d2a22] shadow-xl">
            <h4 className="mb-5 text-2xl font-extrabold">Checkout</h4>
            <div className="space-y-3">
              <div>
                <input
                  value={customer.name}
                  onChange={(e) => { setCustomer({ ...customer, name: e.target.value }); setCheckoutErrors({ ...checkoutErrors, name: undefined }); }}
                  placeholder="Your name *"
                  className={`w-full rounded-2xl border p-3 outline-none focus:ring-2 focus:ring-[#6f8a4f] ${checkoutErrors.name ? "border-red-400" : "border-[#eadfd3]"}`}
                />
                {checkoutErrors.name && <p className="mt-1 text-xs text-red-500">{checkoutErrors.name}</p>}
              </div>
              <div>
                <input
                  value={customer.phone}
                  onChange={(e) => { setCustomer({ ...customer, phone: e.target.value }); setCheckoutErrors({ ...checkoutErrors, phone: undefined }); }}
                  placeholder="Phone number *"
                  className={`w-full rounded-2xl border p-3 outline-none focus:ring-2 focus:ring-[#6f8a4f] ${checkoutErrors.phone ? "border-red-400" : "border-[#eadfd3]"}`}
                />
                {checkoutErrors.phone && <p className="mt-1 text-xs text-red-500">{checkoutErrors.phone}</p>}
              </div>
              <select value={customer.delivery} onChange={(e) => setCustomer({ ...customer, delivery: e.target.value })} className="w-full rounded-2xl border border-[#eadfd3] p-3 outline-none">
                <option>Pickup</option>
                <option>Delivery</option>
              </select>
              <select value={customer.payment} onChange={(e) => setCustomer({ ...customer, payment: e.target.value })} className="w-full rounded-2xl border border-[#eadfd3] p-3 outline-none">
                <option>Mock Payment</option>
                <option>Cash / QR on delivery</option>
                <option>Online banking</option>
              </select>
            </div>
            <div className="mt-5 space-y-1">
              <SummaryRow label="Items"    value={cart.length} />
              <SummaryRow label="Subtotal" value={`RM ${cartTotal.toFixed(2)}`} />
              <SummaryRow label="Shipping" value="Free" />
              <SummaryRow label="Total"    value={`RM ${cartTotal.toFixed(2)}`} strong />
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={placeOrder}
              disabled={placingOrder}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#6f8a4f] px-6 py-4 font-bold text-white shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {placingOrder
                ? <><Loader2 size={18} className="animate-spin" /> {DB_CONNECTED ? "Saving to Supabase…" : "Placing order…"}</>
                : <><CheckCircle size={18} /> Place Mock Order</>
              }
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── Order Tracking ── */}
      {orders.length > 0 && (
        <section id="tracking" className="mx-auto max-w-7xl px-6 pb-14">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#6f8a4f]">Tracking</p>
          <h3 className="mb-6 text-4xl font-extrabold">Latest Order</h3>
          <div className="rounded-[2rem] bg-[#dff7ef] p-6 text-[#208761] shadow-lg">
            <div className="mb-4 flex flex-wrap justify-between gap-2">
              <div>
                <p className="text-lg font-extrabold">{orders[0].tracking_id}</p>
                <p className="text-sm opacity-70">
                  {orders[0].customer_name} · {new Date(orders[0].created_at).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <span className="self-start rounded-full bg-[#208761] px-4 py-1 text-sm font-bold text-white">
                {orders[0].status}
              </span>
            </div>
            <div className="grid gap-2 md:grid-cols-4">
              {["Order received", "Preparing", "Ready", "Completed"].map((step, index) => (
                <div
                  key={step}
                  className={`flex items-center justify-center gap-1 rounded-full px-3 py-2 text-center text-xs font-bold ${
                    index === 0 ? "bg-[#208761] text-white" : "bg-white text-[#208761]"
                  }`}
                >
                  {index === 0 && <CheckCircle size={12} />}
                  {step}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Modal ── */}
      <AnimatePresence>
        {modalProduct && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setModalProduct(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-white p-6 text-[#3d2a22] shadow-2xl"
            >
              <div className="mb-2 flex justify-end">
                <button onClick={() => setModalProduct(null)} className="rounded-full bg-[#f4dfdf] p-2 hover:scale-105 transition-transform" aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <img src={modalProduct.image} alt={modalProduct.name} className="h-64 w-full rounded-[1.5rem] object-cover" />
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#dff7ef] px-3 py-1 text-xs font-bold text-[#208761]">{modalProduct.category}</span>
                {modalProduct.stock <= 3 && (
                  <span className="rounded-full bg-[#ffe3ea] px-3 py-1 text-xs font-bold text-[#e13f6f]">Only {modalProduct.stock} left</span>
                )}
              </div>
              <h3 className="mt-3 text-2xl font-extrabold">{modalProduct.name}</h3>
              <div className="mt-1 flex items-center gap-1 text-sm text-[#e1a43f]">
                <Star size={14} fill="currentColor" />
                <span className="font-semibold">{modalProduct.rating}</span>
                <span className="text-[#9a8a82]">({modalProduct.reviews} reviews)</span>
              </div>
              <p className="mt-3 text-[#7c6257]">{modalProduct.description}</p>
              <div className="mt-4 flex items-end gap-3">
                <p className="text-2xl font-extrabold text-[#e13f6f]">RM {modalProduct.price.toFixed(2)}</p>
                <p className="text-sm text-[#9a8a82] line-through">RM {modalProduct.originalPrice.toFixed(2)}</p>
              </div>
              <p className="mt-1 text-sm text-[#7c6257]">{modalProduct.shipping} · {modalProduct.promo}</p>
              <button
                onClick={() => {
                  setSelectedProduct(modalProduct);
                  setModalProduct(null);
                  setTimeout(() => document.getElementById("customizer")?.scrollIntoView({ behavior: "smooth" }), 100);
                }}
                className="mt-5 w-full rounded-full bg-[#3d2a22] py-3 font-bold text-white hover:opacity-90 transition-opacity"
              >
                Customize This Candle
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-[#eadfd3] px-6 py-8 text-center text-sm opacity-70">
        © 2026 Roh Candles. Handmade candles for decor, gifting, and soft moments.
      </footer>

      <ToastContainer toasts={toasts} />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Selector({ label, value, setValue, options, prices }) {
  return (
    <div>
      <label className="mb-2 block font-bold">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => setValue(option)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              value === option ? "scale-105 bg-[#3d2a22] text-white" : "bg-white text-[#3d2a22] hover:bg-[#f4dfdf]"
            }`}
          >
            {option}
            {prices?.[option] > 0 && <span className="ml-1 text-xs opacity-60">+RM{prices[option]}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between border-b border-[#eadfd3] py-2 last:border-0">
      <span className="text-sm text-[#7c6257]">{label}</span>
      <span className={strong ? "text-lg font-extrabold" : "text-sm font-semibold"}>{value}</span>
    </div>
  );
}

function DashboardCard({ icon, label, value, alert }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-6 text-[#3d2a22] shadow-lg">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${alert && value > 0 ? "bg-[#ffe3ea] text-[#e13f6f]" : "bg-[#f4dfdf] text-[#8a3d3d]"}`}>
        {icon}
      </div>
      <p className="text-sm text-[#7c6257]">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold ${alert && value > 0 ? "text-[#e13f6f]" : ""}`}>{value}</p>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="text-2xl font-extrabold text-[#6f8a4f]">{value}</p>
      <p className="text-xs opacity-60">{label}</p>
    </div>
  );
}
