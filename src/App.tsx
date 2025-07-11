import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import RoomTypes from "./pages/Dashboard/RoomTypes";
import EventTypes from "./pages/Dashboard/EventTypes";
import PackageInfo from "./pages/Dashboard/PackageInfo";
import ServiceTypes from "./pages/Dashboard/ServiceTypes";
import SetupStyleTypes from "./pages/Dashboard/SetupStyleTypes";
import TravelAgent from "./pages/Dashboard/TravelAgent";
import GuestInfo from "./pages/Dashboard/GuestInfo";
import InOut from "./pages/Dashboard/InOut";
import RoomReservation from "./pages/Dashboard/RoomReservation";
import BanquetReservation from "./pages/Dashboard/BanquetReservation";
import Calendar from "./pages/Dashboard/Calendar";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Auth Layout */}
          <Route path="/" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/dashboard" element={<Home />} />
            {/* Master Entries */}
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

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
