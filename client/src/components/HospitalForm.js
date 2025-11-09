import React, { useContext } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/user";

function HospitalForm() {
  const { fetchHospitals } = useContext(UserContext);
  const navigate = useNavigate();

  const formSchema = yup.object().shape({
    name: yup.string().required("Hospital name is required").max(100),
    phone_number: yup
      .string()
      .required("Phone number is required")
      .transform((value) => value.replace(/\D/g, ""))
      .matches(/^\d{10}$/, "Phone number must be 10 digits"),
  });

  const formik = useFormik({
    initialValues: { name: "", phone_number: "" },
    validationSchema: formSchema,
    onSubmit: (values, { resetForm }) => {
      const cleanValues = {
        ...values,
        phone_number: values.phone_number.replace(/\D/g, ""),
      };

      fetch("http://localhost:5555/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(cleanValues),
      })
        .then((r) => {
          if (!r.ok) throw new Error("Failed to add hospital");
          return r.json();
        })
        .then((data) => {
          alert(`Hospital "${data.name}" added!`);
          fetchHospitals();
          resetForm();
          navigate("/hospitals");
        })
        .catch((err) => alert(err.message));
    },
  });

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10);

    let formatted = value;
    if (value.length > 6) {
      formatted = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
    } else if (value.length > 3) {
      formatted = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else if (value.length > 0) {
      formatted = `(${value}`;
    }

    formik.setFieldValue("phone_number", formatted);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <h2>Add Hospital</h2>

      <label>
        Name:
        <input
          name="name"
          placeholder="Hospital Name"
          value={formik.values.name}
          onChange={formik.handleChange}
        />
      </label>
      {formik.errors.name && <p className="error">{formik.errors.name}</p>}

      <label>
        Phone Number:
        <input
          name="phone_number"
          value={formik.values.phone_number}
          onChange={handlePhoneChange}
          placeholder="(123) 456-7890"
        />
      </label>
      {formik.errors.phone_number && <p className="error">{formik.errors.phone_number}</p>}

      <button type="submit">Add Hospital</button>
      <br />
      <button type="button" onClick={() => navigate("/")}>
        Back to Home
      </button>
    </form>
  );
}

export default HospitalForm;
