import { useState, useEffect } from "react";
import PageMeta from "../../../components/common/PageMeta";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
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

// Sample event types data
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
  const [filteredTravelAgents, setFilteredTravelAgents] = useState<
    TravelAgent[]
  >([]);

  // Define columns for the DataTable
  const travelAgentColumns: Column<TravelAgent>[] = [
    {
      key: "index",
      header: "#",
      width: "20",
      sortable: false,
      render: (_value: any, _row: TravelAgent, index: number) => (
        <span className="font-medium text-gray-600 dark:text-gray-400">
          {index + 1}
        </span>
      ),
    },
    {
      key: "travelAgentCode",
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
  ];

  //Handle f3 Key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F3") {
        event.preventDefault();
        setIsModalOpen(true);
      }
      if (event.key === "Escape") {
        event.preventDefault();
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
      console.log("Failed to load travel agents");
      setTravelAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelAgents();
  }, []);

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
      showErrorToast("Failed to load travel agent code");
      setFormData((prev) => ({
        ...prev,
        travelAgentCode: "",
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
      setFilteredTravelAgents([]);
    } else {
      const filtered = travelAgents.filter(
        (travelAgent) =>
          travelAgent.description.toLowerCase().includes(value.toLowerCase()) ||
          travelAgent.travelAgentCode
            .toLowerCase()
            .includes(value.toLowerCase())
      );
      setFilteredTravelAgents(filtered);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredTravelAgents([]);
    handleClear();
  };

  // Function to handle selecting a room type from search results
  const handleSearchResultClick = (travelAgent: TravelAgent) => {
    setFormData({
      travelAgentCode: travelAgent.travelAgentCode,
      description: travelAgent.description,
    });
    setEditingId(travelAgent.travelAgentID);
    setSearchTerm("");
    setFilteredTravelAgents([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      showErrorToast("Please fill travel agent name");
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
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Error saving travel agent:", error);
      showErrorToast("Travel Agent Code already exists");
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

  const handleRowClick = (row: TravelAgent) => {
    setFormData({
      travelAgentCode: row.travelAgentCode,
      description: row.description,
    });
    setEditingId(row.travelAgentID);
    setIsModalOpen(false);
  };

  const handleClear = () => {
    setFormData({
      travelAgentCode: "",
      description: "",
    });
    setEditingId(null);
    fetchNextCode();
  };

  return (
    <>
      <PageMeta
        title="Travel Agent - Reservation System"
        description="Manage travel agent"
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
            <li className="text-gray-900 dark:text-white">Travel Agent</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="order-1 lg:order-2">
          <h3 className="font-semibold text-gray-800 text-xl text-center lg:text-left dark:text-white/90 sm:text-2xl">
            Manage Travel Agent
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
                {searchTerm && filteredTravelAgents.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-b-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredTravelAgents.map((travelAgent) => (
                      <div
                        key={travelAgent.travelAgentID}
                        onClick={() => handleSearchResultClick(travelAgent)}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {travelAgent.travelAgentCode}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {travelAgent.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Results Message */}
                {searchTerm &&
                  filteredTravelAgents.length === 0 &&
                  travelAgents.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-b-md shadow-lg">
                      <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                        No travel agents found
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
                Agent Code
              </label>
              <Input
                name="travelAgentCode"
                value={formData.travelAgentCode}
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
                placeholder="Enter Travel Agent Name"
                required
                className="w-full"
                onChange={handleInputChange}
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
        title="Select Travel Agent"
        size="auto"
        columnCount={travelAgentColumns.length}
      >
        <DataTable
          data={travelAgents}
          columns={travelAgentColumns}
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
