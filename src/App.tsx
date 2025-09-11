import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Rooms from "./pages/Dashboard/Master/Rooms";
import Banquets from "./pages/Dashboard/Master/Banquets";
import RoomTypes from "./pages/Dashboard/Master/RoomTypes";
import EventTypes from "./pages/Dashboard/Master/EventTypes";
import PackageInfo from "./pages/Dashboard/Master/PackageInfo";
import ServiceTypes from "./pages/Dashboard/Master/ServiceTypes";
import SetupStyleTypes from "./pages/Dashboard/Master/SetupStyleTypes";
import TravelAgent from "./pages/Dashboard/Master/TravelAgent";
import GuestInfo from "./pages/Dashboard/GuestInfo";
import InOut from "./pages/Dashboard/InOut";
import RoomReservation from "./pages/Dashboard/RoomReservation";
import BanquetReservation from "./pages/Dashboard/BanquetReservation";
import Calendar from "./pages/Dashboard/Calendar";

// Print Routes
import Print from "./pages/Prints/CustomerPrint";

// PrivateRoute to protect dashboard routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("authToken");

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Base route redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Auth Layout */}
          <Route path="/login" element={<SignIn />} />

          {/* Protected Dashboard Layout */}
          <Route
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Home />} />
            {/* Master Entries */}
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/banquets" element={<Banquets />} />
            <Route path="/room-types" element={<RoomTypes />} />
            <Route path="/event-types" element={<EventTypes />} />
            <Route path="/package-info" element={<PackageInfo />} />
            <Route path="/service-types" element={<ServiceTypes />} />
            <Route path="/setup-styles" element={<SetupStyleTypes />} />
            <Route path="/travel-agent" element={<TravelAgent />} />

            {/* Dashboard Pages */}
            <Route path="/guest-info" element={<GuestInfo />} />
            <Route path="/in-out" element={<InOut />} />
            <Route path="/room-reservation" element={<RoomReservation />} />
            <Route
              path="/banquet-reservation"
              element={<BanquetReservation />}
            />
            <Route path="/calendar" element={<Calendar />} />
          </Route>

          {/* Print */}
          <Route path="/customer-print" element={<Print />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
