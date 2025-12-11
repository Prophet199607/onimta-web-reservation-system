import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import DatePicker from "../../components/form/date-picker";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import { useNavigate } from "react-router-dom"; //add new navoda
import axios from "axios";
import { API_BASE_URL, REPORT_API_URL } from "../../config/api";

// Define StatusOption type
interface StatusOption {
  value: number;
  label: string;
  color?: string;
}

interface ReservationDto {
  reservationNo: string;
  reservationDate: string;
  reservationType: number;
  customerCode: string;
  mobile: string;
  telephone: string;
  email: string;
  travelAgentCode: string;
  checkinDateTime: string;
  checkoutDateTime: string;
  noOfVehicles: number;
  noOfAdults: number;
  noOfKids: number;
  eventType: string;
  setupStyle: string;
  subTotal: number;
  discountPer: number;
  discount: number;
  grossAmount: number;
  paidAmount: number;
  dueAmount: number;
  reservationNote: string;
  refundAmount: number;
  refundNote: string;
  referenceNo: string;
  bookingResourceId: number;
  bookingReferenceNo: string;
  reservationStatus: string;
  user: string;

  // Add these customer properties that your backend returns
  customerTypeCode: string;
  title: string;
  customerName: string;
  nic_PassportNo: string;
  nationalityCode: string;
  countryCode: string;
  address: string;
  creditLimit: number;

  // Add detail arrays
  roomDetails: RoomDetailDto[];
  serviceDetails: ServiceDetailDto[];
  roomPayDetails: RoomPaymentDetailDto[];
}

interface RoomDetailDto {
  roomCode: string;
  packageCode: string;
  noOfDays: number;
  price: number;
  amount: number;
  checkinDate: string;
  checkoutDate: string;
}

interface ServiceDetailDto {
  serviceTypeCode: string;
  serviceDate: string;
  serviceQuantity: number;
  serviceAmount: number;
  serviceTotalAmount: number;
  serviceRemark: string;
}

interface RoomPaymentDetailDto {
  paymentId: number;
  amount: number;
  refNo: string;
  refDate: string;
  receiptNo: string;
}

export default function InOut() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReservationReceipts, setSelectedReservationReceipts] = useState<string[]>([]);
  const [selectedReservationInvoice, setSelectedReservationInvoice] = useState<string | null>(null);
  const [selectedReservationNo, setSelectedReservationNo] = useState<string | null>(null);



