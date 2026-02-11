import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { appApi } from "../services/appApi";
import { TopBar } from "../components/navigation/TopBar";
import "./OrderSummaryPage.css";

interface OrderItem {
  id: string;
  name: string;
  icon: string;
  quantity: number;
}

export const OrderSummaryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const category = (location.state as { category?: string })?.category || "";
  const items = (location.state as { items?: OrderItem[] })?.items || [];

  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<{ orderId: string; estimatedDelivery: string; totalAmount?: number } | null>(null);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const handleConfirm = async () => {
    setError(null);
    setIsPlacing(true);
    try {
      const result = await appApi.placeOrder(category, items.map((item) => ({ id: item.id, quantity: item.quantity })));
      setOrderDetails(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place order.");
    } finally {
      setIsPlacing(false);
    }
  };

  if (orderDetails) {
    return (
      <div className="order-summary-page">
        <TopBar title="Order placed" backTo="/home" />
        <div className="order-success">
          <div className="order-success-icon">✓</div>
          <h2 className="order-success-title">Order confirmed</h2>
          <p className="order-success-text">Order ID: <strong>{orderDetails.orderId}</strong></p>
          <p className="order-success-text">Estimated delivery: {orderDetails.estimatedDelivery}</p>
          {orderDetails.totalAmount ? <p className="order-success-text">Total: ${orderDetails.totalAmount.toFixed(2)}</p> : null}
          <button className="btn-primary" onClick={() => navigate("/home")}>Back to home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-summary-page">
      <TopBar title="Review order" backTo="/order/items" />
      <p className="page-subtitle">Review details before placing.</p>
      {error && <div className="status-message error">{error}</div>}

      <div className="order-summary-section">
        <h2 className="order-section-title">Category</h2>
        <p className="order-section-value">{category}</p>
      </div>

      <div className="order-summary-section">
        <h2 className="order-section-title">Items ({itemCount})</h2>
        <div className="order-items-summary">
          {items.map((item) => (
            <div key={item.id} className="order-item-summary">
              <span className="order-item-icon" aria-hidden="true">{item.icon}</span>
              <span className="order-item-name">{item.name}</span>
              <span className="order-item-quantity">x {item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="order-actions">
        <button className="btn-primary" onClick={handleConfirm} disabled={isPlacing || items.length === 0}>
          {isPlacing ? "Placing order..." : "Confirm and place order"}
        </button>
        <button className="btn-secondary" onClick={() => navigate("/order/items", { state: { category } })} disabled={isPlacing}>
          Edit items
        </button>
      </div>
    </div>
  );
};
