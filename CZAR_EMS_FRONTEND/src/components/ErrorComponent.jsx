import Button from "./Button";

export default function ErrorComponent({
  message = "Something went wrong!",
  onRetry
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <h2 className="text-2xl font-semibold text-red-600 mb-2">⚠️ Error</h2>
      <p className="text-gray-700 mb-4">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="primary"
          className="px-4 py-2"
        >
          Retry
        </Button>
      )}
    </div>
  );
}
