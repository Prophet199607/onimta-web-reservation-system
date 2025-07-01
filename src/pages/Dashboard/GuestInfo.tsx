import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import Checkbox from "../../components/form/input/Checkbox";

export default function GuestInfo() {
  const [isChecked, setIsChecked] = useState(false);

  const guestTypeOptions = [
    { value: "Mr.", label: "Mr." },
    { value: "Mrs.", label: "Mrs." },
    { value: "Dr.", label: "Dr." },
  ];

  const titleOptions = [
    { value: "", label: "" },
    { value: "", label: "" },
    { value: "", label: "" },
  ];

  const nationalityOptions = [
    { value: "", label: "" },
    { value: "", label: "" },
    { value: "", label: "" },
  ];

  const countryOptions = [
    { value: "", label: "" },
    { value: "", label: "" },
    { value: "", label: "" },
  ];

  const travelAgentOptions = [
    { value: "", label: "" },
    { value: "", label: "" },
    { value: "", label: "" },
  ];

  const handleTypeChange = (_value: string) => {};

  return (
    <>
      <PageMeta
        title="Guest Information - Reservation System"
        description="Manage guest information"
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
            <li className="text-gray-900 dark:text-white">Guest Information</li>
          </ol>
        </nav>

        {/* Header */}
        <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
          Manage Guest Information
        </h3>

        {/* Empty div for equal spacing */}
        <div className="w-[120px]"></div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-8">
        <div className="mx-auto w-full max-w-[1000px]">
          <form className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end w-full">
              <div className="w-full sm:flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Guest Code <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Guest code"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Guest Type <span className="text-red-500">*</span>
                </label>
                <Select
                  options={guestTypeOptions}
                  placeholder="Select Guest Type"
                  className="mb-0 w-full"
                  onChange={handleTypeChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Select
                  options={titleOptions}
                  placeholder="Select Title"
                  className="mb-0 w-full"
                  onChange={handleTypeChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input placeholder="Enter Name" required className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  NIC/Passport <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter NIC/Passport"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Nationality <span className="text-red-500">*</span>
                </label>
                <Select
                  options={nationalityOptions}
                  placeholder="Select Nationality"
                  className="mb-0 w-full"
                  onChange={handleTypeChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Country <span className="text-red-500">*</span>
                </label>
                <Select
                  options={countryOptions}
                  placeholder="Select Country"
                  className="mb-0 w-full"
                  onChange={handleTypeChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mobile No <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Mobile No"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telephone No <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Telephone No"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Email Address"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Address"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Travel Agent <span className="text-red-500">*</span>
                </label>
                <Select
                  options={travelAgentOptions}
                  placeholder="Select Travel Agent"
                  className="mb-0 w-full"
                  onChange={handleTypeChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Credit Limit <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Credit Limit"
                  required
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Active
                </span>
              </div>
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
