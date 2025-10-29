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
            className="fixed top-0 left-0 right-0 flex justify-center z-50"
          >
            <div
              className={`mt-4 w-[90%] max-w-md rounded-xl shadow-lg text-center p-4 backdrop-blur-lg ${
                alertOptions.type === "success"
                  ? "bg-green-600/80 border border-green-400"
                  : alertOptions.type === "error"
                  ? "bg-red-600/80 border border-red-400"
                  : alertOptions.type === "warning"
                  ? "bg-yellow-500/80 border border-yellow-400"
                  : "bg-blue-600/80 border border-blue-400"
              }`}
            >
              {alertOptions.title && (
                <h2 className="text-lg font-bold mb-1 text-white">
                  {alertOptions.title}
                </h2>
              )}
              {alertOptions.message && (
                <p className="text-white mb-2">{alertOptions.message}</p>
              )}
              {alertOptions.htmlContent}
              {alertOptions.showInput && (
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full p-2 mt-2 rounded bg-black/30 border border-gray-400 text-white"
                />
              )}
              <div className="flex justify-center gap-3 mt-3">
                {alertOptions.cancelText && (
                  <button
                    onClick={() => {
                      hideAlert();
                      alertOptions.onCancel?.();
                    }}
                    className="px-4 py-1.5 rounded bg-gray-700 hover:bg-gray-800 text-white"
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
                    className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white"
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
