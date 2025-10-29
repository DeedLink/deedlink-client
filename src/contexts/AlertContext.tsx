import { createContext, useContext, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  const getAlertStyles = () => {
    switch (alertOptions?.type) {
      case "success":
        return "bg-white border border-green-200";
      case "error":
        return "bg-white border border-red-200";
      case "warning":
        return "bg-white border border-yellow-200";
      default:
        return "bg-white border border-gray-200";
    }
  };

  const getIconColor = () => {
    switch (alertOptions?.type) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AnimatePresence>
        {alertOptions && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 flex justify-center z-50"
          >
            <div className={`mt-6 w-[90%] max-w-sm rounded-lg shadow-xl p-5 ${getAlertStyles()}`}>
              {alertOptions.title && (
                <h3 className={`text-base font-semibold mb-1.5 ${getIconColor()}`}>
                  {alertOptions.title}
                </h3>
              )}
              {alertOptions.message && (
                <p className="text-gray-700 text-sm leading-relaxed mb-3">{alertOptions.message}</p>
              )}
              {alertOptions.htmlContent}
              {alertOptions.showInput && (
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-3 py-2 mt-2 rounded border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter value..."
                />
              )}
              <div className="flex justify-end gap-2 mt-4">
                {alertOptions.cancelText && (
                  <button
                    onClick={() => {
                      hideAlert();
                      alertOptions.onCancel?.();
                    }}
                    className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
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
                    className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                  >
                    {alertOptions.confirmText}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
};