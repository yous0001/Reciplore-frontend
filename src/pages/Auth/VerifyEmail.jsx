import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react"; // Lucide loading icon

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const [hasVerified, setHasVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token && !hasVerified) {
      setHasVerified(true);
      verifyEmail(token)
        .then((msg) => {
          toast.success(msg || "Email verified successfully!");
          setTimeout(() => navigate("/auth/login"), 2500);
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message || "Email verification failed!"
          );
          setTimeout(() => navigate("/auth/login"), 3000);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [token, hasVerified, verifyEmail, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      {isLoading ? (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-white mb-4" />
          <p className="text-lg font-semibold">Verifying your email...</p>
        </>
      ) : (
        <p className="text-lg font-semibold">Redirecting to login...</p>
      )}
    </div>
  );
};

export default VerifyEmail;
