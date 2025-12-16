import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import About from "./pages/About";
import Instructors from "./pages/Instructors";
import InstructorDetail from "./pages/InstructorDetail";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute"; // import PrivateRoute
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Courses />} />
            <Route path="/courses" element={<Courses />} />

            {/* Protected CourseDetail route */}
            <Route 
              path="/course/:id" 
              element={
                <PrivateRoute>
                  <CourseDetail />
                </PrivateRoute>
              } 
            />

            <Route path="/about" element={<About />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/instructor/:id" element={<InstructorDetail />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
