import React, { useState, useEffect, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import DatePicker from "../../components/form/date-picker";
import ReservationCalendar from "../../components/calender/ReservationCalendar";
import API_BASE_URL from "../../config/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showErrorToast } from "../../components/alert/ToastAlert";

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

interface Rooms {
  roomTypeCode: string;
  roomCode: string;
  roomSize: string;
  description: string;
  isRoom: boolean;
  isBanquet: boolean;
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
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Rooms[]>([]);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  const typeOptions = [
    { value: "All", label: "All" },
    { value: "Room", label: "Room" },
    { value: "Hall", label: "Hall" },
  ];

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/api/Room/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter only rooms where isRoom is true
        const roomsOnly = Array.isArray(data)
          ? data.filter((room) => room.isRoom === true || room.isVilla === true)
          : [];
        setRooms(roomsOnly);
      } else {
        throw new Error("Failed to fetch Rooms");
      }
    } catch (error) {
      showErrorToast("Failed to load rooms");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchRooms();
    }
  }, []);

  // Handle search button click
  const handleSearch = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start <= end) {
        setDateRange({ start, end });

        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/ReservationCalendar/calendar`,
            {
              params: {
                startDate,
                endDate,
                calendarType: 1,
              },
            }
          );

          // Transform API data into Reservation[] for calendar
          const apiData = response.data;
          const mapped: Reservation[] = [];

          apiData.forEach((room: any) => {
            Object.entries(room.calendarDetails).forEach(([date, detail]) => {
              if (detail) {
                mapped.push({
                  id: `${room.roomId}-${date}`,
                  title: `${room.roomName} - ${detail}`,
                  start: new Date(date).toISOString(),
                  backgroundColor: "#10b981",
                  borderColor: "#059669",
                  textColor: "#ffffff",
                  extendedProps: {
                    status: "Booked",
                    customerName: (detail as string) || "",
                    roomName: room.roomName,
                    size: room.roomSize,
                    phone: "",
                    email: "",
                  },
                });
              }
            });
          });

          setReservations(mapped);
        } catch (err) {
          console.error("Error fetching calendar data:", err);
        }
      } else {
        alert("End date must be after start date");
      }
    } else if (startDate) {
      const start = new Date(startDate);
      setDateRange({ start, end: start });
    } else {
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
                        <div className="w-full sm:w-[140px]">
                          <DatePicker
                            id="startDate"
                            placeholder="Select start date"
                            value={startDate}
                            onChange={(_, dateStr) => setStartDate(dateStr)}
                          />
                        </div>
                      </div>
                      <div className="w-full sm:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          End Date
                        </label>
                        <div className="w-full sm:w-[140px]">
                          <DatePicker
                            id="endDate"
                            label=""
                            placeholder="Select end date"
                            value={endDate}
                            onChange={(_, dateStr) => setEndDate(dateStr)}
                          />
                        </div>
                      </div>
                      <div className="w-full sm:w-1/3">
                        <Button
                          type="button"
                          className="w-full sm:w-20 h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-300 mt-5"
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
                        type="button"
                        className="w-full sm:w-38 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-300"
                        size="md"
                        onClick={() => navigate("/room-reservation")}
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
                          reservations={reservations}
                          onCellClick={handleCalendarCellClick}
                          dateRange={dateRange}
                          rooms={rooms}
                          loading={loading}
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
