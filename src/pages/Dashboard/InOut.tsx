import PageMeta from "../../components/common/PageMeta";
import DatePicker from "../../components/form/date-picker";
import Select from "../../components/form/Select";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";

export default function InOut() {
  const statusOptions = [
    { value: "", label: "" },
    { value: "", label: "" },
    { value: "", label: "" },
  ];

  const handleTypeChange = (value: string) => {};

  return (
    <>
      <PageMeta
        title="In/Out Movements Information - Reservation System"
        description="Manage guest information"
      />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[1400px]">
          {/* Header */}
          <div className="text-center mb-10">
            <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              In/Out Movements Information
            </h3>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Left side */}
            <div className="w-full lg:w-5/16">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                  <div className="max-w-full overflow-x-auto">
                    <Table>
                      {/* Table Header */}
                      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                          <TableCell
                            isHeader
                            className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                          >
                            Status Type
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                          >
                            Total
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      {/* Table Body */}
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        <TableRow>
                          <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            No data available
                          </TableCell>
                          <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            0
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <h6 className="block text-sm font-medium text-gray-700 dark:text-gray-300  mt-8 mb-2">
                  Reservation Date
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <DatePicker
                      id="date-picker"
                      placeholder="Select a date"
                      onChange={(dates, currentDateString) => {
                        // Handle your logic
                        console.log({ dates, currentDateString });
                      }}
                    />
                  </div>
                  <div>
                    <DatePicker
                      id="date-picker"
                      placeholder="Select a date"
                      onChange={(dates, currentDateString) => {
                        // Handle your logic
                        console.log({ dates, currentDateString });
                      }}
                    />
                  </div>
                </div>

                <h6 className="block text-sm font-medium text-gray-700 dark:text-gray-300  mt-8 mb-2">
                  Status
                </h6>
                <Select
                  options={statusOptions}
                  placeholder="Select Status Type"
                  className="mb-0 w-full"
                  onChange={handleTypeChange}
                />
              </div>
            </div>

            {/* Right side */}
            <div className="w-full lg:w-11/16">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                  <div className="max-w-full overflow-x-auto">
                    <Table>
                      {/* Table Header */}
                      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                          <TableCell
                            isHeader
                            className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                          >
                            Reservation No
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                          >
                            Date
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                          >
                            Customer Name
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      {/* Table Body */}
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        <TableRow>
                          <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            No data available
                          </TableCell>
                          <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            0
                          </TableCell>
                          <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            No data available
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] mt-6">
                  <div className="max-w-full overflow-x-auto">
                    <Table>
                      {/* Table Header */}
                      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                          <TableCell
                            isHeader
                            className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                          >
                            Reservation No
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                          >
                            Date
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                          >
                            Customer Name
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      {/* Table Body */}
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        <TableRow>
                          <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            No data available
                          </TableCell>
                          <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            0
                          </TableCell>
                          <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            No data available
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
