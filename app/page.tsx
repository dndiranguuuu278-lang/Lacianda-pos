"use client";

import React, { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: "1", name: "Tusker Lager 500ml", price: 220, category: "Beer" },
  { id: "2", name: "Heineken 500ml", price: 250, category: "Beer" },
  { id: "3", name: "Jameson 750ml", price: 2800, category: "Spirits" },
  { id: "4", name: "Johnnie Walker Black 750ml", price: 3500, category: "Spirits" },
  { id: "5", name: "Red Bull 250ml", price: 200, category: "Energy Drinks" },
  { id: "6", name: "Monster Energy 500ml", price: 230, category: "Energy Drinks" },
  { id: "7", name: "Minute Maid 500ml", price: 100, category: "Juice" },
  { id: "8", name: "Still Water 500ml", price: 50, category: "Water" },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const handleGoogleLogin = () => {
    setUser({ name: "Dennis Ndirangu", email: "dndiranguuu278@gmail.com" });
  };

  const handleLogout = () => {
    setUser(null);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleMpesaPay = () => {
    if (!phone) {
      alert("Please enter a valid M-Pesa phone number.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert(`M-Pesa STK push sent to 254${phone.replace(/^0/, "")} for KES ${total}`);
      setCart([]);
      setPhone("");
    }, 1500);
  };

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Main Catalog Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Lacianda Beverage POS</h1>
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  {user.name} ({user.email})
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-4 bg-white border-b border-gray-200 flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-sm rounded-full font-medium transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition text-left flex flex-col justify-between h-36"
            >
              <div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {p.category}
                </span>
                <h3 className="font-semibold text-gray-800 mt-2 text-sm">{p.name}</h3>
              </div>
              <p className="font-bold text-lg text-gray-900">KES {p.price.toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart & Checkout Panel */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <p className="text-gray-400 text-center py-12">Cart is empty</p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100"
              >
                <div>
                  <p className="font-medium text-sm text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    KES {item.price} x {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-6 h-6 bg-gray-200 text-gray-700 rounded font-bold hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-6 h-6 bg-gray-200 text-gray-700 rounded font-bold hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Form */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total:</span>
            <span>KES {total.toLocaleString()}</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">M-Pesa Phone Number</label>
            <input
              type="text"
              placeholder="0712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            onClick={handleMpesaPay}
            disabled={cart.length === 0 || isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition"
          >
            {isProcessing ? "Processing..." : "Pay with M-Pesa"}
          </button>
        </div>
      </div>
    </div>
  );
}