# Medical Appointment Scheduling System

## Setup Backend

1. `cd backend`
2. Copy `.env.example` to `.env` and fill your details.
3. Run `npm install`
4. Run `npm run dev` (requires nodemon)

## Setup Frontend

1. `cd frontend`
2. Run `npm install`
3. Run `npm start`

## Features

- Register and login users with roles (patient, doctor, secretary)
- Patients can book appointments within doctor availability
- Doctors and secretaries can set availability
- Appointment reminders via email and SMS (Twilio)
- View appointment history
