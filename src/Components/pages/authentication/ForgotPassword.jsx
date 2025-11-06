import React, { useState, useEffect } from "react";
import { Form, InputGroup, Button, Spinner, Alert } from "react-bootstrap";
import { fetchData } from "../../API/ApiService";

const ForgotPassword = ({ setCurrentForm }) => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: "Mã xác nhận đã được gửi đến email của bạn!", type: "success" });
        setStep(2);
        setTimeLeft(300); // 5 minutes in seconds
      } else {
        setMessage({ text: data.message || "Có lỗi xảy ra!", type: "danger" });
      }
    } catch (error) {
      setMessage({ text: "Lỗi kết nối server!", type: "danger" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 10) {
      setMessage({ text: "Mã xác nhận không hợp lệ!", type: "danger" });
      return;
    }
    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: "Mật khẩu không khớp!", type: "danger" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          resetToken: verificationCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: "Đổi mật khẩu thành công!", type: "success" });
        setTimeout(() => setCurrentForm("login"), 2000);
      } else {
        setMessage({ text: data.message || "Có lỗi xảy ra!", type: "danger" });
      }
    } catch (error) {
      setMessage({ text: "Lỗi kết nối server!", type: "danger" });
    } finally {
      setIsLoading(false);
    }
  };

  const renderTimer = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Form onSubmit={
      step === 1 ? handleSendCode :
        step === 2 ? handleVerifyCode :
          handleResetPassword
    }>
      <h2>Quên Mật Khẩu</h2>

      {message.text && (
        <Alert variant={message.type} className="mt-3">
          {message.text}
        </Alert>
      )}

      {step === 1 && (
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <i className="bi bi-envelope"></i>
          </InputGroup.Text>
          <Form.Control
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            required
          />
        </InputGroup>
      )}

      {step === 2 && (
        <>
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <i className="bi bi-shield-lock"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Nhập mã xác nhận"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </InputGroup>
          {timeLeft > 0 && (
            <p className="text-muted">
              Mã xác nhận sẽ hết hạn trong: {renderTimer()}
            </p>
          )}
          {timeLeft === 0 && (
            <Button
              variant="link"
              onClick={handleSendCode}
              disabled={isLoading}
            >
              Gửi lại mã
            </Button>
          )}
        </>
      )}

      {step === 3 && (
        <>
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <i className="bi bi-lock"></i>
            </InputGroup.Text>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
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

          <InputGroup className="mb-3">
            <InputGroup.Text>
              <i className="bi bi-lock-fill"></i>
            </InputGroup.Text>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
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
        </>
      )}

      <div className="d-flex justify-content-between gap-2">
        <Button
          variant="secondary"
          onClick={() => setCurrentForm("login")}
          type="button"
        >
          <i className="bi bi-x-circle"> Hủy</i>
        </Button>

        <Button
          variant="warning"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <>
              <i className="bi bi-send"></i>
              {step === 1 ? " Gửi mã" :
                step === 2 ? " Xác nhận" :
                  " Đổi mật khẩu"}
            </>
          )}
        </Button>
      </div>
    </Form>
  );
};

export default ForgotPassword;