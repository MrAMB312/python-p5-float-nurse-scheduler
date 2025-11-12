import React, { useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/user";

function DepartmentDetail() {
  const { id } = useParams();
  const { user, departments } = useContext(UserContext);
  const navigate = useNavigate();

  if (!user) return <p className="container card">Please log in to see patients.</p>;

  const department = (departments || []).find((d) => d.id === parseInt(id));

  if (!department) return <p className="container card">Department not found.</p>;

  const patients = department.patients || [];

  return (
    <div className="container">
      <div className="card">
        <h2>Patients Managed by Department of {department.name}</h2>

        {patients.length ? (
          <ul>
            {patients.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/patients/${p.id}`}
                  state={{ from: `/departments/${id}` }}
                >
                  {p.name} ({p.date_of_birth})
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No patients found for this department.</p>
        )}

        <button type="button" onClick={() => navigate("/departments")}>
          Back to Departments
        </button>
      </div>
    </div>
  );
}

export default DepartmentDetail;
