#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc
from datetime import date

# Remote library imports
from faker import Faker

# Local imports
from app import app
from models import db, User, Patient, Hospital, Department

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        
        User.query.delete()
        Hospital.query.delete()
        Department.query.delete()
        Patient.query.delete()

        print('Creating users...')

        lashawn = User(name='Lashawn')
        lashawn.password_hash = 'Lashawn'
        khalid = User(name='Khalid')
        khalid.password_hash = 'Khalid'
        joseph = User(name='Joseph')
        joseph.password_hash = 'Joseph'
        yazen = User(name='Yazen')
        yazen.password_hash = 'Yazen'

        users = [lashawn, khalid, joseph, yazen]

        print('Creating hospitals...')

        u_chicago = Hospital(name='University of Chicago Medicine', phone_number='7737021000')
        northwestern = Hospital(name='Northwestern Memorial Hospital', phone_number='3129262000')
        rush = Hospital(name='Rush University Medical Center', phone_number='8883527874')
        evanston = Hospital(name='Evanston Hospital', phone_number='8475702000')
        christ = Hospital(name='Advocate Christ Medical Center', phone_number='7086848000')

        hospitals = [u_chicago, northwestern, rush, evanston, christ]

        print('Creating departments...')

        cardiology = Department(name='Cardiology')
        neurology = Department(name='Neurology')
        oncology = Department(name='Oncology')
        emergency = Department(name='Emergency Medicine')
        orthopedics = Department(name='Orthopedics')

        departments = [cardiology, neurology, oncology, emergency, orthopedics]

        print('Creating patients...')

        maria = Patient(name='Maria Gonzalez', date_of_birth=date(1980, 4, 12), user=lashawn, hospital=u_chicago, department=cardiology)
        james = Patient(name='James Carter', date_of_birth=date(1975, 11, 8), user=lashawn, hospital=rush, department=neurology)
        alicia = Patient(name='Alicia Kim', date_of_birth=date(1990, 6, 20), user=lashawn, hospital=christ, department=oncology)
        robert = Patient(name='Robert Thomas', date_of_birth=date(1968, 2, 14), user=lashawn, hospital=evanston, department=orthopedics)
        linda = Patient(name='Linda Perez', date_of_birth=date(2001, 10, 25), user=lashawn, hospital=northwestern, department=emergency)

        anthony = Patient(name='Anthony Davis', date_of_birth=date(1985, 1, 13), user=khalid, hospital=u_chicago, department=neurology)
        sophia = Patient(name='Sophia Patel', date_of_birth=date(1998, 12, 30), user=khalid, hospital=christ, department=cardiology)
        brian = Patient(name='Brian Lee', date_of_birth=date(1979, 9, 3), user=khalid, hospital=northwestern, department=oncology)
        karen = Patient(name='Karen Smith', date_of_birth=date(1965, 5, 10), user=khalid, hospital=rush, department=orthopedics)
        william = Patient(name='William Brown', date_of_birth=date(1992, 7, 19), user=khalid, hospital=evanston, department=emergency)

        emily = Patient(name='Emily Johnson', date_of_birth=date(2000, 8, 28), user=joseph, hospital=rush, department=cardiology)
        jason = Patient(name='Jason Nguyen', date_of_birth=date(1983, 3, 16), user=joseph, hospital=u_chicago, department=oncology)
        angela = Patient(name='Angela White', date_of_birth=date(1977, 6, 4), user=joseph, hospital=christ, department=neurology)
        michael = Patient(name='Michael Rodriguez', date_of_birth=date(1969, 12, 9), user=joseph, hospital=northwestern, department=orthopedics)
        david = Patient(name='David Wilson', date_of_birth=date(1994, 2, 22), user=joseph, hospital=evanston, department=emergency)

        hannah = Patient(name='Hannah Green', date_of_birth=date(1999, 11, 11), user=yazen, hospital=northwestern, department=neurology)
        ethan = Patient(name='Ethan Martinez', date_of_birth=date(1986, 9, 7), user=yazen, hospital=u_chicago, department=emergency)
        olivia = Patient(name='Olivia Turner', date_of_birth=date(1972, 1, 28), user=yazen, hospital=christ, department=oncology)
        daniel = Patient(name='Daniel Scott', date_of_birth=date(1991, 5, 3), user=yazen, hospital=rush, department=cardiology)
        grace = Patient(name='Grace Evans', date_of_birth=date(2004, 3, 17), user=yazen, hospital=evanston, department=orthopedics)

        patients = [
            maria, james, alicia, robert, linda,
            anthony, sophia, brian, karen, william,
            emily, jason, angela, michael, david,
            hannah, ethan, olivia, daniel, grace
        ]

        db.session.add_all(users)
        db.session.add_all(hospitals)
        db.session.add_all(departments)
        db.session.add_all(patients)
        db.session.commit()

        print('Seeding complete!')