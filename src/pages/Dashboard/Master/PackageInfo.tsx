import { useState, useEffect } from "react";
import PageMeta from "../../../components/common/PageMeta";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import DataTable, { Column } from "../../../components/tables/DataTable";
import Modal from "../../../components/modal/Modal";
import API_BASE_URL from "../../../config/api";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "../../../components/alert/ToastAlert";
import { FiSearch, FiX } from "react-icons/fi";

//Sample package data
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
  const [filteredPackageInfo, setFilteredPackageInfo] = useState<Package[]>([]);

  const formatThousand = (value: string) => {
    const num = value.replace(/,/g, "");
    if (!num) return "";
    return Number(num).toLocaleString();
  };

  const typeOptions = [
    { value: "Room", label: "Room" },
    { value: "Villa", label: "Villa" },
    { value: "Banquet", label: "Banquet" },
  ];

  // Define columns for the DataTable
  const packageColumns: Column<Package>[] = [
    {
      key: "index",
      header: "#",
      width: "20",
      sortable: false,
      render: (_value: any, _row: Package, index: number) => (
        <span className="font-medium text-gray-600 dark:text-gray-400">
          {index + 1}
        </span>
      ),
    },
    {
      key: "packageCode",
      header: "Package Code",
      sortable: true,
      searchable: true,
    },
    {
      key: "packageName",
      header: "Package Name",
      sortable: true,
      searchable: true,
    },
    {
      key: "type",
      header: "Package Type",
      sortable: true,
      searchable: true,
    },
    {
      key: "packageDuration",
      header: "Duration (Hrs)",
      sortable: true,
      searchable: true,
      align: "center",
    },
    {
      key: "roomAmount",
      header: "Room Amount",
      sortable: true,
      searchable: true,
      align: "right",
      render: (value) => value?.toLocaleString(),
    },
    {
      key: "roomPrice",
      header: "Price",
      sortable: true,
      searchable: true,
      align: "right",
      render: (value) => value?.toLocaleString(),
    },
    {
      key: "roomCost",
      header: "Cost",
      sortable: true,
      searchable: true,
      align: "right",
      render: (value) => value?.toLocaleString(),
    },
    {
      key: "foodAmount",
      header: "Food Amount",
      sortable: true,
      searchable: true,
      align: "right",
      render: (value) => value?.toLocaleString(),
    },
    {
      key: "beverageAmount",
      header: "Beverage Amount",
      sortable: true,
      searchable: true,
      align: "right",
      render: (value) => value?.toLocaleString(),
    },
    {
      key: "remarks",
      header: "Remark",
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

        // Ensure data is an array
        if (Array.isArray(data)) {
          setPackageInfo(data);
        } else {
          setPackageInfo([]);
          showErrorToast("Invalid data format received from server");
        }
      } else {
        throw new Error(
          `Failed to fetch Package Information: ${response.status}`
        );
      }
    } catch (error) {
      showErrorToast("Failed to load package information");
      setPackageInfo([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackageInfo();
  }, []);

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
      showErrorToast("Failed to load package code");
      setFormData((prev) => ({
        ...prev,
        packageCode: "",
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextCode();
  }, []);

  // Search Handling
  const handleChange = (e: React.FormEvent) => {
    const value = (e.target as HTMLInputElement).value;
    setSearchTerm(value);

    // Filter room types based on search term
    if (value.trim() === "") {
      setFilteredPackageInfo([]);
    } else {
      const filtered = packageInfo.filter(
        (packageInfo) =>
          packageInfo.packageCode.toLowerCase().includes(value.toLowerCase()) ||
          packageInfo.packageName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPackageInfo(filtered);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredPackageInfo([]);
    handleClear();
  };

  // Function to handle selecting a room type from search results
  const handleSearchResultClick = (packageInfo: Package) => {
    setFormData({
      packageCode: packageInfo.packageCode,
      packageName: packageInfo.packageName,
      roomPrice: packageInfo.roomPrice.toString(),
      roomCost: packageInfo.roomCost.toString(),
      packageDuration: packageInfo.packageDuration.toString(),
      roomAmount: packageInfo.roomAmount.toString(),
      foodAmount: packageInfo.foodAmount.toString(),
      beverageAmount: packageInfo.beverageAmount.toString(),
      remarks: packageInfo.remarks || "",
      type: packageInfo.isRoom
        ? "Room"
        : packageInfo.isBanquet
        ? "Banquet"
        : packageInfo.isVilla
        ? "Villa"
        : "",
    });

    setEditingId(packageInfo.packageID);
    setSearchTerm("");
    setFilteredPackageInfo([]);
  };

  // Handle select field changes
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

    // Allow only numbers
    if (!/^\d*$/.test(rawValue)) return;

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
      { field: "roomAmount", label: "Room Amount" },
      { field: "foodAmount", label: "Food Amount" },
      { field: "beverageAmount", label: "Beverage Amount" },
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

      // Prepare data with correct field names
      const requestData = {
        ...(editingId && { packageID: editingId }),
        packageCode: formData.packageCode || "",
        packageName: formData.packageName.trim(),
        packageDuration: parseFloat(formData.packageDuration) || 0,
        roomPrice: parseFloat(formData.roomPrice) || 0,
        roomCost: parseFloat(formData.roomCost) || 0,
        roomAmount: parseFloat(formData.roomAmount) || 0,
        foodAmount: parseFloat(formData.foodAmount) || 0,
        beverageAmount: parseFloat(formData.beverageAmount) || 0,
        remarks: formData.remarks || "",
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
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Error saving package info:", error);
      showErrorToast(
        error instanceof Error
          ? error.message
          : "Failed to save package information"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // handle RowClick function
  const handleRowClick = (row: Package) => {
    // Determine type from boolean flags - handle all combinations
    const types: string[] = [];
    if (row.isRoom) types.push("Room");
    if (row.isBanquet) types.push("Banquet");
    if (row.isVilla) types.push("Villa");

    const type = types.join(" & ");

    setFormData({
      packageCode: row.packageCode || "",
      packageName: row.packageName || "",
      roomPrice: row.roomPrice?.toString() || "",
      roomCost: row.roomCost?.toString() || "",
      packageDuration: row.packageDuration?.toString() || "",
      roomAmount: row.roomAmount?.toString() || "",
      foodAmount: row.foodAmount?.toString() || "",
      beverageAmount: row.beverageAmount?.toString() || "",
      remarks: row.remarks || "",
      type: type,
    });
    setEditingId(row.packageID);
    setIsModalOpen(false);
  };

  // handleClear function
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
    fetchNextCode();
  };

  return (
    <>
      <PageMeta
        title="Package Information - Reservation System"
        description="Manage package information"
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
            <li className="text-gray-900 dark:text-white">
              Package Information
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="order-1 lg:order-2">
          <h3 className="font-semibold text-gray-800 text-xl text-center lg:text-left dark:text-white/90 sm:text-2xl">
            Manage Package Information
          </h3>
        </div>

        {/* Empty div for equal spacing on desktop only */}
        <div className="hidden lg:block lg:w-[120px] lg:order-3"></div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-8">
        <div className="mx-auto w-full max-w-[1000px]">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Search Field */}
            <div className="w-full sm:w-2/5 sm:ml-auto relative flex items-center gap-2">
              <div className="relative flex-1">
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
                {searchTerm && filteredPackageInfo.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-b-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredPackageInfo.map((packageInfo) => (
                      <div
                        key={packageInfo.packageID}
                        onClick={() => handleSearchResultClick(packageInfo)}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {packageInfo.packageCode}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {packageInfo.packageName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Results Message */}
                {searchTerm &&
                  filteredPackageInfo.length === 0 &&
                  packageInfo.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-b-md shadow-lg">
                      <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                        No package info found
                      </div>
                    </div>
                  )}
              </div>

              {/* F3 Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FiSearch className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full sm:flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Package Code
              </label>
              <Input
                name="packageCode"
                value={formData.packageCode}
                readonly
                className="w-full"
                onChange={handleTextInputChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Package Type <span className="text-red-500">*</span>
                </label>
                <Select
                  options={typeOptions}
                  onChange={(value) => handleSelectChange("type", value)}
                  placeholder="Select Type"
                  value={formData.type}
                  className="mb-0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Package Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="packageName"
                  value={formData.packageName}
                  placeholder="Enter Package Name"
                  required
                  className="w-full"
                  onChange={handleTextInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration
                </label>
                <Input
                  name="packageDuration"
                  value={formData.packageDuration}
                  placeholder="Enter Duration Hrs"
                  required
                  className="w-full"
                  onChange={handleTextInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Amount
                </label>
                <Input
                  name="roomAmount"
                  value={formatThousand(formData.roomAmount)}
                  placeholder="Enter Room Amount"
                  required
                  className="w-full"
                  onChange={handleNumericInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price
                </label>
                <Input
                  name="roomPrice"
                  value={formatThousand(formData.roomPrice)}
                  placeholder="Enter Price"
                  required
                  className="w-full"
                  onChange={handleNumericInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cost
                </label>
                <Input
                  name="roomCost"
                  value={formatThousand(formData.roomCost)}
                  placeholder="Enter Cost"
                  required
                  className="w-full"
                  onChange={handleNumericInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Food Amount
                </label>
                <Input
                  name="foodAmount"
                  value={formatThousand(formData.foodAmount)}
                  placeholder="Enter Food Amount"
                  required
                  className="w-full"
                  onChange={handleNumericInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Beverage Amount
                </label>
                <Input
                  name="beverageAmount"
                  value={formatThousand(formData.beverageAmount)}
                  placeholder="Enter Beverage Amount"
                  required
                  className="w-full"
                  onChange={handleNumericInputChange}
                />
              </div>
            </div>

            <div className="flex-1 mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Remark
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
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
                  editingId
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-200 border-yellow-300"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-300"
                } disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out`}
                size="md"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? editingId
                    ? "Updating..."
                    : "Adding..."
                  : editingId
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
                {editingId ? "Cancel" : "Clear"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Reusable Selection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Select Package Information"
        size="auto"
        columnCount={packageColumns.length}
      >
        <DataTable
          data={packageInfo}
          columns={packageColumns}
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
