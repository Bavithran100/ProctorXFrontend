import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "./AuthSlice";
import Client from "./Client";

export default function AppInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await Client.get("/me");
        console.log(res.data);
        dispatch(loginSuccess({

          user: res.data.email,
          role: res.data.role
        }));
      } catch (err) {
        console.log(err);
        dispatch(logout());
      }
    }
    fetchData();
  }, [dispatch]);

  return children;
}
