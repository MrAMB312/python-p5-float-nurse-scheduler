import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/user";

function Hospitals() {
  const { user, hospitals, fetchHospitals } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && hospitals.length === 0) {
      fetchHospitals();
    }
  }, [user, hospitals, fetchHospitals]);

  if (!user) return <p className="container card">Please log in to see hospitals.</p>;

  return (
    <div className="container">
      <div className="card">
        <h2>Hospitals</h2>
        <ul>
          {hospitals.length ? (
            hospitals.map((h) => (
              <li key={h.id}>
                <Link to={`/hospitals/${h.id}`}>{h.name}</Link>
              </li>
            ))
          ) : (
            <li>No hospitals found.</li>
          )}
        </ul>
        <button type="button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default Hospitals;
