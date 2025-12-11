import React, { useState, useEffect, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import DatePicker from "../../components/form/date-picker";
import {API_BASE_URL} from "../../config/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "../../components/alert/ToastAlert";
import { FiSearch } from "react-icons/fi";

// Interfaces
interface StatusOption {
  value: number;
  label: string;
  color: string;
}

interface Room {
  roomTypeCode: string;
  roomCode: string;
  roomSize: string;
  description: string;
  isRoom: boolean;
}

interface ReservationDto {
  reservationNo: string;
  reservationStatus: string;
  statusId: number;
  customerCode: string;
  checkinDateTime: string;
  checkoutDateTime: string;
  grossAmount: number;
  dueAmount: number;
  paidAmount: number;
  mobile: string;
  email: string;
  customer?: {
    name: string;
    title: string;
  };
  roomDetails: Array<{
    roomCode: string;
    checkinDate: string;
    checkoutDate: string;
    amount: number;
    price: number;
    noOfDays: number;
  }>;
}

interface CalendarReservation {
  reservationNo: string;
  customerName: string;
  customerTitle: string;
  roomCode: string;
  checkinDate: Date;
  checkoutDate: Date;
  status: string;
  statusColor: string;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  mobile: string;
}

export default function Calendar() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<CalendarReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    reservation: CalendarReservation | null;
    date: Date;
    roomCode: string;
  } | null>(null);
  
  const hasFetched = useRef(false);

  // Fetch status options
  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/ReservationStatus/getall`);
        const data = response.data;

        const formatted: StatusOption[] = data
          .filter((s: any) => s.isShow)
          .map((s: any) => ({
            value: s.statusId,
            label: s.statusName,
            color: s.colorCode || getDefaultColor(s.statusName),
          }));

        setStatusOptions(formatted);
      } catch (err) {
        console.error("Failed to fetch status options:", err);
        setStatusOptions([
          { value: 1, label: "Booked", color: "#f59e0b" },
          { value: 2, label: "Confirmed", color: "#10b981" },
          { value: 3, label: "Checked In", color: "#3b82f6" },
          { value: 4, label: "Checked Out", color: "#ef4444" },
          { value: 5, label: "Canceled", color: "#6b7280" },
          { value: 6, label: "Finalized", color: "#8b5cf6" },
        ]);
      }
    };

    fetchStatusOptions();
  }, []);

  // Fetch rooms
  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/Room/getall`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const roomsOnly = Array.isArray(data)
          ? data.filter((room) => room.isRoom === true)
          : [];
        setRooms(roomsOnly);
      }
    } catch (error) {
      console.error("Failed to load rooms:", error);
      showErrorToast("Failed to load rooms");
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchRooms();
    }
  }, []);

  // Helper function to get default colors
  const getDefaultColor = (statusName: string): string => {
    const colorMap: { [key: string]: string } = {
      'booked': '#f59e0b',
      'confirmed': '#10b981',
      'checked in': '#3b82f6',
      'checked out': '#ef4444',
      'canceled': '#6b7280',
      'finalized': '#8b5cf6',
    };
    return colorMap[statusName.toLowerCase()] || '#10b981';
  };

  const getStatusColor = (statusName: string): string => {
    const statusOption = statusOptions.find(
      (opt) => opt.label.toLowerCase() === statusName.toLowerCase()
    );
    return statusOption?.color || '#10b981';
  };

  // Generate date range
  const generateDates = (): Date[] => {
    if (!startDate || !endDate) return [];
    
    const dates = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    currentDate.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  // Handle search
  const handleSearch = async () => {
    if (!startDate || !endDate) {
      showErrorToast("Please select both start and end dates");
      return;
    }

    setLoading(true);

    try {
      const url = selectedStatus
        ? `${API_BASE_URL}/api/RoomReservation/byStatus/${selectedStatus}`
        : `${API_BASE_URL}/api/RoomReservation/all`;

      const params = new URLSearchParams();
      params.append('fromDate', startDate);
      params.append('toDate', endDate);

      const response = await axios.get(`${url}?${params.toString()}`);
      const data = response.data;

      console.log("🔍 DEBUG - API Response:", data);

      // Transform data to calendar format
      const calendarData: CalendarReservation[] = [];

      data.forEach((reservation: ReservationDto) => {
        const customerName = reservation.customer?.name || reservation.customerCode || "Unknown";
        const customerTitle = reservation.customer?.title || reservation.customerCode || "Unknown";
        const statusColor = getStatusColor(reservation.reservationStatus);

        // Calculate total room amount for this reservation
        const totalRoomAmount = reservation.roomDetails?.reduce((total, room) => total + (room.amount || 0), 0) || 0;
        
        reservation.roomDetails?.forEach((room) => {
          // Calculate proportional payment amounts per room
          const roomAmount = room.amount || 0;
          const roomProportion = totalRoomAmount > 0 ? roomAmount / totalRoomAmount : 0;
          
          // Distribute paid/due amounts proportionally across rooms
          const paidAmount = reservation.paidAmount * roomProportion;
          const dueAmount = reservation.dueAmount * roomProportion;

          console.log(`🔍 DEBUG - Room ${room.roomCode}:`, {
            roomAmount,
            roomProportion: `${(roomProportion * 100).toFixed(2)}%`,
            paidAmount,
            dueAmount
          });

          calendarData.push({
            reservationNo: reservation.reservationNo,
            customerName: customerName,
            customerTitle: customerTitle,
            roomCode: room.roomCode,
            checkinDate: new Date(room.checkinDate),
            checkoutDate: new Date(room.checkoutDate),
            status: reservation.reservationStatus,
            statusColor: statusColor,
            amount: roomAmount,
            paidAmount: paidAmount,
            dueAmount: dueAmount,
            mobile: reservation.mobile || "N/A",
          });
        });
      });

      setReservations(calendarData);
      showSuccessToast(`Found ${calendarData.length} reservations`);
    } catch (err: any) {
      console.error("Search error:", err);
      showErrorToast(err.response?.data?.message || "Failed to load reservations");
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  // Get ALL reservations for a specific cell (date and room)
  const getReservationsForCell = (date: Date, roomCode: string): CalendarReservation[] => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return reservations.filter((reservation) => {
      const checkin = new Date(reservation.checkinDate);
      const checkout = new Date(reservation.checkoutDate);
      
      checkin.setHours(0, 0, 0, 0);
      checkout.setHours(0, 0, 0, 0);

      return (
        reservation.roomCode === roomCode &&
        checkDate >= checkin &&
        checkDate <= checkout
      );
    });
  };

  // Handle cell click
  const handleCellClick = (date: Date, roomCode: string) => {
    const reservationsForCell = getReservationsForCell(date, roomCode);
    // Show only the first reservation in modal for now
    setSelectedCell({ 
      reservation: reservationsForCell[0] || null, 
      date, 
      roomCode 
    });
  };

  const handleClear = () => {
    setStartDate(today);
    setEndDate(today);
    setSelectedStatus(null);
    setReservations([]);
    showSuccessToast("Filters cleared");
  };

  const dates = generateDates();

  return (
    <>
      <PageMeta
        title="Reservation Calendar - Booking System"
        description="Manage and view all reservations in calendar view"
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
          Manage Room Reservation Calendar
        </h3>

        {/* New Reservation Button */}
        <div className="flex items-center space-x-3">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => navigate("/room-reservation")}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Reservation
          </Button>
        </div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white p-3 sm:p-5 md:px-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-8">
        <div className="mx-auto w-full">
          {/* Filters Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300 mb-6">
              Calendar Filters
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reservation Status
                </label>
                <Select
                  options={[
                    { value: "", label: "All Statuses" },
                    ...statusOptions.map(opt => ({
                      value: opt.value.toString(),
                      label: opt.label,
                    }))
                  ]}
                  value={selectedStatus?.toString() || ""}
                  placeholder="Select status"
                  onChange={(value) => setSelectedStatus(value ? parseInt(value) : null)}
                  className="sm:w-70 w-full h-10"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <DatePicker
                  id="startDate"
                  placeholder="Select start date"
                  value={startDate}
                  onChange={(_, dateStr) => setStartDate(dateStr)}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <DatePicker
                  id="endDate"
                  placeholder="Select end date"
                  value={endDate}
                  onChange={(_, dateStr) => setEndDate(dateStr)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-280"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <FiSearch className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
                <Button
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Status Legend
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statusOptions.map((status) => (
                  <div key={status.value} className="flex items-center">
                    <div 
                      className="h-4 w-4 rounded mr-2" 
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{status.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
                Reservation Calendar
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {dates.length > 0
                  ? `Showing ${dates.length} days | ${reservations.length} reservations`
                  : "Select a date range to view reservations"
                }
              </p>
            </div>

            <div className="p-4 overflow-auto">
              {dates.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">Select dates to view calendar</p>
                </div>
              ) : (
                <div style={{ minWidth: `${150 + 80 + dates.length * 100}px` }}>
                  <div className="grid" style={{ gridTemplateColumns: `150px 80px repeat(${dates.length}, 100px)` }}>
                    {/* Header Row */}
                    <div className="sticky left-0 z-20 bg-gray-100 dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 h-20 flex items-center">
                      <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm">Room Name</span>
                    </div>
                    <div className="sticky left-[150px] z-20 bg-gray-100 dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 h-20 flex items-center justify-center">
                      <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm">Size</span>
                    </div>

                    {/* Date Headers */}
                    {dates.map((date, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 dark:bg-gray-800 p-2 border border-gray-300 dark:border-gray-600 h-20 flex flex-col justify-center items-center"
                      >
                        <div className="text-gray-800 dark:text-gray-200 text-sm font-semibold">
                          {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                          {date.toLocaleDateString("en-US", { weekday: "short" })}
                        </div>
                      </div>
                    ))}

                    {/* Room Rows */}
                    {rooms.map((room, roomIndex) => (
                      <React.Fragment key={roomIndex}>
                        <div className="sticky left-0 z-10 bg-blue-50 dark:bg-blue-900/20 p-3 border border-gray-300 dark:border-gray-600 h-24 flex items-center">
                          <div className="flex flex-col">
                            <span className="text-gray-900 dark:text-gray-100 text-sm font-semibold">
                              {room.roomCode}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                              {room.description}
                            </span>
                          </div>
                        </div>

                        <div className="sticky left-[150px] z-10 bg-purple-50 dark:bg-purple-900/20 p-2 border border-gray-300 dark:border-gray-600 h-24 flex items-center justify-center">
                          <span className="text-gray-900 dark:text-gray-100 text-sm font-semibold">
                            {room.roomSize}
                          </span>
                        </div>

                        {dates.map((date, dateIndex) => {
                          const cellReservations = getReservationsForCell(date, room.roomCode);
                          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                          const hasMultipleReservations = cellReservations.length > 1;

                          return (
                            <div
                              key={dateIndex}
                              className={`p-1 border border-gray-300 dark:border-gray-600 h-24 cursor-pointer transition-all duration-200 ${
                                cellReservations.length > 0
                                  ? "hover:opacity-80"
                                  : isWeekend
                                  ? "bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  : "bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              }`}
                              onClick={() => handleCellClick(date, room.roomCode)}
                              title={
                                cellReservations.length > 0
                                  ? `${cellReservations.length} reservation(s)`
                                  : `Available - ${room.roomCode}\n${date.toLocaleDateString()}`
                              }
                            >
                              {cellReservations.length > 0 ? (
                                <div className="h-full w-full relative">
                                  {/* Show first reservation prominently */}
                                  <div
                                    className="h-full w-full rounded-md flex flex-col items-center justify-center text-xs font-medium text-center p-2 shadow-sm"
                                    style={{
                                      backgroundColor: cellReservations[0].statusColor,
                                      color: "#ffffff",
                                      borderWidth: "2px",
                                      borderStyle: "solid",
                                      borderColor: cellReservations[0].statusColor,
                                    }}
                                  >
                                    <div className="truncate w-full font-semibold mb-1">
                                      {cellReservations[0].customerName}
                                    </div>
                                    <div className="text-[10px] opacity-90 truncate w-full">
                                      {cellReservations[0].status}
                                    </div>
                                    
                                    {/* Show indicator for multiple reservations */}
                                    {hasMultipleReservations && (
                                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                                        +{cellReservations.length - 1}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <span className="text-gray-400 dark:text-gray-600 text-xs">•</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for selected cell - Updated to match reservation page style */}
      {selectedCell && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg animate-fadeIn rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  selectedCell.reservation 
                    ? "bg-blue-100 dark:bg-blue-900/30" 
                    : "bg-green-100 dark:bg-green-900/30"
                }`}>
                  {selectedCell.reservation ? (
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedCell.reservation ? "Reservation Details" : "Available Slot"}
                  </h3>
                  {selectedCell.reservation && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedCell.reservation.reservationNo}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {selectedCell.reservation ? (
                <div className="space-y-4">
                  {/* Status Message */}
                  <div className={`rounded-lg border p-4 ${
                    selectedCell.reservation.status === "Finalized" 
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                      : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                  }`}>
                    <p className={`text-sm ${
                      selectedCell.reservation.status === "Finalized"
                        ? "text-green-800 dark:text-green-200"
                        : "text-blue-800 dark:text-blue-200"
                    }`}>
                      {selectedCell.reservation.status === "Finalized" 
                        ? "✓ Reservation has been finalized"
                        : `✓ Reservation ${selectedCell.reservation.status}`
                      }
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-2.5 w-2.5 rounded-full animate-pulse"
                        style={{ backgroundColor: selectedCell.reservation.statusColor }}
                      ></div>
                      <span 
                        className="text-sm font-semibold px-3 py-1 rounded-full"
                        style={{ 
                          color: selectedCell.reservation.statusColor,
                          backgroundColor: `${selectedCell.reservation.statusColor}15`
                        }}
                      >
                        {selectedCell.reservation.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {selectedCell.date.toLocaleDateString()}
                    </span>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Customer Information
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Name</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedCell.reservation.customerTitle + " " + selectedCell.reservation.customerName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Mobile</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedCell.reservation.mobile}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Room & Dates */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Room & Dates
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700/50">
                        <span className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Room</span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedCell.reservation.roomCode}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700/50">
                        <span className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Nights</span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {Math.ceil((selectedCell.reservation.checkoutDate.getTime() - selectedCell.reservation.checkinDate.getTime()) / (1000 * 60 * 60 * 24))}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700/50">
                        <span className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Check-in</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedCell.reservation.checkinDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700/50">
                        <span className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Check-out</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedCell.reservation.checkoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Financial Summary
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Room Amount</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          LKR {selectedCell.reservation.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Paid Amount</span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          LKR {selectedCell.reservation.paidAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Due Amount</span>
                        <span className={`text-sm font-semibold ${
                          selectedCell.reservation.dueAmount > 0 
                            ? "text-red-600 dark:text-red-400" 
                            : "text-green-600 dark:text-green-400"
                        }`}>
                          LKR {selectedCell.reservation.dueAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Available Slot Content */
                <div className="text-center py-6">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg animate-pulse">
                    <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Room Available!</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">This room is ready for your reservation</p>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-600 dark:bg-gray-700/50">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Room</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedCell.roomCode}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Date</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedCell.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Day</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedCell.date.toLocaleDateString('en-US', { weekday: 'long' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-280"
                      onClick={() => {
                        setSelectedCell(null);
                        navigate(`/room-reservation?room=${selectedCell.roomCode}&date=${selectedCell.date.toISOString()}`);
                      }}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Book This Room
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 rounded-b-lg border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
              <button
                onClick={() => setSelectedCell(null)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add this CSS to your global styles or in a style tag */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}