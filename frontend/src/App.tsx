import { FormEvent, useMemo, useState } from 'react';

type Step = 'dashboard' | 'setup' | 'storyboard' | 'scenes' | 'shots' | 'export';
type ShotStatus = 'todo' | 'done';

type Project = {
  id: number;
  name: string;
  scriptTitle: string;
  date: string;
  platforms: string[];
  shotsDone: number;
  shotsTotal: number;
  exported: boolean;
};

type Beat = {
  id: number;
  title: string;
  frame: string;
  mood: string;
  duration: string;
};

type Scene = {
  id: number;
  title: string;
  location: string;
  time: string;
  description: string;
  shots: number;
  duration: string;
};

type Shot = {
  id: number;
  scene: string;
  size: string;
  motion: string;
  duration: string;
  model: string;
  refs: string;
  firstFrame: string;
  prompt: string;
  status: ShotStatus;
  note: string;
};

type SetupForm = {
  projectName: string;
  script: string;
  timeLimit: string;
  platforms: string[];
  references: string;
  notes: string;
  skipStoryboard: boolean;
  skipScenes: boolean;
};

const platformOptions = ['Kling', 'Veo', 'Higgsfield', 'Runway'];
const modelOptions = ['Kling 3.0', 'Veo 3', 'Higgsfield Soul', 'Runway Gen-4'];

const initialProjects: Project[] = [
  {
    id: 1,
    name: 'Monsoon Launch Film',
    scriptTitle: 'The first rain',
    date: 'Jun 6, 2026',
    platforms: ['Kling', 'Veo'],
    shotsDone: 7,
    shotsTotal: 12,
    exported: true,
  },
  {
    id: 2,
    name: 'Founder Teaser',
    scriptTitle: 'Three promises',
    date: 'Jun 5, 2026',
    platforms: ['Higgsfield'],
    shotsDone: 2,
    shotsTotal: 9,
    exported: false,
  },
];

const defaultBeats: Beat[] = [
  {
    id: 1,
    title: 'Opening contrast',
    frame: 'A silent worktable lit by morning window light, empty storyboard frames waiting.',
    mood: 'Measured, expectant',
    duration: '6s',
  },
  {
    id: 2,
    title: 'Character intent',
    frame: 'The lead studies a pinned reference map, then marks the shot order with confidence.',
    mood: 'Focused, tactile',
    duration: '8s',
  },
  {
    id: 3,
    title: 'Momentum turn',
    frame: 'A quick sequence of generated frames becoming finished clips on a clean timeline.',
    mood: 'Precise, energetic',
    duration: '10s',
  },
];

const defaultScenes: Scene[] = [
  {
    id: 1,
    title: 'Planning Room',
    location: 'Studio table',
    time: 'Morning',
    description: 'The creator converts the script into visual intent, references, and timing.',
    shots: 3,
    duration: '18s',
  },
  {
    id: 2,
    title: 'Generation Pass',
    location: 'Interface montage',
    time: 'Day',
    description: 'Shot prompts are shaped for the selected video models and checked one by one.',
    shots: 4,
    duration: '24s',
  },
  {
    id: 3,
    title: 'Execution Track',
    location: 'Desktop',
    time: 'Evening',
    description: 'Finished clips are marked done until the project is ready to archive or export.',
    shots: 5,
    duration: '28s',
  },
];

