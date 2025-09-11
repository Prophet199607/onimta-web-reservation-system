import React from "react";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {/* Left side */}
        <div className="flex flex-col justify-center w-full lg:w-2/5">
          {children}
        </div>

        {/* Right side */}
        <div className="hidden w-full h-full lg:w-3/5 lg:block">
          <img
            src="/images/auth/auth-bg.jpg"
            alt="Hotel reservation"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Theme toggler */}
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
