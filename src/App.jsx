import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Sparkles,
  Heart,
  Leaf,
  Gift,
  Flame,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";

const products = [
  {
    id: 1,
    name: "Strawbae Candle Handmade",
    price: 25.99,
    originalPrice: 29.99,
    promo: "Buy 2 get 5% off",
    shipping: "Free shipping",
    sold: "4 sold",
    tag: "Best Seller",
    image: "/images/strawbae.png.png",
    description:
      "A strawberry dessert-style handmade candle with a soft romantic look, perfect for room decor and gifts.",
  },
  {
    id: 2,
    name: "Large Strawberry Candle Handmade",
    price: 35.99,
    originalPrice: 39.99,
    promo: "RM4 off",
    shipping: "Free shipping",
    sold: "",
    tag: "Large Size",
    image: "/images/large-strawberry.png.png",
    description:
      "A larger strawberry-inspired candle designed as a sweet gift piece and aesthetic table decor.",
  },
  {
    id: 3,
    name: "Roh Matcha Candle M",
    price: 22.49,
    originalPrice: 24.99,
    promo: "10% off",
    shipping: "Free shipping",
    sold: "1 sold",
    tag: "Matcha",
    image: "/images/matcha.png.png",
    description:
      "A matcha-inspired handmade candle with fresh green tones and a calm cafe-style aesthetic.",
  },
  {
    id: 4,
    name: "Roh Milo Candle",
    price: 22.49,
    originalPrice: 24.99,
    promo: "10% off",
    shipping: "Free shipping",
    sold: "",
    tag: "Cozy",
    image: "/images/milo.png.png",
    description:
      "A cozy Milo-inspired handmade candle made for warm, soft, comforting room decor.",
  },
];

const scentPrices = {
  Strawberry: 0,
  Vanilla: 2,
  Matcha: 3,
  Rose: 3,
};

const sizePrices = {
  Small: 0,
  Medium: 8,
  Large: 15,
};

const packagingPrices = {
  Standard: 0,
  "Gift Box": 10,
  "Premium Ribbon": 6,
};

