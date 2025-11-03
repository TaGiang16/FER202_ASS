import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Container, Row, Col, Navbar, Nav, Dropdown } from "react-bootstrap";
import "../../CSS/Header.css";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [greeting, setGreeting] = useState("");
  const [userId, setUserId] = useState("");
  const location = useLocation();

  const updateUserData = () => {
    const sessionUser = JSON.parse(sessionStorage.getItem("account"));
    const localUser = JSON.parse(localStorage.getItem("rememberedAccount"));

    if (sessionUser) {
      setIsLoggedIn(true);
      setUsername(sessionUser.full_name);
      setRole(sessionUser.role);
      setUserId(sessionUser.id);
    } else if (localUser) {
      setIsLoggedIn(true);
      setUsername(localUser.full_name);
      setRole(localUser.role);
      setUserId(localUser.id);
    } else {
      setIsLoggedIn(false);
      setUsername("");
      setRole("");
      setUserId("");
    }
  };

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) {
      setGreeting("Chào buổi sáng");
    } else if (hour >= 11 && hour < 13) {
      setGreeting("Chào buổi trưa");
    } else if (hour < 18) {
      setGreeting("Chào buổi chiều");
    } else {
      setGreeting("Chào buổi tối");
    }
  };

  useEffect(() => {
    updateUserData();
    updateGreeting();

    const interval = setInterval(() => {
      updateGreeting();
      updateUserData();
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("account");
    localStorage.removeItem("rememberedAccount");
    setIsLoggedIn(false);
    setUsername("");
    setRole("");
    setUserId("");
    window.location.replace("/");
  };

  const isActive = (path) => location.pathname === path ? 'active-tab' : '';

  return (
    <>
      <Container fluid className="bg-black">
        <Row className="d-flex justify-content-end py-2">
          {isLoggedIn ? (
            <Col className="text-right text-white Sig">
              <Link to={`/profile/${userId}`} className="text-white text-decoration-none">
                {greeting}, {username}
              </Link>
              <span className="logout-link text-white" onClick={handleLogout}>
                Đăng xuất
              </span>
            </Col>
          ) : (
            <Col className="text-right text-white Sig">
              <Link to="/login" className="text-white text-decoration-none">
                Đăng nhập
              </Link>
            </Col>
          )}
        </Row>
      </Container>
      <Navbar bg="light" expand="lg" className="border-bottom">
        <Container>
          <Navbar.Brand href="/" className="brand">
            MOVIES 88
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link
                as={Link}
                to="/movie"
                className={isActive("/movie")}
              >
                Phim
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/showtime"
                className={isActive("/showtime")}
              >
                Lịch Chiếu
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/info"
                className={isActive("/info")}
              >
                Hệ Thống Rạp
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/price"
                className={isActive("/price")}
              >
                Giá Vé
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/price-detail"
                className={isActive("/price-detail")}
              >
                Chi Tiết Giá Vé {/* Link mới */}
              </Nav.Link>
              {isLoggedIn && (
                <Nav.Link
                  as={Link}
                  to="/my-tickets"
                  className={isActive("/my-tickets")}
                >
                  Vé Của Tôi {/* Link mới */}
                </Nav.Link>
              )}
              {role === "1" && (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="link"
                    id="dropdown-management"
                    className="nav-link"
                  >
                    Quản Lý
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    {/* Các mục hiện có */}
                    <Dropdown.Item as={Link} to="/account" className={isActive("/account")}>
                      Quản Lý Tài Khoản
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/managermovies" className={isActive("/managermovies")}>
                      Quản Lý Phim
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/languages" className={isActive("/languages")}>
                      Quản Lý Ngôn Ngữ
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/genres" className={isActive("/genres")}>
                      Quản Lý Thể Loại
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/movietypes" className={isActive("/movietypes")}>
                      Quản Lý Loại Phim
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/screens" className={isActive("/screens")}>
                      Quản Lý Màn Hình
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/tickets" className={isActive("/tickets")}>
                      Quản Lý Vé
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/movie-bookings" className={isActive("/movie-bookings")}>
                      Quản Lý Booking
                    </Dropdown.Item>

                    {/* MỤC MỚI – Chi Tiết Giá Vé */}
                    <Dropdown.Item as={Link} to="/price-detail" className={isActive("/price-detail")}>
                      Chi Tiết Giá Vé
                    </Dropdown.Item>

                    {/* MỤC LỊCH SỬ GIÁ VÉ (nếu đã có) */}
                    <Dropdown.Item as={Link} to="/price-history" className={isActive("/price-history")}>
                      Lịch Sử Giá Vé
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;
