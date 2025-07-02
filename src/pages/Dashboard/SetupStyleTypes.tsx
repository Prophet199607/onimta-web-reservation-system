import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import DataTable, { Column } from "../../components/tables/DataTable";
import Modal from "../../components/modal/Modal";

// Sample setup style types data
interface SetupStyleType {
  id: number;
  code: string;
  name: string;
  remark: string;
}

//Sample data for travel agents
const sampleSetupStyleTypes: SetupStyleType[] = [
  { id: 1, code: "ST001", name: "Theater Style", remark: "Seating in rows" },
  {
    id: 2,
    code: "ST002",
    name: "Classroom Style",
    remark: "Seating with tables",
  },
  { id: 3, code: "ST003", name: "U-Shape Style", remark: "Seating in U-shape" },
];

export default function SetupStyleTypes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [setupStyleTypeCode, setSetupStyleTypeCode] = useState("");
  const [setupStyleTypeName, setSetupStyleTypeName] = useState("");
  const [remark, setRemark] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSetupStyleTypeId, setSelectedSetupStyleTypeId] = useState<
    number | null
  >(null);

  // Define columns for the DataTable
  const setupStyleTypeColumns: Column<SetupStyleType>[] = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      searchable: true,
      width: "100px",
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      searchable: true,
    },
    {
      key: "remark",
      header: "Remark",
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

  const handleRowSelect = (setupStyleType: SetupStyleType) => {
    setSetupStyleTypeCode(setupStyleType.code);
    setSetupStyleTypeName(setupStyleType.name);
    setRemark(setupStyleType.remark);
    setIsModalOpen(false);
    setIsEditMode(true);
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", {
      id: selectedSetupStyleTypeId,
      setupStyleTypeCode,
      setupStyleTypeName,
      remark,
    });
  };

  const handleClear = () => {
    setSetupStyleTypeCode("");
    setSetupStyleTypeName("");
    setRemark("");
    setIsEditMode(false);
    setSelectedSetupStyleTypeId(null);
  };

  return (
    <>
      <PageMeta
        title="Event Setup Style Types - Reservation System"
        description="Manage event setup style types"
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
              Event Setup Style Types
            </li>
          </ol>
        </nav>

        {/* Header */}
        <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
          Manage Event Setup Style Types
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
                  Setup Style Code <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter setup style code"
                  required
                  className="w-full"
                  value={setupStyleTypeCode}
                  onChange={(e) => setSetupStyleTypeCode(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-auto mt-4 sm:mt-0">
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-300"
                  size="md"
                >
                  New
                </Button>
              </div>
            </div>

            <div className="flex-1 mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter Name"
                required
                className="w-full"
                value={setupStyleTypeName}
                onChange={(e) => setSetupStyleTypeName(e.target.value)}
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
        title="Select Event Type"
        size="2xl"
      >
        <DataTable
          data={sampleSetupStyleTypes}
          columns={setupStyleTypeColumns}
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
