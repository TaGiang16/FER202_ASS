import React, { useState } from "react";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import { postData, fetchData } from "../../API/ApiService";
import "bootstrap-icons/font/bootstrap-icons.css";

const Register = ({ setCurrentForm }) => {
  const [full_name, setFull_name] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validateFields = async () => {
    const validationErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^0\d{9,10}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    const today = new Date();

    if (!full_name) validationErrors.full_name = "Họ và tên không được bỏ trống!";
    if (!gender) validationErrors.gender = "Giới tính không được bỏ trống!";
    
    // Email validation
    if (!email) {
      validationErrors.email = "Email không được bỏ trống!";
    } else if (!emailRegex.test(email)) {
      validationErrors.email = "Email không đúng định dạng!";
    } else {
      const users = await fetchData("accounts");
      const emailExists = users.some((user) => user.email === email);
      if (emailExists) validationErrors.email = "Email đã được đăng ký!";
    }

    // Phone validation
    if (!phone) {
      validationErrors.phone = "Số điện thoại không được bỏ trống!";
    } else if (!phoneRegex.test(phone)) {
      validationErrors.phone = "Số điện thoại không đúng định dạng!";
    } else {
      const users = await fetchData("accounts");
      const phoneExists = users.some((user) => user.phone === phone);
      if (phoneExists) validationErrors.phone = "Số điện thoại đã được đăng ký!";
    }

    // Other validations
    if (!dob) {
      validationErrors.dob = "Ngày sinh không được bỏ trống!";
    } else if (new Date(dob) > today) {
      validationErrors.dob = "Ngày sinh không được là ngày sau hôm nay!";
    }

    if (!password) {
      validationErrors.password = "Mật khẩu không được bỏ trống!";
    } else if (!passwordRegex.test(password)) {
      validationErrors.password = "Mật khẩu phải có ít nhất 8 ký tự, ít nhất 1 chữ hoa và 1 số!";
    }

    if (!confirmPassword) {
      validationErrors.confirmPassword = "Vui lòng xác nhận mật khẩu!";
    } else if (password !== confirmPassword) {
      validationErrors.confirmPassword = "Mật khẩu và xác nhận mật khẩu không khớp!";
    }

    if (!address) validationErrors.address = "Địa chỉ không được bỏ trống!";

    setValidationErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const isValid = await validateFields();
    if (!isValid) return;

    const data = { 
      full_name, 
      email, 
      password, 
      dob, 
      phone, 
      gender, 
      address, 
      role: "2", 
      status: "active", 
      tickets: [] 
    };

    try {
      const response = await postData("accounts", data);
      console.log("Registration successful", response);
      setShowSuccessModal(true); // Show modal first
      // Remove the immediate redirect
      // setCurrentForm("login"); // This line should be removed
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("An error occurred while registering");
    }
  };

  const handleCancel = () => {
    setCurrentForm("login");
  };

  return (
    <>
      <Form onSubmit={handleRegister}>
        <h2>Đăng ký</h2>
        {/* Form fields here - copy from original component */}
        {/* I'm showing just a few fields as examples, add all others similarly */}
        
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <i className="bi bi-person"></i>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="* Họ tên"
            value={full_name}
            onChange={(e) => {
              setFull_name(e.target.value);
              setErrorMessage("");
              setValidationErrors((prevErrors) => ({
                ...prevErrors,
                full_name: "",
              }));
            }}
            isInvalid={!!validationErrors.full_name}
          />
        </InputGroup>

        {/* Email field */}
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <i className="bi bi-envelope"></i>
          </InputGroup.Text>
          <Form.Control
            type="email"
            placeholder="* Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value.toLowerCase());
              setErrorMessage("");
              setValidationErrors((prevErrors) => ({
                ...prevErrors,
                email: "",
              }));
            }}
            isInvalid={!!validationErrors.email}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.email}
          </Form.Control.Feedback>
        </InputGroup>

        {/* Phone field */}
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <i className="bi bi-telephone"></i>
          </InputGroup.Text>
          <Form.Control
            type="tel"
            placeholder="* Số điện thoại"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setErrorMessage("");
              setValidationErrors((prevErrors) => ({
                ...prevErrors,
                phone: "",
              }));
            }}
            isInvalid={!!validationErrors.phone}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.phone}
          </Form.Control.Feedback>
        </InputGroup>

        {/* Date of Birth field */}
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <i className="bi bi-calendar"></i>
          </InputGroup.Text>
          <Form.Control
            type="date"
            placeholder="* Ngày sinh"
            value={dob}
            onChange={(e) => {
              setDob(e.target.value);
              setErrorMessage("");
              setValidationErrors((prevErrors) => ({
                ...prevErrors,
                dob: "",
              }));
            }}
            isInvalid={!!validationErrors.dob}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.dob}
          </Form.Control.Feedback>
        </InputGroup>

        {/* Gender field */}
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <i className="bi bi-gender-ambiguous"></i>
          </InputGroup.Text>
          <Form.Select
            value={gender}
            onChange={(e) => {
              setGender(e.target.value);
              setErrorMessage("");
              setValidationErrors((prevErrors) => ({
                ...prevErrors,
                gender: "",
              }));
            }}
            isInvalid={!!validationErrors.gender}
          >
            <option value="">* Chọn giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {validationErrors.gender}
          </Form.Control.Feedback>
        </InputGroup>

        {/* Address field */}
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <i className="bi bi-geo-alt"></i>
          </InputGroup.Text>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="* Địa chỉ"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setErrorMessage("");
              setValidationErrors((prevErrors) => ({
                ...prevErrors,
                address: "",
              }));
            }}
            isInvalid={!!validationErrors.address}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.address}
          </Form.Control.Feedback>
        </InputGroup>

        {/* Password field */}
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <i className="bi bi-lock"></i>
          </InputGroup.Text>
          <Form.Control
            type="password"
            placeholder="* Mật khẩu"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMessage("");
              setValidationErrors((prevErrors) => ({
                ...prevErrors,
                password: "",
              }));
            }}
            isInvalid={!!validationErrors.password}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.password}
          </Form.Control.Feedback>
        </InputGroup>

        {/* Confirm Password field */}
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <i className="bi bi-lock-fill"></i>
          </InputGroup.Text>
          <Form.Control
            type="password"
            placeholder="* Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrorMessage("");
              setValidationErrors((prevErrors) => ({
                ...prevErrors,
                confirmPassword: "",
              }));
            }}
            isInvalid={!!validationErrors.confirmPassword}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.confirmPassword}
          </Form.Control.Feedback>
        </InputGroup>

        {errorMessage && <p className="text-danger">{errorMessage}</p>}

        <Button style={{ marginBottom: "5px" }} variant="secondary" onClick={handleCancel}>
          <i className="bi bi-x-circle"> Hủy</i>
        </Button>
        <Button type="submit" className="btn-warning w-100">
          <i className="bi bi-person-plus-fill"> Đăng ký</i>
        </Button>
      </Form>

      <Modal
        show={showSuccessModal}
        onHide={() => {
          setShowSuccessModal(false);
          setCurrentForm("login"); // Redirect after closing modal
        }}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Tạo Tài Khoản Thành Công</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tài Khoản Của Bạn Đã Được Tạo Thành Công. Vui Lòng Đăng Nhập Để Trải Nghiệm!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowSuccessModal(false);
              setCurrentForm("login"); // Redirect after clicking close
            }}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Register;