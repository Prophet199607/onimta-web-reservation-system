// import { useState, useEffect, useRef } from "react";
// import PageMeta from "../../../components/common/PageMeta";
// import Input from "../../../components/form/input/InputField";
// import Button from "../../../components/ui/button/Button";
// import DataTable, { Column } from "../../../components/tables/DataTable";
// import Modal from "../../../components/modal/Modal";
// import Select from "../../../components/form/Select";
// import API_BASE_URL from "../../../config/api";
// import {
//   showSuccessToast,
//   showErrorToast,
//   showLoadingToast,
//   dismissToast,
// } from "../../../components/alert/ToastAlert";
// import { FiSearch, FiX } from "react-icons/fi";

// // Sample room types data
// interface Banquets {
//   roomID: number;
//   roomTypeCode: string;
//   roomCode: string;
//   roomSize: string;
//   roomStatus: string;
//   description: string;
//   remarks: string;
//   isRoom: boolean;
//   isBanquet: boolean;
// }

// export default function Banquets() {
//   const [formData, setFormData] = useState({
//     roomCode: "",
//     roomTypeCode: "",
//     roomSize: "",
//     roomStatus: "",
//     description: "",
//     remarks: "",
//   });

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingCode, setEditingCode] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [banquets, setBanquets] = useState<Banquets[]>([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredBanquets, setFilteredBanquets] = useState<Banquets[]>([]);
//   const hasFetched = useRef(false);

//   const banquetStatusOptions = [
//     { value: "VACANT", label: "Vacant" },
//     { value: "OCCUPIED", label: "Occupied" },
//     { value: "RESERVED", label: "Reserved" },
//     { value: "OUT_OF_ORDER", label: "Out of Order" },
//     { value: "CLEANING", label: "Cleaning in Progress" },
//     { value: "BLOCKED", label: "Blocked" },
//   ];

//   // Define columns for the DataTable
//   const banquetColumns: Column<Banquets>[] = [
//     {
//       key: "index",
//       header: "#",
//       width: "20",
//       sortable: false,
//       render: (_value: any, _row: Banquets, index: number) => (
//         <span className="font-medium text-gray-600 dark:text-gray-400">
//           {index + 1}
//         </span>
//       ),
//     },
//     {
//       key: "roomCode",
//       header: "Banquet Code",
//       sortable: true,
//       searchable: true,
//       width: "100px",
//     },
//     {
//       key: "description",
//       header: "Banquet Name",
//       sortable: true,
//       searchable: true,
//     },
//     {
//       key: "roomSize",
//       header: "Banquet Size",
//       sortable: true,
//       searchable: true,
//       width: "100px",
//     },
//     {
//       key: "roomStatus",
//       header: "Banquet Status",
//       sortable: true,
//       searchable: true,
//       width: "100px",
//     },
//     {
//       key: "remarks",
//       header: "Remark",
//       sortable: true,
//       searchable: true,
//     },
//   ];

//   // Handle F3 key press
//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (event.key === "F3") {
//         event.preventDefault();
//         setIsModalOpen(true);
//       }
//       // Handle Escape key to close modal
//       if (event.key === "Escape") {
//         setIsModalOpen(false);
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);
//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, []);

//   const fetchBanquets = async () => {
//     setLoading(true);
//     try {
//       const token =
//         localStorage.getItem("authToken") ||
//         sessionStorage.getItem("authToken");
//       const response = await fetch(`${API_BASE_URL}/api/Room/getall`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         // Filter only banquets where isBanquet is true
//         const banquetsOnly = Array.isArray(data)
//           ? data.filter((banquet: Banquets) => banquet.isBanquet === true)
//           : [];
//         setBanquets(banquetsOnly);
//       } else {
//         throw new Error("Failed to fetch Banquets");
//       }
//     } catch (error) {
//       showErrorToast("Failed to load banquets");
//       setBanquets([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchNextCode = async () => {
//     setLoading(true);
//     try {
//       const token =
//         localStorage.getItem("authToken") ||
//         sessionStorage.getItem("authToken");

