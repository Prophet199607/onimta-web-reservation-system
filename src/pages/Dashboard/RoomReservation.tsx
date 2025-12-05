import { useState, useEffect, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import Checkbox from "../../components/form/input/Checkbox";
import DataTable, { Column } from "../../components/tables/DataTable";
import Modal from "../../components/modal/Modal";
import API_BASE_URL from "../../config/api";
import axios from "axios";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "../../components/alert/ToastAlert";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import { FiSearch } from "react-icons/fi";
import { useLocation } from "react-router-dom";


interface GuestInfo {
  CustomerID: number;
  customerCode: string;
  customerTypeCode: string;
  name: string;
  title: string;
  niC_PassportNo: string;
  nationalityCode: string;
  countryCode: string;
  mobile: string;
  telephone: string;
  email: string;
  address: string;
  travelAgentCode: string;
  creditLimit: string;
}

interface RoomTypes {
  roomTypeCode: string;
  description: string;
}

interface Rooms {
  roomTypeCode: string;
  roomCode: string;
  description: string;
  isRoom: boolean;
  isBanquet: boolean;
}

interface packageInfo {
  packageID: number;
  packageCode: string;
  packageName: string;
  roomPrice: number;
  isRoom: boolean;
  isBanquet: boolean;
  isVilla: boolean;
}

interface ServiceTypes {
  serviceCode: string;
  serviceName: string;
  quantity: number;
  serviceAmount: number;
  isRoom: boolean;
  isBanquet: boolean;
}

interface BookingResource {
  reservationBookingResourceId: number;
  bookingResourceName: string;
}

interface PaymentTypes {
  paymentID: number;
  descrip: string;
}

interface ReservationStatus {
  statusId: number;
  statusName: string;
}

export default function RoomReservation() {
  const location = useLocation();  //add new navoda
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    customerCode: "",
    customerTypeCode: "",
    title: "",
    name: "",
    niC_PassportNo: "",
    nationalityCode: "",
    countryCode: "",
    mobile: "",
    telephone: "",
    email: "",
    address: "",
    travelAgentCode: "",
    creditLimit: "",
    roomTypeCode: "",
    roomCode: "",
    packageCode: "",
    roomPrice: "",
    serviceCode: "",
    noOfDays: 1,
    serviceQty: "",
    amount: "",
    payAmount: "",
    serviceDate: today,
    paymentType: "",
    paymentAmount: "",
    paymentRef: "",
    paymentDate: today,
    bookingRef: "",
    bookingResourceId: null as number | null,
    reservationNo: "",
    reservationRef: "",
    reservationStatus: "",
    statusId: 1,
    remark: "",
    noOfVehicle: "",
    noOfAdults: "",
    noOfKids: "",
    refundNote: "",
  });

  const [reservationRows, setReservationRows] = useState<
    {
      roomType: string;
      roomCode: string;
      roomDescription: string;
      packageCode: string;
      packageName: string;
      roomPrice: string;
      noOfDays: number;
      amount: string;
    }[]
  >([]);

  const [serviceRows, setServiceRows] = useState<
    {
      serviceName: string;
      rate: string;
      quantity: string;
      amount: string;
      serviceDate: string;
    }[]
  >([]);

  const [paymentRows, setPaymentRows] = useState<
    {
      paymentType: string;
      paymentAmount: string;
      paymentRef: string;
      paymentDate: string;
      paymentId: number;
      paymentTypeId: number;
      isExisting: boolean;
      receiptNo?: string;
    }[]
  >([]);

  const [calculatedAmounts, setCalculatedAmounts] = useState({
    subTotal: 0,
    discountPercent: 0,
    discountAmount: 0,
    grossAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
    refundAmount: 0,
  });

  const REPORT_API_URL = "http://localhost:50538";


  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(today);
  const [checkInTime, setCheckInTime] = useState("08:00");
  const [checkOutTime, setCheckOutTime] = useState("12:00");
  const [reservationDate, setReservationDate] = useState(today);
  const [paymentDate, setPaymentDate] = useState(today);





// Finalized reservation modal
const [showFinalizedModal, setShowFinalizedModal] = useState(false);
const [finalizedReservationNo, setFinalizedReservationNo] = useState<string | null>(null);
const [finalizedInvoiceNo, setFinalizedInvoiceNo] = useState<string | null>(null);
const [finalizedReceipts, setFinalizedReceipts] = useState<string[]>([]);

// Other statuses modal
const [showOtherStatusModal, setShowOtherStatusModal] = useState(false);
const [otherStatusReservationNo, setOtherStatusReservationNo] = useState<string | null>(null);
const [otherStatusReceipts, setOtherStatusReceipts] = useState<string[]>([]);


