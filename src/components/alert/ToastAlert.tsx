import toast, { Toaster } from "react-hot-toast";

// Success toast
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 4000,
    position: "top-right",
    style: {
      background: "#10B981",
      color: "#fff",
      fontWeight: "500",
      borderRadius: "8px",
      padding: "12px 16px",
      zIndex: 9999,
    },
    iconTheme: {
      primary: "#fff",
      secondary: "#10B981",
    },
  });
};

// Error toast
export const showErrorToast = (message: string) => {
  toast.error(message, {
    duration: 5000,
    position: "top-right",
    style: {
      background: "#EF4444",
      color: "#fff",
      fontWeight: "500",
      borderRadius: "8px",
      padding: "12px 16px",
      zIndex: 9999,
    },
    iconTheme: {
      primary: "#fff",
      secondary: "#EF4444",
    },
  });
};

// Info toast
export const showInfoToast = (message: string) => {
  toast(message, {
    duration: 3000,
    position: "top-right",
    style: {
      background: "#3B82F6",
      color: "#fff",
      fontWeight: "500",
      borderRadius: "8px",
      padding: "12px 16px",
      zIndex: 9999,
    },
    icon: "ℹ️",
  });
};

// Loading toast
export const showLoadingToast = (message: string) => {
  return toast.loading(message, {
    position: "top-right",
    style: {
      background: "#6B7280",
      color: "#fff",
      fontWeight: "500",
      borderRadius: "8px",
      padding: "12px 16px",
      zIndex: 9999,
    },
  });
};

// Dismiss specific toast
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Toast container component with proper z-index and positioning
export const ToastContainer = () => {
  return (
    <div style={{ zIndex: 99999, position: "relative" }}>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName="toast-container"
        containerStyle={{
          top: "80px", // Adjust based on your header height
          right: "20px",
          zIndex: 99999,
          position: "fixed",
        }}
        toastOptions={{
          className: "custom-toast",
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
            maxWidth: "500px",
            minWidth: "300px",
            fontSize: "14px",
            fontWeight: "500",
            borderRadius: "8px",
            boxShadow:
              "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            zIndex: 99999,
          },
          success: {
            duration: 4000,
            style: {
              background: "#10B981",
              color: "#fff",
              zIndex: 99999,
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#10B981",
            },
          },
          error: {
            duration: 5000,
            style: {
              background: "#EF4444",
              color: "#fff",
              zIndex: 99999,
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#EF4444",
            },
          },
          loading: {
            style: {
              background: "#6B7280",
              color: "#fff",
              zIndex: 99999,
            },
          },
        }}
      />
    </div>
  );
};

export default {
  success: showSuccessToast,
  error: showErrorToast,
  info: showInfoToast,
  loading: showLoadingToast,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
};
