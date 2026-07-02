import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedLayout from "./components/ProtectedLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PatientDoctors from "./pages/PatientDoctors";
import PatientDoctorDetail from "./pages/PatientDoctorDetail";
import PatientAppointments from "./pages/PatientAppointments";
import DoctorProfile from "./pages/DoctorProfile";
import DoctorAvailability from "./pages/DoctorAvailability";
import DoctorAppointments from "./pages/DoctorAppointments";
import AdminDoctors from "./pages/AdminDoctors";
import PatientMedicalRecord from "./pages/PatientMedicalRecord";
import DoctorPatients from "./pages/DoctorPatients";
import DoctorPatientRecord from "./pages/DoctorPatientRecord";
import PatientMessages from "./pages/PatientMessages";
import DoctorMessages from "./pages/DoctorMessages";
import PatientAIAssistant from "./pages/PatientAIAssistant";
import PatientAIHistory from "./pages/PatientAIHistory";
import Teleconsultation from "./pages/Teleconsultation";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Chargement...</div>;
  return user ? children : <Navigate to="/login" />;
};

const RoleRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Chargement...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== role && user.role !== "ADMIN") return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes — all share the same sidebar layout */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        {/* Patient */}
        <Route
          path="/patient/doctors"
          element={
            <RoleRoute role="PATIENT">
              <ProtectedLayout>
                <PatientDoctors />
              </ProtectedLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/patient/doctors/:id"
          element={
            <RoleRoute role="PATIENT">
              <ProtectedLayout>
                <PatientDoctorDetail />
              </ProtectedLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <RoleRoute role="PATIENT">
              <ProtectedLayout>
                <PatientAppointments />
              </ProtectedLayout>
            </RoleRoute>
          }
        />

        {/* Patient - Dossier médical */}
        <Route
          path="/patient/medical-record"
          element={
            <RoleRoute role="PATIENT">
              <ProtectedLayout>
                <PatientMedicalRecord />
              </ProtectedLayout>
            </RoleRoute>
          }
        />

        {/* Patient - Assistant IA */}
        <Route
          path="/patient/ai-assistant"
          element={
            <RoleRoute role="PATIENT">
              <ProtectedLayout>
                <PatientAIAssistant />
              </ProtectedLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/patient/ai-history"
          element={
            <RoleRoute role="PATIENT">
              <ProtectedLayout>
                <PatientAIHistory />
              </ProtectedLayout>
            </RoleRoute>
          }
        />

        {/* Patient - Messagerie */}
        <Route
          path="/patient/messages"
          element={
            <RoleRoute role="PATIENT">
              <ProtectedLayout>
                <PatientMessages />
              </ProtectedLayout>
            </RoleRoute>
          }
        />

        {/* Doctor */}
        <Route
          path="/doctor/profile"
          element={
            <RoleRoute role="DOCTOR">
              <ProtectedLayout>
                <DoctorProfile />
              </ProtectedLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/doctor/availability"
          element={
            <RoleRoute role="DOCTOR">
              <ProtectedLayout>
                <DoctorAvailability />
              </ProtectedLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <RoleRoute role="DOCTOR">
              <ProtectedLayout>
                <DoctorAppointments />
              </ProtectedLayout>
            </RoleRoute>
          }
        />

        {/* Doctor - Messagerie */}
        <Route
          path="/doctor/messages"
          element={
            <RoleRoute role="DOCTOR">
              <ProtectedLayout>
                <DoctorMessages />
              </ProtectedLayout>
            </RoleRoute>
          }
        />

        {/* Doctor - Patients */}
        <Route
          path="/doctor/patients"
          element={
            <RoleRoute role="DOCTOR">
              <ProtectedLayout>
                <DoctorPatients />
              </ProtectedLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/doctor/patients/:patientId/medical-record"
          element={
            <RoleRoute role="DOCTOR">
              <ProtectedLayout>
                <DoctorPatientRecord />
              </ProtectedLayout>
            </RoleRoute>
          }
        />

        {/* Téléconsultation (patient + médecin) */}
        <Route
          path="/teleconsultation/:appointmentId"
          element={
            <PrivateRoute>
              <ProtectedLayout>
                <Teleconsultation />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/doctors"
          element={
            <RoleRoute role="ADMIN">
              <ProtectedLayout>
                <AdminDoctors />
              </ProtectedLayout>
            </RoleRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;