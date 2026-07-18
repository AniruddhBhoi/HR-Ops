import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Eye, FileText } from "lucide-react";


const MyDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const res = await axiosInstance.get('/employee/documents');
            setDocuments(res.data.documents);
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const getDocLabel = (type) => {
        const labels = {
            aadhaar: 'Aadhaar Card',
            pan: 'PAN Card',
            bank: 'Bank Passbook',
            other: 'Other Document'
        };
        return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
    };

    const handleViewDocument = async (docId) => {
        try {
            const response = await axiosInstance.get(`/employee/documents/view/${docId}`, {
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error("Error viewing document:", error);
            // Assuming toast is available via react-hot-toast or similar, if not installed I'll use alert or console
            // Ideally import toast if project uses it. The project uses react-hot-toast in other files.
            alert("Failed to view document");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="text-blue-600" />
                    All Documents
                </h3>
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-gray-600">Loading documents...</div>
            ) : documents.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                    No documents found.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {documents.map((doc) => (
                        <div
                            key={doc._id}
                            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <FileText className="text-blue-600 w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800">{getDocLabel(doc.type)}</h4>
                                    <p className="text-xs text-gray-500">
                                        Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleViewDocument(doc._id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="View Document"
                            >
                                <Eye size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyDocuments;
