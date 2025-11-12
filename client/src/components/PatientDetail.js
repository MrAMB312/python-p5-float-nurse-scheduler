import React, { useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/user";
import { useFormik } from "formik";
import * as yup from "yup";

function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hospitals, departments, patients, setPatients } = useContext(UserContext);
  const [showEditForm, setShowEditForm] = useState(false);

  const patient = patients.find((p) => p.id === parseInt(id));

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate("/");
    }
  };

  const formSchema = yup.object().shape({
    name: yup.string().required("Name is required").max(50),
    date_of_birth: yup.date().required("Date of birth is required"),
    hospital_id: yup.number().required("Hospital is required"),
    department_id: yup.number().required("Department is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      date_of_birth: "",
      hospital_id: "",
      department_id: "",
    },
    validationSchema: formSchema,
    onSubmit: (values) => {
      fetch(`http://localhost:5555/patients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      })
        .then((r) => r.json())
        .then((data) => {
          alert(`Patient updated: ${data.name}`);
          setPatients((prev) =>
            prev.map((p) => (p.id === data.id ? data : p))
          );
          setShowEditForm(false);
        });
    },
  });

  const handleDelete = () => {
    fetch(`http://localhost:5555/patients/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then(() => {
      alert("Patient deleted");
      setPatients((prev) => prev.filter((p) => p.id !== parseInt(id)));
      navigate("/");
    });
  };

  if (!user) return <p className="container card">Please log in to see patient details.</p>;
  if (!patient) return <p className="container card">Patient not found.</p>;

  return (
    <div className="container">
      <div className="card">
        <h2>Patient Details</h2>

        <div>
          <p><strong>Name:</strong> {patient.name}</p>
          <p><strong>Date of Birth:</strong> {patient.date_of_birth}</p>
          <p><strong>Hospital:</strong> {patient.hospital?.name || "N/A"}</p>
          <p><strong>Department:</strong> {patient.department?.name || "N/A"}</p>
        </div>

        <br />
        <hr />

        {!showEditForm && (
          <button onClick={() => setShowEditForm(true)}>Edit Patient</button>
        )}

        {showEditForm && (
          <>
            <h3>Update Patient Info</h3>
            <form onSubmit={formik.handleSubmit}>
              <label>
                Name:
                <input
                  name="name"
                  placeholder="Patient Name"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                />
              </label>
              {formik.errors.name && <p className="error">{formik.errors.name}</p>}

              <label>
                Date of Birth:
                <input
                  name="date_of_birth"
                  type="date"
                  onChange={formik.handleChange}
                  value={formik.values.date_of_birth}
                />
              </label>
              {formik.errors.date_of_birth && <p className="error">{formik.errors.date_of_birth}</p>}

              <label>
                Hospital:
                <select
                  name="hospital_id"
                  onChange={formik.handleChange}
                  value={formik.values.hospital_id}
                >
                  <option value="">Select Hospital</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </label>
              {formik.errors.hospital_id && <p className="error">{formik.errors.hospital_id}</p>}

              <label>
                Department:
                <select
                  name="department_id"
                  onChange={formik.handleChange}
                  value={formik.values.department_id}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </label>
              {formik.errors.department_id && <p className="error">{formik.errors.department_id}</p>}

              <button type="submit">Update</button>
              <br />
              <button onClick={() => setShowEditForm(false)}>Cancel Edit</button>
            </form>
          </>
        )}

        <br />
        <button onClick={handleDelete}>Delete Patient</button>
        <br />
        <button onClick={handleBack}>Back</button>
      </div>
    </div>
  );
}

export default PatientDetail;
