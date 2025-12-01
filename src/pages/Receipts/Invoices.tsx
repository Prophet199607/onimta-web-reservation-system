// import { useState, } from "react";
// import PageMeta from "../../components/common/PageMeta";
// import DatePicker from "../../components/form/date-picker";

// import Button from "../../components/ui/button/Button";

// // Define interfaces
// interface InvoiceDto {
//   invoiceNo: string;
//   invoiceDate: string;
//   reservationNo: string;
//   customerName: string;
//   customerCode: string;
//   totalAmount: number;
//   paidAmount: number;
//   dueAmount: number;
//   status: string;
//   createdBy: string;
// }

// // interface StatusOption {
// //   value: number;
// //   label: string;
// //   color?: string;
// // }

// export default function Invoices() {
//   // State management

//   const [startDate, setStartDate] = useState<string>("");
//   const [endDate, setEndDate] = useState<string>("");
// //   const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
//   const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   // Fetch status options
// //   useEffect(() => {
// //     fetch("https://localhost:9307/api/ReservationStatus/getall")
// //       .then((res) => res.json())
// //       .then((data) => {
// //         const formatted: StatusOption[] = data
// //           .filter((status: any) => status.isShow)
// //           .map((status: any) => ({
// //             value: status.statusId,
// //             label: status.statusName,
// //             color: status.colorCode,
// //           }));
// //         setStatusOptions(formatted);
// //       })
// //       .catch((err) => console.error("Failed to fetch statuses:", err));
// //   }, []);

// // Replace your current fetchInvoices function with this:

// // Update your fetchInvoices to log the exact invoice numbers being used
// const fetchInvoices = async () => {
//   setLoading(true);
//   try {
//     let url = `https://localhost:9307/api/RoomReservation/byStatus/6`;
//     const params = new URLSearchParams();
//     if (startDate) params.append('fromDate', startDate);
//     if (endDate) params.append('toDate', endDate);

//     if (params.toString()) {
//       url += `?${params.toString()}`;
//     }

//     const res = await fetch(url);

//     if (!res.ok) {
//       throw new Error(`HTTP error! status: ${res.status}`);
//     }

//     const data = await res.json();
    
//     console.log("🔍 DEBUG - Complete API response:", data);
    
//     // Check if InvoiceNo field exists in the response
//     if (data.length > 0) {
//       const firstReservation = data[0];
//       console.log("🔍 DEBUG - Available fields:", Object.keys(firstReservation));
//       console.log("🔍 DEBUG - InvoiceNo field value:", firstReservation.InvoiceNo);
//       console.log("🔍 DEBUG - invoiceNo field value:", firstReservation.invoiceNo);
//       console.log("🔍 DEBUG - reservationNo field value:", firstReservation.reservationNo);
//     }

//     // Transform data - handle both cases (with and without InvoiceNo)
// // In your fetchInvoices function, update the invoice number mapping:
// const invoiceData: InvoiceDto[] = data
//   .filter((reservation: any) => {
//     const isFinalized = reservation.reservationStatus === "Finalized" || reservation.statusId === 6;
//     return isFinalized;
//   })
//   .map((reservation: any) => {
//     // Convert reservation number R000001 to invoice number INV000001
//     const reservationNo = reservation.reservationNo;
//     let invoiceNo;
    
//     if (reservationNo && reservationNo.startsWith('R')) {
//       // Convert R000001 to INV000001
//       invoiceNo = 'INV' + reservationNo.substring(1);
//     } else {
//       // Fallback: use reservation number as-is
//       invoiceNo = reservationNo || `INV-${reservation.reservationNo}`;
//     }
    
//     const invoiceDate = reservation.invoicedate || 
//                        reservation.invoiceDate || 
//                        reservation.InvoiceDate ||
//                        reservation.reservationDate;

//     console.log("🔍 DEBUG - Invoice mapping:", {
//       reservationNo: reservationNo,
//       finalInvoiceNo: invoiceNo
//     });

//     return {
//       invoiceNo: invoiceNo, // This will be INV000001, INV000002, etc.
//       invoiceDate: invoiceDate,
//       reservationNo: reservation.reservationNo,
//       customerName: reservation.customer?.name || reservation.customerName || reservation.customerCode,
//       customerCode: reservation.customerCode,
//       totalAmount: reservation.grossAmount || 0,
//       paidAmount: reservation.paidAmount || 0,
//       dueAmount: reservation.dueAmount || 0,
//       status: reservation.reservationStatus || "Finalized",
//       createdBy: reservation.user || "System"
//     };
//   });

//     console.log("🔍 DEBUG - Final invoice data:", invoiceData);
//     setInvoices(invoiceData);