// State



  const hasFetched = useRef(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("room");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestInfo[]>([]);

  const [rooms, setRooms] = useState<Rooms[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypes[]>([]);

  const [packageInfo, setPackageInfo] = useState<packageInfo[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypes[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentTypes[]>([]);
  const [reservationStatus, setReservationStatus] = useState<
    ReservationStatus[]
  >([]);
  const [countries, setCountries] = useState<Record<string, string>>({});
  const [bookingResources, setBookingResources] = useState<BookingResource[]>(
    []
  );

  const [customerTypes, setCustomerTypes] = useState<Record<string, string>>(
    {}
  );
  const [nationalities, setNationalities] = useState<Record<string, string>>(
    {}
  );
  const [travelAgents, setTravelAgents] = useState<Record<string, string>>({});


  const GuestInfoColumns: Column<GuestInfo>[] = [
    {
      key: "index",
      header: "#",
      width: "20",
      sortable: false,
      render: (_value: any, _row: GuestInfo, index: number) => (
        <span className="font-medium text-gray-600 dark:text-gray-400">
          {index + 1}
        </span>
      ),
    },
    {
      key: "customerCode",
      header: "Code",
      sortable: true,
      searchable: true,
      width: "100px",
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      searchable: true,
    },
  ];


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F3") {
        event.preventDefault();
        setIsModalOpen(true);
      }
      // Handle Escape key to close modal
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const formatNumber = (value: string | number) => {
    if (!value) return "";
    const num = Number(value.toString().replace(/,/g, ""));
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("en-US").format(num);
  };

  const fetchGuestInfo = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/Customer/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGuestInfo(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch Room Types");
      }
    } catch (error) {
      showErrorToast("Failed to load room types");
      setGuestInfo([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/api/RoomType/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoomTypes(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch Room Types");
      }
    } catch (error) {
      showErrorToast("Failed to load room types");
      setRoomTypes([]);
    } finally {
      setLoading(false);
    }
  };

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
          ? data.filter((room: Rooms) => room.isRoom === true)
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

  const fetchPackageInfo = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/api/PackageInfo/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter packages where isRoom is true OR isVilla is true
        const roomsAndVillas = Array.isArray(data)
          ? data.filter((pkg) => pkg.isRoom === true || pkg.isVilla === true)
          : [];
        setPackageInfo(roomsAndVillas);
      } else {
        throw new Error("Failed to fetch Packages");
      }
    } catch (error) {
      showErrorToast("Failed to load packages");
      setPackageInfo([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceTypes = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/api/ServiceType/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter only services where isRoom is true
        const roomsOnly = Array.isArray(data)
          ? data.filter((room: ServiceTypes) => room.isRoom === true)
          : [];
        setServiceTypes(roomsOnly);
      } else {
        throw new Error("Failed to fetch Service Types");
      }
    } catch (error) {
      showErrorToast("Failed to load service types");
      setServiceTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentTypes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/api/PayType/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("🔍 DEBUG - Loaded payment types from API:", data);
        setPaymentTypes(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch Payment Types");
      }
    } catch (error) {
      console.error("🔍 DEBUG - Payment types loading error:", error);
      showErrorToast("Failed to load payment types, using defaults");
      // Set default payment types as fallback
      const defaultPaymentTypes = [
        { paymentID: 1, descrip: "Cash" },
        { paymentID: 2, descrip: "Card" },
        { paymentID: 3, descrip: "Bank Transfer" },
        { paymentID: 4, descrip: "Check" },
        { paymentID: 5, descrip: "Online" }
      ];
      setPaymentTypes(defaultPaymentTypes);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservationStatus = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      const response = await fetch(
        `${API_BASE_URL}/api/ReservationStatus/getall`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const options = data.map((status: any) => ({
          value: status.statusId.toString(),
          label: status.statusName,
          statusId: status.statusId,
          statusName: status.statusName
        }));
        setReservationStatus(options);
      } else {
        throw new Error("Failed to fetch Reservation Status");
      }
    } catch (error) {
      showErrorToast("Failed to load reservation status");
      const defaultOptions = [
        { value: "1", label: "Booked", statusId: 1, statusName: "Booked" },
        { value: "2", label: "Confirmed", statusId: 2, statusName: "Confirmed" },
        { value: "3", label: "Checked In", statusId: 3, statusName: "Checked In" },
        { value: "4", label: "Checked Out", statusId: 4, statusName: "Checked Out" },
        { value: "5", label: "Cancelled", statusId: 5, statusName: "Cancelled" },
        { value: "6", label: "Finalized", statusId: 6, statusName: "Finalized" }
      ];
      setReservationStatus(defaultOptions);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingResources = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/api/BookingResource/getall`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookingResources(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch Booking Resources");
      }
    } catch (error) {
      showErrorToast("Failed to load booking resources");
      setBookingResources([]);
    } finally {
      setLoading(false);
    }
  };

  const buildLookup = (data: any[], codeKey: string, descKey: string) => {
    return data.reduce((acc, item) => {
      acc[item[codeKey]] = item[descKey];
      return acc;
    }, {} as Record<string, string>);
  };

  const fetchLookups = async () => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    try {
      const [countryRes, typeRes, nationalityRes, agentRes] = await Promise.all(
        [
          fetch(`${API_BASE_URL}/api/Country/getall`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/CustomerType/getall`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/Nationality/getall`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/TravelAgent/getall`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]
      );

      if (countryRes.ok)
        setCountries(
          buildLookup(await countryRes.json(), "countryCode", "description")
        );
      if (typeRes.ok)
        setCustomerTypes(
          buildLookup(await typeRes.json(), "customerTypeCode", "description")
        );
      if (nationalityRes.ok)
        setNationalities(
          buildLookup(
            await nationalityRes.json(),
            "nationalityCode",
            "description"
          )
        );
      if (agentRes.ok)
        setTravelAgents(
          buildLookup(await agentRes.json(), "travelAgentCode", "description")
        );
    } catch (err) {
      showErrorToast("Failed to load lookup data");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle room price changes in the input field
  const handleRoomPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      roomPrice: value,
    }));
  };

  // Handle package selection - UPDATED VERSION
  const handlePackageSelect = (packageCode: string) => {
    const selectedPackage = packageInfo.find(
      (pack) => pack.packageCode === packageCode
    );

    const roomPrice = selectedPackage ? selectedPackage.roomPrice : 0;
    const noOfDays = formData.noOfDays || 1;
    const calculatedAmount = roomPrice * noOfDays;

    setFormData((prev) => ({
      ...prev,
      packageCode: packageCode,
      roomPrice: roomPrice.toString(),
      amount: calculatedAmount.toString(),
    }));
  };

  // Handle room type selection
  const handleRoomTypeChange = (roomTypeCode: string) => {
    setFormData((prev) => ({
      ...prev,
      roomTypeCode,
      roomCode: "",
    }));
  };

  const handleRoomChange = (roomCode: string) => {
    setFormData((prev) => ({
      ...prev,
      roomCode,
    }));
  };

  // Handle service selection
  const handleServiceSelect = (serviceCode: string) => {
    const selectedService = serviceTypes.find(
      (s) => s.serviceCode === serviceCode
    );

    if (selectedService) {
      setFormData((prev) => ({
        ...prev,
        serviceCode,
        serviceQty: prev.serviceQty || "1",
        amount: prev.amount || String(selectedService.serviceAmount),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        serviceCode,
      }));
    }
  };

  // Select options
  const roomTypeOptions = roomTypes.map((type) => ({
    value: type.roomTypeCode,
    label: type.description,
  }));

  const getRoomOptions = (roomTypeCode: string) =>
    rooms
      .filter((room) => room.roomTypeCode === roomTypeCode)
      .map((room) => ({
        value: room.roomCode,
        label: `${room.description}`,
      }));

  const packageInfoOptions = packageInfo.map((packag) => ({
    value: packag.packageCode,
    label: packag.packageName,
  }));

  const serviceTypeOptions = serviceTypes.map((service) => ({
    value: String(service.serviceCode),
    label: `${service.serviceName}`,
  }));

  const paymentTypeOptions = paymentTypes.map((payment) => ({
    value: payment.descrip,
    label: `${payment.descrip}`,
  }));

  const reservationStatusOptions = reservationStatus.map((status: any) => ({
    value: status.statusId.toString(),
    label: status.statusName,
    statusId: status.statusId,
    statusName: status.statusName
  }));

  const bookingResourceOptions = bookingResources.map((booking) => ({
    value: booking.reservationBookingResourceId.toString(),
    label: booking.bookingResourceName,
  }));

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchReservationStatus();
      fetchBookingResources();
      fetchServiceTypes();
      fetchPaymentTypes();
      fetchPackageInfo();
      fetchGuestInfo();
      fetchRoomTypes();
      fetchLookups();
      fetchRooms();
    }
  }, []);

  useEffect(() => {
    if (location.state?.selectedReservation && rooms.length === 0) {
      fetchRooms();
      fetchRoomTypes();
      fetchPackageInfo();
      fetchServiceTypes();
    }
  }, [location.state, rooms.length]);

  const handleRowClick = (row: GuestInfo) => {
    setFormData({
      customerCode: row.customerCode || "",
      customerTypeCode: row.customerTypeCode || "",
      title: row.title || "",
      name: row.name || "",
      niC_PassportNo: row.niC_PassportNo || "",
      nationalityCode: row.nationalityCode || "",
      countryCode: row.countryCode || "",
      mobile: row.mobile || "",
      telephone: row.telephone || "",
      email: row.email || "",
      address: row.address || "",
      travelAgentCode: row.travelAgentCode || "",
      creditLimit: row.creditLimit || "",
      roomTypeCode: "",
      roomCode: "",
      packageCode: "",
      roomPrice: "",
      serviceCode: "",
      noOfDays: 1,
      serviceQty: "",
      amount: "",
      payAmount: "",
      serviceDate: "",
      paymentType: "",
      paymentAmount: "",
      paymentRef: "",
      paymentDate: "",
      bookingRef: "",
      bookingResourceId: 0,
      reservationNo: "",
      reservationRef: "",
      reservationStatus: "",
      statusId: 1,
      remark: "",
      noOfVehicle: "",
      noOfAdults: "",
      noOfKids: "",
      refundNote: "",
    });
    setIsModalOpen(false);
  };

  const handleAddReservation = () => {
    if (!formData.roomTypeCode || !formData.roomCode) {
      showErrorToast("Please select room type and room");
      return;
    }

    const selectedRoom = rooms.find(
      r => r.roomTypeCode === formData.roomTypeCode && r.roomCode === formData.roomCode
    );

    const selectedPackage = packageInfo.find(
      p => p.packageCode === formData.packageCode
    );


    let roomPrice = 0;
    if (selectedPackage && selectedPackage.roomPrice) {
      roomPrice = selectedPackage.roomPrice;
    } else {
      roomPrice = parseFloat(formData.roomPrice) || 0;
    }

    const noOfDays = formData.noOfDays || 1;

    // Calculate amount properly: roomPrice × noOfDays
    const calculatedAmount = roomPrice * noOfDays;

    const newRow = {
      roomType: roomTypes.find((rt) => rt.roomTypeCode === formData.roomTypeCode)?.description || "",
      roomCode: formData.roomCode,
      roomDescription: selectedRoom ? selectedRoom.description : "",
      packageCode: formData.packageCode || "",
      packageName: selectedPackage ? selectedPackage.packageName : "",
      roomPrice: roomPrice.toString(), // Use the determined room price
      noOfDays: noOfDays,
      amount: calculatedAmount.toString(), // Use calculated amount
    };

    setReservationRows((prev) => [...prev, newRow]);

    // Reset form fields
    setFormData((prev) => ({
      ...prev,
      roomTypeCode: "",
      roomCode: "",
      packageCode: "",
      roomPrice: "",
      noOfDays: 1,
      amount: "",
    }));
  };


  const handleAddService = () => {
    if (!formData.serviceCode) {
      showErrorToast("Please select a service");
      return;
    }



    const selectedService = serviceTypes.find(
      (s) => s.serviceCode === formData.serviceCode
    );
    // Use defaults for empty fields
    const serviceQty = formData.serviceQty || "1";
    const serviceAmount = formData.amount || (selectedService ? String(selectedService.serviceAmount) : "0");
    const serviceDate = formData.serviceDate || today;

    const newRow = {
      serviceName: selectedService ? selectedService.serviceName : "",
      rate: serviceAmount,
      quantity: serviceQty,
      amount: (parseFloat(serviceAmount) * parseFloat(serviceQty)).toString(),
      serviceDate: serviceDate,
    };

    setServiceRows((prev) => [...prev, newRow]);

    // Reset dropdown + fields
    setFormData((prev) => ({
      ...prev,
      serviceCode: "",
      serviceQty: "",
      amount: "",
      serviceDate: today,
    }));
  };
  const handleAddPayment = () => {
    if (
      !formData.paymentType ||
      !formData.paymentAmount ||
      !paymentDate
      //!formData.paymentRef
    ) {
      showErrorToast("Please fill all fields");
      return;
    }

    const paymentTypeObj = paymentTypes.find(pt => pt.descrip === formData.paymentType);

    if (!paymentTypeObj) {
      showErrorToast("Invalid payment type selected");
      return;
    }

    const newRow = {
      paymentType: formData.paymentType,
      paymentAmount: formData.paymentAmount,
      paymentDate: paymentDate,
      paymentRef: formData.paymentRef || "",
      paymentId: 0,
      paymentTypeId: paymentTypeObj.paymentID,
      isExisting: false
    };

    setPaymentRows((prev) => {
      const updatedRows = [...prev, newRow];
      console.log("Payment rows after add:", updatedRows);
      return updatedRows;
    });


    // Reset fields
    setFormData((prev) => ({
      ...prev,
      paymentType: "",
      paymentAmount: "",
      paymentRef: "",
    }));
    setPaymentDate(today);
  };


  useEffect(() => {
    console.log("🔍 DEBUG - Recalculating amounts...");

    let subTotal = 0;
    let paidAmount = 0;

    if (location.state?.selectedReservation && isDataLoaded) {
      // When loading from backend, use backend values DIRECTLY
      const reservation = location.state.selectedReservation;
      subTotal = reservation.subTotal || 0;
      paidAmount = paymentRows.reduce((total, row) => {
        return total + (parseFloat(row.paymentAmount) || 0);
      }, 0);

      console.log("🔍 DEBUG - Using backend amounts:", { subTotal, paidAmount });
    } else {
      // For new reservations, calculate from rows
      const reservationTotal = reservationRows.reduce((total, row) => {
        return total + (parseFloat(row.amount) || 0);
      }, 0);

      const serviceTotal = serviceRows.reduce((total, row) => {
        return total + (parseFloat(row.amount) || 0);
      }, 0);

      subTotal = reservationTotal + serviceTotal;

      // Calculate paid amount from payment rows
      paidAmount = paymentRows.reduce((total, row) => {
        return total + (parseFloat(row.paymentAmount) || 0);
      }, 0);

      console.log("🔍 DEBUG - Calculated amounts:", { subTotal, paidAmount });
    }

    // Discount logic
    let discountAmount = calculatedAmounts.discountAmount;

    if (calculatedAmounts.discountPercent > 0) {
      discountAmount = subTotal * (calculatedAmounts.discountPercent / 100);
    }

    const grossAmount = subTotal - discountAmount;
    const dueAmount = Math.max(0, grossAmount - paidAmount);

    console.log("🔍 DEBUG - Final amounts:", {
      subTotal,
      discountAmount,
      grossAmount,
      paidAmount,
      dueAmount
    });

    setCalculatedAmounts((prev) => ({
      ...prev,
      subTotal,
      discountAmount,
      grossAmount,
      paidAmount,
      dueAmount,
    }));
  }, [
    reservationRows,
    serviceRows,
    paymentRows,
    calculatedAmounts.discountPercent,
    calculatedAmounts.discountAmount,
    location.state?.selectedReservation,
    isDataLoaded
  ]);

  // Handle discount percentage change
  const handleDiscountPercentChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const discountPercent = parseFloat(e.target.value) || 0;
    setCalculatedAmounts((prev) => ({
      ...prev,
      discountPercent,
      discountAmount: 0,
    }));
  };

  // Handle discount amount change
  const handleDiscountAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const discountAmount = parseFloat(e.target.value) || 0;
    setCalculatedAmounts((prev) => ({
      ...prev,
      discountAmount,
      discountPercent: 0,
    }));
  };

  // Handle refund amount change
  const handleRefundAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const refundAmount = parseFloat(e.target.value) || 0;
    setCalculatedAmounts((prev) => ({
      ...prev,
      refundAmount,
    }));
  };

  // Updated Payment Information Section
  const paymentInfoFields = [
    {
      label: "Sub Total",
      value: calculatedAmounts.subTotal.toLocaleString(),
      disabled: true,
      name: "subTotal",
    },
    {
      label: "Discount %",
      value: calculatedAmounts.discountPercent,
      disabled: false,
      name: "discountPercent",
      onChange: handleDiscountPercentChange,
      type: "number",
    },
    {
      label: "Discount Amount",
      value: calculatedAmounts.discountAmount,
      disabled: false,
      name: "discountAmount",
      onChange: handleDiscountAmountChange,
      type: "number",
    },
    {
      label: "Gross Amount",
      value: calculatedAmounts.grossAmount.toLocaleString(),
      disabled: true,
      name: "grossAmount",
    },
    {
      label: "Paid Amount",
      value: calculatedAmounts.paidAmount.toLocaleString(),
      disabled: true,
      name: "paidAmount",
    },
    {
      label: "Due Amount",
      value: calculatedAmounts.dueAmount.toLocaleString(),
      disabled: true,
      name: "dueAmount",
    },
  ];

  const combineDateTime = (dateStr: string, timeStr: string) => {
    return `${dateStr}T${timeStr}:00`;
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loadingToastId = showLoadingToast("Saving reservation...");

    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const checkInDateTime = combineDateTime(checkInDate, checkInTime);
      const checkOutDateTime = combineDateTime(checkOutDate, checkOutTime);
      const reservationDateOnly = reservationDate;

      // Build customer object
      const customer = {
        customerTypeCode: formData.customerTypeCode || "",
        customerCode: formData.customerCode,
        title: formData.title || "",
        name: formData.name || "",
        NIC_PassportNo: formData.niC_PassportNo || "",
        nationalityCode: formData.nationalityCode || "",
        countryCode: formData.countryCode || "",
        mobile: formData.mobile || "",
        telephone: formData.telephone || "",
        email: formData.email || "",
        travelAgentCode: formData.travelAgentCode || "",
        creditLimit: Number(formData.creditLimit) || 0,
        address: formData.address || "",
        isActive: true,
        isNew: false,
        whatsapp: "",
        remark: ""
      };

      // Map room details
      const roomDetails = reservationRows.map((row) => ({
        roomCode: row.roomCode,
        packageCode: row.packageCode,
        noOfDays: row.noOfDays,
        price: Number(row.roomPrice) || 0,
        amount: Number(row.amount) || 0,
        checkinDate: checkInDateTime,
        checkoutDate: checkOutDateTime,
      }));

      // Map service details
      const serviceDetails = serviceRows.map((row) => {
        const serviceType = serviceTypes.find((s) => s.serviceName === row.serviceName);
        return {
          serviceTypeCode: serviceType?.serviceCode || row.serviceName || "",
          serviceQuantity: Number(row.quantity) || 1,
          serviceAmount: Number(row.rate) || 0,
          serviceTotalAmount: Number(row.amount) || 0,
          serviceDate: row.serviceDate || today,
          serviceRemark: "",
        };
      });

      //Map payment details
      const roomPayDetails = paymentRows
        .filter(row => !row.isExisting)
        .map(row => ({
          receiptNo: "",
          paymentID: row.paymentTypeId,
          amount: Number(row.paymentAmount) || 0,
          refNo: row.paymentRef || "",
          refDate: row.paymentDate || today,
          isNewPayment: true
        }));


      // Build payload
      const payload = {
        reservationNo: formData.reservationNo || "",
        reservationDate: reservationDateOnly,
        reservationType: 1,
        customerCode: formData.customerCode,
        Customer: customer,
        mobile: formData.mobile || "",
        telephone: formData.telephone || "",
        email: formData.email || "",
        travelAgentCode: formData.travelAgentCode || "",
        checkinDateTime: checkInDateTime,
        checkoutDateTime: checkOutDateTime,
        noOfVehicles: Number(formData.noOfVehicle) || 0,
        noOfAdults: Number(formData.noOfAdults) || 1,
        noOfKids: Number(formData.noOfKids) || 0,
        eventType: "",
        setupStyle: "",
        subTotal: calculatedAmounts.subTotal || 0,
        discountPer: calculatedAmounts.discountPercent || 0,
        discount: calculatedAmounts.discountAmount || 0,
        grossAmount: calculatedAmounts.grossAmount || 0,
        paidAmount: calculatedAmounts.paidAmount || 0,
        dueAmount: calculatedAmounts.dueAmount || 0,
        reservationNote: formData.remark || "",
        refundAmount: calculatedAmounts.refundAmount || 0,
        refundNote: formData.refundNote || "",
        referenceNo: formData.reservationRef || "",
        bookingResourceId: formData.bookingResourceId || 0,
        bookingReferenceNo: formData.bookingRef || "",
        statusId: formData.statusId || 1,
        reservationStatus: formData.reservationStatus || "Booked",
        user: "Admin",
        roomDetails: roomDetails,
        serviceDetails: serviceDetails,
        roomPayDetails: roomPayDetails,
        generateReceipts: true
      };

      console.log("🔍 DEBUG - Sending payload:", {
        reservationNo: payload.reservationNo,
        statusId: payload.statusId,
        status: payload.reservationStatus,
        paymentCount: roomPayDetails.length,
        payments: roomPayDetails
      });

      const response = await fetch(`${API_BASE_URL}/api/RoomReservation/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("🔍 DEBUG - Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔍 DEBUG - Error response:", errorText);

        try {
          const errorData = JSON.parse(errorText);
          console.error("🔍 DEBUG - Parsed error:", errorData);
          throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
        } catch (parseError) {
          throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 200)}`);
        }
      }

      const data = await response.json();
      console.log("🔍 DEBUG - Success response:", data);

      // dismissToast(loadingToastId);

      if (loadingToastId) {
  dismissToast(loadingToastId);
}


      // if (formData.reservationStatus === "Finalized" && data.invoiceNo) {
      //   showSuccessToast(`Reservation finalized! Opening invoice: ${data.invoiceNo}`);
      //   openInvoicePDF(data.invoiceNo);
      // } else if (data.invoiceNo) {
      //   showSuccessToast(`Reservation saved successfully! Invoice: ${data.invoiceNo}`);
      // } else {
      //   showSuccessToast("Reservation saved successfully!");
      // }
     // Check if status is "Finalized" (statusId 6)
// if (formData.statusId === 6 || formData.reservationStatus === "Finalized") {
//   console.log("🔍 DEBUG - Opening receipt modal for finalized reservation");
  
//   // Only open modal, don't fetch/generate PDFs yet
//   setReservationNo(data?.reservationNo || null);
//   setInvoiceNo(data?.invoiceNo || null);

//   // Reset receipts list
//   setLatestReceipts([]);

//   // Show success message and open modal
//   showSuccessToast("Reservation finalized successfully! Opening receipts...");
//   setShowReceiptModal(true);
// } else {
//   showSuccessToast("Reservation saved successfully!");
// }

//       if (roomPayDetails.length > 0 && data.reservationNo) {
//         setTimeout(async () => {
//           try {
//             const allReceipts = await fetchReceiptNumbers(data.reservationNo);

//             const newReceiptCount = roomPayDetails.length;
//             const latestReceipts = allReceipts.slice(-newReceiptCount);

//             console.log(`🔍 DEBUG - New payments: ${newReceiptCount}, Opening receipts:`, latestReceipts);

//             if (latestReceipts.length > 0) {
//               showSuccessToast(`Opening ${latestReceipts.length} new receipt(s)...`);

//               latestReceipts.forEach((receiptNo, index) => {
//                 setTimeout(() => {
//                   handleGenerateCrystalReport(data.reservationNo, receiptNo);
//                 }, index * 800);
//               });
//             }
//           } catch (error) {
//             console.error("Error generating receipts:", error);
//             showErrorToast("Failed to generate receipts");
//           }
//         }, 200);
//       }


//  if (formData.statusId === 6 || formData.reservationStatus === "Finalized") {
//     // Open modal only
//     setReservationNo(data?.reservationNo || null);
//     setInvoiceNo(data?.invoiceNo || null);
//     setReceipts([]); // reset
//     showSuccessToast("Reservation finalized successfully! Open the modal to view receipts.");
//     setShowReceiptModal(true);

//     // Fetch receipts but DO NOT generate PDFs automatically
//     if (data?.reservationNo) {
//       try {
//         const allReceipts = await fetchReceiptNumbers(data.reservationNo);
//         setReceipts(allReceipts);
//       } catch (err) {
//         console.error(err);
//         showErrorToast("Failed to fetch receipts.");
//       }
//     }
//   } else {
//     showSuccessToast("Reservation saved successfully!");
//   }

if (formData.statusId === 6 || formData.reservationStatus === "Finalized") {
  // Finalized reservation
  setFinalizedReservationNo(data?.reservationNo || null);
  setFinalizedInvoiceNo(data?.invoiceNo || null);
  setFinalizedReceipts([]);
  showSuccessToast("Reservation finalized successfully! Open modal to view receipts.");
  setShowFinalizedModal(true);

  if (data?.reservationNo) {
    try {
      const allReceipts = await fetchReceiptNumbers(data.reservationNo);
      setFinalizedReceipts(allReceipts);
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to fetch receipts.");
    }
  }

} else {
  // Other statuses
  setOtherStatusReservationNo(data?.reservationNo || null);
  setOtherStatusReceipts([]);
  showSuccessToast("Reservation saved! You can view the receipts here.");
  setShowOtherStatusModal(true);

  if (data?.reservationNo) {
    try {
      const allReceipts = await fetchReceiptNumbers(data.reservationNo);
      setOtherStatusReceipts(allReceipts);
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to fetch receipts.");
    }
  }
}





      setPaymentRows([]);

      setFormData((prev) => ({
        ...prev,
        paymentType: "",
        paymentAmount: "",
        paymentRef: "",
      }));
      setPaymentDate(today);
      handleClear();

    } catch (error: any) {
      dismissToast(loadingToastId);
      console.error("🔍 DEBUG - Complete error:", error);
      showErrorToast(`Failed to save: ${error.message}`);
    }
  };
  // Handle clear form
  const handleClear = () => {
    setFormData({
      customerCode: "",
      customerTypeCode: "",
      title: "",
      name: "",
      niC_PassportNo: "",
      nationalityCode: "",
      countryCode: "",
      mobile: "",
      telephone: "",
      email: "",
      address: "",
      travelAgentCode: "",
      creditLimit: "",
      roomTypeCode: "",
      roomCode: "",
      packageCode: "",
      roomPrice: "",
      serviceCode: "",
      noOfDays: 1,
      serviceQty: "",
      amount: "",
      payAmount: "",
      serviceDate: today,
      paymentType: "",
      paymentAmount: "",
      paymentRef: "",
      paymentDate: today,
      bookingRef: "",
      bookingResourceId: null,
      reservationNo: "",
      reservationRef: "",
      remark: "",
      refundNote: "",
      noOfVehicle: "",
      noOfAdults: "",
      noOfKids: "",
      reservationStatus: "",
      statusId: 1,


    });

    setReservationRows([]);
    setServiceRows([]);
    setPaymentRows([]);

    setFormData((prev) => ({
      ...prev,
      paymentType: "",
      paymentAmount: "",
      paymentRef: "",

    }));
    setPaymentDate(today)

    setCalculatedAmounts({
      subTotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      grossAmount: 0,
      paidAmount: 0,
      dueAmount: 0,
      refundAmount: 0,
    });

    setCheckInDate(today);
    setCheckOutDate(today);
    setCheckInTime("08:00");
    setCheckOutTime("12:00");
    setReservationDate(today);
    setPaymentDate(today);

    setIsDataLoaded(false);
    hasLoadedRef.current = false;

  };
  const hasLoadedRef = useRef(false);

  useEffect(() => {

    if (hasLoadedRef.current || isDataLoaded) {
      console.log("🛑 Data already loaded, skipping...");
      return;
    }

    // Early return if no reservation data
    if (!location.state?.selectedReservation) {
      return;
    }


    hasLoadedRef.current = true;

    const reservation = location.state.selectedReservation;


    // Pre-fill customer & reservation info

    setFormData(prev => ({
      ...prev,
      customerCode: reservation.customerCode || "",
      customerTypeCode: reservation.customer?.customerTypeCode || reservation.customerTypeCode || "",
      title: reservation.customer?.title || reservation.title || "",
      name: reservation.customer?.name || reservation.customerName || reservation.customerCode || "",
      niC_PassportNo: reservation.customer?.niC_PassportNo || reservation.nic_PassportNo || "",
      nationalityCode: reservation.customer?.nationalityCode || reservation.nationalityCode || "",
      countryCode: reservation.customer?.countryCode || reservation.countryCode || "",
      address: reservation.customer?.address || reservation.address || "",
      creditLimit: reservation.customer?.creditLimit?.toString() || reservation.creditLimit?.toString() || "",
      mobile: reservation.customer?.mobile || reservation.mobile || "",
      telephone: reservation.customer?.telephone || reservation.telephone || "",
      email: reservation.customer?.email || reservation.email || "",
      travelAgentCode: reservation.customer?.travelAgentCode || reservation.travelAgentCode || "",
      bookingRef: reservation.bookingReferenceNo || "",
      reservationRef: reservation.referenceNo || "",
      reservationNo: reservation.reservationNo || "",
      reservationStatus: reservation.reservationStatus || "",
      statusId: reservation.statusId || 1,
      remark: reservation.reservationNote || "",
      refundNote: reservation.refundNote || "",
      noOfAdults: reservation.noOfAdults?.toString() || "",
      noOfKids: reservation.noOfKids?.toString() || "",
      noOfVehicle: reservation.noOfVehicles?.toString() || "",
      bookingResourceId: reservation.bookingResourceId || null,
    }));


    // Set calculated amounts

    setCalculatedAmounts(prev => ({
      ...prev,
      subTotal: reservation.subTotal || 0,
      discountPercent: reservation.discountPer || 0,
      discountAmount: reservation.discount || 0,
      grossAmount: reservation.grossAmount || 0,
      paidAmount: reservation.paidAmount || 0,
      dueAmount: reservation.dueAmount || 0,
      refundAmount: reservation.refundAmount || 0,
    }));


    // Set date/time fields

    if (reservation.checkinDateTime) {
      const checkinDate = new Date(reservation.checkinDateTime);
      setCheckInDate(checkinDate.toISOString().split('T')[0]);
      setCheckInTime(checkinDate.toTimeString().slice(0, 5));
    }

    if (reservation.checkoutDateTime) {
      const checkoutDate = new Date(reservation.checkoutDateTime);
      setCheckOutDate(checkoutDate.toISOString().split('T')[0]);
      setCheckOutTime(checkoutDate.toTimeString().slice(0, 5));
    }

  // In the useEffect that loads reservation data:
// Fix the entire date loading section in your useEffect:
if (reservation.reservationDate) {
  const resDateStr = reservation.reservationDate;
  console.log("🔍 DEBUG - Raw reservation date from DB:", resDateStr);
  
  // Extract date part safely
  let dateToSet = today; // default fallback
  
  if (resDateStr.includes('T')) {
    dateToSet = resDateStr.split('T')[0];
  } else if (resDateStr) {
    // If it's already just a date string
    dateToSet = resDateStr;
  }
  
  console.log("🔍 DEBUG - Setting reservation date to:", dateToSet);
  setReservationDate(dateToSet);
}


    // Populate room details

    if (reservation.roomDetails && reservation.roomDetails.length > 0) {
      const roomRows = reservation.roomDetails.map((roomDetail: any) => {
        console.log("🔍 DEBUG - Raw room detail from backend:", roomDetail);

        const roomInfo = rooms.find(r => r.roomCode === roomDetail.roomCode);
        const roomTypeInfo = roomTypes.find(rt => rt.roomTypeCode === roomInfo?.roomTypeCode);
        const packageInfoItem = packageInfo.find(p => p.packageCode === roomDetail.packageCode);

        const roomRow = {
          roomType: roomTypeInfo?.description || roomInfo?.roomTypeCode || "Room",
          roomCode: roomDetail.roomCode || "",
          roomDescription: roomInfo?.description || roomDetail.roomCode || "",
          packageCode: roomDetail.packageCode || "",
          packageName: packageInfoItem?.packageName || roomDetail.packageCode || "",
          roomPrice: (roomDetail.price || 0).toString(),
          noOfDays: roomDetail.noOfDays || 1,
          amount: (roomDetail.amount || 0).toString(),
        };

        console.log("🔍 DEBUG - Processed room row:", roomRow);
        return roomRow;
      });
      setReservationRows(roomRows);
    } else {
      setReservationRows([]);
    }


    // Populate service details

    if (reservation.serviceDetails && reservation.serviceDetails.length > 0) {
      const serviceRows = reservation.serviceDetails.map((serviceDetail: any) => {
        const serviceInfo = serviceTypes.find(s => s.serviceCode === serviceDetail.serviceTypeCode);

        return {
          serviceName: serviceInfo?.serviceName || serviceDetail.serviceTypeCode || "",
          rate: serviceDetail.serviceAmount?.toString() || "0",
          quantity: serviceDetail.serviceQuantity?.toString() || "0",
          amount: serviceDetail.serviceTotalAmount?.toString() || "0",
          serviceDate: serviceDetail.serviceDate
            ? new Date(serviceDetail.serviceDate).toISOString().split('T')[0]
            : today,
        };
      });
      setServiceRows(serviceRows);
    } else {
      setServiceRows([]);
    }


    // Load payment details

    if (reservation.roomPayDetails && reservation.roomPayDetails.length > 0) {
      console.log("🔍 DEBUG - Raw payment details from backend:", reservation.roomPayDetails);

      const existingPayments = reservation.roomPayDetails.map((paymentDetail: any) => {
        const paymentType = paymentTypes.find(pt =>
          pt.paymentID === paymentDetail.paymentTypeId ||
          pt.descrip?.toLowerCase() === paymentDetail.paymentType?.toLowerCase()
        );

        return {
          paymentType: paymentType?.descrip || paymentDetail.paymentType || "Cash",
          paymentAmount: (paymentDetail.amount || 0).toString(),
          paymentRef: paymentDetail.refNo || "",
          paymentDate: paymentDetail.refDate
            ? new Date(paymentDetail.refDate).toISOString().split('T')[0]
            : today,
          paymentId: paymentDetail.paymentId || 0,
          paymentTypeId: paymentType?.paymentID || paymentDetail.paymentTypeId || 0,
          isExisting: true,
          receiptNo: paymentDetail.receiptNo || ""
        };
      });

      console.log("🔍 DEBUG - Loaded existing payments:", existingPayments);
      setPaymentRows(existingPayments);

      // Calculate total paid amount
      const totalPaidFromBackend = reservation.roomPayDetails.reduce((total: number, payment: any) => {
        return total + (payment.amount || 0);
      }, 0);

      console.log("🔍 DEBUG - Total paid amount from backend payments:", totalPaidFromBackend);

      setCalculatedAmounts(prev => ({
        ...prev,
        paidAmount: totalPaidFromBackend,
        dueAmount: Math.max(0, (reservation.grossAmount || 0) - totalPaidFromBackend)
      }));
    } else {
      console.log("🔍 DEBUG - No payment details found");
      setPaymentRows([]);
    }

    // Mark as loaded to prevent re-loading
    setIsDataLoaded(true);

    showSuccessToast(`Reservation ${reservation.reservationNo} loaded successfully!`);

  }, [location.state, rooms, roomTypes, packageInfo, serviceTypes, paymentTypes]);





// const handleGenerateCrystalReport = async (reservationNo: string, receiptNo?: string) => {
//   try {
//     const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

//     if (!token) {
//       showErrorToast("Authentication token not found. Please login again.");
//       return;
//     }

//     // Build URL with proper encoding
//     let url = `${REPORT_API_URL}/api/Report/ReservationPaymentPDF`;
//     const params = new URLSearchParams();
    
//     if (reservationNo && reservationNo.trim()) {
//       params.append('reservationNo', reservationNo.trim());
//     }
    
//     if (receiptNo && receiptNo.trim()) {
//       params.append('receiptNo', receiptNo.trim());
//     }
    
//     url += `?${params.toString()}`;

//     console.log(`🔍 DEBUG - Generating PDF URL: ${url}`);

//     const response = await axios.get(url, {
//       responseType: "blob",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Cache-Control': 'no-cache',
//         'Pragma': 'no-cache'
//       },
//       timeout: 60000, // 60 seconds timeout
//     });

//     console.log(`🔍 DEBUG - PDF Response:`, {
//       status: response.status,
//       size: response.data.size,
//       type: response.data.type
//     });

//     if (response.data.size === 0) {
//       throw new Error('Empty PDF response from server');
//     }

//     // Check if it's actually a PDF
//     if (!response.data.type.includes('pdf')) {
//       console.warn('Unexpected content type:', response.data.type);
//       // Still try to process it as it might be PDF with wrong content type
//     }

//     const blob = new Blob([response.data], { type: "application/pdf" });
//     const blobUrl = URL.createObjectURL(blob);

//     // Open PDF in new tab
//     // const newTab = window.open(blobUrl, '_blank', 'width=800,height=600');
    
//     // if (!newTab) {
//     //   showErrorToast("Please allow popups to view receipts. Downloading instead...");
//     //   // Fallback: download the file
//     //   const link = document.createElement('a');
//     //   link.href = blobUrl;
//     //   link.download = `Receipt_${receiptNo || reservationNo}_${Date.now()}.pdf`;
//     //   document.body.appendChild(link);
//     //   link.click();
//     //   document.body.removeChild(link);
//     // }
    
// // if (!newTab) {
// //   showErrorToast("Please allow popups to view the receipt.");
// // }

// try {
//   const newTab = window.open();
//   if (!newTab) {
//     showErrorToast("Popup blocked. Please allow popups for this site.");
//     return;
//   }
//   newTab.location.href = blobUrl;
// } catch (error) {
//   console.error("Failed to open new tab:", error);
//   showErrorToast("Could not open receipt preview.");
// }

//     // Clean up URL after a delay
//    setTimeout(() => {
//   URL.revokeObjectURL(blobUrl);
// }, 60000);

//   } catch (error: any) {
//     console.error("PDF Generation Error:", error);
    
//     let errorMessage = "Failed to generate receipt PDF";
    
//     if (error.code === 'ECONNABORTED') {
//       errorMessage = "Request timeout - server is taking too long to generate PDF";
//     } else if (error.response?.status === 401) {
//       errorMessage = "Session expired. Please login again.";
//     } else if (error.response?.status === 404) {
//       errorMessage = "Receipt data not found";
//     } else if (error.response?.status === 400) {
//       errorMessage = "Invalid request parameters";
//     } else if (error.response?.status === 500) {
//       // Try to get error message from response
//       if (error.response.data) {
//         try {
//           const reader = new FileReader();
//           reader.onload = () => {
//             const text = reader.result as string;
//             if (text.includes('Exception') || text.includes('Error')) {
//               console.error('Server error details:', text.substring(0, 500));
//             }
//           };
//           reader.readAsText(error.response.data);
//         } catch (e) {
//           console.error('Could not read error response:', e);
//         }
//       }
//       errorMessage = "Server error generating receipt - please check server logs";
//     } else if (error.message?.includes('Network Error')) {
//       errorMessage = "Network error - please check your connection";
//     }
    
//     showErrorToast(errorMessage);
//   }
// };

// const handleGenerateCrystalReport = async (reservationNo: string, receiptNo?: string) => {
//   let newTab = window.open("", "_blank"); // ✅ open immediately (user gesture)

