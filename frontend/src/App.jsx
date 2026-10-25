

import { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000/api';

function App() {
  // const [token, setToken] = useState(
  //   () => sessionStorage.getItem('staffToken') || ''
  // );

  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);



  async function handleLogin(event) {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.token) {
        throw new Error(result.message || 'Login failed.');
      }

      sessionStorage.setItem('staffToken', result.token);
      setToken(result.token);
      setPassword('');
    } catch (err) {
      setLoginError(err.message || 'Could not log in.');
    } finally {
      setLoggingIn(false);
    }
  }


  useEffect(() => {
    async function loadInquiries() {
      try {
        setLoading(true);
        setError('');
        setInquiries([]);

        const currentToken = sessionStorage.getItem('staffToken');

        if (!currentToken) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/inquiries`, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to load inquiries');
        }

        setInquiries(
          result.data.map((item) => ({
            ...item,
            id: `INQ-${item.id}`,
            databaseId: item.id,
            name: item.customerName,
            date: item.createdAt
              ? item.createdAt.slice(0, 10)
              : '',
          }))
        );
      } catch (err) {
        setError(
          'Could not load inquiries. Please check that the backend is running.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadInquiries();
  }, [token]);

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch = [
      inquiry.id,
      inquiry.name,
      inquiry.email,
      inquiry.subject,
    ].some((value) =>
      String(value ?? '').toLowerCase().includes(search.toLowerCase())
    );

    const matchesStatus =
      statusFilter === 'All' || inquiry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const newCount = inquiries.filter((i) => i.status === 'New').length;
  const progressCount = inquiries.filter(
    (i) => i.status === 'In Progress'
  ).length;
  const resolvedCount = inquiries.filter(
    (i) => i.status === 'Resolved'
  ).length;

  async function updateStatus(inquiry, status) {
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `http://localhost:3000/api/inquiries/${inquiry.databaseId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Could not update status');
      }

      setInquiries((current) =>
        current.map((item) =>
          item.databaseId === inquiry.databaseId
            ? {
              ...item,
              status: result.data.status,
              updatedAt: result.data.updatedAt,
            }
            : item
        )
      );

      setMessage('Inquiry status updated successfully.');
    } catch (err) {
      setError(err.message || 'Could not update inquiry status.');
    }
  }

  async function addInquiry(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const inquiryData = {
      customerName: formData.get('name').trim(),
      email: formData.get('email').trim(),
      subject: formData.get('subject').trim(),
      description: formData.get('description').trim(),
    };

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(inquiryData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Could not create inquiry');
      }

      const item = result.data;

      const newInquiry = {
        ...item,
        id: `INQ-${item.id}`,
        databaseId: item.id,
        name: item.customerName,
        date: item.createdAt ? item.createdAt.slice(0, 10) : '',
      };

      setInquiries((current) => [newInquiry, ...current]);
      setSearch('');
      setStatusFilter('All');
      setShowForm(false);
      setMessage('Inquiry created and saved successfully.');
      form.reset();
    } catch (err) {
      setError(err.message || 'Could not save inquiry. Please try again.');
    } finally {
      setSaving(false);
    }
  }


    
