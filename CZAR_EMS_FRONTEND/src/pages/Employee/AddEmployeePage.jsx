import { useState } from "react";
import { addNewEmployee } from "../../hooks/useEmployeeProfile";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";

const AddEmployeePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    personalEmail: "",
    workEmail: "",
    phone: "",
    dateOfBirth: "",
    dateOfJoining: "",
    department: "",
    position: "",
    employeeId: "",
    leaveBalance: "",
    role: "Employee",
    profilephoto: null,
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Validate phone number (10 digits, can start with +)
  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ""));
  };

  // ✅ Validate email
  const validateEmail = (email) => {
    // Ensure no consecutive dots or dot immediately before @
    const emailRegex = /^[a-zA-Z0-9._%+-]+[^.]@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ Validate form before submit
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.personalEmail.trim()) newErrors.personalEmail = "Personal Email is required";
    if (!validateEmail(formData.personalEmail)) newErrors.personalEmail = "Invalid email format";
    if (!formData.workEmail.trim()) newErrors.workEmail = "Work Email is required";
    if (!validateEmail(formData.workEmail)) newErrors.workEmail = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!validatePhone(formData.phone)) newErrors.phone = "Phone must be 10 digits";
    if (!formData.employeeId.trim()) newErrors.employeeId = "Employee ID is required";
    if (!formData.position.trim()) newErrors.position = "Position is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required";
    if (!formData.dateOfJoining) newErrors.dateOfJoining = "Date of Joining is required";
    if (!formData.department) newErrors.department = "Department is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Prepare data with ISO date strings
      // Sanitize work email: Remove dots before @
      const sanitizedWorkEmail = formData.workEmail.replace(/\.+@/, "@");

      const preparedData = new FormData();
      preparedData.append("name", formData.name);
      preparedData.append("personalEmail", formData.personalEmail);
      preparedData.append("workEmail", sanitizedWorkEmail);
      preparedData.append("phone", formData.phone);
      preparedData.append("dateOfBirth", formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null);
      preparedData.append("dateOfJoining", formData.dateOfJoining ? new Date(formData.dateOfJoining).toISOString() : null);
      preparedData.append("department", formData.department);
      preparedData.append("position", formData.position);
      preparedData.append("employeeId", formData.employeeId);
      preparedData.append("leaveBalance", formData.leaveBalance);
      preparedData.append("role", formData.role);
      if (formData.profilephoto) {
        preparedData.append("profilephoto", formData.profilephoto);
      }

      await addNewEmployee(preparedData);
      // Reset form after success
      setFormData({
        name: "",
        personalEmail: "",
        workEmail: "",
        phone: "",
        dateOfBirth: "",
        dateOfJoining: "",
        department: "",
        position: "",
        employeeId: "",
        leaveBalance: "",
        role: "Employee",
        profilephoto: null,
      });
      setErrors({});
    } catch (error) {
      console.error("Error creating employee:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 md:p-8 lg:p-10 mt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 pb-4 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            👤 Add New Employee
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Fill in the employee details below.
          </p>
        </div>
        <Button
          variant="primary"
          className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 font-semibold text-sm sm:text-base shadow-md"
          onClick={() => navigate("/admin/all-employees")}
        >
          View All
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter employee name"
            className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base text-gray-700 focus:ring-2 focus:outline-none transition ${errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Personal Email */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Personal Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="personalEmail"
            value={formData.personalEmail}
            onChange={handleChange}
            placeholder="Enter personal email"
            className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base text-gray-700 focus:ring-2 focus:outline-none transition ${errors.personalEmail ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
          />
          {errors.personalEmail && <p className="text-red-500 text-xs mt-1">{errors.personalEmail}</p>}
        </div>

        {/* Work Email */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Work Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="workEmail"
            value={formData.workEmail}
            onChange={handleChange}
            placeholder="Enter work email"
            className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base text-gray-700 focus:ring-2 focus:outline-none transition ${errors.workEmail ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
          />
          {errors.workEmail && <p className="text-red-500 text-xs mt-1">{errors.workEmail}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number (10-13 digits)"
            className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base text-gray-700 focus:ring-2 focus:outline-none transition ${errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* Employee ID */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Employee ID <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            placeholder="Ex: 101"
            className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base text-gray-700 focus:ring-2 focus:outline-none transition ${errors.employeeId ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
          />
          {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>}
        </div>

        {/* Position */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Position <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="Ex: Software Engineer"
            className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base text-gray-700 focus:ring-2 focus:outline-none transition ${errors.position ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
          />
          {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base text-gray-700 focus:ring-2 focus:outline-none transition ${errors.dateOfBirth ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
          />
          {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
        </div>

        {/* Date of Joining */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Date of Joining <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="dateOfJoining"
            value={formData.dateOfJoining}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base text-gray-700 focus:ring-2 focus:outline-none transition ${errors.dateOfJoining ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
          />
          {errors.dateOfJoining && <p className="text-red-500 text-xs mt-1">{errors.dateOfJoining}</p>}
        </div>

        {/* Department */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base text-gray-700 focus:ring-2 focus:outline-none transition ${errors.department ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
          >
            <option value="">Select Department</option>
            {["HR", "IT", "SALES", "FINANCE", "MARKETING", "OPERATIONS", "SUPPORT", "RESEARCH AND DEVELOPMENT", "PRODUCTION"].map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
        </div>

        {/* Leave Balance */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Leave Balance
          </label>
          <input
            type="number"
            name="leaveBalance"
            value={formData.leaveBalance}
            onChange={handleChange}
            placeholder="Enter leave balance (days)"
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
          >
            <option value="Employee">Employee</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* Profile Photo */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Profile Photo
          </label>
          <input
            type="file"
            name="profilephoto"
            accept="image/*"
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>
      </form>

      {/* Submit Button */}
      <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/admin/all-employees")}
          className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 font-semibold text-sm sm:text-base order-2 sm:order-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          isLoading={loading}
          variant="primary"
          className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 font-semibold text-sm sm:text-base order-1 sm:order-2 shadow-md"
        >
          Add Employee
        </Button>
      </div>
    </div>
  );
};

export default AddEmployeePage;