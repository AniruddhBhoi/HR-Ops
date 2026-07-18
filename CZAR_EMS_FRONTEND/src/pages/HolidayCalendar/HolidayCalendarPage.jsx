
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Button from "../../components/Button";
import { X } from "lucide-react";


const HolidayCalendarPage = () => {
  const { role, token } = useAuth();
  const [theme] = useState("light");
  const [date, setDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin modal states
  const [showModal, setShowModal] = useState(false);
  const [editHoliday, setEditHoliday] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    fromDate: "",
    toDate: "",
    type: "",
  });


  // Fetch holidays (based on year)
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const year = date.getFullYear();
        const endpoint =
          role === "admin"
            ? `/holidays/${year}`
            : `/holidays/${year}`; // same for both
        const res = await axiosInstance.get(endpoint);
        console.log(res);

        setHolidays(res.data);
      } catch (error) {
        console.error("Error fetching holidays:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, [date, role, token]);

  // Month and year details
  const monthLabel = date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  // Navigation
  const nextMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() + 1));
  const prevMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() - 1));

  const getHoliday = (d) => {
    const currentDate = new Date(date.getFullYear(), date.getMonth(), d);
    currentDate.setHours(0, 0, 0, 0);

    return holidays.find((h) => {
      const start = new Date(h.fromDate);
      const end = new Date(h.toDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return currentDate.getTime() >= start.getTime() && currentDate.getTime() <= end.getTime();
    });
  };


  // 🧩 Admin CRUD Functions
  const handleAddOrUpdateHoliday = async (e) => {
    e.preventDefault();

    // Calculate year from fromDate
    const year = new Date(formData.fromDate).getFullYear();
    const dataToSend = { ...formData, year };

    console.log("Sending data:", dataToSend);

    try {
      if (editHoliday) {
        // Update existing
        await axiosInstance.put(`/holidays/${editHoliday._id}`, dataToSend);
      } else {
        // Add new
        await axiosInstance.post(`/holidays/addHoliday`, dataToSend);
      }

      setShowModal(false);
      setEditHoliday(null);


      setFormData({ name: "", fromDate: "", toDate: "", type: "National" });

      const res = await axiosInstance.get(`/holidays/${date.getFullYear()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHolidays(res.data);

      toast.success("success", {
        duration: 1500
      })
      setShowModal(false)
    } catch (error) {
      console.error("Error saving holiday:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      const errorMessage = error.response?.data?.message || error.message || "Failed to save holiday.";
      alert(`Failed to save holiday: ${errorMessage}`);
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) return;
    try {
      await axiosInstance.delete(`/holidays/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHolidays((prev) => prev.filter((h) => h._id !== id));
    } catch (error) {
      console.error("Error deleting holiday:", error);
      alert(`Failed to delete holiday: ${error.response?.data?.message || error.message}`);
    }
  };

  const openModal = (holiday = null) => {
    setEditHoliday(holiday);
    // setFormData(
    //   holiday
    //     ? { name: holiday.name, date: holiday.date.split("T")[0], type: holiday.type }
    //     : { name: "", date: "", type: "National" }
    // );

    setFormData(
      holiday
        ? {
          name: holiday.name,
          fromDate: holiday.fromDate?.split("T")[0] || "",
          toDate: holiday.toDate?.split("T")[0] || "",
          type: holiday.type || "National",
        }
        : {
          name: "",
          fromDate: "",
          toDate: "",
          type: "National",
        }
    );

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditHoliday(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading holidays...⏳
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page Content */}
      <div className="flex-1 p-3 sm:p-4 md:p-6 bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-5 md:p-6 rounded-xl shadow-lg mb-6 md:mb-10 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <div className="text-center sm:text-left w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold">Holiday Calendar</h1>
            <p className="text-sm sm:text-base text-blue-100 mt-1">
              View all upcoming holidays and plan your leaves effectively.
            </p>
          </div>
          {role === "admin" && (
            <Button
              onClick={() => openModal()}
              variant="secondary"
              className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-blue-700 shadow hover:bg-blue-100 text-sm sm:text-base font-medium transition-colors border-none"
            >
              ➕ Add Holiday
            </Button>
          )}
        </div>

        {/* Calendar Container */}
        <div
          className={`${theme === "dark" ? "bg-gray-800" : "bg-white"
            } p-3 sm:p-5 md:p-8 rounded-xl shadow-lg border border-gray-100`}
        >
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <Button
              onClick={prevMonth}
              variant="ghost"
              className="px-2 sm:px-3 py-1 sm:py-2 rounded hover:bg-gray-200 text-gray-600 text-lg sm:text-xl transition-colors"
            >
              ◀
            </Button>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-blue-600">{monthLabel}</h2>
            <Button
              onClick={nextMonth}
              variant="ghost"
              className="px-2 sm:px-3 py-1 sm:py-2 rounded hover:bg-gray-200 text-gray-600 text-lg sm:text-xl transition-colors"
            >
              ▶
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 text-center gap-1 sm:gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="font-semibold text-gray-500 border-b border-gray-200 pb-1 sm:pb-2 text-xs sm:text-sm"
              >
                {d}
              </div>
            ))}

            {/* Empty spaces before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`}></div>
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const holiday = getHoliday(day);
              const dateObj = new Date(date.getFullYear(), date.getMonth(), day);
              const isSunday = dateObj.getDay() === 0;

              return (
                <div
                  key={day}
                  className={`relative p-1.5 sm:p-2 md:p-3 rounded-lg text-xs sm:text-sm transition-all cursor-pointer min-h-[50px] sm:min-h-[60px] md:min-h-[70px] flex flex-col ${holiday
                    ? "bg-red-100 text-red-700 font-semibold shadow-sm"
                    : isSunday
                      ? "bg-purple-100 text-purple-700 font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  <div className="font-semibold">{day}</div>
                  {holiday && (
                    <div className="text-[9px] sm:text-[10px] md:text-xs font-medium mt-0.5 sm:mt-1 line-clamp-2 leading-tight">{holiday.name}</div>
                  )}
                  {role === "admin" && holiday && (
                    <div className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 flex gap-0.5 sm:gap-1">
                      <Button
                        onClick={() => openModal(holiday)}
                        size="sm"
                        className="text-[10px] sm:text-xs bg-blue-500 text-white rounded px-1 py-0.5 hover:bg-blue-600 transition-colors h-auto min-h-0"
                      >
                        ✏️
                      </Button>
                      <Button
                        onClick={() => handleDeleteHoliday(holiday._id)}
                        variant="danger"
                        size="sm"
                        className="text-[10px] sm:text-xs bg-red-500 text-white rounded px-1 py-0.5 hover:bg-red-600 transition-colors h-auto min-h-0 border-none"
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🧩 Modal for Add/Edit Holiday (Admin Only) */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          style={{ position: "fixed" }}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 border border-gray-200 max-h-[90vh] overflow-y-auto"
            style={{ zIndex: 60 }}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeModal}
              className="absolute top-3 right-3 text-indigo-900/40 hover:text-indigo-900 transition-colors"
            >
              <X size={24} strokeWidth={2.5} />
            </Button>

            <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-blue-700 border-b pb-2 pr-8">
              {editHoliday ? "Edit Holiday" : "Add Holiday"}
            </h3>

            <form onSubmit={handleAddOrUpdateHoliday} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Holiday Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
                />
              </div>

              {/* Date Range (From → To) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={(e) =>
                      setFormData({ ...formData, fromDate: e.target.value })
                    }
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    name="toDate"
                    value={formData.toDate}
                    onChange={(e) =>
                      setFormData({ ...formData, toDate: e.target.value })
                    }
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
                >
                  <option value="National">National</option>
                  <option value="Festival">Festival</option>
                  <option value="Optional">Optional</option>
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm sm:text-base font-medium transition-colors"
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HolidayCalendarPage