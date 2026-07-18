import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeeProfile } from "../../hooks/useEmployeeProfile";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import { Eye, EyeOff, FileText, X, Mail, RefreshCw, ArrowLeft } from "lucide-react";
import SalarySlip from "../SalarySlips/SalarySlip";
import MyDocuments from "./MyDocuments";
import { BASE_URL } from "../../utils/attendanceUtils";
import ForgotPassword from "../Login/ForgotPassword";

const ProfilePage = () => {
  const { profile: employeeProfile, loading } = useEmployeeProfile();
  const { user, role, token } = useAuth();

  const [adminProfile, setAdminProfile] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordMessageType, setPasswordMessageType] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    department: '',
  });
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [salarySlips, setSalarySlips] = useState([]);
  const [isLoadingSalarySlips, setIsLoadingSalarySlips] = useState(false);
  const [selectedYear, setSelectedYear] = useState('all');
  const [isViewingSalarySlips, setIsViewingSalarySlips] = useState(false);
  const [isViewingDocuments, setIsViewingDocuments] = useState(false);
  const [optValue,setOtpValue] = useState('');



  // Group salary slips by year
  const salarySlipsByYear = salarySlips.reduce((acc, slip) => {
    const year = slip.toYear;
    if (!acc[year]) acc[year] = [];
    acc[year].push(slip);
    return acc;
  }, {});
  const sortedYears = Object.keys(salarySlipsByYear).sort((a, b) => b - a);

  // ✅ Fetch admin profile when role = admin
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (role !== "admin" || !user?._id) return;
      try {
        console.log("id : ", user._id);

        const res = await axiosInstance.get(`/admin/get-admin-details?id=${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("server response : ", res);

        setAdminProfile(res.data.admin);
      } catch (error) {
        console.error("Error fetching admin details:", error);
      } finally {
        setIsLoadingAdmin(false);
      }
    };
    if (role === "admin") fetchAdminProfile();
  }, [role, user, token]);

  // ✅ Fetch documents when role = employee
  useEffect(() => {
    const fetchDocuments = async () => {
      if (role !== "employee") return;
      setIsLoadingDocuments(true);
      try {
        const res = await axiosInstance.get('/employee/documents');
        setDocuments(res.data.documents);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoadingDocuments(false);
      }
    };
    fetchDocuments();
  }, [role]);

  // ✅ Fetch salary slips when role = employee
  const fetchSalarySlips = async () => {
    if (role !== "employee") return;
    setIsLoadingSalarySlips(true);
    try {
      const res = await axiosInstance.get('/employee/salary-slips');
      setSalarySlips(res.data.salarySlips);
    } catch (error) {
      console.error("Error fetching salary slips:", error);
    } finally {
      setIsLoadingSalarySlips(false);
    }
  };

  useEffect(() => {
    if (role === "employee") {
      fetchSalarySlips();
    }
  }, [role]);

  // ✅ Loading states
  if ((role === "employee" && loading) || (role === "admin" && isLoadingAdmin)) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading profile...⏳
      </div>
    );
  }

  // ✅ Select correct profile based on role
  const profile = role === "admin" ? adminProfile : employeeProfile;

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        No profile found.
      </div>
    );
  }

  // 🧩 Handlers

  // ✅ Change Password Handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (e) => {
    setOtpValue(e.target.value);
  };

  const handleConfirmPasswordChange = async () => {
    try {
      setPasswordLoading(true);
      setPasswordMessage('');

      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setPasswordMessage('All fields are required');
        setPasswordMessageType('error');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordMessage('New passwords do not match');
        setPasswordMessageType('error');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setPasswordMessage('Password must be at least 6 characters');
        setPasswordMessageType('error');
        return;
      }

      await axiosInstance.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordMessage('Password changed successfully!');
      setPasswordMessageType('success');

      setTimeout(() => {
        handleCancelPassword();
      }, 2000);
    } catch (error) {
      console.error('Change password error:', error);
      setPasswordMessage(error.response?.data?.message || 'Failed to change password');
      setPasswordMessageType('error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancelPassword = () => {
    // Reset all password-related states
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordMessage('');
    setPasswordMessageType('');
    setShowPasswords({ current: false, new: false, confirm: false });
    setIsChangingPassword(false);
  };

  // ✅ Password Visibility Toggle Handlers
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // ✅ Edit Profile Handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditProfile = () => {
    setProfileData({
      name: profile.name || '',
      phone: profile.phone || '',
      department: profile.department || '',
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (!profileData.name.trim()) {
        alert('Name is required');
        return;
      }

      await axiosInstance.put(`/admin/update/${profile._id}`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Profile updated successfully!');
      setIsEditingProfile(false);
      // Refresh admin profile
      const res = await axiosInstance.get(`/admin/get-admin-details?id=${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdminProfile(res.data.admin);
    } catch (error) {
      console.error('Update profile error:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancelProfile = () => {
    setProfileData({ name: '', phone: '', department: '' });
    setIsEditingProfile(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="w-full mx-auto bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 md:p-8 text-white flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 border-2 border-white/40 overflow-hidden flex-shrink-0 shadow-md mx-auto sm:mx-0 relative">
            {profile.profilePhoto && (
              <img
                src={`${BASE_URL}/uploads/${profile.profilePhoto}`}
                alt="profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            )}
            <div className={`absolute inset-0 flex justify-center items-center text-3xl sm:text-4xl font-bold ${profile.profilePhoto ? 'hidden' : ''}`}>
              {profile.name?.[0]?.toUpperCase()}
            </div>
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">{profile.name}</h2>
            <p className="text-blue-100 text-xs sm:text-sm mb-1">
              {role === "admin" && "admin"}
            </p>
            <p className="text-blue-200 text-xs sm:text-sm">
              {role === "employee" && "employee"}
            </p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 border-b pb-2">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 text-gray-700">
            <div>
              <p className="font-medium text-gray-500 text-xs sm:text-sm mb-1">📧 Email</p>
              <p className="text-sm sm:text-base break-words">{role === "admin" ? profile.email : profile.personalEmail}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500 text-xs sm:text-sm mb-1">📞 Phone</p>
              <p className="text-sm sm:text-base">{profile.phone || "N/A"}</p>
            </div>
            {role === "admin" && (
              <div>
                <p className="font-medium text-gray-500 text-xs sm:text-sm mb-1">🏢 Department</p>
                <p className="text-sm sm:text-base">{profile.department || "N/A"}</p>
              </div>
            )}
            {role === "employee" && (
              <>
                <div>
                  <p className="font-medium text-gray-500 text-xs sm:text-sm mb-1">🏢 Department</p>
                  <p className="text-sm sm:text-base">{profile.department || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500 text-xs sm:text-sm mb-1">💼 Position</p>
                  <p className="text-sm sm:text-base">{profile.position || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500 text-xs sm:text-sm mb-1">🆔 Employee ID</p>
                  <p className="text-sm sm:text-base">{profile.employeeId || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500 text-xs sm:text-sm mb-1">📅 Date of Joining</p>
                  <p className="text-sm sm:text-base">{profile.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500 text-xs sm:text-sm mb-1">🎂 Date of Birth</p>
                  <p className="text-sm sm:text-base">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500 text-xs sm:text-sm mb-1">📬 Work Email</p>
                  <p className="text-sm sm:text-base break-words">{profile.workEmail || "N/A"}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Documents Section - Only for Employees */}
        {role === "employee" && (
          <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                  My Documents
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsViewingDocuments(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold rounded-lg hover:bg-blue-200 transition-colors"
              >
                View Documents
              </button>
              <button
                onClick={() => {
                  fetchSalarySlips();
                  setIsViewingSalarySlips(true);
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-1 sm:gap-2"
              >
                💰 Salary Slips
              </button>
            </div>
          </div>
        )}

        {/* Salary Slips Modal */}
        {isViewingSalarySlips && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl p-5 sm:p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsViewingSalarySlips(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <SalarySlip />
            </div>
          </div>
        )}

        {/* Complete Documents Modal */}
        {isViewingDocuments && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl p-5 sm:p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsViewingDocuments(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <MyDocuments />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 p-4 sm:p-6 border-t bg-gray-50">
          {role === "admin" && (
            <Button
              onClick={handleEditProfile}
              variant="primary"
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base shadow-sm"
            >
              ✏️ Edit Profile
            </Button>
          )}
          <Button
            onClick={() => setIsChangingPassword(true)}
            variant="primary"
            className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base shadow-sm"
          >
            🔒 Change Password
          </Button>
        </div>

        {/* Change Password Modal */}
        {isChangingPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative">
              <button
                onClick={handleCancelPassword}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={passwordLoading}
              >
                <X size={24} />
              </button>

              <div className="text-center mb-6">
                <img src="/czar_logo.svg" alt="Logo" className="mx-auto w-16 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800">
                  Change Password
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Secure your account by updating your password
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setShowForgotPassword(true);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    onClick={handleCancelPassword}
                    variant="outline"
                    className="flex-1"
                    disabled={passwordLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmPasswordChange}
                    variant="primary"
                    className="flex-1"
                    disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                  >
                    {passwordLoading ? 'Updating...' : 'Change Password'}
                  </Button>
                </div>
              </div>

              {passwordMessage && (
                <div
                  className={`mt-6 text-center text-sm px-4 py-3 rounded-lg border transition-all ${passwordMessageType === "success"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                    }`}
                >
                  {passwordMessage}
                </div>
              )}
            </div>
          </div>
        )}

        {showForgotPassword && (
          <ForgotPassword
            onClose={() => setShowForgotPassword(false)}
            onBack={() => {
              setShowForgotPassword(false);
              setIsChangingPassword(true);
            }}
            backLabel="Back to Change Password"
          />
        )}

        {/* Edit Profile Modal */}
        {isEditingProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xl p-5 sm:p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelProfile}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </Button>
              <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-blue-700 border-b pb-2">
                Edit Profile
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-2">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-2">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={profileData.department}
                    onChange={handleProfileChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <Button onClick={handleSaveProfile} variant="primary">Save Changes</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

};

export default ProfilePage;
