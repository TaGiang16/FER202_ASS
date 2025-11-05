import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PaymentForm from "../Payment/PaymentForm";
import PaymentSummary from "../Payment/PaymentSummary";
import "../../CSS/Booking.css";

export default function Payment() {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentState, setPaymentState] = useState(() => location.state || null);

    useEffect(() => {
        if (!paymentState) {
            try {
                const stored = sessionStorage.getItem("paymentData");
                if (stored) setPaymentState(JSON.parse(stored));
            } catch (e) {
                console.warn("Failed to read paymentData from sessionStorage", e);
            }
        }
    }, [paymentState]);

    if (!paymentState || !paymentState.movie || !paymentState.selectedSeats) {
        return (
            <div style={{ padding: 20 }}>
                <p>Dữ liệu thanh toán không tồn tại. Vui lòng chọn ghế ở trang đặt vé.</p>
                <div style={{ marginTop: 12 }}>
                    <button onClick={() => navigate(-1)}>Quay lại</button>
                    <button style={{ marginLeft: 8 }} onClick={() => navigate("/")}>Về trang chủ</button>
                </div>
            </div>
        );
    }

    const { movie, showtimeId, selectedSeats, totalPrice } = paymentState;

    const handlePaymentSuccess = (result) => {
        try { sessionStorage.removeItem("paymentData"); } catch { }
        // Chuyển sang trang confirmation (nếu có). Nếu không có route, bạn có thể chỉnh về /tickets hoặc /
        navigate("/confirmation", { state: { ticket: result, movie, selectedSeats, totalPrice } });
    };

    return (
        <div className="payment-container">
            <h2>Thanh toán</h2>

            <div className="payment-columns" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                <div className="payment-left" style={{ flex: 1 }}>
                    <PaymentSummary
                        movie={movie}
                        showtimeId={showtimeId}
                        selectedSeats={selectedSeats}
                        totalPrice={totalPrice}
                    />
                </div>

                <div className="payment-right" style={{ width: 380 }}>
                    <PaymentForm
                        paymentPayload={paymentState}
                        totalPrice={totalPrice}
                        onSuccess={handlePaymentSuccess}
                    />
                </div>
            </div>
        </div>
    );
}