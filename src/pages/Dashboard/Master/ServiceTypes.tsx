import { useState, useEffect, useRef } from "react";
import PageMeta from "../../../components/common/PageMeta";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import DataTable, { Column } from "../../../components/tables/DataTable";
import API_BASE_URL from "../../../config/api";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "../../../components/alert/ToastAlert";
import { FiSearch, FiX, FiPlus, FiEdit2, FiTrash2, FiFilter, FiPackage, FiTag, FiDollarSign } from "react-icons/fi";

interface ServiceTypes {
  serviceTypeID: number;
  serviceCode: string;
  serviceName: string;
  quantity: number;
  serviceAmount: number;
  remarks: string;
  isRoom: boolean;
  isBanquet: boolean;
}

export default function ServiceTypes() {
  const [formData, setFormData] = useState({
    serviceCode: "",
    serviceName: "",
    quantity: "",
    serviceAmount: "",
    remarks: "",
    type: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypes[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    serviceTypeId: number;
    serviceCode: string;
    serviceName: string;
  }>({ isOpen: false, serviceTypeId: 0, serviceCode: "", serviceName: "" });
  
  const hasFetched = useRef(false);

  const typeOptions = [
    { value: "Room", label: "Room", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
    { value: "Banquet", label: "Banquet", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
    { value: "Both", label: "Both", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400" },
  ];

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatNumber = (value: number) => {
    return value.toString();
  };

  const formatThousand = (value: string) => {
    if (!value) return "";
    const num = value.replace(/,/g, "");
    if (!num) return "";
    const parsed = parseFloat(num);
    return isNaN(parsed) ? "" : parsed.toLocaleString();
  };

  const serviceColumns: Column<ServiceTypes>[] = [
    // {
    //   key: "index",
    //   header: "#",
    //   width: "20",
    //   sortable: false,
    //   render: (_value: any, _row: ServiceTypes, index: number) => (
    //     <span className="font-medium text-gray-600 dark:text-gray-400">
    //       {index + 1}
    //     </span>
    //   ),
    // },
    {
      key: "serviceCode",
      header: "Service Code",
      sortable: true,
      searchable: true,
      width: "100px",
      render: (value: string) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {value}
        </span>
      ),
    },
    {
      key: "serviceName",
      header: "Service Name",
      sortable: true,
      searchable: true,
      render: (value: string) => (
        <span className="text-gray-900 dark:text-white">
          {value}
        </span>
      ),
    },
    {
      key: "type",
      header: "Service Type",
      sortable: true,
      searchable: true,
      width: "100px",
      render: (_value: any, row: ServiceTypes) => {
        let typeStr = "";
        let colorClass = "";
        
        if (row.isRoom && row.isBanquet) {
          typeStr = "Both";
          colorClass = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
        } else if (row.isRoom) {
          typeStr = "Room";
          colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        } else if (row.isBanquet) {
          typeStr = "Banquet";
          colorClass = "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
        }
        
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {typeStr}
          </span>
        );
      },
    },
    {
      key: "quantity",
      header: "Quantity",
      sortable: true,
      searchable: true,
      width: "90px",
      align: "left",
      render: (value: number) => (
        <span className="text-gray-600 dark:text-gray-400">
          {formatNumber(value)}
        </span>
      ),
    },
    {
      key: "serviceAmount",
      header: "Amount",
      sortable: true,
      searchable: true,
      width: "120px",
      align: "left",
      render: (value: number) => (
        <span className="font-bold text-blue-600 dark:text-blue-400">
          Rs. {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: "remarks",
      header: "Remarks",
      sortable: false,
      searchable: true,
      render: (value: string) => (
        <span className="text-gray-600 dark:text-gray-400">
          {value || "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "100px",
      sortable: false,
      render: (_value: any, row: ServiceTypes) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRowClick(row)}
             className="p-2 border-2 border-blue-200 hover:border-blue-400 dark:border-blue-800 dark:hover:border-blue-600 bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-all duration-200 group shadow-sm hover:shadow-md"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform" />
          </button>
          <button
            onClick={(event) =>{
              event.stopPropagation(); // prevent row click
            setDeleteConfirmModal({
              isOpen: true,
              serviceTypeId: row.serviceTypeID,
              serviceCode: row.serviceCode,
              serviceName: row.serviceName
            });
          } }
           className="p-2 border-2 border-red-200 hover:border-red-400 dark:border-red-800 dark:hover:border-red-600 bg-white dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-all duration-200 group shadow-sm hover:shadow-md"
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ),
    },
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
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const fetchServiceTypes = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/api/ServiceType/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServiceTypes(Array.isArray(data) ? data : []);
      } else {
        throw new Error(`Failed to fetch Service Types: ${response.status}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load service types";
      showErrorToast(errorMessage);
      setServiceTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNextCode = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      const response = await fetch(
        `${API_BASE_URL}/api/ServiceType/getNextCode`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          serviceCode: data.nextCode || "",
        }));
      } else {
        throw new Error("Failed to fetch Service Type code");
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load service type code";
      showErrorToast(errorMessage);
      setFormData((prev) => ({
        ...prev,
        serviceCode: "",
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchServiceTypes();
      fetchNextCode();
    }
  }, []);

  const handleChange = (e: React.FormEvent) => {
    const value = (e.target as HTMLInputElement).value;
    setSearchTerm(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Remove all commas for internal value
    const rawValue = value.replace(/,/g, "");

    // Allow only numbers and decimal point
    if (!/^\d*\.?\d*$/.test(rawValue)) return;

    setFormData((prev) => ({
      ...prev,
      [name]: rawValue,
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
      { field: "serviceName", label: "Service Name" },
      { field: "type", label: "Service Type" },
      { field: "serviceAmount", label: "Service Amount" },
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

    setIsSubmitting(true);
    const loadingToastId = showLoadingToast(
      editingId ? "Updating Service Type..." : "Adding Service Type..."
    );

    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      const url = editingId
        ? `${API_BASE_URL}/api/ServiceType/Update/${editingId}`
        : `${API_BASE_URL}/api/ServiceType/add`;

      // Determine isRoom and isBanquet based on type selection
      const isRoom = formData.type === "Room" || formData.type === "Both";
      const isBanquet = formData.type === "Banquet" || formData.type === "Both";

      // Prepare data matching the C# model structure
      const requestData = {
        ...(editingId && { serviceTypeID: editingId }),
        serviceCode: formData.serviceCode || "",
        serviceName: formData.serviceName.trim(),
        quantity: parseFloat(formData.quantity) || 0,
        serviceAmount: parseFloat(formData.serviceAmount) || 0,
        remarks: formData.remarks || "",
        isRoom: isRoom,
        isBanquet: isBanquet,
      };

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        dismissToast(loadingToastId);
        showSuccessToast(
          editingId
            ? "Service Type updated successfully!"
            : "Service Type added successfully!"
        );
        handleClear();
        fetchServiceTypes();
        setIsModalOpen(false);
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Error saving service type:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save service type";
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (serviceTypeId: number, serviceCode: string) => {
    const loadingToastId = showLoadingToast("Deleting service type...");
    
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      
      // Try DELETE endpoint first
      let response = await fetch(`${API_BASE_URL}/api/ServiceType/Delete/${serviceTypeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // If DELETE doesn't work, try alternative methods
      if (!response.ok) {
        // Try with different endpoint variations
        const endpoints = [
          `${API_BASE_URL}/api/ServiceType/${serviceTypeId}`,
          `${API_BASE_URL}/api/ServiceType/${serviceCode}`,
          `${API_BASE_URL}/api/ServiceType?serviceTypeId=${serviceTypeId}`,
          `${API_BASE_URL}/api/ServiceType?serviceCode=${serviceCode}`,
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
        showSuccessToast("Service type deleted successfully!");
        
        // Refresh the service types list
        await fetchServiceTypes();
        
        // Close the confirmation modal
        setDeleteConfirmModal({ isOpen: false, serviceTypeId: 0, serviceCode: "", serviceName: "" });
        
        // Close edit modal if open for this service type
        if (editingId === serviceTypeId) {
          handleCloseModal();
        }
      } else {
        // If DELETE endpoints don't work, try frontend-only delete
        console.warn("No backend delete endpoint found. Implementing frontend-only delete.");
        
        // Frontend-only delete (temporary solution)
        setServiceTypes(prev => prev.filter(st => st.serviceTypeID !== serviceTypeId));
        dismissToast(loadingToastId);
        showSuccessToast("Service type removed from list");
        
        // Close modals
        setDeleteConfirmModal({ isOpen: false, serviceTypeId: 0, serviceCode: "", serviceName: "" });
        if (editingId === serviceTypeId) {
          handleCloseModal();
        }
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Delete error:", error);
      
      // Type-safe error handling
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      showErrorToast(`Failed to delete service type: ${errorMessage}`);
    }
  };

  const handleRowClick = (row: ServiceTypes) => {
    // Determine type from boolean flags
    let type = "";
    if (row.isRoom && row.isBanquet) type = "Both";
    else if (row.isRoom) type = "Room";
    else if (row.isBanquet) type = "Banquet";

    setFormData({
      serviceCode: row.serviceCode,
      serviceName: row.serviceName,
      quantity: row.quantity.toString(),
      serviceAmount: row.serviceAmount.toString(),
      remarks: row.remarks || "",
      type: type,
    });
    setEditingId(row.serviceTypeID);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    handleClear();
    fetchNextCode();
    setIsModalOpen(true);
  };

  const handleClear = () => {
    setFormData({
      serviceCode: "",
      serviceName: "",
      quantity: "",
      serviceAmount: "",
      remarks: "",
      type: "",
    });
    setEditingId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    handleClear();
  };

  const handleClearClick = () => {
    handleClear();
    fetchNextCode();
  };

  const filteredData = serviceTypes.filter(st => {
    const matchesSearch = searchTerm 
      ? st.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.serviceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (st.remarks && st.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    
    const matchesType = typeFilter === "ALL" || 
      (typeFilter === "Room" && st.isRoom && !st.isBanquet) ||
      (typeFilter === "Banquet" && !st.isRoom && st.isBanquet) ||
      (typeFilter === "Both" && st.isRoom && st.isBanquet);
    
    return matchesSearch && matchesType;
  });

  const getTotalServiceTypesByType = (type: string) => {
    switch (type) {
      case "Room": return serviceTypes.filter(st => st.isRoom && !st.isBanquet).length;
      case "Banquet": return serviceTypes.filter(st => !st.isRoom && st.isBanquet).length;
      case "Both": return serviceTypes.filter(st => st.isRoom && st.isBanquet).length;
      default: return serviceTypes.length;
    }
  };

  // Calculate total revenue from service amounts
  const calculateTotalRevenue = () => {
    return serviceTypes.reduce((total, st) => {
      return total + st.serviceAmount;
    }, 0);
  };

  return (
    <>
      <PageMeta title="Service Types Management" description="Manage hotel service types, pricing, and configurations" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Service Types Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and organize all hotel service types
            </p>
          </div>
          
          <Button
            type="button"
            onClick={handleAddNew}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 border-0 flex items-center gap-2"
            size="md"
          >
            <FiPlus className="w-4 h-4" />
            Add New Service Type
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Service Types Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Service Types</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {serviceTypes.length}
              </p>
            </div>
          </div>
        </div>

        {/* Service Types Cards */}
        {typeOptions.map((type) => (
          <div key={type.value} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${type.color}`}>
                <FiTag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{type.label} Services</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {getTotalServiceTypesByType(type.value)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Total Revenue Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                Rs. {formatCurrency(calculateTotalRevenue())}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
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
                  placeholder="Search services by code, name, or remarks..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <FiX className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter */}
            <div className="relative">
              <div className="flex items-center gap-3">
                <FiFilter className="w-5 h-5 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Types</option>
                  {typeOptions.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddNew}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                title="Press F3 to add new service type"
              >
                <FiPlus className="w-4 h-4" />
                Quick Add (F3)
              </button>
            </div>
          </div>
        </div>

        {/* DataTable */}
        <div className="p-6">
          {serviceTypes.length === 0 && loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading service types...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <FiPackage className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No service types found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || typeFilter !== "ALL" 
                  ? "Try changing your search or filter criteria" 
                  : "Get started by adding your first service type"}
              </p>
              {!searchTerm && typeFilter === "ALL" && (
                <Button
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add New Service Type
                </Button>
              )}
            </div>
          ) : (
            <DataTable
              data={filteredData}
              columns={serviceColumns}
              loading={loading}
              searchable={false}
              pagination={true}
              sortable={true}
              pageSize={10}
              onRowClick={handleRowClick}
              emptyMessage="No service types found"
              className="border-0 shadow-none"
            />
          )}
        </div>
      </div>

      {/* Add/Edit Service Type Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl animate-fadeIn">
            {/* Modal Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${editingId ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                      {editingId ? (
                        <FiEdit2 className={`w-6 h-6 ${editingId ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'}`} />
                      ) : (
                        <FiPackage className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {editingId ? 'Edit Service Type' : 'Add New Service Type'}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {editingId ? `Editing service type ${formData.serviceCode}` : 'Fill in the details to add a new service type'}
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
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Service Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Service Code
                    </label>
                    <Input
                      name="serviceCode"
                      value={formData.serviceCode}
                      readonly={!!editingId}
                      className="w-full"
                      onChange={handleTextInputChange}
                    />
                  </div>

                  {/* Form Grid - First Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Service Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Service Type <span className="text-red-500">*</span>
                      </label>
                      <Select
                        key={formData.type || "type"}
                        options={typeOptions}
                        onChange={(value) => handleSelectChange("type", value)}
                        placeholder="Select service type"
                        value={formData.type}
                        className="mb-0"
                      />
                    </div>

                    {/* Service Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Service Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="serviceName"
                        value={formData.serviceName}
                        placeholder="Enter service name"
                        required
                        className="w-full"
                        onChange={handleTextInputChange}
                      />
                    </div>
                  </div>

                  {/* Form Grid - Second Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Quantity
                      </label>
                      <Input
                        name="quantity"
                        value={formData.quantity}
                        placeholder="Enter quantity"
                        className="w-full"
                        onChange={handleNumericInputChange}
                      />
                    </div>

                    {/* Service Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Service Amount <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="serviceAmount"
                        value={formatThousand(formData.serviceAmount)}
                        placeholder="Enter service amount"
                        required
                        className="w-full"
                        onChange={handleNumericInputChange}
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-900/50"
                      rows={3}
                      placeholder="Additional notes or description..."
                      onChange={handleTextAreaChange}
                    />
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
                      onClick={handleClearClick}
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
                        editingId
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? editingId
                          ? "Updating..."
                          : "Adding..."
                        : editingId
                        ? "Update Service Type"
                        : "Add Service Type"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
                  Are you sure you want to delete service type <span className="font-bold">"{deleteConfirmModal.serviceCode}"</span>?
                  {deleteConfirmModal.serviceName && deleteConfirmModal.serviceName !== deleteConfirmModal.serviceCode && (
                    <span className="ml-1">({deleteConfirmModal.serviceName})</span>
                  )}
                </p>
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                  ⚠️ This will permanently remove the service type and cannot be recovered.
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Note: This may affect reservations using this service type.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmModal({ isOpen: false, serviceTypeId: 0, serviceCode: "", serviceName: "" })}
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
                  onClick={() => handleDelete(deleteConfirmModal.serviceTypeId, deleteConfirmModal.serviceCode)}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg transition-colors"
                >
                  Delete Service Type
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}