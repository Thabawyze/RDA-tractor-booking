#  RDA Agricultural Service Portal

> **Development of a Digital RDA Service Portal for Agricultural Information Access and Online Tractor Booking in Eswatini**

A full-stack web-based platform designed to improve access to agricultural services for smallholder farmers in Eswatini. The system centralizes agricultural advisory information and digitizes the booking of subsidized tractor services offered by Rural Development Areas (RDAs).

---

##  Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Usage](#usage)
- [System Modules](#system-modules)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [Contributors](#contributors)
- [License](#license)

---

##  Overview

Agriculture remains a key economic activity in Eswatini, with many smallholder farmers relying on government-supported services such as livestock advisory, crop extension support, mechanization, and climate information. However, the delivery of these services is often constrained by:

- Limited access to updated agricultural information
- Slow, manual processes for booking subsidized tractor services
- Long travel distances to RDA centers
- Lack of centralized communication between farmers and extension officers

This platform addresses these challenges by providing a centralized digital solution for agricultural information access and online tractor booking with mobile money payment integration.

---

##  Features

### For Farmers
-  **Secure Account Registration & Login** – Create and manage farmer accounts
-  **Agricultural Advisory Information** – Access crop guidance, livestock management, soil advice, and seasonal advisories
-  **Online Tractor Booking** – Request mechanization services with location, service type, and duration specifications
-  **Mobile Money Payments** – Make secure payments via mobile money (MoMo/eMali)
-  **Personal Dashboard** – View booking history, track status, and manage requests
-  **Responsive Design** – Accessible on both desktop and mobile devices

### For RDA Officers
-  **Content Management** – Upload and manage agricultural advisory content
-  **Booking Management** – Review, approve, and manage tractor service requests
-  **Activity Monitoring** – Track farmer activities and service utilization

### For Administrators
-  **User Management** – Manage farmers, officers, and system users
-  **Reports & Analytics** – Generate reports on bookings, services, and system usage
-  **System Settings** – Configure Tinkhundla centers, services, and system parameters
-  **Audit Logs** – Monitor system activities and maintain records

---

##  Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React.js** | UI library for building interactive user interfaces |
| **TypeScript** | Type-safe JavaScript for robust code |
| **Tailwind CSS** | Utility-first CSS framework for responsive styling |
| **JavaScript** | Core scripting for dynamic functionality |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime for server-side execution |
| **Express.js** | Web application framework for RESTful APIs |

### Database
| Technology | Purpose |
|------------|---------|
| **MySQL** | Relational database for structured data storage |
| **pgAdmin** | Database administration and management tool |

### Payment Integration
| Technology | Purpose |
|------------|---------|
| **Mobile Money API** | Integration for MoMo/eMali payment processing |

### Development Tools
- **Visual Studio Code** – Primary IDE
- **Git** – Version control

---

##  System Architecture

The system follows a **Three-Tier Architecture**:

```
<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/0c7c2978-8ec4-4dda-8607-6c701b120ab7" />

```

---

##  Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/rda-agricultural-portal.git
cd rda-agricultural-portal
```

### Step 2: Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

### Step 3: Database Setup
1. Create a MySQL database named `rda_portal`
2. Import the database schema from `/database/schema.sql`
3. Update database credentials in `/backend/config/database.js`

```sql
CREATE DATABASE rda_portal;
USE rda_portal;
SOURCE database/schema.sql;
```

### Step 4: Environment Configuration
Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=rda_portal

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Mobile Money API (Configure with provider)
MOMO_API_KEY=your_momo_api_key
MOMO_API_SECRET=your_momo_api_secret
MOMO_BASE_URL=https://api.momo.com
```

### Step 5: Start the Application

#### Start Backend Server
```bash
cd backend
npm run dev
```

#### Start Frontend (in a new terminal)
```bash
cd frontend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

##  Usage

### Farmer Workflow
1. **Register** – Create a farmer account with personal details
2. **Login** – Access the farmer dashboard
3. **Browse Advisory** – View agricultural information and guidance
4. **Book Tractor** – Fill out the booking form with location, hours, and date
5. **Make Payment** – Complete mobile money payment
6. **Track Booking** – Monitor booking status from the dashboard

### Administrator Workflow
1. **Login** – Access the admin dashboard
2. **Manage Users** – Add, edit, or deactivate user accounts
3. **Manage Bookings** – Review and process tractor service requests
4. **Update Content** – Upload advisory materials and seasonal updates
5. **Generate Reports** – Export booking and usage statistics

---

##  System Modules

### 1. Agricultural Advisory Module
- Displays crop production guidance
- Livestock management information
- Soil preparation and management advice
- Seasonal farming practices and updates
- Training manuals and educational resources

### 2. Tractor Booking Module
- Online service request submission
- Location and duration specification
- Real-time availability checking
- Mobile money payment processing
- Booking confirmation and receipt generation
- Service status tracking

### 3. Administrative Module
- User account management
- Booking oversight and approval
- Content management system
- Report generation (PDF/Excel)
- System configuration and settings
- Audit log monitoring

---

##  Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | Farmer, officer, and administrator accounts |
| `bookings` | Tractor service requests and status |
| `tinkhundla_centers` | RDA service center locations |
| `services` | Available tractor and mechanization services |
| `advisory_content` | Agricultural information and resources |
| `payments` | Mobile money transaction records |
| `refunds` | Refund request processing |

### Entity Relationships
- **Users** → Bookings (One-to-Many)
- **Users** → Tinkhundla Centers (Many-to-One)
- **Bookings** → Payments (One-to-One)
- **Bookings** → Services (Many-to-One)
- **Advisory Content** → Users (Many-to-One, uploaded by officers)

---

##  Testing

The system was tested across four dimensions:

### Functional Testing
- ✅ User registration and authentication
- ✅ Farmer dashboard access and navigation
- ✅ Tractor booking submission and processing
- ✅ Mobile money payment integration
- ✅ Booking confirmation generation
- ✅ Advisory information retrieval
- ✅ Administrative management functions

### Usability Testing
- ✅ Simple registration and login process
- ✅ Intuitive navigation between pages
- ✅ Clear booking forms and instructions
- ✅ Accessible advisory information
- ✅ Responsive design on mobile and desktop

### Performance Testing
- ✅ System response time during login (< 2s)
- ✅ Advisory content loading speed (< 3s)
- ✅ Booking request processing (< 5s)
- ✅ Database query efficiency

### Security Testing
- ✅ User authentication and login validation
- ✅ Password encryption and protection
- ✅ Role-based access control
- ✅ Protection of booking and payment data
- ✅ Prevention of unauthorized access

---

##  Screenshots

| Page | Description |
|------|-------------|
| **Homepage** | Main entry point with navigation to services and Tinkhundla centers |
| **Account Creation** | Farmer registration with secure password controls |
| **Login Page** | Secure authentication for farmers and administrators |
| **Admin Dashboard** | Centralized management panel for system oversight |
| **Tractor Booking** | Service request form with mobile money payment |
| **Farmer Dashboard** | Personal booking statistics and tracking |
| **Advisory Page** | Agricultural information and guidance display |

---

##  Future Enhancements

-  **Mobile Application** – Native Android and iOS apps for improved accessibility
-  **Full Mobile Money API** – Live automated payment processing with official API access
-  **GPS & Tractor Tracking** – Real-time location monitoring for service transparency
-  **Offline Functionality** – PWA support for areas with limited connectivity
-  **Weather Integration** – Live weather forecasting and climate alerts
-  **Expanded Services** – Fertilizer distribution, livestock vaccination schedules, market prices
-  **Video Tutorials** – Online training and community-based learning
-  **Multi-RDA Deployment** – Nationwide rollout across all Rural Development Areas

---

## 👥 Contributors

This project was developed as part of the Bachelor of Science in Information Technology program at the **Faculty of Science and Engineering, Department of Computer Science**.

| Role | Name |
|------|------|
| **Students** | Mamba Thabani (ID: 202202427) |
| | Ndzinisa Sakhile (ID: 202203675) |
| **Supervisor** | Dr. M. Nxumalo |
| **Coordinator** | Mr. S.M. Sithole |

**Academic Year**: 2025-2026

---

##  References

- APAARI (2015). *e-Choupal case studies on digital agricultural extension in India.*
- Ayim, C., et al. (2022). ICT-enabled advisory systems in African agriculture. *Agricultural Systems*, 203, 103517.
- Choruma, D. J. (2024). *Digital agricultural extension in Africa: A scoping review.*
- Daum, T. (2021). Farm robots and agricultural mechanization. *Trends in Ecology & Evolution*, 36(6), 518–520.
- FAO (2020). *Digital coordination platforms for agricultural mechanization.*
- FAO (2022). *Digital technologies in agriculture and rural areas.* Rome: FAO.
- Rogers, E. M. (2003). *Diffusion of Innovations* (5th ed.). New York: Free Press.

---

##  License

This project is developed for academic purposes as part of the BSc Information Technology program. All rights reserved.

For inquiries or collaboration, please contact the Department of Computer Science.

---

<p align="center">
  <strong> Empowering Farmers Through Digital Innovation </strong>
</p>
