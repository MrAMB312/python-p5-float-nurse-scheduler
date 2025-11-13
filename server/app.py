#!/usr/bin/env python3

# Standard library imports
from datetime import datetime

# Remote library imports
from flask import request, session, make_response
from flask_restful import Resource
from flask_cors import cross_origin

# Local imports
from config import app, db, api, ma, bcrypt
from models import User, Hospital, Department, Patient


# --------------------
# Schemas
# --------------------

class UserSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
        load_instance = True

    id = ma.auto_field()
    name = ma.auto_field()

    patients = ma.Nested("PatientSchema", many=True)
    hospitals = ma.Method("get_hospitals")
    departments = ma.Method("get_departments")

    def get_hospitals(self, user):
        unique = {p.hospital.id: p.hospital for p in user.patients if p.hospital}
        return hospitals_schema.dump(list(unique.values()))
    
    def get_departments(self, user):
        unique = {p.department.id: p.department for p in user.patients if p.department}
        return departments_schema.dump(list(unique.values()))


user_schema = UserSchema()
users_schema = UserSchema(many=True)


class PatientSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Patient
        load_instance = True

    id = ma.auto_field()
    name = ma.auto_field()
    date_of_birth = ma.Date()
    hospital = ma.Nested("HospitalSchema", only=("id", "name"))
    department = ma.Nested("DepartmentSchema", only=("id", "name"))


patient_schema = PatientSchema()
patients_schema = PatientSchema(many=True)


class HospitalSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Hospital
        load_instance = True

    id = ma.auto_field()
    name = ma.auto_field()
    phone_number = ma.auto_field()
    patients = ma.Nested("PatientSchema", many=True, exclude=("hospital",))


hospital_schema = HospitalSchema()
hospitals_schema = HospitalSchema(many=True)


class DepartmentSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Department
        load_instance = True

    id = ma.auto_field()
    name = ma.auto_field()
    patients = ma.Nested("PatientSchema", many=True, exclude=("department",))


department_schema = DepartmentSchema()
departments_schema = DepartmentSchema(many=True)


# --------------------
# Authentication Middleware
# --------------------

@app.before_request
def check_if_logged_in():
    if request.method == "OPTIONS":
        return
    allowed_routes = [
        "login",
        "signup",
        "checksession",
        "index",
        "hospitals",
        "departments",
    ]
    if request.endpoint not in allowed_routes and not session.get("user_id"):
        return {"error": "401: Unauthorized"}, 401


# --------------------
# Resource Classes
# --------------------

class Index(Resource):
    def get(self):
        return "<h1>Project Server</h1>"


class Login(Resource):
    def post(self):
        data = request.get_json()
        name = data.get("name")
        password = data.get("password")

        if not name or not password:
            return {"error": "400: Name and password are required"}, 400

        user = User.query.filter_by(name=name).first()
        if not user or not user.authenticate(password):
            return {"error": "401: Invalid username or password"}, 401

        session["user_id"] = user.id
        return make_response(user_schema.dump(user), 200)


class Signup(Resource):
    def post(self):
        data = request.get_json()
        name = data.get("name")
        password = data.get("password")

        if not name or not password:
            return {"error": "400: Name and password are required"}, 400

        if User.query.filter_by(name=name).first():
            return {"error": "400: User already exists"}, 400

        new_user = User(name=name)
        new_user.password_hash = password
        db.session.add(new_user)
        db.session.commit()

        session["user_id"] = new_user.id
        return make_response(user_schema.dump(new_user), 201)


class CheckSession(Resource):
    def get(self):
        user = User.query.get(session.get("user_id"))
        if user:
            return make_response(user_schema.dump(user), 200)
        return {"message": "401: Not Authorized"}, 401


class Logout(Resource):
    def delete(self):
        session.pop("user_id", None)
        return {"message": "204: No Content"}, 204


# --------------------
# Patients
# --------------------

