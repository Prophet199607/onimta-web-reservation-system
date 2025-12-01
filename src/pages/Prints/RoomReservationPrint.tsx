import { showErrorToast } from "../../components/alert/ToastAlert";

interface ReservationRow {
  roomType: string;
  roomCode: string;
  roomDescription: string;
  packageCode: string;
  packageName: string;
  roomPrice: string;
  noOfDays: string;
  amount: string;
}

interface PaymentRow {
  paymentType: string;
  paymentAmount: string;
  paymentRef: string;
  paymentDate: string;
}

interface RoomType {
  roomTypeCode: string;
  description: string;
}

interface PrintData {
  // Form data
  formData: {
    name: string;
    reservationNo: string;
    [key: string]: any;
  };
  // Dates
  reservationDate: string;
  checkInDate: string;
  checkOutDate: string;
  checkInTime: string;
  checkOutTime: string;
  // Tables
  reservationRows: ReservationRow[];
  paymentRows: PaymentRow[];
  // Lookup data
  roomTypes: RoomType[];
  // API response data
  reservationData?: any;
}

// Generate receipt number
const generateReceiptNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${timestamp.slice(-6)}${random}`;
};

// Format time to 12-hour format
const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes}:00${ampm}`;
};

const optimizedStyles = `
  @page {
    margin: 0;
    size: A4;
  }
  @media print {
    @page {
      margin: 0 !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      height: auto !important;
      overflow: visible !important;
    }
  }
  body { 
    font-family: Arial, sans-serif; 
    margin: 20px; 
    line-height: 1.4;
    font-size: 14px;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
  .header { 
    text-align: center; 
    margin-top: 30px;
    margin-bottom: 30px;
    border-bottom: 2px solid #333;
    padding-bottom: 15px;
  }
  .info-grid {
    display: flex;
    justify-content: space-between; 
    align-items: flex-start;
    gap: 20px; 
  }
  .info-column {
    flex: 1; 
    display: flex;
    flex-direction: column;
  }
  .info-column:first-child .info-row .value {
    text-align: left;
  }
  .info-column:last-child .info-row .value {
    text-align: right;
  }
  .resort-name {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
  }
  .resort-address {
    font-size: 12px;
    color: #666;
    margin-bottom: 5px;
  }
  .receipt-title {
    font-size: 18px;
    font-weight: bold;
    margin-top: 15px;
    color: #333;
  }
  .info-section {
    margin-bottom: 20px;
  }
  .info-row { 
    display: flex; 
    justify-content: space-between;
    margin-bottom: 8px;
    padding-bottom: 4px;
  }
  .info-row:last-child {
    border-bottom: none;
  }
  .label { 
    font-weight: bold; 
    color: #333;
    width: 150px;
  }
  .value { 
    color: #666;
    text-align: right;
    flex: 1;
  }
  .payment-section {
    margin-top: 30px;
    border-top: 2px solid #333;
    padding-top: 15px;
  }
  .payment-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  .payment-table th,
  .payment-table td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
  }
  .payment-table th {
    background-color: #f5f5f5;
    font-weight: bold;
  }
  .footer {
    margin-top: 30px;
    text-align: center;
    font-style: italic;
    color: #666;
    font-size: 12px;
  }
`;

export const handlePrintReceipt = (printData: PrintData): void => {
  try {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) {
      showErrorToast(
        "Unable to open print window. Please check your browser settings."
      );
      return;
    }

    // Pre-calculate all data to avoid DOM operations during rendering
    const receiptNumber = generateReceiptNumber();
    const receiptDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    const totalAmount = printData.paymentRows.reduce((total, row) => {
      return total + (parseFloat(row.paymentAmount) || 0);
    }, 0);

    const paymentType = printData.paymentRows[0]?.paymentType || "";
    const checkInFormatted = new Date(
      printData.checkInDate
    ).toLocaleDateString();
    const checkOutFormatted = new Date(
      printData.checkOutDate
    ).toLocaleDateString();
    const checkInTimeFormatted = formatTime(printData.checkInTime);
    const checkOutTimeFormatted = formatTime(printData.checkOutTime);
    const reservationNumber =
      printData.reservationData?.reservationNo ||
      printData.formData.reservationNo ||
      "N/A";
    const guestName = printData.formData.name || "N/A";
    const formattedReservationDate = new Date(
      printData.reservationDate
    ).toLocaleDateString();

    // Create optimized HTML content
    const printContent = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt - Farm Villa Resort</title>
        <style>${optimizedStyles}</style>
      </head>
      <body>
        <div class="header">
          <div class="resort-name">FARM VILLA RESORT</div>
          <div class="resort-address">Akkara 20, Sellakaragama, Kataragama</div>
          <div class="resort-address">Tel:- 0703333533</div>
          <div class="receipt-title">RECEIPT</div>
        </div>
        
        <div class="info-section">
          <div class="info-grid">
            <div class="info-column">
              <div class="info-row">
                <div class="label">Reservation No</div>
                <div class="value">${reservationNumber}</div>
              </div>
              <div class="info-row">
                <div class="label">Reservation Date</div>
                <div class="value">${formattedReservationDate}</div>
              </div>
              <div class="info-row">
                <div class="label">Reservation Type</div>
                <div class="value">ROOM</div>
              </div>
              <div class="info-row">
                <div class="label">Check In</div>
                <div class="value">${checkInFormatted} ${checkInTimeFormatted}</div>
              </div>
              <div class="info-row">
                <div class="label">Guest Name</div>
                <div class="value">${guestName}</div>
              </div>
            </div>
            
            <div class="info-column">
              <div class="info-row">
                <div class="label">Receipt</div>
                <div class="value">${receiptNumber}</div>
              </div>
              <div class="info-row">
                <div class="label">Receipt Date</div>
                <div class="value">${receiptDate}</div>
              </div>
              <div class="info-row">
                <div class="label">Event Type</div>
                <div class="value"></div>
              </div>
              <div class="info-row">
                <div class="label">Check Out</div>
                <div class="value">${checkOutFormatted} ${checkOutTimeFormatted}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="payment-section">
          <table class="payment-table">
            <thead>
              <tr>
                <th>Receipt Date</th>
                <th>Receipt No</th>
                <th>Amount</th>
                <th>Payment Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${receiptDate}</td>
                <td>${receiptNumber}</td>
                <td>${totalAmount.toLocaleString()}.00</td>
                <td>${paymentType}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>ALL CHEQUE ARE SUBJECT TO REALISATION</p>
          <p>Generated on: ${receiptDate} at ${currentTime}</p>
        </div>
      </body>
      </html>
    `;

    // Write content
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Focus and print after content loads
    printWindow.addEventListener("load", () => {
      printWindow.focus();

      try {
        // Trigger print
        printWindow.print();
      } catch (err) {
        console.warn("Print failed:", err);
      }

      // Close window safely after print finishes
      const closePrintWindow = () => {
        if (!printWindow.closed) {
          printWindow.close();
        }
      };

      // onafterprint may not fire in all browsers, so use fallback
      if ("onafterprint" in printWindow) {
        printWindow.onafterprint = closePrintWindow;
      } else {
        // Fallback: close after short timeout
        setTimeout(closePrintWindow, 1000);
      }
    });
  } catch (error) {
    console.error("Receipt print error:", error);
    showErrorToast("Failed to print receipt");
  }
};
