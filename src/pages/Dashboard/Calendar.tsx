import React, { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import ReservationCalendar from "../../components/calender/ReservationCalendar";

// Define the reservation interface
interface Reservation {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    status: string;
    customerName: string;
    roomName: string;
    size: string;
    phone: string;
    email: string;
  };
}

export default function Calendar() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });

  const typeOptions = [
    { value: "All", label: "All" },
    { value: "Room", label: "Room" },
    { value: "Hall", label: "Hall" },
  ];

  // Sample reservation data
  const sampleReservations: Reservation[] = [
    {
      id: "1",
      title: "Conference Room A - John Doe",
      start: "2025-07-15",
      end: "2025-07-16",
      backgroundColor: "#3b82f6", // Blue for Checked In
      borderColor: "#2563eb",
      textColor: "#ffffff",
      extendedProps: {
        status: "Checked In",
        customerName: "John Doe",
        roomName: "Conference Room A",
        size: "8 People",
        phone: "+1-234-567-8901",
        email: "john.doe@example.com",
      },
    },
    {
      id: "2",
      title: "Meeting Hall - Jane Smith",
      start: "2025-07-18",
      end: "2025-07-20",
      backgroundColor: "#10b981", // Green for Confirmed
      borderColor: "#059669",
      textColor: "#ffffff",
      extendedProps: {
        status: "Confirmed",
        customerName: "Jane Smith",
        roomName: "Meeting Hall",
        size: "20 People",
        phone: "+1-234-567-8902",
        email: "jane.smith@example.com",
      },
    },
    {
      id: "3",
      title: "Room B - Mike Johnson",
      start: "2025-07-22",
      backgroundColor: "#ef4444", // Red for Checked Out
      borderColor: "#dc2626",
      textColor: "#ffffff",
      extendedProps: {
        status: "Checked Out",
        customerName: "Mike Johnson",
        roomName: "Room B",
        size: "4 People",
        phone: "+1-234-567-8903",
        email: "mike.johnson@example.com",
      },
    },
    {
      id: "4",
      title: "Executive Suite - Sarah Wilson",
      start: "2025-07-25",
      end: "2025-07-27",
      backgroundColor: "#f59e0b", // Yellow for Booked
      borderColor: "#d97706",
      textColor: "#ffffff",
      extendedProps: {
        status: "Booked",
        customerName: "Sarah Wilson",
        roomName: "Executive Suite",
        size: "12 People",
        phone: "+1-234-567-8904",
        email: "sarah.wilson@example.com",
      },
    },
    {
      id: "5",
      title: "Training Room - David Brown",
      start: "2025-07-28",
      end: "2025-07-30",
      backgroundColor: "#8b5cf6", // Purple for Finalized
      borderColor: "#7c3aed",
      textColor: "#ffffff",
      extendedProps: {
        status: "Finalized",
        customerName: "David Brown",
        roomName: "Training Room",
        size: "15 People",
        phone: "+1-234-567-8905",
        email: "david.brown@example.com",
      },
    },
  ];

  // Handle search button click
  const handleSearch = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start <= end) {
        setDateRange({ start, end });
      } else {
        alert("End date must be after start date");
      }
    } else if (startDate) {
      // If only start date is provided, show single day
      const start = new Date(startDate);
      setDateRange({ start, end: start });
    } else {
      // Reset to show current month if no dates selected
      setDateRange({ start: null, end: null });
    }
  };

  // Handle calendar cell click
  const handleCalendarCellClick = (
    reservation: Reservation | null,
    date: Date,
    roomName: string
  ) => {
    const reservationInfo = document.getElementById("reservationInfo");
    if (reservationInfo) {
      if (reservation) {
        // Show reservation details
        reservationInfo.innerHTML = `
          <div class="space-y-2 block flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
            <div class="flex justify-between">
              <span class="text-sm font-medium">Customer:</span>
              <span class="text-sm">${
                reservation.extendedProps.customerName
              }</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-medium">Room:</span>
              <span class="text-sm">${reservation.extendedProps.roomName}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-medium">Size:</span>
              <span class="text-sm">${reservation.extendedProps.size}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-medium">Status:</span>
              <span class="text-sm">${reservation.extendedProps.status}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-medium">Phone:</span>
              <span class="text-sm">${reservation.extendedProps.phone}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-medium">Email:</span>
              <span class="text-sm">${reservation.extendedProps.email}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-medium">Start:</span>
              <span class="text-sm">${new Date(
                reservation.start
              ).toLocaleDateString()}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-medium">End:</span>
              <span class="text-sm">${
                reservation.end
                  ? new Date(reservation.end).toLocaleDateString()
                  : "Same day"
              }</span>
            </div>
          </div>
        `;
      } else {
        // Show available slot information
        reservationInfo.innerHTML = `
          <div class="space-y-2 block flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
            <div class="flex justify-between">
              <span class="text-sm font-medium">Status:</span>
              <span class="text-sm text-green-600">Available</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-medium">Room:</span>
              <span class="text-sm">${roomName}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-medium">Date:</span>
              <span class="text-sm">${date.toLocaleDateString()}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm font-medium">Day:</span>
              <span class="text-sm">${date.toLocaleDateString("en-US", {
                weekday: "long",
              })}</span>
            </div>
            <div class="mt-3 text-center">
              <button class="px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700">
                Create Reservation
              </button>
            </div>
          </div>
        `;
      }
    }
  };

  const handleTypeChange = (value: string) => {
    console.log("Type changed:", value);
  };

  const Clear = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();

    setStartDate("");
    setEndDate("");
    setDateRange({ start: null, end: null });

    // Clear select option
    const selectElement = document.querySelector("select") as HTMLSelectElement;
    if (selectElement) selectElement.value = "";

    // Clear reservation info
    const reservationInfo = document.getElementById("reservationInfo");
    if (reservationInfo) reservationInfo.innerHTML = "";
  };

  return (
    <>
      <PageMeta
        title="Calender - Reservation System"
        description="Manage calender information"
      />

      {/* Breadcrumb and Header container */}
      <div className="flex items-center justify-between mb-6">
        {/* Breadcrumb */}
        <nav>
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/" className="text-gray-500 hover:text-gray-700">
                Dashboard
              </a>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 dark:text-white">Calendar</li>
          </ol>
        </nav>

        {/* Header */}
        <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
          Calender
        </h3>

        {/* Empty div for equal spacing */}
        <div className="w-[120px]"></div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-8">
        <div className="mx-auto w-full max-w-[1500px]">
          <form className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Left side */}
              <div className="w-full lg:w-5/16">
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="max-w-full overflow-x-auto">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                      <label className="block w-16 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </label>
                      <Select
                        options={typeOptions}
                        placeholder="Select Type"
                        className="w-full"
                        onChange={handleTypeChange}
                      />
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row sm:gap-4">
                      <div className="w-full sm:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Reservation Date
                        </label>
                        <Input
                          placeholder="Select start date"
                          required
                          className="w-full"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="w-full sm:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          End Date
                        </label>
                        <Input
                          placeholder="Select end date"
                          required
                          className="w-full"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                      <div className="w-full sm:w-1/3">
                        <Button
                          type="button"
                          className="w-full sm:w-20 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-300 mt-5"
                          size="md"
                          onClick={handleSearch}
                        >
                          Search
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Legend
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="h-4 w-4 rounded bg-blue-500 mr-2"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Checked In
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-4 w-4 rounded bg-green-500 mr-2"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Confirmed
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-4 w-4 rounded bg-red-500 mr-2"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Checked Out
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="h-4 w-4 rounded bg-yellow-500 mr-2"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Booked
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-4 w-4 rounded bg-purple-500 mr-2"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Finalized
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-4 w-4 rounded bg-gray-500 mr-2"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Canceled
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 pt-6 pb-3 justify-center w-full max-w-md sm:max-w-xl mx-auto mt-4">
                      <Button
                        type="submit"
                        className="w-full sm:w-38 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-300"
                        size="md"
                      >
                        New Reservation
                      </Button>
                      <Button
                        type="button"
                        size="md"
                        className="w-full sm:w-38 bg-gray-500 hover:bg-gray-600 text-white"
                        onClick={Clear}
                      >
                        Clear
                      </Button>
                    </div>

                    <div className="mt-4 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Reservation Info
                      </h4>
                      <div className="space-y-2" id="reservationInfo">
                        <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                          Click on a calendar cell to view reservation details
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="w-full lg:w-11/16">
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                        <ReservationCalendar
                          reservations={sampleReservations}
                          onCellClick={handleCalendarCellClick}
                          dateRange={dateRange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