class Patients(Resource):
    @cross_origin(supports_credentials=True, origins="http://localhost:3000")
    def get(self):
        user = User.query.get(session.get("user_id"))
        if not user:
            return {"error": "404: User not found"}, 404

        return make_response(patients_schema.dump(user.patients), 200)

    def post(self):
        user = User.query.get(session.get("user_id"))
        if not user:
            return {"error": "404: User not found"}, 404

        data = request.get_json()
        name = data.get("name")
        date_of_birth_str = data.get("date_of_birth")
        hospital_id = data.get("hospital_id")
        department_id = data.get("department_id")

        if not all([name, date_of_birth_str, hospital_id, department_id]):
            return {
                "error": "400: Name, date_of_birth, hospital_id, and department_id are required"
            }, 400

        try:
            date_of_birth = datetime.strptime(date_of_birth_str, "%Y-%m-%d").date()
        except ValueError:
            return {
                "error": "400: Invalid date_of_birth format. Use YYYY-MM-DD"
            }, 400

        hospital = Hospital.query.get(hospital_id)
        if not hospital:
            return {"error": "404: Hospital not found"}, 404

        department = Department.query.get(department_id)
        if not department:
            return {"error": "404: Department not found"}, 404

        new_patient = Patient(
            name=name, date_of_birth=date_of_birth, user=user, hospital=hospital, department=department
        )
        db.session.add(new_patient)
        db.session.commit()
        return make_response(patient_schema.dump(new_patient), 201)


class PatientDetail(Resource):
    def get(self, patient_id):
        user = User.query.get(session.get("user_id"))
        if not user:
            return {"error": "401: Unauthorized"}, 401

        patient = Patient.query.get(patient_id)
        if not patient:
            return {"error": "404: Patient not found"}, 404

        if patient.user_id != user.id:
            return {"error": "403: Forbidden"}, 403

        return make_response(patient_schema.dump(patient), 200)

    def patch(self, patient_id):
        user = User.query.get(session.get("user_id"))
        if not user:
            return {"error": "401: Unauthorized"}, 401

        patient = Patient.query.get(patient_id)
        if not patient:
            return {"error": "404: Patient not found"}, 404

        if patient.user_id != user.id:
            return {"error": "403: Forbidden"}, 403

        data = request.get_json()

        if "name" in data:
            patient.name = data["name"]

        if "date_of_birth" in data:
            try:
                patient.date_of_birth = datetime.strptime(
                    data["date_of_birth"], "%Y-%m-%d"
                ).date()
            except ValueError:
                return {
                    "error": "400: Invalid date_of_birth format. Use YYYY-MM-DD"
                }, 400

        if "hospital_id" in data:
            hospital = Hospital.query.get(data["hospital_id"])
            if not hospital:
                return {"error": "404: Hospital not found"}, 404
            patient.hospital = hospital

        if "department_id" in data:
            department = Department.query.get(data["department_id"])
            if not department:
                return {"error": "404: Department not found"}, 404
            patient.department = department

        db.session.commit()
        return make_response(patient_schema.dump(patient), 202)

    def delete(self, patient_id):
        user = User.query.get(session.get("user_id"))
        if not user:
            return {"error": "401: Unauthorized"}, 401

        patient = Patient.query.get(patient_id)
        if not patient:
            return {"message": "404: Patient not found"}, 404

        if patient.user_id != user.id:
            return {"error": "403: Forbidden"}, 403

        db.session.delete(patient)
        db.session.commit()
        return make_response("", 204)


# --------------------
# Hospitals
# --------------------

class Hospitals(Resource):
    def get(self):
        hospitals = Hospital.query.all()
        return make_response(hospitals_schema.dump(hospitals), 200)

    def post(self):
        data = request.get_json()
        new_hospital = Hospital(
            name=data.get("name"),
            phone_number=data.get("phone_number")
        )
        db.session.add(new_hospital)
        db.session.commit()
        return make_response(hospital_schema.dump(new_hospital), 201)


class HospitalDetail(Resource):
    def get(self, hospital_id):
        user = User.query.get(session.get("user_id"))
        if not user:
            return {"error": "401: Unauthorized"}, 401

        hospital = Hospital.query.get(hospital_id)
        if not hospital:
            return {"message": "404: Hospital not found"}, 404

        patients = Patient.query.filter_by(
            hospital_id=hospital.id, user_id=user.id
        ).all()

        hospital_data = hospital_schema.dump(hospital)
        hospital_data["patients"] = patients_schema.dump(patients)
        return make_response(hospital_data, 200)

    def patch(self, hospital_id):
        user = User.query.get(session.get("user_id"))
        if not user:
            return {"error": "401: Unauthorized"}, 401

        hospital = Hospital.query.get(hospital_id)
        if not hospital:
            return {"message": "404: Hospital not found"}, 404

        data = request.get_json()
        for attr in request.json:
            setattr(hospital, attr, data[attr])

        db.session.commit()
        return make_response(hospital_schema.dump(hospital), 202)

    def delete(self, hospital_id):
        user = User.query.get(session.get("user_id"))
        if not user:
            return {"error": "401: Unauthorized"}, 401

        hospital = Hospital.query.get(hospital_id)
        if not hospital:
            return {"message": "404: Hospital not found"}, 404

        db.session.delete(hospital)
        db.session.commit()
        return make_response("", 204)
    

class HospitalPatients(Resource):
    def get(self, hospital_id):
        user = User.query.get(session.get("user_id"))
        if not user:
            return {"error": "401: Unauthorized"}, 401

        patients = Patient.query.filter_by(hospital_id=hospital_id, user_id=user.id).all()
        return make_response(patients_schema.dump(patients), 200)


# --------------------
# Departments
# --------------------

class Departments(Resource):
    def get(self):
        departments = Department.query.all()
        return make_response(departments_schema.dump(departments), 200)

    def post(self):
        data = request.get_json()
        new_department = Department(name=data.get("name"))
        db.session.add(new_department)
        db.session.commit()
        return make_response(department_schema.dump(new_department), 201)


class DepartmentDetail(Resource):
    def get(self, department_id):
        user = User.query.get(session.get("user_id"))
        if not user:
            return {"error": "401: Unauthorized"}, 401

        department = Department.query.get(department_id)
        if not department:
            return {"message": "404: Department not found"}, 404

        patients = Patient.query.filter_by(
            department_id=department.id, user_id=user.id
        ).all()

        department_data = department_schema.dump(department)
        department_data["patients"] = patients_schema.dump(patients)
        return make_response(department_data, 200)

    def patch(self, department_id):
        user = User.query.get(session.get("user_id"))
        if not user:
            return {"error": "401: Unauthorized"}, 401

        department = Department.query.get(department_id)
        if not department:
            return {"message": "404: Department not found"}, 404

        data = request.get_json()
        for attr in request.json:
            setattr(department, attr, data[attr])

        db.session.commit()
        return make_response(department_schema.dump(department), 202)

    def delete(self, department_id):
        user = User.query.get(session.get("user_id"))
        if not user:
            return {"error": "401: Unauthorized"}, 401

        department = Department.query.get(department_id)
        if not department:
            return {"message": "404: Department not found"}, 404

        db.session.delete(department)
        db.session.commit()
        return make_response("", 204)
    
    
class DepartmentPatients(Resource):
    def get(self, department_id):
        user = User.query.get(session.get("user_id"))
        if not user:
            return {"error": "401: Unauthorized"}, 401

        patients = Patient.query.filter_by(department_id=department_id, user_id=user.id).all()
        return make_response(patients_schema.dump(patients), 200)


# --------------------
# Users
# --------------------

class Users(Resource):
    def get(self):
        users = User.query.all()
        return make_response(users_schema.dump(users), 200)


class UserDetail(Resource):
    def get(self, id):
        user = User.query.get(id)
        if not user:
            return {"error": "404: User not found"}, 404
        return make_response(user_schema.dump(user), 200)


# --------------------
# Routes
# --------------------

api.add_resource(Index, "/", endpoint="index")
api.add_resource(Login, "/login", endpoint="login")
api.add_resource(Signup, "/signup", endpoint="signup")
api.add_resource(CheckSession, "/check_session", endpoint="checksession")
api.add_resource(Logout, "/logout")

api.add_resource(Patients, "/patients")
api.add_resource(PatientDetail, "/patients/<int:patient_id>", endpoint="patientbyid")

api.add_resource(Hospitals, "/hospitals")
api.add_resource(HospitalDetail, "/hospitals/<int:hospital_id>", endpoint="hospitalbyid")
api.add_resource(HospitalPatients, "/hospitals/<int:hospital_id>/patients")

api.add_resource(Departments, "/departments")
api.add_resource(DepartmentDetail, "/departments/<int:department_id>", endpoint="departmentbyid")
api.add_resource(DepartmentPatients, "/departments/<int:department_id>/patients")

api.add_resource(Users, "/users", endpoint="users")
api.add_resource(UserDetail, "/users/<int:user_id>", endpoint="userbyid")


# --------------------
# Run Server
# --------------------

if __name__ == "__main__":
    app.run(port=5555, debug=True)
