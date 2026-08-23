import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import About from "./pages/About";
import Help from "./pages/Help";
import Instructors from "./pages/Instructors";
import InstructorDetail from "./pages/InstructorDetail";
import Login from "./pages/Login";
import InstructorSignup from "./pages/InstructorSignup";

import PrivateRoute from "./components/PrivateRoute";

import InstructorDashboard from "./pages/InstructorDashboard";
import LearnerDashboard from "./pages/LearnerDashboard";
import LearnerCourse from "./pages/LearnerCourse";
import InstructorCourse from "./pages/InstructorCourse";

import TestPage from "./pages/Test/TestPage";
import TestResult from "./pages/Test/TestResult";

import AdminDashboard from "./pages/AdminDashboard";

import Landing from "./pages/Landing";

import "./App.css";

function App() {
  return (
    <Router>
      {/* Always return to the top when changing pages */}
      <ScrollToTop />

      <div className="app-container">
        <Header />

        <main className="main-content">
          <Routes>
            {/* Landing */}
            <Route path="/" element={<Landing />} />

            {/* Public pages */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/about" element={<About />} />
            <Route path="/help" element={<Help />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/instructor/:id" element={<InstructorDetail />} />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<InstructorSignup />} />

            {/* Protected Course Detail */}
            <Route
              path="/courses/:id"
              element={
                <PrivateRoute>
                  <CourseDetail />
                </PrivateRoute>
              }
            />

            {/* Instructor Course */}
            <Route
              path="/instructor/courses/:id"
              element={
                <PrivateRoute role="INSTRUCTOR">
                  <InstructorCourse />
                </PrivateRoute>
              }
            />

            {/* Instructor Dashboard */}
            <Route
              path="/instructor/dashboard"
              element={
                <PrivateRoute role="INSTRUCTOR">
                  <InstructorDashboard />
                </PrivateRoute>
              }
            />

            {/* Learner Dashboard */}
            <Route
              path="/learner/dashboard"
              element={
                <PrivateRoute role="LEARNER">
                  <LearnerDashboard />
                </PrivateRoute>
              }
            />

            {/* Learner Course */}
            <Route
              path="/learner/courses/:id"
              element={
                <PrivateRoute role="LEARNER">
                  <LearnerCourse />
                </PrivateRoute>
              }
            />

            {/* Tests */}
            <Route path="/tests/:testId" element={<TestPage />} />

            <Route path="/tests/result/:attemptId" element={<TestResult />} />

            {/* Admin Dashboard */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
