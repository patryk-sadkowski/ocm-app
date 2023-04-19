import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const withAuth = (Component: React.FC) => {
  return () => {
    const { user, authLoading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
      if (!user && !authLoading) {
        navigate("/login");
      }
    }, [navigate, user, authLoading]);
    return <Component />;
  };
};

export default withAuth;
