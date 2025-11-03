import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Modal, Alert, InputGroup } from "react-bootstrap";
import { fetchData, updateData } from "../API/ApiService";
import "../../CSS/PriceDetail.css";

const PriceDetail = () => {
    const [movies, setMovies] = useState([]);
    const [ticketPricing, setTicketPricing] = useState([]);
    const [selectedMovieId, setSelectedMovieId] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [cinemas, setCinemas] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingShowtime, setEditingShowtime] = useState(null);
    const [newPrice, setNewPrice] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Lấy user từ session/localStorage
    const sessionUser = JSON.parse(sessionStorage.getItem("account"));
    const localUser = JSON.parse(localStorage.getItem("rememberedAccount"));
    const user = sessionUser || localUser;
    const isAdmin = user?.role === "1";

    useEffect(() => {
        const fetchDataAsync = async () => {
            try {
                const [moviesData, pricingData, cinemaData] = await Promise.all([
                    fetchData("movies"),
                    fetchData("ticketPricing"),
                    fetchData("cinema")
                ]);
                setMovies(moviesData);
                setTicketPricing(pricingData);
                setCinemas(cinemaData);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                setError("Không thể tải dữ liệu. Vui lòng thử lại!");
            }
        };
        fetchDataAsync();
    }, []);

    const getUniqueDates = (showtimes) => {
        return [...new Set(showtimes.map(st => st.date))].sort();
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    };

    const filteredShowtimes = selectedMovieId
        ? movies
            .find(movie => movie.id === selectedMovieId)
            ?.showtimes.filter(st => !selectedDate || st.date === selectedDate)
        : [];

    // Xử lý mở modal chỉnh sửa
    const handleEditPrice = (showtime) => {
        setEditingShowtime(showtime);
        setNewPrice(showtime.price);
        setShowEditModal(true);
        setError("");
        setSuccess("");
    };

    // Xử lý lưu giá mới
    const handleSavePrice = async () => {
        if (!newPrice || newPrice <= 0) {
            setError("Giá vé phải lớn hơn 0!");
            return;
        }

        try {
            const movie = movies.find(m => m.id === selectedMovieId);
            const showtime = movie.showtimes.find(st => st.id === editingShowtime.id);
            const oldPrice = showtime.price;

            const updatedShowtimes = movie.showtimes.map(st =>
                st.id === editingShowtime.id ? { ...st, price: parseInt(newPrice) } : st
            );

            await updateData("movies", selectedMovieId, { ...movie, showtimes: updatedShowtimes });

            // Gọi log từ global
            if (window.logPriceChange) {
                window.logPriceChange(
                    selectedMovieId,
                    editingShowtime.id,
                    oldPrice,
                    parseInt(newPrice),
                    `Cập nhật từ ${formatCurrency(oldPrice)} → ${formatCurrency(newPrice)}`
                );
            }

            setMovies(prev => prev.map(m =>
                m.id === selectedMovieId ? { ...m, showtimes: updatedShowtimes } : m
            ));

            setSuccess("Cập nhật giá vé thành công!");
            setShowEditModal(false);
            setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
            console.error("Lỗi khi cập nhật giá:", error);
            setError("Không thể cập nhật giá vé. Vui lòng thử lại!");
        }
    };

    return (
        <Container className="my-5">
            {/* Thông báo */}
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <h2>Chi Tiết Giá Vé</h2>

            {/* Bộ lọc */}
            <Row className="mb-4">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Chọn phim</Form.Label>
                        <Form.Select value={selectedMovieId} onChange={(e) => setSelectedMovieId(e.target.value)}>
                            <option value="">-- Chọn phim --</option>
                            {movies.map(movie => (
                                <option key={movie.id} value={movie.id}>{movie.title}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Chọn ngày chiếu</Form.Label>
                        <Form.Select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            disabled={!selectedMovieId}
                        >
                            <option value="">-- Chọn ngày --</option>
                            {selectedMovieId &&
                                getUniqueDates(movies.find(m => m.id === selectedMovieId)?.showtimes || []).map(date => (
                                    <option key={date} value={date}>{date}</option>
                                ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            {/* Danh sách suất chiếu */}
            <Row>
                <Col>
                    <Card className="shadow-lg">
                        <Card.Body>
                            <Card.Title>Giá Vé Theo Suất Chiếu</Card.Title>
                            {selectedMovieId && filteredShowtimes.length > 0 ? (
                                filteredShowtimes.map(showtime => (
                                    <Card key={showtime.id} className="mb-3 position-relative">
                                        <Card.Body>
                                            <Row>
                                                <Col md={8}>
                                                    <Card.Title>
                                                        {movies.find(m => m.id === selectedMovieId)?.title}
                                                    </Card.Title>
                                                    <Card.Text>
                                                        <strong>Rạp:</strong> {cinemas.find(c => c.id === showtime.cinema_id)?.name || "N/A"}<br />
                                                        <strong>Ngày:</strong> {showtime.date}<br />
                                                        <strong>Giờ:</strong> {showtime.start_time} - {showtime.end_time}<br />
                                                        <strong>Giá vé:</strong> <span className="text-primary fw-bold">{formatCurrency(showtime.price)}</span>
                                                    </Card.Text>
                                                </Col>
                                                {isAdmin && (
                                                    <Col md={4} className="d-flex align-items-center justify-content-end">
                                                        <Button
                                                            variant="outline-warning"
                                                            size="sm"
                                                            onClick={() => handleEditPrice(showtime)}
                                                        >
                                                            Chỉnh sửa giá
                                                        </Button>
                                                    </Col>
                                                )}
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                ))
                            ) : (
                                <p>Chọn phim và ngày để xem giá vé.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Giá vé cơ bản (luôn hiển thị) */}
            <Row className="mt-4">
                <Col>
                    <Card className="shadow-lg">
                        <Card.Body>
                            <Card.Title>Giá Vé Cơ Bản</Card.Title>
                            {ticketPricing.map(ticket => (
                                <Card key={ticket.id} className="mb-3">
                                    <Card.Body>
                                        <Card.Title>{ticket.type}</Card.Title>
                                        <Card.Text>
                                            <strong>Giá:</strong> {formatCurrency(ticket.price)}<br />
                                            <strong>Quy định:</strong>
                                            <ul className="mt-2">
                                                {ticket.rules.map((rule, index) => (
                                                    <li key={index}>{rule}</li>
                                                ))}
                                            </ul>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal chỉnh sửa giá (chỉ admin) */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh Sửa Giá Vé</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Giá mới (VNĐ)</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="number"
                                min="1"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                placeholder="Nhập giá mới"
                                isInvalid={newPrice <= 0}
                            />
                            <Form.Control.Feedback type="invalid">
                                Giá vé phải lớn hơn 0!
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSavePrice} disabled={!newPrice || newPrice <= 0}>
                        Lưu
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default PriceDetail;