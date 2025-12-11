import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import DatePicker from "../../components/form/date-picker";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import { showSuccessToast, showErrorToast } from "../../components/alert/ToastAlert";
import {API_BASE_URL, REPORT_API_URL} from "../../config/api";

// Define interfaces
interface ReceiptDto {
  receiptNo: string;
  receiptDate: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdBy: string;
}

interface ReservationDto {
  reservationNo: string;
  reservationDate: string;
  customerName: string;
  customerCode: string;
  mobile: string;
  email: string;
  checkinDate: string;
  checkoutDate: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  roomNumber: string;
  roomType: string;
  receipts: ReceiptDto[];
  statusId: number;
}

interface StatusOption {
  value: number;
  label: string;
  color?: string;
  statusId: number;
}

export default function Receipts() {
  // State management
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationDto | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  // Fetch status options
  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        const response = await fetch(`${API_BASE_URL}/api/ReservationStatus/getall`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const formatted: StatusOption[] = data
            .filter((status: any) => status.isShow)
            .map((status: any) => ({
              value: status.statusId,
              label: status.statusName,
              color: status.colorCode,
              statusId: status.statusId,
            }));
          setStatusOptions(formatted);
        } else {
          throw new Error("Failed to fetch statuses");
        }
      } catch (error) {
        console.error("Failed to fetch statuses:", error);
        showErrorToast("Failed to load status options");
      }
    };

    fetchStatusOptions();
  }, []);

  // Fetch reservations based on filters
  const fetchReservations = async () => {
    setLoading(true);
    try {
      if (!selectedStatus) {
        showErrorToast("Please select a status first");
        return;
      }

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      let url = `${API_BASE_URL}/api/RoomReservation/byStatus/${selectedStatus}`;

      // Add date range parameters if provided
      const params = new URLSearchParams();
      if (startDate) params.append('fromDate', startDate);
      if (endDate) params.append('toDate', endDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the backend data to match your frontend interface
      const transformedData: ReservationDto[] = data.map((reservation: any) => ({
        reservationNo: reservation.reservationNo,
        reservationDate: reservation.reservationDate,
        customerName: reservation.customer?.name || reservation.customerCode,
        customerCode: reservation.customerCode,
        mobile: reservation.mobile,
        email: reservation.email,
        checkinDate: reservation.checkinDateTime,
        checkoutDate: reservation.checkoutDateTime,
        totalAmount: reservation.grossAmount,
        paidAmount: reservation.paidAmount,
        dueAmount: reservation.dueAmount,
        roomNumber: reservation.roomDetails?.[0]?.roomCode || "",
        roomType: reservation.roomDetails?.[0]?.roomType || "Standard",
        statusId: reservation.statusId || 1,
        receipts: reservation.roomPayDetails?.map((payment: any) => ({
          receiptNo: payment.receiptNo,
          receiptDate: payment.refDate || reservation.reservationDate,
          amount: payment.amount,
          paymentMethod: payment.paymentType || "Cash",
          status: "Paid",
          createdBy: reservation.user || "System"
        })) || []
      }));

      setReservations(transformedData);
      showSuccessToast(`Loaded ${transformedData.length} reservations`);

    } catch (error) {
      console.error("Failed to fetch reservations:", error);
      showErrorToast("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value ? Number(value) : null);
  };

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
  };

  // Handle card click to show receipts
  const handleCardClick = (reservation: ReservationDto) => {
    setSelectedReservation(reservation);
    setShowReceiptModal(true);
  };

  // Handle receipt PDF generation
  const handleReceiptClick = async (receiptNo: string) => {
    try {
      setPdfLoading(receiptNo);
      
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      
      if (!token) {
        showErrorToast("Authentication token not found. Please login again.");
        return;
      }

      // Use your existing report API
      // const REPORT_API_URL = "http://localhost:50538";
      const url = `${REPORT_API_URL}/api/Report/ReservationPaymentPDF?receiptNo=${encodeURIComponent(receiptNo)}`;
      
      // Open in new tab (matching RoomReservation modal style)
      const newTab = window.open("", "_blank");
      if (!newTab) {
        showErrorToast("Please allow popups for this site.");
        return;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      
      if (!blob || blob.size === 0) {
        throw new Error('Empty PDF response');
      }

      const blobUrl = URL.createObjectURL(blob);
      newTab.location.href = blobUrl;

      // Cleanup
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 60000);

      showSuccessToast(`Opening receipt ${receiptNo}...`);

    } catch (error: any) {
      console.error("PDF Generation Error:", error);
      showErrorToast("Failed to generate receipt PDF");
    } finally {
      setPdfLoading(null);
    }
  };

  // Calculate totals
  const totalReservations = reservations.length;
  const totalAmount = reservations.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalPaid = reservations.reduce((sum, r) => sum + r.paidAmount, 0);
  const totalDue = reservations.reduce((sum, r) => sum + r.dueAmount, 0);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <PageMeta
        title="Receipts Management - Reservation System"
        description="Manage payment receipts"
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
            <li className="text-gray-900 dark:text-white">Receipts</li>
          </ol>
        </nav>

        {/* Header */}
        <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
          Receipts Management
        </h3>

        {/* Empty div for equal spacing */}
        <div className="w-[120px]"></div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white p-3 sm:p-5 md:px-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-8">
        <div className="mx-auto w-full">
          {/* Filter Section */}
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300 mb-6">
              Filter Reservations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <Select
                  options={statusOptions.map(opt => ({
                    value: opt.value.toString(),
                    label: opt.label
                  }))}
                  value={selectedStatus?.toString() || ""}
                  placeholder="Select Status"
                  onChange={handleStatusChange}
                  className="w-full h-10"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Date
                </label>
                <DatePicker
                  id="start-date"
                  placeholder="Select start date"
                  value={startDate}
                  onChange={(_, dateString) => handleStartDateChange(dateString)}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To Date
                </label>
                <DatePicker
                  id="end-date"
                  placeholder="Select end date"
                  value={endDate}
                  onChange={(_, dateString) => handleEndDateChange(dateString)}
                />
              </div>

              {/* Load Button */}
              <div className="flex items-end">
                <Button
                  onClick={fetchReservations}
                  disabled={loading}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-280"
                >
                  {loading ? "Loading..." : "Load Reservations"}
                </Button>
              </div>
            </div>
          </div>

          <hr className="border-gray-500 dark:border-gray-400 mb-8" />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Reservations</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalReservations}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 mr-4">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Amount</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    LKR {totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 mr-4">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Paid</div>
                  <div className="text-2xl font-bold text-green-600">
                    LKR {totalPaid.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Due</div>
                  <div className="text-2xl font-bold text-red-600">
                    LKR {totalDue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reservation Cards Section */}
          <div>
            <h2 className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300 mb-6">
              Reservations ({totalReservations})
            </h2>

            {reservations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reservations.map((reservation) => (
                  <div
                    key={reservation.reservationNo}
                    onClick={() => handleCardClick(reservation)}
                    className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-700"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {reservation.reservationNo}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(reservation.reservationDate)} • {formatTime(reservation.reservationDate)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          reservation.dueAmount === 0
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {reservation.dueAmount === 0 ? "Paid" : "Pending"}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {reservation.customerName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        📱 {reservation.mobile}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ✉️ {reservation.email}
                      </p>
                    </div>

                    {/* Room & Dates */}
                    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center text-sm mb-3">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400 mr-2">Room:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {reservation.roomNumber} ({reservation.roomType})
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Check-in</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDate(reservation.checkinDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Check-out</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDate(reservation.checkoutDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          LKR {reservation.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Amount Paid:</span>
                        <span className="font-semibold text-green-600">
                          LKR {reservation.paidAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Amount Due:</span>
                        <span className={`font-semibold ${reservation.dueAmount > 0 ? "text-red-600" : "text-gray-900 dark:text-white"}`}>
                          LKR {reservation.dueAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Receipts Count */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Receipts:</span>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium dark:bg-blue-900/30 dark:text-blue-300">
                        {reservation.receipts.length} receipt{reservation.receipts.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* No Data Message */
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No reservations found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Adjust your filters and click "Load Reservations" to see results.
                </p>
                <Button
                  onClick={fetchReservations}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Load Reservations
                </Button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading reservations...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receipts Modal - Matching RoomReservation modal style */}
      {showReceiptModal && selectedReservation && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl animate-fadeIn rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Receipts for {selectedReservation.reservationNo}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedReservation.customerName} • Room {selectedReservation.roomNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Summary Card */}
              <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-900/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      LKR {selectedReservation.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount Paid</p>
                    <p className="text-lg font-semibold text-green-600">
                      LKR {selectedReservation.paidAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount Due</p>
                    <p className="text-lg font-semibold text-red-600">
                      LKR {selectedReservation.dueAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Receipts</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {selectedReservation.receipts.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Receipts List */}
              {selectedReservation.receipts.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {selectedReservation.receipts.map((receipt) => (
                    <div
                      key={receipt.receiptNo}
                      className="group border border-gray-200 rounded-lg p-4 transition-all hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-700 dark:hover:bg-blue-900/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 transition-colors group-hover:bg-blue-200 dark:bg-blue-900/30 dark:group-hover:bg-blue-800/50">
                            <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                              Receipt: {receipt.receiptNo}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(receipt.receiptDate)} • {receipt.paymentMethod}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Paid
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Created by: {receipt.createdBy}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            LKR {receipt.amount.toLocaleString()}
                          </p>
                          <button
                            onClick={() => handleReceiptClick(receipt.receiptNo)}
                            disabled={pdfLoading === receipt.receiptNo}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {pdfLoading === receipt.receiptNo ? (
                              <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Opening...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View Receipt
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* No Receipts Message */
                <div className="text-center py-8">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No receipts found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No payment receipts available for this reservation.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 rounded-b-lg border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
              <button
                onClick={() => setShowReceiptModal(false)}
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

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #5a6678;
        }
      `}</style>
    </>
  );
}