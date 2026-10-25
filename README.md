# Customer Inquiry Management System

A full-stack web application for customer support staff to manage, track, search, and update customer inquiries through a centralized dashboard.

## Features

- **Staff authentication:** Secure login using username and password verification.
- **Create inquiries:** Record customer name, email, subject, and description.
- **View inquiries:** Display saved inquiries from the PostgreSQL database.
- **Search inquiries:** Search inquiries using customer details, email, subject, or inquiry ID.
- **Filter by status:** Filter inquiries by New, In Progress, and Resolved.
- **Update status:** Change inquiry statuses and persist updates to the database.
- **Input validation:** Validate required fields, email format, and input lengths.
- **Protected API:** Require a valid staff authentication token for inquiry operations.
- **Automated tests:** Include backend API tests and a frontend login UI test.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- PostgreSQL
- `pg`
- JSON Web Tokens (`jsonwebtoken`)
- `bcryptjs`
- Helmet

### Testing
- Jest and Supertest for backend API tests
- Vitest and React Testing Library for frontend tests

## Project Structure

```text
customer-inquiry-management/
├── backend/
│   ├── server.js
│   ├── server.test.js
│   ├── package.json
│   └── .env                 # Local configuration; do not commit
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.test.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
├── .gitignore
├── README.md
└── DECISIONS.md
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- PostgreSQL
- Git

## Database Setup

1. Start PostgreSQL.
2. Create a database named `customer_inquiry_db`.
3. Create the `public.inquiries` table with the required columns and constraints.
4. Configure the database connection in `backend/.env`.

The inquiries table stores the customer name, email, subject, description, status, creation timestamp, and update timestamp. Inquiry statuses are restricted to `New`, `In Progress`, and `Resolved`.

## Environment Configuration

Create a local `backend/.env` file using the following variable names:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=customer_inquiry_db
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password

STAFF_USERNAME=your_staff_username
STAFF_PASSWORD_HASH=your_bcrypt_password_hash
JWT_SECRET=your_long_random_secret
```

Replace the example values with your own local configuration. Generate a bcrypt hash for the staff password and use a strong, randomly generated JWT secret.

**Security:** Never commit `.env` files, passwords, password hashes, database credentials, or JWT secrets to GitHub. Keep these values private.

## Installation

### 1. Install backend dependencies

Open a terminal in the project root and run:

```bash
cd backend
npm install
```

### 2. Install frontend dependencies

Open another terminal and run:

```bash
cd frontend
npm install
```

## Running the Application

### Start the backend

From the `backend` directory:

```bash
node server.js
```

The backend runs at:

`http://localhost:3000`

Health check endpoint:

`http://localhost:3000/api/health`

### Start the frontend

From the `frontend` directory, open a second terminal and run:

```bash
npm run dev
```

Open the local URL shown by Vite, normally:

`http://localhost:5173`

Sign in with the staff credentials configured in the backend environment.

## Running Automated Tests

### Backend tests

From the `backend` directory:

```bash
npm test
```

The backend test suite checks the health endpoint and verifies that inquiry requests without a valid staff token are rejected.

### Frontend tests

From the `frontend` directory:

```bash
npm test
```

The frontend test verifies that the staff login form is displayed when the user is not authenticated.

## Usage

1. Sign in using the configured staff account.
2. View customer inquiries in the dashboard.
3. Create an inquiry by entering the required customer and inquiry details.
4. Search for an inquiry using relevant customer details, subject, or inquiry ID.
5. Filter inquiries by status.
6. Update an inquiry's status as work progresses.
7. Refresh the page to verify that inquiry data and status changes persist in PostgreSQL.

## Future Improvements

- Add role-based access control and staff account management.
- Add pagination for large inquiry lists.
- Add more comprehensive frontend and backend tests.
- Improve audit logging and session management.
- Deploy the application using production-grade environment configuration.

## AI Assistance Disclosure

AI assistance was used during development for implementation guidance, debugging, test setup, and documentation preparation. The code and design decisions should be reviewed and understood by the developer before submission.
