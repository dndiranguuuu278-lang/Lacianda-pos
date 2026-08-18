"use client";

import React, { useState } from "react";

interface Item {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends Item {
  quantity: number;
}

const ITEMS: Item[] = [
  { id: 1, name: "Heineken 500ml", price: 250, category: "Beer" },
  { id: 2, name: "Tusker Lager 500ml", price: 220, category: "Beer" },
  { id: 3, name: "Jameson 750ml", price: 2800, category: "Spirits" },
  { id: 4, name: "Johnnie Walker Black 750ml", price: 3500, category: "Spirits" },
  { id: 5, name: "Red Bull 250ml", price: 200, category: "Energy" },
  { id: 6, name: "Still Water 500ml", price: 50, category: "Water" },
];

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: Item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Product Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Lacianda POS</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition text-left flex flex-col justify-between h-32 border border-gray-200"
            >
              <div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {item.category}
                </span>
                <h3 className="font-medium text-gray-800 mt-2">{item.name}</h3>
              </div>
              <p className="font-bold text-gray-900">KES {item.price}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Cart is empty</p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded"
              >
                <div>
                  <p className="font-medium text-sm text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} x KES {item.price}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm">
                    KES {item.price * item.quantity}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 font-bold text-sm px-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between text-lg font-bold mb-4">
            <span>Total:</span>
            <span>KES {total}</span>
          </div>
          <button
            onClick={() => alert("Order submitted!")}
            disabled={cart.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition"
          >
            Complete Sale
          </button>
        </div>
      </div>
    </div>
  );
}