const defaultShots: Shot[] = [
  {
    id: 1,
    scene: 'Planning Room',
    size: 'Wide',
    motion: 'Slow push in',
    duration: '6s',
    model: 'Kling 3.0',
    refs: '@lead_ref_01',
    firstFrame: 'Studio table with script pages, reference thumbnails, and a clean shot grid.',
    prompt: 'Wide cinematic studio table, morning window light, script pages beside reference map, slow push in, tactile planning mood, realistic detail.',
    status: 'todo',
    note: '',
  },
  {
    id: 2,
    scene: 'Planning Room',
    size: 'Medium Close-Up',
    motion: 'Dolly in',
    duration: '4s',
    model: 'Veo 3',
    refs: '@lead_ref_01',
    firstFrame: 'Creator hand circling the key line in a printed script.',
    prompt: 'Medium close-up of creator marking a key script line, dolly in, soft paper texture, focused calm, natural color, no text overlays.',
    status: 'done',
    note: 'Clip link added in external tracker.',
  },
  {
    id: 3,
    scene: 'Generation Pass',
    size: 'Insert',
    motion: 'Static',
    duration: '5s',
    model: 'Higgsfield Soul',
    refs: '@lead_ref_01, @room_ref_02',
    firstFrame: 'Prompt card with model, duration, and reference ids arranged in a compact workspace.',
    prompt: 'Clean interface insert, prompt card for a video model, visible reference tokens, compact professional workflow, crisp light, realistic UI surface.',
    status: 'todo',
    note: '',
  },
  {
    id: 4,
    scene: 'Generation Pass',
    size: 'Tracking',
    motion: 'Left to right',
    duration: '7s',
    model: 'Runway Gen-4',
    refs: '@timeline_ref_01',
    firstFrame: 'Shot cards advancing from draft to done on a horizontal timeline.',
    prompt: 'Tracking move across shot cards, draft prompts becoming done clips, restrained product interface, sharp motion, editorial rhythm.',
    status: 'todo',
    note: '',
  },
];

const emptyForm: SetupForm = {
  projectName: '',
  script: '',
  timeLimit: '',
  platforms: ['Kling', 'Veo'],
  references: 'Lead -> @lead_ref_01',
  notes: '',
  skipStoryboard: false,
  skipScenes: false,
};

