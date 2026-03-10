import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders Vite + React heading', () => {
    render(<App />);
    const heading = screen.getByText(/vite \+ react/i);
    expect(heading).toBeInTheDocument();
  });

  test('renders initial count of 0', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /count is 0/i });
    expect(button).toBeInTheDocument();
  });

  test('increments count when button is clicked', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /count is 0/i });

    fireEvent.click(button);

    expect(screen.getByRole('button', { name: /count is 1/i })).toBeInTheDocument();
  });

  test('renders Vite and React logos', () => {
    render(<App />);
    const images = screen.getAllByRole('img');

    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('alt', 'Vite logo');
    expect(images[1]).toHaveAttribute('alt', 'React logo');
  });
});
