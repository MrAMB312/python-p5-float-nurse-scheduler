import React, { useContext, useState } from "react";
import { UserContext } from "../context/user";
import { Link } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";

function Home() {
  const { user, setUser } = useContext(UserContext);
  const [selectedForm, setSelectedForm] = useState(null);

  const handleLogout = () => {
    fetch("http://localhost:5555/logout", {
      method: "DELETE",
      credentials: "include",
    })
      .then(() => setUser(null))
      .catch((err) => console.error(err));
  };

  if (!user) {
    return (
      <div className="container">
        <div className="card">
          <h1>Welcome to the Nurse Scheduler!</h1>
          <p>Please log in or sign up to continue.</p>
          <br />

          {!selectedForm && (
            <div>
              <button onClick={() => setSelectedForm("login")}>Log In</button>
              <br />
              <button onClick={() => setSelectedForm("signup")}>Sign Up</button>
            </div>
          )}

          {selectedForm === "login" && <Login />}
          {selectedForm === "signup" && <Signup />}

          {selectedForm && (
            <button onClick={() => setSelectedForm(null)}>Back</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Welcome, {user.name}!</h1>
        <p>View patients by hospital or department. Add new patients, hospitals, or departments.</p>
        <nav>
          <ul>
            <li><Link to="/add-patient">Add Patient</Link></li>
            <li><Link to="/hospitals">View Hospitals</Link></li>
            <li><Link to="/departments">View Departments</Link></li>
          </ul>
        </nav>

        <button onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  );
}

export default Home;
