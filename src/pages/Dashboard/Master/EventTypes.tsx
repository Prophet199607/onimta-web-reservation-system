import { useState, useEffect, useRef } from "react";
import PageMeta from "../../../components/common/PageMeta";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import DataTable, { Column } from "../../../components/tables/DataTable";
import API_BASE_URL from "../../../config/api";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "../../../components/alert/ToastAlert";
import { FiSearch, FiX, FiPlus, FiEdit2, FiTrash2, FiCalendar } from "react-icons/fi";

interface EventType {
  eventTypeID: number;
  EventCode: string;
  description: string;
  remarks: string;
}

export default function EventTypes() {
  const [formData, setFormData] = useState({
    EventCode: "",
    description: "",
    remarks: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    eventTypeId: number;
    eventTypeCode: string;
    description: string;
  }>({ isOpen: false, eventTypeId: 0, eventTypeCode: "", description: "" });
  
  const hasFetched = useRef(false);

  const eventTypeColumns: Column<EventType>[] = [
    {
      key: "index",
      header: "#",
      width: "20",
      sortable: false,
      render: (_value: any, _row: EventType, index: number) => (
        <span className="font-medium text-gray-600 dark:text-gray-400">
          {index + 1}
        </span>
      ),
    },
    {
      key: "EventCode",
      header: "Event Code",
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
      key: "description",
      header: "Event Name",
      sortable: true,
      searchable: true,
    },
    {
      key: "remarks",
      header: "Remarks",
      sortable: true,
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
      render: (_value: any, row: EventType) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRowClick(row)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => {
              console.log("Delete button clicked for row:", row);
              setDeleteConfirmModal({
                isOpen: true,
                eventTypeId: row.eventTypeID,
                eventTypeCode: row.EventCode,
                description: row.description
              });
            }}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
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

  const fetchEventTypes = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/EventType/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched event types:", data); // Debug log
        setEventTypes(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch Event Types");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load event types";
      showErrorToast(errorMessage);
      setEventTypes([]);
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

      const response = await fetch(`${API_BASE_URL}/api/EventType/getNextCode`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Next code response:", data); // Debug log
        setFormData((prev) => ({
          ...prev,
          EventCode: data.nextCode || "",
        }));
      } else {
        // If no next code endpoint, generate a default or handle differently
        setFormData((prev) => ({
          ...prev,
          EventCode: "ET001", // Default starting code
        }));
        console.warn("No next code endpoint found, using default");
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load event type code";
      showErrorToast(errorMessage);
      setFormData((prev) => ({
        ...prev,
        EventCode: "",
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchEventTypes();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      showErrorToast("Event type name is required");
      return;
    }

    setIsSubmitting(true);
    const loadingToastId = showLoadingToast(
      editingId ? "Updating Event Type..." : "Adding Event Type..."
    );

    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      
      const url = editingId
        ? `${API_BASE_URL}/api/EventType/Update/${editingId}`
        : `${API_BASE_URL}/api/EventType/add`;

      // Create payload matching backend model
      const payload = {
        EventCode: formData.EventCode,
        description: formData.description,
        remarks: formData.remarks,
      };

      console.log("Submitting payload:", payload); // Debug log

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        dismissToast(loadingToastId);
        showSuccessToast(
          editingId
            ? "Event Type updated successfully!"
            : "Event Type added successfully!"
        );
        handleClear();
        fetchEventTypes();
        setIsModalOpen(false);
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Error saving event type:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save event type";
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventTypeId: number,) => {
    console.log("handleDelete called with:", { eventTypeId,  });
    

    
    const loadingToastId = showLoadingToast("Deleting event type...");
    
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      
      // Build the delete URL - use EventCode as per backend
      const deleteUrl = `${API_BASE_URL}/api/EventType/Delete/${eventTypeId}`;
      console.log("Delete URL:", deleteUrl);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        dismissToast(loadingToastId);
        showSuccessToast("Event Type deleted successfully!");
        
        // Refresh the event types list
        await fetchEventTypes();
        
        // Close the confirmation modal
        setDeleteConfirmModal({ isOpen: false, eventTypeId: 0, eventTypeCode: "", description: "" });
        
        // Close edit modal if open for this event type
        if (editingId === eventTypeId) {
          handleCloseModal();
        }
      } else {
        // Try to get error message
        let errorMessage = "Failed to delete event type";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Delete error:", error);
      
      // Type-safe error handling
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      // Check for specific error types
      const errorMsg = errorMessage.toLowerCase();
      if (errorMsg.includes('foreign') || errorMsg.includes('constraint') || errorMsg.includes('reference')) {
        showErrorToast("Cannot delete event type because it is referenced in events or other records.");
      } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
        showErrorToast(`Delete endpoint returned 404. Please check: ${API_BASE_URL}/api/EventType/Delete/{EventCode}`);
      } else {
        showErrorToast(`Failed to delete event type: ${errorMessage}`);
      }
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

  const handleRowClick = (row: EventType) => {
    setFormData({
      EventCode: row.EventCode,
      description: row.description,
      remarks: row.remarks,
    });
    setEditingId(row.eventTypeID);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    handleClear();
    fetchNextCode();
    setIsModalOpen(true);
  };

  const handleClear = () => {
    setFormData({
      EventCode: "",
      description: "",
      remarks: "",
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

  const filteredData = eventTypes.filter(eventType => {
    const matchesSearch = searchTerm 
      ? eventType.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eventType.EventCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (eventType.remarks && eventType.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    
    return matchesSearch;
  });

  return (
    <>
      <PageMeta title="Event Types Management" description="Manage event types and configurations" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Types Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and organize all event types
            </p>
          </div>
          
          <Button
            type="button"
            onClick={handleAddNew}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 border-0 flex items-center gap-2"
            size="md"
          >
            <FiPlus className="w-4 h-4" />
            Add New Event Type
          </Button>
        </div>
      </div>

      {/* Stats Card - Total Event Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Event Types</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {eventTypes.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {filteredData.length} matching current filter
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        {/* Add more stats cards if needed */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Event Types</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {eventTypes.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quick Actions</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Press F3 or use toolbar button to add new event types
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FiPlus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                  placeholder="Search event types by code, name, or remarks..."
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

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddNew}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                title="Press F3 to add new event type"
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
              <FiCalendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No event types found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? "Try changing your search criteria" 
                  : "Get started by adding your first event type"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add New Event Type
                </Button>
              )}
            </div>
          ) : (
            <DataTable
              data={filteredData}
              columns={eventTypeColumns}
              loading={loading}
              searchable={false}
              pagination={true}
              sortable={true}
              pageSize={10}
              onRowClick={handleRowClick}
              emptyMessage="No event types found"
              className="border-0 shadow-none"
            />
          )}
        </div>
      </div>

      {/* Add/Edit Event Type Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl animate-fadeIn">
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
                        <FiCalendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {editingId ? 'Edit Event Type' : 'Add New Event Type'}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {editingId ? `Editing event type ${formData.EventCode}` : 'Fill in the details to add a new event type'}
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
                  {/* Event Type Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Event Type Code
                    </label>
                    <Input
                      name="EventCode"
                      value={formData.EventCode}
                      readonly={!!editingId}
                      className="w-full"
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Event Type Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Event Type Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="description"
                      value={formData.description}
                      placeholder="Enter event type name"
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
                      placeholder="Additional notes or description..."
                      onChange={handleTextAreaChange}
                    />
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleClearClick}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      disabled={isSubmitting}
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                        editingId
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? editingId
                          ? "Updating..."
                          : "Adding..."
                        : editingId
                        ? "Update Event Type"
                        : "Add Event Type"}
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
                  Are you sure you want to delete event type <span className="font-bold">"{deleteConfirmModal.eventTypeCode}"</span>?
                  {deleteConfirmModal.description && deleteConfirmModal.description !== deleteConfirmModal.eventTypeCode && (
                    <span className="ml-1">({deleteConfirmModal.description})</span>
                  )}
                </p>
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                  ⚠️ This will permanently remove the event type and cannot be recovered.
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Note: This may affect events using this event type.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmModal({ isOpen: false, eventTypeId: 0, eventTypeCode: "", description: "" })}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log("Delete confirmed for:", deleteConfirmModal);
                    handleDelete(deleteConfirmModal.eventTypeId,);
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg transition-colors"
                >
                  Delete Event Type
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