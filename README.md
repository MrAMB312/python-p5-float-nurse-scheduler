# Phase 5 Full-Stack Application Project - Nurse Scheduler

## Overview

Nurse Scheduler is a full-stack web application that allows users to:
- Create and manage patients
- Track patient assignments to hospitals and departments
- Edit patient information and manage patient records

The backend is built with Flask and provides a RESTful API, while the frontend is built with React and uses Formik and Yup for form handling and validation.

This project demonstrates full CRUD functionality, one-to-many relationships, form validation, React Router for navigation, and user authentication.

---

## Running the Project

### Backend (Flask API)

```bash
cd server
flask run --port=5555
```

### Frontend (React)

```bash
cd client
npm install
npm start
```

---

## Backend

### Models

- `User`
  - Represents a user with a unique name and password.
  - One user can have many patients.
- `Patient`
  - Represents a patient with a name, date of birth, hospital, and department.
  - Belongs to a single user, hospital, and department.
- `Hospital`
  - Represents a hospital with a name and phone number.
  - Can have many patients assigned.
- `Department`
  - Represents a department with a name.
  - Can have many patients assigned.

### Relationoships

- One-to-many:
  - `User` > `Patient`
  - `Hospital` > `Patients`
  - `Department` > `Patients`
- Many-to-many:
  - `User` <-> `Hospital` / `Department` (via `Patient`)

---

## Routes

- Users
  - `POST /signup`: create a new user
  - `POST /login`: log in existing user
  - `GET /check_session:` verify user session
  - `DELETE /logout`: log out user
  - `GET /users`: list all users
  - `GET /users/<id>`: get a specific user
- Patients
  - `GET /patients`: list all patients for logged-in user
  - `POST /patients`: create a new patient
  - `GET /patients/<id>`: get patient details
  - `PATCH /patients/<id>`: update patient info
  - `DELETE /patients/<id>`: delete a patient
- Hospitals
  - `GET /hospitals`: list all hospitals
  - `POST /hospitals`: create a new hospital
  - `GET /hospitals/<id>`: get hospital details with patients
  - `PATCH /hospitals/<id>`: update hospital info
  - `DELETE /hospitals/<id>`: delete a hospital
- Departments
  - `GET /departments`: list all departments
  - `POST /departments`: create a new department
  - `GET /departments/<id>`: get department details with patients
  - `PATCH /departments/<id>`: update department info
  - `DELETE /departments/<id>`: delete a department

---

## Frontend

### Routes (React Router)
- `/` - Home page with instructions
- `/patients` - view all patients, add a new patient, and manage patient details
- `/hospitals` - view all hospitals and add a new hospital
- `/departments` - view all departments and add a new department
- `/signup` - sign up for a new account
- `/login` - log in to an existing account

### Components
- `PatientList.js`
  - Displays all patients for logged-in user
  - Uses Formik to add new patients with validation
  - Select a patient to view, edit, or delete
- `PatientDetail.js`
  - Shows patient details
  - Edit patient info using a Formik form
  - Delete patient
- `PatientForm.js`
  - Form to add a new patient
  - Select hospital and department from dropdowns
- `HospitalList.js` / `HospitalDetail.js`
  - View all hospitals and their patients
  - Add, edit, or delete hospitals
- `DepartmentList.js` / `DepartmentDetail.js`
  - View all departments and their patients
  - Add, edit, or delete departments
- `Signup.js` / `Login.js`
  - Handle user authentication and session management
- `App.js`
  - Parent component rendered in index.js
  - Handles routing and context
- `NavBar.js`
  - Links to Home, Patients, Hospitals, Departments, Signup, and Login
- `Home.js`
  - Home page with instructions and user guidance

---

## Validation
- All forms use Formik + Yup for input handling and validation:
- Patient name: required string, max 50 characters
- Date of birth: required, must be a valid date in the past
- Hospital name: required string, unique
- Hospital phone number: required, 10-digit number
- Department name: required string, unique
- User signup password: required string, min 6 characters

---

## Example User Flow

1. At the home page, log in with your account OR select 'Sign Up' to create a new account.

2. Navigate to Add Patient and add a new patient to a hospital and a department.

3. Navigate to Add Hospital and add a new hospital with name and phone number.

4. Navigate to Add Department and add a new department.

5. Select View Hospitals or View Departments to see a list of patients for that user admitted to a specific hospital or managed by a specific department.

6. Select a patient to review or update their information, or to delete the patient record.

---