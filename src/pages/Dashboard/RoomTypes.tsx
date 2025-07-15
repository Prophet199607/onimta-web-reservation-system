import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import DataTable, { Column } from "../../components/tables/DataTable";
import Modal from "../../components/modal/Modal";
import API_BASE_URL from "../../config/api";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "../../components/alert/ToastAlert";

// Sample room types data
interface RoomType {
  roomTypeID: number;
  roomTypeCode: string;
  description: string;
  remarks: string;
}

export default function RoomTypes() {
  const [formData, setFormData] = useState({
    roomTypeCode: "",
    description: "",
    remarks: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define columns for the DataTable
  const roomTypeColumns: Column<RoomType>[] = [
    {
      key: "index",
      header: "#",
      width: "20",
      sortable: false,
      render: (_value: any, _row: RoomType, index: number) => (
        <span className="font-medium text-gray-600 dark:text-gray-400">
          {index + 1}
        </span>
      ),
    },
    {
      key: "roomTypeCode",
      header: "Code",
      sortable: true,
      searchable: true,
      width: "100px",
    },
    {
      key: "description",
      header: "Name",
      sortable: true,
      searchable: true,
    },
    {
      key: "remarks",
      header: "Remark",
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

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      showErrorToast("Please fill room name");
      return;
    }

    setIsSubmitting(true);
    const loadingToastId = showLoadingToast(
      editingId ? "Updating Room Type..." : "Adding Room Type..."
    );

    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      const url = editingId
        ? `${API_BASE_URL}/api/RoomType/Update/${editingId}`
        : `${API_BASE_URL}/api/RoomType/add`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        dismissToast(loadingToastId);
        showSuccessToast(
          editingId
            ? "Room Type updated successfully!"
            : "Room Type added successfully!"
        );
        handleClear();
        fetchRoomTypes();
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Error saving room type:", error);
      showErrorToast("Room Type Code already exists");
    } finally {
      setIsSubmitting(false);
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

  const handleRowClick = (row: RoomType) => {
    setFormData({
      roomTypeCode: row.roomTypeCode,
      description: row.description,
      remarks: row.remarks,
    });
    setEditingId(row.roomTypeID);
    setIsModalOpen(false);
  };

  const handleClear = () => {
    setFormData({
      roomTypeCode: "",
      description: "",
      remarks: "",
    });
    setEditingId(null);
  };

  return (
    <>
      <PageMeta
        title="Room Types - Reservation System"
        description="Manage room types"
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
            <li className="text-gray-900 dark:text-white">Room Types</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="order-1 lg:order-2">
          <h3 className="font-semibold text-gray-800 text-xl text-center lg:text-left dark:text-white/90 sm:text-2xl">
            Manage Room Types
          </h3>
        </div>

        {/* Empty div for equal spacing on desktop only */}
        <div className="hidden lg:block lg:w-[120px] lg:order-3"></div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-8">
        <div className="mx-auto w-full max-w-[1000px]">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex-1 mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room Type Code
              </label>
              <Input
                name="roomTypeCode"
                value={formData.roomTypeCode}
                readonly
                className="w-full"
                onChange={handleInputChange}
              />
            </div>

            <div className="flex-1 mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="description"
                value={formData.description}
                placeholder="Enter Name"
                required
                className="w-full"
                onChange={handleInputChange}
              />
            </div>

            <div className="flex-1 mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                remarks
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
        title="Select Room Type"
        size="2xl"
      >
        <DataTable
          data={roomTypes}
          columns={roomTypeColumns}
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
