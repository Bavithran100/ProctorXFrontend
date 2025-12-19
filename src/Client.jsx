import axios from "axios";

const Client = axios.create({
  baseURL: "https://proctorxbackend-1.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials:true
});

export default Client;
