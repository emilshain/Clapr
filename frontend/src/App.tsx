import { FormEvent, useMemo, useState } from 'react';
import NewProjectCard from './components/NewProjectCard';

type Step = 'dashboard' | 'setup' | 'storyboard' | 'scenes' | 'references' | 'shots' | 'export';
type ShotStatus = 'todo' | 'done';

type Project = {
  id: number;
  name: string;
  scriptTitle: string;
  date: string;
  platforms: string[];
  references: string[];
  referenceMap: ProjectReferenceMap;
  shotsDone: number;
  shotsTotal: number;
  exported: boolean;
};

type ReferenceCategory = 'people' | 'props' | 'locations';

type ProjectReferenceMap = Record<ReferenceCategory, string>;

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

type MultiShotSuggestion = {
  id: string;
  title: string;
  shotIds: number[];
  model: string;
  duration: string;
  refs: string;
  generationMode: 'single prompt' | 'continuous prompts';
  prompt: string;
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
const referenceCategories: { id: ReferenceCategory; label: string; placeholder: string }[] = [
  { id: 'people', label: 'People', placeholder: 'Lead actor -> @lead_ref_01' },
  { id: 'props', label: 'Props', placeholder: 'Hero phone -> @phone_ref_01' },
  { id: 'locations', label: 'Locations', placeholder: 'Studio table -> @studio_ref_01' },
];



const initialProjects: Project[] = [
  {
    id: 1,
    name: 'Monsoon Launch Film',
    scriptTitle: 'The first rain',
    date: 'Jun 6, 2026',
    platforms: ['Kling', 'Veo'],
    references: ['@lead_ref_01', '@rain_ref_02'],
    referenceMap: {
      people: 'Lead -> @lead_ref_01',
      props: 'Rain glass texture -> @rain_ref_02',
      locations: 'Studio table -> @room_ref_02',
    },
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
    references: ['@founder_ref_01'],
    referenceMap: {
      people: 'Founder -> @founder_ref_01',
      props: '',
      locations: 'Office corner -> @office_ref_01',
    },
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

function parseReferenceIds(input: string) {
  return Array.from(new Set(input.match(/@[A-Za-z0-9_-]+/g) ?? []));
}

function collectReferenceIds(referenceMap: ProjectReferenceMap) {
  return parseReferenceIds(Object.values(referenceMap).join('\n'));
}

function createReferenceMapFromText(input: string): ProjectReferenceMap {
  return {
    people: input,
    props: '',
    locations: '',
  };
}

function countReferenceLines(input: string) {
  return input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean).length;
}

function buildReferencePrompt(category: ReferenceCategory, project: Project) {
  const base = `Create a clean reference image sheet for every ${category} that appears across all scenes in ${project.name}.`;

  if (category === 'people') {
    return `${base} Keep the same face, wardrobe, and lighting continuity for each person so the generated reference IDs can be reused in later shots.`;
  }

  if (category === 'props') {
    return `${base} Show each prop in a neutral studio composition with readable shape, scale, and material detail. If your generator requires a Soul ID or model-specific asset ID, capture it from the generated image output before moving on.`;
  }

  return `${base} Keep the background simple and consistent, with enough visual separation that the resulting reference IDs can be reused in every scene.`;
}

function sortShotsByStatus(shots: Shot[]) {
  return [...shots].sort((left, right) => {
    const leftRank = left.status === 'todo' ? 0 : 1;
    const rightRank = right.status === 'todo' ? 0 : 1;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return left.id - right.id;
  });
}

function suggestMultiShots(shots: Shot[]) {
  const byScene = shots.reduce<Record<string, Shot[]>>((groups, shot) => {
    groups[shot.scene] = [...(groups[shot.scene] ?? []), shot];
    return groups;
  }, {});

  return Object.entries(byScene).flatMap(([scene, sceneShots]) => {
    const orderedSceneShots = [...sceneShots].sort((left, right) => left.id - right.id);
    const modelGroups = orderedSceneShots.reduce<Shot[][]>((groups, shot) => {
      const lastGroup = groups[groups.length - 1];

      if (lastGroup && lastGroup[0].model === shot.model) {
        lastGroup.push(shot);
        return groups;
      }

      groups.push([shot]);
      return groups;
    }, []);

    return modelGroups
      .filter((group) => group.length > 1)
      .map((group) => {
        const shotIds = group.map((shot) => shot.id);
        const refs = Array.from(new Set(parseReferenceIds(group.map((shot) => shot.refs).join(', ')))).join(', ');
        const durations = group.map((shot) => shot.duration).join(' + ');
        const generationMode: 'single prompt' | 'continuous prompts' = group.length === 2 ? 'single prompt' : 'continuous prompts';
        const model = group[0].model;

        return {
          id: `${scene}-${model}-${shotIds.join('-')}`,
          title: `${scene}: ${model} multishot`,
          shotIds,
          model,
          duration: durations,
          refs: refs || 'No refs assigned',
          generationMode,
          prompt:
            generationMode === 'single prompt'
              ? `Generate shots ${shotIds.map((id) => String(id).padStart(2, '0')).join(' + ')} in one prompt, keeping the same model, lighting, camera grammar, and reference IDs consistent across both shots.`
              : `Generate shots ${shotIds.map((id) => String(id).padStart(2, '0')).join(' → ')} as continuous prompts with the same model, preserving continuity from one shot to the next across framing, timing, action, and reference IDs.`,
        };
      });
  });
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
  const [recentScene, setRecentScene] = useState('');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? projects[0];
  const orderedShots = useMemo(() => sortShotsByStatus(shots), [shots]);
  const multiShotSuggestions = useMemo(() => suggestMultiShots(shots), [shots]);
  const doneCount = shots.filter((shot) => shot.status === 'done').length;
  const completion = progressPercent(doneCount, shots.length);
  const selectedShot = orderedShots.find((shot) => shot.id === selectedShotId) ?? orderedShots[0];
  const sceneOptions = useMemo(() => scenes.map((scene) => scene.title), [scenes]);
  const shotsForRecentScene = useMemo(() => {
    const filtered = orderedShots.filter((shot) => shot.scene === recentScene);
    return filtered.length ? filtered : orderedShots;
  }, [orderedShots, recentScene]);

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
      references: parseReferenceIds(form.references),
      referenceMap: createReferenceMapFromText(form.references),
      shotsDone: form.skipStoryboard && form.skipScenes ? 0 : doneCount,
      shotsTotal: shots.length,
      exported: false,
    };

    setProjects((current) => [newProject, ...current]);
    setActiveProjectId(newProject.id);
    setSelectedProject(newProject.id);
    setRecentScene(scenes[0]?.title ?? '');
    setStep(form.skipStoryboard ? (form.skipScenes ? 'references' : 'scenes') : 'storyboard');
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

  function updateProjectReferenceMap(category: ReferenceCategory, value: string) {
    setProjects((current) =>
      current.map((project) => {
        if (project.id !== activeProjectId) {
          return project;
        }

        const referenceMap = { ...project.referenceMap, [category]: value };
        return { ...project, referenceMap, references: collectReferenceIds(referenceMap) };
      }),
    );
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
        <button className="brand-block" onClick={() => setStep('dashboard')} type="button">
          <p className="eyebrow">Clapr</p>
          <h1>Prompt studio</h1>
        </button>

        <div className="project-progress">
          <span>{activeProject.name}</span>
          <div className="meter" aria-label={`${completion}% complete`}>
            <span style={{ width: `${completion}%` }} />
          </div>
          <strong>{completion}%</strong>
        </div>

        <button className="secondary-action" onClick={() => setStep('setup')} type="button">
          New Project
        </button>
      </header>

      <div className="app-body">
        <aside className="sidebar" aria-label="Sidebar navigation">
          <section className="sidebar-section">
            <p className="eyebrow">Recents</p>

            <label>
              <span>Project</span>
              <select
                value={selectedProject ? String(selectedProject) : ''}
                onChange={(event) => {
                  const val = event.target.value;
                  if (val) {
                    const id = Number(val);
                    setActiveProjectId(id);
                    setSelectedProject(id);
                    setRecentScene('');
                    setStep('dashboard');
                  } else {
                    setSelectedProject(null);
                    setRecentScene('');
                  }
                }}
              >
                <option value="">Select project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedProject && (
              <label>
                <span>Scene</span>
                <select
                  value={recentScene}
                  onChange={(event) => {
                    const val = event.target.value;
                    setRecentScene(val);
                    if (val) {
                      setStep('scenes');
                    }
                  }}
                >
                  <option value="">Select scene...</option>
                  {sceneOptions.map((sceneName) => (
                    <option key={sceneName} value={sceneName}>
                      {sceneName}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {selectedProject && recentScene && (
              <label>
                <span>Shot</span>
                <select
                  value={String(selectedShot.id)}
                  onChange={(event) => {
                    setSelectedShotId(Number(event.target.value));
                    setStep('shots');
                  }}
                >
                  <option value="">Select shot...</option>
                  {shotsForRecentScene.map((shot) => (
                    <option key={shot.id} value={shot.id}>
                      {`Shot ${String(shot.id).padStart(2, '0')} - ${shot.scene}`}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </section>
        </aside>

        <section className="workspace">
        {step === 'dashboard' ? (
          <Dashboard
            projects={projects}
            onNew={(draft) => {
              setForm((current) => ({
                ...current,
                projectName: draft.projectName,
                script: draft.script,
                references: draft.references,
                notes: draft.notes,
              }));
              setStep('setup');
            }}
            onOpen={(projectId) => {
              setActiveProjectId(projectId);
              setSelectedProject(projectId);
              setRecentScene(scenes[0]?.title ?? '');
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
            onConfirm={() => setStep(form.skipScenes ? 'references' : 'scenes')}
          />
        ) : null}

        {step === 'scenes' ? (
          <Scenes
            scenes={scenes}
            onSceneChange={setScenes}
            onBack={() => setStep(form.skipStoryboard ? 'setup' : 'storyboard')}
            onConfirm={() => setStep('references')}
          />
        ) : null}

        {step === 'references' ? (
          <ReferenceMapStep
            project={activeProject}
            onChange={updateProjectReferenceMap}
            onBack={() => setStep(form.skipScenes ? (form.skipStoryboard ? 'setup' : 'storyboard') : 'scenes')}
            onConfirm={() => setStep('shots')}
          />
        ) : null}

        {step === 'shots' ? (
          <Shots
            shots={orderedShots}
            multiShotSuggestions={multiShotSuggestions}
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
      </div>
    </main>
  );
}

function Dashboard({
  projects,
  onNew,
  onOpen,
}: {
  projects: Project[];
  onNew: (draft: { projectName: string; script: string; references: string; notes: string }) => void;
  onOpen: (projectId: number) => void;
}) {
  const [showCard, setShowCard] = useState(false);

  return (
    <div className="view">
      <header className="view-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Projects</h2>
        </div>
        <button className="primary-action" onClick={() => setShowCard(true)} type="button" title="New Project">
          + New Project
        </button>
      </header>

      {showCard ? (
        <div style={{ padding: 20 }}>
          <NewProjectCard
            onCancel={() => setShowCard(false)}
            onCreate={(draft) => {
              setShowCard(false);
              onNew(draft);
            }}
          />
        </div>
      ) : (
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
                <div className="reference-row">
                  <span className="reference-label">Reference map</span>
                  <div className="chip-grid compact">
                    {referenceCategories.map((category) => (
                      <span className="chip selected" key={category.id}>
                        {category.label}: {countReferenceLines(project.referenceMap[category.id])}
                      </span>
                    ))}
                  </div>
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
      )}
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

function ReferenceMapStep({
  project,
  onChange,
  onBack,
  onConfirm,
}: {
  project: Project;
  onChange: (category: ReferenceCategory, value: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="view">
      <header className="view-header">
        <div>
          <p className="eyebrow">Reference map</p>
          <h2>Generate image prompts, then capture reference IDs</h2>
        </div>
        <div className="action-row">
          <button className="secondary-action" onClick={onBack} type="button">
            Back
          </button>
          <button className="primary-action" onClick={onConfirm} type="button">
            Continue to shots
          </button>
        </div>
      </header>

      <div className="reference-step-grid">
        <section className="reference-prompt-panel" aria-label="Reference image prompts">
          <div className="panel-heading-row">
            <div>
              <p className="eyebrow">Prompt prep</p>
              <h3>Generate images for everything shared across the scenes</h3>
            </div>
            <span className="reference-label">Global assets</span>
          </div>

          <div className="reference-prompt-grid">
            {referenceCategories.map((category) => (
              <article className="reference-prompt-card" key={category.id}>
                <div className="card-topline">
                  <span>{category.label}</span>
                  <span>{project.references.length ? 'Linked' : 'Needs IDs'}</span>
                </div>
                <p>{buildReferencePrompt(category.id, project)}</p>
                <div className="multishot-footer">
                  <span>{category.placeholder}</span>
                  <button className="secondary-action" type="button">
                    Copy prompt
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="reference-note">
            If a generator uses Soul IDs or another model-specific asset ID, generate the image first, capture that ID, and paste it into the matching field below.
          </div>
        </section>

        <ReferenceMapPanel project={project} onChange={onChange} />
      </div>
    </div>
  );
}

function Shots({
  shots,
  multiShotSuggestions,
  selectedShot,
  onSelect,
  onStatus,
  onUpdate,
  onExport,
}: {
  shots: Shot[];
  multiShotSuggestions: MultiShotSuggestion[];
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
              <span className={`status-dot ${shot.status}`} />
            </button>
          ))}
        </div>

        <div className="shot-workspace">
          <MultiShotPanel suggestions={multiShotSuggestions} />

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
    </div>
  );
}

function MultiShotPanel({ suggestions }: { suggestions: MultiShotSuggestion[] }) {
  return (
    <section className="multishot-panel" aria-label="Suggested multishots">
      <div className="panel-heading-row">
        <div>
          <p className="eyebrow">Multishots</p>
          <h3>Same-model batch groups</h3>
        </div>
        <span className="reference-label">{suggestions.length} suggestions</span>
      </div>

      <div className="multishot-grid">
        {suggestions.map((suggestion) => (
          <article className="multishot-card" key={suggestion.id}>
            <div className="card-topline">
              <span>{suggestion.model}</span>
              <span>{suggestion.duration}</span>
            </div>
            <h4>{suggestion.title}</h4>
            <div className="card-topline">
              <span>{suggestion.generationMode}</span>
              <span>{suggestion.shotIds.length} shots</span>
            </div>
            <div className="platform-row">
              {suggestion.shotIds.map((shotId) => (
                <span key={shotId}>Shot {String(shotId).padStart(2, '0')}</span>
              ))}
            </div>
            <p>{suggestion.prompt}</p>
            <div className="multishot-footer">
              <span>{suggestion.refs}</span>
              <button className="secondary-action" type="button">
                Queue batch
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReferenceMapPanel({
  project,
  onChange,
}: {
  project: Project;
  onChange: (category: ReferenceCategory, value: string) => void;
}) {
  return (
    <section className="reference-map-panel" aria-label="Project reference map">
      <div>
        <p className="eyebrow">Project reference map</p>
        <h3>People, props, and locations</h3>
      </div>

      <div className="reference-map-grid">
        {referenceCategories.map((category) => (
          <label key={category.id}>
            <span>{category.label}</span>
            <textarea
              value={project.referenceMap[category.id]}
              onChange={(event) => onChange(category.id, event.target.value)}
              placeholder={category.placeholder}
              rows={4}
            />
          </label>
        ))}
      </div>
    </section>
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
