import React, { useContext } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { UserContext } from "../context/user";

function Login() {
  const { setUser } = useContext(UserContext);

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
        .then((r) => r.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            setUser(data);
            alert(`Logged in as ${data.name}`);
            resetForm();
          }
        })
        .catch((err) => console.error(err));
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
