import { render, screen } from '@testing-library/react';
import App from './App';

test('renders portfolio application', () => {
  render(<App />);
  // Check for the main header text
  const element = screen.getByText(/QuantEdge Portfolio Intelligence/i);
  expect(element).toBeInTheDocument();
});
