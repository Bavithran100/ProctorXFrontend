import axios from "axios";

const Client = axios.create({
  // baseURL: "https://proctorxbackend-1.onrender.com/api",
  baseURL:"http://localhost:9080/api",
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials:true
});

export default Client;
