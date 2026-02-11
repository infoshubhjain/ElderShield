import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { appApi } from "../services/appApi";
import { TopBar } from "../components/navigation/TopBar";
import "./OrderItemsPage.css";

interface Item {
  id: string;
  name: string;
  icon: string;
}

interface OrderItem extends Item {
  quantity: number;
}

export const OrderItemsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const category = (location.state as { category?: string })?.category || "GROCERIES";

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    appApi
      .getFrequentItems(category)
      .then((items) => setOrderItems(items.map((item) => ({ ...item, quantity: 0 }))))
      .catch(() => setOrderItems([]))
      .finally(() => setIsLoading(false));
  }, [category]);

  const updateQuantity = (itemId: string, delta: number) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
      )
    );
  };

  const selectedItems = orderItems.filter((item) => item.quantity > 0);

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading" aria-label="Loading items"></div>
        <p>Loading items...</p>
      </div>
    );
  }

  return (
    <div className="order-items-page">
      <TopBar title="Select items" backTo="/order" />
      <p className="page-subtitle">Choose essentials and quantity.</p>

      <div className="items-list">
        {orderItems.map((item) => (
          <div key={item.id} className="item-row">
            <div className="item-info">
              <span className="item-icon" aria-hidden="true">{item.icon}</span>
              <span className="item-name">{item.name}</span>
            </div>
            <div className="quantity-selector">
              <button className="quantity-button" onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity === 0}>−</button>
              <span className="quantity-display">{item.quantity}</span>
              <button className="quantity-button" onClick={() => updateQuantity(item.id, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      {selectedItems.length > 0 && (
        <div className="order-continue">
          <p className="order-summary-text">{selectedItems.length} items selected</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/order/summary", { state: { category, items: selectedItems } })}
          >
            Continue to summary
          </button>
        </div>
      )}
    </div>
  );
};
