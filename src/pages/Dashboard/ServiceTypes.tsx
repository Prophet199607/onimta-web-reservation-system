import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import DataTable, { Column } from "../../components/tables/DataTable";
import Modal from "../../components/modal/Modal";

// Sample service types data
interface ServiceTypes {
  id: number;
  code: string;
  name: string;
  quantity: number;
  amount: number;
  type: string;
  remark: string;
}

// Sample data for service types
const sampleServiceTypes: ServiceTypes[] = [
  {
    id: 1,
    code: "RM",
    name: "Room Service",
    quantity: 10,
    amount: 100,
    type: "Room",
    remark: "Available for all room types",
  },
  {
    id: 2,
    code: "BNQ",
    name: "Banquet Service",
    quantity: 5,
    amount: 200,
    type: "Banquet",
    remark: "Special service for banquet events",
  },
  {
    id: 3,
    code: "CON",
    name: "Conference Service",
    quantity: 8,
    amount: 300,
    type: "Banquet",
    remark: "Conference service for business events",
  },
];

export default function ServiceTypes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceType, setSelectedServiceType] =
    useState<ServiceTypes | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<
    number | null
  >(null);

  // Individual form state variables
  const [serviceTypeCode, setServiceTypeCode] = useState("");
  const [serviceTypeName, setServiceTypeName] = useState("");
  const [quantity, setQuantity] = useState<number | string>("");
  const [amount, setAmount] = useState<number | string>("");
  const [type, setType] = useState("");
  const [remark, setRemark] = useState("");

  const typeOptions = [
    { value: "Room", label: "Room" },
    { value: "Banquet", label: "Banquet" },
  ];

  // Define columns for the DataTable
  const serviceColumn: Column<ServiceTypes>[] = [
    {
      key: "code",
      header: "Service Code",
      sortable: true,
      searchable: true,
    },
    {
      key: "name",
      header: "Service Name",
      sortable: true,
      searchable: true,
    },
    {
      key: "type",
      header: "Service Type",
      sortable: true,
      searchable: true,
    },
    {
      key: "quantity",
      header: "Quantity",
      sortable: true,
      searchable: true,
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      searchable: true,
    },
    {
      key: "remark",
      header: "Remark",
      sortable: false,
      searchable: false,
    },
  ];

  // Handle F3 key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key == "F3") {
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

  useEffect(() => {
    if (selectedServiceType) {
      setServiceTypeCode(selectedServiceType.code);
      setServiceTypeName(selectedServiceType.name);
      setQuantity(selectedServiceType.quantity);
      setAmount(selectedServiceType.amount);
      setType(selectedServiceType.type);
      setRemark(selectedServiceType.remark);
    }
  }, [selectedServiceType]);

  const handleRowSelect = (serviceType: ServiceTypes) => {
    setSelectedServiceType(serviceType);
    setSelectedServiceTypeId(serviceType.id);
    setIsEditMode(true);
    setIsModalOpen(false);
  };

  const handleTypeChange = (value: string) => {
    setType(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      console.log("Update submitted:", {
        id: selectedServiceTypeId,
        serviceTypeCode,
        serviceTypeName,
        quantity,
        amount,
        type,
        remark,
      });
    } else {
      console.log("Create submitted:", {
        serviceTypeCode,
        serviceTypeName,
        quantity,
        amount,
        type,
        remark,
      });
    }
  };

  // Clear function
  const handleClear = () => {
    setServiceTypeCode("");
    setServiceTypeName("");
    setQuantity("");
    setAmount("");
    setType("");
    setRemark("");
    setIsEditMode(false);
    setSelectedServiceTypeId(null);
    setSelectedServiceType(null);
  };

  return (
    <>
      <PageMeta
        title="Service Types - Reservation System"
        description="Manage service types"
      />

      {/* Breadcrumb and Header container */}
      <div className="flex items-center justify-between mb-6">
        {/* Breadcrumb */}
        <nav>
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/" className="text-gray-500 hover:text-gray-700">
                Dashboard
              </a>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 dark:text-white">Service Types</li>
          </ol>
        </nav>

        {/* Header */}
        <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
          Manage Service Type
        </h3>

        {/* Empty div for equal spacing */}
        <div className="w-[120px]"></div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-8">
        <div className="mx-auto w-full max-w-[1000px]">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end w-full">
              <div className="w-full sm:flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service Type Code <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter service type code"
                  required
                  className="w-full"
                  value={serviceTypeCode}
                  onChange={(e) => setServiceTypeCode(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-auto mt-4 sm:mt-0">
                <Button
                  type="button"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-300"
                  size="md"
                >
                  New
                </Button>
              </div>
            </div>

            <div className="flex-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter Name"
                required
                className="w-full"
                value={serviceTypeName}
                onChange={(e) => setServiceTypeName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Quantity"
                  required
                  className="w-full"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Amount"
                  required
                  className="w-full"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <Select
                options={typeOptions}
                placeholder="Select Type"
                className="mb-0"
                value={type} // FIXED: Removed curly braces
                onChange={handleTypeChange}
              />
            </div>

            <div className="flex-1 mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Remark <span className="text-red-500">*</span>
              </label>
              <textarea
                className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                rows={4}
                placeholder="Enter your remark here"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-6 pb-3 justify-center w-full max-w-md sm:max-w-xl mx-auto">
              <Button
                type="submit"
                className={`w-full sm:w-48 text-white ${
                  isEditMode
                    ? "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200 border-yellow-300"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 border-blue-300"
                }`}
                size="md"
              >
                {isEditMode ? "Update" : "Submit"}
              </Button>
              <Button
                type="button"
                onClick={handleClear}
                size="md"
                className="w-full sm:w-48 bg-gray-500 hover:bg-gray-600 text-white"
              >
                Clear
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Reusable Selection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Select Service Type"
        size="2xl"
      >
        <DataTable
          data={sampleServiceTypes}
          columns={serviceColumn}
          searchable={true}
          pagination={true}
          onRowClick={handleRowSelect}
          className="border-0 shadow-none"
          emptyMessage="No items available"
        />
      </Modal>
    </>
  );
}
