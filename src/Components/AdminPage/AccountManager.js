import React, { useEffect, useState } from "react";
import { Table, Button, Container, Alert, Modal, Form } from "react-bootstrap";
import { fetchData, updateData } from "../API/ApiService";

const AccountManager = () => {
  const [accounts, setAccounts] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [newRole, setNewRole] = useState("");

  // Fetch accounts list
  const fetchAccounts = async () => {
    try {
      const data = await fetchData("accounts");
      setAccounts(data);
    } catch {
      setErrorMessage("Không thể tải danh sách tài khoản!");
    }
  };

  // Toggle account status
  const toggleStatus = async (id) => {
    try {
      const account = accounts.find((acc) => acc.id === id);
      const updated = await updateData("accounts", id, {
        ...account,
        status: account.status === "active" ? "inactive" : "active",
      });
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === updated.id ? updated : acc))
      );
      setSuccessMessage("Cập nhật trạng thái tài khoản thành công!");
    } catch {
      setErrorMessage("Không thể cập nhật trạng thái tài khoản!");
    }
  };

  // Change account role
  const handleChangeRole = async () => {
    if (!selectedAccount || !newRole) return;

    try {
      const updated = await updateData("accounts", selectedAccount.id, {
        ...selectedAccount,
        role: newRole,
      });
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === updated.id ? updated : acc))
      );
      setSuccessMessage("Cập nhật vai trò thành công!");
      setShowRoleModal(false);
    } catch {
      setErrorMessage("Không thể cập nhật vai trò!");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <Container>
      <h2 className="my-4 text-center">Quản Lý Tài Khoản (Admin)</h2>

      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="danger" onClose={() => setErrorMessage(null)} dismissible>
          {errorMessage}
        </Alert>
      )}

      <Table striped bordered hover responsive className="text-center align-middle">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Họ và Tên</th>
            <th>Ngày Sinh</th>
            <th>Giới Tính</th>
            <th>Email</th>
            <th>Điện Thoại</th>
            <th>Địa Chỉ</th>
            <th>Vai Trò</th>
            <th>Trạng Thái</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.id}>
              <td>{account.id}</td>
              <td>{account.full_name}</td>
              <td>{account.dob}</td>
              <td>{account.gender}</td>
              <td>{account.email}</td>
              <td>{account.phone}</td>
              <td>{account.address}</td>
              <td>{account.role === "1" ? "Admin" : "User"}</td>
              <td>
                <Button
                  variant={account.status === "active" ? "success" : "secondary"}
                  size="sm"
                  onClick={() => toggleStatus(account.id)}
                >
                  {account.status === "active" ? "Hoạt động" : "Vô hiệu"}
                </Button>
              </td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => {
                    setSelectedAccount(account);
                    setNewRole(account.role);
                    setShowRoleModal(true);
                  }}
                >
                  Đổi Vai Trò
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal đổi vai trò */}
      <Modal
        show={showRoleModal}
        onHide={() => setShowRoleModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Đổi Vai Trò Tài Khoản</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Tài khoản:</strong> {selectedAccount?.full_name}</p>
          <Form.Select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="1">Admin</option>
            <option value="2">User</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleChangeRole}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AccountManager;
