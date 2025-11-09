import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "../context/user";
import Home from "./Home";
import PatientForm from "./PatientForm";
import PatientDetail from "./PatientDetail";
import Hospitals from "./Hospitals";
import HospitalForm from "./HospitalForm";
import HospitalDetail from "./HospitalDetail";
import Departments from "./Departments";
import DepartmentForm from "./DepartmentForm";
import DepartmentDetail from "./DepartmentDetail";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-patient" element={<PatientForm />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/add-hospital" element={<HospitalForm />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/hospitals/:id" element={<HospitalDetail />} />
          <Route path="/add-department" element={<DepartmentForm />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/departments/:id" element={<DepartmentDetail />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
