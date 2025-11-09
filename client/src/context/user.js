import React, { useState, useEffect } from "react";

const UserContext = React.createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);

  const fetchHospitals = () => {
    fetch("http://localhost:5555/hospitals", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setHospitals(data))
      .catch((err) => console.error("Failed to fetch hospitals:", err));
  };

  const fetchDepartments = () => {
    fetch("http://localhost:5555/departments", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setDepartments(data))
      .catch((err) => console.error("Failed to fetch departments:", err));
  };

  useEffect(() => {
    if (user) {
      fetchHospitals();
      fetchDepartments();
    } else {
      setHospitals([]);
      setDepartments([]);
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
        fetchHospitals,
        fetchDepartments,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserProvider };
