import React, { useEffect, createContext, useContext, useState } from "react";

// Modal Context for global modal state management
interface ModalContextType {
  isAnyModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    return { isAnyModalOpen: false, setModalOpen: () => {} };
  }
  return context;
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  const setModalOpen = (isOpen: boolean) => {
    setIsAnyModalOpen(isOpen);
  };

  return (
    <ModalContext.Provider value={{ isAnyModalOpen, setModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "auto";
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  columnCount?: number;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "2xl",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  footer,
  columnCount = 2,
}: ModalProps) {
  const { setModalOpen } = useModalContext();

  // Handle Escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Prevent body scroll when modal is open and update global modal state
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setModalOpen(true);
    } else {
      document.body.style.overflow = "unset";
      setModalOpen(false);
    }

    return () => {
      document.body.style.overflow = "unset";
      setModalOpen(false);
    };
  }, [isOpen, setModalOpen]);

  if (!isOpen) return null;

  // Dynamic width calculation based on column count
  const getModalWidth = () => {
    if (size === "auto") {
      // Calculate width based on column count
      const baseWidth = 150;
      const calculatedWidth = Math.min(
        columnCount * baseWidth + 150,
        window.innerWidth - 64
      ); // Max width with padding
      return `${calculatedWidth}px`;
    }
    return "auto";
  };

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
    full: "max-w-full",
    auto: "",
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Glassmorphism Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-md bg-white/10 dark:bg-black/20 
                   bg-gradient-to-br from-white/20 via-white/10 to-white/5
                   dark:from-black/30 dark:via-black/20 dark:to-black/10
                   border border-white/20 dark:border-white/10"
        onClick={handleBackdropClick}
      />

      {/* Modal Content */}
      <div
        className={`relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl 
                   border border-white/20 dark:border-gray-700/50
                   rounded-2xl shadow-2xl w-full mx-4 max-h-[95vh] overflow-hidden
                   ${size === "auto" ? "" : sizeClasses[size]}
                   ${size === "full" ? "h-[95vh]" : ""}
                   transition-all duration-300 ease-out`}
        style={
          size === "auto" ? { width: getModalWidth(), maxWidth: "95vw" } : {}
        }
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50 
                        bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                         hover:bg-gray-100/50 dark:hover:bg-gray-700/50 
                         rounded-lg transition-all duration-200"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div
          className={`p-4 sm:p-6 overflow-y-auto ${
            size === "full"
              ? "max-h-[calc(95vh-140px)]"
              : "max-h-[calc(95vh-120px)]"
          }`}
        >
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div
            className="flex items-center justify-end gap-4 p-4 sm:p-6 
                          border-t border-gray-200/50 dark:border-gray-700/50
                          bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}