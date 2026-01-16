export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Delete",
  cancelText = "Cancel",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="border-3 bg-white border-[#353a7c] rounded-xl shadow-[5px_5px_#353a7c] p-6 max-w-sm mx-4">
        <h2 className="text-xl font-bold text-[#353a7c] mb-4">{title}</h2>
        <p className="text-[#666] mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#666] cursor-pointer transition-all duration-300 hover:shadow-[6px_6px_#353a7c] hover:translate-y-0.5"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="relative overflow-hidden px-6 py-2 border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#666] cursor-pointer transition-all duration-300 hover:text-[#e8e8e8] hover:shadow-[6px_6px_#9b0101] hover:border-[#fff] z-[1] before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:bg-[#c80404] before:z-[-1] before:transition-all before:duration-300 hover:before:w-full"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
