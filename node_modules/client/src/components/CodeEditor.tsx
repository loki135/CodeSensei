import { useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from '@codemirror/view';

interface CodeEditorProps {
  onCodeChange: (code: string) => void;
  onLanguageChange?: (language: string) => void;
  initialCode?: string;
}

const languages = [
  { id: 'javascript', name: 'JavaScript/TypeScript', extensions: ['.js', '.ts', '.jsx', '.tsx'] },
  { id: 'python', name: 'Python', extensions: ['.py'] },
  { id: 'java', name: 'Java', extensions: ['.java'] },
  { id: 'cpp', name: 'C++', extensions: ['.cpp', '.hpp', '.cc', '.h'] },
];

const editorTheme = EditorView.theme({
  '&': {
    height: '400px',
    fontSize: '14px',
  },
  '.cm-content': {
    fontFamily: 'monospace',
  },
  '.cm-line': {
    padding: '0 8px',
  },
});

export default function CodeEditor({ onCodeChange, onLanguageChange, initialCode = '' }: CodeEditorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const handleLanguageChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value;
    setSelectedLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  }, [onLanguageChange]);

  const handleCodeChange = useCallback((value: string) => {
    onCodeChange(value);
  }, [onCodeChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label htmlFor="language" className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Language:
        </label>
        <select
          id="language"
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
        >
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border rounded-md overflow-hidden dark:border-gray-700">
        <CodeMirror
          value={initialCode}
          height="400px"
          theme={editorTheme}
          extensions={[javascript()]}
          onChange={handleCodeChange}
          className="text-sm"
        />
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Supported file types: {languages.find(lang => lang.id === selectedLanguage)?.extensions.join(', ')}
      </div>
    </div>
  );
} 