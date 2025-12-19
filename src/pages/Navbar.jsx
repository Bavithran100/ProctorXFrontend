import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../AuthSlice";
import Client from "../Client";
import "../App.css";

export default function Navbar() {
  const { user, role } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await Client.post("/logout");
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  }

  return (
    <nav className="navbar">
      <h3>ProctorX</h3>

      <div className="navbar-right">
        <span className="user-info">{user} ({role})</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
