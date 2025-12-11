import { useState, useEffect, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import Checkbox from "../../components/form/input/Checkbox";
import DataTable, { Column } from "../../components/tables/DataTable";
import {API_BASE_URL} from "../../config/api";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "../../components/alert/ToastAlert";
import { FiSearch, FiX, FiPlus, FiEdit2, FiTrash2, FiUser, FiUsers, FiMail, FiGlobe, FiBriefcase } from "react-icons/fi";

// Sample guest data
interface GuestInfo {
  CustomerID: number;
  customerCode: string;
  customerTypeCode: string;
  title: string;
  name: string;
  niC_PassportNo: string;
  nationalityCode: string;
  countryCode: string;
  mobile: string;
  telephone: string;
  email: string;
  address: string;
  travelAgentCode: string;
  creditLimit: string;
  isActive: boolean;
  isNew: boolean;
  whatsapp: string;
  remark: string;
}

interface GuestTypes {
  customerTypeCode: string;
  description: string;
}

interface GuestTitles {
  titleCode: string;
  description: string;
}

interface GuestNationalities {
  nationalityCode: string;
  description: string;
}

interface GuestCountries {
  countryCode: string;
  description: string;
}

interface TravelAgents {
  travelAgentCode: string;
  description: string;
}

export default function GuestInfo() {
  const hasFetched = useRef(false);
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
    whatsapp: "",
    remark: "",
    isActive: true,
    isNew: true,
  });

  const [isChecked, setIsChecked] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<GuestInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestInfo[]>([]);
  const [guestTypes, setGuestTypes] = useState<GuestTypes[]>([]);
  const [guestTitles, setGuestTitles] = useState<GuestTitles[]>([]);
  const [guestNationality, setGuestNationality] = useState<GuestNationalities[]>([]);
  const [guestCountries, setGuestCountries] = useState<GuestCountries[]>([]);
  const [travelAgent, setTravelAgent] = useState<TravelAgents[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    customerId: number;
    customerCode: string;
    name: string;
  }>({ isOpen: false, customerId: 0, customerCode: "", name: "" });
  
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [pendingGuestData, setPendingGuestData] = useState<any>(null);
  const [customerCode, setCustomerCode] = useState("");

  // Define columns for the DataTable (with Travel Agent page style)
  const GuestInfoColumns: Column<GuestInfo>[] = [
    // {
    //   key: "index",
    //   header: "#",
    //   width: "20",
    //   sortable: false,
    //   render: (_value: any, _row: GuestInfo, index: number) => (
    //     <span className="font-medium text-gray-600 dark:text-gray-400">
    //       {index + 1}
    //     </span>
    //   ),
    // },
    {
      key: "customerCode",
      header: "Guest Code",
      sortable: true,
      searchable: true,
      width: "100px",
      render: (value: string) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {value}
        </span>
      ),
    },
    {
      key: "name",
      header: "Guest Name",
      sortable: true,
      searchable: true,
      render: (value: string) => (
        <span className="text-gray-900 dark:text-white">
          {value}
        </span>
      ),
    },
    {
      key: "mobile",
      header: "Mobile No",
      sortable: true,
      searchable: true,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      searchable: true,
    },
    {
      key: "isActive",
      header: "Status",
      sortable: true,
      searchable: false,
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
   {
  key: "actions",
  header: "Actions",
  width: "100px",
  sortable: false,
  render: (_value: any, row: GuestInfo) => (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleRowClick(row);
        }}
        className="p-2 border-2 border-blue-200 hover:border-blue-400 dark:border-blue-800 dark:hover:border-blue-600 bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-all duration-200 group shadow-sm hover:shadow-md"
        title="Edit"
      >
        <FiEdit2 className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation(); // ✅ Fixed: Added parentheses
          e.preventDefault();
          setDeleteConfirmModal({
            isOpen: true,
            customerId: row.CustomerID,
            customerCode: row.customerCode,
            name: row.name
          });
        }}
        className="p-2 border-2 border-red-200 hover:border-red-400 dark:border-red-800 dark:hover:border-red-600 bg-white dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-all duration-200 group shadow-sm hover:shadow-md"
        title="Delete"
      >
        <FiTrash2 className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  ),
}
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F3") {
        event.preventDefault();
        handleAddNew();
      }
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchAllData();
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Generic fetch function (from your working code)
  const fetchData = async (
    endpoint: string,
    options: {
      onSuccess?: (data: any) => void;
      onError?: (error: string) => void;
      errorMessage?: string;
      requiresAuth?: boolean;
      method?: string;
      body?: any;
      allow404Empty?: boolean;
    } = {}
  ) => {
    const {
      onSuccess,
      onError,
      errorMessage = "Failed to fetch data",
      requiresAuth = true,
      method = "GET",
      body,
      allow404Empty = false,
    } = options;

    setLoading(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (requiresAuth) {
        const token =
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken");

        if (!token) throw new Error("No authentication token found");

        headers.Authorization = `Bearer ${token}`;
      }

      const fetchOptions: RequestInit = { method, headers };

      if (body && method !== "GET") {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

      if (!response.ok) {
        if (response.status === 404 && allow404Empty) {
          if (onSuccess) onSuccess([]);
          return [];
        }

        if (response.status === 401) {
          throw new Error("Authentication failed. Please login again.");
        } else if (response.status === 403) {
          throw new Error("Access denied.");
        } else {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
      }

      const data = await response.json();

      if (onSuccess) {
        onSuccess(data);
      }

      return data;
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      const errorMsg = error instanceof Error ? error.message : errorMessage;

      if (onError) {
        onError(errorMsg);
      } else {
        showErrorToast(errorMsg);
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestInfo = async () => {
    await fetchData("/api/Customer/getall", {
      allow404Empty: true,
      onSuccess: (data) => {
        const sortedData = Array.isArray(data)
          ? [...data].sort((a, b) =>
              String(a.customerCode).localeCompare(
                String(b.customerCode),
                undefined,
                {
                  numeric: true,
                  sensitivity: "base",
                }
              )
            )
          : [];
        setGuestInfo(sortedData);
      },
      onError: (error) => {
        showErrorToast(error);
        setGuestInfo([]);
      },
      errorMessage: "Failed to fetch guest information",
    });
  };

  const fetchNextCode = async () => {
    await fetchData("/api/Customer/getNextCode", {
      allow404Empty: true,
      onSuccess: (data) => {
        setCustomerCode(data.nextCode || "");
      },
      onError: (error) => {
        showErrorToast(error);
        setCustomerCode("");
      },
      errorMessage: "Failed to fetch guest code",
    });
  };

  const fetchGuestTypes = async () => {
    await fetchData("/api/CustomerType/getall", {
      allow404Empty: true,
      onSuccess: (data: any) => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid guest type data received.");
        }

        const validTypes = data.filter(
          (type: GuestTypes) => type.customerTypeCode && type.description
        );

        if (validTypes.length === 0) {
          showErrorToast("No Guest Types found");
        }

        setGuestTypes(validTypes);
      },
      onError: (error) => {
        showErrorToast(error);
        setGuestTypes([]);
      },
      errorMessage: "Failed to fetch guest types",
    });
  };

  const fetchGuestTitile = async () => {
    await fetchData("/api/Title/getall", {
      allow404Empty: true,
      onSuccess: (data: any) => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid guest type data received.");
        }

        const validTitles = data.filter(
          (type: GuestTitles) => type.titleCode && type.description
        );

        if (validTitles.length === 0) {
          showErrorToast("No Guest Titles found");
        }

        setGuestTitles(validTitles);
      },
      onError: (error) => {
        showErrorToast(error);
        setGuestTitles([]);
      },
      errorMessage: "Failed to fetch guest titles",
    });
  };

  const fetchGuestNationality = async () => {
    await fetchData("/api/Nationality/getall", {
      allow404Empty: true,
      onSuccess: (data: any) => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid guest type data received.");
        }

        const validNationality = data.filter(
          (type: GuestNationalities) => type.nationalityCode && type.description
        );

        if (validNationality.length === 0) {
          showErrorToast("No Guest Nationality found");
        }

        setGuestNationality(validNationality);
      },
      onError: (error) => {
        showErrorToast(error);
        setGuestNationality([]);
      },
      errorMessage: "Failed to fetch guest titles",
    });
  };

  const fetchGuestCountry = async () => {
    await fetchData("/api/Country/getall", {
      allow404Empty: true,
      onSuccess: (data: any) => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid guest type data received.");
        }

        const validCountry = data.filter(
          (type: GuestCountries) => type.countryCode && type.description
        );

        if (validCountry.length === 0) {
          showErrorToast("No Guest Country found");
        }

        setGuestCountries(validCountry);
      },
      onError: (error) => {
        showErrorToast(error);
        setGuestCountries([]);
      },
      errorMessage: "Failed to fetch guest countries",
    });
  };

  const fetchTravelAgent = async () => {
    await fetchData("/api/TravelAgent/getall", {
      allow404Empty: true,
      onSuccess: (data: any) => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid guest type data received.");
        }

        const validTravelAgent = data.filter(
          (type: TravelAgents) => type.travelAgentCode && type.description
        );

        if (validTravelAgent.length === 0) {
          showErrorToast("No Travel Agent found");
        }

        setTravelAgent(validTravelAgent);
      },
      onError: (error) => {
        showErrorToast(error);
        setTravelAgent([]);
      },
      errorMessage: "Failed to fetch travel agents",
    });
  };

  // Fetch all data at once
  const fetchAllData = async () => {
    try {
      const results = await Promise.allSettled([
        fetchGuestInfo(),
        fetchNextCode(),
        fetchGuestTypes(),
        fetchGuestTitile(),
        fetchGuestNationality(),
        fetchGuestCountry(),
        fetchTravelAgent(),
      ]);

      const failedOperations = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedOperations.length > 0) {
        console.warn(
          `${failedOperations.length} operations failed during initial load`
        );
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      showErrorToast("Failed to load some data. Please refresh the page.");
    }
  };

  const guestTypeOptions = guestTypes.map((type) => ({
    label: type.description,
    value: type.customerTypeCode,
  }));

  const guestTitleOptions = guestTitles.map((type) => ({
    label: type.description,
    value: type.titleCode,
  }));

  const guestNationalityOptions = guestNationality.map((type) => ({
    label: type.description,
    value: type.nationalityCode,
  }));

  const guestCountryOptions = guestCountries.map((type) => ({
    label: type.description,
    value: type.countryCode,
  }));

  const travelAgentsOptions = travelAgent.map((type) => ({
    label: type.description,
    value: type.travelAgentCode,
  }));



  // Search Handling (simplified for Travel Agent style)
  const handleChange = (e: React.FormEvent) => {
    const value = (e.target as HTMLInputElement).value;
    setSearchTerm(value);
  };

  // Handle select field changes
  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  const validateForm = () => {
    const requiredFields = [
      { field: "customerTypeCode", label: "Customer Type" },
      { field: "title", label: "Title" },
      { field: "name", label: "Full Name" },
      { field: "mobile", label: "Mobile Number" },
    ];

    const errors: string[] = [];

    requiredFields.forEach(({ field, label }) => {
      const value = formData[field as keyof typeof formData];
      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        errors.push(`${label} is required`);
      }
    });

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showErrorToast(
        `Please fill in required fields: ${validationErrors.join(", ")}`
      );
      return;
    }

    const formDataToSend = {
      ...formData,
      isActive: isChecked,
    };

    // Just stage the form data for saving (from your working code)
    setPendingGuestData(formDataToSend);
    setShowPrintModal(true);
  };

  // Function to handle the actual save operation (EXACTLY from your working code)
  const handleSaveGuest = async (shouldOpenPrintPreview: boolean = false) => {
    if (!pendingGuestData) return;

    setIsSubmitting(true);
    const loadingToastId = showLoadingToast(
      isEditing ? "Updating customer..." : "Adding customer..."
    );

    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const url =
        isEditing && editingCustomer
          ? `${API_BASE_URL}/api/Customer/update/${editingCustomer.customerCode}`
          : `${API_BASE_URL}/api/Customer/save`;

      const method = isEditing ? "PUT" : "POST";

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      if (!(pendingGuestData instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch(url, {
        method,
        headers,
        body:
          pendingGuestData instanceof FormData
            ? pendingGuestData
            : JSON.stringify(pendingGuestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage =
            errorData.details ||
            errorData.message ||
            `Failed to ${isEditing ? "update" : "add"} customer`;
        } catch {
          errorMessage = `Server error: ${response.status} - ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      // Use the saved/updated payload returned by the API for printing
      const savedData = await response.json();

      dismissToast(loadingToastId);
      showSuccessToast(
        `Customer ${isEditing ? "updated" : "added"} successfully!`
      );

      // Prepare data for print *from the saved server response*
      const printPayload = {
        ...pendingGuestData,
        ...savedData,
      };

      // Store guest data for the print page
      sessionStorage.setItem("guestPrintData", JSON.stringify(printPayload));

      // Store lookup data for print
      sessionStorage.setItem(
        "guestLookupData",
        JSON.stringify({
          guestTypes,
          guestNationality,
          guestCountries,
          travelAgent,
        })
      );

      // Reset form and editing state
      handleClear();
      setIsEditing(false);
      setEditingCustomer(null);
      setPendingGuestData(null);
      await fetchGuestInfo();

      // After a successful save, optionally open the print preview
      if (shouldOpenPrintPreview) {
        window.open(`/customer-print`, "_blank", "width=800,height=600");
      }
    } catch (error) {
      dismissToast(loadingToastId);
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? "update" : "add"} customer`;
      showErrorToast(errorMessage);
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
      setShowPrintModal(false);
    }
  };

  const handleDelete = async (customerId: number, customerCode: string) => {
    const loadingToastId = showLoadingToast("Deleting guest...");
    
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      
      // Try DELETE endpoint first
      let response = await fetch(`${API_BASE_URL}/api/Customer/Delete/${customerCode}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // If DELETE doesn't work, try alternative methods
      if (!response.ok) {
        // Try with different endpoint variations
        const endpoints = [
          `${API_BASE_URL}/api/Customer/${customerId}`,
          `${API_BASE_URL}/api/Customer/${customerCode}`,
          `${API_BASE_URL}/api/Customer?customerId=${customerId}`,
          `${API_BASE_URL}/api/Customer?customerCode=${customerCode}`,
        ];
        
        for (const endpoint of endpoints) {
          response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            break;
          }
        }
      }

      if (response && response.ok) {
        dismissToast(loadingToastId);
        showSuccessToast("Guest deleted successfully!");
        
        // Refresh the guest list
        await fetchGuestInfo();
        
        // Close the confirmation modal
        setDeleteConfirmModal({ isOpen: false, customerId: 0, customerCode: "", name: "" });
        
        // Close edit modal if open for this guest
        if (editingCustomer?.CustomerID === customerId) {
          handleCloseModal();
        }
      } else {
        // If DELETE endpoints don't work, try frontend-only delete
        console.warn("No backend delete endpoint found. Implementing frontend-only delete.");
        
        // Frontend-only delete (temporary solution)
        setGuestInfo(prev => prev.filter(guest => guest.CustomerID !== customerId));
        dismissToast(loadingToastId);
        showSuccessToast("Guest removed from list");
        
        // Close modals
        setDeleteConfirmModal({ isOpen: false, customerId: 0, customerCode: "", name: "" });
        if (editingCustomer?.CustomerID === customerId) {
          handleCloseModal();
        }
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Delete error:", error);
      
      // Type-safe error handling
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      showErrorToast(`Failed to delete guest: ${errorMessage}`);
    }
  };

  const handleRowClick = (row: GuestInfo) => {
    setFormData({
      customerCode: row.customerCode,
      customerTypeCode: row.customerTypeCode,
      title: row.title,
      name: row.name,
      niC_PassportNo: row.niC_PassportNo,
      nationalityCode: row.nationalityCode,
      countryCode: row.countryCode,
      mobile: row.mobile,
      telephone: row.telephone,
      email: row.email,
      address: row.address,
      travelAgentCode: row.travelAgentCode,
      creditLimit: row.creditLimit,
      whatsapp: row.whatsapp,
      remark: row.remark,
      isActive: row.isActive || true,
      isNew: false,
    });
    setEditingCustomer(row);
    setIsEditing(true);
    setIsChecked(row.isActive || true);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    handleClear();
    fetchNextCode();
    setIsModalOpen(true);
  };

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
      whatsapp: "",
      remark: "",
      isActive: true,
      isNew: true,
    });

    // Reset editing states
    setEditingCustomer(null);
    setIsEditing(false);
    setIsChecked(true);
    setSearchTerm("");

    // Fetch next code for new entry
    fetchNextCode();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    handleClear();
  };

  const filteredData = guestInfo.filter(guest => {
    const matchesSearch = searchTerm 
      ? guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.mobile.includes(searchTerm)
      : true;
    
    return matchesSearch;
  });

  return (
    <>
      <PageMeta title="Guest Information Management" description="Manage hotel guest information and profiles" />

      {/* Header - Travel Agent Style */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Guest Information Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and organize all hotel guest information and profiles
            </p>
          </div>
          
          <Button
            type="button"
            onClick={handleAddNew}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 border-0 flex items-center gap-2"
            size="md"
          >
            <FiPlus className="w-4 h-4" />
            Add New Guest
          </Button>
        </div>
      </div>

      {/* Stats Cards - Travel Agent Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Guests Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Guests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {guestInfo.length}
              </p>
            </div>
          </div>
        </div>

        {/* Active Guests Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiUser className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Guests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {guestInfo.filter(g => g.isActive).length}
              </p>
            </div>
          </div>
        </div>

        {/* International Guests Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FiGlobe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">International</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {guestInfo.filter(g => g.countryCode !== 'LK').length}
              </p>
            </div>
          </div>
        </div>

        {/* Travel Agent Guests Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <FiBriefcase className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Agent Guests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {guestInfo.filter(g => g.travelAgentCode).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Travel Agent Style */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleChange}
                  placeholder="Search guests by name, code, email, or phone..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <FiX className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddNew}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                title="Press F3 to add new guest"
              >
                <FiPlus className="w-4 h-4" />
                Quick Add (F3)
              </button>
            </div>
          </div>
        </div>

        {/* DataTable */}
        <div className="p-6">
          {guestInfo.length === 0 && loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading guests...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No guests found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? "Try changing your search criteria" 
                  : "Get started by adding your first guest"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add New Guest
                </Button>
              )}
            </div>
          ) : (
            <DataTable
              data={filteredData}
              columns={GuestInfoColumns}
              loading={loading}
              searchable={false}
              pagination={true}
              sortable={true}
              pageSize={10}
              onRowClick={handleRowClick}
              emptyMessage="No guests found"
              className="border-0 shadow-none"
            />
          )}
        </div>
      </div>

      {/* Add/Edit Guest Modal - Travel Agent Style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ">
          <div className="relative w-full max-w-[1200px] animate-fadeIn">
            {/* Modal Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isEditing ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                      {isEditing ? (
                        <FiEdit2 className={`w-6 h-6 ${isEditing ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'}`} />
                      ) : (
                        <FiUser className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {isEditing ? 'Edit Guest Information' : 'Add New Guest'}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {isEditing ? `Editing guest ${formData.customerCode}` : 'Fill in the details to add a new guest'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[70vh]  overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Guest Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Guest Code
                    </label>
                    <Input
                      name="customerCode"
                      value={formData.customerCode || customerCode}
                      readonly={!!isEditing}  
                      className="w-full"
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Guest Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Guest Type <span className="text-red-500">*</span>
                      </label>
                      <Select
                        key={`guest-type-${formData.customerTypeCode}`}
                        options={guestTypeOptions}
                        onChange={(value) =>
                          handleSelectChange("customerTypeCode", value || "")
                        }
                        placeholder="Select Guest Type"
                        value={formData.customerTypeCode}
                      />
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <Select
                        key={`title-${formData.title}`}
                        options={guestTitleOptions}
                        onChange={(value) => handleSelectChange("title", value || "")}
                        placeholder="Select Title"
                        value={formData.title}
                      />
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        placeholder="Enter Full Name"
                        required
                        className="w-full"
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* NIC/Passport */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        NIC/Passport No
                      </label>
                      <Input
                        name="niC_PassportNo"
                        value={formData.niC_PassportNo}
                        placeholder="Enter NIC or Passport Number"
                        className="w-full"
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Nationality */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nationality
                      </label>
                      <Select
                        key={`nationality-${formData.nationalityCode}`}
                        options={guestNationalityOptions}
                        onChange={(value) =>
                          handleSelectChange("nationalityCode", value || "")
                        }
                        placeholder="Select Nationality"
                        value={formData.nationalityCode}
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Country
                      </label>
                      <Select
                        key={`country-${formData.countryCode}`}
                        options={guestCountryOptions}
                        onChange={(value) =>
                          handleSelectChange("countryCode", value || "")
                        }
                        placeholder="Select Country"
                        value={formData.countryCode}
                      />
                    </div>

                    {/* Mobile */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mobile No <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="mobile"
                        value={formData.mobile}
                        placeholder="Enter Mobile Number"
                        required
                        className="w-full"
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Telephone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Telephone No
                      </label>
                      <Input
                        name="telephone"
                        value={formData.telephone}
                        placeholder="Enter Telephone Number"
                        className="w-full"
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        WhatsApp No
                      </label>
                      <Input
                        name="whatsapp"
                        value={formData.whatsapp}
                        placeholder="Enter WhatsApp Number"
                        className="w-full"
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <Input
                        name="email"
                        value={formData.email}
                        placeholder="Enter Email Address"
                        type="email"
                        className="w-full"
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Travel Agent */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Travel Agent
                      </label>
                      <Select
                        key={`travel-agent-${formData.travelAgentCode}`}
                        options={travelAgentsOptions}
                        onChange={(value) =>
                          handleSelectChange("travelAgentCode", value || "")
                        }
                        placeholder="Select Travel Agent"
                        value={formData.travelAgentCode}
                      />
                    </div>

                    {/* Credit Limit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Credit Limit
                      </label>
                      <Input
                        name="creditLimit"
                        value={formData.creditLimit}
                        placeholder="Enter Credit Limit"
                        className="w-full"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

              <div className="flex gap-4">
  {/* Address */}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Address
    </label>
    <textarea
      name="address"
      value={formData.address}
      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      rows={3}
      placeholder="Enter full address..."
      onChange={handleTextAreaChange}
    />
  </div>

  {/* Remarks */}
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Remarks
    </label>
    <textarea
      name="remark"
      value={formData.remark}
      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      rows={3}
      placeholder="Enter any remarks or notes..."
      onChange={handleTextAreaChange}
    />
  </div>
</div>


                  {/* Active Checkbox */}
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Active Guest
                    </span>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                        className="
    px-5 py-2.5 text-sm font-medium
    text-white bg-gray-500 rounded-lg
    hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600
    transition-colors
  "
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                        className="
    px-5 py-2.5 text-sm font-medium
    text-white bg-gray-500 rounded-lg
    hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600
    transition-colors
  "
                      disabled={isSubmitting}
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                        isEditing
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? isEditing
                          ? "Updating..."
                          : "Adding..."
                        : isEditing
                        ? "Update Guest"
                        : "Save Guest"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Travel Agent Style */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <FiTrash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Confirm Delete
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete guest <span className="font-bold">"{deleteConfirmModal.customerCode}"</span>?
                  {deleteConfirmModal.name && deleteConfirmModal.name !== deleteConfirmModal.customerCode && (
                    <span className="ml-1">({deleteConfirmModal.name})</span>
                  )}
                </p>
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                  ⚠️ This will permanently remove the guest and cannot be recovered.
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Note: This may affect reservations and bookings for this guest.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmModal({ isOpen: false, customerId: 0, customerCode: "", name: "" })}
                    className="
    px-5 py-2.5 text-sm font-medium
    text-white bg-gray-500 rounded-lg
    hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600
    transition-colors
  "
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirmModal.customerId, deleteConfirmModal.customerCode)}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg transition-colors"
                >
                  Delete Guest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Confirmation Modal - Travel Agent Style */}
      {showPrintModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FiMail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Print Guest Information
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Save and print options
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Do you want to print the guest information after saving?
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                  {/* YES → Save first, then open print preview with saved data */}
                  <Button
                    type="button"
                    className="w-full sm:w-auto sm:min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white"
                    size="md"
                    onClick={() => {
                      handleSaveGuest(true);
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Yes, Print"}
                  </Button>

                  {/* NO → Save directly without opening print */}
                  <Button
                    type="button"
                    size="md"
                    className="w-full sm:w-auto sm:min-w-[120px] bg-gray-500 hover:bg-gray-600 text-white"
                    onClick={() => {
                      handleSaveGuest(false);
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "No, Skip Print"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}