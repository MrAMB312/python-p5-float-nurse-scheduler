import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/user";

function Hospitals() {
  const { user, fetchHospitals } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => { if (user) fetchHospitals(); }, [user, fetchHospitals]);

  if (!user) return (
    <div className="container">
      <div className="card">
        <p>Please log in to see hospitals.</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    </div>
  );

  const userHospitals = Array.from(
    new Map((user.patients || []).map(p => [p.hospital.id, p.hospital])).values()
  );

  return (
    <div className="container">
      <div className="card">
        <h2>Hospitals</h2>
        <ul>
          {userHospitals.length ? (
            userHospitals.map(h => (
              <li key={h.id}>
                <Link to={`/hospitals/${h.id}`}>{h.name}</Link>
              </li>
            ))
          ) : (
            <li>No hospitals found for your patients.</li>
          )}
        </ul>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    </div>
  );
}

export default Hospitals;
