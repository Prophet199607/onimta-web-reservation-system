import React from "react";

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
    reservationNo: string;
    checkinDate: string;
    checkoutDate: string;
    amount: number;
  };
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface Room {
  roomTypeCode: string;
  roomCode: string;
  roomSize: string;
  description: string;
  isRoom: boolean;
  isBanquet: boolean;
}

interface ReservationCalendarProps {
  reservations: Reservation[];
  onCellClick?: (
    reservation: Reservation | null,
    date: Date,
    roomName: string
  ) => void;
  dateRange?: DateRange;
  rooms?: Room[];
  loading?: boolean;
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  reservations,
  onCellClick,
  dateRange,
  rooms: fetchedRooms = [],
  loading = false,
}) => {
  // Transform fetched rooms to match the expected format
  const rooms = fetchedRooms.map((room) => ({
    name: room.roomCode,
    displayName: room.description,
    size: room.roomSize,
    code: room.roomCode,
    typeCode: room.roomTypeCode,
  }));

  // Generate dates based on date range or current month
  const generateDates = () => {
    if (dateRange?.start && dateRange?.end) {
      const dates = [];
      const currentDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      // Reset time to start of day for accurate comparison
      currentDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return dates;
    } else {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const dates = [];
      for (let i = 1; i <= daysInMonth; i++) {
        dates.push(new Date(year, month, i));
      }
      return dates;
    }
  };

  const dates = generateDates();

  // Check if a date has a reservation for a specific room
  const getReservationForCell = (
    date: Date,
    roomName: string
  ): Reservation | null => {
    // Reset time to start of day for accurate comparison
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return (
      reservations.find((reservation) => {
        const reservationStart = new Date(reservation.start);
        reservationStart.setHours(0, 0, 0, 0);
        
        const reservationEnd = reservation.end
          ? new Date(reservation.end)
          : new Date(reservationStart);
        reservationEnd.setHours(0, 0, 0, 0);

        // Check if the room matches and date is within reservation period
        const isRoomMatch = reservation.extendedProps.roomName === roomName;
        const isDateInRange = checkDate >= reservationStart && checkDate <= reservationEnd;

        return isRoomMatch && isDateInRange;
      }) || null
    );
  };

  // Handle cell click
  const handleCellClick = (date: Date, roomName: string) => {
    const reservation = getReservationForCell(date, roomName);
    onCellClick?.(reservation, date, roomName);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  // Show message if no date range selected
  if (!dateRange?.start || !dateRange?.end) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
            No Date Range Selected
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Please select a start and end date to view the calendar
          </p>
        </div>
      </div>
    );
  }

  // Show message if no rooms available
  if (rooms.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
            No Rooms Available
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Please add rooms to display the calendar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `150px 80px repeat(${dates.length}, 100px)`,
          }}
        >
          {/* Header Row */}
          <div className="sticky left-0 z-20 bg-gray-100 dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 h-[80px] w-[150px] flex items-center">
            <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm">
              Room Name
            </span>
          </div>
          <div className="sticky left-[150px] z-20 bg-gray-100 dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 h-[80px] w-[80px] flex items-center justify-center">
            <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm">
              Size
            </span>
          </div>

          {/* Date Headers */}
          {dates.map((date, index) => (
            <div
              key={index}
              className="bg-gray-100 dark:bg-gray-800 p-2 border border-gray-300 dark:border-gray-600 h-[80px] w-[100px] flex flex-col justify-center items-center"
            >
              <div className="text-gray-800 dark:text-gray-200 text-sm font-semibold">
                {date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                {date.toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </div>
            </div>
          ))}

          {/* Room Rows */}
          {rooms.map((room, roomIndex) => (
            <React.Fragment key={roomIndex}>
              {/* Room Name Cell */}
              <div className="sticky left-0 z-10 bg-blue-50 dark:bg-blue-900/20 p-3 border border-gray-300 dark:border-gray-600 h-[90px] w-[150px] flex items-center">
                <div className="flex flex-col">
                  <span className="text-gray-900 dark:text-gray-100 text-sm font-semibold">
                    {room.name}
                  </span>
                  {room.displayName !== room.name && (
                    <span className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                      {room.displayName}
                    </span>
                  )}
                </div>
              </div>

              {/* Room Size Cell */}
              <div className="sticky left-[150px] z-10 bg-purple-50 dark:bg-purple-900/20 p-2 border border-gray-300 dark:border-gray-600 h-[90px] w-[80px] flex items-center justify-center">
                <span className="text-gray-900 dark:text-gray-100 text-sm font-semibold">
                  {room.size}
                </span>
              </div>

              {/* Date Cells for this room */}
              {dates.map((date, dateIndex) => {
                const reservation = getReservationForCell(date, room.name);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                return (
                  <div
                    key={dateIndex}
                    className={`p-1 border border-gray-300 dark:border-gray-600 h-[90px] w-[100px] cursor-pointer transition-all duration-200 ${
                      reservation
                        ? "hover:opacity-80"
                        : isWeekend
                        ? "bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        : "bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    }`}
                    onClick={() => handleCellClick(date, room.name)}
                    title={
                      reservation
                        ? `${reservation.extendedProps.customerName}\nStatus: ${reservation.extendedProps.status}\nRoom: ${reservation.extendedProps.roomName}`
                        : `Available - ${room.name}\n${date.toLocaleDateString()}`
                    }
                  >
                    {reservation ? (
                      <div
                        className="h-full w-full rounded-md flex flex-col items-center justify-center text-xs font-medium text-center p-2 shadow-sm"
                        style={{
                          backgroundColor: reservation.backgroundColor,
                          borderColor: reservation.borderColor,
                          color: reservation.textColor,
                          borderWidth: "2px",
                          borderStyle: "solid",
                        }}
                      >
                        <div className="truncate w-full font-semibold mb-1">
                          {reservation.extendedProps.customerName}
                        </div>
                        <div className="text-[10px] opacity-90 truncate w-full">
                          {reservation.extendedProps.status}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <span className="text-gray-400 dark:text-gray-600 text-xs">
                          •
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {rooms.length}
            </span>{" "}
            rooms displaying{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {dates.length}
            </span>{" "}
            days
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {reservations.length}
            </span>{" "}
            total reservations
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationCalendar;