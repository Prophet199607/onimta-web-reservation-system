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

export default function RoomReservation() {
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
    noOfDays: "",
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
      noOfDays: string;
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

  // Add these new states for date/time handling
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(today);
  const [checkInTime, setCheckInTime] = useState("08:00");
  const [checkOutTime, setCheckOutTime] = useState("12:00");
  const [reservationDate, setReservationDate] = useState(today);

  const hasFetched = useRef(false);
  const [isChecked, setIsChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("room");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestInfo[]>([]);

  const [rooms, setRooms] = useState<Rooms[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypes[]>([]);

  const [packageInfo, setPackageInfo] = useState<packageInfo[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypes[]>([]);
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

  const StatuseOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Booked", label: "Booked" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Finalized", label: "Finalized" },
  ];

  const payOptions = [
    { value: "Cash", label: "Cash" },
    { value: "Credit Card", label: "Credit Card" },
    { value: "Bank Transfer", label: "Bank Transfer" },
  ];

  // Define columns for the DataTable
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

  // Handle F3 key press
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
        // Filter only packages where isRoom is true
        const roomsOnly = Array.isArray(data)
          ? data.filter((room: packageInfo) => room.isRoom === true)
          : [];
        setPackageInfo(roomsOnly);
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

  // const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handleSelectChange = (field: string, value: string) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }));
  // };

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

  // Handle package selection
  const handlePackageSelect = (packageCode: string) => {
    const selectedPackage = packageInfo.find(
      (pack) => pack.packageCode === packageCode
    );

    setFormData((prev) => ({
      ...prev,
      packageCode: packageCode,
      roomPrice: selectedPackage ? String(selectedPackage.roomPrice) : "",
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

    setFormData((prev) => ({
      ...prev,
      serviceCode,
      serviceQty: selectedService ? String(selectedService.quantity) : "",
      amount: selectedService ? String(selectedService.serviceAmount) : "",
    }));
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

  const bookingResourceOptions = bookingResources.map((booking) => ({
    value: booking.reservationBookingResourceId.toString(),
    label: booking.bookingResourceName,
  }));

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchServiceTypes();
      fetchBookingResources();
      fetchPackageInfo();
      fetchGuestInfo();
      fetchRoomTypes();
      fetchLookups();
      fetchRooms();
    }
  }, []);

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
      noOfDays: "",
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
      (r) =>
        r.roomTypeCode === formData.roomTypeCode &&
        r.roomCode === formData.roomCode
    );

    const selectedPackage = packageInfo.find(
      (p) => p.packageCode === formData.packageCode
    );

    console.log("Selected package:", selectedPackage);

    const newRow = {
      roomType:
        roomTypes.find((rt) => rt.roomTypeCode === formData.roomTypeCode)
          ?.description || "",
      roomCode: formData.roomCode,
      roomDescription: selectedRoom ? selectedRoom.description : "",
      packageCode: formData.packageCode || "",
      packageName: selectedPackage ? selectedPackage.packageName : "",
      roomPrice: formData.roomPrice || "",
      noOfDays: formData.noOfDays || "",
      amount: formData.amount || formData.roomPrice || "",
    };

    setReservationRows((prev) => [...prev, newRow]);

    // Reset form fields + selects
    setFormData((prev) => ({
      ...prev,
      roomTypeCode: "",
      roomCode: "",
      packageCode: "",
      roomPrice: "",
      noOfDays: "",
      amount: "",
    }));
  };

  // Function to handle adding a new service
  const handleAddService = () => {
    if (
      !formData.serviceCode ||
      !formData.serviceQty ||
      !formData.amount ||
      !formData.serviceDate
    ) {
      showErrorToast("Please fill all fields");
      return;
    }

    const selectedService = serviceTypes.find(
      (s) => s.serviceCode === formData.serviceCode
    );

    const newRow = {
      serviceName: selectedService ? selectedService.serviceName : "",
      rate: selectedService ? String(selectedService.serviceAmount) : "",
      quantity: formData.serviceQty,
      amount: formData.amount,
      serviceDate: formData.serviceDate,
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
      !formData.paymentDate ||
      !formData.paymentRef
    ) {
      showErrorToast("Please fill all fields");
      return;
    }

    const newRow = {
      paymentType: formData.paymentType,
      paymentAmount: formData.paymentAmount,
      paymentDate: formData.paymentDate,
      paymentRef: formData.paymentRef,
    };

    setPaymentRows((prev) => [...prev, newRow]);

    // Reset dropdown + fields
    setFormData((prev) => ({
      ...prev,
      paymentType: "",
      paymentAmount: "",
      paymentRef: "",
      paymentDate: today,
    }));
  };

  // Calculate amounts whenever reservationRows or paymentRows change
  useEffect(() => {
    // Reservation subtotal
    const reservationTotal = reservationRows.reduce((total, row) => {
      const rowAmount =
        parseFloat(row.amount) || parseFloat(row.roomPrice) || 0;
      return total + rowAmount;
    }, 0);

    // Services subtotal
    const serviceTotal = serviceRows.reduce((total, row) => {
      return total + (parseFloat(row.amount) || 0);
    }, 0);

    const subTotal = reservationTotal + serviceTotal;

    // Discount logic
    let discountAmount = calculatedAmounts.discountAmount;

    if (calculatedAmounts.discountPercent > 0) {
      discountAmount = subTotal * (calculatedAmounts.discountPercent / 100);
    }

    // Gross after discount
    const grossAmount = subTotal - discountAmount;

    // Paid amount from payments
    const paidAmount = paymentRows.reduce((total, row) => {
      return total + (parseFloat(row.paymentAmount) || 0);
    }, 0);

    // Due amount
    const dueAmount = Math.max(0, grossAmount - paidAmount);

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

    const checkInDateTime = combineDateTime(checkInDate, checkInTime);
    const checkOutDateTime = combineDateTime(checkOutDate, checkOutTime);

    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      // Get logged in user from storage
      // const userData = JSON.parse(
      //   localStorage.getItem("userData") ||
      //     sessionStorage.getItem("userData") ||
      //     "{}"
      // );
      // const loggedInUser = userData.username;

      const reservationDateOnly = reservationDate;

      // Map room table rows to DTO
      const roomDetails = reservationRows.map((row) => ({
        roomCode: row.roomCode,
        packageCode: row.packageCode,
        noOfDays: row.noOfDays,
        price: Number(row.roomPrice) || 0,
        amount: Number(row.amount) || Number(row.roomPrice) || 0,
        checkinDate: checkInDateTime,
        checkoutDate: checkOutDateTime,
      }));

      // Map service table rows
      const serviceDetails = serviceRows.map((row) => {
        const serviceCode =
          serviceTypes.find((s) => s.serviceName === row.serviceName)
            ?.serviceCode || row.serviceName;
        return {
          serviceTypeCode: serviceCode,
          serviceQuantity: Number(row.quantity) || 0,
          serviceAmount: Number(row.rate) || 0,
          serviceTotalAmount: Number(row.amount) || 0,
          serviceDate: row.serviceDate,
          serviceRemark: "",
        };
      });

      // Map payment table rows
      const roomPayDetails = paymentRows.map((row) => ({
        paymentId: 0,
        amount: Number(row.paymentAmount) || 0,
        refNo: row.paymentRef,
        refDate: new Date(row.paymentDate),
        receiptNo: "",
      }));

      // Build DTO payload
      const payload = {
        reservationNo: formData.reservationNo || "",
        reservationDate: reservationDateOnly,
        reservationType: 1,
        customerCode: formData.customerCode,
        mobile: formData.mobile,
        telephone: formData.telephone,
        email: formData.email,
        travelAgentCode: formData.travelAgentCode,
        checkinDateTime: checkInDateTime,
        checkoutDateTime: checkOutDateTime,
        noOfVehicles: Number(formData.noOfVehicle) || 0,
        noOfAdults: Number(formData.noOfAdults) || 0,
        noOfKids: Number(formData.noOfKids) || 0,
        eventType: "",
        setupStyle: "",
        subTotal: calculatedAmounts.subTotal,
        discountPer: calculatedAmounts.discountPercent,
        discount: calculatedAmounts.discountAmount,
        grossAmount: calculatedAmounts.grossAmount,
        paidAmount: calculatedAmounts.paidAmount,
        dueAmount: calculatedAmounts.dueAmount,
        reservationNote: formData.remark,
        refundAmount: calculatedAmounts.refundAmount,
        refundNote: formData.refundNote || "",
        referenceNo: formData.reservationRef,
        packageCode: formData.packageCode,
        bookingResourceId: formData.bookingResourceId || 0,
        bookingReferenceNo: formData.bookingRef,
        reservationStatus: formData.reservationStatus,
        user: "Admin",

        roomDetails,
        serviceDetails,
        roomPayDetails,
      };

      console.log("Reservation save payload:", payload);

      const response = await fetch(`${API_BASE_URL}/api/RoomReservation/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      dismissToast(loadingToastId);
      showSuccessToast("Reservation saved successfully!");
      handleClear();

      // Update form with reservation number if it's a new reservation
      if (!formData.reservationNo && data.reservationNo) {
        setFormData((prev) => ({
          ...prev,
          reservationNo: data.reservationNo,
        }));
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Reservation save error:", error);
      showErrorToast("Failed to save reservation");
    }
  };

  const handleClear = () => {
    // Clear all form data
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
      noOfDays: "",
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
    });

    // Clear all tables
    setReservationRows([]);
    setServiceRows([]);
    setPaymentRows([]);

    // Reset calculated amounts
    setCalculatedAmounts({
      subTotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      grossAmount: 0,
      paidAmount: 0,
      dueAmount: 0,
      refundAmount: 0,
    });

    // Reset date/time fields
    setCheckInDate(today);
    setCheckOutDate(today);
    setCheckInTime("08:00");
    setCheckOutTime("12:00");
    setReservationDate(today);
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
                          required
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
                          required
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
                      value={formData.reservationStatus}
                      options={StatuseOptions}
                      placeholder="Select Status"
                      className="sm:w-75 w-full h-10"
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          reservationStatus: value,
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
                            required
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
                    className={`flex items-center border-b-2 py-4 px-1 text-sm font-medium ${
                      activeTab === "room"
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
                    className={`flex items-center border-b-2 py-4 px-1 text-sm font-medium ${
                      activeTab === "service"
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
                            noOfDays: e.target.value,
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
                              className={`px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base ${
                                index !== 5
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
                      options={payOptions}
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
                      type="number"
                      value={formData.paymentAmount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentAmount: e.target.value,
                        }))
                      }
                    />
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
                      <DatePicker
                        id="date-picker"
                        placeholder="Select a date"
                        value={formData.paymentDate}
                        onChange={(_, currentDateString) => {
                          setFormData((prev) => ({
                            ...prev,
                            paymentDate: currentDateString,
                          }));
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
                              className={`px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 ${
                                index !== 3
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
    </>
  );
}
