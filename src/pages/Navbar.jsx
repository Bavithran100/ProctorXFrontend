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
      <div className="navbar-brand">
        <span className="brand-symbol">P</span>
        <div>
          <h3>ProctorX</h3>
          <span>Examination workspace</span>
        </div>
      </div>

      <div className="navbar-right">
        <span className="user-info"><i>{user?.slice(0, 1)?.toUpperCase() || "U"}</i><span>{user}<small>{role}</small></span></span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
