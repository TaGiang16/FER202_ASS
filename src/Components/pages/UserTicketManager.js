import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Table, Button, Form, InputGroup, Modal, Alert } from "react-bootstrap";
import { fetchData, updateData } from "../API/ApiService";
import "../../CSS/UserTicketManager.css";

const UserTicketManager = () => {
    const [tickets, setTickets] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTicketId, setDeleteTicketId] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const user = JSON.parse(sessionStorage.getItem("account")) || JSON.parse(localStorage.getItem("rememberedAccount"));

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const fetchUserTickets = async () => {
            try {
                const account = await fetchData(`accounts/${user.id}`);
                setTickets(account.tickets || []);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu vé:", error);
                setError("Không thể tải dữ liệu vé!");
            }
        };
        fetchUserTickets();
    }, [user, navigate]);

    const filterTickets = (ticket) => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
            ticket.id.toLowerCase().includes(lowerSearchTerm) ||
            ticket.movie.toLowerCase().includes(lowerSearchTerm) ||
            ticket.cinema.toLowerCase().includes(lowerSearchTerm) ||
            ticket.seats.toLowerCase().includes(lowerSearchTerm)
        );
    };

    const cancelTicket = async () => {
        try {
            const account = await fetchData(`accounts/${user.id}`);
            const updatedTickets = account.tickets.filter(ticket => ticket.id !== deleteTicketId);
            await updateData("accounts", user.id, { ...account, tickets: updatedTickets });
            setTickets(updatedTickets);
            setShowDeleteModal(false);
            setSuccess("Hủy vé thành công!");
            setError(null);
        } catch (error) {
            console.error("Lỗi khi hủy vé:", error);
            setError("Không thể hủy vé!");
            setSuccess(null);
        }
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    };

    return (
        <Container className="my-5">
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <h2>Vé Của Tôi</h2>
            <InputGroup className="mb-3">
                <InputGroup.Text>Tìm kiếm</InputGroup.Text>
                <Form.Control
                    placeholder="Tìm theo mã vé, phim, hoặc rạp"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </InputGroup>
            <Table striped bordered hover responsive>
                <thead className="table-dark">
                    <tr>
                        <th>Mã Vé</th>
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
                    {tickets.filter(filterTickets).map(ticket => (
                        <tr key={ticket.id}>
                            <td>{ticket.id}</td>
                            <td>{ticket.movie}</td>
                            <td>{ticket.cinema}</td>
                            <td>{ticket.seats.join(", ")}</td>
                            <td>{ticket.date}</td>
                            <td>{ticket.startTime} - {ticket.endTime}</td>
                            <td>{formatCurrency(ticket.totalPrice)}</td>
                            <td>
                                <span className={`badge ${ticket.status === "active" ? "bg-success" : "bg-danger"}`}>
                                    {ticket.status === "active" ? "Đã thanh toán" : "Chưa thanh toán"}
                                </span>
                            </td>
                            <td>
                                <Button
                                    variant="outline-danger"
                                    onClick={() => {
                                        setDeleteTicketId(ticket.id);
                                        setShowDeleteModal(true);
                                    }}
                                    disabled={ticket.status === "active"}
                                >
                                    Hủy Vé
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác Nhận Hủy Vé</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc chắn muốn hủy vé này không?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Đóng
                    </Button>
                    <Button variant="danger" onClick={cancelTicket}>
                        Hủy Vé
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default UserTicketManager;