//       // Query parameters for isRoom=false and isBanquet=true
//       const queryParams = new URLSearchParams({
//         isRoom: "false",
//         isBanquet: "true",
//       });

//       const response = await fetch(
//         `${API_BASE_URL}/api/Room/getNextroomCode?${queryParams}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         setFormData((prev) => ({
//           ...prev,
//           roomCode: data.nextCode || "",
//         }));
//       } else {
//         throw new Error("Failed to fetch Room code");
//       }
//     } catch (error) {
//       console.error(error);
//       showErrorToast("Failed to load room code");
//       setFormData((prev) => ({
//         ...prev,
//         roomCode: "",
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!hasFetched.current) {
//       hasFetched.current = true;
//       fetchNextCode();
//       fetchBanquets();
//     }
//   }, []);

//   // Search Handling
//   const handleChange = (e: React.FormEvent) => {
//     const value = (e.target as HTMLInputElement).value;
//     setSearchTerm(value);

//     // Filter room types based on search term
//     if (value.trim() === "") {
//       setFilteredBanquets([]);
//     } else {
//       const filtered = banquets.filter(
//         (banquet) =>
//           banquet.description.toLowerCase().includes(value.toLowerCase()) ||
//           banquet.roomCode.toLowerCase().includes(value.toLowerCase())
//       );
//       setFilteredBanquets(filtered);
//     }
//   };

//   const clearSearch = () => {
//     setSearchTerm("");
//     setFilteredBanquets([]);
//     handleClear();
//   };

//   // Function to handle selecting a banquet from search results
//   const handleSearchResultClick = (banquet: Banquets) => {
//     setFormData({
//       roomCode: banquet.roomCode,
//       roomTypeCode: banquet.roomTypeCode,
//       roomSize: banquet.roomSize,
//       roomStatus: banquet.roomStatus,
//       description: banquet.description,
//       remarks: banquet.remarks,
//     });
//     setEditingCode(banquet.roomCode);
//     setSearchTerm("");
//     setFilteredBanquets([]);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     setIsSubmitting(true);
//     const loadingToastId = showLoadingToast(
//       editingCode ? "Updating Banquet ..." : "Adding Banquet ..."
//     );

//     try {
//       const token =
//         localStorage.getItem("authToken") ||
//         sessionStorage.getItem("authToken");
//       const url = editingCode
//         ? `${API_BASE_URL}/api/Room/update/${editingCode}`
//         : `${API_BASE_URL}/api/Room/add`;

//       const payload = {
//         ...formData,
//         isRoom: false,
//         isBanquet: true,
//       };

//       const response = await fetch(url, {
//         method: editingCode ? "PUT" : "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         dismissToast(loadingToastId);
//         showSuccessToast(
//           editingCode
//             ? "Banquet updated successfully!"
//             : "Banquet added successfully!"
//         );
//         handleClear();
//         fetchBanquets();
//       } else {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//     } catch (error) {
//       dismissToast(loadingToastId);
//       console.error("Error saving banquet:", error);
//       showErrorToast("Banquet Code already exists");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Handle select field changes
//   const handleSelectChange = (field: string, value: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleRowClick = (row: Banquets) => {
//     setFormData({
//       roomCode: row.roomCode,
//       roomTypeCode: row.roomTypeCode,
//       roomSize: row.roomSize,
//       roomStatus: row.roomStatus,
//       description: row.description,
//       remarks: row.remarks,
//     });
//     setEditingCode(row.roomCode);
//     setIsModalOpen(false);
//   };

//   const handleClear = () => {
//     setFormData({
//       roomCode: "",
//       roomTypeCode: "",
//       roomSize: "",
//       roomStatus: "",
//       description: "",
//       remarks: "",
//     });
//     setEditingCode(null);
//     fetchNextCode();
//   };

//   return (
//     <>
//       <PageMeta
//         title="Banquets - Reservation System"
//         description="Manage banquets"
//       />

//       {/* Breadcrumb and Header container */}
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
//         {/* Breadcrumb */}
//         <nav className="order-2 lg:order-1">
//           <ol className="flex items-center justify-center lg:justify-start space-x-2 text-sm">
//             <li>
//               <a
//                 href="/dashboard"
//                 className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
//               >
//                 Dashboard
//               </a>
//             </li>
//             <li className="text-gray-500 dark:text-gray-400">/</li>
//             <li className="text-gray-900 dark:text-white">Banquets</li>
//           </ol>
//         </nav>

//         {/* Header */}
//         <div className="order-1 lg:order-2">
//           <h3 className="font-semibold text-gray-800 text-xl text-center lg:text-left dark:text-white/90 sm:text-2xl">
//             Manage Banquets
//           </h3>
//         </div>

//         {/* Empty div for equal spacing on desktop only */}
//         <div className="hidden lg:block lg:w-[120px] lg:order-3"></div>
//       </div>

//       <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-8">
//         <div className="mx-auto w-full max-w-[1000px]">
//           <form className="space-y-4" onSubmit={handleSubmit}>
//             {/* Search Field */}
//             <div className="w-full sm:w-2/5 sm:ml-auto relative flex items-center gap-2">
//               <div className="relative flex-1">
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={handleChange}
//                   placeholder="Search by code or description...."
//                   className="w-full border border-gray-300 dark:border-gray-600 rounded px-4 py-2 pr-10 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
//                 />

//                 <div className="absolute inset-y-0 right-3 flex items-center">
//                   {searchTerm ? (
//                     <FiX
//                       className="w-4 h-4 text-gray-500 hover:text-red-500 cursor-pointer"
//                       onClick={clearSearch}
//                     />
//                   ) : (
//                     <FiSearch className="w-4 h-4 text-gray-400" />
//                   )}
//                 </div>

//                 {/* Search Results Dropdown */}
//                 {searchTerm && filteredBanquets.length > 0 && (
//                   <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-b-md shadow-lg max-h-60 overflow-y-auto">
//                     {filteredBanquets.map((banquet) => (
//                       <div
//                         key={banquet.roomCode}
//                         onClick={() => handleSearchResultClick(banquet)}
//                         className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
//                       >
//                         <div className="flex justify-between items-center">
//                           <span className="text-sm text-gray-900 dark:text-white">
//                             {banquet.roomCode}
//                           </span>
//                           <span className="text-sm text-gray-600 dark:text-gray-400">
//                             {banquet.description}
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* No Results Message */}
//                 {searchTerm &&
//                   filteredBanquets.length === 0 &&
//                   banquets.length > 0 && (
//                     <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-b-md shadow-lg">
//                       <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
//                         No banquets found
//                       </div>
//                     </div>
//                   )}
//               </div>

