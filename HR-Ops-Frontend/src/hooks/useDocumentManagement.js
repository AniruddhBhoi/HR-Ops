import { useState, useRef, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const useDocumentManagement = (selectedEmployee, token, showOnlySalarySlips = false) => {
  const [documents, setDocuments] = useState([]);
  const [salarySlips, setSalarySlips] = useState([]);
  const [currentUploadType, setCurrentUploadType] = useState(showOnlySalarySlips ? 'salary' : null);

  useEffect(() => {
    setCurrentUploadType(showOnlySalarySlips ? 'salary' : null);
  }, [showOnlySalarySlips]);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [salaryFromMonth, setSalaryFromMonth] = useState('');
  const [salaryToMonth, setSalaryToMonth] = useState('');

  const fileInputRef = useRef(null);

  const fetchDocs = async (year = 'all') => {
    try {
      const docsRes = await axiosInstance.get(`/admin/documents/${selectedEmployee._id}`, {
        params: { year },
        headers: { Authorization: `Bearer ${token}` },
      });
      const allDocs = docsRes.data.documents || [];
      setDocuments(allDocs.filter(doc => doc.type !== 'salary'));
      setSalarySlips(allDocs.filter(doc => doc.type === 'salary'));
    } catch (err) {
      console.error(
        "Error fetching all years:",
        err.response?.data || err.message
      );
      setDocuments([]);
      setSalarySlips([]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !currentUploadType) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append(currentUploadType === 'salary' ? 'salarySlip' : 'document', file);
    formDataUpload.append('type', currentUploadType);

    if (currentUploadType === 'salary') {
      if (salaryFromMonth && salaryToMonth) {
        const [fromYear, fromMonth] = salaryFromMonth.split('-');
        const [toYear, toMonth] = salaryToMonth.split('-');
        formDataUpload.append('fromMonth', parseInt(fromMonth));
        formDataUpload.append('fromYear', parseInt(fromYear));
        formDataUpload.append('toMonth', parseInt(toMonth));
        formDataUpload.append('toYear', parseInt(toYear));
      }
    }

    try {
      const endpoint = currentUploadType === 'salary' ? `/admin/salary-slips/${selectedEmployee._id}` : `/admin/documents/${selectedEmployee._id}`;
      await axiosInstance.post(
        endpoint,
        formDataUpload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success("Document uploaded successfully");
      fetchDocs();
      setCurrentUploadType(showOnlySalarySlips ? 'salary' : null);
      setSalaryFromMonth('');
      setSalaryToMonth('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error("Error uploading document:", err);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length === 1) {
      const file = files[0];
      const validTypes = ['application/pdf'];
      if (validTypes.includes(file.type)) {
        handleFileUpload(file);
      } else {
        toast.error('Please upload a valid file: PDF');
      }
    } else if (files.length > 1) {
      toast.error('Please upload only one file at a time');
    }
  };



  const handleViewDocument = async (doc) => {
    try {
      const response = await axiosInstance.get(`/admin/documents/view/${doc._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Important for handling binary data
      });

      // Create a blob URL and open it in a new tab
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error("Error viewing document:", err);
      toast.error("Failed to view document");
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await axiosInstance.delete(`/admin/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Document deleted successfully");
      fetchDocs();
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error("Failed to delete document");
    }
  };

  return {
    documents,
    setDocuments,
    salarySlips,
    setSalarySlips,
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
  };
};

export default useDocumentManagement;
