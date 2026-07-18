import { useState } from 'react';
import { Upload, Trash2, Eye, Filter } from 'lucide-react';

const DocumentUploadSection = ({
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
  handleFileUpload,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleViewDocument,
  handleDeleteDocument,
  showOnlySalarySlips,
}) => {
  const [selectedYear, setSelectedYear] = useState('');

  // Helper function to get month name from number
  const getMonthName = (monthNum) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1] || 'Invalid Month';
  };

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

  // Filter years based on selection
  const filteredYears = selectedYear === '' ? [] : sortedYears.filter(year => year === selectedYear);

  return (
    <div className="space-y-6">
      {/* Document Upload Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-gray-800 mb-3">
          {showOnlySalarySlips ? 'Upload Salary Slip' : 'Upload Document'}
        </h3>
        <div className="grid grid-cols-1 gap-2 mb-3 max-w-xs">
          {!showOnlySalarySlips && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select Document Type
              </label>
              <select
                value={currentUploadType || ''}
                onChange={(e) => {
                  setCurrentUploadType(e.target.value);
                  // Reset date fields when changing type
                  if (e.target.value !== 'salary') {
                    setSalaryFromMonth('');
                    setSalaryToMonth('');
                  }
                }}
                className="w-full px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-xs"
              >
                <option value="">Choose a document type</option>
                <option value="aadhaar">Aadhaar Card</option>
                <option value="pan">PAN Card</option>
                <option value="bank">Bank Passbook</option>
                <option value="other">Other Document</option>
              </select>
            </div>
          )}

          {/* Salary Slip From and To Month and Year Fields */}
          {(currentUploadType === 'salary' || showOnlySalarySlips) && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  From Month/Year
                </label>
                <input
                  type="month"
                  value={salaryFromMonth}
                  onChange={(e) => setSalaryFromMonth(e.target.value)}
                  className="w-full px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  To Month/Year
                </label>
                <input
                  type="month"
                  value={salaryToMonth}
                  onChange={(e) => setSalaryToMonth(e.target.value)}
                  className="w-full px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="flex items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={(!currentUploadType && !showOnlySalarySlips) || uploading || ((currentUploadType === 'salary' || showOnlySalarySlips) && (!salaryFromMonth || !salaryToMonth))}
              className="w-full px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-1 max-w-xs"
            >
              <Upload size={14} />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
        {(currentUploadType || showOnlySalarySlips) && (
          <div
            className={`border-2 border-dashed rounded p-3 transition-all duration-200 ${isDragOver ? 'bg-blue-100 border-blue-400 opacity-80' : 'bg-blue-50 border-blue-200'
              } max-w-xs mx-auto`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p className={`text-xs text-center ${isDragOver ? 'text-blue-700' : 'text-gray-600'}`}>
              {isDragOver ? 'Drop the file here...' : 'Drag & drop a PDF file here'}
            </p>
          </div>
        )}
      </div>

      {/* Salary Slips List - Only show if showOnlySalarySlips */}
      {showOnlySalarySlips && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Salary Slips</h3>
            {salarySlips.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-600" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Year</option>
                  {sortedYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {salarySlips.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No salary slips uploaded yet.</p>
          ) : selectedYear === '' ? (
            <p className="text-gray-500 text-center py-8">Please select a year to view salary slips.</p>
          ) : (
            <div className="space-y-6">
              {filteredYears.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No salary slips found for year {selectedYear}.</p>
              ) : (
                filteredYears.map((year) => (
                  <div key={year} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h4 className="text-md font-semibold text-gray-700 mb-3">Year {year}</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {salarySlipsByYear[year].map((slip) => (
                        <div
                          key={slip._id}
                          className="bg-gray-50 border border-gray-200 rounded-md p-2 hover:bg-gray-100 transition"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-800 text-sm truncate">
                              {getMonthName(slip.fromMonth)} {slip.fromYear} to {getMonthName(slip.toMonth)} {slip.toYear}
                            </span>
                            <div className="flex gap-0.5">
                              <button
                                onClick={() => handleViewDocument(slip)}
                                className="p-0.5 text-blue-600 hover:bg-blue-100 rounded transition"
                                title="View"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(slip._id)}
                                className="p-0.5 text-red-600 hover:bg-red-100 rounded transition"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {new Date(slip.uploadDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Uploaded Documents List - Only show if not showOnlySalarySlips */}
      {!showOnlySalarySlips && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Documents</h3>
          {documents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No documents uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {documents.map((doc) => {
                const docLabels = {
                  aadhaar: 'Aadhaar Card',
                  pan: 'PAN Card',
                  bank: 'Bank Passbook',
                  other: 'Other Document',
                };
                return (
                  <div
                    key={doc._id}
                    className="bg-gray-50 border border-gray-200 rounded-md p-2 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800 text-sm truncate">
                        {docLabels[doc.type] || doc.type}
                      </span>
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => handleViewDocument(doc)}
                          className="p-0.5 text-blue-600 hover:bg-blue-100 rounded transition"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc._id)}
                          className="p-0.5 text-red-600 hover:bg-red-100 rounded transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentUploadSection;