//   if (!newTab) {
//     showErrorToast("Please allow popups for this site.");
//     return;
//   }

//   try {
//     const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
//     if (!token) {
//       showErrorToast("Authentication token not found. Please login again.");
//       newTab.close();
//       return;
//     }

//     let url = `${REPORT_API_URL}/api/Report/ReservationPaymentPDF`;
//     const params = new URLSearchParams();

//     if (reservationNo?.trim()) params.append("reservationNo", reservationNo.trim());
//     if (receiptNo?.trim()) params.append("receiptNo", receiptNo.trim());

//     url += `?${params.toString()}`;

//     const response = await axios.get(url, {
//       responseType: "blob",
//       headers: { Authorization: `Bearer ${token}` }
//     });

//     if (!response.data || response.data.size === 0) {
//       throw new Error("Empty PDF");
//     }

//     const blob = new Blob([response.data], { type: "application/pdf" });
//     const blobUrl = URL.createObjectURL(blob);

//     // ✅ Load PDF inside already opened tab
//     newTab.location.href = blobUrl;

//     setTimeout(() => {
//       URL.revokeObjectURL(blobUrl);
//     }, 60000);

//   } catch (error) {
//     console.error(error);
//     showErrorToast("Failed to open receipt.");
//     newTab.document.write("<h3>Failed to load receipt.</h3>");
//   }
// };

// Keep track of ongoing requests to cancel if needed
let pdfRequestController: AbortController | null = null;

const handleGenerateCrystalReport = async (reservationNo: string, receiptNo?: string) => {
  // Open tab immediately (user gesture)
  const newTab = window.open("", "_blank");
  if (!newTab) {
    showErrorToast("Please allow popups for this site.");
    return;
  }

  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      showErrorToast("Authentication token not found.");
      newTab.close();
      return;
    }

    // Cancel previous request if still running
    if (pdfRequestController) {
      pdfRequestController.abort();
    }
    pdfRequestController = new AbortController();

    // Build URL
    let url = `${REPORT_API_URL}/api/Report/ReservationPaymentPDF`;
    const params = new URLSearchParams();
    if (reservationNo?.trim()) params.append("reservationNo", reservationNo.trim());
    if (receiptNo?.trim()) params.append("receiptNo", receiptNo.trim());
    url += `?${params.toString()}`;

    // Fetch PDF
    const response = await axios.get(url, {
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
      signal: pdfRequestController.signal, // allows aborting
      timeout: 60000, // 60 seconds
    });

    if (!response.data || response.data.size === 0) throw new Error("Empty PDF");

    // Create Blob URL
    const blob = new Blob([response.data], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    // Load PDF in already opened tab
    newTab.location.href = blobUrl;

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);

  } catch (error: any) {
    console.error(error);
    showErrorToast("Failed to open receipt.");
    if (!newTab.closed) newTab.document.write("<h3>Failed to load receipt.</h3>");
  } finally {
    pdfRequestController = null;
  }
};





  const fetchReceiptNumbers = async (reservationNo: string): Promise<string[]> => {
  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    
    if (!reservationNo?.trim()) {
      console.error("Empty reservation number provided");
      return [];
    }

    const url = `${REPORT_API_URL}/api/Report/GetReceiptsByReservation?reservationNo=${encodeURIComponent(reservationNo.trim())}`;
    
    console.log(`🔍 DEBUG - Fetching receipts from: ${url}`);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      timeout: 15000
    });

    console.log("🔍 DEBUG - Fetched receipts response:", {
      status: response.status,
      data: response.data
    });
    
    if (!Array.isArray(response.data)) {
      console.warn("Unexpected response format for receipts:", response.data);
      return [];
    }

    // Filter out empty or invalid receipt numbers
    const validReceipts = response.data.filter((receipt: any) => 
      receipt && receipt.toString().trim() !== ''
    );
    
    console.log(`🔍 DEBUG - Valid receipts found: ${validReceipts.length}`);
    return validReceipts;

  } catch (error: any) {
    console.error("Error fetching receipts:", error);
    
    if (error.response?.status === 404) {
      console.log("No receipts found for reservation:", reservationNo);
      showErrorToast("No receipts found for this reservation");
    } else if (error.response?.status === 401) {
      showErrorToast("Session expired while fetching receipts");
    } else if (error.code === 'ECONNABORTED') {
      showErrorToast("Timeout while fetching receipts");
    } else if (error.message?.includes('Network Error')) {
      showErrorToast("Network error while fetching receipts");
    }
    
    return [];
  }
};

// Keep track of ongoing invoice request
let invoiceRequestController: AbortController | null = null;

