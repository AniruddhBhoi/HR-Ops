import Button from "./Button";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100 opacity-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to log out of your account?
                </p>

                <div className="flex justify-end gap-3">
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        className="px-4 py-2 font-medium"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        variant="danger"
                        className="px-4 py-2 font-medium shadow-md"
                    >
                        Yes, Logout
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
