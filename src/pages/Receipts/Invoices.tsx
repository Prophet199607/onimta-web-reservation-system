import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import DatePicker from "../../components/form/date-picker";
import Button from "../../components/ui/button/Button";
import { showSuccessToast, showErrorToast } from "../../components/alert/ToastAlert";

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
}

export default function Invoices() {
  // State management
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      let url = `https://localhost:9307/api/RoomReservation/byStatus/6`;
      const params = new URLSearchParams();
      if (startDate) params.append('fromDate', startDate);
      if (endDate) params.append('toDate', endDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      console.log("🔍 DEBUG - Complete API response:", data);
      
      // Transform data - handle both cases (with and without InvoiceNo)
      const invoiceData: InvoiceDto[] = data
        .filter((reservation: any) => {
          const isFinalized = reservation.reservationStatus === "Finalized" || reservation.statusId === 6;
          return isFinalized;
        })
        .map((reservation: any) => {
          // Convert reservation number R000001 to invoice number INV000001
          const reservationNo = reservation.reservationNo;
          let invoiceNo;
          
          if (reservationNo && reservationNo.startsWith('R')) {
            // Convert R000001 to INV000001
            invoiceNo = 'INV' + reservationNo.substring(1);
          } else {
            // Fallback: use reservation number as-is
            invoiceNo = reservationNo || `INV-${reservation.reservationNo}`;
          }
          
          const invoiceDate = reservation.invoicedate || 
                            reservation.invoiceDate || 
                            reservation.InvoiceDate ||
                            reservation.reservationDate;

          console.log("🔍 DEBUG - Invoice mapping:", {
            reservationNo: reservationNo,
            finalInvoiceNo: invoiceNo
          });

          return {
            invoiceNo: invoiceNo, // This will be INV000001, INV000002, etc.
            invoiceDate: invoiceDate,
            reservationNo: reservation.reservationNo,
            customerName: reservation.customer?.name || reservation.customerName || reservation.customerCode,
            customerCode: reservation.customerCode,
            totalAmount: reservation.grossAmount || 0,
            paidAmount: reservation.paidAmount || 0,
            dueAmount: reservation.dueAmount || 0,
            status: reservation.reservationStatus || "Finalized",
            createdBy: reservation.user || "System"
          };
        });

      console.log("🔍 DEBUG - Final invoice data:", invoiceData);
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

  const handleGenerateInvoicePDF = async (invoiceNo: string) => {
    try {
      setPdfLoading(invoiceNo);
      
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      
      if (!token) {
        showErrorToast("Authentication token not found. Please login again.");
        return;
      }

      console.log("🔍 DEBUG - Generating PDF for invoice:", invoiceNo);
      
      const cleanInvoiceNo = invoiceNo.trim();
      if (!cleanInvoiceNo) {
        showErrorToast("Invalid invoice number");
        return;
      }

      const url = `http://localhost:50538/api/Report/FinalPaymentPDF?invoiceNo=${encodeURIComponent(cleanInvoiceNo)}`;
      
      console.log("🔍 DEBUG - PDF URL:", url);

      // Open in new tab (matching RoomReservation modal style)
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
      
      console.log("🔍 DEBUG - PDF Response status:", response.status);
      
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
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-700"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {invoice.invoiceNo}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(invoice.invoiceDate)}
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        📋 Reservation: {invoice.reservationNo}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Created by: {invoice.createdBy}
                      </p>
                    </div>

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

                    {/* Action Button */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleGenerateInvoicePDF(invoice.invoiceNo)}
                        disabled={pdfLoading === invoice.invoiceNo}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {pdfLoading === invoice.invoiceNo ? (
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Invoice PDF
                          </>
                        )}
                      </button>
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
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

      {/* Add CSS for animations */}
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