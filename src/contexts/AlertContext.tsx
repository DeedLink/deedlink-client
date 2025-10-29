import { createContext, useContext, useState, type ReactNode } from "react";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertOptions {
  type?: AlertType;
  title?: string;
  message?: string;
  htmlContent?: ReactNode;
  showInput?: boolean;
  onConfirm?: (inputValue?: string) => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType>({
  showAlert: () => {},
  hideAlert: () => {},
});

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);
  const [inputValue, setInputValue] = useState("");

  const showAlert = (options: AlertOptions) => {
    setInputValue("");
    setAlertOptions(options);
  };

  const hideAlert = () => setAlertOptions(null);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alertOptions && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div
            className={`w-96 rounded-2xl p-6 text-center shadow-lg ${
              alertOptions.type === "success"
                ? "bg-green-500/20 border border-green-400"
                : alertOptions.type === "error"
                ? "bg-red-500/20 border border-red-400"
                : alertOptions.type === "warning"
                ? "bg-yellow-500/20 border border-yellow-400"
                : "bg-blue-500/20 border border-blue-400"
            }`}
          >
            {alertOptions.title && (
              <h2 className="text-xl font-bold mb-2 text-white">
                {alertOptions.title}
              </h2>
            )}
            {alertOptions.message && (
              <p className="text-white mb-3">{alertOptions.message}</p>
            )}
            {alertOptions.htmlContent}
            {alertOptions.showInput && (
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full p-2 rounded bg-black/40 border border-gray-400 text-white mb-4"
              />
            )}
            <div className="flex justify-center gap-3 mt-2">
              {alertOptions.cancelText && (
                <button
                  onClick={() => {
                    hideAlert();
                    alertOptions.onCancel?.();
                  }}
                  className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white"
                >
                  {alertOptions.cancelText}
                </button>
              )}
              {alertOptions.confirmText && (
                <button
                  onClick={() => {
                    hideAlert();
                    alertOptions.onConfirm?.(inputValue);
                  }}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {alertOptions.confirmText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};
