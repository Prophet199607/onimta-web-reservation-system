import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";

export default function InOut() {
  return (
    <>
      <PageMeta
        title="In/Out Movements Information - Reservation System"
        description="Manage guest information"
      />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[1200px]">
          {/* Header */}
          <div className="text-center mb-10">
            <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              In/Out Movements Information
            </h3>
          </div>

          {/* Content */}
          <div className="flex gap-6">
            {/* Left side */}
            <div className="w-1/5">
              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="mb-4 font-medium">Left Table</h4>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                  <Table>
                    {/* Table Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Status Type
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Total
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      <TableRow>
                        <TableCell className="px-5 py-3">
                          No data available
                        </TableCell>
                        <TableCell className="px-5 py-3">0</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="w-4/5">
              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="mb-4 font-medium">Right Table</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
