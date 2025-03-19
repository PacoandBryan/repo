import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AddProductWizard from '../AddProductWizard';
import { translateText } from '../../../services/TranslationService';
import { addProduct } from '../../../services/ProductService';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toBeDisabled(): R;
    }
  }
}

// Mock the services
jest.mock('../../../services/TranslationService');
jest.mock('../../../services/ProductService');

describe('AddProductWizard', () => {
  const mockOnClose = jest.fn();
  const mockOnProductAdded = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the translation service
    (translateText as jest.Mock).mockResolvedValue('Translated text');
    
    // Mock the product service
    (addProduct as jest.Mock).mockResolvedValue(undefined);
  });

  it('renders the first step by default', () => {
    render(
      <AddProductWizard
        onClose={mockOnClose}
        onProductAdded={mockOnProductAdded}
      />
    );

    // Check if step 1 elements are present
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('handles language switching', () => {
    render(
      <AddProductWizard
        onClose={mockOnClose}
        onProductAdded={mockOnProductAdded}
      />
    );

    // Switch to Spanish
    fireEvent.click(screen.getByText('ES'));
    
    // Check if language switch worked
    expect(screen.getByText('ES')).toHaveClass('bg-[#f09bc0]');
    expect(screen.getByText('EN')).not.toHaveClass('bg-[#f09bc0]');
  });

  it('handles translation requests', async () => {
    render(
      <AddProductWizard
        onClose={mockOnClose}
        onProductAdded={mockOnProductAdded}
      />
    );

    // Enter text and click translate
    const titleInput = screen.getByLabelText(/Title/i);
    await userEvent.type(titleInput, 'Hello');
    
    const translateButton = screen.getByText('Translate');
    fireEvent.click(translateButton);

    // Wait for translation
    await waitFor(() => {
      expect(translateText).toHaveBeenCalledWith('Hello', 'en', 'es');
    });
  });

  it('validates required fields before proceeding to next step', () => {
    render(
      <AddProductWizard
        onClose={mockOnClose}
        onProductAdded={mockOnProductAdded}
      />
    );

    const nextButton = screen.getByText('Next: Images');
    expect(nextButton).toBeDisabled();

    // Fill in required fields
    const titleInput = screen.getByLabelText(/Title/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const priceInput = screen.getByLabelText(/Price/i);
    const categorySelect = screen.getByLabelText(/Category/i);

    userEvent.type(titleInput, 'Test Product');
    userEvent.type(descriptionInput, 'Test Description');
    userEvent.type(priceInput, '99.99');
    userEvent.selectOptions(categorySelect, 'dresses');

    expect(nextButton).not.toBeDisabled();
  });

  it('handles image upload', async () => {
    render(
      <AddProductWizard
        onClose={mockOnClose}
        onProductAdded={mockOnProductAdded}
      />
    );

    // Navigate to step 2
    const nextButton = screen.getByText('Next: Images');
    fireEvent.click(nextButton);

    // Create a mock file
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    
    // Get the file input and simulate upload
    const input = screen.getByLabelText(/Upload Images/i);
    await userEvent.upload(input, file);

    // Check if image preview is shown
    expect(screen.getByAltText('Product preview')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(
      <AddProductWizard
        onClose={mockOnClose}
        onProductAdded={mockOnProductAdded}
      />
    );

    // Fill in form data
    const titleInput = screen.getByLabelText(/Title/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const priceInput = screen.getByLabelText(/Price/i);
    const categorySelect = screen.getByLabelText(/Category/i);

    await userEvent.type(titleInput, 'Test Product');
    await userEvent.type(descriptionInput, 'Test Description');
    await userEvent.type(priceInput, '99.99');
    await userEvent.selectOptions(categorySelect, 'dresses');

    // Navigate through steps
    fireEvent.click(screen.getByText('Next: Images'));
    fireEvent.click(screen.getByText('Next: Watermark'));
    fireEvent.click(screen.getByText('Next: Preview'));

    // Submit the form
    fireEvent.click(screen.getByText('Add Product'));

    // Wait for submission to complete
    await waitFor(() => {
      expect(addProduct).toHaveBeenCalled();
      expect(mockOnProductAdded).toHaveBeenCalled();
    });
  });

  it('closes the wizard when cancel is clicked', () => {
    render(
      <AddProductWizard
        onClose={mockOnClose}
        onProductAdded={mockOnProductAdded}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
}); 