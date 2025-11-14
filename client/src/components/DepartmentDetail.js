import React, { useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/user";

function DepartmentDetail() {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const departmentId = parseInt(id);

  if (!user) return (
    <div className="container">
      <div className="card">
        <p>Please log in to see department details.</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    </div>
  );

  const department = (user.departments || []).find(d => d.id === departmentId);
  
  if (!department) return (
    <div className="container">
      <div className="card">
        <p>Department not found.</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    </div>
  );
  
  const patients = (user.patients || []).filter(p => p.department.id === departmentId);

  return (
    <div className="container">
      <div className="card">
        <h2>Patients Managed by Department of {department.name}</h2>
        {patients.length ? (
          <ul>
            {patients.map(p => (
              <li key={p.id}>
                <Link to={`/patients/${p.id}`} state={{ from: `/departments/${id}` }}>
                  {p.name} ({p.date_of_birth})
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No patients found for this department.</p>
        )}
        <button onClick={() => navigate("/departments")}>Back to Departments</button>
      </div>
    </div>
  );
}

export default DepartmentDetail;
