import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

export default function TravelAgent() {
  return (
    <>
      <PageMeta
        title="Travel Agent - Reservation System"
        description="Manage travel agent"
      />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[1000px]">
          {/* Header */}
          <div className="text-center mb-10">
            <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Add Travel Agent
            </h3>
          </div>

          <form className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end w-full">
              <div className="w-full sm:flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agent Code <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Agent code"
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

            <div className="flex-1 mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <Input placeholder="Enter Name" required className="w-full" />
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
