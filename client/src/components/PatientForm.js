import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/user";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";

function PatientForm() {
  const {
    user,
    hospitals,
    departments,
    fetchHospitals,
    fetchDepartments,
    addPatientToUser,
    addHospitalToUser,
    addDepartmentToUser,
  } = useContext(UserContext);

  const navigate = useNavigate();

  const [showHospitalForm, setShowHospitalForm] = useState(false);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [newHospitalName, setNewHospitalName] = useState("");
  const [newHospitalPhone, setNewHospitalPhone] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");

  // Load global dropdown options if empty
  useEffect(() => {
    if (!hospitals.length) fetchHospitals();
    if (!departments.length) fetchDepartments();
  }, [hospitals.length, departments.length, fetchHospitals, fetchDepartments]);

  const formSchema = yup.object().shape({
    name: yup.string().required("Name is required").max(50),
    date_of_birth: yup.date().required("Date of birth is required"),
    hospital_id: yup.string().required("Hospital is required"),
    department_id: yup.string().required("Department is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      date_of_birth: "",
      hospital_id: "",
      department_id: "",
    },
    validationSchema: formSchema,
    onSubmit: (values, { resetForm }) => {
      fetch("http://localhost:5555/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      })
        .then((r) => r.json())
        .then((newPatient) => {
          alert(`Patient ${newPatient.name} added!`);
          // Add patient to user-specific arrays
          addPatientToUser(newPatient);
          // Ensure hospital/department exist in global arrays (for dropdowns)
          addHospitalToUser(newPatient.hospital);
          addDepartmentToUser(newPatient.department);
          resetForm();
          navigate("/");
        })
        .catch((err) => console.error("Failed to add patient:", err));
    },
  });

  const handleAddHospital = () => {
    fetch("http://localhost:5555/hospitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: newHospitalName, phone_number: newHospitalPhone }),
    })
      .then((r) => r.json())
      .then((h) => {
        alert(`Hospital "${h.name}" added!`);
        setNewHospitalName("");
        setNewHospitalPhone("");
        setShowHospitalForm(false);
        formik.setFieldValue("hospital_id", h.id);
        addHospitalToUser(h); // sync global and user arrays
      })
      .catch((err) => console.error(err));
  };

  const handleAddDepartment = () => {
    fetch("http://localhost:5555/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: newDepartmentName }),
    })
      .then((r) => r.json())
      .then((d) => {
        alert(`Department "${d.name}" added!`);
        setNewDepartmentName("");
        setShowDepartmentForm(false);
        formik.setFieldValue("department_id", d.id);
        addDepartmentToUser(d); // sync global and user arrays
      })
      .catch((err) => console.error(err));
  };

  if (!user) return (
    <div className="container">
      <div className="card">
        <p>Please log in to add patients.</p>
        <button type="button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="card">
        <h2>Add Patient</h2>
        <form onSubmit={formik.handleSubmit}>
          <label>
            Name:
            <input
              name="name"
              type="text"
              placeholder="Patient Name"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
          </label>
          {formik.errors.name && <p className="error">{formik.errors.name}</p>}

          <label>
            Date of Birth:
            <input
              name="date_of_birth"
              type="date"
              value={formik.values.date_of_birth}
              onChange={formik.handleChange}
            />
          </label>
          {formik.errors.date_of_birth && <p className="error">{formik.errors.date_of_birth}</p>}

          <label>
            Hospital:
            {showHospitalForm ? (
              <div className="inline-form">
                <input
                  placeholder="Hospital Name"
                  value={newHospitalName}
                  onChange={(e) => setNewHospitalName(e.target.value)}
                />
                <input
                  placeholder="Phone Number"
                  value={newHospitalPhone}
                  onChange={(e) => setNewHospitalPhone(e.target.value)}
                />
                <button type="button" onClick={handleAddHospital}>Save Hospital</button>
              </div>
            ) : (
              <select
                name="hospital_id"
                value={formik.values.hospital_id}
                onChange={formik.handleChange}
              >
                <option value="">Select Hospital</option>
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            )}
            <button type="button" onClick={() => setShowHospitalForm(!showHospitalForm)}>
              {showHospitalForm ? "Cancel" : "Add New Hospital"}
            </button>
          </label>
          {formik.errors.hospital_id && <p className="error">{formik.errors.hospital_id}</p>}

          <label>
            Department:
            {showDepartmentForm ? (
              <div className="inline-form">
                <input
                  placeholder="Department Name"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                />
                <button type="button" onClick={handleAddDepartment}>Save Department</button>
              </div>
            ) : (
              <select
                name="department_id"
                value={formik.values.department_id}
                onChange={formik.handleChange}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            )}
            <button type="button" onClick={() => setShowDepartmentForm(!showDepartmentForm)}>
              {showDepartmentForm ? "Cancel" : "Add New Department"}
            </button>
          </label>
          {formik.errors.department_id && <p className="error">{formik.errors.department_id}</p>}

          <br />
          <button type="submit">Add Patient</button>
          <br />
          <button type="button" onClick={() => navigate("/")}>Back to Home</button>
        </form>
      </div>
    </div>
  );
}

export default PatientForm;
