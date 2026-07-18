import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Button from "../../components/Button";

export default function ForgotPasswordPage({ onClose, onBack, backLabel = "Back to Login" }) {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/forgot-password', {
        email: formData.email
      });

      setMessage("OTP sent to your email successfully!");
      setMessageType("success");
      setStep(2);
    } catch (error) {
      console.error("Send OTP error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to send OTP";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (formData.otp.length !== 6) {
      setMessage("Please enter the full 6-digit OTP");
      setMessageType("error");
      setLoading(false);
      return;
    }

    console.log(`[DEBUG] Verifying OTP: ${formData.otp} for ${formData.email}`);
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/verify-otp', {
        email: formData.email,
        otp: formData.otp
      });

      setMessage("OTP verified successfully!");
      setMessageType("success");
      setStep(3);
    } catch (error) {
      console.error("Verify OTP error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Invalid OTP";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      setMessageType("error");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/auth/reset-password', {
        email: formData.email,
        newPassword: formData.newPassword
      });

      setMessage("Password reset successfully! Redirecting...");
      setMessageType("success");

      setTimeout(() => {
        if (onClose) {
          onClose();
        } else {
          navigate("/");
        }
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to reset password";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendOTP} className="space-y-4">
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

            <Button
              type="submit"
              isLoading={loading}
              fullWidth
              variant="primary"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
              <div className="relative">
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  maxLength="6"
                  className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-center text-2xl tracking-[0.5em] font-bold"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {formData.otp.length}/6
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                OTP sent to {formData.email}. Please ensure you enter all 6 digits.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                isLoading={loading}
                className="flex-1"
                variant="primary"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </div>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
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

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 h-full w-auto hover:bg-transparent"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                isLoading={loading}
                className="flex-1"
                variant="primary"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  const containerClasses = onClose
    ? "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    : "min-h-screen flex items-center justify-center bg-gray-50 px-4";

  return (
    <div className={containerClasses} onClick={() => onClose && onClose()}>
      <div
        className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <button
            onClick={() => {
              if (onBack) {
                onBack();
              } else if (onClose) {
                onClose();
              } else {
                navigate("/");
              }
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} className="rotate-180" />
          </button>
        )}
        <div className="text-center mb-6">
          <img src="/czar_logo.svg" alt="Logo" className="mx-auto w-20 mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 1 && "Enter your email to receive OTP"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Set your new password"}
          </p>
        </div>

        {renderStep()}

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              if (onBack) {
                onBack();
              } else if (onClose) {
                onClose();
              } else {
                navigate("/");
              }
            }}
            className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </button>
        </div>

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
  );
}
