import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import Checkbox from "../../components/form/input/Checkbox";
import DataTable, { Column } from "../../components/tables/DataTable";
import Modal from "../../components/modal/Modal";

//Sample guest data
interface GuestInfo {
  id: number;
  code: string;
  type: string;
  title: string;
  name: string;
  nic: string;
  nationality: string;
  country: string;
  mobile: string;
  telephone: string;
  email: string;
  address: string;
  travelAgent: string;
  creditLimit: string;
}

// Sample data for guest information
const sampleGuestInfo: GuestInfo[] = [
  {
    id: 1,
    code: "GUEST001",
    type: "Mr.",
    title: "Mr.",
    name: "Amila Perera",
    nic: "123456789V",
    nationality: "Sinhalese",
    country: "Sri Lanka",
    mobile: "0712345678",
    telephone: "0112345678",
    email: "amila@gmail.com",
    address: "123 Main Street, Colombo",
    travelAgent: "Travel Agency A",
    creditLimit: "100000",
  },
  {
    id: 2,
    code: "GUEST002",
    type: "Mrs.",
    title: "Mrs.",
    name: "Nadeesha Silva",
    nic: "987654321V",
    nationality: "Sinhalese",
    country: "Sri Lanka",
    mobile: "0771234567",
    telephone: "0119876543",
    email: "nadeesha@gmail.com",
    address: "456 Elm Street, Colombo",
    travelAgent: "Travel Agency B",
    creditLimit: "150000",
  },
];

export default function GuestInfo() {
  const [isChecked, setIsChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuestInfo, setSelectedGuestInfo] = useState<GuestInfo | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);

  // Individual form state variables
  const [guestCode, setGuestCode] = useState("");
  const [guestType, setGuestType] = useState("");
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [nicPassport, setNicPassport] = useState("");
  const [nationality, setNationality] = useState("");
  const [country, setCountry] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [telephoneNo, setTelephoneNo] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [address, setAddress] = useState("");
  const [travelAgent, setTravelAgent] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  // const [guestInfoList, setGuestInfoList] =
  //   useState<GuestInfo[]>(samplePackages);

  const guestTypeOptions = [
    { value: "Mr.", label: "Mr." },
    { value: "Mrs.", label: "Mrs." },
    { value: "Dr.", label: "Dr." },
  ];

  const titleOptions = [
    { value: "Mr.", label: "Mr." },
    { value: "Mrs.", label: "Mrs." },
    { value: "Dr.", label: "Dr." },
  ];

  const nationalityOptions = [
    { value: "Sinhalese", label: "Sinhalese" },
    { value: "Tamil", label: "Tamil" },
    { value: "Muslim", label: "Muslim" },
  ];

  const countryOptions = [
    { value: "Sri Lanka", label: "Sri Lanka" },
    { value: "", label: "" },
    { value: "", label: "" },
  ];

  const travelAgentOptions = [
    { value: "Travel Agency A", label: "Travel Agency A" },
    { value: "Travel Agency B", label: "Travel Agency B" },
    { value: "Travel Agency C", label: "Travel Agency C" },
  ];

  // Define columns for the DataTable
  const GuestInfoColumns: Column<GuestInfo>[] = [
    {
      key: "code",
      header: "Guest Code",
      sortable: true,
      searchable: true,
    },
    {
      key: "type",
      header: "Guest Type",
      sortable: true,
      searchable: true,
    },
    {
      key: "title",
      header: "Guest Title",
      sortable: true,
      searchable: true,
    },
    {
      key: "name",
      header: "Guest Name",
      sortable: true,
      searchable: true,
    },
    {
      key: "nic",
      header: "Nic/Passport",
      sortable: true,
      searchable: true,
    },
    {
      key: "nationality",
      header: "Nationality",
      sortable: true,
      searchable: true,
    },
    {
      key: "country",
      header: "Country",
      sortable: true,
      searchable: true,
    },
    {
      key: "mobile",
      header: "Mobile No",
      sortable: true,
      searchable: true,
    },
    {
      key: "telephone",
      header: "Telephone No",
      sortable: true,
      searchable: true,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      searchable: true,
    },
    {
      key: "address",
      header: "Address",
      sortable: false,
      searchable: false,
    },
    {
      key: "travelAgent",
      header: "Travel Agent",
      sortable: false,
      searchable: false,
    },
    {
      key: "creditLimit",
      header: "Credit Limit",
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
    if (selectedGuestInfo) {
      setGuestCode(selectedGuestInfo.code);
      setGuestType(selectedGuestInfo.type);
      setTitle(selectedGuestInfo.title);
      setName(selectedGuestInfo.name);
      setNicPassport(selectedGuestInfo.nic);
      setNationality(selectedGuestInfo.nationality);
      setCountry(selectedGuestInfo.country);
      setMobileNo(selectedGuestInfo.mobile);
      setTelephoneNo(selectedGuestInfo.telephone);
      setEmailAddress(selectedGuestInfo.email);
      setAddress(selectedGuestInfo.address);
      setTravelAgent(selectedGuestInfo.travelAgent);
      setCreditLimit(selectedGuestInfo.creditLimit);
      setIsChecked(true);
    }
  }, [selectedGuestInfo]);

  const handleRowSelect = (pkg: GuestInfo) => {
    setSelectedGuestInfo(pkg);
    setIsModalOpen(false);
    setIsEditMode(true);
    setIsModalOpen(false);
  };

  const handleClear = () => {
    setGuestCode("");
    setGuestType("");
    setTitle("");
    setName("");
    setNicPassport("");
    setNationality("");
    setCountry("");
    setMobileNo("");
    setTelephoneNo("");
    setEmailAddress("");
    setAddress("");
    setTravelAgent("");
    setCreditLimit("");
    setIsChecked(false);
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedGuestInfo(null);
  };

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
                  value={guestCode}
                  onChange={(e) => setGuestCode(e.target.value)}
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
                  value={guestType}
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
                  value={title}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Name"
                  required
                  className="w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  NIC/Passport <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter NIC/Passport"
                  required
                  className="w-full"
                  value={nicPassport}
                  onChange={(e) => setNicPassport(e.target.value)}
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
                  value={nationality}
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
                  value={country}
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
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
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
                  value={telephoneNo}
                  onChange={(e) => setTelephoneNo(e.target.value)}
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
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
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
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
                  value={travelAgent}
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
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
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
          data={sampleGuestInfo}
          columns={GuestInfoColumns}
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
