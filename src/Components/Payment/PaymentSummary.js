import React from "react";
import "../../CSS/Booking.css";

const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [h, m] = String(timeString).split(":");
    return `${h?.padStart(2, "0")}:${m?.padStart(2, "0")}`;
};
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return String(dateString);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
};
const formatPrice = (price) =>
    price ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price) : "N/A";

export default function PaymentSummary({ movie, selectedSeats = [], totalPrice }) {
    const show = movie?.selectedShowtime || movie?.selected_showtime || {};
    return (
        <div className="payment-summary">
            <div className="summary-poster">
                <img src={movie?.poster} alt={movie?.title} style={{ width: "100%", borderRadius: 6 }} />
            </div>

            <div className="summary-details">
                <h3>{movie?.title}</h3>
                <p><strong>Rạp:</strong> {show.cinema_name || show.cinema_id || "N/A"}</p>
                <p><strong>Ngày:</strong> {formatDate(show.date)}</p>
                <p><strong>Giờ:</strong> {formatTime(show.start_time)} - {formatTime(show.end_time)}</p>
                <p><strong>Phòng:</strong> {show.screen_id || "N/A"}</p>
                <p><strong>Ghế:</strong> {selectedSeats.length ? selectedSeats.join(", ") : "Chưa chọn ghế"}</p>
                <p style={{ marginTop: 12, fontSize: 18 }}><strong>Tổng:</strong> {formatPrice(totalPrice)}</p>
            </div>
        </div>
    );
}