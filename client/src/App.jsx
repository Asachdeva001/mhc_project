import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";
import CameraPage from "./pages/CameraPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Main homepage */}
        <Route
          path="/"
          element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <Hero />
              <Features />
              <Footer />
            </div>
          }
        />

        {/* Standalone camera route */}
        <Route path="/camera" element={<CameraPage />} />
      </Routes>
    </Router>
  );
}
