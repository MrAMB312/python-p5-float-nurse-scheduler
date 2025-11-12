import React, { useContext } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/user";

function DepartmentForm() {

  const { fetchDepartments } = useContext(UserContext);
  const navigate = useNavigate();

  const formSchema = yup.object().shape({
    name: yup.string().required("Department name is required").max(100),
  });

  const formik = useFormik({
    initialValues: { name: "" },
    validationSchema: formSchema,
    onSubmit: (values, { resetForm }) => {
      fetch("http://localhost:5555/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      })
        .then(r => {
          if (!r.ok) throw new Error("Failed to add department");
          return r.json();
        })
        .then(data => {
          alert(`Department "${data.name}" added!`);
          fetchDepartments();
          resetForm();
          navigate("/departments");
        })
        .catch(err => alert(err.message));
    },
  });

  return (
    <div className="container">
      <div className="card">
        <form onSubmit={formik.handleSubmit}>
          <h2>Add Department</h2>
          
          <label>
            Name:
            <input
              name="name"
              placeholder="Department Name"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
          </label>
          {formik.errors.name && <p className="error">{formik.errors.name}</p>}

          <button type="submit">Add Department</button>
          <br />
          <button type="button" onClick={() => navigate("/")}>Back to Home</button>
        </form>
      </div>
    </div>
  );
}

export default DepartmentForm;
