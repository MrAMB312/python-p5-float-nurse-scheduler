import React, { useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/user";

function HospitalDetail() {
  const { id } = useParams();
  const { user, hospitals } = useContext(UserContext);
  const navigate = useNavigate();

  if (!user) return <p className="container card">Please log in to see patients.</p>;

  const hospital = (hospitals || []).find((h) => h.id === parseInt(id));

  if (!hospital) return <p className="container card">Hospital not found.</p>;

  const patients = hospital.patients || [];

  return (
    <div className="container">
      <div className="card">
        <h2>Patients Admitted to {hospital.name}</h2>
        {hospital.phone_number && (
          <p>
            <strong>Hospital Phone Number:</strong> {hospital.phone_number}
          </p>
        )}
        <br />
        {patients.length ? (
          <ul>
            {patients.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/patients/${p.id}`}
                  state={{ from: `/hospitals/${id}` }}
                >
                  {p.name} ({p.date_of_birth})
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No patients found for this hospital.</p>
        )}
        <button type="button" onClick={() => navigate("/hospitals")}>
          Back to Hospitals
        </button>
      </div>
    </div>
  );
}

export default HospitalDetail;
