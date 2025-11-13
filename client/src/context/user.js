import React, { useState, useEffect } from "react";

const UserContext = React.createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);

  const checkSession = () => {
    fetch("http://localhost:5555/check_session", { credentials: "include" })
      .then((r) => {
        if (r.ok) {
          return r.json();
        } else {
          throw new Error("Not authorized");
        }
      })
      .then((data) => {
        setUser({
          id: data.id,
          name: data.name,
          hospitals: data.hospitals || [],
          departments: data.departments || [],
          patients: data.patients || [],
        });
        setHospitals(data.hospitals || []);
        setDepartments(data.departments || []);
      })
      .catch(() => {
        setUser(null);
      });
  };

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

  const addHospitalToUser = (hospital) => {
    setUser((prev) => ({
      ...prev,
      hospitals: prev.hospitals?.some((h) => h.id === hospital.id)
        ? prev.hospitals
        : [...(prev.hospitals || []), hospital],
    }));
  };

  const addDepartmentToUser = (department) => {
    setUser((prev) => ({
      ...prev,
      departments: prev.departments?.some((d) => d.id === department.id)
        ? prev.departments
        : [...(prev.departments || []), department],
    }));
  };

  const addPatientToUser = (patient) => {
    setUser((prev) => {
      const updatedPatients = [...(prev.patients || []), patient];

      const updatedHospitals = prev.hospitals.map((h) => {
        if (h.id === patient.hospital.id) {
          return { ...h, patients: [...(h.patients || []), patient] };
        }
        return h;
      });

      if (!updatedHospitals.some((h) => h.id === patient.hospital.id)) {
        updatedHospitals.push({ ...patient.hospital, patients: [patient] });
      }

      const updatedDepartments = prev.departments.map((d) => {
        if (d.id === patient.department.id) {
          return { ...d, patients: [...(d.patients || []), patient] };
        }
        return d;
      });

      if (!updatedDepartments.some((d) => d.id === patient.department.id)) {
        updatedDepartments.push({ ...patient.department, patients: [patient] });
      }

      return {
        ...prev,
        patients: updatedPatients,
        hospitals: updatedHospitals,
        departments: updatedDepartments,
      };
    });
  };

  useEffect(() => {
    checkSession();
  }, []);

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
        addHospitalToUser,
        addDepartmentToUser,
        addPatientToUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserProvider };
