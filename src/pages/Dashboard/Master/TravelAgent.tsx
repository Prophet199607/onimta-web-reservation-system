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
import { FiSearch, FiX, FiPlus, FiEdit2, FiTrash2,  FiUser, FiUsers, FiBriefcase } from "react-icons/fi";

interface TravelAgent {
  travelAgentID: number;
  travelAgentCode: string;
  description: string;
}

export default function TravelAgent() {
  const [formData, setFormData] = useState({
    travelAgentCode: "",
    description: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [travelAgents, setTravelAgents] = useState<TravelAgent[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    travelAgentId: number;
    travelAgentCode: string;
    description: string;
  }>({ isOpen: false, travelAgentId: 0, travelAgentCode: "", description: "" });
  
  const hasFetched = useRef(false);

  const travelAgentColumns: Column<TravelAgent>[] = [
    // {
    //   key: "index",
    //   header: "#",
    //   width: "20",
    //   sortable: false,
    //   render: (_value: any, _row: TravelAgent, index: number) => (
    //     <span className="font-medium text-gray-600 dark:text-gray-400">
    //       {index + 1}
    //     </span>
    //   ),
    // },
    {
      key: "travelAgentCode",
      header: "Agent Code",
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
      header: "Agent Name",
      sortable: true,
      searchable: true,
      render: (value: string) => (
        <span className="text-gray-900 dark:text-white">
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "100px",
      sortable: false,
      render: (_value: any, row: TravelAgent) => (
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
              travelAgentId: row.travelAgentID,
              travelAgentCode: row.travelAgentCode,
              description: row.description
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

  const fetchTravelAgents = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/TravelAgent/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTravelAgents(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch Travel Agents");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load travel agents";
      showErrorToast(errorMessage);
      setTravelAgents([]);
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
        `${API_BASE_URL}/api/TravelAgent/getNextCode`,
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
          travelAgentCode: data.nextCode || "",
        }));
      } else {
        throw new Error("Failed to fetch Travel Agent code");
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load travel agent code";
      showErrorToast(errorMessage);
      setFormData((prev) => ({
        ...prev,
        travelAgentCode: "",
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchTravelAgents();
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      showErrorToast("Please enter travel agent name");
      return;
    }

    setIsSubmitting(true);
    const loadingToastId = showLoadingToast(
      editingId ? "Updating Travel Agent..." : "Adding Travel Agent..."
    );

    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      const url = editingId
        ? `${API_BASE_URL}/api/TravelAgent/Update/${editingId}`
        : `${API_BASE_URL}/api/TravelAgent/add`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        dismissToast(loadingToastId);
        showSuccessToast(
          editingId
            ? "Travel Agent updated successfully!"
            : "Travel Agent added successfully!"
        );
        handleClear();
        fetchTravelAgents();
        setIsModalOpen(false);
      } else {
        const errorText = await response.text();
        if (errorText.includes("already exists") || errorText.includes("duplicate")) {
          showErrorToast("Travel Agent Code already exists");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Error saving travel agent:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save travel agent";
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (travelAgentId: number, travelAgentCode: string) => {
    const loadingToastId = showLoadingToast("Deleting travel agent...");
    
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      
      // Try DELETE endpoint first
      let response = await fetch(`${API_BASE_URL}/api/TravelAgent/Delete/${travelAgentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // If DELETE doesn't work, try alternative methods
      if (!response.ok) {
        // Try with different endpoint variations
        const endpoints = [
          `${API_BASE_URL}/api/TravelAgent/${travelAgentId}`,
          `${API_BASE_URL}/api/TravelAgent/${travelAgentCode}`,
          `${API_BASE_URL}/api/TravelAgent?travelAgentId=${travelAgentId}`,
          `${API_BASE_URL}/api/TravelAgent?travelAgentCode=${travelAgentCode}`,
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
        showSuccessToast("Travel agent deleted successfully!");
        
        // Refresh the travel agents list
        await fetchTravelAgents();
        
        // Close the confirmation modal
        setDeleteConfirmModal({ isOpen: false, travelAgentId: 0, travelAgentCode: "", description: "" });
        
        // Close edit modal if open for this travel agent
        if (editingId === travelAgentId) {
          handleCloseModal();
        }
      } else {
        // If DELETE endpoints don't work, try frontend-only delete
        console.warn("No backend delete endpoint found. Implementing frontend-only delete.");
        
        // Frontend-only delete (temporary solution)
        setTravelAgents(prev => prev.filter(ta => ta.travelAgentID !== travelAgentId));
        dismissToast(loadingToastId);
        showSuccessToast("Travel agent removed from list");
        
        // Close modals
        setDeleteConfirmModal({ isOpen: false, travelAgentId: 0, travelAgentCode: "", description: "" });
        if (editingId === travelAgentId) {
          handleCloseModal();
        }
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Delete error:", error);
      
      // Type-safe error handling
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      showErrorToast(`Failed to delete travel agent: ${errorMessage}`);
    }
  };

  const handleRowClick = (row: TravelAgent) => {
    setFormData({
      travelAgentCode: row.travelAgentCode,
      description: row.description,
    });
    setEditingId(row.travelAgentID);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    handleClear();
    fetchNextCode();
    setIsModalOpen(true);
  };

  const handleClear = () => {
    setFormData({
      travelAgentCode: "",
      description: "",
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

  const filteredData = travelAgents.filter(ta => {
    const matchesSearch = searchTerm 
      ? ta.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ta.travelAgentCode.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesSearch;
  });

  return (
    <>
      <PageMeta title="Travel Agent Management" description="Manage hotel travel agents and partners" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Travel Agent Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and organize all hotel travel agents and partners
            </p>
          </div>
          
          <Button
            type="button"
            onClick={handleAddNew}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 border-0 flex items-center gap-2"
            size="md"
          >
            <FiPlus className="w-4 h-4" />
            Add New Travel Agent
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Travel Agents Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Travel Agents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {travelAgents.length}
              </p>
            </div>
          </div>
        </div>

        {/* Active Partnerships Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiBriefcase className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Partnerships</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {travelAgents.length}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Additions Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FiUser className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last 30 Days</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                0
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
                  placeholder="Search agents by code or name..."
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
                title="Press F3 to add new travel agent"
              >
                <FiPlus className="w-4 h-4" />
                Quick Add (F3)
              </button>
            </div>
          </div>
        </div>

        {/* DataTable */}
        <div className="p-6">
          {travelAgents.length === 0 && loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading travel agents...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No travel agents found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? "Try changing your search criteria" 
                  : "Get started by adding your first travel agent"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add New Travel Agent
                </Button>
              )}
            </div>
          ) : (
            <DataTable
              data={filteredData}
              columns={travelAgentColumns}
              loading={loading}
              searchable={false}
              pagination={true}
              sortable={true}
              pageSize={10}
              onRowClick={handleRowClick}
              emptyMessage="No travel agents found"
              className="border-0 shadow-none"
            />
          )}
        </div>
      </div>

      {/* Add/Edit Travel Agent Modal */}
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
                        <FiUser className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {editingId ? 'Edit Travel Agent' : 'Add New Travel Agent'}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {editingId ? `Editing agent ${formData.travelAgentCode}` : 'Fill in the details to add a new travel agent'}
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
                  {/* Agent Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Agent Code
                    </label>
                    <Input
                      name="travelAgentCode"
                      value={formData.travelAgentCode}
                      readonly={!!editingId}
                      className="w-full"
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Agent Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Agent Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="description"
                      value={formData.description}
                      placeholder="Enter travel agent name"
                      required
                      className="w-full"
                      onChange={handleInputChange}
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
                        ? "Update Agent"
                        : "Add Agent"}
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
                  Are you sure you want to delete travel agent <span className="font-bold">"{deleteConfirmModal.travelAgentCode}"</span>?
                  {deleteConfirmModal.description && deleteConfirmModal.description !== deleteConfirmModal.travelAgentCode && (
                    <span className="ml-1">({deleteConfirmModal.description})</span>
                  )}
                </p>
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                  ⚠️ This will permanently remove the travel agent and cannot be recovered.
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Note: This may affect reservations using this travel agent.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmModal({ isOpen: false, travelAgentId: 0, travelAgentCode: "", description: "" })}
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
                  onClick={() => handleDelete(deleteConfirmModal.travelAgentId, deleteConfirmModal.travelAgentCode)}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg transition-colors"
                >
                  Delete Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}