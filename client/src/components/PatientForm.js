import React, { useContext, useEffect } from "react";
import { UserContext } from "../context/user";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";

function PatientForm() {
  const { user, hospitals, departments, fetchHospitals, fetchDepartments } =
    useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (hospitals.length === 0) fetchHospitals();
      if (departments.length === 0) fetchDepartments();
    }
  }, [user, hospitals, departments, fetchHospitals, fetchDepartments]);

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
        .then((data) => {
          alert(`Patient ${data.name} added!`);
          resetForm();
          navigate("/");
        });
    },
  });

  if (!user) return <p className="container card">Please log in to add patients.</p>;

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
          {formik.errors.date_of_birth && (
            <p className="error">{formik.errors.date_of_birth}</p>
          )}

          <label>
            Hospital:
            <select
              name="hospital_id"
              value={formik.values.hospital_id}
              onChange={formik.handleChange}
            >
              <option value="">Select Hospital</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </label>
          {formik.errors.hospital_id && (
            <p className="error">{formik.errors.hospital_id}</p>
          )}

          <label>
            Department:
            <select
              name="department_id"
              value={formik.values.department_id}
              onChange={formik.handleChange}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          {formik.errors.department_id && (
            <p className="error">{formik.errors.department_id}</p>
          )}

          <button type="submit">Add Patient</button>
          <br />
          <button type="button" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
}

export default PatientForm;
