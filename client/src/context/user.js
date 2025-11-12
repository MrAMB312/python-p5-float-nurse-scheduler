import React, { useState, useEffect } from "react";

const UserContext = React.createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [patients, setPatients] = useState([]);

  const fetchHospitals = () => {
    fetch("http://localhost:5555/hospitals", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setHospitals(data))
      .catch((err) => {
        console.error("Failed to fetch hospitals:", err);
        setHospitals([]);
      });
  };

  const fetchDepartments = () => {
    fetch("http://localhost:5555/departments", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setDepartments(data))
      .catch((err) => {
        console.error("Failed to fetch departments:", err)
        setDepartments([])
      });
  };

  const fetchPatients = () => {
  fetch("http://localhost:5555/patients", { credentials: "include" })
    .then(r => r.json())
    .then(data => setPatients(data))
    .catch((err) => {
      console.error("Failed to fetch patients:", err)
      setPatients([])
    });
};


  useEffect(() => {
    if (user) {
      fetchHospitals();
      fetchDepartments();
      fetchPatients();
    } else {
      setHospitals([]);
      setDepartments([]);
      setPatients([])
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        hospitals,
        setHospitals,
        departments,
        setDepartments,
        patients,
        setPatients,
        fetchHospitals,
        fetchDepartments,
        fetchPatients,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserProvider };
