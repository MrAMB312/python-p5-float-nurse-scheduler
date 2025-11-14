import React, { useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/user";

function HospitalDetail() {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const hospitalId = parseInt(id);

  if (!user) return (
    <div className="container">
      <div className="card">
        <p>Please log in to see hospital details.</p>
        <button type="button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>
  )

  const hospital = (user.hospitals || []).find(h => h.id === hospitalId);

  if (!hospital) return (
    <div className="container">
      <div className="card">
        <p>Hospital not found.</p>
        <button type="button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>
  )

  const patients = (user.patients || []).filter(p => p.hospital.id === hospital.id);

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