//               {/* F3 Button */}
//               <button
//                 type="button"
//                 onClick={() => setIsModalOpen(true)}
//                 className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
//               >
//                 <FiSearch className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Banquet Code
//                 </label>
//                 <Input
//                   name="roomCode"
//                   value={formData.roomCode}
//                   readonly
//                   className="w-full"
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Name <span className="text-red-500">*</span>
//                 </label>
//                 <Input
//                   name="description"
//                   value={formData.description}
//                   placeholder="Enter Name"
//                   required
//                   className="w-full"
//                   onChange={handleInputChange}
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Banquet Size
//                 </label>
//                 <Input
//                   name="roomSize"
//                   value={formData.roomSize}
//                   className="w-full"
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Banquet Status
//                 </label>
//                 <Select
//                   options={banquetStatusOptions}
//                   onChange={(value) => handleSelectChange("roomStatus", value)}
//                   placeholder="Select Type"
//                   value={formData.roomStatus}
//                   className="mb-0"
//                 />
//               </div>
//             </div>

//             <div className="flex-1 mt-6">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Remarks
//               </label>
//               <textarea
//                 name="remarks"
//                 value={formData.remarks}
//                 className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
//                 rows={4}
//                 placeholder="Enter your remarks here"
//                 onChange={handleTextAreaChange}
//               />
//             </div>

