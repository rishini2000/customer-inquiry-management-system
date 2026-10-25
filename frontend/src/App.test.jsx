// @vitest-environment jsdom

 // @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  cleanup();
  sessionStorage.clear();
});

describe('Customer Inquiry Management UI', () => {
  it('shows the staff login form when not authenticated', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        name: /welcome to inquirydesk/i,
      })
    ).toBeTruthy();

    expect(screen.getByLabelText(/staff username/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
  });
});

