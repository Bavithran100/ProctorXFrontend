import { useEffect, useState } from "react";
import Client from "../Client";
import "../App.css";

export default function ApproveUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await Client.get("/admin/users");

      setUsers(res.data);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  async function approveUser(id) {
    try {
      await Client.put(`/admin/approve/${id}`);

      setUsers(prev =>
        prev.map(user =>
          user.id === id ? { ...user, approved: true } : user
        )
      );
    } catch {
      alert("Approval failed");
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card loading-card">
          <div className="hero-badge">Admin approval queue</div>
          <h3 className="loading-dots">Loading users</h3>
          <div className="skeleton-card" style={{ width: "100%" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page page--top">
      <div className="card card-wide">
        <div className="page-header">
          <div>
            <div className="hero-badge">Admin controls</div>
            <h2>User Management</h2>
            <p>Review pending users and approve access without interrupting the existing workflow.</p>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="table-shell">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Provider</th>
                <th>Approved</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.provider}</td>

                  <td>
                    <span className={`status-chip ${user.approved ? "approved" : "pending"}`}>
                      {user.approved ? "Approved" : "Pending"}
                    </span>
                  </td>

                  <td>
                    {!user.approved && (
                      <button
                        className="approve-btn"
                        onClick={() => approveUser(user.id)}
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
