import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";

export default function ServiceTypes() {
  const typeOptions = [
    { value: "Room", label: "Room" },
    { value: "Banquet", label: "Banquet" },
  ];

  const handleTypeChange = (value: string) => {};

  return (
    <>
      <PageMeta
        title="Service Types - Reservation System"
        description="Manage service types"
      />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[1000px]">
          {/* Header */}
          <div className="text-center mb-10">
            <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Add Service Types
            </h3>
          </div>

          <form className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end w-full">
              <div className="w-full sm:flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service Type Code <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter service type code"
                  required
                  className="w-full"
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

            <div className="flex-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <Input placeholder="Enter Name" required className="w-full" />
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <Input placeholder="Enter Amount" required className="w-full" />
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
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-6 pb-3 justify-center w-full max-w-md sm:max-w-xl mx-auto">
              <Button
                type="submit"
                className="w-full sm:w-48 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-300"
                size="md"
              >
                Submit
              </Button>
              <Button
                type="button"
                size="md"
                className="w-full sm:w-48 bg-gray-500 hover:bg-gray-600 text-white"
              >
                Clear
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
