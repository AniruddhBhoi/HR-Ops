import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { Search, UserPlus, Filter, Edit, Trash2, X, Plus, Minus, Upload } from "lucide-react";
import useDebounce from "../../hooks/useDebounce";
import useDocumentManagement from "../../hooks/useDocumentManagement";
import DocumentUploadSection from "../../components/DocumentUploadSection";
import toast from "react-hot-toast";
import Button from "../../components/Button";

const EmployeeListPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  // States
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [filterDept, setFilterDept] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState("edit");
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 10;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    personalEmail: "",
    dateOfBirth: "",
    dateOfJoining: "",
    availableLeaves: "",
    department: "",
    position: "",
    role: "Employee",
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // Use the document management hook
  const {
    documents,
    salarySlips,
    currentUploadType,
    setCurrentUploadType,
    uploading,
    isDragOver,
    salaryFromMonth,
    setSalaryFromMonth,
    salaryToMonth,
    setSalaryToMonth,
    fileInputRef,
    fetchDocs,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleViewDocument,
    handleDeleteDocument,
  } = useDocumentManagement(selectedEmployee, token, activeTab === "salarySlips");

  // Fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/all-employees", {
        params: { search: debouncedSearch },
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data.employees || []);
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Failed to fetch employee data.");
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [token, debouncedSearch]);

  // Fetch documents when tab changes
  useEffect(() => {
    if (selectedEmployee && (activeTab === "documents" || activeTab === "salarySlips")) {
      fetchDocs();
    }
  }, [activeTab, selectedEmployee]);

  // Reset to first page on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterDept]);

  // Get unique departments
  const departments = ["all", ...new Set(employees.map((emp) => emp.department))];

  // Apply department filter client-side
  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = filterDept === "all" || emp.department === filterDept;
    return matchesDept;
  });

  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  // Pagination calculations
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const paginatedEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  // Handlers
  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name || "",
      phone: employee.phone || "",
      personalEmail: employee.personalEmail || "",
      dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : "",
      dateOfJoining: employee.dateOfJoining ? new Date(employee.dateOfJoining).toISOString().split('T')[0] : "",
      availableLeaves: employee.availableLeaves || "",
      department: employee.department || "",
      position: employee.position || "",
      role: employee.role || "Employee",
    });
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
    setActiveTab("edit");
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    try {
      await axiosInstance.delete(`/admin/employee/${employeeToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Employee deleted successfully");
      fetchEmployees();
      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting employee:", err);
      toast.error(err.response?.data?.message || "Failed to delete employee");
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only JPG and PNG files are allowed!');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB!');
        return;
      }

      setProfilePhoto(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      console.log(formData)

      if (profilePhoto) {
        formDataToSend.append('profilePhoto', profilePhoto);
      }

      await axiosInstance.put(
        `/admin/update-employee/${selectedEmployee.employeeId}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      toast.success("Employee profile updated successfully");
      fetchEmployees();
      closeEditModal();
    } catch (err) {
      console.error("Error updating employee:", err);
      toast.error(err.response?.data?.message || "Failed to update employee");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">👥 Employees</h2>
          <p className="text-gray-500 text-sm">{filteredEmployees.length} employees found</p>
        </div>
        <Button
          onClick={() => navigate("/admin/add-employee")}
          variant="primary"
          className="flex items-center gap-2 px-4 py-2 w-full sm:w-auto justify-center"
        >
          <UserPlus size={18} />
          Add Employee
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search employees..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <select
            className="pl-10 pr-8 py-2 border rounded-lg bg-white appearance-none"
            value={filterDept}

            onChange={(e) => setFilterDept(e.target.value)}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept === "all" ? "All Departments" : dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                "Employee ID", "Name", "Work Email", "Department",
                "Position", "Available Leave", "Date of Joining", "Actions",
              ].map((head) => (
                <th key={head} className="p-3 text-left font-semibold text-gray-700 whitespace-nowrap">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((emp) => (
                <tr key={emp._id} className="hover:bg-gray-50 transition">
                  <td className="p-3 font-mono text-xs text-gray-600 whitespace-nowrap">{emp.employeeId}</td>
                  <td className="p-3 font-medium text-gray-900 capitalize whitespace-nowrap">{emp.name}</td>
                  <td className="p-3 text-gray-700 whitespace-nowrap">{emp.workEmail}</td>
                  <td className="p-3 text-gray-700 whitespace-nowrap">{emp.department}</td>
                  <td className="p-3 text-gray-700 whitespace-nowrap">{emp.position}</td>
                  <td className="p-3 text-gray-700 whitespace-nowrap font-medium text-emerald-600">
                    {emp.availableLeaves || 0} days
                  </td>
                  <td className="p-3 text-gray-700 whitespace-nowrap">
                    {new Date(emp.dateOfJoining).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button onClick={() => openEditModal(emp)} variant="primary" size="sm" className="flex items-center gap-1 px-3 py-1 text-xs">
                        <Edit size={14} />
                      </Button>
                      <Button onClick={() => openDeleteModal(emp)} variant="destructive" size="sm" className="flex items-center gap-1 px-3 py-1 text-xs bg-red-500 hover:bg-red-600">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-100 rounded-full p-4 mb-3">
                      <Search className="text-gray-400" size={24} />
                    </div>
                    <p className="text-gray-500 font-medium">No employees found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-gray-500">
            Showing {indexOfFirstEmployee + 1} to {Math.min(indexOfLastEmployee, filteredEmployees.length)} of {filteredEmployees.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || totalPages <= 1}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages <= 1}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4">
                {["edit", "documents", "salarySlips"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    {tab === "edit" ? "Edit Employee" : tab === "documents" ? "Employee Documents" : "Salary Slips"}
                  </button>
                ))}
              </div>
              <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition">
                <X size={24} />
              </button>
            </div>

            {activeTab === "edit" && (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["name", "phone", "personalEmail", "dateOfBirth", "dateOfJoining"].map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type={field.includes("date") ? "date" : field === "personalEmail" ? "email" : "text"}
                      value={formData[field]}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={field === "name"}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Leave</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, availableLeaves: Math.max(0, Number(formData.availableLeaves) - 1) })}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-600"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="w-full px-3 py-2 border border-blue-50 bg-blue-50/50 rounded-lg text-center font-bold text-blue-700 text-lg">
                      {Number(formData.availableLeaves) - (selectedEmployee?.approvedLeaveDays || 0)}
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, availableLeaves: Number(formData.availableLeaves) + 1 })}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                {/* {["department", "position"].map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field}</label>
                    <input
                      type="text"
                      value={formData[field]}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))} */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => {
                      setFormData({ ...formData, department: e.target.value })
                      console.log(formData)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HR">HR</option>
                    <option value="IT">IT </option>
                    <option value="SALES">SALES </option>
                    <option value="FINANCE">FINANCE </option>
                    <option value="MARKETING">MARKETING </option>
                    <option value="OPERATIONS">OPERATIONS </option>
                    <option value="SUPPORT">SUPPORT </option>
                    <option value="RESEARCH AND DEVELOPMENT">RESEARCH AND DEVELOPMENT </option>
                    <option value="PRODUCTION">PRODUCTION </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo (JPG, PNG only)</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition border border-gray-300">
                      <Upload size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">Choose Photo</span>
                      <input type="file" accept=".jpg,.jpeg,.png" onChange={handleProfilePhotoChange} className="hidden" />
                    </label>
                    {profilePhotoPreview && (
                      <div className="flex items-center gap-3">
                        <img src={profilePhotoPreview} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-blue-500" />
                        <button type="button" onClick={() => { setProfilePhoto(null); setProfilePhotoPreview(null); }} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button type="button" onClick={closeEditModal} className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition">Update Employee</button>
                </div>
              </form>
            )}

            {(activeTab === "documents" || activeTab === "salarySlips") && (
              <DocumentUploadSection
                selectedEmployee={selectedEmployee}
                token={token}
                documents={documents}
                salarySlips={salarySlips}
                currentUploadType={currentUploadType}
                setCurrentUploadType={setCurrentUploadType}
                uploading={uploading}
                isDragOver={isDragOver}
                salaryFromMonth={salaryFromMonth}
                setSalaryFromMonth={setSalaryFromMonth}
                salaryToMonth={salaryToMonth}
                setSalaryToMonth={setSalaryToMonth}
                fileInputRef={fileInputRef}
                handleFileUpload={handleFileUpload}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
                handleViewDocument={handleViewDocument}
                handleDeleteDocument={handleDeleteDocument}
                fetchDocs={fetchDocs}
                showOnlySalarySlips={activeTab === "salarySlips"}
              />
            )}
          </div>
        </div>
      )}

      {isDeleteModalOpen && employeeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Employee</h3>
              <button onClick={closeDeleteModal} className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete <span className="font-medium text-gray-900">{employeeToDelete.name}</span>?</p>
            <div className="flex justify-center pt-4 border-t border-gray-200">
              <button onClick={handleDeleteEmployee} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeListPage;