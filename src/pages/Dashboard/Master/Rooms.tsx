import { useState, useEffect, useRef } from "react";
import PageMeta from "../../../components/common/PageMeta";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import DataTable, { Column } from "../../../components/tables/DataTable";
import Select from "../../../components/form/Select";
import {API_BASE_URL} from "../../../config/api";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "../../../components/alert/ToastAlert";
import { FiSearch, FiX, FiPlus, FiEdit2, FiTrash2, FiFilter } from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";

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
  const [roomTypeOptions, setRoomTypeOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    roomCode: string;
    roomName: string;
  }>({ isOpen: false, roomCode: "", roomName: "" });
  
  const hasFetched = useRef(false);

  const roomStatusOptions = [

    { value: "VACANT", label: "Vacant", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    { value: "OCCUPIED", label: "Occupied", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
    { value: "RESERVED", label: "Reserved", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
    { value: "OUT_OF_ORDER", label: "Out of Order", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    { value: "CLEANING", label: "Cleaning", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    { value: "BLOCKED", label: "Blocked", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
    { value: "DELETED", label: "Deleted", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
  ];

  const roomColumns: Column<Rooms>[] = [
    // {
    //   key: "index",
    //   header: "#",
    //   width: "20",
    //   sortable: false,
    //   render: (_value: any, _row: Rooms, index: number) => (
    //     <span className="font-medium text-gray-600 dark:text-gray-400">
    //       {index + 1}
    //     </span>
    //   ),
    // },
    {
      key: "roomTypeCode",
      header: "Room Type",
      sortable: true,
      searchable: true,
      width: "120px",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <HiOutlineBuildingOffice2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="font-medium">
            {roomTypeOptions.find((opt) => opt.value === value)?.label || value}
          </span>
        </div>
      ),
    },
    {
      key: "roomCode",
      header: "Room Code",
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
      key: "description",
      header: "Room Name",
      sortable: true,
      searchable: true,
    },
    {
      key: "roomSize",
      header: "Size",
      sortable: true,
      searchable: true,
      width: "80px",
      render: (value: string) => (
        <span className="text-gray-600 dark:text-gray-400">{value}m²</span>
      ),
    },
    {
      key: "roomStatus",
      header: "Status",
      sortable: true,
      searchable: true,
      width: "120px",
      render: (value: string) => {
        const status = roomStatusOptions.find(opt => opt.value === value);
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status?.color || 'bg-gray-100 text-gray-800'}`}>
            {status?.label || value}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      width: "100px",
      sortable: false,
      render: (_value: any, row: Rooms) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRowClick(row)}
             className="p-2 border-2 border-blue-200 hover:border-blue-400 dark:border-blue-800 dark:hover:border-blue-600 bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-all duration-200 group shadow-sm hover:shadow-md"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform" />
          </button>
          <button
  onClick={(event) => {
    event.stopPropagation(); // prevent row click
    setDeleteConfirmModal({
      isOpen: true,
      roomCode: row.roomCode,
      roomName: row.description || row.roomCode
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
        const roomsOnly = Array.isArray(data)
          ? data.filter((room: Rooms) => room.isRoom === true)
          : [];
        setRooms(roomsOnly);
      } else {
        throw new Error("Failed to fetch Rooms");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load rooms";
      showErrorToast(errorMessage);
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
        const options = data.map((rt: any) => ({
          value: rt.roomTypeCode,
          label: rt.description,
        }));
        setRoomTypeOptions(options);
      } else {
        throw new Error("Failed to fetch Room Types");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load room types";
      showErrorToast(errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : "Failed to load room code";
      showErrorToast(errorMessage);
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
      fetchRooms();
      fetchRoomTypes();
    }
  }, []);

  const handleChange = (e: React.FormEvent) => {
    const value = (e.target as HTMLInputElement).value;
    setSearchTerm(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      showErrorToast("Room name is required");
      return;
    }

    setIsSubmitting(true);
    const loadingToastId = showLoadingToast(
      editingCode ? "Updating Room..." : "Adding Room..."
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
        setIsModalOpen(false);
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Error saving room:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save room";
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (roomCode: string) => {
    const loadingToastId = showLoadingToast("Deleting room...");
    
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      
      // Find the room to be deleted
      const roomToDelete = rooms.find(room => room.roomCode === roomCode);
      
      if (!roomToDelete) {
        throw new Error("Room not found");
      }
      
      // Try to update the room status to "DELETED" (soft delete)
      const payload = {
        ...roomToDelete,
        roomStatus: "DELETED",
        description: roomToDelete.description + " (Deleted)",
        isRoom: true,
        isBanquet: false,
      };

      const response = await fetch(`${API_BASE_URL}/api/Room/update/${roomCode}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        dismissToast(loadingToastId);
        showSuccessToast("Room deleted successfully!");
        
        // Refresh the rooms list
        await fetchRooms();
        
        // Close the confirmation modal
        setDeleteConfirmModal({ isOpen: false, roomCode: "", roomName: "" });
        
        // Close edit modal if open for this room
        if (editingCode === roomCode) {
          handleCloseModal();
        }
      } else {
        // If DELETED status doesn't work, try using "OUT_OF_ORDER" as an alternative
        const errorText = await response.text();
        console.log("Delete attempt failed:", errorText);
        
        // Try alternative: update with "OUT_OF_ORDER" status
        const alternativePayload = {
          ...roomToDelete,
          roomStatus: "OUT_OF_ORDER",
          description: roomToDelete.description + " (Deleted)",
          isRoom: true,
          isBanquet: false,
        };
        
        const altResponse = await fetch(`${API_BASE_URL}/api/Room/update/${roomCode}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(alternativePayload),
        });
        
        if (altResponse.ok) {
          dismissToast(loadingToastId);
          showSuccessToast("Room marked as out of order (deleted)");
          await fetchRooms();
          setDeleteConfirmModal({ isOpen: false, roomCode: "", roomName: "" });
          if (editingCode === roomCode) handleCloseModal();
          return;
        } else {
          const altErrorText = await altResponse.text();
          throw new Error(`Failed to delete room: ${altErrorText}`);
        }
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Delete error:", error);
      
      // Type-safe error handling
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      // Check for specific error types
      const errorMsg = errorMessage.toLowerCase();
      if (errorMsg.includes('foreign') || errorMsg.includes('constraint') || errorMsg.includes('reference')) {
        showErrorToast("Cannot delete room because it is referenced in reservations or other records.");
      } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
        showErrorToast("Room not found or delete functionality not available.");
      } else if (errorMsg.includes('status') && errorMsg.includes('invalid')) {
        showErrorToast("Delete failed: Invalid room status. Please contact support.");
      } else {
        showErrorToast(`Failed to delete room: ${errorMessage}`);
      }
    }
  };

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
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    handleClear();
    fetchNextCode();
    setIsModalOpen(true);
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
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    handleClear();
  };

  const handleClearClick = () => {
    handleClear();
    fetchNextCode();
  };

  // Filter data based on search term and status filter
  // Exclude rooms with "DELETED" status by default
  const filteredData = rooms
    .filter(room => room.roomStatus !== "DELETED") // Exclude deleted rooms from main view
    .filter(room => {
      const matchesSearch = searchTerm 
        ? room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.roomCode.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      
      const matchesStatus = statusFilter === "ALL" || room.roomStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

  return (
    <>
      <PageMeta title="Rooms Management" description="Manage hotel rooms, status, and configurations" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rooms Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and organize all hotel rooms
            </p>
          </div>
          
          <Button
            type="button"
            onClick={handleAddNew}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 border-0 flex items-center gap-2"
            size="md"
          >
            <FiPlus className="w-4 h-4" />
            Add New Room
          </Button>
        </div>
      </div>

      {/* Stats Cards - Show only non-deleted rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {roomStatusOptions
          .filter(status => status.value !== "DELETED") // Don't show deleted status in stats
          .map((status) => (
          <div key={status.value} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{status.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {rooms.filter(r => r.roomStatus === status.value).length}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.color.split(' ')[0]} ${status.color.split(' ')[1]}`}>
                <HiOutlineBuildingOffice2 className="w-5 h-5" />
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
                  placeholder="Search rooms by code or name..."
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Status</option>
                  {roomStatusOptions
                    .filter(status => status.value !== "DELETED") // Don't show DELETED in filter
                    .map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
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
                title="Press F3 to add new room"
              >
                <FiPlus className="w-4 h-4" />
                Quick Add (F3)
              </button>
            </div>
          </div>
        </div>

        {/* DataTable */}
        <div className="p-6">
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <HiOutlineBuildingOffice2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No rooms found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== "ALL" 
                  ? "Try changing your search or filter criteria" 
                  : "Get started by adding your first room"}
              </p>
              {!searchTerm && statusFilter === "ALL" && (
                <Button
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add New Room
                </Button>
              )}
            </div>
          ) : (
            <DataTable
              data={filteredData}
              columns={roomColumns}
              loading={loading}
              searchable={false}
              pagination={true}
              sortable={true}
              pageSize={10}
              onRowClick={handleRowClick}
              emptyMessage="No rooms found"
              className="border-0 shadow-none"
            />
          )}
        </div>
      </div>

      {/* Add/Edit Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl animate-fadeIn">
            {/* Modal Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${editingCode ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                      {editingCode ? (
                        <FiEdit2 className={`w-6 h-6 ${editingCode ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'}`} />
                      ) : (
                        <HiOutlineBuildingOffice2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {editingCode ? 'Edit Room' : 'Add New Room'}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {editingCode ? `Editing room ${formData.roomCode}` : 'Fill in the details to add a new room'}
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
                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Room Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Room Code
                      </label>
                      <Input
                        name="roomCode"
                        value={formData.roomCode}
                        readonly={!!editingCode}
                        className="w-full"
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Room Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Room Type
                      </label>
                      <Select
                        key={formData.roomTypeCode || "roomType"}
                        options={roomTypeOptions}
                        onChange={(value) => handleSelectChange("roomTypeCode", value)}
                        placeholder="Select room type"
                        value={formData.roomTypeCode}
                        className="mb-0"
                      />
                    </div>

                    {/* Room Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Room Size (m²)
                      </label>
                      <Input
                        name="roomSize"
                        value={formData.roomSize}
                        placeholder="Enter room size"
                        className="w-full"
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Room Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Room Status
                      </label>
                      <Select
                        key={formData.roomStatus || "roomStatus"}
                        options={roomStatusOptions.filter(opt => opt.value !== "DELETED")} // Don't allow setting to DELETED here
                        onChange={(value) => handleSelectChange("roomStatus", value)}
                        placeholder="Select status"
                        value={formData.roomStatus}
                        className="mb-0"
                      />
                    </div>
                  </div>

                  {/* Room Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Room Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="description"
                      value={formData.description}
                      placeholder="Enter room name"
                      required
                      className="w-full"
                      onChange={handleInputChange}
                    />
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
                      placeholder="Additional notes or special instructions..."
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
                        editingCode
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? editingCode
                          ? "Updating..."
                          : "Adding..."
                        : editingCode
                        ? "Update Room"
                        : "Add Room"}
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
                  Are you sure you want to delete room <span className="font-bold">"{deleteConfirmModal.roomCode}"</span>?
                  {deleteConfirmModal.roomName && deleteConfirmModal.roomName !== deleteConfirmModal.roomCode && (
                    <span className="ml-1">({deleteConfirmModal.roomName})</span>
                  )}
                </p>
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                  ⚠️ This will permanently remove the room and cannot be recovered.
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Note: Room will be marked as "Deleted" and hidden from the main view.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmModal({ isOpen: false, roomCode: "", roomName: "" })}
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
                  onClick={() => handleDelete(deleteConfirmModal.roomCode)}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg transition-colors"
                >
                  Delete Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .dark ::-webkit-scrollbar-track {
          background: #2d3748;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
        }

        .dark ::-webkit-scrollbar-thumb {
          background: #4a5568;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }

        .dark ::-webkit-scrollbar-thumb:hover {
          background: #5a6678;
        }
      `}</style>
    </>
  );
}