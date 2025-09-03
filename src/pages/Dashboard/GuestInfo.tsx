import { useState, useEffect, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
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
import { FiSearch, FiX } from "react-icons/fi";
// import FileInput from "../../components/form/input/FileInput";
import Label from "../../components/form/Label";

//Sample guest data
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
  const [editingCustomer, setEditingCustomer] = useState<GuestInfo | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestInfo[]>([]);
  const [guestTypes, setGuestTypes] = useState<GuestTypes[]>([]);
  const [guestTitles, setGuestTitles] = useState<GuestTitles[]>([]);
  const [guestNationality, setGuestNationality] = useState<
    GuestNationalities[]
  >([]);
  const [guestCountries, setGuestCountries] = useState<GuestCountries[]>([]);
  const [travelAgent, setTravelAgent] = useState<TravelAgents[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredGuestInfo, setFilteredGuestInfo] = useState<GuestInfo[]>([]);
  const [customerCode, setCustomerCode] = useState("");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [pendingGuestData, setPendingGuestData] = useState<any>(null);

  // Define columns for the DataTable
  const GuestInfoColumns: Column<GuestInfo>[] = [
    {
      key: "customerCode",
      header: "Guest Code",
      sortable: true,
      searchable: true,
    },
    {
      key: "customerTypeCode",
      header: "Guest Type",
      sortable: true,
      searchable: true,
      render: (value) =>
        getDescriptionByCode(
          value,
          guestTypes,
          "customerTypeCode",
          "description"
        ),
    },
    {
      key: "title",
      header: "Guest Title",
      sortable: true,
      searchable: true,
      render: (value) =>
        getDescriptionByCode(value, guestTitles, "titleCode", "description"),
    },
    {
      key: "name",
      header: "Guest Name",
      sortable: true,
      searchable: true,
    },
    {
      key: "niC_PassportNo",
      header: "Nic/Passport",
      sortable: true,
      searchable: true,
    },
    {
      key: "nationalityCode",
      header: "Nationality",
      sortable: true,
      searchable: true,
      render: (value) =>
        getDescriptionByCode(
          value,
          guestNationality,
          "nationalityCode",
          "description"
        ),
    },
    {
      key: "countryCode",
      header: "Country",
      sortable: true,
      searchable: true,
      render: (value) =>
        getDescriptionByCode(
          value,
          guestCountries,
          "countryCode",
          "description"
        ),
    },
    {
      key: "mobile",
      header: "Mobile No",
      sortable: true,
      searchable: true,
    },
    {
      key: "telephone",
      header: "Telephone No",
      sortable: true,
      searchable: true,
    },
    {
      key: "whatsapp",
      header: "Whatsapp No",
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
      key: "address",
      header: "Address",
      sortable: false,
      searchable: false,
    },
    {
      key: "travelAgentCode",
      header: "Travel Agent",
      sortable: false,
      searchable: false,
      render: (value) =>
        getDescriptionByCode(
          value,
          travelAgent,
          "travelAgentCode",
          "description"
        ),
    },
    {
      key: "creditLimit",
      header: "Credit Limit",
      sortable: false,
      searchable: false,
    },
  ];

  // Handle F3 key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F3") {
        event.preventDefault();
        setIsModalOpen(true);
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

  // Generic fetch function to handle different API calls
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

      // Check if any critical operations failed
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

  const getDescriptionByCode = (
    code: string,
    dataArray: any[],
    codeField: string,
    descField: string
  ) => {
    const item = dataArray.find((item) => item[codeField] === code);
    return item ? item[descField] : code;
  };

  // Search Handling
  const handleChange = (e: React.FormEvent) => {
    const value = (e.target as HTMLInputElement).value;
    setSearchTerm(value);

    // Filter guest info based on search term
    if (value.trim() === "") {
      setFilteredGuestInfo([]);
    } else {
      const filtered = guestInfo.filter(
        (guestInfo) =>
          guestInfo.customerCode.toLowerCase().includes(value.toLowerCase()) ||
          guestInfo.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredGuestInfo(filtered);
    }
  };

  // Function to handle selecting a guest infomation from search results
  const handleSearchResultClick = (guestInfo: GuestInfo) => {
    setFormData({
      customerCode: guestInfo.customerCode,
      customerTypeCode: guestInfo.customerTypeCode,
      title: guestInfo.title,
      name: guestInfo.name,
      niC_PassportNo: guestInfo.niC_PassportNo,
      nationalityCode: guestInfo.nationalityCode,
      countryCode: guestInfo.countryCode,
      mobile: guestInfo.mobile,
      telephone: guestInfo.telephone,
      email: guestInfo.email,
      address: guestInfo.address,
      travelAgentCode: guestInfo.travelAgentCode,
      creditLimit: guestInfo.creditLimit,
      whatsapp: guestInfo.whatsapp,
      remark: guestInfo.remark,
      isActive: guestInfo.isActive || true,
      isNew: false,
    });
    setEditingCustomer(guestInfo);
    setIsEditing(true);
    setIsChecked(guestInfo.isActive || true);
    setSearchTerm("");
    setFilteredGuestInfo([]);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredGuestInfo([]);
    handleClear();
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

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       // image: file.name,
  //     }));
  //   }
  // };

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

    // Just stage the form data for saving
    setPendingGuestData(formDataToSend);
    setShowPrintModal(true);
  };

  // Function to handle the actual save operation
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

  const handleClear = () => {
    // Clear form data completely
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
    setFilteredGuestInfo([]);

    // Fetch next code for new entry
    fetchNextCode();
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
    setIsModalOpen(false);
  };

  return (
    <>
      <PageMeta
        title="Guest Information - Reservation System"
        description="Manage guest information"
      />

      {/* Breadcrumb and Header container */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        {/* Breadcrumb */}
        <nav className="order-2 lg:order-1">
          <ol className="flex items-center justify-center lg:justify-start space-x-2 text-sm">
            <li>
              <a
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Dashboard
              </a>
            </li>
            <li className="text-gray-500 dark:text-gray-400">/</li>
            <li className="text-gray-900 dark:text-white">Guest Information</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="order-1 lg:order-2">
          <h3 className="font-semibold text-gray-800 text-xl text-center lg:text-left dark:text-white/90 sm:text-2xl">
            Manage Guest Information
          </h3>
        </div>

        {/* Empty div for equal spacing on desktop only */}
        <div className="hidden lg:block lg:w-[120px] lg:order-3"></div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-8">
        <div className="mx-auto w-full max-w-[1000px]">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Search Field */}
            <div className="w-full sm:w-2/5 sm:ml-auto relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleChange}
                placeholder="Search by code or description...."
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-4 py-2 pr-10 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              />

              <div className="absolute inset-y-0 right-3 flex items-center">
                {searchTerm ? (
                  <FiX
                    className="w-4 h-4 text-gray-500 hover:text-red-500 cursor-pointer"
                    onClick={clearSearch}
                  />
                ) : (
                  <FiSearch className="w-4 h-4 text-gray-400" />
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchTerm && filteredGuestInfo.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-b-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredGuestInfo.map((guestInfo) => (
                    <div
                      key={guestInfo.CustomerID}
                      onClick={() => handleSearchResultClick(guestInfo)}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {guestInfo.customerCode}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {guestInfo.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* No Results Message */}
              {searchTerm &&
                filteredGuestInfo.length === 0 &&
                guestInfo.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-b-md shadow-lg">
                    <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                      No guest information found
                    </div>
                  </div>
                )}
            </div>

            <div className="flex-1 mt-6">
              <Label>Guest Code</Label>
              <Input
                name="customerCode"
                value={formData.customerCode || customerCode}
                disabled
                className="w-full bg-gray-100 cursor-not-allowed"
                onChange={() => {}}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <Label>
                  Select Guest Type <span className="text-red-500">*</span>
                </Label>
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
              <div>
                <Label>
                  Title <span className="text-red-500">*</span>
                </Label>
                <Select
                  key={`title-${formData.title}`}
                  options={guestTitleOptions}
                  onChange={(value) => handleSelectChange("title", value || "")}
                  placeholder="Select Title"
                  value={formData.title}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  placeholder="Enter Name"
                  required
                  className="w-full"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  NIC/Passport
                </label>
                <Input
                  name="niC_PassportNo"
                  value={formData.niC_PassportNo}
                  placeholder="Enter Passport No"
                  required
                  className="w-full"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Nationality
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Country
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mobile No <span className="text-red-500">*</span>
                </label>
                <Input
                  name="mobile"
                  value={formData.mobile}
                  placeholder="Enter Mobile No"
                  className="w-full"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telephone No
                </label>
                <Input
                  name="telephone"
                  value={formData.telephone}
                  placeholder="Enter Telephone No"
                  className="w-full"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Whatsapp No
                </label>
                <Input
                  name="whatsapp"
                  value={formData.whatsapp}
                  placeholder="Enter Whatsapp No"
                  className="w-full"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <Input
                  name="email"
                  value={formData.email}
                  placeholder="Enter Email Address"
                  className="w-full"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <Input
                  name="address"
                  value={formData.address}
                  placeholder="Enter Address"
                  className="w-full"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Travel Agent
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
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
              <div className="flex items-center gap-3 mt-6">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Active
                </span>
              </div>
              {/* <div>
                <Label>Upload file</Label>
                <FileInput
                  onChange={handleFileChange}
                  className="custom-class"
                />
              </div> */}
            </div>
            <div>
              <Label>Remark</Label>
              <textarea
                name="remark"
                value={formData.remark}
                className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                rows={4}
                placeholder="Enter your remarks here"
                onChange={handleTextAreaChange}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 pb-3 justify-center items-center w-full">
              <Button
                type="submit"
                className={`w-50 sm:w-auto sm:min-w-[180px] ${
                  isEditing
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-200 border-yellow-300"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-300"
                } disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out`}
                size="md"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? isEditing
                    ? "Updating..."
                    : "Adding..."
                  : isEditing
                  ? "Update"
                  : "Submit"}
              </Button>

              <Button
                type="button"
                size="md"
                className="w-50 sm:w-auto sm:min-w-[180px] bg-gray-500 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleClear}
                disabled={isSubmitting}
              >
                {isEditing ? "Cancel" : "Clear"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Reusable Selection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Select Guest Information"
        size="2xl"
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

      {/* Print Confirmation Modal */}
      <Modal
        isOpen={showPrintModal}
        onClose={() => {
          setShowPrintModal(false);
          setPendingGuestData(null);
        }}
        title="Print Confirmation"
        size="sm"
      >
        <div className="p-4">
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300">
              Do you want to print the guest information before saving?
            </p>
          </div>

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
      </Modal>
    </>
  );
}
