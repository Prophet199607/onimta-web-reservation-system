import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import Checkbox from "../../components/form/input/Checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";

export default function BanquetReservation() {
  const [isChecked, setIsChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("banquet");

  const bookingStatusOptions = [
    { value: "On Arrival", label: "On Arrival" },
    { value: "Arrived", label: "Arrived" },
  ];

  const StatuseOptions = [
    { value: "Booked", label: "Booked" },
    { value: "Pending", label: "Pending" },
  ];

  const payOptions = [
    { value: "Cash", label: "Cash" },
    { value: "Credit Card", label: "Credit Card" },
    { value: "Bank Transfer", label: "Bank Transfer" },
  ];

  const handleTypeChange = (_value: string) => {};

  return (
    <>
      <PageMeta
        title="Banquet Reservation Information - Reservation System"
        description="Manage banquet reservation information"
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
              Banquet Reservation
            </li>
          </ol>
        </nav>

        {/* Header */}
        <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
          Banquet Reservation
        </h3>

        {/* Empty div for equal spacing */}
        <div className="w-[120px]"></div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white p-3 sm:p-5 md:px-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-8">
        <div className="mx-auto w-full">
          <form className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 pb-5">
              {/* Guest Information Section */}
              <div className="w-full">
                <h2 className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300 mb-6">
                  Guest Information
                </h2>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <label className="sm:w-40 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Guest Code
                    </label>
                    <Input
                      placeholder="Enter Guest code"
                      required
                      className="flex-1 w-full min-w-[280px] h-9"
                    />
                  </div>

                  {[
                    { label: "Name", placeholder: "Enter Name" },
                    {
                      label: "NIC/Passport",
                      placeholder: "Enter NIC/Passport",
                    },
                    {
                      label: "Customer Type",
                      placeholder: "Enter Customer Type",
                    },
                    { label: "Nationality", placeholder: "Enter Nationality" },
                    { label: "Country", placeholder: "Enter Country" },
                    { label: "Mobile", placeholder: "Enter Mobile" },
                    { label: "Telephone", placeholder: "Enter Telephone" },
                    { label: "Email", placeholder: "Enter Email" },
                    {
                      label: "Credit Limit",
                      placeholder: "Enter Credit Limit",
                      type: "number",
                    },
                    { label: "Booking Ref", placeholder: "Enter Booking Ref" },
                    {
                      label: "Travel Agent",
                      placeholder: "Enter Travel Agent",
                    },
                  ].map((field, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center"
                    >
                      <label className="w-full sm:w-40 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {field.label}
                      </label>
                      <Input
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        required
                        className="flex-1 w-full min-w-[280px] h-9"
                      />
                    </div>
                  ))}

                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <label className="sm:w-40 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Booking Status
                    </label>
                    <Select
                      options={bookingStatusOptions}
                      placeholder="Select Booking Status"
                      onChange={handleTypeChange}
                      className="sm:w-70 w-full h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Reservation Information Section */}
              <div className="w-full">
                <h2 className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300 mb-6">
                  Reservation Information
                </h2>
                <div className="space-y-2">
                  {["Reservation #", "Reference #"].map((label, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center"
                    >
                      <label className="w-full sm:w-44 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                      </label>
                      <Input
                        placeholder={`Enter ${label}`}
                        required
                        className="flex-1 w-full min-w-[300px] h-9"
                      />
                    </div>
                  ))}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <label className="w-full sm:w-40 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reservation Date
                    </label>
                    <DatePicker
                      id="reservation-date-picker"
                      placeholder="Select a date"
                    />
                  </div>

                  {["Check-In Date Time", "Check-Out Date Time"].map(
                    (label, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center"
                      >
                        <label className="w-full sm:w-44 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {label}
                        </label>
                        <div className="flex flex-1 flex-col sm:flex-row gap-2">
                          <DatePicker
                            id={`date-picker-${index}`}
                            placeholder="Select a date"
                            className="w-full min-w-[220px]"
                            onChange={(dates, currentDateString) => {
                              console.log({ dates, currentDateString });
                            }}
                          />
                          {label !== "Reservation Date" && (
                            <Input
                              type="time"
                              placeholder="Select time"
                              className="w-full sm:w-25 h-9"
                            />
                          )}
                        </div>
                      </div>
                    )
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <label className="w-full sm:w-40 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <Select
                      options={StatuseOptions}
                      placeholder="Select Status"
                      className="sm:w-75 w-full h-10"
                      onChange={handleTypeChange}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                    <label className="w-full sm:w-40 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Note
                    </label>
                    <textarea
                      className="w-full min-w-[300px] flex-1 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      rows={3}
                      placeholder="Enter your remark here"
                    />
                  </div>

                  {["No of Vehicle", "No of Adults", "No of Kids"].map(
                    (label, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center"
                      >
                        <label className="w-full sm:w-44 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {label}
                        </label>
                        <Input
                          type="number"
                          placeholder={`Enter ${label}`}
                          required
                          className="flex-1 w-full min-w-[300px] h-9"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <hr className="mb-5 pb-2 border-gray-500 dark:border-gray-400" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 pb-4">
              {/* Payment Information Section */}
              <div className="w-full">
                <h2 className="mb-4 text-base font-medium text-gray-700 dark:text-gray-300 sm:text-lg">
                  Payment Information
                </h2>
                <div className="space-y-2">
                  {[
                    {
                      label: "Sub Total",
                      placeholder: "Sub Total",
                      disabled: true,
                    },
                    { label: "Discount %", placeholder: "Enter Discount %" },
                    { label: "Discount", placeholder: "Enter Discount" },
                    {
                      label: "Gross Amount",
                      placeholder: "Gross Amount",
                      disabled: true,
                    },
                    {
                      label: "Paid Amount",
                      placeholder: "Paid Amount",
                      disabled: true,
                    },
                    {
                      label: "Due Amount",
                      placeholder: "Due Amount",
                      disabled: true,
                    },
                  ].map((field, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-1 sm:flex-row sm:items-center"
                    >
                      <label className="block w-40 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {field.label}
                      </label>
                      <Input
                        placeholder={field.placeholder}
                        required
                        disabled={field.disabled}
                        className="flex-1 w-full min-w-[280px] h-9"
                      />
                    </div>
                  ))}

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center">
                      <label className="block w-40 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Refund Amount
                      </label>
                      <Input
                        placeholder="Refund Amount"
                        required
                        disabled={!isChecked}
                        className="flex-1 w-full min-w-[180px] h-9"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={isChecked} onChange={setIsChecked} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                        Refund
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center">
                      <label className="block w-40 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Comment
                      </label>
                      <textarea
                        className="w-full min-w-[280px] flex-1 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        rows={3}
                        placeholder="Enter your remark here"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <label className="w-full sm:w-40 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pay Type
                    </label>
                    <Select
                      options={payOptions}
                      placeholder="Select Pay Type"
                      className="sm:w-75 w-full h-10"
                      onChange={handleTypeChange}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <label className="w-full sm:w-40 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount
                    </label>
                    <Input
                      placeholder="Enter Amount"
                      required
                      className="flex-1 w-full min-w-[300px] h-9"
                      type="number"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <label className="w-full sm:w-40 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ref #
                    </label>
                    <Input
                      placeholder="Enter Ref #"
                      required
                      className="flex-1 w-full min-w-[300px] h-9"
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <label className="w-full sm:w-40 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ref Date
                    </label>
                    <DatePicker
                      id="date-picker"
                      placeholder="Select a date"
                      className="flex-1 w-full"
                      onChange={(dates, currentDateString) => {
                        console.log({ dates, currentDateString });
                      }}
                    />
                  </div>
                </div>

                <div className="mt-5 pt-5 overflow-x-auto">
                  <Table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                    {/* Table Header */}
                    <TableHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <TableRow>
                        {["Payment Type", "Amount", "Ref #", "Ref Date"].map(
                          (header, index) => (
                            <TableCell
                              key={header}
                              isHeader
                              className={`px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 ${
                                index !== 3
                                  ? "border-r border-gray-200 dark:border-gray-700"
                                  : ""
                              }`}
                            >
                              {header}
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {[
                        {
                          paymentType: "Cash",
                          amount: 1000,
                          ref: "123456789",
                          refDate: "2025.08.15",
                        },
                      ].map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <TableCell className="px-4 py-2 sm:text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                            {row.paymentType}
                          </TableCell>
                          <TableCell className="px-4 py-2 sm:text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 text-right">
                            {row.amount.toLocaleString()}{" "}
                          </TableCell>
                          <TableCell className="px-4 py-2 sm:text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                            {row.ref}
                          </TableCell>
                          <TableCell className="px-4 py-2 sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                            {row.refDate}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex flex-col sm:flex-row gap-4 my-8 mb-3 justify-end items-end w-full max-w-md sm:max-w-xl ml-auto">
                    <Button
                      type="submit"
                      className="w-full sm:w-30 h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-300"
                      size="md"
                    >
                      Submit
                    </Button>
                    <Button
                      type="button"
                      size="md"
                      className="w-full sm:w-30 h-10 bg-gray-500 hover:bg-gray-600 text-white"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <hr className="mb-4 border-gray-500 dark:border-gray-400" />

            {/* Banquet & Service Details*/}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    type="button"
                    className={`flex items-center border-b-2 py-4 px-1 text-sm font-medium ${
                      activeTab === "banquet"
                        ? "border-blue-500 text-blue-600 dark:text-gray-200"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("banquet")}
                  >
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Banquet Details
                  </button>
                  <button
                    type="button"
                    className={`flex items-center border-b-2 py-4 px-1 text-sm font-medium ${
                      activeTab === "service"
                        ? "border-blue-500 text-blue-600 dark:text-gray-200"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("service")}
                  >
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Service Details
                  </button>
                </nav>
              </div>

              <div className="max-w-full overflow-x-auto mt-5">
                {activeTab === "banquet" ? (
                  <Table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                    {/* Table Header */}
                    <TableHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <TableRow>
                        {[
                          "Banquet Type",
                          "Banquet No",
                          "Rate Type",
                          "Rate",
                          "Qty",
                          "Amount",
                        ].map((header, index) => (
                          <TableCell
                            key={header}
                            isHeader
                            className={`px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base ${
                              index !== 5
                                ? "border-r border-gray-200 dark:border-gray-700"
                                : ""
                            } `}
                          >
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      <TableRow>
                        {[
                          { value: "Standard" },
                          { value: "101", align: "text-center" },
                          { value: "Normal" },
                          { value: "100", align: "text-right" },
                          { value: "1", align: "text-center" },
                          { value: "100", align: "text-right" },
                        ].map((cell, index) => (
                          <TableCell
                            key={index}
                            className={`px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${
                              cell.align
                            } ${
                              index !== 5
                                ? "border-r border-gray-200 dark:border-gray-700"
                                : ""
                            }`}
                          >
                            {cell.value}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : (
                  <Table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                    {/* Table Header */}
                    <TableHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base border-r border-gray-200 dark:border-gray-700"
                        >
                          Service
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base border-r border-gray-200 dark:border-gray-700"
                        >
                          Rate
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base border-r border-gray-200 dark:border-gray-700"
                        >
                          Qty
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base border-r border-gray-200 dark:border-gray-700"
                        >
                          Amount
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] border-r border-gray-200 dark:border-gray-700">
                      <TableRow>
                        <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 border-r border-gray-200 dark:border-gray-700">
                          Banquet Service
                        </TableCell>
                        <TableCell className="px-3 sm:px-5 py-3 text-sm text-right font-medium text-gray-700 dark:text-gray-300 mb-2 border-r border-gray-200 dark:border-gray-700">
                          50.00
                        </TableCell>
                        <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 border-r border-gray-200 dark:border-gray-700">
                          1
                        </TableCell>
                        <TableCell className="px-3 sm:px-5 py-3 text-sm text-right font-medium text-gray-700 dark:text-gray-300 mb-2 border-r border-gray-200 dark:border-gray-700">
                          50.00
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-6 mt-8 mb-3 justify-left w-full">
                <Button
                  className="w-full sm:w-28 h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-280"
                  size="md"
                >
                  Copy
                </Button>
                <Button
                  type="button"
                  size="md"
                  className="w-full sm:w-28 h-10 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
