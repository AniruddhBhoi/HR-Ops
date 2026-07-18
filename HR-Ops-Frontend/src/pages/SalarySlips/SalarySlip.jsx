import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Filter } from "lucide-react";


const SalarySlip = () => {
  const [salarySlips, setSalarySlips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');



  // Helper function to get abbreviated month name from number
  const getAbbreviatedMonth = (monthNum) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthNum - 1] || 'Invalid Month';
  };



  // Group salary slips by year
  const salarySlipsByYear = salarySlips.reduce((acc, slip) => {
    const year = slip.fromYear.toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(slip);
    return acc;
  }, {});

  // Sort years (latest first)
  const sortedYears = Object.keys(salarySlipsByYear).sort((a, b) => b - a);

  // Apply filter
  const filteredYears =
    selectedYear === '' || selectedYear === 'all'
      ? []
      : selectedYear === 'view-all'
        ? sortedYears
        : sortedYears.filter(year => year === selectedYear);

  // Fetch salary slips on component mount
  useEffect(() => {
    const fetchSalarySlips = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get('/employee/salary-slips');
        setSalarySlips(res.data.salarySlips);
      } catch (error) {
        console.error("Error fetching salary slips:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSalarySlips();
  }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6 border-b pb-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <label className="text-sm font-medium text-gray-600">Filter by Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          >
            <option value="">Select Year</option>
            <option value="view-all">View All</option>
            {sortedYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-600">Loading salary slips...</div>
      ) : sortedYears.length === 0 ? (
        <div className="text-center text-gray-500">No salary slips found.</div>
      ) : filteredYears.length === 0 ? (
        <div className="text-center text-gray-500">No salary slips found for the selected year.</div>
      ) : (
        <div className="space-y-6">
          {filteredYears.map((year) => (
            <div key={year} className="bg-gray-50 rounded-lg p-4 shadow-sm border">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">{year}</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {salarySlipsByYear[year].map((slip) => (
                  <div
                    key={slip._id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-800">
                          {getAbbreviatedMonth(slip.fromMonth)} {slip.fromYear} - {getAbbreviatedMonth(slip.toMonth)} {slip.toYear}
                        </p>
                        <p className="text-sm text-gray-600">
                          Uploaded: {new Date(slip.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          const response = await axiosInstance.get(`/employee/documents/view/${slip._id}`, {
                            responseType: 'blob'
                          });
                          const blob = new Blob([response.data], { type: 'application/pdf' });
                          const url = window.URL.createObjectURL(blob);
                          window.open(url, '_blank');
                        } catch (error) {
                          console.error("Error viewing slip:", error);
                          alert("Failed to view salary slip");
                        }
                      }}
                      className="text-purple-600 hover:text-purple-800 font-medium text-sm hover:underline"
                    >
                      View Slip
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default SalarySlip;