export default function RohCandlesWebsite() {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [scent, setScent] = useState("Strawberry");
  const [size, setSize] = useState("Medium");
  const [packaging, setPackaging] = useState("Standard");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [cart, setCart] = useState([]);

  const customPrice = useMemo(() => {
    return Number(
      (
        selectedProduct.price +
        scentPrices[scent] +
        sizePrices[size] +
        packagingPrices[packaging]
      ).toFixed(2)
    );
  }, [selectedProduct, scent, size, packaging]);

  const total = Number((customPrice * quantity).toFixed(2));

  const addToCart = () => {
    const order = {
      id: Date.now(),
      product: selectedProduct.name,
      image: selectedProduct.image,
      scent,
      size,
      packaging,
      quantity,
      note,
      price: total,
    };

    const updatedCart = [...cart, order];
    setCart(updatedCart);

    localStorage.setItem(
      "rohCandlesCart",
      JSON.stringify(updatedCart)
    );

    setNote("");
  };

  const removeFromCart = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);

    setCart(updatedCart);

    localStorage.setItem(
      "rohCandlesCart",
      JSON.stringify(updatedCart)
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price,
    0
  );

  return (
    <div className="min-h-screen bg-[#fffaf3] text-[#3d2a22]">

      {/* NAVBAR */}

      <header className="sticky top-0 z-50 border-b border-[#eadfd3] bg-[#fffaf3]/90 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6f8a4f] text-white">
              <Flame size={20} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-wide">
                Roh Candles
              </h1>

              <p className="text-xs text-[#8b6f61]">
                Handmade dessert-inspired candles
              </p>
            </div>
          </div>

          <div className="hidden gap-6 text-sm font-medium md:flex">
            <a href="#shop">Shop</a>
            <a href="#customizer">Customize</a>
            <a href="#care">Candle Care</a>
            <a href="#cart">Cart</a>
          </div>

          <a
            href="#cart"
            className="flex items-center gap-2 rounded-full bg-[#f4dfdf] px-4 py-2 text-sm font-semibold transition hover:scale-105"
          >
            <ShoppingBag size={16} />
            {cart.length}
          </a>
        </nav>
      </header>

      {/* HERO */}

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >

          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#f4dfdf] px-4 py-2 text-sm font-semibold text-[#8a3d3d]">
            <Sparkles size={16} />
            Custom handmade candles
          </p>

          <h2 className="text-5xl font-extrabold leading-tight md:text-6xl">
            Candles that look like desserts,
            gifts, and soft moments.
          </h2>

          <p className="mt-5 max-w-xl text-lg text-[#7c6257]">
            Roh Candles helps customers browse,
            customize, and order aesthetic handmade
            candles without confusing DM back-and-forth.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <a
              href="#shop"
              className="rounded-full bg-[#3d2a22] px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
            >
              Shop Candles
            </a>

            <a
              href="#customizer"
              className="rounded-full border border-[#3d2a22] px-6 py-3 font-semibold transition hover:bg-[#3d2a22] hover:text-white"
            >
              Build Your Candle
            </a>

          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >

          <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-[#f4dfdf] blur-2xl" />

          <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-[#cbd6b3] blur-2xl" />

          <div className="relative rounded-[2rem] bg-white p-4 shadow-2xl">

            <img
              src="/images/hero-strawberry.png"
              alt="Hero Candle"
              className="h-[430px] w-full rounded-[1.5rem] object-cover"
            />

          </div>
        </motion.div>
      </section>

      {/* PRODUCTS */}

      <section
        id="shop"
        className="mx-auto max-w-7xl px-6 py-14"
      >

        <div className="mb-8 flex items-end justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#6f8a4f]">
              Shop
            </p>

            <h3 className="text-4xl font-extrabold">
              Featured Candles
            </h3>
          </div>

          <Heart className="text-[#b44b4b]" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">

          {products.map((product) => (

            <motion.button
              whileHover={{ y: -6 }}
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className={`overflow-hidden rounded-[1.5rem] bg-white text-left shadow-lg transition ${
                selectedProduct.id === product.id
                  ? "ring-4 ring-[#6f8a4f]"
                  : ""
              }`}
            >

              <div className="relative">

                <img
                  src={product.image}
                  alt={product.name}
                  className="h-72 w-full object-cover"
                />

                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#6f8a4f]">
                  {product.tag}
                </span>
              </div>

              <div className="p-5">

                <h4 className="text-xl font-bold">
                  {product.name}
                </h4>

                <p className="mt-2 text-sm text-[#7c6257]">
                  {product.description}
                </p>

                <div className="mt-4 flex items-end gap-2">

                  <p className="text-lg font-extrabold text-[#e13f6f]">
                    RM {product.price.toFixed(2)}
                  </p>

                  <p className="text-xs text-[#9a8a82] line-through">
                    RM{product.originalPrice.toFixed(2)}
                  </p>

                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">

                  <span className="rounded bg-[#dff7ef] px-2 py-1 text-[#208761]">
                    {product.shipping}
                  </span>

                  <span className="rounded bg-[#ffe3ea] px-2 py-1 text-[#e13f6f]">
                    {product.promo}
                  </span>

                  {product.sold && (
                    <span className="text-[#8b6f61]">
                      {product.sold}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* CUSTOMIZER */}

      <section
        id="customizer"
        className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-2"
      >

        <div className="rounded-[2rem] bg-[#efe7d8] p-8 shadow-lg">

          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#6f8a4f]">
            Customizer
          </p>

          <h3 className="text-4xl font-extrabold">
            Build Your Own Candle
          </h3>

          <div className="mt-8 space-y-6">

            <Selector
              label="Scent"
              value={scent}
              setValue={setScent}
              options={Object.keys(scentPrices)}
            />

            <Selector
              label="Size"
              value={size}
              setValue={setSize}
              options={Object.keys(sizePrices)}
            />

            <Selector
              label="Packaging"
              value={packaging}
              setValue={setPackaging}
              options={Object.keys(packagingPrices)}
            />

            <div>

              <label className="mb-2 block font-bold">
                Gift Note
              </label>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-24 w-full rounded-2xl border border-[#d8c9b8] bg-white p-4 outline-none"
              />
            </div>

            <div>

              <label className="mb-2 block font-bold">
                Quantity
              </label>

              <div className="flex w-fit items-center gap-4 rounded-full bg-white px-4 py-3 shadow-sm">

                <button
                  onClick={() =>
                    setQuantity(Math.max(1, quantity - 1))
                  }
                  className="rounded-full bg-[#f4dfdf] p-2"
                >
                  <Minus size={16} />
                </button>

                <span className="text-lg font-bold">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity(quantity + 1)
                  }
                  className="rounded-full bg-[#cbd6b3] p-2"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={addToCart}
              className="w-full rounded-full bg-[#3d2a22] px-6 py-4 font-bold text-white shadow-lg"
            >
              Add to Cart — RM {total.toFixed(2)}
            </button>
          </div>
        </div>

        {/* PREVIEW */}

        <div className="rounded-[2rem] bg-white p-6 shadow-xl">

          <img
            src={selectedProduct.image}
            alt={selectedProduct.name}
            className="h-80 w-full rounded-[1.5rem] object-cover"
          />

          <div className="mt-6 rounded-[1.5rem] bg-[#fffaf3] p-5">

            <h4 className="text-2xl font-extrabold">
              {selectedProduct.name}
            </h4>

            <div className="mt-4 grid gap-3 text-sm">

              <SummaryRow label="Scent" value={scent} />
              <SummaryRow label="Size" value={size} />
              <SummaryRow label="Packaging" value={packaging} />
              <SummaryRow label="Quantity" value={quantity} />
              <SummaryRow
                label="Total"
                value={`RM ${total.toFixed(2)}`}
                strong
              />

            </div>
          </div>
        </div>
      </section>

      {/* CART */}

      <section
        id="cart"
        className="mx-auto max-w-7xl px-6 py-14"
      >

        <div className="mb-8 flex items-center gap-3">
          <Gift className="text-[#b44b4b]" />
          <h3 className="text-4xl font-extrabold">
            Order Summary
          </h3>
        </div>

        {cart.length === 0 ? (

          <div className="rounded-[2rem] bg-white p-10 text-center shadow-lg">

            <p className="text-lg font-semibold">
              Your cart is empty.
            </p>

          </div>

        ) : (

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

            <div className="space-y-4">

              {cart.map((item) => (

                <div
                  key={item.id}
                  className="flex gap-4 rounded-[1.5rem] bg-white p-4 shadow-lg"
                >

                  <img
                    src={item.image}
                    alt={item.product}
                    className="h-28 w-28 rounded-2xl object-cover"
                  />

                  <div className="flex-1">

                    <h4 className="font-extrabold">
                      {item.product}
                    </h4>

                    <p className="mt-1 text-sm text-[#7c6257]">
                      {item.size} • {item.scent} •{" "}
                      {item.packaging}
                    </p>

                    <p className="mt-1 text-sm">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">

                    <p className="font-extrabold">
                      RM {item.price.toFixed(2)}
                    </p>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="mt-4 rounded-full bg-[#f4dfdf] p-2 text-[#8a3d3d]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-fit rounded-[2rem] bg-white p-6 shadow-xl">

              <h4 className="text-2xl font-extrabold">
                Checkout Preview
              </h4>

              <SummaryRow
                label="Items"
                value={cart.length}
              />

              <SummaryRow
                label="Total"
                value={`RM ${cartTotal.toFixed(2)}`}
                strong
              />

              <button
               onClick={() => {
                alert("Order placed successfully! Thank you for ordering from Roh Candles.");
                setCart([]);
                localStorage.removeItem("rohCandlesCart");
               }}
              className="mt-6 w-full rounded-full bg-[#6f8a4f] px-6 py-4 font-bold text-white shadow-lg transition hover:scale-105"
            >
              Place Mock Order
             </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Selector({
  label,
  value,
  setValue,
  options,
}) {
  return (
    <div>

      <label className="mb-2 block font-bold">
        {label}
      </label>

      <div className="flex flex-wrap gap-2">

        {options.map((option) => (

          <button
            key={option}
            onClick={() => setValue(option)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              value === option
                ? "bg-[#3d2a22] text-white"
                : "bg-white text-[#3d2a22]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#eadfd3] py-2 last:border-b-0">

      <span className="text-[#7c6257]">
        {label}
      </span>

      <span
        className={
          strong
            ? "text-lg font-extrabold"
            : "font-semibold"
        }
      >
        {value}
      </span>
    </div>
  );
}