function progressPercent(done: number, total: number) {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export default function App() {
  const [step, setStep] = useState<Step>('dashboard');
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState(1);
  const [form, setForm] = useState<SetupForm>(emptyForm);
  const [beats, setBeats] = useState(defaultBeats);
  const [scenes, setScenes] = useState(defaultScenes);
  const [shots, setShots] = useState(defaultShots);
  const [selectedShotId, setSelectedShotId] = useState(1);
  const [exportFormat, setExportFormat] = useState('JSON');
  const [exportFilter, setExportFilter] = useState('All shots');

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? projects[0];
  const doneCount = shots.filter((shot) => shot.status === 'done').length;
  const completion = progressPercent(doneCount, shots.length);
  const selectedShot = shots.find((shot) => shot.id === selectedShotId) ?? shots[0];

  const exportPreview = useMemo(() => {
    const filtered = shots.filter((shot) => {
      if (exportFilter === 'Done only') {
        return shot.status === 'done';
      }
      if (exportFilter === 'Needs work') {
        return shot.status === 'todo';
      }
      if (exportFilter === 'First frames') {
        return Boolean(shot.firstFrame);
      }
      return true;
    });

    if (exportFormat === 'CSV') {
      return ['shot,scene,model,status,prompt', ...filtered.map((shot) => `${shot.id},${shot.scene},${shot.model},${shot.status},"${shot.prompt}"`)].join('\n');
    }

    if (exportFormat === 'Plain text') {
      return filtered.map((shot) => `Shot ${shot.id} - ${shot.model}\n${shot.prompt}`).join('\n\n');
    }

    return JSON.stringify(filtered, null, 2);
  }, [exportFilter, exportFormat, shots]);

  function updateProjectProgress(nextShots: Shot[]) {
    const nextDone = nextShots.filter((shot) => shot.status === 'done').length;
    setProjects((current) =>
      current.map((project) =>
        project.id === activeProjectId
          ? { ...project, shotsDone: nextDone, shotsTotal: nextShots.length }
          : project,
      ),
    );
  }

  function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newProject: Project = {
      id: Date.now(),
      name: form.projectName.trim() || 'Untitled Project',
      scriptTitle: form.script.trim().split('\n')[0] || 'Pasted script',
      date: 'Jun 6, 2026',
      platforms: form.platforms,
      shotsDone: form.skipStoryboard && form.skipScenes ? 0 : doneCount,
      shotsTotal: shots.length,
      exported: false,
    };

    setProjects((current) => [newProject, ...current]);
    setActiveProjectId(newProject.id);
    setStep(form.skipStoryboard ? (form.skipScenes ? 'shots' : 'scenes') : 'storyboard');
  }

  function togglePlatform(platform: string) {
    setForm((current) => {
      const hasPlatform = current.platforms.includes(platform);
      const platforms = hasPlatform
        ? current.platforms.filter((item) => item !== platform)
        : [...current.platforms, platform];

      return { ...current, platforms: platforms.length ? platforms : [platform] };
    });
  }

  function toggleShotStatus(id: number) {
    const nextShots = shots.map((shot) =>
      shot.id === id
        ? { ...shot, status: (shot.status === 'done' ? 'todo' : 'done') as ShotStatus }
        : shot,
    );
    setShots(nextShots);
    updateProjectProgress(nextShots);
  }

  function updateShot(id: number, key: keyof Shot, value: string) {
    const nextShots = shots.map((shot) => (shot.id === id ? { ...shot, [key]: value } : shot));
    setShots(nextShots);
    updateProjectProgress(nextShots);
  }

  function saveExport() {
    setProjects((current) =>
      current.map((project) =>
        project.id === activeProjectId ? { ...project, exported: true, shotsDone: doneCount, shotsTotal: shots.length } : project,
      ),
    );
    setStep('dashboard');
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <p className="eyebrow">Clapr</p>
          <h1>Prompt studio</h1>
        </div>

        <nav className="workflow-tabs" aria-label="Workflow">
          {[
            ['dashboard', 'Dashboard'],
            ['setup', 'Setup'],
            ['storyboard', 'Storyboard'],
            ['scenes', 'Scenes'],
            ['shots', `Shots ${doneCount}/${shots.length}`],
            ['export', 'Export'],
          ].map(([id, label]) => (
            <button
              className={step === id ? 'workflow-tab active' : 'workflow-tab'}
              key={id}
              onClick={() => setStep(id as Step)}
              type="button"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="project-progress">
          <span>{activeProject.name}</span>
          <div className="meter" aria-label={`${completion}% complete`}>
            <span style={{ width: `${completion}%` }} />
          </div>
          <strong>{completion}%</strong>
        </div>
      </header>

      <section className="workspace">
        {step === 'dashboard' ? (
          <Dashboard
            projects={projects}
            onNew={() => setStep('setup')}
            onOpen={(projectId) => {
              setActiveProjectId(projectId);
              setStep('shots');
            }}
          />
        ) : null}

        {step === 'setup' ? (
          <Setup
            form={form}
            onChange={setForm}
            onSubmit={handleCreateProject}
            onTogglePlatform={togglePlatform}
          />
        ) : null}

        {step === 'storyboard' ? (
          <Storyboard
            beats={beats}
            onBeatChange={setBeats}
            onBack={() => setStep('setup')}
            onConfirm={() => setStep(form.skipScenes ? 'shots' : 'scenes')}
          />
        ) : null}

        {step === 'scenes' ? (
          <Scenes
            scenes={scenes}
            onSceneChange={setScenes}
            onBack={() => setStep(form.skipStoryboard ? 'setup' : 'storyboard')}
            onConfirm={() => setStep('shots')}
          />
        ) : null}

        {step === 'shots' ? (
          <Shots
            shots={shots}
            selectedShot={selectedShot}
            onSelect={setSelectedShotId}
            onStatus={toggleShotStatus}
            onUpdate={updateShot}
            onExport={() => setStep('export')}
          />
        ) : null}

        {step === 'export' ? (
          <ExportPanel
            exportFilter={exportFilter}
            exportFormat={exportFormat}
            exportPreview={exportPreview}
            onFilter={setExportFilter}
            onFormat={setExportFormat}
            onSave={saveExport}
          />
        ) : null}
      </section>
    </main>
  );
}

function Dashboard({
  projects,
  onNew,
  onOpen,
}: {
  projects: Project[];
  onNew: () => void;
  onOpen: (projectId: number) => void;
}) {
  return (
    <div className="view">
      <header className="view-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Projects</h2>
        </div>
        <button className="primary-action" onClick={onNew} type="button" title="New Project">
          + New Project
        </button>
      </header>

      <div className="project-grid">
        {projects.map((project) => {
          const percent = progressPercent(project.shotsDone, project.shotsTotal);
          return (
            <article className="project-card" key={project.id}>
              <div className="card-topline">
                <span>{project.date}</span>
                <span>{project.exported ? 'Exported' : 'Draft'}</span>
              </div>
              <h3>{project.name}</h3>
              <p>{project.scriptTitle}</p>
              <div className="platform-row">
                {project.platforms.map((platform) => (
                  <span key={platform}>{platform}</span>
                ))}
              </div>
              <div className="timeline-strip" aria-label={`${percent}% complete`}>
                {Array.from({ length: project.shotsTotal }).map((_, index) => (
                  <span className={index < project.shotsDone ? 'complete' : ''} key={index} />
                ))}
              </div>
              <div className="card-actions">
                <span>{project.shotsDone} done</span>
                <button onClick={() => onOpen(project.id)} type="button">
                  Resume
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Setup({
  form,
  onChange,
  onSubmit,
  onTogglePlatform,
}: {
  form: SetupForm;
  onChange: (form: SetupForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTogglePlatform: (platform: string) => void;
}) {
  return (
    <form className="view form-view" onSubmit={onSubmit}>
      <header className="view-header">
        <div>
          <p className="eyebrow">New project setup</p>
          <h2>Script to shot plan</h2>
        </div>
        <button className="primary-action" type="submit">
          Generate
        </button>
      </header>

      <div className="form-grid">
        <label>
          <span>Project name</span>
          <input
            value={form.projectName}
            onChange={(event) => onChange({ ...form, projectName: event.target.value })}
            placeholder="Launch film, teaser, music video..."
          />
        </label>

        <label>
          <span>Total time limit</span>
          <input
            value={form.timeLimit}
            onChange={(event) => onChange({ ...form, timeLimit: event.target.value })}
            placeholder="Optional, e.g. 60 seconds"
          />
        </label>

        <label className="span-two">
          <span>Script</span>
          <textarea
            value={form.script}
            onChange={(event) => onChange({ ...form, script: event.target.value })}
            placeholder="Paste the script here, or note the uploaded file name..."
            rows={8}
          />
        </label>

        <div className="field span-two">
          <span>Platforms</span>
          <div className="chip-grid">
            {platformOptions.map((platform) => (
              <button
                className={form.platforms.includes(platform) ? 'chip selected' : 'chip'}
                key={platform}
                onClick={() => onTogglePlatform(platform)}
                type="button"
              >
                {platform}
                {platform === 'Kling' ? <small>AI suggested</small> : null}
              </button>
            ))}
          </div>
        </div>

        <label>
          <span>Reference map</span>
          <textarea
            value={form.references}
            onChange={(event) => onChange({ ...form, references: event.target.value })}
            placeholder="Character -> @ref_id"
            rows={5}
          />
        </label>

        <label>
          <span>Extra notes</span>
          <textarea
            value={form.notes}
            onChange={(event) => onChange({ ...form, notes: event.target.value })}
            placeholder="Style direction, restrictions, mood..."
            rows={5}
          />
        </label>

        <div className="toggle-row span-two">
          <label className="toggle">
            <input
              checked={form.skipStoryboard}
              onChange={(event) => onChange({ ...form, skipStoryboard: event.target.checked })}
              type="checkbox"
            />
            <span>Skip storyboard confirmation</span>
          </label>
          <label className="toggle">
            <input
              checked={form.skipScenes}
              onChange={(event) => onChange({ ...form, skipScenes: event.target.checked })}
              type="checkbox"
            />
            <span>Skip scene confirmation</span>
          </label>
        </div>
      </div>
    </form>
  );
}

function Storyboard({
  beats,
  onBeatChange,
  onBack,
  onConfirm,
}: {
  beats: Beat[];
  onBeatChange: (beats: Beat[]) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="view">
      <header className="view-header">
        <div>
          <p className="eyebrow">Storyboard</p>
          <h2>Confirm visual beats</h2>
        </div>
        <div className="action-row">
          <button className="secondary-action" onClick={onBack} type="button">
            Back
          </button>
          <button className="primary-action" onClick={onConfirm} type="button">
            Confirm Storyboard
          </button>
        </div>
      </header>

      <div className="beat-list">
        {beats.map((beat, index) => (
          <article className="editor-row" key={beat.id}>
            <span className="index-pill">Beat {index + 1}</span>
            <label>
              <span>Title</span>
              <input
                value={beat.title}
                onChange={(event) =>
                  onBeatChange(beats.map((item) => (item.id === beat.id ? { ...item, title: event.target.value } : item)))
                }
              />
            </label>
            <label className="wide-field">
              <span>Frame description</span>
              <textarea
                value={beat.frame}
                onChange={(event) =>
                  onBeatChange(beats.map((item) => (item.id === beat.id ? { ...item, frame: event.target.value } : item)))
                }
                rows={3}
              />
            </label>
            <label>
              <span>Mood</span>
              <input
                value={beat.mood}
                onChange={(event) =>
                  onBeatChange(beats.map((item) => (item.id === beat.id ? { ...item, mood: event.target.value } : item)))
                }
              />
            </label>
            <label>
              <span>Duration</span>
              <input
                value={beat.duration}
                onChange={(event) =>
                  onBeatChange(beats.map((item) => (item.id === beat.id ? { ...item, duration: event.target.value } : item)))
                }
              />
            </label>
            <button className="secondary-action" type="button">
              Refine
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

function Scenes({
  scenes,
  onSceneChange,
  onBack,
  onConfirm,
}: {
  scenes: Scene[];
  onSceneChange: (scenes: Scene[]) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="view">
      <header className="view-header">
        <div>
          <p className="eyebrow">Scene breakdown</p>
          <h2>Merge, split, or rewrite scenes</h2>
        </div>
        <div className="action-row">
          <button className="secondary-action" onClick={onBack} type="button">
            Back
          </button>
          <button className="primary-action" onClick={onConfirm} type="button">
            Confirm Scenes
          </button>
        </div>
      </header>

      <div className="scene-grid">
        {scenes.map((scene) => (
          <article className="scene-card" key={scene.id}>
            <label>
              <span>Scene title</span>
              <input
                value={scene.title}
                onChange={(event) =>
                  onSceneChange(scenes.map((item) => (item.id === scene.id ? { ...item, title: event.target.value } : item)))
                }
              />
            </label>
            <div className="two-col">
              <label>
                <span>Location</span>
                <input
                  value={scene.location}
                  onChange={(event) =>
                    onSceneChange(scenes.map((item) => (item.id === scene.id ? { ...item, location: event.target.value } : item)))
                  }
                />
              </label>
              <label>
                <span>Time</span>
                <input
                  value={scene.time}
                  onChange={(event) =>
                    onSceneChange(scenes.map((item) => (item.id === scene.id ? { ...item, time: event.target.value } : item)))
                  }
                />
              </label>
            </div>
            <label>
              <span>Description</span>
              <textarea
                value={scene.description}
                onChange={(event) =>
                  onSceneChange(scenes.map((item) => (item.id === scene.id ? { ...item, description: event.target.value } : item)))
                }
                rows={4}
              />
            </label>
            <div className="scene-meta">
              <span>{scene.shots} shots</span>
              <span>{scene.duration}</span>
              <button className="secondary-action" type="button">
                Rewrite
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Shots({
  shots,
  selectedShot,
  onSelect,
  onStatus,
  onUpdate,
  onExport,
}: {
  shots: Shot[];
  selectedShot: Shot;
  onSelect: (id: number) => void;
  onStatus: (id: number) => void;
  onUpdate: (id: number, key: keyof Shot, value: string) => void;
  onExport: () => void;
}) {
  return (
    <div className="view shot-view">
      <header className="view-header">
        <div>
          <p className="eyebrow">Shot generation</p>
          <h2>Prompts ready for external tools</h2>
        </div>
        <button className="primary-action" onClick={onExport} type="button">
          Export
        </button>
      </header>

      <div className="shot-layout">
        <div className="shot-list" aria-label="Generated shots">
          {shots.map((shot) => (
            <button
              className={selectedShot.id === shot.id ? 'shot-tab active' : 'shot-tab'}
              key={shot.id}
              onClick={() => onSelect(shot.id)}
              type="button"
            >
              <span>Shot {String(shot.id).padStart(2, '0')}</span>
              <small>{shot.size} / {shot.duration}</small>
              <strong>{shot.status === 'done' ? 'Done' : 'To do'}</strong>
            </button>
          ))}
        </div>

        <article className="shot-detail">
          <div className="shot-title-row">
            <div>
              <span className="index-pill">Shot {String(selectedShot.id).padStart(2, '0')}</span>
              <h3>{selectedShot.size} / {selectedShot.motion} / {selectedShot.duration}</h3>
            </div>
            <button className={selectedShot.status === 'done' ? 'done-button' : 'primary-action'} onClick={() => onStatus(selectedShot.id)} type="button">
              {selectedShot.status === 'done' ? 'Marked Done' : 'Mark Done'}
            </button>
          </div>

          <div className="form-grid compact">
            <label>
              <span>Model</span>
              <select
                value={selectedShot.model}
                onChange={(event) => onUpdate(selectedShot.id, 'model', event.target.value)}
              >
                {modelOptions.map((model) => (
                  <option key={model}>{model}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Refs</span>
              <input
                value={selectedShot.refs}
                onChange={(event) => onUpdate(selectedShot.id, 'refs', event.target.value)}
              />
            </label>
            <label className="span-two">
              <span>First frame prompt</span>
              <textarea
                value={selectedShot.firstFrame}
                onChange={(event) => onUpdate(selectedShot.id, 'firstFrame', event.target.value)}
                rows={3}
              />
            </label>
            <label className="span-two">
              <span>Final prompt</span>
              <textarea
                value={selectedShot.prompt}
                onChange={(event) => onUpdate(selectedShot.id, 'prompt', event.target.value)}
                rows={5}
              />
            </label>
            <label className="span-two">
              <span>Note or clip link</span>
              <input
                value={selectedShot.note}
                onChange={(event) => onUpdate(selectedShot.id, 'note', event.target.value)}
                placeholder="Paste clip link or execution note..."
              />
            </label>
          </div>

          <div className="action-row">
            <button className="secondary-action" type="button" title="Copy prompt">
              Copy
            </button>
            <button className="secondary-action" type="button">
              Regen
            </button>
            <button className="secondary-action" type="button">
              Refine selected shot
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}

function ExportPanel({
  exportFilter,
  exportFormat,
  exportPreview,
  onFilter,
  onFormat,
  onSave,
}: {
  exportFilter: string;
  exportFormat: string;
  exportPreview: string;
  onFilter: (filter: string) => void;
  onFormat: (format: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="view">
      <header className="view-header">
        <div>
          <p className="eyebrow">Export</p>
          <h2>Package prompts and first frames</h2>
        </div>
        <button className="primary-action" onClick={onSave} type="button">
          Save Project
        </button>
      </header>

      <div className="export-toolbar">
        <label>
          <span>Format</span>
          <select value={exportFormat} onChange={(event) => onFormat(event.target.value)}>
            <option>JSON</option>
            <option>CSV</option>
            <option>Plain text</option>
          </select>
        </label>
        <label>
          <span>Filter</span>
          <select value={exportFilter} onChange={(event) => onFilter(event.target.value)}>
            <option>All shots</option>
            <option>Done only</option>
            <option>Needs work</option>
            <option>First frames</option>
          </select>
        </label>
      </div>

      <pre className="export-preview">{exportPreview}</pre>
    </div>
  );
}
