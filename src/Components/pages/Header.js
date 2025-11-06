import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Navbar,
  Nav,
  Dropdown,
  Form,
  InputGroup,
  Button,
} from "react-bootstrap";
import "../../CSS/Header.css";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [greeting, setGreeting] = useState("");
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

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
    if (hour < 11) setGreeting("Chào buổi sáng");
    else if (hour < 13) setGreeting("Chào buổi trưa");
    else if (hour < 18) setGreeting("Chào buổi chiều");
    else setGreeting("Chào buổi tối");
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

  const isActive = (path) => (location.pathname === path ? "active-tab" : "");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) return;
    navigate(`/movie?search=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <Container fluid className="bg-black py-2">
        <div className="d-flex justify-content-end align-items-center">
          {isLoggedIn ? (
            <>
              <Link
                to={`/profile/${userId}`}
                className="text-white text-decoration-none me-3 fancy-font"
              >
                {greeting}, {username}!
              </Link>
              <Link
                to="/"
                onClick={handleLogout}
                className="text-white text-decoration-none"
              >
                <i className="bi bi-box-arrow-right"></i>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white me-3">
                Đăng Nhập
              </Link>
              <Link to="/login" className="text-white">
                Đăng Ký
              </Link>
            </>
          )}
        </div>
      </Container>

      {/* Main Navbar */}
      <Navbar expand="lg" bg="white" className="border-bottom mb-3">
        <Container fluid className="align-items-center">
          {/* Logo */}
          <Navbar.Brand
            as={Link}
            to="/"
            className="d-flex align-items-center nav-image"
          >
            <img
              src="../assets/Logo/black_on_trans.png"
              alt="Movie 88"
              style={{ height: "50px" }}
            />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse
            id="basic-navbar-nav"
            className="justify-content-between"
          >
            <Nav className="fw-bold fs-5 custom-nav align-items-lg-center">
              <Nav.Link
                as={Link}
                to="/showtime"
                className={isActive("/showtime")}
              >
                Lịch Chiếu Theo Rạp
              </Nav.Link>
              <Nav.Link as={Link} to="/movie" className={isActive("/movie")}>
                Phim
              </Nav.Link>
              <Nav.Link as={Link} to="/info" className={isActive("/info")}>
                Rạp
              </Nav.Link>
              <Nav.Link as={Link} to="/price" className={isActive("/price")}>
                Giá Vé
              </Nav.Link>

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
                    <Dropdown.Item as={Link} to="/account">
                      Quản Lý Tài Khoản
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/managermovies">
                      Quản Lý Phim
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/languages">
                      Quản Lý Ngôn Ngữ
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/genres">
                      Quản Lý Thể Loại
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/movietypes">
                      Quản Lý Loại Phim
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/screens">
                      Quản Lý Màn Hình
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/tickets">
                      Quản Lý Vé
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </Nav>

            <Form
              className="d-flex ms-lg-3 mt-2 mt-lg-0"
              onSubmit={handleSearchSubmit}
              style={{ width: "300px" }}
            >
              <InputGroup>
                <Form.Control
                  placeholder="Tìm theo tên phim…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Form>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;
