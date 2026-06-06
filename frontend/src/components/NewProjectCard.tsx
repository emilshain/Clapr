import React from 'react';

export default function NewProjectCard({ onCancel, onStart }: { onCancel: () => void; onStart: () => void }) {
  return (
    <div className="new-project-card" style={{ padding: 20 }}>
      <h3 style={{ marginTop: 0 }}>New Project</h3>
      <p style={{ marginBottom: 12, color: 'rgba(226,232,240,0.78)' }}>Start a new project card. This opens the setup workflow.</p>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="primary-action" type="button" onClick={onStart}>
          Start setup
        </button>
        <button className="secondary-action" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