if (!token) {
  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <div className="brand-icon">CI</div>
        <h1>Welcome to InquiryDesk</h1>
        <p>Sign in to manage customer inquiries.</p>

        <label htmlFor="username">Staff username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        {loginError && (
          <p className="error-message">{loginError}</p>
        )}

        <button
          type="submit"
          className="primary-button"
          disabled={loggingIn}
        >
          {loggingIn ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}


  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">CI</div>
          <div>
            <strong>InquiryDesk</strong>
            <span>Management Portal</span>
          </div>
        </div>

        <p className="nav-heading">WORKSPACE</p>
        <div className="nav-item active">▦ &nbsp; Dashboard</div>
        <div className="nav-item">▤ &nbsp; Inquiries</div>

        <div className="sidebar-bottom">
          <div className="avatar">S</div>
          <div>
            <strong>Staff Member</strong>
            <span>Support team</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>Workspace / Dashboard</span>
          <div className="online-label">
            <span className="online-dot" /> Local demo
          </div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">CUSTOMER SUPPORT</p>
              <h1>Inquiry Dashboard</h1>
              <p className="subtitle">
                Manage and track customer inquiries in one place.
              </p>
            </div>
            <button
              className="primary-button"
              onClick={() => {
                setShowForm((current) => !current);
                setMessage('');
              }}
            >
              + New inquiry
            </button>
          </div>

          {message && <p className="success-message">{message}</p>}

          {showForm && (
            <form className="inquiry-form" onSubmit={addInquiry}>
              <h2>Create an inquiry</h2>
              <div className="form-grid">
                <label>
                  Customer name
                  <input name="name" required maxLength="150" />
                </label>
                <label>
                  Email address
                  <input name="email" type="email" required maxLength="254" />
                </label>
                <label className="full-width">
                  Subject
                  <input name="subject" required maxLength="200" />
                </label>
                <label className="full-width">
                  Description
                  <textarea
                    name="description"
                    required
                    rows="4"
                    maxLength="5000"
                    placeholder="Describe the customer's inquiry..."
                  />
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="secondary-button"
                  onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Create inquiry'}
                </button>
              </div>
            </form>
          )}

          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-top">
                <span>Total inquiries</span>
                <span className="metric-icon purple">▤</span>
              </div>
              <strong>{inquiries.length}</strong>
              <p>All customer inquiries</p>
            </div>

            <div className="summary-card">
              <div className="summary-top">
                <span>New</span>
                <span className="metric-icon blue">✦</span>
              </div>
              <strong>{newCount}</strong>
              <p>Awaiting review</p>
            </div>

            <div className="summary-card">
              <div className="summary-top">
                <span>In progress</span>
                <span className="metric-icon orange">◷</span>
              </div>
              <strong>{progressCount}</strong>
              <p>Currently being handled</p>
            </div>

            <div className="summary-card">
              <div className="summary-top">
                <span>Resolved</span>
                <span className="metric-icon green">✓</span>
              </div>
              <strong>{resolvedCount}</strong>
              <p>Successfully resolved</p>
            </div>
          </div>

          <section className="table-card">
            <div className="table-heading">
              <div>
                <h2>Customer inquiries</h2>
                <p>Review and manage incoming requests.</p>
              </div>
              <span className="record-count">
                {filteredInquiries.length} records
              </span>
            </div>

            <div className="toolbar">
              <input
                className="search-input"
                type="search"
                placeholder="Search name, email, subject or ID..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option>All</option>
                <option>New</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            </div>

            <div className="table-scroll">
              {loading && <p>Loading inquiries...</p>}
              {error && <p className="error-message">{error}</p>}
              <table>
                <thead>
                  <tr>
                    <th>INQUIRY</th>
                    <th>CUSTOMER</th>
                    <th>SUBJECT</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                    <th>UPDATE STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.map((inquiry) => (
                    <tr key={inquiry.id}>
                      <td className="inquiry-id">{inquiry.id}</td>
                      <td>
                        <strong>{inquiry.name}</strong>
                        <span className="cell-secondary">{inquiry.email}</span>
                      </td>
                      <td>{inquiry.subject}</td>
                      <td>{inquiry.date}</td>
                      <td>
                        <span className={`status status-${inquiry.status
                          .toLowerCase().replace(' ', '-')}`}>
                          {inquiry.status}
                        </span>
                      </td>
                      <td>
                        <select
                          aria-label={`Update status for ${inquiry.id}`}
                          value={inquiry.status}
                          onChange={(event) =>
                            updateStatus(inquiry, event.target.value)
                          }
                        >
                          <option>New</option>
                          <option>In Progress</option>
                          <option>Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {!loading && !error && filteredInquiries.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        No inquiries match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              Inquiries are stored in your PostgreSQL database.
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;
