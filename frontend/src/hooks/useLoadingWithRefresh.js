import axios from "axios";
import { useEffect, useState } from "react";
import { useAdminContext } from "../context/adminContext";

export function useLoadingWithRefresh() {
  const [loading, setLoading] = useState(true);
  const { setIsAuthenticated, setAdmin } = useAdminContext();
  console.log(useAdminContext());

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/refresh`,
          { withCredentials: true }
        );
        if (data) {
          setIsAuthenticated(true);
          setAdmin(data?.userName);
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    })();
  }, []);

  return { loading };
}
