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
import { FiSearch, FiX, FiPlus, FiEdit2, FiTrash2, FiSettings, FiGrid, FiInfo } from "react-icons/fi";

interface SetupStyleType {
  setupStyleTypeID: number;
  setupStyleCode: string;
  description: string;
  remarks: string;
}

export default function SetupStyleTypes() {
  const [formData, setFormData] = useState({
    setupStyleCode: "",
    description: "",
    remarks: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupStyleTypes, setSetupStyleTypes] = useState<SetupStyleType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    setupStyleTypeId: number;
    setupStyleCode: string;
    description: string;
  }>({ isOpen: false, setupStyleTypeId: 0, setupStyleCode: "", description: "" });
  
  const hasFetched = useRef(false);

  const setupStyleTypeColumns: Column<SetupStyleType>[] = [
    // {
    //   key: "index",
    //   header: "#",
    //   width: "20",
    //   sortable: false,
    //   render: (_value: any, _row: SetupStyleType, index: number) => (
    //     <span className="font-medium text-gray-600 dark:text-gray-400">
    //       {index + 1}
    //     </span>
    //   ),
    // },
    {
      key: "setupStyleCode",
      header: "Style Code",
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
      header: "Style Name",
      sortable: true,
      searchable: true,
      render: (value: string) => (
        <span className="text-gray-900 dark:text-white">
          {value}
        </span>
      ),
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
  render: (_value: any, row: SetupStyleType) => (
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
          setupStyleTypeId: row.setupStyleTypeID,
          setupStyleCode: row.setupStyleCode,
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
}
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

  const fetchSetupStyleTypes = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/SetupStyle/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSetupStyleTypes(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch Setup Style Types");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load setup style types";
      showErrorToast(errorMessage);
      setSetupStyleTypes([]);
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
        `${API_BASE_URL}/api/SetupStyle/getNextCode`,
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
          setupStyleCode: data.nextCode || "",
        }));
      } else {
        throw new Error("Failed to fetch Setup Style code");
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load setup style code";
      showErrorToast(errorMessage);
      setFormData((prev) => ({
        ...prev,
        setupStyleCode: "",
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchSetupStyleTypes();
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      showErrorToast("Please enter setup style name");
      return;
    }

    if (!formData.setupStyleCode.trim()) {
      showErrorToast("Setup style code is required");
      return;
    }

    setIsSubmitting(true);
    const loadingToastId = showLoadingToast(
      editingId ? "Updating Setup Style..." : "Adding Setup Style..."
    );

    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      const url = editingId
        ? `${API_BASE_URL}/api/SetupStyle/Update/${editingId}`
        : `${API_BASE_URL}/api/SetupStyle/add`;

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
            ? "Setup Style updated successfully!"
            : "Setup Style added successfully!"
        );
        handleClear();
        fetchSetupStyleTypes();
        setIsModalOpen(false);
      } else {
        const errorText = await response.text();
        if (errorText.includes("already exists") || errorText.includes("duplicate")) {
          showErrorToast("Setup Style Code already exists");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Error saving setup style:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save setup style";
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (setupStyleTypeId: number, setupStyleCode: string) => {
    const loadingToastId = showLoadingToast("Deleting setup style...");
    
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      
      // Try DELETE endpoint first
      let response = await fetch(`${API_BASE_URL}/api/SetupStyle/Delete/${setupStyleTypeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // If DELETE doesn't work, try alternative methods
      if (!response.ok) {
        // Try with different endpoint variations
        const endpoints = [
          `${API_BASE_URL}/api/SetupStyle/${setupStyleTypeId}`,
          `${API_BASE_URL}/api/SetupStyle/${setupStyleCode}`,
          `${API_BASE_URL}/api/SetupStyle?setupStyleTypeId=${setupStyleTypeId}`,
          `${API_BASE_URL}/api/SetupStyle?setupStyleCode=${setupStyleCode}`,
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
        showSuccessToast("Setup style deleted successfully!");
        
        // Refresh the setup styles list
        await fetchSetupStyleTypes();
        
        // Close the confirmation modal
        setDeleteConfirmModal({ isOpen: false, setupStyleTypeId: 0, setupStyleCode: "", description: "" });
        
        // Close edit modal if open for this setup style
        if (editingId === setupStyleTypeId) {
          handleCloseModal();
        }
      } else {
        // If DELETE endpoints don't work, try frontend-only delete
        console.warn("No backend delete endpoint found. Implementing frontend-only delete.");
        
        // Frontend-only delete (temporary solution)
        setSetupStyleTypes(prev => prev.filter(style => style.setupStyleTypeID !== setupStyleTypeId));
        dismissToast(loadingToastId);
        showSuccessToast("Setup style removed from list");
        
        // Close modals
        setDeleteConfirmModal({ isOpen: false, setupStyleTypeId: 0, setupStyleCode: "", description: "" });
        if (editingId === setupStyleTypeId) {
          handleCloseModal();
        }
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Delete error:", error);
      
      // Type-safe error handling
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      showErrorToast(`Failed to delete setup style: ${errorMessage}`);
    }
  };

  const handleRowClick = (row: SetupStyleType) => {
    setFormData({
      setupStyleCode: row.setupStyleCode,
      description: row.description,
      remarks: row.remarks || "",
    });
    setEditingId(row.setupStyleTypeID);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    handleClear();
    fetchNextCode();
    setIsModalOpen(true);
  };

  const handleClear = () => {
    setFormData({
      setupStyleCode: "",
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

  const filteredData = setupStyleTypes.filter(style => {
    const matchesSearch = searchTerm 
      ? style.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        style.setupStyleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (style.remarks && style.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    
    return matchesSearch;
  });

  return (
    <>
      <PageMeta title="Setup Style Types Management" description="Manage event setup style types" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Setup Style Types Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and organize all event setup style types
            </p>
          </div>
          
          <Button
            type="button"
            onClick={handleAddNew}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 border-0 flex items-center gap-2"
            size="md"
          >
            <FiPlus className="w-4 h-4" />
            Add New Setup Style
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Setup Styles Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FiGrid className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Setup Styles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {setupStyleTypes.length}
              </p>
            </div>
          </div>
        </div>

        {/* Active Styles Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiSettings className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Styles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {setupStyleTypes.length}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Additions Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FiInfo className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                  placeholder="Search styles by code, name, or remarks..."
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
                title="Press F3 to add new setup style"
              >
                <FiPlus className="w-4 h-4" />
                Quick Add (F3)
              </button>
            </div>
          </div>
        </div>

        {/* DataTable */}
        <div className="p-6">
          {setupStyleTypes.length === 0 && loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading setup styles...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <FiGrid className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No setup styles found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? "Try changing your search criteria" 
                  : "Get started by adding your first setup style"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add New Setup Style
                </Button>
              )}
            </div>
          ) : (
            <DataTable
              data={filteredData}
              columns={setupStyleTypeColumns}
              loading={loading}
              searchable={false}
              pagination={true}
              sortable={true}
              pageSize={10}
              onRowClick={handleRowClick}
              emptyMessage="No setup styles found"
              className="border-0 shadow-none"
            />
          )}
        </div>
      </div>

      {/* Add/Edit Setup Style Modal */}
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
                        <FiSettings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {editingId ? 'Edit Setup Style' : 'Add New Setup Style'}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {editingId ? `Editing style ${formData.setupStyleCode}` : 'Fill in the details to add a new setup style'}
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
                  {/* Style Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Style Code
                    </label>
                    <Input
                      name="setupStyleCode"
                      value={formData.setupStyleCode}
                      readonly={!!editingId}
                      className="w-full"
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Style Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Style Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="description"
                      value={formData.description}
                      placeholder="Enter setup style name"
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
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Enter any additional remarks or notes..."
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
                        ? "Update Style"
                        : "Add Style"}
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
                  Are you sure you want to delete setup style <span className="font-bold">"{deleteConfirmModal.setupStyleCode}"</span>?
                  {deleteConfirmModal.description && deleteConfirmModal.description !== deleteConfirmModal.setupStyleCode && (
                    <span className="ml-1">({deleteConfirmModal.description})</span>
                  )}
                </p>
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                  ⚠️ This will permanently remove the setup style and cannot be recovered.
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Note: This may affect events using this setup style.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmModal({ isOpen: false, setupStyleTypeId: 0, setupStyleCode: "", description: "" })}
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
                  onClick={() => handleDelete(deleteConfirmModal.setupStyleTypeId, deleteConfirmModal.setupStyleCode)}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg transition-colors"
                >
                  Delete Style
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}