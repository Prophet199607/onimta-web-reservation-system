import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import DatePicker from "../../components/form/date-picker";
import Button from "../../components/ui/button/Button";
import { showSuccessToast, showErrorToast } from "../../components/alert/ToastAlert";
import {API_BASE_URL, REPORT_API_URL} from "../../config/api";

// Define interfaces
interface InvoiceDto {
  invoiceNo: string;
  invoiceDate: string;
  reservationNo: string;
  customerName: string;
  customerCode: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: string;
  createdBy: string;
  mobile?: string;
  email?: string;
  checkinDate?: string;
  checkoutDate?: string;
  roomNumber?: string;
  roomType?: string;
}

export default function Invoices() {
  // State management
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/RoomReservation/finalizedInvoices`;
      const params = new URLSearchParams();
      if (startDate) params.append('fromDate', startDate);
      if (endDate) params.append('toDate', endDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      // Transform data if needed (should already be in correct format)
      const invoiceData: InvoiceDto[] = data.map((invoice: any) => ({
        invoiceNo: invoice.invoiceNo || invoice.InvoiceNo || "",
        invoiceDate: invoice.invoiceDate || invoice.InvoiceDate || "",
        reservationNo: invoice.reservationNo || invoice.ReservationNo || "",
        customerName: invoice.customerName || invoice.CustomerName || invoice.customerCode || "",
        customerCode: invoice.customerCode || invoice.CustomerCode || "",
        totalAmount: invoice.totalAmount || invoice.TotalAmount || 0,
        paidAmount: invoice.paidAmount || invoice.PaidAmount || 0,
        dueAmount: invoice.dueAmount || invoice.DueAmount || 0,
        status: invoice.status || invoice.Status || "Finalized",
        createdBy: invoice.createdBy || invoice.CreatedBy || "System",
        mobile: invoice.mobile || "",
        email: invoice.email || "",
        checkinDate: invoice.checkinDate || invoice.checkinDateTime || "",
        checkoutDate: invoice.checkoutDate || invoice.checkoutDateTime || "",
        roomNumber: invoice.roomNumber || invoice.roomCode || "",
        roomType: invoice.roomType || "Standard"
      }));

      setInvoices(invoiceData);
      showSuccessToast(`Loaded ${invoiceData.length} invoices`);

    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      showErrorToast("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
  };

  // Handle card click to show invoice details
  const handleCardClick = (invoice: InvoiceDto) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleGenerateInvoicePDF = async (invoiceNo: string) => {
    try {
      setPdfLoading(invoiceNo);
      
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      
      if (!token) {
        showErrorToast("Authentication token not found. Please login again.");
        return;
      }

      const cleanInvoiceNo = invoiceNo.trim();
      if (!cleanInvoiceNo) {
        showErrorToast("Invalid invoice number");
        return;
      }

      // const REPORT_API_URL = "http://localhost:50538";
      const url = `${REPORT_API_URL}/api/Report/FinalPaymentPDF?invoiceNo=${encodeURIComponent(cleanInvoiceNo)}`;

      // Open in new tab
      const newTab = window.open("", "_blank");
      if (!newTab) {
        showErrorToast("Please allow popups for this site.");
        return;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Invoice PDF not found for: ${cleanInvoiceNo}`);
        } else {
          throw new Error(`PDF generation failed: ${response.status} ${response.statusText}`);
        }
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

      showSuccessToast(`Opening invoice ${invoiceNo}...`);

    } catch (error: any) {
      console.error("PDF Generation Error:", error);
      showErrorToast(`Failed to generate invoice PDF: ${error.message}`);
    } finally {
      setPdfLoading(null);
    }
  };

  // Filter invoices based on search
  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.reservationNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, r) => sum + r.paidAmount, 0);
  const totalDue = invoices.reduce((sum, r) => sum + r.dueAmount, 0);

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
        title="Invoice Management - Reservation System"
        description="Manage invoices"
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
            <li className="text-gray-900 dark:text-white">Invoices</li>
          </ol>
        </nav>

        {/* Header */}
        <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
          Invoice Management
        </h3>

        {/* Empty div for equal spacing */}
        <div className="w-[120px]"></div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white p-3 sm:p-5 md:px-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-8">
        <div className="mx-auto w-full">
          {/* Filter Section */}
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300 mb-6">
              Filter Invoices
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white h-10"
                  />
                  <svg className="absolute right-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Load Button */}
              <div className="flex items-end">
                <Button
                  onClick={fetchInvoices}
                  disabled={loading}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-280"
                >
                  {loading ? "Loading..." : "Load Invoices"}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Invoices</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalInvoices}</div>
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

          {/* Invoice Cards Section */}
          <div>
            <h2 className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300 mb-6">
              Invoices ({filteredInvoices.length})
            </h2>

            {filteredInvoices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInvoices.map((invoice) => (
                  <div
                    key={invoice.invoiceNo}
                    onClick={() => handleCardClick(invoice)}
                    className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-700"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {invoice.invoiceNo}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(invoice.invoiceDate)} • {formatTime(invoice.invoiceDate)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          invoice.dueAmount === 0
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {invoice.dueAmount === 0 ? "Paid" : "Pending"}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {invoice.customerName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        📱 {invoice.mobile || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        ✉️ {invoice.email || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        📋 Reservation: {invoice.reservationNo}
                      </p>
                    </div>

                    {/* Room & Dates (if available) */}
                    {(invoice.checkinDate || invoice.roomNumber) && (
                      <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        {invoice.roomNumber && (
                          <div className="flex items-center text-sm mb-3">
                            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-400 mr-2">Room:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {invoice.roomNumber} ({invoice.roomType || "Standard"})
                            </span>
                          </div>
                        )}
                        {invoice.checkinDate && invoice.checkoutDate && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Check-in</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatDate(invoice.checkinDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Check-out</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatDate(invoice.checkoutDate)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment Info */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          LKR {invoice.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Amount Paid:</span>
                        <span className="font-semibold text-green-600">
                          LKR {invoice.paidAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Amount Due:</span>
                        <span className={`font-semibold ${invoice.dueAmount > 0 ? "text-red-600" : "text-gray-900 dark:text-white"}`}>
                          LKR {invoice.dueAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Created By */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Created by:</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {invoice.createdBy}
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
                  No invoices found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {invoices.length === 0 
                    ? "Adjust your filters and click 'Load Invoices' to see results."
                    : "No invoices match your search criteria."
                  }
                </p>
                {invoices.length === 0 && (
                  <Button
                    onClick={fetchInvoices}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? "Loading..." : "Load Invoices"}
                  </Button>
                )}
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
                  Loading invoices...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Details Modal - Matching Receipts modal style */}
      {showInvoiceModal && selectedInvoice && (
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
                    Invoice Details: {selectedInvoice.invoiceNo}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedInvoice.customerName} • Reservation: {selectedInvoice.reservationNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
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
                      LKR {selectedInvoice.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount Paid</p>
                    <p className="text-lg font-semibold text-green-600">
                      LKR {selectedInvoice.paidAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount Due</p>
                    <p className="text-lg font-semibold text-red-600">
                      LKR {selectedInvoice.dueAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedInvoice.dueAmount === 0
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}>
                      {selectedInvoice.dueAmount === 0 ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-600">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer Name</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedInvoice.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer Code</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedInvoice.customerCode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mobile</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedInvoice.mobile || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedInvoice.email || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Reservation Details */}
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-600">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Reservation Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reservation Number</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedInvoice.reservationNo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Invoice Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedInvoice.invoiceDate)}</p>
                    </div>
                    {selectedInvoice.roomNumber && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Room Number</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedInvoice.roomNumber}</p>
                      </div>
                    )}
                    {selectedInvoice.roomType && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Room Type</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedInvoice.roomType}</p>
                      </div>
                    )}
                    {selectedInvoice.checkinDate && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Check-in Date</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedInvoice.checkinDate)}</p>
                      </div>
                    )}
                    {selectedInvoice.checkoutDate && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Check-out Date</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedInvoice.checkoutDate)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-600">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        LKR {selectedInvoice.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Amount Paid:</span>
                      <span className="font-semibold text-green-600">
                        LKR {selectedInvoice.paidAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Amount Due:</span>
                      <span className={`font-semibold ${selectedInvoice.dueAmount > 0 ? "text-red-600" : "text-gray-900 dark:text-white"}`}>
                        LKR {selectedInvoice.dueAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 rounded-b-lg border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleGenerateInvoicePDF(selectedInvoice.invoiceNo);
                  setShowInvoiceModal(false);
                }}
                disabled={pdfLoading === selectedInvoice.invoiceNo}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pdfLoading === selectedInvoice.invoiceNo ? (
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
                    View Invoice PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for animations and scrollbar */}
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