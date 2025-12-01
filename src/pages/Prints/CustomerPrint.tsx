import React, { useEffect, useState } from "react";

const CustomerPrint: React.FC = () => {
  const [guestData, setGuestData] = useState<any>(null);
  const [lookupData, setLookupData] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("guestPrintData");
    if (data) setGuestData(JSON.parse(data));

    const lookup = sessionStorage.getItem("guestLookupData");
    if (lookup) setLookupData(JSON.parse(lookup));
  }, []);

  const handlePrint = () => {
    window.print();
    window.opener.postMessage({ action: "PRINT_CONFIRMED" }, "*");
    window.close();
  };

  const getDescriptionByCode = (
    code: string,
    dataArray: any[],
    codeField: string,
    descField: string
  ) => {
    const item = dataArray?.find((item) => item[codeField] === code);
    return item ? item[descField] : code || "N/A";
  };

  if (!guestData || !lookupData) return <p>Loading...</p>;

  const { guestTypes, guestNationality, guestCountries, travelAgent } =
    lookupData;

  return (
    <>
      <style>
        {`
          @media print {
            @page { margin: 0; }
            body { -webkit-print-color-adjust: exact; }
            body * { visibility: hidden; }
            .print-container, .print-container * { visibility: visible; }
            .print-container { position: absolute; left: 0; top: 0; width: 100%; }
          }
      `}
      </style>

      <div className="print-container">
        <div className="p-6 print:p-0">
          <div className="max-w-3xl mx-auto bg-white shadow p-6 print:shadow-none print:border-0">
            {/* Header */}
            <div className="text-center border-b-2 border-gray-700 pb-4 mb-6">
              <h2 className="text-2xl font-bold">Guest Information Details</h2>
              <p className="text-sm text-gray-600">
                Date: {new Date().toLocaleDateString()} Time:{" "}
                {new Date().toLocaleTimeString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-6">
              {/* Section: Basic Info */}
              <div>
                <h3 className="font-bold text-lg border-b pb-1 mb-4">
                  Basic Information
                </h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-semibold w-40 ">Guest Code:</span>
                    <span>{guestData.customerCode || "N/A"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-40">Guest Type:</span>
                    <span>
                      {" "}
                      <span>
                        {getDescriptionByCode(
                          guestData.customerTypeCode,
                          guestTypes,
                          "customerTypeCode",
                          "description"
                        )}
                      </span>
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-40">Name:</span>
                    <span>
                      {guestData.title || "N/A"} {guestData.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-40">NIC/Passport:</span>
                    <span>{guestData.niC_PassportNo || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Section: Location */}
              <div>
                <h3 className="font-bold text-lg border-b pb-1 mb-4">
                  Location Information
                </h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-semibold w-40">Nationality:</span>
                    <span>
                      {getDescriptionByCode(
                        guestData.nationalityCode,
                        guestNationality,
                        "nationalityCode",
                        "description"
                      )}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-40">Country:</span>
                    <span>
                      {getDescriptionByCode(
                        guestData.countryCode,
                        guestCountries,
                        "countryCode",
                        "description"
                      )}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-40">Address:</span>
                    <span>{guestData.address || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="grid grid-cols-2 gap-8 mb-6"
              style={{ marginTop: "3rem" }}
            >
              {/* Section: Contact */}
              <div>
                <h3 className="font-bold text-lg border-b pb-1 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-semibold w-40">Mobile:</span>
                    <span>{guestData.mobile || "N/A"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-40">Telephone:</span>
                    <span>{guestData.telephone || "N/A"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-40">Whatsapp:</span>
                    <span>{guestData.whatsapp || "N/A"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-40">Email:</span>
                    <span>{guestData.email || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Section: Additional */}
              <div>
                <h3 className="font-bold text-lg border-b pb-1 mb-4">
                  Additional Information
                </h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-semibold w-40">Travel Agent:</span>
                    <span>
                      {getDescriptionByCode(
                        guestData.travelAgentCode,
                        travelAgent,
                        "travelAgentCode",
                        "description"
                      )}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-40">Credit Limit:</span>
                    <span>{guestData.creditLimit || "N/A"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-40">Status:</span>
                    <span>{guestData.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons (hidden in print) */}
            <div className="flex gap-4 mt-10 print:hidden">
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Print & Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerPrint;
