import React, { useState, useEffect } from "react";
import { Container, Table, Form, InputGroup, Alert, Badge, Row, Col } from "react-bootstrap";
import { fetchData, postData } from "../API/ApiService";
import "../../CSS/PriceHistoryManager.css";

const PriceHistoryManager = () => {
    const [history, setHistory] = useState([]);
    const [movies, setMovies] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMovie, setSelectedMovie] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Lấy user hiện tại
    const user = JSON.parse(sessionStorage.getItem("account")) || JSON.parse(localStorage.getItem("rememberedAccount"));

    useEffect(() => {
        const loadData = async () => {
            try {
                const [historyData, moviesData] = await Promise.all([
                    fetchData("priceHistory"),
                    fetchData("movies")
                ]);
                setHistory(historyData || []);
                setMovies(moviesData);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi tải lịch sử giá:", err);
                setError("Không thể tải dữ liệu lịch sử giá vé.");
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Hàm lưu lịch sử khi thay đổi giá (gọi từ PriceDetail.js)
    const logPriceChange = async (movieId, showtimeId, oldPrice, newPrice, reason = "") => {
        const changeLog = {
            id: `ph${Date.now()}`,
            movieId,
            showtimeId,
            oldPrice,
            newPrice,
            changedBy: user.id,
            changedAt: new Date().toISOString(),
            reason: reason || "Cập nhật giá"
        };

        try {
            await postData("priceHistory", changeLog);
            setHistory(prev => [changeLog, ...prev]);
        } catch (err) {
            console.error("Lỗi ghi log giá:", err);
        }
    };

    // Expose hàm log để dùng ở component khác
    useEffect(() => {
        window.logPriceChange = logPriceChange;
    }, [user]);

    const getMovieTitle = (movieId) => {
        return movies.find(m => m.id === movieId)?.title || "Không xác định";
    };

    const getShowtimeInfo = (movieId, showtimeId) => {
        const movie = movies.find(m => m.id === movieId);
        const showtime = movie?.showtimes.find(st => st.id === showtimeId);
        if (!showtime) return "N/A";
        return `${showtime.date} | ${showtime.start_time} - ${showtime.end_time}`;
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleString("vi-VN");
    };

    const filteredHistory = history
        .filter(item => !selectedMovie || item.movieId === selectedMovie)
        .filter(item => {
            const term = searchTerm.toLowerCase();
            return (
                getMovieTitle(item.movieId).toLowerCase().includes(term) ||
                item.showtimeId.includes(term) ||
                item.reason.toLowerCase().includes(term)
            );
        });

    if (loading) return <Container className="my-5 text-center">Đang tải lịch sử...</Container>;

    return (
        <Container className="my-5">
            <h2 className="mb-4">Lịch Sử Thay Đổi Giá Vé</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Lọc theo phim</Form.Label>
                        <Form.Select value={selectedMovie} onChange={(e) => setSelectedMovie(e.target.value)}>
                            <option value="">-- Tất cả phim --</option>
                            {movies.map(movie => (
                                <option key={movie.id} value={movie.id}>{movie.title}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Tìm kiếm</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>Tìm</InputGroup.Text>
                            <Form.Control
                                placeholder="Tìm phim, suất chiếu, lý do..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Form.Group>
                </Col>
            </Row>

            <Table striped bordered hover responsive className="table-dark">
                <thead>
                    <tr>
                        <th>Thời gian</th>
                        <th>Phim</th>
                        <th>Suất chiếu</th>
                        <th>Giá cũ → Giá mới</th>
                        <th>Thay đổi</th>
                        <th>Lý do</th>
                        <th>Người thay đổi</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredHistory.length > 0 ? (
                        filteredHistory.map(log => (
                            <tr key={log.id}>
                                <td>{formatDate(log.changedAt)}</td>
                                <td>{getMovieTitle(log.movieId)}</td>
                                <td>{getShowtimeInfo(log.movieId, log.showtimeId)}</td>
                                <td>
                                    <del className="text-danger">{formatCurrency(log.oldPrice)}</del>
                                    <span className="mx-2">→</span>
                                    <strong className="text-success">{formatCurrency(log.newPrice)}</strong>
                                </td>
                                <td>
                                    <Badge bg={log.newPrice > log.oldPrice ? "danger" : "success"}>
                                        {log.newPrice > log.oldPrice ? "+" : ""}
                                        {((log.newPrice - log.oldPrice) / log.oldPrice * 100).toFixed(1)}%
                                    </Badge>
                                </td>
                                <td>{log.reason}</td>
                                <td>{user?.id === log.changedBy ? "Bạn" : log.changedBy}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center">Chưa có lịch sử thay đổi giá.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default PriceHistoryManager;