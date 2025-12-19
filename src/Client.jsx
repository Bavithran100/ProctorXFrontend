import axios from "axios";

const Client = axios.create({
  baseURL: "http://localhost:9080/api",
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials:true
});

export default Client;
