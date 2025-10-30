import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import Login from "./authentication/Login";
import Register from "./authentication/Register";
import ForgotPassword from "./authentication/ForgotPassword";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../CSS/LoginRegister.css";

const LoginRegister = () => {
  const [currentForm, setCurrentForm] = useState("login");

  return (
    <div className="login-register-container">
      <Card className="text-center border-0">
        <Card.Body>
          <div className="tabs mb-4">
            <Button
              variant="outline-danger"
              className={`me-2 ${currentForm === "login" ? "active-tab" : ""}`}
              onClick={() => setCurrentForm("login")}
            >
              <i className="bi bi-box-arrow-in-right"> Đăng nhập</i>
            </Button>
            <Button
              variant="outline-warning"
              className={currentForm === "register" ? "active-tab" : ""}
              onClick={() => setCurrentForm("register")}
            >
              <i className="bi bi-person-plus-fill"> Đăng ký</i>
            </Button>
            <Button
              variant="outline-warning"
              className={currentForm === "forgotPassword" ? "active-tab" : ""}
              onClick={() => setCurrentForm("forgotPassword")}
            >
              <i className="bi bi-person-plus-fill"> Quên mật khẩu</i>
            </Button>
          </div>

          <div className="form-container">
            {currentForm === "login" && <Login setCurrentForm={setCurrentForm} />}
            {currentForm === "register" && <Register setCurrentForm={setCurrentForm} />}
            {currentForm === "forgotPassword" && <ForgotPassword setCurrentForm={setCurrentForm} />}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoginRegister;