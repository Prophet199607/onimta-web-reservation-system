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

export default function RoomReservation() {
  const [isChecked, setIsChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("room");

  const bookingStatuseOptions = [
    { value: "On Arrival", label: "On Arrival" },
    { value: "Arrived", label: "Arrived" },
  ];

  const StatuseOptions = [
    { value: "Booked", label: "Booked" },
    { value: "", label: "" },
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
        title="Room Reservation Information - Reservation System"
        description="Manage room reservation information"
      />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white p-3 sm:p-5 md:px-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[1500px]">
          {/* Header */}
          <div className="text-center mb-10">
            <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Room Reservation
            </h3>
          </div>

          <form className="space-y-4">
            {/* Guest Information Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="w-full">
                <h2 className="mb-4 text-base font-medium text-gray-700 dark:text-gray-300 sm:text-lg">
                  Guest Information
                </h2>
                <div className="space-y-2">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                    <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Guest Code
                    </label>
                    <div className="flex flex-1 gap-2">
                      <Input
                        placeholder="Enter Guest code"
                        required
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        className="w-20 bg-blue-600 text-white hover:bg-blue-700"
                        size="md"
                      >
                        New
                      </Button>
                    </div>
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
                      className="flex flex-col gap-1 sm:flex-row sm:items-center"
                    >
                      <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {field.label}
                      </label>
                      <Input
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        required
                        className="flex-1"
                      />
                    </div>
                  ))}

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                    <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Booking Status
                    </label>
                    <Select
                      options={bookingStatuseOptions}
                      placeholder="Select Booking Status"
                      className="flex-1"
                      onChange={handleTypeChange}
                    />
                  </div>
                </div>
              </div>

              {/* Reservation Information Section */}
              <div className="w-full">
                <h2 className="mb-4 text-base font-medium text-gray-700 dark:text-gray-300 sm:text-lg">
                  Reservation Information
                </h2>
                <div className="space-y-2">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                    <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reservation #
                    </label>
                    <Input
                      placeholder="Enter Reservation"
                      required
                      className="flex-1"
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                    <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reference #
                    </label>
                    <Input
                      placeholder="Enter Reservation"
                      required
                      className="flex-1"
                    />
                  </div>

                  {[
                    "Reservation Date",
                    "Check-In Date Time",
                    "Check-Out Date Time",
                  ].map((label, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-1 sm:flex-row sm:items-center"
                    >
                      <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                      </label>
                      <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                        <DatePicker
                          id={`date-picker-${index}`}
                          placeholder="Select a date"
                          className="flex-1"
                          onChange={(dates, currentDateString) => {
                            console.log({ dates, currentDateString });
                          }}
                        />
                        {label !== "Reservation Date" && (
                          <Input
                            type="time"
                            placeholder="Select time"
                            className="w-full sm:w-22"
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                    <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <Select
                      options={StatuseOptions}
                      placeholder="Select Status"
                      className="flex-1"
                      onChange={handleTypeChange}
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                    <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Note
                    </label>
                    <textarea
                      className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      rows={3}
                      placeholder="Enter your remark here"
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                    <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                      No of Vehicle
                    </label>
                    <Input
                      placeholder="Enter No of Vehicle"
                      required
                      className="flex-1"
                      type="number"
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                    <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                      No of Adults
                    </label>
                    <Input
                      placeholder="Enter No of Adults"
                      required
                      className="flex-1"
                      type="number"
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                    <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                      No of Kids
                    </label>
                    <Input
                      placeholder="Enter No of Kids"
                      required
                      className="flex-1"
                      type="number"
                    />
                  </div>
                </div>
              </div>

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
                      <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {field.label}
                      </label>
                      <Input
                        placeholder={field.placeholder}
                        required
                        disabled={field.disabled}
                        className="flex-1"
                      />
                    </div>
                  ))}

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center">
                      <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Refund Amount
                      </label>
                      <Input
                        placeholder="Refund Amount"
                        required
                        disabled={!isChecked}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={isChecked} onChange={setIsChecked} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                        Refund
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                    <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Comment
                    </label>
                    <textarea
                      className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      rows={2}
                      placeholder="Enter your comment here"
                    />
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4 mt-6 light:bg-white dark:border-gray-800 dark:bg-white/[0.03] space-y-2">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                      <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Pay Type
                      </label>
                      <Select
                        options={payOptions}
                        placeholder="Select Pay Type"
                        className="flex-1"
                        onChange={handleTypeChange}
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                      <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Amount
                      </label>
                      <Input
                        placeholder="Enter Amount"
                        required
                        className="flex-1"
                        type="number"
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                      <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ref #
                      </label>
                      <Input
                        placeholder="Enter Ref #"
                        required
                        className="flex-1"
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                      <label className="block w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ref Date
                      </label>
                      <DatePicker
                        id="date-picker"
                        placeholder="Select a date"
                        className="flex-1"
                        onChange={(dates, currentDateString) => {
                          console.log({ dates, currentDateString });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Room & Service Details*/}
              <div className="lg:col-span-2">
                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                      className={`flex items-center border-b-2 py-4 px-1 text-sm font-medium ${
                        activeTab === "room"
                          ? "border-blue-500 text-blue-600 dark:text-blue-500"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      }`}
                      onClick={() => setActiveTab("room")}
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
                      Room Details
                    </button>
                    <button
                      className={`flex items-center border-b-2 py-4 px-1 text-sm font-medium ${
                        activeTab === "service"
                          ? "border-blue-500 text-blue-600 dark:text-blue-500"
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

                <div className="rounded-lg border border-gray-200 p-4 mt-6 light:bg-white dark:border-gray-800 dark:bg-white/[0.03] space-y-2">
                  <div className="max-w-full overflow-x-auto">
                    {activeTab === "room" ? (
                      <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                          <TableRow>
                            <TableCell
                              isHeader
                              className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                            >
                              Room Type
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                            >
                              Room No
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                            >
                              Rate Type
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                            >
                              Rate
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                            >
                              Qty
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                            >
                              Amount
                            </TableCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                          <TableRow>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Standard
                            </TableCell>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              101
                            </TableCell>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Normal
                            </TableCell>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              100.00
                            </TableCell>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              1
                            </TableCell>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              100.00
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    ) : (
                      <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                          <TableRow>
                            <TableCell
                              isHeader
                              className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                            >
                              Service
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                            >
                              Rate
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                            >
                              Qty
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                            >
                              Amount
                            </TableCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                          <TableRow>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Room Service
                            </TableCell>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              50.00
                            </TableCell>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              1
                            </TableCell>
                            <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              50.00
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 mt-8 mb-3 justify-left w-full">
                  <Button
                    className="w-full sm:w-32 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-300"
                    size="md"
                  >
                    Copy
                  </Button>
                  <Button
                    type="button"
                    size="md"
                    className="w-full sm:w-32 bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 mt-6 light:bg-white dark:border-gray-800 dark:bg-white/[0.03] space-y-2">
                <div className="max-w-full overflow-x-auto">
                  <Table>
                    {/* Table Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                        >
                          Payment Type
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                        >
                          Amount
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                        >
                          Ref #
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-3 sm:px-5 py-3 font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base"
                        >
                          Ref Date
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      <TableRow>
                        <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          No data
                        </TableCell>
                        <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          0
                        </TableCell>
                        <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          No data
                        </TableCell>
                        <TableCell className="px-3 sm:px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          0
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 my-8 mb-3 justify-end items-end w-full max-w-md sm:max-w-xl ml-auto">
              <Button
                type="submit"
                className="w-full sm:w-36 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 border-blue-300"
                size="md"
              >
                Submit
              </Button>
              <Button
                type="button"
                size="md"
                className="w-full sm:w-36 bg-gray-500 hover:bg-gray-600 text-white"
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
