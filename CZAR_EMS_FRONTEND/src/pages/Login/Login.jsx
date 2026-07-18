import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import Button from "../../components/Button";
import ForgotPassword from "./ForgotPassword";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
  };

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const extractUserAndToken = (respData) => {
    const user =
      respData.user || respData.data?.user || respData.data || respData.userData || respData;
    const token =
      respData.token || respData.accessToken || respData.access_token || respData.access || null;
    return { user, token };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const { user, token } = extractUserAndToken(response.data);

      if (!token) {
        throw new Error("No token received from server");
      }

      login(user, token);
      console.log("Login successful - token stored:", localStorage.getItem("token"));

      setMessage("Login successful! Redirecting...");
      setMessageType("success");

      setTimeout(() => navigate("/"), 600);
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Login failed: An unexpected error occurred";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`min-h-screen flex items-center justify-center bg-gray-50 px-4 ${showForgotPassword ? 'blur-sm transition-all duration-300 pointer-events-none' : ''}`}>
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <img src="/czar_logo.svg" alt="Logo" className="mx-auto w-20 mb-2" />
            <h1 className="text-2xl font-bold text-gray-800">Login</h1>
            <p className="text-gray-500 text-sm mt-1">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 h-full w-auto hover:bg-transparent"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              fullWidth
              variant="primary"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleForgotPasswordClick}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Forgot Password?
              </button>
            </div>
          </form>

          {message && (
            <div
              className={`mt-4 text-center text-sm px-3 py-2 rounded-lg ${messageType === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
                }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>

      {showForgotPassword && <ForgotPassword onClose={handleCloseForgotPassword} />}
    </>
  );
}
