from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from datetime import date
from config import db, bcrypt


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    _password_hash = db.Column(db.String, nullable=False)

    # relationships
    patients = db.relationship(
        'Patient', back_populates='user', cascade='all, delete-orphan'
    )
    hospitals = association_proxy(
        'patients', 'hospital', creator=lambda hospital_obj: Patient(hospital=hospital_obj)
    )
    departments = association_proxy(
        'patients', 'department', creator=lambda department_obj: Patient(department=department_obj)
    )

    # serialize_rules
    serialize_rules = ('-patients.user',)

    # validations
    @validates('name')
    def validate_name(self, key, name):
        if not name:
            raise ValueError('User name cannot be empty.')

        existing_user = User.query.filter_by(name=name).first()
        if existing_user and existing_user.id != self.id:
            raise ValueError('This user name is already in use.')

        return name

    @hybrid_property
    def password_hash(self):
        return self._password_hash

    @password_hash.setter
    def password_hash(self, password):
        if not password:
            raise ValueError('Password cannot be empty.')

        password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))

    def __repr__(self):
        return f'<User: {self.name}>'


class Patient(db.Model):
    __tablename__ = 'patients'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'))
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))

    # relationships
    user = db.relationship('User', back_populates='patients')
    hospital = db.relationship('Hospital', back_populates='patients')
    department = db.relationship('Department', back_populates='patients')

    # serialize_rules
    serialize_rules = ('-user.patients', '-hospital.patients', '-department.patients',)

    # validations
    @validates('name')
    def validate_name(self, key, name):
        if not name:
            raise ValueError('Patient name cannot be empty.')

        existing_patient = Patient.query.filter_by(name=name).first()
        if existing_patient and existing_patient.id != self.id:
            raise ValueError('This patient name is already in use.')

        return name

    @validates('date_of_birth')
    def validate_date_of_birth(self, key, date_of_birth):
        if not date_of_birth:
            raise ValueError('Date of birth cannot be empty.')

        if not isinstance(date_of_birth, date):
            raise ValueError('Invalid date format for date of birth.')

        if date_of_birth >= date.today():
            raise ValueError('Date of birth must be in the past.')

        return date_of_birth

    def __repr__(self):
        return (
            f'<Patient: {self.name}, Date of Birth: {self.date_of_birth}, '
            f'Admitted to: {self.hospital_id}, Managed by Department of {self.department_id}>'
        )


class Hospital(db.Model):
    __tablename__ = 'hospitals'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    phone_number = db.Column(db.String, nullable=False)

    # relationships
    patients = db.relationship(
        'Patient', back_populates='hospital', cascade='all, delete-orphan'
    )
    users = association_proxy(
        'patients', 'user', creator=lambda user_obj: Patient(user=user_obj)
    )
    departments = association_proxy(
        'patients', 'department', creator=lambda department_obj: Patient(department=department_obj)
    )

    # serialize_rules
    serialize_rules = ('-patients.hospital',)

    # validations
    @validates('name')
    def validate_name(self, key, name):
        if not name:
            raise ValueError('Invalid hospital name.')

        existing_hospital = Hospital.query.filter_by(name=name).first()
        if existing_hospital and existing_hospital.id != self.id:
            raise ValueError('This hospital name is already in use.')

        return name

    @validates('phone_number')
    def validate_phone_number(self, key, phone_number):
        if not phone_number:
            raise ValueError('Phone number cannot be empty.')

        cleaned = ''.join(filter(str.isdigit, phone_number))
        if len(cleaned) != 10:
            raise ValueError('Phone number must contain 10 digits.')

        return cleaned

    def __repr__(self):
        return f'<Hospital: {self.name}, Phone Number: {self.phone_number}>'


class Department(db.Model):
    __tablename__ = 'departments'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)

    # relationships
    patients = db.relationship(
        'Patient', back_populates='department', cascade='all, delete-orphan'
    )
    users = association_proxy(
        'patients', 'user', creator=lambda user_obj: Patient(user=user_obj)
    )
    hospitals = association_proxy(
        'patients', 'hospital', creator=lambda hospital_obj: Patient(hospital=hospital_obj)
    )

    # serialize_rules
    serialize_rules = ('-patients.department',)

    # validations
    @validates('name')
    def validate_name(self, key, name):
        if not name:
            raise ValueError('Invalid department name.')

        existing_department = Department.query.filter_by(name=name).first()
        if existing_department and existing_department.id != self.id:
            raise ValueError('This department name is already in use.')

        return name

    def __repr__(self):
        return f'<Department of {self.name}>'
