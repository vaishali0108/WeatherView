import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./Pages/Home";
import History from "./Pages/History";
import './App.css'
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-100">

        {/* 🔗 Navbar */}
        <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-center sm:justify-center gap-2 sm:gap-8 items-center">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "font-bold text-white border-b-4 border-yellow-300 pb-1"
                  : "font-semibold text-white hover:text-yellow-300 transition-colors duration-300"
              }
            >
              Today
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                isActive
                  ? "font-bold text-white border-b-4 border-yellow-300 pb-1"
                  : "font-semibold text-white hover:text-yellow-300 transition-colors duration-300"
              }
            >
              History
            </NavLink>
          </div>
        </nav>

        {/* 🔄 Routes */}
        <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>

        {/* 🔹 Footer */}
        <footer className="py-6 bg-white shadow-inner text-center text-gray-600 text-sm sm:text-base">
          &copy; {new Date().getFullYear()} Weather Dashboard. All rights reserved.
        </footer>

      </div>
    </BrowserRouter>
  );
}

export default App;