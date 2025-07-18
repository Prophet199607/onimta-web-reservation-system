import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import DataTable, { Column } from "../../components/tables/DataTable";
import Modal from "../../components/modal/Modal";
import API_BASE_URL from "../../config/api";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "../../components/alert/ToastAlert";

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

  const typeOptions = [
    { value: "Room", label: "Room" },
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
    },
    {
      key: "roomAmount",
      header: "Room Amount",
      sortable: true,
      searchable: true,
    },
    {
      key: "roomPrice",
      header: "Price",
      sortable: true,
      searchable: true,
    },
    {
      key: "roomCost",
      header: "Cost",
      sortable: true,
      searchable: true,
    },
    {
      key: "foodAmount",
      header: "Food Amount",
      sortable: true,
      searchable: true,
    },
    {
      key: "beverageAmount",
      header: "Beverage Amount",
      sortable: true,
      searchable: true,
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

  // Handle select field changes
  const handleSelectChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.packageName.trim() || !formData.type.trim()) {
      showErrorToast("Please fill in required fields");
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
      };

      console.log("Request data:", requestData);

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

  // handleRowClick function
  const handleRowClick = (row: Package) => {
    // Determine type from boolean flags
    let type = "";
    if (row.isRoom && row.isBanquet) type = "Room & Banquet";
    else if (row.isRoom) type = "Room";
    else if (row.isBanquet) type = "Banquet";

    setFormData({
      packageCode: row.packageCode || "",
      packageName: row.packageName || "",
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
            <div className="w-full sm:flex-1">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Package Code
                </label>
                <Input
                  name="packageCode"
                  value={formData.packageCode}
                  readonly
                  className="w-full"
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Amount
                </label>
                <Input
                  name="roomAmount"
                  value={formData.roomAmount}
                  placeholder="Enter Room Amount"
                  required
                  className="w-full"
                  onChange={handleInputChange}
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
                  value={formData.roomPrice}
                  placeholder="Enter Price"
                  required
                  className="w-full"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cost
                </label>
                <Input
                  name="roomCost"
                  value={formData.roomCost}
                  placeholder="Enter Cost"
                  required
                  className="w-full"
                  onChange={handleInputChange}
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
                  value={formData.foodAmount}
                  placeholder="Enter Food Amount"
                  required
                  className="w-full"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Beverage Amount
                </label>
                <Input
                  name="beverageAmount"
                  value={formData.beverageAmount}
                  placeholder="Enter Beverage Amount"
                  required
                  className="w-full"
                  onChange={handleInputChange}
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
        size="2xl"
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