//   } catch (error) {
//     console.error("Failed to fetch invoices:", error);
//     alert("Failed to load invoices");
//   } finally {
//     setLoading(false);
//   }
// };



//   const handleStartDateChange = (date: string) => {
//     setStartDate(date);
//   };

//   const handleEndDateChange = (date: string) => {
//     setEndDate(date);
//   };

// const handleGenerateInvoicePDF = async (invoiceNo: string) => {
//   try {
//     const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    
//     if (!token) {
//       alert("Authentication token not found. Please login again.");
//       return;
//     }

//     console.log("🔍 DEBUG - Generating PDF for invoice:", invoiceNo);
    
//     const cleanInvoiceNo = invoiceNo.trim();
//     if (!cleanInvoiceNo) {
//       alert("Invalid invoice number");
//       return;
//     }

//     const url = `http://localhost:50538/api/Report/FinalPaymentPDF?invoiceNo=${encodeURIComponent(cleanInvoiceNo)}`;
    
//     console.log("🔍 DEBUG - PDF URL:", url);

//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     });
    
//     console.log("🔍 DEBUG - PDF Response status:", response.status);
    
//     if (!response.ok) {
//       if (response.status === 404) {
//         throw new Error(`Invoice PDF not found for: ${cleanInvoiceNo}`);
//       } else {
//         throw new Error(`PDF generation failed: ${response.status} ${response.statusText}`);
//       }
//     }

//     // Open PDF in new tab
//     const newTab = window.open(url, '_blank');
//     if (!newTab) {
//       alert("Please allow popups to view invoices");
//     }
    
//   } catch (error: any) {
//     console.error("PDF Generation Error:", error);
//     alert(`Failed to generate invoice PDF: ${error.message}`);
//   }
// };
//   // Filter invoices based on search
//   const filteredInvoices = invoices.filter(invoice =>
//     invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     invoice.reservationNo?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Calculate totals
//   const totalInvoices = invoices.length;
//   const totalAmount = invoices.reduce((sum, r) => sum + r.totalAmount, 0);
//   const totalPaid = invoices.reduce((sum, r) => sum + r.paidAmount, 0);
//   const totalDue = invoices.reduce((sum, r) => sum + r.dueAmount, 0);

//   return (
//     <>
//       <PageMeta
//         title="Invoice Management - Reservation System"
//         description="Manage invoices"
//       />

//       <div className="flex items-center justify-between mb-6">
//         <nav>
//           <ol className="flex items-center space-x-2 text-sm">
//             <li>
//               <a href="/" className="text-gray-500 hover:text-gray-700">
//                 Dashboard
//               </a>
//             </li>
//             <li className="text-gray-500">/</li>
//             <li className="text-gray-900 dark:text-white">Invoices</li>
//           </ol>
//         </nav>

//         <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
//           Invoice Management
//         </h3>

//         <div className="w-[120px]"></div>
//       </div>

//       {/* Filter Section */}
//       <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 dark:bg-gray-800 dark:border-gray-700">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//           {/* Status Filter */}
//           {/* <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Status
//             </label>
//             <Select
//               options={statusOptions.map(opt => ({
//                 value: opt.value.toString(),
//                 label: opt.label
//               }))}
//               value={selectedStatus?.toString() || ""}
//               placeholder="Select Status"
//               onChange={handleStatusChange}
//             />
//           </div> */}

//           {/* Start Date */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               From Date
//             </label>
//             <DatePicker
//               id="start-date"
//               placeholder="Select start date"
//               value={startDate}
//               onChange={(_, dateString) => handleStartDateChange(dateString)}
//             />
//           </div>

//           {/* End Date */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               To Date
//             </label>
//             <DatePicker
//               id="end-date"
//               placeholder="Select end date"
//               value={endDate}
//               onChange={(_, dateString) => handleEndDateChange(dateString)}
//             />
//           </div>
//         </div>

//         {/* Search and Load Buttons */}
//         <div className="flex justify-between items-center">
//           <div className="w-64">
//             <input
//               type="text"
//               placeholder="Search Reservation..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         <Button
//   onClick={fetchInvoices}
//   disabled={loading}
//   className="bg-blue-600 hover:bg-blue-700 text-white px-8"
// >
        