//             <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 pb-3 justify-center items-center w-full">
//               <Button
//                 type="submit"
//                 className={`w-50 sm:w-auto sm:min-w-[180px] ${
//                   editingCode
//                     ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-200 border-yellow-300"
//                     : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-300"
//                 } disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out`}
//                 size="md"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting
//                   ? editingCode
//                     ? "Updating..."
//                     : "Adding..."
//                   : editingCode
//                   ? "Update"
//                   : "Submit"}
//               </Button>
//               <Button
//                 type="button"
//                 size="md"
//                 className="w-50 sm:w-auto sm:min-w-[180px] bg-gray-500 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
//                 onClick={handleClear}
//                 disabled={isSubmitting}
//               >
//                 {editingCode ? "Cancel" : "Clear"}
//               </Button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Reusable Selection Modal */}
//       <Modal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         title="Select Banquets"
//         size="auto"
//         columnCount={banquetColumns.length}
//       >
//         <DataTable
//           data={banquets}
//           columns={banquetColumns}
//           loading={loading}
//           searchable={true}
//           pagination={true}
//           sortable={true}
//           pageSize={10}
//           onRowClick={handleRowClick}
//           className="border-0 shadow-none"
//           emptyMessage="No data available"
//         />
//       </Modal>
//     </>
//   );
// }
import { useState, useEffect, useRef } from "react";
import PageMeta from "../../../components/common/PageMeta";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import DataTable, { Column } from "../../../components/tables/DataTable";
import Select from "../../../components/form/Select";
import API_BASE_URL from "../../../config/api";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "../../../components/alert/ToastAlert";
import { FiSearch, FiX, FiPlus, FiEdit2, FiTrash2, FiCalendar, FiUsers, FiClock, FiCheckCircle } from "react-icons/fi";