useEffect(() => {
  const fetchStatuses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/ReservationStatus/getall`);
      const data = response.data;

      const formatted: StatusOption[] = data
        .filter((status: any) => status.isShow)
        .map((status: any) => ({
          value: status.statusId,
          label: status.statusName,
          color: status.colorCode,
        }));

      setStatusOptions(formatted);
    } catch (err) {
      console.error("Failed to fetch statuses:", err);
    }
  };

  fetchStatuses();
}, []);

  // Fetch reservations by status and date range
  const fetchReservationsByStatus = async (statusId: number, fromDate?: string, toDate?: string) => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/RoomReservation/byStatus/${statusId}`;

      // Add date range parameters if provided
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setReservations(data || []);

    } catch (err) {
      console.error("Failed to fetch reservations:", err);
      // Fallback to mock data for testing
      const mockData: ReservationDto[] = [
        {
          reservationNo: "R0001",
          reservationDate: new Date().toISOString(),
          reservationType: 1,
          customerCode: "CUST001",
          customerName: "John Doe",
          mobile: "0771234567",
          telephone: "0111234567",
          email: "john@example.com",
          travelAgentCode: "TravelX",
          subTotal: 1000,
          discountPer: 5,
          discount: 50,
          grossAmount: 950,
          paidAmount: 500,
          dueAmount: 450,
          checkinDateTime: new Date().toISOString(),
          checkoutDateTime: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          noOfVehicles: 1,
          noOfAdults: 2,
          noOfKids: 0,
          eventType: "",
          setupStyle: "",
          reservationNote: "VIP Customer",
          refundAmount: 0,
          refundNote: "",
          referenceNo: "",
          bookingResourceId: 1,
          bookingReferenceNo: "BR001",
          reservationStatus: "Checked In",
          user: "admin",
          customerTypeCode: "IND",
          title: "Mr",
          nic_PassportNo: "123456789V",
          nationalityCode: "LK",
          countryCode: "LK",
          address: "123 Main St",
          creditLimit: 1000,
          roomDetails: [
            {
              roomCode: "101",
              packageCode: "STD",
              noOfDays: 2,
              price: 500,
              amount: 1000,
              checkinDate: new Date().toISOString(),
              checkoutDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          serviceDetails: [
            {
              serviceTypeCode: "BREAKFAST",
              serviceDate: new Date().toISOString(),
              serviceQuantity: 2,
              serviceAmount: 50,
              serviceTotalAmount: 100,
              serviceRemark: "Standard breakfast"
            }
          ],
          roomPayDetails: [
            {
              paymentId: 1,
              amount: 500,
              refNo: "REF001",
              refDate: new Date().toISOString(),
              receiptNo: "RCP001"
            }
          ]
        },
        {
          reservationNo: "R0002",
          reservationDate: new Date().toISOString(),
          reservationType: 1,
          customerCode: "CUST002",
          customerName: "Jane Smith",
          mobile: "0777654321",
          telephone: "0117654321",
          email: "jane@example.com",
          travelAgentCode: "TourPlus",
          subTotal: 2000,
          discountPer: 5,
          discount: 100,
          grossAmount: 1900,
          paidAmount: 1000,
          dueAmount: 900,
          checkinDateTime: new Date().toISOString(),
          checkoutDateTime: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          noOfVehicles: 1,
          noOfAdults: 2,
          noOfKids: 1,
          eventType: "",
          setupStyle: "",
          reservationNote: "Early check-in requested",
          refundAmount: 0,
          refundNote: "",
          referenceNo: "",
          bookingResourceId: 1,
          bookingReferenceNo: "BR002",
          reservationStatus: "Reserved",
          user: "admin",
          customerTypeCode: "IND",
          title: "Ms",
          nic_PassportNo: "987654321V",
          nationalityCode: "LK",
          countryCode: "LK",
          address: "456 Oak St",
          creditLimit: 1500,
          roomDetails: [
            {
              roomCode: "102",
              packageCode: "DLX",
              noOfDays: 3,
              price: 700,
              amount: 2100,
              checkinDate: new Date().toISOString(),
              checkoutDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          serviceDetails: [
            {
              serviceTypeCode: "DINNER",
              serviceDate: new Date().toISOString(),
              serviceQuantity: 2,
              serviceAmount: 75,
              serviceTotalAmount: 150,
              serviceRemark: "Special dinner"
            }
          ],
          roomPayDetails: [
            {
              paymentId: 2,
              amount: 1000,
              refNo: "REF002",
              refDate: new Date().toISOString(),
              receiptNo: "RCP002"
            }
          ]
        },
      ];
      setReservations(mockData);
    } finally {
      setLoading(false);
    }
  };

  // Handle status change
const handleStatusChange = (value: string) => {
  const id = Number(value);
  setSelectedStatus(id);
  // Don't fetch here - let user set dates first
};

  const handleStartDateChange = (date: string) => {
    setStartDate(date);

   
  };
const handleEndDateChange = (date: string) => {
  setEndDate(date);
  // Don't auto-fetch when changing dates
};

// Add a new manual fetch function
const handleFetchData = () => {
  if (!selectedStatus) {
    alert("Please select a status first");
    return;
  }
  
  if (!startDate || !endDate) {
    alert("Please select both start and end dates");
    return;
  }

  fetchReservationsByStatus(selectedStatus, startDate, endDate);
};
  const filteredReservations = reservations.filter(r =>
  r.reservationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
  r.customerCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  r.mobile?.includes(searchTerm)
);



  // Calculate total reservations and amount for status summary
  const statusSummary = statusOptions.map(status => ({
    ...status,
    total: reservations.filter(r => r.reservationStatus === status.label).length,
    amount: reservations
      .filter(r => r.reservationStatus === status.label)
      .reduce((sum, r) => sum + r.grossAmount, 0)
  }));

  // Calculate total number of days
  const getTotalDays = (reservation: ReservationDto) => {
    return reservation.roomDetails?.reduce((sum, room) => sum + room.noOfDays, 0) || 0;
  };

  // Handle view button click
  const handleViewData = () => {
    if (reservations.length > 0) {
      setShowModal(true);
    } else {
      alert("No data available to view. Please select filters and refresh.");
    }
  };

  // Update ONLY the handleAddToReservation function in your InOut component
  const handleAddToReservation = () => {
    if (selectedRow) {
      // Find the selected reservation
      const selectedReservation = reservations.find(r => r.reservationNo === selectedRow);

      if (selectedReservation) {
        console.log("Sending complete reservation data to Room Reservation:", selectedReservation);

        // Navigate to Room Reservation page and pass ALL the data as-is
        navigate('/room-reservation', {
          state: {
            selectedReservation: selectedReservation
          }
        });

        // Close the modal after navigation
        setShowModal(false);
      } else {
        alert("Selected reservation not found");
      }
    } else {
      alert("Please select a reservation first by clicking on a row");
    }
  };

  // const API_BASE_URL = "https://localhost:9307";
  // const REPORT_API_URL = "http://localhost:50538";

  const fetchReceiptNumbers = async (reservationNo: string): Promise<string[]> => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    
    if (!reservationNo?.trim()) {
      console.error("Empty reservation number provided");
      return [];
    }

    const url = `${REPORT_API_URL}/api/Report/GetReceiptsByReservation?reservationNo=${encodeURIComponent(reservationNo.trim())}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch receipts: ${response.status}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.warn("Unexpected response format for receipts:", data);
      return [];
    }

    // Filter out empty or invalid receipt numbers
    const validReceipts = data.filter((receipt: any) => 
      receipt && receipt.toString().trim() !== ''
    );
    
    return validReceipts;

  } catch (error: any) {
    console.error("Error fetching receipts:", error);
    return [];
  }
};

const fetchInvoiceNumber = async (reservationNo: string): Promise<string | null> => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    
    if (!reservationNo?.trim()) {
      return null;
    }

    // Option 1: Try to get it from the loaded reservation data
    // const selectedReservation = reservations.find(r => r.reservationNo === reservationNo);
    // if (selectedReservation?.invoiceNo) {
    //   return selectedReservation.invoiceNo;
    // }

    // Option 2: Fetch invoices for the date range and find the specific one
    // But first, let's check if we have a better API endpoint
    // Based on your invoice page, the correct endpoint is:
    const url = `${API_BASE_URL}/api/RoomReservation/finalizedInvoices`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      // Find the invoice for this reservation
      const invoiceData = data.find((invoice: any) => 
        invoice.reservationNo === reservationNo || 
        invoice.ReservationNo === reservationNo
      );
      
      if (invoiceData) {
        return invoiceData.invoiceNo || invoiceData.InvoiceNo || null;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return null;
  }
};


const handleViewDetails = async () => {
  if (!selectedRow) {
    alert("Please select a reservation first");
    return;
  }

  try {
    // Fetch receipts and invoice for the selected reservation
    const [receipts, invoiceNo] = await Promise.all([
      fetchReceiptNumbers(selectedRow),
      fetchInvoiceNumber(selectedRow)
    ]);

    setSelectedReservationReceipts(receipts);
    setSelectedReservationInvoice(invoiceNo);
    setSelectedReservationNo(selectedRow);
    setShowReceiptModal(true);

  } catch (error) {
    console.error("Error loading reservation details:", error);
    alert("Failed to load reservation details");
  }
};

const handleGenerateReceiptPDF = async (receiptNo: string) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    
    if (!token) {
      alert("Authentication token not found. Please login again.");
      return;
    }

    const url = `${REPORT_API_URL}/api/Report/ReservationPaymentPDF?receiptNo=${encodeURIComponent(receiptNo)}`;
    
    // Open in new tab
    const newTab = window.open(url, '_blank');
    if (!newTab) {
      alert("Please allow popups to view receipts");
    }
    
  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    alert("Failed to generate receipt PDF");
  }
};

const handleGenerateInvoicePDF = async (invoiceNo: string) => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    
    if (!token) {
      alert("Authentication token not found. Please login again.");
      return;
    }

    const url = `${REPORT_API_URL}/api/Report/FinalPaymentPDF?invoiceNo=${encodeURIComponent(invoiceNo)}`;
    
    // Open in new tab
    const newTab = window.open(url, '_blank');
    if (!newTab) {
      alert("Please allow popups to view invoice");
    }
    
  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    alert("Failed to generate invoice PDF");
  }
};

  return (
    <>
      <PageMeta
        title="In/Out Movements Information - Reservation System"
        description="Manage guest information"
      />

      <div className="flex items-center justify-between mb-6">
        <nav>
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/" className="text-gray-500 hover:text-gray-700">
                Dashboard
              </a>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 dark:text-white">In/Out Movements</li>
          </ol>
        </nav>

        <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
          In/Out Movements Information
        </h3>

        <div className="w-[120px]"></div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-8">
        <div className="mx-auto w-full   max-w-[1400px]">
          {/* UPDATED: Clean Layout with Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Date Range Filter */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h6 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Reservation Date Range
              </h6>
              <div className="grid grid-cols-1 gap-3">
                <DatePicker
                  id="start-date-picker"
                  placeholder="From Date"
                  value={startDate} // Add this
                  onChange={(_, dateString) => handleStartDateChange(dateString)}
                />
                <DatePicker
                  id="end-date-picker"
                  placeholder="To Date"
                  value={endDate} // Add this
                  onChange={(_, dateString) => handleEndDateChange(dateString)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h6 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Status Filter
              </h6>
              <Select
                options={statusOptions.map((opt) => ({
                  ...opt,
                  value: opt.value.toString(),
                }))}
                value={selectedStatus?.toString() || ""}
                placeholder="Select Status Type"
                className="mb-0 w-full"
                onChange={handleStatusChange}
              />
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-center">
              <div className="space-y-3">
               <Button
  onClick={handleFetchData}
  disabled={!selectedStatus || !startDate || !endDate || loading}
  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
>
  {loading ? "Loading..." : "Load Data"}
</Button>
                <Button
                  onClick={handleViewData}
                  disabled={reservations.length === 0}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-5 py-3.5 text-sm shadow-theme-xs disabled:bg-brand-300"
                >
                  View Data ({reservations.length})
                </Button>
              </div>
            </div>
          </div>

          {/*UPDATED: Status Summary Table Only */}
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                Reservation Summary
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Reservations: {reservations.length} |
                Total Amount: LKR{reservations.reduce((sum, r) => sum + r.grossAmount, 0).toLocaleString()}
              </p>
            </div>

            <div className="overflow-hidden">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-gray-800">
                  <TableRow>
                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-sm">
                      Status Type
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-sm text-center">
                      Count
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-sm text-center">
                      Percentage
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-sm text-right">
                      Total Amount
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {statusSummary.map((status) => (
                    <TableRow key={status.value} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: status.color }}
                          ></div>
                          {status.label}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-center">
                        <span className="font-semibold">{status.total}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-center">
                        {reservations.length > 0
                          ? `${((status.total / reservations.length) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-right">
                        <span className="font-semibold">
                          LKR{status.amount.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Total Row */}
                  <TableRow className="bg-gray-50 dark:bg-gray-800 font-semibold">
                    <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      TOTAL
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-center">
                      {reservations.length}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-center">
                      100%
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-right">
                      LKR{reservations.reduce((sum, r) => sum + r.grossAmount, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* CLEAN MODERN MODAL - Navbar fully hidden */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center ">

          {/* DARK BACKDROP to hide navbar */}
          <div className=" absolute inset-0 bg-black/70 backdrop-blur-sm "></div>

          {/* MODAL CONTAINER */}
          <div className="border rounded-lg relative z-[100000] w-full max-w-400 max-h-[90vh] bg-white shadow-2xl flex flex-col">


            {/* HEADER */}
            <div className="border rounded-lg px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 items-center">Reservation Details</h2>

<div className="pl-0 pr-250 py-2.5">   
<div className="relative w-full max-w-sm justify-between ">
  {/* Search Icon */}
  <svg
    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>

  {/* Input Field */}
  <input
    type="text"
    placeholder="Reeservation No..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className=" pl-10 pr-10 py-2.5 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
  />
</div>
  {/* Clear Button (appears when there's text) */}
  {searchTerm && (
    <button
      onClick={() => setSearchTerm('')}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )}
</div>


              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-200 rounded-md"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* TABLE AREA */}
            <div className="flex-1 overflow-auto p-4 bg-white">
              <div className="border  rounded-lg overflow-hidden">
                {/* HORIZONTAL SCROLL WRAPPER */}
                <div className="border rounded-lg overflow-x-auto">
                  <div className="min-w-max">

                    <Table className="min-w-full">
                      <TableHeader className="sticky top-0 bg-gray-100 z-10">
                        <TableRow>
                          <TableCell isHeader className="px-5 py-3 font-semibold text-gray-700 text-xs uppercase">
                            Res No
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-semibold text-grsy-700 text-xs uppercase">
                            Res Date
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-semibold text-gray-700 text-xs uppercase">
                            Customer
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-semibold text-gray-700 text-xs uppercase">
                            Mobile
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-semibold text-gray-700 text-xs uppercase">
                            Agent
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-semibold text-gray-700 text-xs uppercase">
                            Price
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-semibold text-gray-700 text-xs uppercase">
                            Discount
                          </TableCell>
                          {/* <TableCell isHeader className="px-4 py-3 font-semibold text-gray-700 text-xs uppercase">
                    Net Amount
                  </TableCell> */}
                          <TableCell isHeader className="px-2 py-3 font-semibold text-gray-700 text-xs uppercase text-right">
                            Paid Amount
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-semibold text-gray-700 text-xs uppercase text-right">
                            Due Amount
                          </TableCell>
                          <TableCell isHeader className="px-2 py-3 font-semibold text-gray-700 text-xs uppercase text-right">
                            RefNo
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-semibold text-gray-700 text-xs uppercase text-center">
                            Days
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-semibold text-gray-700 text-xs uppercase">
                            Check In
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-semibold text-gray-700 text-xs uppercase">
                            Check Out
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-semibold text-gray-700 text-xs uppercase text-center">
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                       {filteredReservations.map((reservation) => (
                          <tr
                            key={reservation.reservationNo}
                            onClick={() => setSelectedRow(reservation.reservationNo)}
                            className={`cursor-pointer hover:bg-gray-50 ${selectedRow === reservation.reservationNo ? "bg-blue-100" : ""
                              }`}
                          >
                            <td className="px-5 py-3 text-sm text-gray-800 font-medium">{reservation.reservationNo}</td>
                            <td className="px-1 py-3 text-sm text-gray-800 font-medium">{reservation.reservationDate}</td>
                            <td className="px-5 py-3 text-sm text-gray-700">{reservation.customerCode}</td>
                            <td className="px-5 py-3 text-sm text-gray-700">{reservation.mobile}</td>
                            <td className="px-5 py-3 text-sm text-gray-700">{reservation.travelAgentCode}</td>
                            <td className="px-5 py-3 text-sm text-gray-700">{reservation.subTotal}</td>
                            <td className="px-12 py-3 text-sm text-gray-700">{reservation.discount}</td>
                            <td className="px-7 py-3 text-sm text-gray-800 text-right">{reservation.paidAmount.toLocaleString()}</td>
                            <td className="px-10 py-3 text-sm text-gray-800 text-right">{reservation.dueAmount.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{reservation.referenceNo}</td>
                            <td className="px-5 py-3 text-sm text-center text-gray-700">{getTotalDays(reservation)}</td>
                            <td className="px-5 py-3 text-sm text-gray-700">
                              {reservation.checkinDateTime ? new Date(reservation.checkinDateTime).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-5 py-3 text-sm text-gray-700">
                              {reservation.checkoutDateTime ? new Date(reservation.checkoutDateTime).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span
                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor: `${statusOptions.find((s) => s.label === reservation.reservationStatus)?.color}22`,
                                  color: statusOptions.find((s) => s.label === reservation.reservationStatus)?.color,
                                }}
                              >
                                {reservation.reservationStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </TableBody>

                    </Table>

                  </div>
                </div>
              </div>
            </div>


            {/* FOOTER */}
            {/* FOOTER */}
            <div className="px-6 py-3 border-t bg-gray-50 flex justify-between items-center">

              {/* LEFT SIDE - Selected Reservation No */}
              <div className="text-sm text-gray-700 font-semibold">
                Selected Reservation No :
                <span className="ml-2 text-blue-600">
                  {selectedRow ? selectedRow : "None"}
                </span>
              </div>

              {/* RIGHT SIDE - Buttons */}
              <div className="flex gap-5">
          <button
  onClick={handleViewDetails}
  disabled={!selectedRow}
  className={`px-5 py-2 rounded-lg ${
    selectedRow
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-gray-400 text-gray-200 cursor-not-allowed"
  }`}
>
  View Receipts
</button>
                <button
                  onClick={handleAddToReservation}
                  disabled={!selectedRow}
                  className={`px-5 py-2 rounded-lg ${selectedRow
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
                >
                  Re Call Reservation
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>





          </div>
        </div>

      )}

      {/* Receipts and Invoices Modal */}
{showReceiptModal && (
  <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="relative w-full max-w-2xl animate-fadeIn rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
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
              Reservation Documents
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedReservationNo}
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
      <div className="space-y-6 p-6">
        {/* Receipts Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Payment Receipts
            </h4>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {selectedReservationReceipts.length} Receipt{selectedReservationReceipts.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {selectedReservationReceipts.length > 0 ? (
            <div className="custom-scrollbar max-h-64 space-y-2 overflow-y-auto">
              {selectedReservationReceipts.map((receipt, index) => (
                <button
                  key={receipt}
                  onClick={() => handleGenerateReceiptPDF(receipt)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-blue-300 hover:bg-blue-50 group dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-blue-700 dark:hover:bg-blue-900/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 transition-colors group-hover:bg-blue-200 dark:bg-blue-900/30 dark:group-hover:bg-blue-800/50">
                      <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Receipt #{index + 1}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {receipt}
                      </p>
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-600 dark:bg-gray-700/50">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No receipts available</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">No payment receipts found for this reservation</p>
            </div>
          )}
        </div>

        {/* Invoice Section */}
        {selectedReservationInvoice && (
          <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
            <h4 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Final Invoice
            </h4>
            <button
              onClick={() => handleGenerateInvoicePDF(selectedReservationInvoice)}
              className="flex w-full items-center justify-between rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 transition-all hover:from-purple-100 hover:to-pink-100 group dark:border-purple-800 dark:from-purple-900/20 dark:to-pink-900/20 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 transition-colors group-hover:bg-purple-200 dark:bg-purple-900/30 dark:group-hover:bg-purple-800/50">
                  <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    View Final Invoice
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Invoice: {selectedReservationInvoice}
                  </p>
                </div>
              </div>
              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
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



