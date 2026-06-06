import { FormEvent, useState } from 'react';

type NewProjectDraft = {
  projectName: string;
  script: string;
  timeLimit: string;
  notes: string;
};

export default function NewProjectCard({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (draft: NewProjectDraft) => void;
}) {
  const [draft, setDraft] = useState<NewProjectDraft>({
    projectName: '',
    script: '',
    timeLimit: '',
    notes: '',
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate(draft);
  }

  return (
    <form className="new-project-form" onSubmit={handleSubmit}>
      <div className="form-grid compact">
        <label>
          <span>Project name</span>
          <input
            value={draft.projectName}
            onChange={(event) => setDraft((current) => ({ ...current, projectName: event.target.value }))}
            placeholder="Launch film, teaser, music video..."
          />
        </label>

        <label>
          <span>Time limit</span>
          <input
            value={draft.timeLimit}
            onChange={(event) => setDraft((current) => ({ ...current, timeLimit: event.target.value }))}
            placeholder="60s, 90s, 120s..."
          />
        </label>

        <label className="span-two">
          <span>Script / summary</span>
          <textarea
            value={draft.script}
            onChange={(event) => setDraft((current) => ({ ...current, script: event.target.value }))}
            placeholder="Paste a script or short summary..."
            rows={4}
          />
        </label>

        <label className="span-two">
          <span>Notes</span>
          <textarea
            value={draft.notes}
            onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
            placeholder="Optional notes for setup..."
            rows={3}
          />
        </label>
      </div>

      <div className="card-actions" style={{ marginTop: 16 }}>
        <button className="secondary-action" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary-action" type="submit">
          Continue to setup
        </button>
      </div>
    </form>
  );
}
