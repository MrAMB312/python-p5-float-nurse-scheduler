import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/user";
import { useFormik } from "formik";
import * as yup from "yup";

function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const [patient, setPatient] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

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
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      date_of_birth: "",
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

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5555/patients/${id}`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((data) => {
          setPatient(data);
          formik.setValues({
            name: data.name || "",
            date_of_birth: data.date_of_birth || "",
          });
        });
    }
  }, [id, user, formik]);

  const handleDelete = () => {
    fetch(`http://localhost:5555/patients/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then(() => {
      alert("Patient deleted");
      navigate("/");
    });
  };

  if (!user) return <p className="container card">Please log in to see patient details.</p>;
  if (!patient) return <p className="container card">Loading patient data...</p>;

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
