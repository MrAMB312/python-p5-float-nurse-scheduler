import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/user";
import { useFormik } from "formik";
import * as yup from "yup";

function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hospitals, departments } = useContext(UserContext);
  
  const [patient, setPatient] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5555/patients/${id}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Patient not found");
        return r.json();
      })
      .then((data) => setPatient(data))
      .catch((err) => {
        console.error(err);
        setPatient(null);
      });
    }
  }, [id, user]);
  
  const formSchema = yup.object().shape({
    name: yup.string().required("Name is required").max(50),
    date_of_birth: yup.date().required("Date of birth is required"),
    hospital_id: yup.number().required("Hospital is required"),
    department_id: yup.number().required("Department is required"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: patient?.name || "",
      date_of_birth: patient?.date_of_birth || "",
      hospital_id: patient?.hospital?.id || "",
      department_id: patient?.department?.id || "",
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
          setPatient(data);
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
      navigate("/");
    });
  };

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate("/");
    }
  };

  if (!user) return (
    <div className="container">
      <div className="card">
        <p>Please log in to see patient details.</p>
        <button type="button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>
  )

  if (!patient) return (
    <div className="container">
      <div className="card">
        <p>Patient not found.</p>
        <button type="button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>
  )

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
