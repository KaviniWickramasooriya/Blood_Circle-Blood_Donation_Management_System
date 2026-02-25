# Blood Circle – Blood Donation Management System

Blood Circle is a **microservices-based web application** developed as part of the 3rd Year – 1st Semester **Service Oriented Computing (SOC)** module. It streamlines blood donation processes by connecting donors, recipients, hospitals, and event organizers.

## Project Resources / Documentation

📁 [Blood Circle Project Folder](https://mysliit-my.sharepoint.com/:f:/g/personal/it22273376_my_sliit_lk/IgCQklVuzHwZR7fQV21qUKGLAQWaJi8Ese8O-Qnmc8je0wY?e=ftAg6I)


## 🚀 Features
- Secure user authentication & role-based access (Donor, Recipient, Event Organizer, Admin)
- Donor dashboard: Profile, donation history, eligibility, find requests
- Event management: Create, update, track blood donation camps/events
- Home/landing page with search, stats, and quick access
- Microservices architecture for scalability
- Automated CI/CD with Jenkins
- Containerized deployment with Docker

## 🛠️ Tech Stack
### Frontend
- React.js
- JWT Authentication
- Role-based UI routing

### Backend
- Node.js + Express.js
- Microservices (e.g., User Service, Event Service, Donation Service)
- PostgreSQL / MySQL

### DevOps
- Jenkins (CI/CD pipelines)
- Docker (containerization)

## My Contributions
- **Frontend:**
  - Home page (landing, hero section, features showcase, responsive design)
  - Donor pages (dashboard, profile, history, requests)
  - Event Organizer pages (event creation, management, participant views)
- **Backend:**
  - Event Service microservice (API endpoints for events, integration logic)

## Team Members
- IRESH ERANGA
- Kavini Wickramasooriya
- Amaya

## Setup Instructions
1. Clone the repo: `git clone https://github.com/[your-username]/blood-circle-frontend` (and backend)
2. Install dependencies: `npm install` in frontend & each backend service
3. Configure `.env` (DB credentials, JWT secret, etc.)
4. Run Docker containers or services individually
5. Access frontend at `http://localhost:3000`

For full CI/CD setup with Jenkins & Docker, refer to the DevOps folder/docs.

Built with ❤️ for saving lives through better blood donation management.
