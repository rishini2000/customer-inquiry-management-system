# Design Decisions — Customer Inquiry Management System

## 1. Assumptions

- The system is intended for customer support staff who manage incoming customer inquiries.
- A staff account is configured through environment variables for the assessment demonstration.
- Each inquiry has a customer name, email address, subject, description, status, and timestamps.
- New inquiries start with the status `New`.
- The supported statuses are `New`, `In Progress`, and `Resolved`.
- Payments, customer self-service accounts, email notifications, and integrations with external customer support platforms are outside the current scope.

## 2. Design Decisions

### Decision 1: React frontend with an Express REST API

The user interface is implemented using React, while Express provides API endpoints for authentication and inquiry operations.

**Reason:** Separating the frontend from the backend keeps the user interface and business logic independent and makes the API easier to test.

### Decision 2: PostgreSQL for persistent storage

Inquiry records are stored in PostgreSQL rather than only in frontend state or browser storage.

**Reason:** Persistent database storage allows inquiries and status changes to remain available after refreshing the page or restarting the frontend.

### Decision 3: Token-based staff authentication

The backend verifies staff credentials and issues a JSON Web Token. Protected inquiry endpoints require a valid bearer token.

**Reason:** Authentication is enforced by the backend rather than relying only on hiding interface elements in the frontend.

Passwords are verified using bcrypt, and configuration secrets are supplied through environment variables.

## 3. Trade-off

For this assessment, staff authentication uses a configured staff account rather than a complete staff account management system.

**Benefit:** This keeps the implementation focused on the main inquiry management workflow and allows the authentication flow to be demonstrated within the assessment timeframe.

**Limitation:** It does not provide staff registration, password reset, multiple staff accounts, or role-based permissions.

## 4. Future Improvements

- Add staff account management and role-based access control.
- Add pagination and server-side filtering for larger inquiry datasets.
- Add more comprehensive automated tests for authentication, inquiry creation, validation, and status updates.
- Improve token expiry handling and logout/session management.
- Add audit logs to record status changes and staff actions.
- Add deployment configuration and production security checks.

## 5. AI Assistance Disclosure

AI assistance was used for coding guidance, debugging, automated test setup, and documentation drafting. The implementation should be reviewed and tested by the developer to ensure the code is understood and accurately represents the submitted application.
