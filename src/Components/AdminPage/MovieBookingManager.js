import React, { useState, useEffect } from "react";
import { Table, Button, Form, InputGroup, Modal, Alert, Container } from "react-bootstrap";
import { fetchData, updateData, deleteData } from "../API/ApiService";
import "../../CSS/MovieBookingManager.css";

const MovieBookingManager = () => {
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteBookingId, setDeleteBookingId] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const loadBookings = async () => {
            try {
                const accounts = await fetchData("accounts");
                const allBookings = accounts.flatMap(account =>
                    (account.tickets || []).map(ticket => ({
                        ...ticket,
                        userId: account.id,
                        userName: account.full_name,
                        userEmail: account.email
                    }))
                );
                setBookings(allBookings);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu booking:", error);
                setError("Không thể tải dữ liệu booking!");
            }
        };
        loadBookings();
    }, []);

    const filterBookings = (booking) => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
            booking.id.toLowerCase().includes(lowerSearchTerm) ||
            booking.movie.toLowerCase().includes(lowerSearchTerm) ||
            booking.userEmail.toLowerCase().includes(lowerSearchTerm) ||
            booking.cinema.toLowerCase().includes(lowerSearchTerm)
        );
    };

    const togglePaymentStatus = async (userId, ticketId, currentStatus) => {
        try {
            const accounts = await fetchData("accounts");
            const updatedAccounts = accounts.map(account => {
                if (account.id === userId) {
                    return {
                        ...account,
                        tickets: account.tickets.map(ticket =>
                            ticket.id === ticketId
                                ? { ...ticket, status: currentStatus === "active" ? "inactive" : "active" }
                                : ticket
                        )
                    };
                }
                return account;
            });

            await updateData("accounts", userId, updatedAccounts.find(acc => acc.id === userId));
            setBookings(prev =>
                prev.map(booking =>
                    booking.id === ticketId && booking.userId === userId
                        ? { ...booking, status: currentStatus === "active" ? "inactive" : "active" }
                        : booking
                )
            );
            setSuccess("Cập nhật trạng thái thanh toán thành công!");
            setError(null);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            setError("Không thể cập nhật trạng thái!");
            setSuccess(null);
        }
    };

    const deleteBooking = async () => {
        try {
            const accounts = await fetchData("accounts");
            const userId = deleteBookingId.userId;
            const ticketId = deleteBookingId.ticketId;
            const updatedAccount = accounts.find(acc => acc.id === userId);
            updatedAccount.tickets = updatedAccount.tickets.filter(ticket => ticket.id !== ticketId);
            await updateData("accounts", userId, updatedAccount);
            setBookings(prev => prev.filter(booking => booking.id !== ticketId || booking.userId !== userId));
            setShowDeleteModal(false);
            setSuccess("Xóa booking thành công!");
            setError(null);
        } catch (error) {
            console.error("Lỗi khi xóa booking:", error);
            setError("Không thể xóa booking!");
            setSuccess(null);
        }
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    };

    return (
        <Container className="mt-4">
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <h2>Quản Lý Đặt Vé</h2>
            <InputGroup className="mb-3">
                <InputGroup.Text>Tìm kiếm</InputGroup.Text>
                <Form.Control
                    placeholder="Tìm theo mã vé, phim, hoặc email người dùng"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </InputGroup>
            <Table striped bordered hover responsive className="table-dark">
                <thead>
                    <tr>
                        <th>Mã Vé</th>
                        <th>Người Dùng</th>
                        <th>Email</th>
                        <th>Phim</th>
                        <th>Rạp</th>
                        <th>Ghế</th>
                        <th>Ngày</th>
                        <th>Giờ</th>
                        <th>Tổng Giá</th>
                        <th>Trạng Thái</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.filter(filterBookings).map(booking => (
                        <tr key={`${booking.userId}-${booking.id}`}>
                            <td>{booking.id}</td>
                            <td>{booking.userName}</td>
                            <td>{booking.userEmail}</td>
                            <td>{booking.movie}</td>
                            <td>{booking.cinema}</td>
                            <td>{booking.seats.join(", ")}</td>
                            <td>{booking.date}</td>
                            <td>{booking.startTime} - {booking.endTime}</td>
                            <td>{formatCurrency(booking.totalPrice)}</td>
                            <td>
                                <span className={`badge ${booking.status === "active" ? "bg-success" : "bg-danger"}`}>
                                    {booking.status === "active" ? "Đã thanh toán" : "Chưa thanh toán"}
                                </span>
                            </td>
                            <td>
                                <Button
                                    variant={booking.status === "active" ? "outline-danger" : "outline-success"}
                                    onClick={() => togglePaymentStatus(booking.userId, booking.id, booking.status)}
                                    className="me-2"
                                >
                                    Chuyển trạng thái
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    onClick={() => {
                                        setDeleteBookingId({ userId: booking.userId, ticketId: booking.id });
                                        setShowDeleteModal(true);
                                    }}
                                >
                                    Xóa
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác Nhận Xóa Booking</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc chắn muốn xóa booking này không?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={deleteBooking}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default MovieBookingManager;