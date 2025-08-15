import { createContext, useContext, useState, type ReactNode } from "react";

type LoginContextType = {
  isOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
};

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export const LoginProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openLogin = () => { 
    setIsOpen(true);
    document.body.classList.add('no-scroll');
  }
  const closeLogin = () => {
    setIsOpen(false);
    document.body.classList.remove('no-scroll');
  }

  return (
    <LoginContext.Provider value={{ isOpen, openLogin, closeLogin }}>
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => {
  const context = useContext(LoginContext);
  if (!context) throw new Error("useLogin must be used within LoginProvider");
  return context;
};
