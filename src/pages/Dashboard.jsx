import { useSelector } from "react-redux";
import Navbar from "./Navbar";
import DashboardCards from "./DashboardCards";
import "../App.css";

export default function Dashboard() {
  const role = useSelector(state => state.auth.role);
  console.log(role);
  
  return (
    <div className="dashboard">
      <Navbar />
      <main className="dashboard-main">
        <h2>Dashboard</h2>
        <DashboardCards role={role} />
      </main>
    </div>
  );
}
