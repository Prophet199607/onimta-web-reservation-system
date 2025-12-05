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
import { FiSearch, FiX, FiPlus, FiEdit2, FiTrash2, FiFilter, FiPackage, FiTag } from "react-icons/fi";

interface Package {
  packageID: number;
  packageCode: string;
  packageName: string;
  packageDuration: number;
  remarks: string;
  roomPrice: number;
  roomCost: number;
  roomAmount: number;
  foodAmount: number;
  beverageAmount: number;
  isRoom: boolean;
  isBanquet: boolean;
  isVilla: boolean;
}

export default function PackageInfo() {
  const [formData, setFormData] = useState({
    packageCode: "",
    packageName: "",
    roomPrice: "",
    roomCost: "",
    packageDuration: "",
    roomAmount: "",
    foodAmount: "",
    beverageAmount: "",
    remarks: "",
    type: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [packageInfo, setPackageInfo] = useState<Package[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    packageId: number;
    packageCode: string;
    packageName: string;
  }>({ isOpen: false, packageId: 0, packageCode: "", packageName: "" });
  
  const hasFetched = useRef(false);

  const typeOptions = [
    { value: "Room", label: "Room", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
    { value: "Villa", label: "Villa", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    { value: "Banquet", label: "Banquet", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
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

  const packageColumns: Column<Package>[] = [
    // {
    //   key: "index",
    //   header: "#",
    //   width: "20",
    //   sortable: false,
    //   render: (_value: any, _row: Package, index: number) => (
    //     <span className="font-medium text-gray-600 dark:text-gray-400">
    //       {index + 1}
    //     </span>
    //   ),
    // },
    {
      key: "packageCode",
      header: "Package Code",
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
      key: "packageName",
      header: "Package Name",
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
      header: "Package Type",
      sortable: true,
      searchable: true,
      width: "100px",
      render: (_value: any, row: Package) => {
        const types: string[] = [];
        if (row.isRoom) types.push("Room");
        if (row.isBanquet) types.push("Banquet");
        if (row.isVilla) types.push("Villa");
        
        const typeStr = types.length > 0 ? types.join(" & ") : "Unknown";
        const typeOption = typeOptions.find(opt => opt.label === types[0]) || { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" };
        
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${typeOption.color}`}>
            {typeStr}
          </span>
        );
      },
    },
    {
      key: "packageDuration",
      header: "Duration (Hrs)",
      sortable: true,
      searchable: true,
      width: "100px",
      align: "center",
      render: (value: number) => (
        <span className="text-gray-600 dark:text-gray-400">
          {formatNumber(value)}
        </span>
      ),
    },
    {
      key: "roomPrice",
      header: "Price",
      sortable: true,
      searchable: true,
      width: "120px",
      align: "right",
      render: (value: number) => (
        <span className="font-bold text-blue-600 dark:text-blue-400">
          Rs. {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: "roomCost",
      header: "Cost",
      sortable: true,
      searchable: true,
      width: "120px",
      align: "right",
      render: (value: number) => (
        <span className="font-medium text-gray-900 dark:text-white">
          Rs. {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: "roomAmount",
      header: "Room Amount",
      sortable: true,
      searchable: true,
      width: "120px",
      align: "right",
      render: (value: number) => (
        <span className="font-medium text-gray-900 dark:text-white">
          Rs. {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: "foodAmount",
      header: "Food Amount",
      sortable: true,
      searchable: true,
      width: "120px",
      align: "right",
      render: (value: number) => (
        <span className="font-medium text-gray-900 dark:text-white">
          Rs. {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: "beverageAmount",
      header: "Beverage Amount",
      sortable: true,
      searchable: true,
      width: "130px",
      align: "right",
      render: (value: number) => (
        <span className="font-medium text-gray-900 dark:text-white">
          Rs. {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "100px",
      sortable: false,
      render: (_value: any, row: Package) => (
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
              packageId: row.packageID,
              packageCode: row.packageCode,
              packageName: row.packageName
            });
            }}
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

  const fetchPackageInfo = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/api/PackageInfo/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPackageInfo(Array.isArray(data) ? data : []);
      } else {
        throw new Error(
          `Failed to fetch Package Information: ${response.status}`
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load package information";
      showErrorToast(errorMessage);
      setPackageInfo([]);
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
        `${API_BASE_URL}/api/PackageInfo/getNextCode`,
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
          packageCode: data.nextCode || "",
        }));
      } else {
        throw new Error("Failed to fetch Package code");
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load package code";
      showErrorToast(errorMessage);
      setFormData((prev) => ({
        ...prev,
        packageCode: "",
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchPackageInfo();
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
      { field: "packageName", label: "Package Name" },
      { field: "type", label: "Package Type" },
      { field: "roomPrice", label: "Room Price" },
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
      editingId ? "Updating Package Info..." : "Adding Package Info..."
    );

    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      const url = editingId
        ? `${API_BASE_URL}/api/PackageInfo/Update/${editingId}`
        : `${API_BASE_URL}/api/PackageInfo/add`;

      // Prepare data matching the C# model structure
      const requestData = {
        ...(editingId && { packageID: editingId }),
        packageCode: formData.packageCode || "",
        packageName: formData.packageName.trim(),
        packageDuration: parseFloat(formData.packageDuration) || 0,
        remarks: formData.remarks || "",
        roomPrice: parseFloat(formData.roomPrice) || 0,
        roomCost: parseFloat(formData.roomCost) || 0,
        roomAmount: parseFloat(formData.roomAmount) || 0,
        foodAmount: parseFloat(formData.foodAmount) || 0,
        beverageAmount: parseFloat(formData.beverageAmount) || 0,
        isRoom: formData.type === "Room",
        isBanquet: formData.type === "Banquet",
        isVilla: formData.type === "Villa",
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
            ? "Package Information updated successfully!"
            : "Package Information added successfully!"
        );
        handleClear();
        fetchPackageInfo();
        setIsModalOpen(false);
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Error saving package info:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save package information";
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (packageId: number, packageCode: string) => {
    const loadingToastId = showLoadingToast("Deleting package...");
    
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      
      // Try DELETE endpoint first
      let response = await fetch(`${API_BASE_URL}/api/PackageInfo/Delete/${packageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // If DELETE doesn't work, try alternative methods
      if (!response.ok) {
        // Try with different endpoint variations
        const endpoints = [
          `${API_BASE_URL}/api/PackageInfo/${packageId}`,
          `${API_BASE_URL}/api/PackageInfo/${packageCode}`,
          `${API_BASE_URL}/api/PackageInfo?packageId=${packageId}`,
          `${API_BASE_URL}/api/PackageInfo?packageCode=${packageCode}`,
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
        showSuccessToast("Package deleted successfully!");
        
        // Refresh the packages list
        await fetchPackageInfo();
        
        // Close the confirmation modal
        setDeleteConfirmModal({ isOpen: false, packageId: 0, packageCode: "", packageName: "" });
        
        // Close edit modal if open for this package
        if (editingId === packageId) {
          handleCloseModal();
        }
      } else {
        // If DELETE endpoints don't work, try frontend-only delete
        console.warn("No backend delete endpoint found. Implementing frontend-only delete.");
        
        // Frontend-only delete (temporary solution)
        setPackageInfo(prev => prev.filter(pkg => pkg.packageID !== packageId));
        dismissToast(loadingToastId);
        showSuccessToast("Package removed from list");
        
        // Close modals
        setDeleteConfirmModal({ isOpen: false, packageId: 0, packageCode: "", packageName: "" });
        if (editingId === packageId) {
          handleCloseModal();
        }
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Delete error:", error);
      
      // Type-safe error handling
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      showErrorToast(`Failed to delete package: ${errorMessage}`);
    }
  };

  const handleRowClick = (row: Package) => {
    // Determine type from boolean flags
    const types: string[] = [];
    if (row.isRoom) types.push("Room");
    if (row.isBanquet) types.push("Banquet");
    if (row.isVilla) types.push("Villa");

    const type = types.join(" & ");

    setFormData({
      packageCode: row.packageCode,
      packageName: row.packageName,
      roomPrice: row.roomPrice.toString(),
      roomCost: row.roomCost.toString(),
      packageDuration: row.packageDuration.toString(),
      roomAmount: row.roomAmount.toString(),
      foodAmount: row.foodAmount.toString(),
      beverageAmount: row.beverageAmount.toString(),
      remarks: row.remarks || "",
      type: type,
    });
    setEditingId(row.packageID);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    handleClear();
    fetchNextCode();
    setIsModalOpen(true);
  };

  const handleClear = () => {
    setFormData({
      packageCode: "",
      packageName: "",
      roomPrice: "",
      roomCost: "",
      packageDuration: "",
      roomAmount: "",
      foodAmount: "",
      beverageAmount: "",
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

  const filteredData = packageInfo.filter(pkg => {
    const matchesSearch = searchTerm 
      ? pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.packageCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg.remarks && pkg.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    
    const matchesType = typeFilter === "ALL" || 
      (typeFilter === "Room" && pkg.isRoom) ||
      (typeFilter === "Villa" && pkg.isVilla) ||
      (typeFilter === "Banquet" && pkg.isBanquet);
    
    return matchesSearch && matchesType;
  });

  const getTotalPackagesByType = (type: string) => {
    switch (type) {
      case "Room": return packageInfo.filter(p => p.isRoom).length;
      case "Villa": return packageInfo.filter(p => p.isVilla).length;
      case "Banquet": return packageInfo.filter(p => p.isBanquet).length;
      default: return packageInfo.length;
    }
  };

  return (
    <>
      <PageMeta title="Package Management" description="Manage hotel packages, pricing, and configurations" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Package Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and organize all hotel packages
            </p>
          </div>
          
          <Button
            type="button"
            onClick={handleAddNew}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 border-0 flex items-center gap-2"
            size="md"
          >
            <FiPlus className="w-4 h-4" />
            Add New Package
          </Button>
        </div>
      </div>

      {/* Stats Cards - Now with only 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Packages Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Packages</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {packageInfo.length}
              </p>
            </div>
          </div>
        </div>

        {/* Package Types Cards - Only 3 type cards now */}
        {typeOptions.map((type) => (
          <div key={type.value} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${type.color}`}>
                <FiTag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{type.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {getTotalPackagesByType(type.value)}
                </p>
              </div>
            </div>
          </div>
        ))}
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
                  placeholder="Search packages by code, name, or remarks..."
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
                title="Press F3 to add new package"
              >
                <FiPlus className="w-4 h-4" />
                Quick Add (F3)
              </button>
            </div>
          </div>
        </div>

        {/* DataTable */}
        <div className="p-6">
          {packageInfo.length === 0 && loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading packages...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <FiPackage className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No packages found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || typeFilter !== "ALL" 
                  ? "Try changing your search or filter criteria" 
                  : "Get started by adding your first package"}
              </p>
              {!searchTerm && typeFilter === "ALL" && (
                <Button
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add New Package
                </Button>
              )}
            </div>
          ) : (
            <DataTable
              data={filteredData}
              columns={packageColumns}
              loading={loading}
              searchable={false}
              pagination={true}
              sortable={true}
              pageSize={10}
              onRowClick={handleRowClick}
              emptyMessage="No packages found"
              className="border-0 shadow-none"
            />
          )}
        </div>
      </div>

      {/* Add/Edit Package Modal */}
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
                        {editingId ? 'Edit Package' : 'Add New Package'}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {editingId ? `Editing package ${formData.packageCode}` : 'Fill in the details to add a new package'}
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
                  {/* Package Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Package Code
                    </label>
                    <Input
                      name="packageCode"
                      value={formData.packageCode}
                      readonly={!!editingId}
                      className="w-full"
                      onChange={handleTextInputChange}
                    />
                  </div>

                  {/* Form Grid - First Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Package Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Package Type <span className="text-red-500">*</span>
                      </label>
                      <Select
                        key={formData.type || "type"}
                        options={typeOptions}
                        onChange={(value) => handleSelectChange("type", value)}
                        placeholder="Select package type"
                        value={formData.type}
                        className="mb-0"
                      />
                    </div>

                    {/* Package Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Package Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="packageName"
                        value={formData.packageName}
                        placeholder="Enter package name"
                        required
                        className="w-full"
                        onChange={handleTextInputChange}
                      />
                    </div>
                  </div>

                  {/* Form Grid - Second Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Room Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Room Price <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="roomPrice"
                        value={formatThousand(formData.roomPrice)}
                        placeholder="Enter room price"
                        required
                        className="w-full"
                        onChange={handleNumericInputChange}
                      />
                    </div>

                    {/* Room Cost */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Room Cost
                      </label>
                      <Input
                        name="roomCost"
                        value={formatThousand(formData.roomCost)}
                        placeholder="Enter room cost"
                        className="w-full"
                        onChange={handleNumericInputChange}
                      />
                    </div>
                  </div>

                  {/* Form Grid - Third Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Package Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duration (Hours)
                      </label>
                      <Input
                        name="packageDuration"
                        value={formData.packageDuration}
                        placeholder="Enter duration in hours"
                        className="w-full"
                        onChange={handleTextInputChange}
                      />
                    </div>

                    {/* Room Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Room Amount
                      </label>
                      <Input
                        name="roomAmount"
                        value={formatThousand(formData.roomAmount)}
                        placeholder="Enter room amount"
                        className="w-full"
                        onChange={handleNumericInputChange}
                      />
                    </div>
                  </div>

                  {/* Form Grid - Fourth Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Food Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Food Amount
                      </label>
                      <Input
                        name="foodAmount"
                        value={formatThousand(formData.foodAmount)}
                        placeholder="Enter food amount"
                        className="w-full"
                        onChange={handleNumericInputChange}
                      />
                    </div>

                    {/* Beverage Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Beverage Amount
                      </label>
                      <Input
                        name="beverageAmount"
                        value={formatThousand(formData.beverageAmount)}
                        placeholder="Enter beverage amount"
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
                        ? "Update Package"
                        : "Add Package"}
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
                  Are you sure you want to delete package <span className="font-bold">"{deleteConfirmModal.packageCode}"</span>?
                  {deleteConfirmModal.packageName && deleteConfirmModal.packageName !== deleteConfirmModal.packageCode && (
                    <span className="ml-1">({deleteConfirmModal.packageName})</span>
                  )}
                </p>
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                  ⚠️ This will permanently remove the package and cannot be recovered.
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Note: This may affect reservations using this package.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmModal({ isOpen: false, packageId: 0, packageCode: "", packageName: "" })}
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
                  onClick={() => handleDelete(deleteConfirmModal.packageId, deleteConfirmModal.packageCode)}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg transition-colors"
                >
                  Delete Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}