import React, { useState, useContext } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { UserContext } from "../context/user";

function Signup() {
  const { setUser } = useContext(UserContext);
  const [serverError, setServerError] = useState(null);

  const signupSchema = yup.object().shape({
    name: yup.string().required("Username is required").max(50),
    password: yup
      .string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      password: "",
    },
    validationSchema: signupSchema,
    onSubmit: (values, { resetForm }) => {
      setServerError(null);
      fetch("http://localhost:5555/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      })
        .then((r) => {
          if (r.ok) return r.json();
          return r.json().then((err) => {
            throw new Error(err.error || "Unable to create user");
          });
        })
        .then((user) => {
          setUser(user);
          resetForm();
        })
        .catch((err) => setServerError(err.message));
    },
  });

  return (
    <div className="container">
      <div className="card">
        <h2>Sign Up</h2>
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

          <button type="submit">Sign Up</button>
        </form>
        {serverError && <p className="error">{serverError}</p>}
      </div>
    </div>
  );
}

export default Signup;
