import { useState, useEffect, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import DataTable, { Column } from "../../components/tables/DataTable";
import Modal from "../../components/modal/Modal";
import Select from "../../components/form/Select";
import API_BASE_URL from "../../config/api";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "../../components/alert/ToastAlert";
import { FiSearch, FiX } from "react-icons/fi";

// Sample room types data
interface Rooms {
  roomID: number;
  roomTypeCode: string;
  roomCode: string;
  roomSize: string;
  roomStatus: string;
  description: string;
  remarks: string;
  isRoom: boolean;
  isBanquet: boolean;
}

export default function Rooms() {
  const [formData, setFormData] = useState({
    roomTypeCode: "",
    roomCode: "",
    roomSize: "",
    roomStatus: "",
    description: "",
    remarks: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Rooms[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRooms, setFilteredRooms] = useState<Rooms[]>([]);
  const [roomTypeOptions, setRoomTypeOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const hasFetched = useRef(false);

  const roomStatusOptions = [
    { value: "VACANT", label: "Vacant" },
    { value: "OCCUPIED", label: "Occupied" },
    { value: "RESERVED", label: "Reserved" },
    { value: "OUT_OF_ORDER", label: "Out of Order" },
    { value: "CLEANING", label: "Cleaning in Progress" },
    { value: "BLOCKED", label: "Blocked" },
  ];

  // Define columns for the DataTable
  const roomColumns: Column<Rooms>[] = [
    {
      key: "index",
      header: "#",
      width: "20",
      sortable: false,
      render: (_value: any, _row: Rooms, index: number) => (
        <span className="font-medium text-gray-600 dark:text-gray-400">
          {index + 1}
        </span>
      ),
    },
    {
      key: "roomTypeCode",
      header: "Room Type",
      sortable: true,
      searchable: true,
      width: "100px",
      render: (value: string) =>
        roomTypeOptions.find((opt) => opt.value === value)?.label || value,
    },
    {
      key: "roomCode",
      header: "Room Code",
      sortable: true,
      searchable: true,
      width: "100px",
    },
    {
      key: "description",
      header: "Room Name",
      sortable: true,
      searchable: true,
    },
    {
      key: "roomSize",
      header: "Room Size",
      sortable: true,
      searchable: true,
      width: "100px",
    },
    {
      key: "roomStatus",
      header: "Room Status",
      sortable: true,
      searchable: true,
      width: "100px",
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

        // map API response -> { value, label }
        const options = data.map((rt: any) => ({
          value: rt.roomTypeCode, // what backend expects
          label: rt.description, // what user sees
        }));

        setRoomTypeOptions(options);
      } else {
        throw new Error("Failed to fetch Room Types");
      }
    } catch (error) {
      showErrorToast("Failed to load room types");
      setRoomTypeOptions([]);
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

      // Query parameters for isRoom=true and isBanquet=false
      const queryParams = new URLSearchParams({
        isRoom: "true",
        isBanquet: "false",
      });

      const response = await fetch(
        `${API_BASE_URL}/api/Room/getNextroomCode?${queryParams}`,
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
          roomCode: data.nextCode || "",
        }));
      } else {
        throw new Error("Failed to fetch Room code");
      }
    } catch (error) {
      console.error(error);
      showErrorToast("Failed to load room code");
      setFormData((prev) => ({
        ...prev,
        roomCode: "",
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchNextCode();
      fetchRooms();
      fetchRoomTypes();
    }
  }, []);

  // Search Handling
  const handleChange = (e: React.FormEvent) => {
    const value = (e.target as HTMLInputElement).value;
    setSearchTerm(value);

    // Filter room types based on search term
    if (value.trim() === "") {
      setFilteredRooms([]);
    } else {
      const filtered = rooms.filter(
        (room) =>
          room.description.toLowerCase().includes(value.toLowerCase()) ||
          room.roomCode.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredRooms(filtered);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredRooms([]);
    handleClear();
  };

  // Function to handle selecting a room from search results
  const handleSearchResultClick = (room: Rooms) => {
    setFormData({
      roomTypeCode: room.roomTypeCode,
      roomCode: room.roomCode,
      roomSize: room.roomSize,
      roomStatus: room.roomStatus,
      description: room.description,
      remarks: room.remarks,
    });
    setEditingCode(room.roomCode);
    setSearchTerm("");
    setFilteredRooms([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    const loadingToastId = showLoadingToast(
      editingCode ? "Updating Room ..." : "Adding Room ..."
    );

    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      const url = editingCode
        ? `${API_BASE_URL}/api/Room/update/${editingCode}`
        : `${API_BASE_URL}/api/Room/add`;

      const payload = {
        ...formData,
        isRoom: true,
        isBanquet: false,
      };

      const response = await fetch(url, {
        method: editingCode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        dismissToast(loadingToastId);
        showSuccessToast(
          editingCode
            ? "Room updated successfully!"
            : "Room added successfully!"
        );
        handleClear();
        fetchRooms();
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Error saving room:", error);
      showErrorToast("Room Code already exists");
    } finally {
      setIsSubmitting(false);
    }
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

  const handleRowClick = (row: Rooms) => {
    setFormData({
      roomTypeCode: row.roomTypeCode,
      roomCode: row.roomCode,
      roomSize: row.roomSize,
      roomStatus: row.roomStatus,
      description: row.description,
      remarks: row.remarks,
    });
    setEditingCode(row.roomCode);
    setIsModalOpen(false);
  };

  const handleClear = () => {
    setFormData({
      roomTypeCode: "",
      roomCode: "",
      roomSize: "",
      roomStatus: "",
      description: "",
      remarks: "",
    });
    setEditingCode(null);
    fetchNextCode();
  };

  return (
    <>
      <PageMeta title="Rooms - Reservation System" description="Manage rooms" />

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
            <li className="text-gray-900 dark:text-white">Rooms</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="order-1 lg:order-2">
          <h3 className="font-semibold text-gray-800 text-xl text-center lg:text-left dark:text-white/90 sm:text-2xl">
            Manage Rooms
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
              {searchTerm && filteredRooms.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-b-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.roomCode}
                      onClick={() => handleSearchResultClick(room)}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {room.roomCode}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {room.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results Message */}
              {searchTerm && filteredRooms.length === 0 && rooms.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-b-md shadow-lg">
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                    No rooms found
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Code
                </label>
                <Input
                  name="roomCode"
                  value={formData.roomCode}
                  readonly
                  className="w-full"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Type
                </label>
                <Select
                  options={roomTypeOptions}
                  onChange={(value) =>
                    handleSelectChange("roomTypeCode", value)
                  }
                  placeholder="Select Type"
                  value={formData.roomTypeCode}
                  className="mb-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Size
                </label>
                <Input
                  name="roomSize"
                  value={formData.roomSize}
                  className="w-full"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Status
                </label>
                <Select
                  options={roomStatusOptions}
                  onChange={(value) => handleSelectChange("roomStatus", value)}
                  placeholder="Select Type"
                  value={formData.roomStatus}
                  className="mb-0"
                />
              </div>
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
                Remarks
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
                  editingCode
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-200 border-yellow-300"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-300"
                } disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out`}
                size="md"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? editingCode
                    ? "Updating..."
                    : "Adding..."
                  : editingCode
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
                {editingCode ? "Cancel" : "Clear"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Reusable Selection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Select Rooms"
        size="auto"
        columnCount={roomColumns.length}
      >
        <DataTable
          data={rooms}
          columns={roomColumns}
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
