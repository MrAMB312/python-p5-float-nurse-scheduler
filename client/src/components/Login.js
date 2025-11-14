import React, { useContext } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { UserContext } from "../context/user";

function Login() {
  const { setUser, setHospitals, setDepartments } = useContext(UserContext);

  const loginSchema = yup.object().shape({
    name: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: (values, { resetForm }) => {
      fetch("http://localhost:5555/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      })
        .then((r) => {
          return r.json().then((payload) => {
            if (!r.ok) {
              throw new Error(payload.error || "Login failed");
            }
            return payload;
          });
        })
        .then((data) => {
          setUser({
            id: data.id,
            name: data.name,
            hospitals: data.hospitals || [],
            departments: data.departments || [],
            patients: data.patients || [],
          });
          setHospitals(data.hospitals || []);
          setDepartments(data.departments || []);
          alert(`Logged in as ${data.name}`);
          resetForm();
        })
        .catch((err) => {
          alert(err.message);
        });
    },
  });

  return (
    <div className="container">
      <div className="card">
        <h2>Log In</h2>
        <form onSubmit={formik.handleSubmit}>
          <label>
            Username:
            <input
              name="name"
              type="text"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
          </label>
          {formik.errors.name && <p className="error">{formik.errors.name}</p>}

          <label>
            Password:
            <input
              name="password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
            />
          </label>
          {formik.errors.password && <p className="error">{formik.errors.password}</p>}

          <button type="submit">Log In</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
