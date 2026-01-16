import React from 'react';

export const SimpleMarkdown = ({ children }: { children: string }) => {
  if (!children) return null;
  
  // 1. Pre-process to normalize newlines
  const text = children.replace(/\r\n/g, '\n');
  
  // 2. Split into blocks by double newline
  const blocks = text.split(/\n\n+/);
  
  return (
    <div className="space-y-4 text-slate-700">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        
        // Header ###
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={i} className="text-lg font-bold text-slate-900 mt-6 mb-2">
              {parseInline(trimmed.replace(/^###\s+/, ''))}
            </h3>
          );
        }
        
        // Header ##
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={i} className="text-xl font-bold text-slate-900 mt-8 mb-4 border-b pb-2">
              {parseInline(trimmed.replace(/^##\s+/, ''))}
            </h2>
          );
        }

        // Blockquote >
        if (trimmed.startsWith('> ')) {
            return (
                <blockquote key={i} className="border-l-4 border-slate-300 pl-4 py-2 italic text-slate-600 bg-slate-50 rounded-r">
                    {parseInline(trimmed.replace(/^>\s+/, '').replace(/\n>\s+/g, '\n'))}
                </blockquote>
            );
        }

        // List (simple detection, if block starts with - )
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const items = trimmed.split('\n').map(line => line.replace(/^[-*]\s+/, ''));
            return (
                <ul key={i} className="list-disc list-outside ml-6 space-y-1">
                    {items.map((item, j) => (
                        <li key={j}>{parseInline(item)}</li>
                    ))}
                </ul>
            );
        }

        // Check for bold headers at start of paragraph (e.g. **【风险】** xxx)
        // If it starts with bold, we might want to handle it slightly differently or ensure it breaks nicely
        const isBoldStart = trimmed.startsWith('**');
        
        return (
          <div key={i} className="mb-4">
             <p className={`leading-loose text-justify text-lg ${isBoldStart ? '' : 'indent-8'}`}>
                {parseInline(trimmed)}
             </p>
          </div>
        );
      })}
    </div>
  );
};

// Helper to parse **bold**
function parseInline(text: string): React.ReactNode {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}
