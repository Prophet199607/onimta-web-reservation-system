import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import DataTable, { Column } from "../../components/tables/DataTable";
import Modal from "../../components/modal/Modal";

//Sample package data
interface Package {
  id: number;
  code: string;
  name: string;
  type: string;
  duration: string;
  roomAmount: number;
  price: number;
  cost: number;
  foodAmount: number;
  beverageAmount: number;
  remark: string;
}

// Sample data for packages
const samplePackages: Package[] = [
  {
    id: 1,
    code: "PKG001",
    name: "Standard Package",
    type: "Room",
    duration: "1 Night",
    roomAmount: 100,
    price: 150,
    cost: 120,
    foodAmount: 50,
    beverageAmount: 30,
    remark: "Includes breakfast and dinner.",
  },
  {
    id: 2,
    code: "PKG002",
    name: "Deluxe Package",
    type: "Banquet",
    duration: "2 Nights",
    roomAmount: 200,
    price: 300,
    cost: 250,
    foodAmount: 100,
    beverageAmount: 70,
    remark: "Includes all meals and beverages.",
  },
];

export default function PackageInfo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPackageInfoId, setSelectedPackageInfoId] = useState<
    number | null
  >(null);

  // Individual form state variables
  const [packageCode, setPackageCode] = useState("");
  const [packageName, setPackageName] = useState("");
  const [packageType, setPackageType] = useState("");
  const [duration, setDuration] = useState("");
  const [roomAmount, setRoomAmount] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [foodAmount, setFoodAmount] = useState("");
  const [beverageAmount, setBeverageAmount] = useState("");
  const [remark, setRemark] = useState("");

  const typeOptions = [
    { value: "Room", label: "Room" },
    { value: "Banquet", label: "Banquet" },
  ];

  // Define columns for the DataTable
  const packageColumns: Column<Package>[] = [
    {
      key: "code",
      header: "Package Code",
      sortable: true,
      searchable: true,
    },
    {
      key: "name",
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
      key: "duration",
      header: "Duration",
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
      key: "price",
      header: "Price",
      sortable: true,
      searchable: true,
    },
    {
      key: "cost",
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
      key: "remark",
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

  useEffect(() => {
    if (selectedPackage) {
      setPackageCode(selectedPackage.code);
      setPackageName(selectedPackage.name);
      setPackageType(selectedPackage.type);
      setDuration(selectedPackage.duration);
      setRoomAmount(selectedPackage.roomAmount.toString());
      setPrice(selectedPackage.price.toString());
      setCost(selectedPackage.cost.toString());
      setFoodAmount(selectedPackage.foodAmount.toString());
      setBeverageAmount(selectedPackage.beverageAmount.toString());
      setRemark(selectedPackage.remark);
    }
  }, [selectedPackage]);

  const handleRowSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsModalOpen(false);
    setIsEditMode(true);
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", {
      id: selectedPackageInfoId,
      packageCode,
      packageName,
      packageType,
      duration,
      roomAmount,
      price,
      cost,
      foodAmount,
      beverageAmount,
      remark,
    });
  };

  const handleTypeChange = (value: string) => {
    setPackageType(value);
  };

  // Clear function
  const handleClear = () => {
    setSelectedPackage(null);
    setPackageCode("");
    setPackageName("");
    setPackageType("");
    setDuration("");
    setRoomAmount("");
    setPrice("");
    setCost("");
    setFoodAmount("");
    setBeverageAmount("");
    setRemark("");
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedPackageInfoId(null);
  };

  return (
    <>
      <PageMeta
        title="Package Information - Reservation System"
        description="Manage package information"
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
            <li className="text-gray-900 dark:text-white">
              Package Information
            </li>
          </ol>
        </nav>

        {/* Header */}
        <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
          Manage Package Information
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
                  Package Type <span className="text-red-500">*</span>
                </label>
                <Select
                  options={typeOptions}
                  placeholder="Select Type"
                  className="mb-0 w-full"
                  value={packageType}
                  onChange={handleTypeChange}
                />
              </div>

              <div className="w-full sm:w-auto mt-4 sm:mt-0">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-300"
                  size="md"
                >
                  New (F3)
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Package Code <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Package Code"
                  required
                  className="w-full"
                  value={packageCode}
                  onChange={(e) => setPackageCode(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Package Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Package Name"
                  required
                  className="w-full"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Duration"
                  required
                  className="w-full"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Amount <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Room Amount"
                  required
                  className="w-full"
                  value={roomAmount}
                  onChange={(e) => setRoomAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Price"
                  required
                  className="w-full"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cost <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Cost"
                  required
                  className="w-full"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Food Amount <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Food Amount"
                  required
                  className="w-full"
                  value={foodAmount}
                  onChange={(e) => setFoodAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Beverage Amount <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Beverage Amount"
                  required
                  className="w-full"
                  value={beverageAmount}
                  onChange={(e) => setBeverageAmount(e.target.value)}
                />
              </div>
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
        title="Select Package Information"
        size="2xl"
      >
        <DataTable
          data={samplePackages}
          columns={packageColumns}
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