// Sample room types data
interface Banquets {
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

export default function Banquets() {
  const [formData, setFormData] = useState({
    roomCode: "",
    roomTypeCode: "",
    roomSize: "",
    roomStatus: "",
    description: "",
    remarks: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [banquets, setBanquets] = useState<Banquets[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    roomCode: string;
    description: string;
  }>({ isOpen: false, roomCode: "", description: "" });
  const hasFetched = useRef(false);

  const banquetStatusOptions = [
    { value: "VACANT", label: "Vacant" },
    { value: "OCCUPIED", label: "Occupied" },
    { value: "RESERVED", label: "Reserved" },
    { value: "OUT_OF_ORDER", label: "Out of Order" },
    { value: "CLEANING", label: "Cleaning in Progress" },
    { value: "BLOCKED", label: "Blocked" },
  ];

  // Define columns for the DataTable
  const banquetColumns: Column<Banquets>[] = [
    {
      key: "index",
      header: "#",
      width: "20",
      sortable: false,
      render: (_value: any, _row: Banquets, index: number) => (
        <span className="font-medium text-gray-600 dark:text-gray-400">
          {index + 1}
        </span>
      ),
    },
    {
      key: "roomCode",
      header: "Banquet Code",
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
      header: "Banquet Name",
      sortable: true,
      searchable: true,
      render: (value: string) => (
        <span className="text-gray-900 dark:text-white">
          {value}
        </span>
      ),
    },
    {
      key: "roomSize",
      header: "Size",
      sortable: true,
      searchable: true,
      width: "100px",
    },
    {
      key: "roomStatus",
      header: "Status",
      sortable: true,
      searchable: true,
      width: "120px",
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'VACANT' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
          value === 'OCCUPIED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
          value === 'RESERVED' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        }`}>
          {value === 'VACANT' ? 'Vacant' :
           value === 'OCCUPIED' ? 'Occupied' :
           value === 'RESERVED' ? 'Reserved' :
           value === 'OUT_OF_ORDER' ? 'Out of Order' :
           value === 'CLEANING' ? 'Cleaning' :
           value === 'BLOCKED' ? 'Blocked' : value}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "100px",
      sortable: false,
      render: (_value: any, row: Banquets) => (
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
              event.stopPropagation
              setDeleteConfirmModal({
              isOpen: true,
              roomCode: row.roomCode,
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

  // Handle F3 key press
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

  const fetchBanquets = async () => {
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
        // Filter only banquets where isBanquet is true
        const banquetsOnly = Array.isArray(data)
          ? data.filter((banquet: Banquets) => banquet.isBanquet === true)
          : [];
        setBanquets(banquetsOnly);
      } else {
        throw new Error("Failed to fetch Banquets");
      }
    } catch (error) {
      showErrorToast("Failed to load banquets");
      setBanquets([]);
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

      // Query parameters for isRoom=false and isBanquet=true
      const queryParams = new URLSearchParams({
        isRoom: "false",
        isBanquet: "true",
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
      fetchBanquets();
    }
  }, []);

  // Search Handling
  const handleChange = (e: React.FormEvent) => {
    const value = (e.target as HTMLInputElement).value;
    setSearchTerm(value);
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

  const handleDelete = async (roomCode: string) => {
    const loadingToastId = showLoadingToast("Deleting banquet...");
    
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      
      // Try DELETE endpoint first
      let response = await fetch(`${API_BASE_URL}/api/Room/Delete/${roomCode}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // If DELETE doesn't work, try alternative methods
      if (!response.ok) {
        // Try with different endpoint variations
        const endpoints = [
          `${API_BASE_URL}/api/Room/${roomCode}`,
          `${API_BASE_URL}/api/Room?roomCode=${roomCode}`,
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
        showSuccessToast("Banquet deleted successfully!");
        
        // Refresh the banquets list
        await fetchBanquets();
        
        // Close the confirmation modal
        setDeleteConfirmModal({ isOpen: false, roomCode: "", description: "" });
        
        // Close edit modal if open for this banquet
        if (editingCode === roomCode) {
          handleCloseModal();
        }
      } else {
        // If DELETE endpoints don't work, try frontend-only delete
        console.warn("No backend delete endpoint found. Implementing frontend-only delete.");
        
        // Frontend-only delete (temporary solution)
        setBanquets(prev => prev.filter(banquet => banquet.roomCode !== roomCode));
        dismissToast(loadingToastId);
        showSuccessToast("Banquet removed from list");
        
        // Close modals
        setDeleteConfirmModal({ isOpen: false, roomCode: "", description: "" });
        if (editingCode === roomCode) {
          handleCloseModal();
        }
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Delete error:", error);
      
      // Type-safe error handling
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      showErrorToast(`Failed to delete banquet: ${errorMessage}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      showErrorToast("Please enter banquet name");
      return;
    }

    setIsSubmitting(true);
    const loadingToastId = showLoadingToast(
      editingCode ? "Updating Banquet ..." : "Adding Banquet ..."
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
        isRoom: false,
        isBanquet: true,
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
            ? "Banquet updated successfully!"
            : "Banquet added successfully!"
        );
        handleClear();
        fetchBanquets();
        setIsModalOpen(false);
      } else {
        const errorText = await response.text();
        if (errorText.includes("already exists") || errorText.includes("duplicate")) {
          showErrorToast("Banquet Code already exists");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error("Error saving banquet:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save banquet";
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRowClick = (row: Banquets) => {
    setFormData({
      roomCode: row.roomCode,
      roomTypeCode: row.roomTypeCode,
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
      roomCode: "",
      roomTypeCode: "",
      roomSize: "",
      roomStatus: "",
      description: "",
      remarks: "",
    });
    setEditingCode(null);
    fetchNextCode();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    handleClear();
  };

  const filteredData = banquets.filter(banquet => {
    const matchesSearch = searchTerm 
      ? banquet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banquet.roomCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banquet.roomStatus.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesSearch;
  });

  // Calculate statistics
  const vacantCount = banquets.filter(b => b.roomStatus === 'VACANT').length;
  const occupiedCount = banquets.filter(b => b.roomStatus === 'OCCUPIED').length;
  const reservedCount = banquets.filter(b => b.roomStatus === 'RESERVED').length;


  return (
    <>
      <PageMeta title="Banquets Management" description="Manage hotel banquets and event spaces" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Banquets Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and organize all hotel banquet halls and event spaces
            </p>
          </div>
          
          <Button
            type="button"
            onClick={handleAddNew}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 border-0 flex items-center gap-2"
            size="md"
          >
            <FiPlus className="w-4 h-4" />
            Add New Banquet
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Banquets Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Banquets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {banquets.length}
              </p>
            </div>
          </div>
        </div>

        {/* Vacant Banquets Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vacant</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {vacantCount}
              </p>
            </div>
          </div>
        </div>

        {/* Occupied Banquets Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Occupied</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {occupiedCount}
              </p>
            </div>
          </div>
        </div>

        {/* Reserved Banquets Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <FiClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Reserved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {reservedCount}
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
                  placeholder="Search banquets by code, name, or status..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
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
                title="Press F3 to add new banquet"
              >
                <FiPlus className="w-4 h-4" />
                Quick Add (F3)
              </button>
            </div>
          </div>
        </div>

        {/* DataTable */}
        <div className="p-6">
          {banquets.length === 0 && loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading banquets...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No banquets found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? "Try changing your search criteria" 
                  : "Get started by adding your first banquet"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add New Banquet
                </Button>
              )}
            </div>
          ) : (
            <DataTable
              data={filteredData}
              columns={banquetColumns}
              loading={loading}
              searchable={false}
              pagination={true}
              sortable={true}
              pageSize={10}
              onRowClick={handleRowClick}
              emptyMessage="No banquets found"
              className="border-0 shadow-none"
              
            />
          )}
        </div>
      </div>

      {/* Add/Edit Banquet Modal */}
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
                        <FiCalendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {editingCode ? 'Edit Banquet' : 'Add New Banquet'}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {editingCode ? `Editing banquet ${formData.roomCode}` : 'Fill in the details to add a new banquet'}
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
                  {/* Banquet Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Banquet Code
                    </label>
                    <Input
                      name="roomCode"
                      value={formData.roomCode}
                      readonly={!!editingCode}
                      className="w-full"
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Banquet Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Banquet Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="description"
                      value={formData.description}
                      placeholder="Enter banquet name"
                      required
                      className="w-full"
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Banquet Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Banquet Size
                      </label>
                      <Input
                        name="roomSize"
                        value={formData.roomSize}
                        placeholder="e.g., 500 sq.ft"
                        className="w-full"
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Banquet Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Banquet Status
                      </label>
                      <Select
                        options={banquetStatusOptions}
                        onChange={(value) => handleSelectChange("roomStatus", value || "")}
                        placeholder="Select Status"
                        value={formData.roomStatus}
                        className="mb-0"
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
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-3 text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      placeholder="Enter any remarks or notes..."
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
                      onClick={handleClear}
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
                        ? "Update Banquet"
                        : "Add Banquet"}
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
                  Are you sure you want to delete banquet <span className="font-bold">"{deleteConfirmModal.roomCode}"</span>?
                  {deleteConfirmModal.description && deleteConfirmModal.description !== deleteConfirmModal.roomCode && (
                    <span className="ml-1">({deleteConfirmModal.description})</span>
                  )}
                </p>
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                  ⚠️ This will permanently remove the banquet and cannot be recovered.
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Note: This may affect events and reservations using this banquet.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmModal({ isOpen: false, roomCode: "", description: "" })}
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
                  Delete Banquet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}