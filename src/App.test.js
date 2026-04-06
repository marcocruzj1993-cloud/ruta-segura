import { render, screen } from '@testing-library/react';
import App from './App';

test('renders RutaSegura app', () => {
  render(<App />);
  const titleElement = screen.getByText(/RutaSegura/i);
  expect(titleElement).toBeInTheDocument();
});
