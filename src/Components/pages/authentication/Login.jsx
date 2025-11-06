import React, { useState, useEffect } from "react";
import { Card, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../../API/ApiService";
import "bootstrap-icons/font/bootstrap-icons.css";

const Login = ({}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const rememberedAccount = localStorage.getItem("rememberedAccount");
    if (rememberedAccount) {
      const { email, password } = JSON.parse(rememberedAccount);
      setEmail(email);
      setPassword(password);
      setRemember(true);
    }

    const account = localStorage.getItem("account");
    if (account) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const users = await fetchData("accounts");
      const existUser = users.find(
        (user) => user.email === email && user.password === password
      );

      if (existUser) {
        if (existUser.status === "inactive") {
          setErrorMessage("Tài khoản đã bị khóa!");
          return;
        }
        if (remember) {
          const userData = {
            id: existUser.id,
            email: existUser.email,
            phone: existUser.phone,
            password: existUser.password,
            full_name: existUser.full_name,
            role: existUser.role
          };
          localStorage.setItem("rememberedAccount", JSON.stringify(userData));
        } else {
          localStorage.removeItem("rememberedAccount");
        }
        sessionStorage.setItem("account", JSON.stringify(existUser));
        window.location.replace("/");
      } else {
        setErrorMessage("Tài khoản hoặc mật khẩu không đúng!");
      }
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
      setErrorMessage("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleLogin}>
      <h2>Đăng nhập</h2>
      <InputGroup className="mb-3">
        <InputGroup.Text>
          <i className="bi bi-envelope"></i>
        </InputGroup.Text>
        <Form.Control
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          required
        />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text>
          <i className="bi bi-lock"></i>
        </InputGroup.Text>
        <Form.Control
          type={showPassword ? "text" : "password"}
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ paddingRight: "40px" }}
        />
        <div 
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: "10",
            cursor: "pointer"
          }}
          onClick={() => setShowPassword(!showPassword)}
        >
          <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
        </div>
      </InputGroup>
      {errorMessage && <p className="text-danger">{errorMessage}</p>}
      
      <Form.Group className="mb-3" style={{
        display: "flex",
        alignItems: "center",
        textAlign: "left",
        marginLeft: "10px",
      }}>
        <Form.Check.Input 
          type="checkbox" 
          id="remember" 
          checked={remember} 
          onChange={(e) => setRemember(e.target.checked)} 
          style={{ marginRight: "10px" }} 
        />
        <Form.Check.Label htmlFor="remember">Remember</Form.Check.Label>
      </Form.Group>

      <Button type="submit" className="btn-warning w-100" disabled={isLoading}>
        {isLoading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <i className="bi bi-person-plus-fill"> Đăng nhập</i>
        )}
      </Button>
    </Form>
  );
};

export default Login;