//   {loading ? "Loading..." : "Load Invoices"}
//           </Button>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
//           <div className="text-sm text-gray-600 dark:text-gray-400">Total Invoices</div>
//           <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalInvoices}</div>
//         </div>
//         <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
//           <div className="text-sm text-gray-600 dark:text-gray-400">Total Amount</div>
//           <div className="text-2xl font-bold text-gray-900 dark:text-white">
//             LKR {totalAmount.toLocaleString()}
//           </div>
//         </div>
//         <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
//           <div className="text-sm text-gray-600 dark:text-gray-400">Total Paid</div>
//           <div className="text-2xl font-bold text-green-600">
//             LKR {totalPaid.toLocaleString()}
//           </div>
//         </div>
//         <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
//           <div className="text-sm text-gray-600 dark:text-gray-400">Total Due</div>
//           <div className="text-2xl font-bold text-red-600">
//             LKR {totalDue.toLocaleString()}
//           </div>
//         </div>
//       </div>


// <thead className="bg-gray-50 dark:bg-gray-700">
//   <tr>
//     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
//       Reservation No
//     </th>
//     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
//       Invoice No
//     </th>
//     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
//       Date
//     </th>
//     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
//       Customer
//     </th>
//     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
//       Total Amount
//     </th>
//     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
//       Paid Amount
//     </th>
//     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
//       Due Amount
//     </th>
//     <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
//       Status
//     </th>
//     <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
//       Actions
//     </th>
//   </tr>
// </thead>

// <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
//   {filteredInvoices.map((invoice) => (
//     <tr key={invoice.invoiceNo} className="hover:bg-gray-50 dark:hover:bg-gray-700">
//       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
//         {invoice.reservationNo}
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
//         {invoice.invoiceNo}
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
//         {new Date(invoice.invoiceDate).toLocaleDateString()}
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
//         {invoice.customerName}
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
//         LKR {invoice.totalAmount.toLocaleString()}
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
//         LKR {invoice.paidAmount.toLocaleString()}
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
//         LKR {invoice.dueAmount.toLocaleString()}
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap text-center">
//         <span
//           className={`px-2 py-1 rounded-full text-xs font-medium ${
//             invoice.dueAmount === 0
//               ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
//               : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
//           }`}
//         >
//           {invoice.dueAmount === 0 ? "Paid" : "Pending"}
//         </span>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap text-center">
//         <button
//           onClick={() => handleGenerateInvoicePDF(invoice.invoiceNo)}
//           className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
//         >
//           View PDF
//         </button>
//       </td>
//     </tr>
//   ))}
// </tbody>
//     </>
//   );
// }

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
      
      // Check if InvoiceNo field exists in the response
      if (data.length > 0) {
        const firstReservation = data[0];
        console.log("🔍 DEBUG - Available fields:", Object.keys(firstReservation));
        console.log("🔍 DEBUG - InvoiceNo field value:", firstReservation.InvoiceNo);
        console.log("🔍 DEBUG - invoiceNo field value:", firstReservation.invoiceNo);
        console.log("🔍 DEBUG - reservationNo field value:", firstReservation.reservationNo);
      }

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

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
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

      // Open PDF in new tab
      const newTab = window.open(url, '_blank');
      if (!newTab) {
        showErrorToast("Please allow popups to view invoices");
      }
      
    } catch (error: any) {
      console.error("PDF Generation Error:", error);
      showErrorToast(`Failed to generate invoice PDF: ${error.message}`);
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
        {/* Filter Section */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">
            Filter Invoices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              <input
                type="text"
                placeholder="Search by invoice, reservation, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Load Button */}
          <div className="flex justify-end">
            <Button
              onClick={fetchInvoices}
              disabled={loading}
              className="w-full md:w-auto h-10 bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {loading ? "Loading..." : "Load Invoices"}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Invoices</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalInvoices}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Amount</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              LKR {totalAmount.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Paid</div>
            <div className="text-2xl font-bold text-green-600">
              LKR {totalPaid.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Due</div>
            <div className="text-2xl font-bold text-red-600">
              LKR {totalDue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Invoice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.invoiceNo}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {invoice.invoiceNo}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    invoice.dueAmount === 0
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}
                >
                  {invoice.dueAmount === 0 ? "Paid" : "Pending"}
                </span>
              </div>

              {/* Customer Info */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {invoice.customerName}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reservation: {invoice.reservationNo}
                </p>
              </div>

              {/* Payment Info */}
              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    LKR {invoice.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Paid:</span>
                  <span className="font-medium text-green-600">
                    LKR {invoice.paidAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Due:</span>
                  <span className={`font-medium ${
                    invoice.dueAmount > 0 ? "text-red-600" : "text-gray-900 dark:text-white"
                  }`}>
                    LKR {invoice.dueAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleGenerateInvoicePDF(invoice.invoiceNo)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Invoice PDF
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Data Message */}
        {filteredInvoices.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No invoices found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {invoices.length === 0 
                ? "Adjust your filters and click 'Load Invoices' to see results."
                : "No invoices match your search criteria."
              }
            </p>
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
    </>
  );
}