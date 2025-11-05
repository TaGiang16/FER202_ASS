import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { fetchData } from "../API/ApiService";
import { MdChair } from "react-icons/md";
import { Modal, Button } from "react-bootstrap";
import "../../CSS/Booking.css";
import { useNavigate } from "react-router-dom";
function Booking() {
  const { id: movieId } = useParams();
  const location = useLocation();
  const showtimeId = location.state?.showtimeId;
  const [movieData, setMovieData] = useState(null);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [screen, setScreen] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const sessionUser = JSON.parse(sessionStorage.getItem("account"));
  const localUser = JSON.parse(localStorage.getItem("rememberedAccount"));
  const user = sessionUser || localUser;
  const [isSending, setIsSending] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [reservedSeats, setReservedSeats] = useState([]); // seats bought by anyone
  const [userOwnedSeats, setUserOwnedSeats] = useState([]); // seats bought by current user
  const [refreshTrigger, setRefreshTrigger] = useState(false); // toggle to re-fetch after booking
  const navigate = useNavigate();

  // helper: normalize time strings to "HH:MM"
  const normalizeTime = (timeStr) => {
    if (!timeStr && timeStr !== 0) return "";
    // Accept "HH:MM", "HH:MM:SS", possibly "19:00"
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      const hh = String(parts[0]).padStart(2, "0");
      const mm = String(parts[1]).padStart(2, "0");
      return `${hh}:${mm}`;
    }
    return timeStr;
  };

  // helper: try parse multiple date formats, return dd-mm-yyyy or null
  const normalizeDateToDDMMYYYY = (raw) => {
    if (!raw) return null;

    // If already dd-mm-yyyy like "05-12-2024"
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(raw)) {
      const [d, m, y] = raw.split("-");
      return `${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}-${y}`;
    }

    // If iso-like yyyy-mm-dd or yyyy-mm-d or "2024-12-5"
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(raw)) {
      const [y, m, d] = raw.split("-");
      return `${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}-${y}`;
    }

    // Try Date parse fallback
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      const day = String(parsed.getDate()).padStart(2, "0");
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const year = parsed.getFullYear();
      return `${day}-${month}-${year}`;
    }

    // Last resort: return raw
    return raw;
  };

  const isSameDate = (a, b) => {
    if (!a || !b) return false;
    const na = normalizeDateToDDMMYYYY(a);
    const nb = normalizeDateToDDMMYYYY(b);
    return na === nb;
  };

  // fetch movie + related data + compute reserved seats and user's owned seats
  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const movie = await fetchData(`movies/${movieId}`);
        if (!movie) {
          console.error("Movie not found for id", movieId);
          return;
        }
        const showtime = movie.showtimes?.find((s) => String(s.id) === String(showtimeId));
        const genreData = await fetchData("genres");
        const languageData = await fetchData("languages");
        const cinemaData = await fetchData("cinema");
        const screenData = await fetchData("screens");
        const accountData = await fetchData("accounts");

        setMovieData({ ...movie, selectedShowtime: showtime });
        setGenres(genreData || []);
        setScreen(screenData || []);
        setLanguages(languageData || []);
        setCinemas(cinemaData || []);

        // compute reserved seats and user-owned seats for this showtime
        const reservedFromTickets = [];
        const ownedSeats = [];

        // info to compare
        const showDateNorm = showtime ? normalizeDateToDDMMYYYY(showtime.date) : null;
        const showStartTimeNorm = showtime ? normalizeTime(showtime.start_time || showtime.startTime || "") : "";

        // ticket.cinema might be name ("Rạp Chiếu Movie88") or id ("1"). We'll allow either:
        // build cinemaName from cinema_id if possible
        const expectedCinemaId = showtime?.cinema_id;
        const expectedCinemaName = (cinemaData || []).find(c => String(c.id) === String(expectedCinemaId))?.name;

        (accountData || []).forEach(acc => {
          (acc.tickets || []).forEach(ticket => {
            // skip invalid tickets
            if (!ticket || !Array.isArray(ticket.seats)) return;

            // Normalize ticket date and startTime
            const ticketDateNorm = normalizeDateToDDMMYYYY(ticket.date);
            const ticketStartTimeNorm = normalizeTime(ticket.startTime || ticket.start_time || "");

            // Compare cinema: either match id (if ticket.cinema stores id) or match cinema name
            const ticketCinemaRaw = ticket.cinema;
            const isSameCinema =
              String(ticketCinemaRaw) === String(expectedCinemaId) ||
              (expectedCinemaName && String(ticketCinemaRaw).trim() === String(expectedCinemaName).trim());

            const isSameMovie = String(ticket.movie).trim() === String(movie.title).trim();

            const dateMatches = isSameDate(ticketDateNorm, showDateNorm);
            const timeMatches = ticketStartTimeNorm === showStartTimeNorm;

            if (isSameMovie && isSameCinema && dateMatches && timeMatches) {
              ticket.seats.forEach(s => {
                reservedFromTickets.push(s);
                if (user && acc && acc.email && user.email && String(acc.email).trim() === String(user.email).trim()) {
                  ownedSeats.push(s);
                }
              });
            }
          });
        });

        setReservedSeats(Array.from(new Set(reservedFromTickets)));
        setUserOwnedSeats(Array.from(new Set(ownedSeats)));
      } catch (error) {
        console.error("Error fetching movie data:", error);
      }
    };

    if (movieId && showtimeId) {
      fetchMovieData();
    }
    // refreshTrigger toggles when we want to reload (after booking success)
  }, [movieId, showtimeId, refreshTrigger]);

  // seats layout
  const seats = Array.from({ length: 8 }, (_, rowIndex) => {
    const rowLabel = String.fromCharCode(65 + rowIndex);
    return Array.from({ length: 12 }, (_, seatIndex) => {
      const seatId = `${rowLabel}${seatIndex + 1}`;
      return { id: seatId, status: "empty" };
    });
  });

  const getSeatClass = (seatId) => {
    // priority: userOwned -> reserved -> selected -> empty
    if (userOwnedSeats.includes(seatId)) {
      return "seat-owned";
    }
    if (reservedSeats.includes(seatId)) {
      return "seat-reserved";
    }
    if (selectedSeats.includes(seatId)) {
      return "seat-selected";
    }
    return "seat-empty";
  };

  const handleSeatSelection = (seatId) => {
    // do nothing if seat is reserved by others or owned by current user
    if (userOwnedSeats.includes(seatId) || reservedSeats.includes(seatId)) {
      return;
    }
    setSelectedSeats((prevSelectedSeats) =>
      prevSelectedSeats.includes(seatId)
        ? prevSelectedSeats.filter((id) => id !== seatId)
        : [...prevSelectedSeats, seatId]
    );
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      setShowAlertModal(true);
    } else {
      setShowModal(true);
    }
  };


  const getGenreNames = (genreIds) => {
    return genreIds
      .map((id) => genres.find((genre) => String(genre.id) === String(id))?.name)
      .filter(Boolean)
      .join(", ") || "Unknown Genre";
  };
  const getScreenName = (screenId) => {
    return screen.find((screen) => String(screen.id) === String(screenId))?.name || "Unknown Screen";
  };
  const getLanguageName = (languageId) => {
    return languages.find((language) => String(language.id) === String(languageId))?.name || "Unknown Language";
  };
  const getCinemaName = (cinemaId) => {
    return cinemas.find((cinema) => String(cinema.id) === String(cinemaId))?.name || "Unknown Cinema";
  };
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = (timeString || "").split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      // try Date parse fallback
      const parsed = new Date(`1970-01-01T${timeString}`);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
      }
      return timeString;
    }
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    return time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const normalized = normalizeDateToDDMMYYYY(dateString);
    return normalized || "N/A";
  };

  // Format price with commas and currency symbol
  const formatPrice = (price) => {
    return price
      ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
      : "N/A";
  };

  if (!movieData) {
    return <div>Loading...</div>;
  }

  const handleConfirmBooking = async () => {
    setIsSending(true);
    try {
      const bookingData = {
        userEmail: user?.email,
        fullName: user?.full_name || "Khách",
        phone: user?.phone || "Khách",
        cinema: getCinemaName(movieData.selectedShowtime?.cinema_id),
        movie: movieData.title,
        duration: movieData.duration,
        screen: getScreenName(movieData.selectedShowtime?.screen_id),
        seats: selectedSeats,
        date: formatDate(movieData.selectedShowtime?.date),
        startTime: normalizeTime(movieData.selectedShowtime?.start_time),
        endTime: normalizeTime(movieData.selectedShowtime?.end_time),
        totalPrice: (movieData.selectedShowtime?.price || 0) * selectedSeats.length
      };

      const response = await fetch("http://localhost:5000/api/confirm-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        const result = await response.json();
        setTicketId(result.ticketId || "");
        setShowSuccessModal(true);
        setShowModal(false);
        setSelectedSeats([]);
        // trigger re-fetch to update reserved/user-owned seats
        setRefreshTrigger(prev => !prev);
        // navigate to confirmation page with ticket and movie data
        navigate("/payment", {
          state: {
            ticket: result,
            movie: movieData,
            selectedSeats: selectedSeats,
            totalPrice: (movieData.selectedShowtime?.price || 0) * selectedSeats.length
          }
        });
      } else {
        alert("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert("Có lỗi xảy ra khi xác nhận vé.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="booking-container">
      <div className="seats-container">
        <h3>Sơ đồ ghế</h3>
        <div className="seat-legend">
          <div className="legend-item">
            <MdChair className="seat-icon" size={20} />
            <span className="seat empty">Ghế trống</span>
          </div>
          <div className="legend-item">
            <MdChair className="seat-icon seat-selected-icon" style={{ color: "yellow" }} size={20} />
            <span className="seat selected">Ghế đang chọn</span>
          </div>
          <div className="legend-item">
            <MdChair className="seat-icon" style={{ color: "#f44336" }} size={20} />
            <span className="seat reserved">Ghế đã bán (người khác)</span>
          </div>
          <div className="legend-item">
            <MdChair className="seat-icon" style={{ color: "#4caf50" }} size={20} />
            <span className="seat owned">Ghế của bạn</span>
          </div>
        </div>
        <div className="screen">Màn hình chiếu</div>
        <div className="seats">
          {seats.map((row, rowIndex) => (
            <div key={rowIndex} className="seat-row">
              {row.map((seat) => (
                <div
                  key={seat.id}
                  className={`seat ${getSeatClass(seat.id)}`}
                  onClick={() => handleSeatSelection(seat.id)}
                >
                  <MdChair className="seat-icon" size={20} />
                  <span>{seat.id}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="ticket">
        <div className="header">
          <img
            src={Array.isArray(movieData.poster) ? movieData.poster[0] : movieData.poster}
            alt={movieData.title}
            className="poster"
          />
        </div>
        <div className="info">
          <h2>{movieData.title}</h2>
          <p>{getLanguageName(movieData.language_id)}</p>
          <ul>
            <li>
              <strong>Thể loại:</strong> {getGenreNames(movieData.genre_ids)}
            </li>
            <li>
              <strong>Thời lượng:</strong> {movieData.duration} phút
            </li>
            <li>
              <strong>Rạp chiếu:</strong> {getCinemaName(movieData.selectedShowtime?.cinema_id)}
            </li>
            <li>
              <strong>Ngày chiếu:</strong>{" "}
              {formatDate(movieData.selectedShowtime?.date)}
            </li>
            <li>
              <strong>Giờ chiếu:</strong>{" "}
              {formatTime(movieData.selectedShowtime?.start_time)} -{" "}
              {formatTime(movieData.selectedShowtime?.end_time)}
            </li>
            <li>
              <strong>Phòng chiếu:</strong> {getScreenName(movieData.selectedShowtime?.screen_id)}
            </li>
            <li>
              <strong>Ghế:</strong>{" "}
              {selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa chọn ghế"}
            </li>
            <li>
              <strong>Tổng tiền:</strong> {formatPrice((movieData.selectedShowtime?.price || 0) * selectedSeats.length)}
            </li>
          </ul>
          <button className="continue-button" onClick={handleContinue}>Tiếp tục</button>
        </div>
      </div>

      {/* Modal thông báo khi chưa chọn ghế */}
      <Modal show={showAlertModal} onHide={() => setShowAlertModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thông báo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Vui lòng chọn ít nhất một ghế trước khi tiếp tục!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAlertModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xác nhận đặt vé */}
      <Modal show={showModal} onHide={() => !isSending && setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận đặt vé</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Người đặt:</strong> {user?.full_name || "Khách"}</p>
          <p><strong>Email người đặt:</strong> {user?.email}</p>
          <p><strong>Số điện thoại người đặt:</strong> {user?.phone || "Khách"}</p>
          <p><strong>Thời gian đặt:</strong> {new Date().toLocaleString()}</p>
          <p><strong>Thông tin vé:</strong></p>
          <ul>
            <li>
              <strong>Rạp chiếu:</strong> {getCinemaName(movieData.selectedShowtime?.cinema_id)}
            </li>
            <li><strong>Phim:</strong> {movieData.title}</li>
            <li>
              <strong>Thời lượng:</strong> {movieData.duration} phút
            </li>
            <li>
              <strong>Phòng chiếu:</strong> {getScreenName(movieData.selectedShowtime?.screen_id)}
            </li>
            <li><strong>Ghế:</strong> {selectedSeats.join(", ")}</li>
            <li>
              <strong>Ngày chiếu:</strong> {formatDate(movieData.selectedShowtime?.date)}
            </li>
            <li><strong>Thời gian chiếu:</strong> {formatTime(movieData.selectedShowtime?.start_time)} - {formatTime(movieData.selectedShowtime?.end_time)}</li>
            <li><strong>Tổng tiền:</strong> {formatPrice((movieData.selectedShowtime?.price || 0) * selectedSeats.length)}</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button disabled={isSending} variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          <Button disabled={isSending} onClick={handleConfirmBooking} variant="primary">
            Xác Nhận
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Đặt vé thành công!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Mã vé của bạn là:</strong> {ticketId}</p>
          <p>Thông tin vé đã được gửi về email của bạn. Vui lòng mang theo thông tin vé đến quầy để thanh toán và nhận vé. Xin cảm ơn!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

export default Booking;
