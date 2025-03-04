import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../../src/components/Header/Header';

describe('Header Component', () => {
  it('renders the Edison title', () => {
    render(<Header />);
    const titleElement = screen.getByText(/The Edison/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/About/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact/i)).toBeInTheDocument();
  });
}); 