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
        return "bg-gradient-to-br from-green-900/95 to-green-800/95 border-2 border-green-500";
      case "error":
        return "bg-gradient-to-br from-red-900/95 to-red-800/95 border-2 border-red-500";
      case "warning":
        return "bg-gradient-to-br from-yellow-900/95 to-yellow-800/95 border-2 border-yellow-500";
      default:
        return "bg-gradient-to-br from-green-900/95 to-green-800/95 border-2 border-green-500";
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
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 flex justify-center z-50 font-spectral"
          >
            <div
              className={`mt-4 w-[90%] max-w-md rounded-lg shadow-2xl text-center p-6 backdrop-blur-sm ${getAlertStyles()}`}
            >
              {alertOptions.title && (
                <h2 className="text-xl font-bold mb-2 text-white">
                  {alertOptions.title}
                </h2>
              )}
              {alertOptions.message && (
                <p className="text-gray-100 mb-3 text-sm">{alertOptions.message}</p>
              )}
              {alertOptions.htmlContent}
              {alertOptions.showInput && (
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full p-3 mt-3 rounded-md bg-black/40 border-2 border-green-500/50 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                  placeholder="Enter value..."
                />
              )}
              <div className="flex justify-center gap-3 mt-4">
                {alertOptions.cancelText && (
                  <button
                    onClick={() => {
                      hideAlert();
                      alertOptions.onCancel?.();
                    }}
                    className="px-6 py-2 rounded-md bg-gray-700/80 hover:bg-gray-600/80 text-white border border-gray-500 transition-all duration-200 font-medium"
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
                    className="px-6 py-2 rounded-md bg-green-600 hover:bg-green-500 text-white border border-green-400 transition-all duration-200 font-medium shadow-lg"
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