import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/user";

function Departments() {
  const { user, departments, fetchDepartments } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && departments.length === 0) {
      fetchDepartments();
    }
  }, [user, departments, fetchDepartments]);

  if (!user) return <p className="container card">Please log in to see departments.</p>;

  return (
    <div className="container">
      <div className="card">
        <h2>Departments</h2>
        <ul>
          {departments.length ? (
            departments.map((d) => (
              <li key={d.id}>
                <Link to={`/departments/${d.id}`}>{d.name}</Link>
              </li>
            ))
          ) : (
            <li>No departments found.</li>
          )}
        </ul>
        <button type="button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default Departments;
