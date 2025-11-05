import React, { useState, useEffect } from "react";

export default function PaymentForm({ paymentPayload = {}, totalPrice = 0, onSuccess }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [method, setMethod] = useState("cod"); // 'cod' or 'card'
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const userFromPayload = paymentPayload?.user || null;
        let user = userFromPayload;
        if (!user) {
            try {
                user = JSON.parse(sessionStorage.getItem("account")) || JSON.parse(localStorage.getItem("rememberedAccount")) || null;
            } catch {
                user = null;
            }
        }

        setFullName(user?.full_name || user?.name || "");
        setEmail(user?.email || "");
        setPhone(user?.phone || user?.sdt || user?.phoneNumber || "");
    }, [paymentPayload]);

    const sendConfirmationEmail = async ({ toEmail, movieTitle, userName, bookingTime, ticketId, cinema, seats, seatsCount, totalPrice, paymentMethod }) => {
        const isPaid = paymentMethod === "card";
        const subject = isPaid
            ? `Xác nhận thanh toán vé xem phim ${movieTitle}`
            : `Xác nhận đặt vé xem phim ${movieTitle}`;

        const text = `
Chào ${userName || "khách hàng"},

Bạn đã ${isPaid ? "thanh toán và đặt vé" : "đặt vé"} vào lúc ${bookingTime}.
Mã vé của bạn là: ${ticketId}
Rạp: ${cinema}
Ghế: ${seats.join(", ")}
Số ghế đã chọn: ${seatsCount}
Số tiền: ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}
Trạng thái thanh toán: ${isPaid ? "Đã thanh toán" : "Chưa thanh toán (Thanh toán khi nhận vé)"}

Cảm ơn bạn đã sử dụng dịch vụ.
        `;

        const html = `
<p>Chào <strong>${userName || "khách hàng"}</strong>,</p>
<p>Bạn đã ${isPaid ? "<strong>thanh toán và đặt vé</strong>" : "đặt vé"} vào lúc <strong>${bookingTime}</strong>.</p>
<ul>
  <li><strong>Mã vé:</strong> ${ticketId}</li>
  <li><strong>Rạp:</strong> ${cinema}</li>
  <li><strong>Ghế:</strong> ${seats.join(", ")}</li>
  <li><strong>Số ghế đã chọn:</strong> ${seatsCount}</li>
  <li><strong>Số tiền:</strong> ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}</li>
  <li><strong>Trạng thái thanh toán:</strong> ${isPaid ? "Đã thanh toán" : "Chưa thanh toán (Thanh toán khi nhận vé)"}</li>
</ul>
<p>Cảm ơn bạn đã sử dụng dịch vụ.</p>
`;

        try {
            await fetch("http://localhost:5000/api/send-confirmation-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: toEmail,
                    subject,
                    text,
                    html
                })
            });
        } catch (err) {
            console.warn("Failed to send confirmation email:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);

        const seats = paymentPayload?.selectedSeats || [];
        const seatsCount = seats.length;
        const movieTitle = paymentPayload?.movie?.title || "";
        const cinema = paymentPayload?.movie?.selectedShowtime?.cinema_name || paymentPayload?.movie?.selectedShowtime?.cinema_id || "";
        const bookingTime = new Date().toLocaleString("vi-VN", { hour12: false });
        const showtimeId = paymentPayload?.showtimeId;

        const bookingData = {
            userEmail: email,
            fullName: fullName || "Khách",
            phone,
            cinema,
            movie: movieTitle,
            duration: paymentPayload?.movie?.duration || "",
            screen: paymentPayload?.movie?.selectedShowtime?.screen_id || "",
            seats,
            seatsCount,
            date: paymentPayload?.movie?.selectedShowtime?.date || "",
            startTime: paymentPayload?.movie?.selectedShowtime?.start_time || "",
            endTime: paymentPayload?.movie?.selectedShowtime?.end_time || "",
            totalPrice: totalPrice || 0,
            paymentMethod: method,
            showtimeId // include for later event
        };

        try {
            // 1) send booking to backend
            const resp = await fetch("http://localhost:5000/api/confirm-booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData),
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(text || resp.statusText);
            }
            const result = await resp.json();
            
            // Dispatch event để update ghế đã bán
            window.dispatchEvent(new CustomEvent('seats-updated', {
                detail: {
                    showtimeId: paymentPayload.showtimeId,
                    seats: bookingData.seats
                }
            }));

            const ticketId = result?.ticketId || result?.id || `${Date.now()}`;

            // 2) update account tickets on server (optional, keep existing logic)
            try {
                const stored = sessionStorage.getItem("account") || localStorage.getItem("rememberedAccount");
                const acct = stored ? JSON.parse(stored) : null;
                if (acct && acct.id) {
                    const accResp = await fetch(`http://localhost:5000/accounts/${acct.id}`);
                    if (accResp.ok) {
                        const accData = await accResp.json();
                        const existingTickets = Array.isArray(accData.tickets) ? accData.tickets : [];
                        const newTicket = {
                            id: ticketId,
                            movie: bookingData.movie,
                            cinema: bookingData.cinema,
                            seats: bookingData.seats,
                            date: bookingData.date,
                            startTime: bookingData.startTime,
                            endTime: bookingData.endTime,
                            totalPrice: bookingData.totalPrice,
                            screen: bookingData.screen,
                            status: method === "card" ? "active" : "inactive"
                        };
                        const updatedTickets = [...existingTickets, newTicket];
                        await fetch(`http://localhost:5000/accounts/${acct.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ tickets: updatedTickets })
                        });
                        try {
                            const newAcc = { ...accData, tickets: updatedTickets };
                            if (sessionStorage.getItem("account")) sessionStorage.setItem("account", JSON.stringify(newAcc));
                            if (localStorage.getItem("rememberedAccount")) localStorage.setItem("rememberedAccount", JSON.stringify(newAcc));
                        } catch {}
                    }
                }
            } catch (err) {
                console.warn("Failed to update account tickets:", err);
            }

            // 3) dispatch client event so Booking component can mark seats reserved immediately
            try {
                if (typeof window !== "undefined" && Array.isArray(seats) && seats.length > 0) {
                    window.dispatchEvent(new CustomEvent("seats-updated", {
                        detail: { showtimeId: showtimeId, seats: seats }
                    }));
                }
            } catch (err) {
                console.warn("Failed to dispatch seats-updated event:", err);
            }

            // 4) send confirmation email
            const toEmail = bookingData.userEmail || email;
            if (toEmail) {
                await sendConfirmationEmail({
                    toEmail,
                    movieTitle,
                    userName: bookingData.fullName,
                    bookingTime,
                    ticketId,
                    cinema,
                    seats,
                    seatsCount,
                    totalPrice: bookingData.totalPrice,
                    paymentMethod: bookingData.paymentMethod
                });
            }

            try { sessionStorage.removeItem("paymentData"); } catch {}
            if (onSuccess) onSuccess(result);
        } catch (err) {
            console.error("Payment error:", err);
            alert("Thanh toán thất bại. Vui lòng thử lại.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <form className="payment-form" onSubmit={handleSubmit}>
            <h4>Thông tin người mua</h4>

            <label>Họ và tên</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />

            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label>Số điện thoại</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />

            <h4>Phương thức thanh toán</h4>
            <div>
                <label>
                    <input type="radio" name="method" value="cod" checked={method === "cod"} onChange={() => setMethod("cod")} />
                    Thanh toán khi nhận vé
                </label>
            </div>
            <div>
                <label>
                    <input type="radio" name="method" value="card" checked={method === "card"} onChange={() => setMethod("card")} />
                    Thẻ (mô phỏng)
                </label>
            </div>

            <div style={{ marginTop: 12 }}>
                <button type="submit" disabled={isSending}>
                    {isSending ? "Đang xử lý..." : `Thanh toán ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice || 0)}`}
                </button>
            </div>
        </form>
    );
}