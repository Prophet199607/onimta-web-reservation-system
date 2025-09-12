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
    name: room.description,
    size: room.roomSize,
    code: room.roomCode,
    typeCode: room.roomTypeCode,
  }));

  // Generate dates based on date range or current month
  const generateDates = () => {
    if (dateRange?.start && dateRange?.end) {
      // Generate dates for the selected range
      const dates = [];
      const currentDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return dates;
    } else {
      // Generate dates for current month (default behavior)
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
    return (
      reservations.find((reservation) => {
        const reservationStart = new Date(reservation.start);
        const reservationEnd = reservation.end
          ? new Date(reservation.end)
          : reservationStart;

        // Check if the room matches and date is within reservation period
        return (
          reservation.extendedProps.roomName === roomName &&
          date >= reservationStart &&
          date <= reservationEnd
        );
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
          <p className="text-gray-600 dark:text-gray-400">Loading rooms...</p>
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
            gridTemplateColumns: `100px 100px repeat(${dates.length}, 100px)`,
          }}
        >
          {/* Header Row */}
          <div className="sticky left-0 z-10 bg-gray-100 dark:bg-gray-800 p-2 border-[1px] border-gray-300 dark:border-gray-600 h-[100px] w-[100px]">
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              Room Name
            </span>
          </div>
          <div className="sticky left-[100px] z-10 bg-gray-100 dark:bg-gray-800 p-2 border-[1px] border-gray-300 dark:border-gray-600 h-[100px] w-[100px]">
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              Size
            </span>
          </div>

          {/* Date Headers */}
          {dates.map((date, index) => (
            <div
              key={index}
              className="bg-gray-100 dark:bg-gray-800 p-2 border-[1px] border-gray-300 dark:border-gray-600 h-[100px] w-[100px]"
            >
              <div className="text-gray-800 dark:text-gray-200 text-xs font-medium">
                {date.toISOString().split("T")[0]}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs">
                {date.toLocaleDateString("en-US", {
                  weekday: "long",
                })}
              </div>
            </div>
          ))}

          {/* Room Rows */}
          {rooms.map((room, roomIndex) => (
            <React.Fragment key={roomIndex}>
              {/* Room Name Cell */}
              <div className="sticky left-0 z-10 bg-green-300 dark:bg-green-300 p-2 border-[1px] border-gray-300 dark:border-gray-600 h-[100px] w-[100px] flex items-center">
                <span className="text-gray-800 dark:text-gray-800 text-sm font-medium">
                  {room.name}
                </span>
              </div>

              {/* Room Size Cell */}
              <div className="sticky left-[100px] z-10 bg-pink-300 dark:bg-pink-300 p-2 border-[1px] border-gray-300 dark:border-gray-600 text-center h-[100px] w-[100px] flex items-center justify-center">
                <span className="text-gray-800 dark:text-gray-800 text-sm font-medium">
                  {room.size}
                </span>
              </div>

              {/* Date Cells for this room */}
              {dates.map((date, dateIndex) => {
                const reservation = getReservationForCell(date, room.name);

                return (
                  <div
                    key={dateIndex}
                    className="p-2 border-[1px] border-gray-300 dark:border-gray-600 h-[100px] w-[100px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleCellClick(date, room.name)}
                    title={
                      reservation
                        ? `${reservation.extendedProps.customerName} - ${reservation.extendedProps.status}`
                        : `Available - ${room.name}`
                    }
                  >
                    {reservation && (
                      <div
                        className="h-full w-full rounded flex items-center justify-center text-xs font-medium text-center p-1"
                        style={{
                          backgroundColor: reservation.backgroundColor,
                          borderColor: reservation.borderColor,
                          color: reservation.textColor,
                        }}
                      >
                        <div className="truncate">
                          {reservation.extendedProps.customerName}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReservationCalendar;
