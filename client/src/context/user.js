import React, { useState, useEffect, useCallback } from "react";

const UserContext = React.createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);

  const checkSession = () => {
    fetch("http://localhost:5555/check_session", { credentials: "include" })
      .then((r) => r.ok ? r.json() : Promise.reject("Not authorized"))
      .then((data) => {
        const userHospitals = (data.hospitals || []).map(h => ({
          ...h,
          patients: (h.patients || []).filter(p => p.user_id === data.id)
        }));
        const userDepartments = (data.departments || []).map(d => ({
          ...d,
          patients: (d.patients || []).filter(p => p.user_id === data.id)
        }));

        setUser({
          id: data.id,
          name: data.name,
          hospitals: userHospitals,
          departments: userDepartments,
          patients: data.patients || [],
        });

        setHospitals(data.hospitals || []);
        setDepartments(data.departments || []);
      })
      .catch(() => setUser(null));
  };

  const fetchHospitals = useCallback(() => {
    fetch("http://localhost:5555/hospitals", { credentials: "include" })
      .then(r => r.json())
      .then(data => setHospitals(data))
      .catch(err => {
        console.error("Failed to fetch hospitals:", err);
        setHospitals([]);
      });
  }, []);

  const fetchDepartments = useCallback(() => {
    fetch("http://localhost:5555/departments", { credentials: "include" })
      .then(r => r.json())
      .then(data => setDepartments(data))
      .catch(err => {
        console.error("Failed to fetch departments:", err);
        setDepartments([]);
      });
  }, []);

  const addHospitalToUser = (hospital) => {
    setUser(prev => ({
      ...prev,
      hospitals: prev.hospitals?.some(h => h.id === hospital.id) ? prev.hospitals : [...(prev.hospitals || []), hospital]
    }));
    setHospitals(prev => prev.some(h => h.id === hospital.id) ? prev : [...prev, hospital]);
  };

  const addDepartmentToUser = (department) => {
    setUser(prev => ({
      ...prev,
      departments: prev.departments?.some(d => d.id === department.id) ? prev.departments : [...(prev.departments || []), department]
    }));
    setDepartments(prev => prev.some(d => d.id === department.id) ? prev : [...prev, department]);
  };

  const addPatientToUser = (patient) => {
    setUser(prev => {
      const updatedPatients = [...(prev.patients || []), patient];

      const updateArray = (arr, item, key) => {
        const exists = arr.some(a => a.id === item.id);
        return exists ? arr.map(a => a.id === item.id ? { ...a, patients: [...(a.patients || []), patient] } : a)
                      : [...arr, { ...item, patients: [patient] }];
      };

      return {
        ...prev,
        patients: updatedPatients,
        hospitals: updateArray(prev.hospitals, patient.hospital),
        departments: updateArray(prev.departments, patient.department),
      };
    });

    setHospitals(prev => prev.some(h => h.id === patient.hospital.id) ? prev : [...prev, { ...patient.hospital, patients: [] }]);
    setDepartments(prev => prev.some(d => d.id === patient.department.id) ? prev : [...prev, { ...patient.department, patients: [] }]);
  };

  const removePatientFromUser = (patientId) => {
    setUser((prev) => {
      if (!prev) return prev;

      const updatedPatients = prev.patients.filter(p => p.id !== patientId);

      const updatedHospitals = prev.hospitals.filter(h =>
        updatedPatients.some(p => p.hospital.id === h.id)
      );

      const updatedDepartments = prev.departments.filter(d =>
        updatedPatients.some(p => p.department.id === d.id)
      );

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
        user, setUser,
        hospitals, setHospitals,
        departments, setDepartments,
        fetchHospitals, fetchDepartments,
        addHospitalToUser, addDepartmentToUser, addPatientToUser,
        removePatientFromUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserProvider };
