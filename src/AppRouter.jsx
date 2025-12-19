
import { Routes, Route, Navigate,BrowserRouter } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { Provider } from "react-redux";

import { useSelector } from "react-redux";
import AppInitializer from "./AppInitializer";
import CreateExam from "./ExamCreation/CreateExam";
import AddQuestions from "./ExamCreation/AddQuestions";
import TodayExams from "./Exams/TodaysExam";
import StartExam from "./ExamCreation/StartExam";
import AdminLiveMonitor from "./Exams/AdminLiveMonitor";
import AdminMalpracticeLogs from "./Exams/AdminMalpracticeLogs";
import ExamInformation from "./Exams/ExamInformation";
import Results from "./Exams/Results";
import UpcomingExams from "./Exams/UpcommingExam";
export default function AppRouter() {
    const { isAuthenticated, authChecked,role } = useSelector(state => state.auth);

  // ⭐ WAIT until auth check completes
  if (!authChecked) {
    return <div>Loading...</div>; // or spinner
  }
  return (

    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard role={role}/> : <Navigate to="/login" replace />}
      />
      <Route path="/admin/create-exam" element={<CreateExam/>}></Route>
        <Route path="/admin/exams/:examId/add-questions" element={<AddQuestions/>}></Route>
        <Route path="/exam/:examId/start" element={<StartExam/>}></Route>
        <Route path="/exams/today" element={<TodayExams/>} ></Route>
        <Route path="/exams/upcoming" element={<UpcomingExams/>} ></Route>
        <Route path="/admin/monitor" element={<AdminLiveMonitor/>}></Route>
        <Route path="/admin/malpractice" element={<AdminMalpracticeLogs/>}></Route>
       <Route path="/rules" element={<ExamInformation/>}></Route> 
       <Route path="/results" element={<Results/>}></Route>


    </Routes></BrowserRouter>
  )
}