const openInvoicePDF = async (invoiceNo: string) => {
  // Open tab immediately
  const newTab = window.open("", "_blank");
  if (!newTab) {
    showErrorToast("Please allow popups for this site.");
    return;
  }

  try {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      showErrorToast("Authentication token not found.");
      newTab.close();
      return;
    }

    if (!invoiceNo?.trim()) {
      showErrorToast("Invoice number is required");
      newTab.close();
      return;
    }

    // Cancel previous invoice request if running
    if (invoiceRequestController) {
      invoiceRequestController.abort();
    }
    invoiceRequestController = new AbortController();

    const url = `${REPORT_API_URL}/api/Report/FinalPaymentPDF?invoiceNo=${encodeURIComponent(invoiceNo.trim())}`;

    const response = await axios.get(url, {
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' },
      signal: invoiceRequestController.signal, // allows aborting
      timeout: 60000,
    });

    if (!response.data || response.data.size === 0) throw new Error("Empty PDF response");

    const blob = new Blob([response.data], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    newTab.location.href = blobUrl;

    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);

  } catch (error: any) {
    console.error("Invoice PDF Error:", error);
    showErrorToast("Failed to open invoice.");
    if (!newTab.closed) newTab.document.write("<h3>Failed to load invoice.</h3>");
  } finally {
    invoiceRequestController = null;
  }
};


  return (
    <>
      <PageMeta
        title="Room Reservation Information - Reservation System"
        description="Manage room reservation information"
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
            <li className="text-gray-900 dark:text-white">Room Reservation</li>
          </ol>
        </nav>

        {/* Header */}
        <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
          Manage Room Reservation
        </h3>

        {/* Empty div for equal spacing */}
        <div className="w-[120px]"></div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white p-3 sm:p-5 md:px-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-8">
        <div className="mx-auto w-full">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 xl:grid-cols-2 pb-5">
              {/* Guest Information Section */}
              <div className="w-full">
                <h2 className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300 mb-6">
                  Guest Information
                </h2>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <label className="sm:w-38 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Guest Code
                    </label>

                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        name="customerCode"
                        value={formData.customerCode}
                        onChange={handleInputChange}
                        placeholder="Enter Guest code"
                        required
                        className="flex-1 w-full min-w-[230px] h-9"
                      />
                      {/* F3 Button */}
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <FiSearch className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {[
                    {
                      label: "Name",
                      name: "name",
                      value: formData.name,
                      placeholder: "Enter Name",
                    },
                    {
                      label: "NIC/Passport",
                      name: "niC_PassportNo",
                      value: formData.niC_PassportNo,
                      placeholder: "Enter NIC/Passport",
                    },
                    {
                      label: "Customer Type",
                      name: "customerTypeCode",
                      value: formData.customerTypeCode,
                      placeholder: "Enter Customer Type",
                    },
                    {
                      label: "Nationality",
                      name: "nationalityCode",
                      value: formData.nationalityCode,
                      placeholder: "Enter Nationality",
                    },
                    {
                      label: "Country",
                      name: "countryCode",
                      value: formData.countryCode,
                      placeholder: "Enter Country",
                    },
                    {
                      label: "Mobile",
                      name: "mobile",
                      value: formData.mobile,
                      placeholder: "Enter Mobile",
                    },
                    {
                      label: "Telephone",
                      name: "telephone",
                      value: formData.telephone,
                      placeholder: "Enter Telephone",
                    },
                    {
                      label: "Email",
                      name: "email",
                      value: formData.email,
                      placeholder: "Enter Email",
                    },
                    {
                      label: "Credit Limit",
                      name: "creditLimit",
                      value: formData.creditLimit,
                      type: "number",
                      placeholder: "Enter Credit Limit",
                    },
                    {
                      label: "Booking Ref",
                      name: "bookingRef",
                      value: formData.bookingRef,
                      placeholder: "Enter Booking Ref",
                      
                    },
                    {
                      label: "Travel Agent",
                      name: "travelAgentCode",
                      value: formData.travelAgentCode,
                      placeholder: "Enter Travel Agent",
                    },
                  ].map((field, index) => {
                    // For description fields, replace value shown
                    let displayValue = field.value;
                    if (field.name === "countryCode") {
                      displayValue = countries[field.value] || "";
                    } else if (field.name === "customerTypeCode") {
                      displayValue = customerTypes[field.value] || "";
                    } else if (field.name === "nationalityCode") {
                      displayValue = nationalities[field.value] || "";
                    } else if (field.name === "travelAgentCode") {
                      displayValue = travelAgents[field.value] || "";
                    }

                    return (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center"
                      >
                        <label className="w-full sm:w-40 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {field.label}
                        </label>
                        <Input
                          type={field.type || "text"}
                          placeholder={field.placeholder}
                          name={field.name}
                          value={displayValue}
                        
                          className="flex-1 w-full min-w-[280px] h-9"
                          onChange={handleInputChange}
                        />
                      </div>
                    );
                  })}

                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <label className="sm:w-40 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Booking Status
                    </label>
                    <Select
                      options={bookingResourceOptions}
                      placeholder="Select Booking Resource"
                      className="sm:w-70 w-full h-10"
                      value={
                        formData.bookingResourceId
                          ? String(formData.bookingResourceId)
                          : ""
                      }
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          bookingResourceId: value ? Number(value) : null,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Reservation Information Section */}
              <div className="w-full">
                <h2 className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300 mb-6">
                  Reservation Information
                </h2>
                <div className="space-y-2">
                  {["Reservation #", "Reference #"].map((label, index) => {
                    // Determine the correct key for the formData object
                    const fieldKey =
                      label === "Reservation #"
                        ? "reservationNo"
                        : "reservationRef";

                    const isReadOnly = label === "Reservation #";

                    return (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center"
                      >
                        <label className="w-full sm:w-44 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {label}
                        </label>
                        <Input
                          placeholder={`Enter ${label}`}
                         
                          className="flex-1 w-full min-w-[300px] h-9"
                          value={formData[fieldKey]}
                          readonly={isReadOnly}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [fieldKey]: e.target.value,
                            })
                          }
                        />
                      </div>
                    );
                  })}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <label className="w-full sm:w-40 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reservation Date
                    </label>
                    <DatePicker
                      id="reservation-date-picker"
                      placeholder="Select a date"
                      value={reservationDate}
                      onChange={(_, currentDateString) => {
                        setReservationDate(currentDateString);
                      }}
                    />
                  </div>

                  {["Check-In Date Time", "Check-Out Date Time"].map(
                    (label, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center"
                      >
                        <label className="w-full sm:w-44 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {label}
                        </label>
                        <div className="flex flex-1 flex-col sm:flex-row gap-2">
                          <DatePicker
                            id={`date-picker-${index}`}
                            placeholder="Select a date"
                            className="min-w-[200px]"
                            value={index === 0 ? checkInDate : checkOutDate}
                            onChange={(_, currentDateString) => {
                              if (index === 0) {
                                setCheckInDate(currentDateString);
                              } else {
                                setCheckOutDate(currentDateString);
                              }
                            }}
                          />
                          <Input
                            type="time"
                            className="w-full sm:w-26 h-9"
                            value={index === 0 ? checkInTime : checkOutTime}
                            onChange={(e) => {
                              if (index === 0) {
                                setCheckInTime(e.target.value);
                              } else {
                                setCheckOutTime(e.target.value);
                              }
                            }}
                          />
                        </div>
                      </div>
                    )
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <label className="w-full sm:w-40 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <Select
                      value={formData.statusId?.toString() || "1"}
                      options={reservationStatusOptions.map((status: any) => ({
                        value: status.statusId.toString(),
                        label: status.statusName
                      }))}
                      placeholder="Select Status"
                      className="sm:w-75 w-full h-10"
                      onChange={(value: string) => {
                        const statusId = value ? parseInt(value) : 1;
                        const selectedStatus = reservationStatusOptions.find((s: any) => s.statusId === statusId);

                        console.log("🔍 DEBUG - Status changed:", {
                          statusId,
                          statusName: selectedStatus?.statusName
                        });

                        setFormData((prev) => ({
                          ...prev,
                          statusId: statusId,
                          reservationStatus: selectedStatus?.statusName || "Booked",
                        }));
                      }}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                    <label className="w-full sm:w-40 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Note
                    </label>
                    <textarea
                      className="w-full min-w-[300px] flex-1 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      rows={3}
                      placeholder="Enter your remark here"
                      value={formData.remark}
                      onChange={(e) =>
                        setFormData({ ...formData, remark: e.target.value })
                      }
                    />
                  </div>

                  {["No of Vehicle", "No of Adults", "No of Kids"].map(
                    (label, index) => {
                      const fieldName = label
                        .toLowerCase()
                        .replace(/\s+(.)/g, (_, chr) => chr.toUpperCase())
                        .replace("of", "Of");

                      return (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:items-center"
                        >
                          <label className="w-full sm:w-44 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {label}
                          </label>
                          <Input
                            name={fieldName}
                            type="number"
                            placeholder={`Enter ${label}`}
                            required = {false}
                            className="flex-1 w-full min-w-[300px] h-9"
                            value={
                              formData[
                              fieldName as keyof typeof formData
                              ] as string
                            }
                            onChange={handleInputChange}
                            min="0"
                          />
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            <hr className="border-gray-500 dark:border-gray-400" />

            {/* Room & Service Details*/}
            <div className="lg:col-span-2 mb-5 pb-3">
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    type="button"
                    className={`flex items-center border-b-2 py-4 px-1 text-sm font-medium ${activeTab === "room"
                      ? "border-blue-500 text-blue-600 dark:text-gray-200"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      }`}
                    onClick={() => setActiveTab("room")}
                  >
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Room Details
                  </button>
                  <button
                    type="button"
                    className={`flex items-center border-b-2 py-4 px-1 text-sm font-medium ${activeTab === "service"
                      ? "border-blue-500 text-blue-600 dark:text-gray-200"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      }`}
                    onClick={() => setActiveTab("service")}
                  >
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Service Details
                  </button>
                </nav>
              </div>

              <div className="max-w-full overflow-x-auto mt-5">
                {activeTab === "room" ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <Select
                        options={roomTypeOptions}
                        placeholder="Select Room Type"
                        className="sm:w-45 w-full h-10"
                        onChange={(val) => handleRoomTypeChange(String(val))}
                        value={formData.roomTypeCode}
                      />

                      <Select
                        options={getRoomOptions(formData.roomTypeCode)}
                        placeholder={
                          formData.roomTypeCode
                            ? "Select Room"
                            : "Select Room Type First"
                        }
                        className="sm:w-45 w-full h-10"
                        onChange={(val) => handleRoomChange(String(val))}
                        value={formData.roomCode}
                      />

                      <Input
                        type="number"
                        id="noOfDays"
                        name="noOfDays"
                        className="flex-1 w-full max-w-[150px] h-9"
                        value={formData.noOfDays}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            noOfDays: Number(e.target.value),
                          }))
                        }
                      />

                      <Select
                        options={packageInfoOptions}
                        placeholder="Select Package Info"
                        className="sm:w-70 w-full h-10"
                        value={formData.packageCode}
                        onChange={handlePackageSelect}
                      />

                      <Input
                        placeholder="Room Price"
                        required
                        className="flex-1 w-full min-w-[100px] h-9"
                        type="text"
                        value={formData.roomPrice}
                        onChange={handleRoomPriceChange}
                      />

                      <Button
                        type="button"
                        onClick={handleAddReservation}
                        className="w-full sm:w-28 h-8 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-280"
                        size="md"
                      >
                        Add
                      </Button>
                    </div>

                    <Table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                      {/* Table Header */}
                      <TableHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <TableRow>
                          {[
                            "Room Type",
                            "Room No",
                            "No Of Days",
                            "Package Info",
                            "Amount",
                          ].map((header, index) => (
                            <TableCell
                              key={header}
                              isHeader
                              className={`px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base ${index !== 5
                                ? "border-r border-gray-200 dark:border-gray-700"
                                : ""
                                } `}
                            >
                              {header}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHeader>

                      {/* Table Body */}
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {reservationRows.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                              {row.roomType}
                            </TableCell>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                              {row.roomDescription}
                            </TableCell>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                              {row.noOfDays}
                            </TableCell>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                              {row.packageName}
                            </TableCell>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                              {Number(row.roomPrice).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <Select
                        options={serviceTypeOptions}
                        placeholder="Select Service Name"
                        className="sm:w-64 w-full h-10"
                        value={formData.serviceCode}
                        onChange={handleServiceSelect}
                      />

                      <Input
                        type="number"
                        id="serviceQty"
                        name="serviceQty"
                        placeholder="Quantity"
                        className="flex-1 w-full max-w-[150px] h-9"
                        value={formData.serviceQty}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            serviceQty: e.target.value,
                          }))
                        }
                      />

                      <Input
                        name="amount"
                        required
                        placeholder="Amount"
                        className="flex-1 w-full max-w-[200px] h-9"
                        type="number"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                      />

                      <Input
                        id="service-date-picker"
                        placeholder="Select a date"
                        type="date"
                        value={formData.serviceDate || today}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            serviceDate: e.target.value,
                          }))
                        }
                      />

                      <Button
                        type="button"
                        onClick={handleAddService}
                        className="w-full sm:w-28 h-8 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-280"
                        size="md"
                      >
                        Add
                      </Button>
                    </div>
                    <Table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                      {/* Table Header */}
                      <TableHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <TableRow>
                          <TableCell
                            isHeader
                            className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base border-r border-gray-200 dark:border-gray-700"
                          >
                            Service
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base border-r border-gray-200 dark:border-gray-700"
                          >
                            Quantity
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base border-r border-gray-200 dark:border-gray-700"
                          >
                            Amount
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base border-r border-gray-200 dark:border-gray-700"
                          >
                            Date
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] border-r border-gray-200 dark:border-gray-700">
                        {serviceRows.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 border-r border-gray-200 dark:border-gray-700">
                              {row.serviceName}
                            </TableCell>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2 border-r border-gray-200 dark:border-gray-700">
                              {row.quantity}
                            </TableCell>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm text-right font-medium text-gray-700 dark:text-gray-300 mb-2 border-r border-gray-200 dark:border-gray-700">
                              {Number(row.rate).toLocaleString()}
                            </TableCell>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-2 border-r border-gray-200 dark:border-gray-700">
                              {row.serviceDate}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </div>
            </div>

            <hr className="border-gray-500 dark:border-gray-400 mt-5 mb-5" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 pt-3">
              {/* Payment Information Section */}
              <div className="w-full">
                <h2 className="mb-4 text-base font-medium text-gray-700 dark:text-gray-300 sm:text-lg">
                  Payment Information
                </h2>
                <div className="space-y-2">
                  {paymentInfoFields.map((field, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-1 sm:flex-row sm:items-center"
                    >
                      <label className="block w-40 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {field.label}
                      </label>
                      <Input
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        type={field.type || "text"}
                        disabled={field.disabled}
                        className="flex-1 w-full min-w-[280px] h-9 dark:color-gray-200"
                      />
                    </div>
                  ))}

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center">
                      <label className="block w-40 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Refund Amount
                      </label>
                      <Input
                        name="refundAmount"
                        value={calculatedAmounts.refundAmount}
                        onChange={handleRefundAmountChange}
                        disabled={!isChecked}
                        className="flex-1 w-full min-w-[180px] h-9"
                        type="number"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={isChecked} onChange={setIsChecked} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                        Refund
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center">
                      <label className="block w-40 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Comment
                      </label>
                      <textarea
                        name="refundNote"
                        value={formData.refundNote || ""}
                        onChange={handleTextAreaChange}
                        className="w-full min-w-[280px] flex-1 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        rows={3}
                        placeholder="Enter your remark here"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <label className="w-full sm:w-36 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pay Type
                    </label>
                    <Select
                      options={paymentTypeOptions}
                      placeholder="Select Pay Type"
                      className="sm:w-75 w-full h-10"
                      value={formData.paymentType}
                      onChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentType: String(val),
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <label className="w-full sm:w-36 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount
                    </label>
                    <Input
                      name="paymentAmount"
                      placeholder="Enter Amount"
                      required
                      className="flex-1 w-full min-w-[300px] h-9"
                      type="text"
                      value={formatNumber(formData.paymentAmount)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/,/g, "");
                        if (/^\d*\.?\d*$/.test(raw)) {
                          setFormData((prev) => ({
                            ...prev,
                            paymentAmount: raw,
                          }));
                        }
                      }}
                    />
                    {/* <Input
                      name="paymentAmount"
                      placeholder="Enter Amount"
                      required
                      className="flex-1 w-full min-w-[300px] h-9"
                      type="number"
                      value={formData.paymentAmount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentAmount: e.target.value,
                        }))
                      }
                    /> */}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <label className="w-full sm:w-36 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ref #
                    </label>
                    <Input
                      placeholder="Enter Ref #"
                      required
                      className="flex-1 w-full min-w-[300px] h-9"
                      type="text"
                      value={formData.paymentRef}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentRef: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <label className="w-full sm:w-36 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ref Date
                    </label>
                    <div className="flex gap-3">
                      {/* <DatePicker
                        id="date-picker"
                        placeholder="Select a date"
                        value={formData.paymentDate}
                        onChange={(_, currentDateString) => {
                          setFormData((prev) => ({
                            ...prev,
                            paymentDate: currentDateString,
                          }));
                        }}
                      /> */}
                      <DatePicker
                        id="date-picker"
                        placeholder="Select a date"
                        value={paymentDate}
                        onChange={(_, currentDateString) => {
                          setPaymentDate(currentDateString);
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddPayment}
                        className="w-full sm:w-20 h-8 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-280"
                        size="md"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-5 overflow-x-auto">
                  <Table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                    {/* Table Header */}
                    <TableHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <TableRow>
                        {["Payment Type", "Amount", "Ref #", "Ref Date"].map(
                          (header, index) => (
                            <TableCell
                              key={header}
                              isHeader
                              className={`px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 ${index !== 3
                                ? "border-r border-gray-200 dark:border-gray-700"
                                : ""
                                }`}
                            >
                              {header}
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paymentRows.map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <TableCell className="px-4 py-2 sm:text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                            {row.paymentType}
                          </TableCell>
                          <TableCell className="px-4 py-2 sm:text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 text-right">
                            {Number(row.paymentAmount).toLocaleString()}
                          </TableCell>
                          <TableCell className="px-4 py-2 sm:text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                            {row.paymentRef}
                          </TableCell>
                          <TableCell className="px-4 py-2 sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                            {row.paymentDate}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 mt-8 mb-3 justify-left w-full">
                <Button
                  className="w-full sm:w-28 h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-280"
                  size="md"
                >
                  Copy
                </Button>
                <Button
                  type="button"
                  size="md"
                  className="w-full sm:w-28 h-10 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancel
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 my-8 mb-3 justify-end items-end w-full max-w-md sm:max-w-xl ml-auto">
                <Button
                  type="submit"
                  className="w-full sm:w-30 h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-300"
                  size="md"
                >
                  Submit
                </Button>
                <Button
                  onClick={handleClear}
                  type="button"
                  size="md"
                  className="w-full sm:w-30 h-10 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Clear
                </Button>
              </div>
            </div>
          </form>
        </div>




      </div>

      {/* Reusable Selection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Select Guest Info"
        size="auto"
        columnCount={GuestInfoColumns.length}
      >
        <DataTable
          data={guestInfo}
          columns={GuestInfoColumns}
          loading={loading}
          searchable={true}
          pagination={true}
          sortable={true}
          pageSize={10}
          onRowClick={handleRowClick}
          className="border-0 shadow-none"
          emptyMessage="No data available"
        />


        
      </Modal>
    {/* Finalized Reservation Modal */}
{showFinalizedModal && (
  <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="relative w-full max-w-lg animate-fadeIn rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reservation Finalized
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {finalizedReservationNo}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowFinalizedModal(false)}
          className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Modal Body */}
      <div className="space-y-4 p-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Your reservation has been finalized successfully!
          </p>
        </div>

        {/* Receipts Section */}
        {finalizedReceipts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Payment Receipts
              </h4>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {finalizedReceipts.length} Receipt{finalizedReceipts.length > 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="custom-scrollbar max-h-64 space-y-2 overflow-y-auto">
              {finalizedReceipts.map((receipt, index) => (
                <button
                  key={receipt}
                  onClick={() => finalizedReservationNo && handleGenerateCrystalReport(finalizedReservationNo, receipt)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all hover:border-blue-300 hover:bg-blue-50 group dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-blue-700 dark:hover:bg-blue-900/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 transition-colors group-hover:bg-blue-200 dark:bg-blue-900/30 dark:group-hover:bg-blue-800/50">
                      <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </div>
        )}

        {/* Invoice Section */}
        {finalizedInvoiceNo && (
          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Final Invoice
            </h4>
            <button
              onClick={() => openInvoicePDF(finalizedInvoiceNo)}
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
                    Invoice: {finalizedInvoiceNo}
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
          onClick={() => setShowFinalizedModal(false)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  </div>

)}

{/* Other Status Modal */}
{showOtherStatusModal &&  (
  <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="relative w-full max-w-lg animate-fadeIn rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reservation Saved
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {otherStatusReservationNo}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowOtherStatusModal(false)}
          className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Modal Body */}
      <div className="p-6">
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            ✓ Reservation saved successfully!
          </p>
        </div>

        {otherStatusReceipts.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Payment Receipts
              </h4>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                {otherStatusReceipts.length} Receipt{otherStatusReceipts.length > 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="custom-scrollbar max-h-64 space-y-2 overflow-y-auto">
              {otherStatusReceipts.map((receipt, index) => (
                <button
                  key={receipt}
                  onClick={() => otherStatusReservationNo && handleGenerateCrystalReport(otherStatusReservationNo, receipt)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all hover:border-green-300 hover:bg-green-50 group dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-green-700 dark:hover:bg-green-900/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 transition-colors group-hover:bg-green-200 dark:bg-green-900/30 dark:group-hover:bg-green-800/50">
                      <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <svg className="h-5 w-5 text-gray-400 transition-colors group-hover:text-green-600 dark:group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              No receipts available
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Receipts will appear here when payments are processed
            </p>
          </div>
        )}
      </div>

      {/* Modal Footer */}
      <div className="flex justify-end gap-3 rounded-b-lg border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <button
          onClick={() => setShowOtherStatusModal(false)}
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
