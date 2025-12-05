import React, { useState, useEffect, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import DatePicker from "../../components/form/date-picker";
import API_BASE_URL from "../../config/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "../../components/alert/ToastAlert";

// Interfaces
interface StatusOption {
  value: number;
  label: string;
  color: string;
}

interface CalendarRoom {
  roomId: number;
  roomName: string;
  roomSize: string;
  calendarDetails: { [key: string]: string };
}

interface ReservationCalendarDto {
  roomId: number;
  roomName: string;
  roomSize: string;
  calendarDetails: { [key: string]: string };
}

export default function Calendar() {
  const navigate = useNavigate();
  const today = new Date();
  const defaultEndDate = new Date(today);
  defaultEndDate.setDate(today.getDate() + 7);
  
  const [startDate, setStartDate] = useState<string>(formatDate(today));
  const [endDate, setEndDate] = useState<string>(formatDate(defaultEndDate));
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [calendarType, setCalendarType] = useState<number>(1); // 0: All, 1: Rooms, 2: Banquet
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [calendarData, setCalendarData] = useState<ReservationCalendarDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    reservation: any | null;
    date: string;
    dateFormatted: string;
    roomName: string;
    roomId: number;
  } | null>(null);
  
  // Helper function to format date as YYYY-MM-DD
  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

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

  // Generate date range for columns
  const generateDateColumns = (): Array<{ date: Date, key: string, display: string }> => {
    if (!startDate || !endDate) return [];
    
    const columns = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    currentDate.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    while (currentDate <= end) {
      const dateKey = `${formatDate(currentDate)} ${currentDate.toLocaleDateString('en-US', { weekday: 'long' })}`;
      columns.push({
        date: new Date(currentDate),
        key: dateKey,
        display: `${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return columns;
  };

  // Handle search using the stored procedure
  const handleSearch = async () => {
    if (!startDate || !endDate) {
      showErrorToast("Please select both start and end dates");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('startDate', `${startDate}T00:00:00`);
      params.append('endDate', `${endDate}T23:59:59`);
      params.append('calendarType', calendarType.toString());
      if (selectedStatus) {
        params.append('statusId', selectedStatus.toString());
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/ReservationCalendar/calendar?${params.toString()}`
      );
      
      const data: ReservationCalendarDto[] = response.data;
      console.log("🔍 DEBUG - Calendar Data:", data);
      
      setCalendarData(data);
      showSuccessToast(`Loaded ${data.length} rooms with reservations`);
    } catch (err: any) {
      console.error("Search error:", err);
      showErrorToast(err.response?.data?.message || "Failed to load calendar data");
      setCalendarData([]);
    } finally {
      setLoading(false);
    }
  };

  // Parse reservation detail
  const parseReservationDetail = (detail: string) => {
    if (!detail) return null;
    
    try {
      // Format: "RES001 : Mr John Doe | Confirmed"
      const parts = detail.split(' | ');
      const leftPart = parts[0];
      const status = parts[1] || 'Unknown';
      
      const reservationMatch = leftPart.match(/^(.*?) : (.*)$/);
      if (reservationMatch) {
        return {
          reservationNo: reservationMatch[1].trim(),
          customerName: reservationMatch[2].trim(),
          status: status.trim(),
          statusColor: getStatusColor(status.trim())
        };
      }
      return null;
    } catch (err) {
      console.error("Error parsing reservation detail:", err);
      return null;
    }
  };

  // Handle cell click
  const handleCellClick = (room: ReservationCalendarDto, dateKey: string, date: Date) => {
    const reservationDetail = room.calendarDetails[dateKey];
    const reservation = parseReservationDetail(reservationDetail);
    
    setSelectedCell({
      reservation,
      date: formatDate(date),
      dateFormatted: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      roomName: room.roomName,
      roomId: room.roomId
    });
  };

  const handleClear = () => {
    const today = new Date();
    const defaultEnd = new Date(today);
    defaultEnd.setDate(today.getDate() + 7);
    
    setStartDate(formatDate(today));
    setEndDate(formatDate(defaultEnd));
    setSelectedStatus(null);
    setCalendarType(1);
    setCalendarData([]);
    showSuccessToast("Filters cleared");
  };

  const dateColumns = generateDateColumns();

  // Auto-search on component mount
  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <>
      <PageMeta
        title="Reservation Calendar - Booking System"
        description="Manage and view all reservations in calendar view"
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <nav className="mb-2">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <a href="/" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  Dashboard
                </a>
              </li>
              <li className="text-gray-500">/</li>
              <li className="text-gray-900 dark:text-white font-medium">Calendar</li>
            </ol>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reservation Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all room reservations
          </p>
        </div>

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

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="p-6">
          {/* Filters Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
              {/* Calendar Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Calendar Type
                </label>
                <Select
                  options={[
                    { value: "0", label: "All" },
                    { value: "1", label: "Rooms" },
                    { value: "2", label: "Banquet" },
                  ]}
                  value={calendarType.toString()}
                  placeholder="Select type"
                  onChange={(value) => setCalendarType(parseInt(value))}
                />
              </div>

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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Refresh
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

          {/* Calendar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reservation Calendar
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {dateColumns.length > 0
                  ? `Showing ${dateColumns.length} days | ${calendarData.length} rooms`
                  : "Select a date range to view calendar"
                }
              </p>
            </div>

            <div className="p-4 overflow-auto">
              {dateColumns.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">Select dates to view calendar</p>
                </div>
              ) : (
                <div style={{ minWidth: `${200 + 100 + dateColumns.length * 120}px` }}>
                  <div className="grid" style={{ gridTemplateColumns: `200px 100px repeat(${dateColumns.length}, 120px)` }}>
                    {/* Header Row */}
                    <div className="sticky left-0 z-20 bg-gray-100 dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 h-16 flex items-center">
                      <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm">Room Name</span>
                    </div>
                    <div className="sticky left-[200px] z-20 bg-gray-100 dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 h-16 flex items-center justify-center">
                      <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm">Size</span>
                    </div>

                    {/* Date Headers */}
                    {dateColumns.map((col, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 dark:bg-gray-800 p-2 border border-gray-300 dark:border-gray-600 h-16 flex flex-col justify-center items-center"
                      >
                        <div className="text-gray-800 dark:text-gray-200 text-sm font-semibold">
                          {col.display}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                          {col.date.toLocaleDateString("en-US", { weekday: "short" })}
                        </div>
                      </div>
                    ))}

                    {/* Room Rows */}
                    {calendarData.map((room, roomIndex) => (
                      <React.Fragment key={roomIndex}>
                        <div className="sticky left-0 z-10 bg-blue-50 dark:bg-blue-900/20 p-3 border border-gray-300 dark:border-gray-600 h-20 flex items-center">
                          <div className="flex flex-col">
                            <span className="text-gray-900 dark:text-gray-100 text-sm font-semibold">
                              {room.roomName}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                              ID: {room.roomId}
                            </span>
                          </div>
                        </div>

                        <div className="sticky left-[200px] z-10 bg-purple-50 dark:bg-purple-900/20 p-2 border border-gray-300 dark:border-gray-600 h-20 flex items-center justify-center">
                          <span className="text-gray-900 dark:text-gray-100 text-sm font-semibold">
                            {room.roomSize}
                          </span>
                        </div>

                        {dateColumns.map((col, dateIndex) => {
                          const reservationDetail = room.calendarDetails[col.key];
                          const reservation = parseReservationDetail(reservationDetail);
                          const isWeekend = col.date.getDay() === 0 || col.date.getDay() === 6;

                          return (
                            <div
                              key={dateIndex}
                              className={`p-1 border border-gray-300 dark:border-gray-600 h-20 cursor-pointer transition-all duration-200 ${
                                reservation
                                  ? "hover:opacity-80"
                                  : isWeekend
                                  ? "bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  : "bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              }`}
                              onClick={() => handleCellClick(room, col.key, col.date)}
                              title={
                                reservation
                                  ? `${reservation.customerName}\nStatus: ${reservation.status}\nReservation: ${reservation.reservationNo}`
                                  : `Available - ${room.roomName}\n${col.date.toLocaleDateString()}`
                              }
                            >
                              {reservation ? (
                                <div
                                  className="h-full w-full rounded-md flex flex-col items-center justify-center text-xs font-medium text-center p-2 shadow-sm"
                                  style={{
                                    backgroundColor: reservation.statusColor,
                                    color: "#ffffff",
                                    borderWidth: "2px",
                                    borderStyle: "solid",
                                    borderColor: reservation.statusColor,
                                  }}
                                >
                                  <div className="truncate w-full font-semibold mb-1">
                                    {reservation.customerName}
                                  </div>
                                  <div className="text-[10px] opacity-90 truncate w-full">
                                    {reservation.reservationNo}
                                  </div>
                                  <div className="text-[10px] opacity-90 truncate w-full">
                                    {reservation.status}
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

      {/* Modal for Details */}
      {selectedCell && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-300 rounded-xl border border-gray-200/50 bg-white shadow-2xl dark:border-gray-700/50 dark:bg-gray-800 max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-lg transition-all ${
                  selectedCell.reservation 
                    ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                    : "bg-gradient-to-br from-green-500 to-green-600"
                }`}>
                  {selectedCell.reservation ? (
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedCell.reservation ? "Reservation Details" : "Available Slot"}
                  </h3>
                  {selectedCell.reservation && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {selectedCell.reservation.reservationNo}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="rounded-lg p-2 text-gray-400 transition-all hover:bg-white/80 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 hover:rotate-90 duration-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1">
              {selectedCell.reservation ? (
                <div className="space-y-5">
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
                      {selectedCell.dateFormatted}
                    </span>
                  </div>

                  {/* Customer Information */}
                  <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:border-blue-800/30 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Customer Information</h4>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Customer</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedCell.reservation.customerName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Reservation No</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                          {selectedCell.reservation.reservationNo}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Room Information */}
                  <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:border-purple-800/30 dark:from-purple-900/20 dark:to-pink-900/20">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Room Information</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg p-3">
                        <span className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Room</span>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {selectedCell.roomName}
                        </p>
                      </div>
                      <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg p-3">
                        <span className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Room ID</span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedCell.roomId}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        setSelectedCell(null);
                        navigate(`/reservation/${selectedCell.reservation.reservationNo}`);
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </Button>
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
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Room Available!</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">This room is ready for your reservation</p>

                  <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-5 dark:border-gray-600 dark:from-gray-700/50 dark:to-gray-700/30">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Room
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{selectedCell.roomName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Date
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedCell.dateFormatted}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
                      onClick={() => {
                        setSelectedCell(null);
                        navigate(`/room-reservation?room=${selectedCell.roomId}&date=${selectedCell.date}`);
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Book This Room
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
              <Button
                className="bg-gray-500 hover:bg-gray-600 text-white transition-all"
                onClick={() => setSelectedCell(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}