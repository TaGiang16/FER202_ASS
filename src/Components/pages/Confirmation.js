import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../CSS/Booking.css";

export default function Confirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { ticket, movie, selectedSeats, totalPrice } = location.state || {};

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const d = new Date(dateString);
        if (Number.isNaN(d.getTime())) return String(dateString);
        return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
    };

    const formatTime = (timeString) => {
        if (!timeString) return "N/A";
        const [h, m] = String(timeString).split(":");
        return `${h?.padStart(2, "0")}:${m?.padStart(2, "0")}`;
    };

    const formatPrice = (price) =>
        price ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price) : "N/A";

    if (!ticket && !movie) {
        return (
            <div className="confirmation-container" style={{ padding: 20 }}>
                <h3>Không tìm thấy thông tin vé</h3>
                <p>Vui lòng kiểm tra lại hoặc chuyển về trang đặt vé.</p>
                <div style={{ marginTop: 12 }}>
                    <button onClick={() => navigate("/")}>Về trang chủ</button>
                </div>
            </div>
        );
    }

    const show = movie?.selectedShowtime || movie?.selected_showtime || {};
    const ticketId = ticket?.ticketId || ticket?.id || ticket?.code || "—";

    return (
        <div className="confirmation-container" style={{ padding: 20 }}>
            <h2>Đặt vé thành công</h2>

            <div className="confirmation-card" style={{ display: "flex", gap: 20, marginTop: 16 }}>
                <div style={{ width: 160 }}>
                    <img src={movie?.poster} alt={movie?.title} style={{ width: "100%", borderRadius: 6 }} />
                </div>

                <div style={{ flex: 1 }}>
                    <h3>{movie?.title}</h3>
                    <p><strong>Mã vé:</strong> {ticketId}</p>
                    <p><strong>Rạp:</strong> {show.cinema_name || show.cinema_id || "N/A"}</p>
                    <p><strong>Ngày:</strong> {formatDate(show.date)}</p>
                    <p><strong>Giờ:</strong> {formatTime(show.start_time)} - {formatTime(show.end_time)}</p>
                    <p><strong>Ghế:</strong> {selectedSeats?.length ? selectedSeats.join(", ") : "N/A"}</p>
                    <p style={{ marginTop: 8, fontSize: 18 }}><strong>Tổng:</strong> {formatPrice(totalPrice)}</p>

                    <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                        <button style={{ flex: 1 }} onClick={() => window.print()}>In vé</button>
                        <button style={{ flex: 1 }} onClick={() => navigate("/")}>Về trang chủ</button>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 18, color: "#555" }}>
                <p>Một email xác nhận đã được gửi tới bạn (nếu có). Lưu mã vé để đối chiếu khi nhận vé.</p>
            </div>
        </div>
    );
}