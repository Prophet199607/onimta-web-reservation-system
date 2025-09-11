import React, { useState, useEffect } from "react";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

const authImages = [
  "/images/auth/auth-bg-1.jpg",
  "/images/auth/auth-bg-2.jpg",
  "/images/auth/auth-bg-3.jpg",
  "/images/auth/auth-bg-4.jpg",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fade, setFade] = useState(false);

  // Change image with fade transition
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % authImages.length);
        setFade(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {/* Left side */}
        <div className="flex flex-col justify-center w-full lg:w-2/5">
          {children}
        </div>

        {/* Right side */}
        <div className="hidden w-full h-full lg:w-3/5 lg:block relative overflow-hidden">
          <img
            src={authImages[currentImageIndex]}
            alt="Hotel reservation"
            className={`object-cover w-full h-full transition-opacity duration-1000 ${
              fade ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Image indicator dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {authImages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentImageIndex === index
                    ? "bg-white scale-125"
                    : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Theme toggler */}
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
