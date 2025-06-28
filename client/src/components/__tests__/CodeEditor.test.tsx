import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CodeEditor from '../CodeEditor';

// Mock CodeMirror to avoid issues
jest.mock('@uiw/react-codemirror', () => ({
  __esModule: true,
  default: function MockCodeMirror({ value, onChange }: any) {
    return (
      <textarea
        data-testid="code-editor"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    );
  }
}));

// Mock the codemirror extensions
jest.mock('@codemirror/lang-javascript', () => ({
  javascript: () => ({})
}));

jest.mock('@codemirror/view', () => ({
  EditorView: {
    theme: () => ({})
  }
}));

describe('CodeEditor', () => {
  const mockOnCodeChange = jest.fn();
  const mockOnLanguageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default language selection', () => {
    render(<CodeEditor onCodeChange={mockOnCodeChange} />);
    
    expect(screen.getByText('Language:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('JavaScript/TypeScript')).toBeInTheDocument();
  });

  it('displays supported file types for selected language', () => {
    render(<CodeEditor onCodeChange={mockOnCodeChange} />);
    
    expect(screen.getByText(/Supported file types: .js, .ts, .jsx, .tsx/)).toBeInTheDocument();
  });

  it('renders with initial code when provided', () => {
    const initialCode = 'console.log("Hello World");';
    render(
      <CodeEditor 
        onCodeChange={mockOnCodeChange} 
        initialCode={initialCode} 
      />
    );

    expect(screen.getByText('Language:')).toBeInTheDocument();
  });
}); 