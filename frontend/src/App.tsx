import { FormEvent, useMemo, useState } from 'react';
import NewProjectCard from './components/NewProjectCard';

type Step = 'dashboard' | 'create' | 'project' | 'setup' | 'storyboard' | 'scenes' | 'references' | 'shotDemo' | 'shots' | 'export';
type ShotStatus = 'todo' | 'done';
type ProjectStage = 'setup' | 'storyboard' | 'scenes' | 'references' | 'shots' | 'export';

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
  stage: ProjectStage;
  exported: boolean;
};

type ImageReferenceCategory = 'people' | 'props' | 'locations';
type ReferenceCategory = ImageReferenceCategory | 'soulIds';

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
  referenceMap: ProjectReferenceMap;
  notes: string;
  skipStoryboard: boolean;
  skipScenes: boolean;
};

type ReferenceEntry = {
  name: string;
  refId: string;
};

type PromptSheetPrompt = {
  title: string;
  prompt: string;
};

type IndividualImagePrompt = PromptSheetPrompt & {
  meta: string;
};



const platformOptions = ['Kling', 'Veo', 'Higgsfield', 'Runway'];
const modelOptions = ['Kling 3.0', 'Veo 3', 'Higgsfield Soul', 'Runway Gen-4'];
const imageReferenceCategories: { id: ImageReferenceCategory; label: string; placeholder: string }[] = [
  { id: 'people', label: 'People', placeholder: 'Lead actor -> @lead_ref_01' },
  { id: 'props', label: 'Props', placeholder: 'Hero phone -> @phone_ref_01' },
  { id: 'locations', label: 'Locations', placeholder: 'Studio table -> @studio_ref_01' },
];

const referenceCategories: { id: ReferenceCategory; label: string; placeholder: string }[] = [
  ...imageReferenceCategories,
  { id: 'soulIds', label: 'Soul IDs', placeholder: '@host_ref_01 -> soul_host_01' },
];

const defaultPromptSheetPrompts: Record<ImageReferenceCategory, PromptSheetPrompt> = {
  people: {
    title: 'People sheet',
    prompt:
      'Create a clean people reference sheet for a product demo film. Include every person needed for the demo, with consistent face, wardrobe, posture range, lighting, and neutral background. Separate each person clearly and label the intended reference ID.',
  },
  props: {
    title: 'Props sheet',
    prompt:
      'Create a clean props reference sheet for a product demo film. Include every reusable object, device, screen state, product detail, and handheld item. Show each prop isolated with readable shape, scale, material, and the intended reference ID.',
  },
  locations: {
    title: 'Location sheet',
    prompt:
      'Create a clean locations reference sheet for a product demo film. Include every recurring environment, desk setup, background, and screen-facing workspace. Keep perspective, lighting, mood, and visual anchors consistent for reuse across scenes.',
  },
};



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
      soulIds: '@lead_ref_01 -> soul_lead_01',
    },
    shotsDone: 7,
    shotsTotal: 12,
    stage: 'export',
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
      soulIds: '@founder_ref_01 -> soul_founder_01',
    },
    shotsDone: 2,
    shotsTotal: 9,
    stage: 'shots',
    exported: false,
  },
  {
    id: 3,
    name: 'Product Demo Draft',
    scriptTitle: 'Opening walkthrough',
    date: 'Jun 4, 2026',
    platforms: ['Runway'],
    references: ['@host_ref_01'],
    referenceMap: {
      people: 'Host -> @host_ref_01',
      props: 'Demo laptop -> @laptop_ref_01',
      locations: 'Demo desk setup -> @desk_ref_01\nProduct UI backdrop -> @ui_backdrop_ref_01',
      soulIds: '@host_ref_01 -> soul_host_01\n@laptop_ref_01 -> soul_laptop_01',
    },
    shotsDone: 0,
    shotsTotal: 0,
    stage: 'references',
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
  referenceMap: {
    people: 'Lead -> @lead_ref_01',
    props: '',
    locations: '',
    soulIds: '',
  },
  notes: '',
  skipStoryboard: false,
  skipScenes: false,
};

function progressPercent(done: number, total: number) {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function sceneNumber(index: number) {
  return `Scene ${String(index + 1).padStart(2, '0')}`;
}

function isDraftProject(project: Project) {
  return !['shots', 'export'].includes(project.stage);
}

function projectStageLabel(stage: ProjectStage) {
  const labels: Record<ProjectStage, string> = {
    setup: 'Setup',
    storyboard: 'Storyboard',
    scenes: 'Scenes',
    references: 'References',
    shots: 'Shot creation',
    export: 'Exported',
  };

  return labels[stage];
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
    soulIds: '',
  };
}

function parseReferenceEntries(input: string, idToId = false): ReferenceEntry[] {
  return input
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      const [left = '', right = ''] = trimmed.split(/\s*(?:->|=>|:)\s*/, 2);
      if (idToId) {
        return {
          name: left.trim() || 'Missing source ID',
          refId: right.trim(),
        };
      }

      const refId = trimmed.match(/@[A-Za-z0-9_-]+/)?.[0] ?? '';
      const name = trimmed
        .replace(/@[A-Za-z0-9_-]+/g, '')
        .replace(/\s*(->|=>|:)\s*$/g, '')
        .trim();

      return {
        name: name || 'Unnamed reference',
        refId,
      };
    })
    .filter((entry) => entry.name !== 'Unnamed reference' || entry.refId);
}

function serializeReferenceEntries(entries: ReferenceEntry[]) {
  return entries.map((entry) => `${entry.name} -> ${entry.refId}`.trim()).join('\n');
}

function buildReferencePrompt(category: ImageReferenceCategory, project: Project) {
  const base = `Create a clean reference image sheet for every ${category} that appears across all scenes in ${project.name}.`;

  if (category === 'people') {
    return `${base} Keep the same face, wardrobe, and lighting continuity for each person so the generated reference IDs can be reused in later shots.`;
  }

  if (category === 'props') {
    return `${base} Show each prop in a neutral studio composition with readable shape, scale, and material detail.`;
  }

  return `${base} Keep the background simple and consistent, with enough visual separation that the resulting reference IDs can be reused in every scene.`;
}

function buildIndividualImagePrompt(category: ImageReferenceCategory, entry: ReferenceEntry, project: Project) {
  const refHint = entry.refId ? ` Save or label the output as ${entry.refId}.` : '';

  if (category === 'people') {
    return `Generate one clean character reference image for ${entry.name} in ${project.name}. Use a neutral studio background, consistent face, wardrobe, natural lighting, front-facing three-quarter pose, and enough detail for later video continuity.${refHint}`;
  }

  if (category === 'props') {
    return `Generate one clean prop reference image for ${entry.name} in ${project.name}. Show the object isolated on a neutral surface with readable scale, shape, material, color, and key details for reuse in later shots.${refHint}`;
  }

  return `Generate one clean location reference image for ${entry.name} in ${project.name}. Show the full environment with stable lighting, camera angle, background details, spatial layout, and visual anchors that can be reused across scenes.${refHint}`;
}

function buildIndividualImagePrompts(project: Project): IndividualImagePrompt[] {
  return imageReferenceCategories.flatMap((category) =>
    parseReferenceEntries(project.referenceMap[category.id]).map((entry) => ({
      title: entry.name,
      meta: `${category.label}${entry.refId ? ` / ${entry.refId}` : ''}`,
      prompt: buildIndividualImagePrompt(category.id, entry, project),
    })),
  );
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
              : `Generate shots ${shotIds.map((id) => String(id).padStart(2, '0')).join(' -> ')} as continuous prompts with the same model, preserving continuity from one shot to the next across framing, timing, action, and reference IDs.`,
        };
      });
  });
}

type IconName =
  | 'bookmark'
  | 'bookmarkOff'
  | 'chart'
  | 'check'
  | 'chevronLeft'
  | 'chevronDown'
  | 'chevronRight'
  | 'clapperboard'
  | 'edit'
  | 'eye'
  | 'folder'
  | 'inbox'
  | 'search'
  | 'settings'
  | 'sparkle'
  | 'trash';

function Icon({ name, className = 'ui-icon' }: { name: IconName; className?: string }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.8,
  };

  return (
    <svg aria-hidden="true" className={className} focusable="false" viewBox="0 0 24 24">
      {name === 'bookmark' && <path {...common} d="M7 4.5h10v16l-5-3-5 3z" />}
      {name === 'bookmarkOff' && (
        <>
          <path {...common} d="m4 4 16 16" />
          <path {...common} d="M8.8 4.5H17v11.8" />
          <path {...common} d="M7 8.2v12.3l5-3 2.3 1.4" />
        </>
      )}
      {name === 'chart' && (
        <>
          <path {...common} d="M4 19V5" />
          <path {...common} d="M4 19h16" />
          <path {...common} d="m8 15 3.5-4 3 2 4.5-6" />
        </>
      )}
      {name === 'check' && <path {...common} d="m5 12 5 5L20 7" />}
      {name === 'chevronLeft' && <path {...common} d="m15 6-6 6 6 6" />}
      {name === 'chevronDown' && <path {...common} d="m7 10 5 5 5-5" />}
      {name === 'chevronRight' && <path {...common} d="m9 6 6 6-6 6" />}
      {name === 'clapperboard' && (
        <>
          <path {...common} d="M4 8h16v12H4z" />
          <path {...common} d="M4 8 6 4h16l-2 4" />
          <path {...common} d="m10 4-2 4" />
          <path {...common} d="m16 4-2 4" />
        </>
      )}
      {name === 'edit' && (
        <>
          <path {...common} d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4z" />
          <path {...common} d="m13.5 6.5 4 4" />
        </>
      )}
      {name === 'eye' && (
        <>
          <path {...common} d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
          <circle {...common} cx="12" cy="12" r="2.5" />
        </>
      )}
      {name === 'folder' && (
        <>
          <path {...common} d="M3.5 6.5h6l2 2h10v11h-18z" />
          <path {...common} d="M3.5 10h18" />
        </>
      )}
      {name === 'inbox' && (
        <>
          <path {...common} d="M4 4h16l2 10v6H2v-6z" />
          <path {...common} d="M8 14h2a2 2 0 0 0 4 0h2" />
        </>
      )}
      {name === 'search' && (
        <>
          <circle {...common} cx="11" cy="11" r="6" />
          <path {...common} d="m16 16 4 4" />
        </>
      )}
      {name === 'settings' && (
        <>
          <circle {...common} cx="12" cy="12" r="3" />
          <path {...common} d="M12 2.5v3" />
          <path {...common} d="M12 18.5v3" />
          <path {...common} d="m4.6 4.6 2.1 2.1" />
          <path {...common} d="m17.3 17.3 2.1 2.1" />
          <path {...common} d="M2.5 12h3" />
          <path {...common} d="M18.5 12h3" />
          <path {...common} d="m4.6 19.4 2.1-2.1" />
          <path {...common} d="m17.3 6.7 2.1-2.1" />
        </>
      )}
      {name === 'sparkle' && (
        <>
          <path {...common} d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
          <path {...common} d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
        </>
      )}
      {name === 'trash' && (
        <>
          <path {...common} d="M5 7h14" />
          <path {...common} d="M10 11v6" />
          <path {...common} d="M14 11v6" />
          <path {...common} d="M8 7l1-3h6l1 3" />
          <path {...common} d="M7 7l1 14h8l1-14" />
        </>
      )}
    </svg>
  );
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
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);
  const [expandedSceneTitle, setExpandedSceneTitle] = useState<string | null>(null);
  const [stepHistory, setStepHistory] = useState<Step[]>([]);
  const [favoriteProjectIds, setFavoriteProjectIds] = useState<number[]>([1]);
  const [sidebarNotice, setSidebarNotice] = useState('');

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? projects[0];
  const favoriteProjects = projects.filter((project) => favoriteProjectIds.includes(project.id));
  const draftProjects = projects.filter(isDraftProject);
  const recentProjects = projects.filter((project) => !favoriteProjectIds.includes(project.id) && !isDraftProject(project));
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

  function navigateTo(nextStep: Step) {
    if (step === nextStep) {
      return;
    }

    setStepHistory((currentHistory) => [...currentHistory, step].slice(-20));
    setStep(nextStep);
  }

  function updateActiveProjectStage(stage: ProjectStage) {
    setProjects((current) =>
      current.map((project) =>
        project.id === activeProjectId ? { ...project, stage } : project,
      ),
    );
  }

  function goToStep(nextStep: Step) {
    if (nextStep === 'shotDemo') {
      updateActiveProjectStage('shots');
    } else if (['setup', 'storyboard', 'scenes', 'references', 'shots', 'export'].includes(nextStep)) {
      updateActiveProjectStage(nextStep as ProjectStage);
    }

    navigateTo(nextStep);
  }

  function goBack() {
    setStepHistory((currentHistory) => {
      const previousStep = currentHistory.at(-1);
      if (!previousStep) {
        setStep('dashboard');
        return [];
      }

      setStep(previousStep);
      return currentHistory.slice(0, -1);
    });
  }

  function openProject(projectId: number) {
    const project = projects.find((item) => item.id === projectId);
    setActiveProjectId(projectId);
    setSelectedProject(projectId);
    setExpandedProjectId(projectId);
    setExpandedSceneTitle(null);
    setRecentScene('');
    navigateTo(project && isDraftProject(project) ? project.stage : 'project');
  }

  function openScene(sceneName: string) {
    setRecentScene(sceneName);
    setExpandedSceneTitle(sceneName);
    const firstSceneShot = orderedShots.find((shot) => shot.scene === sceneName);
    if (firstSceneShot) {
      setSelectedShotId(firstSceneShot.id);
    }
    navigateTo('scenes');
  }

  function openShot(shotId: number) {
    const shot = orderedShots.find((item) => item.id === shotId);
    if (shot) {
      setRecentScene(shot.scene);
      setExpandedSceneTitle(shot.scene);
    }
    setSelectedShotId(shotId);
    goToStep('shots');
  }

  function isSceneComplete(sceneName: string) {
    const sceneShots = orderedShots.filter((shot) => shot.scene === sceneName);
    return sceneShots.length > 0 && sceneShots.every((shot) => shot.status === 'done');
  }

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
    const nextStep = form.skipStoryboard ? (form.skipScenes ? 'references' : 'scenes') : 'storyboard';
    const newProject: Project = {
      id: Date.now(),
      name: form.projectName.trim() || 'Untitled Project',
      scriptTitle: form.script.trim().split('\n')[0] || 'Pasted script',
      date: 'Jun 6, 2026',
      platforms: form.platforms,
      references: collectReferenceIds(form.referenceMap),
      referenceMap: form.referenceMap,
      shotsDone: form.skipStoryboard && form.skipScenes ? 0 : doneCount,
      shotsTotal: shots.length,
      stage: nextStep,
      exported: false,
    };

    setProjects((current) => [newProject, ...current]);
    setActiveProjectId(newProject.id);
    setSelectedProject(newProject.id);
    setRecentScene(scenes[0]?.title ?? '');
    navigateTo(nextStep);
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

  function toggleProjectComplete(projectId: number) {
    const project = projects.find((item) => item.id === projectId);
    if (!project) {
      return;
    }

    const shouldComplete = project.shotsDone < project.shotsTotal;

    setProjects((current) =>
      current.map((item) =>
        item.id === projectId
          ? {
              ...item,
              shotsDone: shouldComplete ? item.shotsTotal : 0,
            }
          : item,
      ),
    );

    if (projectId === activeProjectId) {
      const nextStatus: ShotStatus = shouldComplete ? 'done' : 'todo';
      setShots((currentShots) =>
        currentShots.map((shot) => ({
          ...shot,
          status: nextStatus,
        })),
      );
    }
  }

  function toggleSceneComplete(sceneName: string) {
    const sceneShots = shots.filter((shot) => shot.scene === sceneName);
    const shouldComplete = sceneShots.some((shot) => shot.status !== 'done');
    const nextStatus: ShotStatus = shouldComplete ? 'done' : 'todo';
    const nextShots = shots.map((shot) =>
      shot.scene === sceneName ? { ...shot, status: nextStatus } : shot,
    );

    setShots(nextShots);
    updateProjectProgress(nextShots);
  }

  function toggleProjectFavorite(projectId: number) {
    setFavoriteProjectIds((current) =>
      current.includes(projectId)
        ? current.filter((id) => id !== projectId)
        : [...current, projectId],
    );
  }

  function renderProjectSidebarGroup(project: Project, options: { showCompleteToggle: boolean }) {
    const isProjectExpanded = expandedProjectId === project.id;
    const isProjectComplete = !isDraftProject(project) && project.shotsDone >= project.shotsTotal;
    const isProjectFavorite = favoriteProjectIds.includes(project.id);

    return (
      <div key={project.id} className="sidebar-project-group">
        <div
          className={[
            'sidebar-row',
            options.showCompleteToggle ? '' : 'favorite-sidebar-row',
            activeProjectId === project.id ? 'active' : '',
            options.showCompleteToggle && isProjectComplete ? 'is-complete' : '',
          ].filter(Boolean).join(' ')}
        >
          {options.showCompleteToggle && (
            <button
              className="sidebar-check-btn"
              onClick={() => toggleProjectComplete(project.id)}
              title={isProjectComplete ? 'Mark project active' : 'Mark project complete'}
              type="button"
            >
              <span className={isProjectComplete ? 'sidebar-checkbox checked' : 'sidebar-checkbox'} />
            </button>
          )}
          <button
            className="sidebar-item-main"
            onClick={() => {
              setActiveProjectId(project.id);
              setExpandedProjectId(isProjectExpanded ? null : project.id);
              setExpandedSceneTitle(null);
              openProject(project.id);
            }}
            type="button"
          >
            <Icon name="folder" className="project-bullet" />
            <span className="project-title-text">{project.name}</span>
          </button>
          <button
            className={isProjectFavorite ? 'sidebar-favorite-btn active' : 'sidebar-favorite-btn'}
            onClick={() => toggleProjectFavorite(project.id)}
            title={isProjectFavorite ? 'Remove favorite' : 'Add favorite'}
            type="button"
          >
            <Icon name={isProjectFavorite ? 'bookmarkOff' : 'bookmark'} />
          </button>
          <button
            className="sidebar-expand-btn"
            onClick={() => {
              setActiveProjectId(project.id);
              setExpandedProjectId(isProjectExpanded ? null : project.id);
              setExpandedSceneTitle(null);
            }}
            title={isProjectExpanded ? 'Collapse project' : 'Expand project'}
            type="button"
          >
            <Icon name={isProjectExpanded ? 'chevronDown' : 'chevronRight'} className="expansion-caret" />
          </button>
        </div>

        {isProjectExpanded && (
          <div className="sidebar-nested-scenes">
            {sceneOptions.map((sceneName, sceneIndex) => {
              const isSceneExpanded = expandedSceneTitle === sceneName;
              const sceneComplete = isSceneComplete(sceneName);
              return (
                <div key={sceneName} className="sidebar-scene-group">
                  <div
                    className={[
                      'sidebar-row',
                      recentScene === sceneName && step === 'scenes' ? 'active' : '',
                      sceneComplete ? 'is-complete' : '',
                    ].filter(Boolean).join(' ')}
                    style={{ fontSize: '0.85rem' }}
                  >
                    <button
                      className="sidebar-check-btn"
                      onClick={() => toggleSceneComplete(sceneName)}
                      title={sceneComplete ? 'Mark scene active' : 'Mark scene complete'}
                      type="button"
                    >
                      <span className={sceneComplete ? 'sidebar-checkbox checked' : 'sidebar-checkbox'} />
                    </button>
                    <button
                      className="sidebar-item-main"
                      onClick={() => {
                        setRecentScene(sceneName);
                        setExpandedSceneTitle(isSceneExpanded ? null : sceneName);
                        openScene(sceneName);
                      }}
                      type="button"
                    >
                      <Icon name="clapperboard" className="scene-bullet" />
                      <span className="scene-title-text">
                        <span className="scene-number-label">{sceneNumber(sceneIndex)}</span>
                        {sceneName}
                      </span>
                    </button>
                    <button
                      className="sidebar-expand-btn"
                      onClick={() => {
                        setRecentScene(sceneName);
                        setExpandedSceneTitle(isSceneExpanded ? null : sceneName);
                      }}
                      title={isSceneExpanded ? 'Collapse scene' : 'Expand scene'}
                      type="button"
                    >
                      <Icon name={isSceneExpanded ? 'chevronDown' : 'chevronRight'} className="expansion-caret" />
                    </button>
                  </div>

                  {isSceneExpanded && (
                    <div className="sidebar-nested-shots">
                      {orderedShots
                        .filter((shot) => shot.scene === sceneName)
                        .map((shot) => (
                          <div
                            key={shot.id}
                            className={[
                              'sidebar-row',
                              selectedShotId === shot.id && step === 'shots' ? 'active' : '',
                              shot.status === 'done' ? 'is-complete' : '',
                            ].filter(Boolean).join(' ')}
                            style={{ fontSize: '0.8rem', paddingLeft: '8px' }}
                          >
                            <button
                              className="sidebar-check-btn"
                              onClick={() => toggleShotStatus(shot.id)}
                              title={shot.status === 'done' ? 'Mark shot active' : 'Mark shot complete'}
                              type="button"
                            >
                              <span className={shot.status === 'done' ? 'sidebar-checkbox checked' : 'sidebar-checkbox'} />
                            </button>
                            <button
                              className="sidebar-item-main"
                              onClick={() => {
                                openShot(shot.id);
                              }}
                              type="button"
                            >
                              <span>Shot {String(shot.id).padStart(2, '0')}</span>
                            </button>
                            <span className={`status-dot ${shot.status}`} />
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function deleteProject(projectId: number) {
    setProjects((current) => {
      const nextProjects = current.filter((project) => project.id !== projectId);
      if (activeProjectId === projectId) {
        const nextActiveProject = nextProjects[0];
        if (nextActiveProject) {
          setActiveProjectId(nextActiveProject.id);
          setSelectedProject(nextActiveProject.id);
          setExpandedProjectId(nextActiveProject.id);
        } else {
          setSelectedProject(null);
          setExpandedProjectId(null);
        }
        navigateTo('dashboard');
      }
      return nextProjects;
    });
    setFavoriteProjectIds((current) => current.filter((id) => id !== projectId));
  }

  function deleteScene(sceneId: number) {
    const scene = scenes.find((item) => item.id === sceneId);
    if (!scene) {
      return;
    }

    const nextScenes = scenes.filter((item) => item.id !== sceneId);
    const nextShots = shots.filter((shot) => shot.scene !== scene.title);
    setScenes(nextScenes);
    setShots(nextShots);
    updateProjectProgress(nextShots);

    if (recentScene === scene.title) {
      setRecentScene(nextScenes[0]?.title ?? '');
      setExpandedSceneTitle(null);
    }
  }

  function deleteShot(shotId: number) {
    const nextShots = shots.filter((shot) => shot.id !== shotId);
    setShots(nextShots);
    updateProjectProgress(nextShots);
    if (selectedShotId === shotId && nextShots.length) {
      setSelectedShotId(nextShots[0].id);
    }
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
        project.id === activeProjectId
          ? { ...project, stage: 'export', exported: true, shotsDone: doneCount, shotsTotal: shots.length }
          : project,
      ),
    );
    navigateTo('dashboard');
  }

  function showSidebarNotice(message: string) {
    setSidebarNotice(message);
    window.setTimeout(() => {
      setSidebarNotice((current) => (current === message ? '' : current));
    }, 1600);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Sidebar navigation">
        {/* Workspace selector / header */}
        <div className="sidebar-workspace-header">
          <button className="workspace-selector-btn" onClick={() => navigateTo('dashboard')} type="button">
            <Icon name="clapperboard" className="clapr-logo-icon" />
            <span className="workspace-name">Clapr</span>
            <Icon name="chevronDown" className="dropdown-caret" />
          </button>
          <div className="workspace-header-actions">
            <button className="icon-btn" title="Search" onClick={() => showSidebarNotice('Search is ready in the project index.')} type="button">
              <Icon name="search" />
            </button>
            <button className="icon-btn" title="New Project" onClick={() => {
              setForm(emptyForm);
              navigateTo('create');
            }}>
              <Icon name="edit" />
            </button>
          </div>
        </div>
        {sidebarNotice ? <div className="sidebar-notice">{sidebarNotice}</div> : null}

        {/* Global Navigation Section */}
        <div className="sidebar-nav-section">
          <button className={step === 'dashboard' ? 'sidebar-nav-item active' : 'sidebar-nav-item'} onClick={() => navigateTo('dashboard')}>
            <Icon name="inbox" className="nav-icon" />
            <span>Dashboard</span>
          </button>
        </div>

        <section className="sidebar-section">
          <p className="eyebrow">Favorites</p>
          <div className="sidebar-list">
            {favoriteProjects.map((project) => (
              <div
                className={[
                  'favorite-sidebar-row',
                  activeProjectId === project.id ? 'active' : '',
                ].filter(Boolean).join(' ')}
                key={project.id}
              >
                <button className="favorite-sidebar-main" onClick={() => openProject(project.id)} type="button">
                  <span className="project-title-text">{project.name}</span>
                </button>
                <button
                  className="sidebar-favorite-btn"
                  onClick={() => toggleProjectFavorite(project.id)}
                  title="Remove favorite"
                  type="button"
                >
                  <Icon name="bookmarkOff" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="sidebar-section">
          <p className="eyebrow">Drafts</p>
          <div className="sidebar-list">
            {draftProjects.length ? (
              draftProjects.map((project) => (
                <button
                  className={[
                    'draft-sidebar-row',
                    activeProjectId === project.id ? 'active' : '',
                  ].filter(Boolean).join(' ')}
                  key={project.id}
                  onClick={() => openProject(project.id)}
                  type="button"
                >
                  <span className="project-title-text">{project.name}</span>
                  <span className="draft-sidebar-stage">{projectStageLabel(project.stage)}</span>
                </button>
              ))
            ) : (
              <p className="sidebar-empty-copy">No drafts</p>
            )}
          </div>
        </section>

        <section className="sidebar-section">
          <p className="eyebrow">Recents</p>
          <div className="sidebar-list">
            {recentProjects.map((project) => {
              const isProjectExpanded = expandedProjectId === project.id;
              const isProjectComplete = !isDraftProject(project) && project.shotsDone >= project.shotsTotal;
              const isProjectFavorite = favoriteProjectIds.includes(project.id);
              return (
                <div key={project.id} className="sidebar-project-group">
                  <div
                    className={[
                      'sidebar-row',
                      activeProjectId === project.id ? 'active' : '',
                      isProjectComplete ? 'is-complete' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <button
                      className="sidebar-check-btn"
                      onClick={() => toggleProjectComplete(project.id)}
                      title={isProjectComplete ? 'Mark project active' : 'Mark project complete'}
                      type="button"
                    >
                      <span className={isProjectComplete ? 'sidebar-checkbox checked' : 'sidebar-checkbox'} />
                    </button>
                    <button
                      className="sidebar-item-main"
                      onClick={() => {
                        setActiveProjectId(project.id);
                        setExpandedProjectId(isProjectExpanded ? null : project.id);
                        setExpandedSceneTitle(null);
                        openProject(project.id);
                      }}
                      type="button"
                    >
                      <Icon name="folder" className="project-bullet" />
                      <span className="project-title-text">{project.name}</span>
                    </button>
                    <button
                      className={isProjectFavorite ? 'sidebar-favorite-btn active' : 'sidebar-favorite-btn'}
                      onClick={() => toggleProjectFavorite(project.id)}
                      title={isProjectFavorite ? 'Remove favorite' : 'Add favorite'}
                      type="button"
                    >
                      <Icon name={isProjectFavorite ? 'bookmarkOff' : 'bookmark'} />
                    </button>
                    <button
                      className="sidebar-expand-btn"
                      onClick={() => {
                        setActiveProjectId(project.id);
                        setExpandedProjectId(isProjectExpanded ? null : project.id);
                        setExpandedSceneTitle(null);
                      }}
                      title={isProjectExpanded ? 'Collapse project' : 'Expand project'}
                      type="button"
                    >
                      <Icon name={isProjectExpanded ? 'chevronDown' : 'chevronRight'} className="expansion-caret" />
                    </button>
                  </div>

                  {isProjectExpanded && (
                    <div className="sidebar-nested-scenes">
                      {sceneOptions.map((sceneName, sceneIndex) => {
                        const isSceneExpanded = expandedSceneTitle === sceneName;
                        const sceneComplete = isSceneComplete(sceneName);
                        return (
                          <div key={sceneName} className="sidebar-scene-group">
                            <div
                              className={[
                                'sidebar-row',
                                recentScene === sceneName && step === 'scenes' ? 'active' : '',
                                sceneComplete ? 'is-complete' : '',
                              ].filter(Boolean).join(' ')}
                              style={{ fontSize: '0.85rem' }}
                            >
                              <button
                                className="sidebar-check-btn"
                                onClick={() => toggleSceneComplete(sceneName)}
                                title={sceneComplete ? 'Mark scene active' : 'Mark scene complete'}
                                type="button"
                              >
                                <span className={sceneComplete ? 'sidebar-checkbox checked' : 'sidebar-checkbox'} />
                              </button>
                              <button
                                className="sidebar-item-main"
                                onClick={() => {
                                  setRecentScene(sceneName);
                                  setExpandedSceneTitle(isSceneExpanded ? null : sceneName);
                                  openScene(sceneName);
                                }}
                              type="button"
                            >
                              <Icon name="clapperboard" className="scene-bullet" />
                              <span className="scene-title-text">
                                <span className="scene-number-label">{sceneNumber(sceneIndex)}</span>
                                {sceneName}
                              </span>
                            </button>
                              <button
                                className="sidebar-expand-btn"
                                onClick={() => {
                                  setRecentScene(sceneName);
                                  setExpandedSceneTitle(isSceneExpanded ? null : sceneName);
                                }}
                                title={isSceneExpanded ? 'Collapse scene' : 'Expand scene'}
                                type="button"
                              >
                                <Icon name={isSceneExpanded ? 'chevronDown' : 'chevronRight'} className="expansion-caret" />
                              </button>
                            </div>

                            {isSceneExpanded && (
                              <div className="sidebar-nested-shots">
                                  {orderedShots
                                    .filter((shot) => shot.scene === sceneName)
                                    .map((shot) => (
                                      <div
                                        key={shot.id}
                                        className={[
                                          'sidebar-row',
                                          selectedShotId === shot.id && step === 'shots' ? 'active' : '',
                                          shot.status === 'done' ? 'is-complete' : '',
                                        ].filter(Boolean).join(' ')}
                                        style={{ fontSize: '0.8rem', paddingLeft: '8px' }}
                                      >
                                        <button
                                          className="sidebar-check-btn"
                                          onClick={() => toggleShotStatus(shot.id)}
                                          title={shot.status === 'done' ? 'Mark shot active' : 'Mark shot complete'}
                                          type="button"
                                        >
                                          <span className={shot.status === 'done' ? 'sidebar-checkbox checked' : 'sidebar-checkbox'} />
                                        </button>
                                        <button
                                          className="sidebar-item-main"
                                          onClick={() => {
                                            openShot(shot.id);
                                          }}
                                          type="button"
                                        >
                                          <span>Shot {String(shot.id).padStart(2, '0')}</span>
                                        </button>
                                        <span className={`status-dot ${shot.status}`} />
                                      </div>
                                    ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </aside>

      <div className="main-container">
        <div className="main-panel-card">
          {step !== 'dashboard' ? (
            <header className="topbar">
              <div className="topbar-left">
                <button className="topbar-back-btn" onClick={goBack} type="button" title="Back" aria-label="Back">
                  <Icon name="chevronLeft" />
                </button>
                <span className="topbar-project-name">{activeProject.name}</span>
              </div>

              <div className="project-progress">
                <span>Progress</span>
                <div className="meter" aria-label={`${completion}% complete`}>
                  <span style={{ width: `${completion}%` }} />
                </div>
                <strong>{completion}%</strong>
              </div>
            </header>
          ) : null}

          <section className="workspace">
        {step === 'dashboard' ? (
          <Dashboard
            projects={projects}
            onDelete={deleteProject}
            onNew={() => {
              setForm(emptyForm);
              navigateTo('create');
            }}
            onOpen={openProject}
          />
        ) : null}

        {step === 'create' ? (
          <CreateProjectPage
            onCancel={goBack}
            onCreate={(draft) => {
              setForm((current) => ({
                ...current,
                projectName: draft.projectName,
                script: draft.script,
                referenceMap: createReferenceMapFromText(draft.references),
                notes: draft.notes,
              }));
              navigateTo('setup');
            }}
          />
        ) : null}

        {step === 'project' ? (
          <ProjectPage
            project={activeProject}
            scenes={scenes}
            shots={orderedShots}
            onSceneOpen={openScene}
            onShotOpen={openShot}
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
            onBack={() => navigateTo('setup')}
            onConfirm={() => goToStep(form.skipScenes ? 'references' : 'scenes')}
          />
        ) : null}

        {step === 'scenes' ? (
          <Scenes
            scenes={scenes}
            shots={orderedShots}
            selectedSceneTitle={recentScene}
            onSceneChange={setScenes}
            onSceneDelete={deleteScene}
            onShotOpen={openShot}
            onBack={() => navigateTo(form.skipStoryboard ? 'setup' : 'storyboard')}
            onConfirm={() => goToStep('references')}
          />
        ) : null}

        {step === 'references' ? (
          <ReferenceMapStep
            project={activeProject}
            onChange={updateProjectReferenceMap}
            onBack={() => navigateTo(form.skipScenes ? (form.skipStoryboard ? 'setup' : 'storyboard') : 'scenes')}
            onConfirm={() => goToStep('shotDemo')}
          />
        ) : null}

        {step === 'shotDemo' ? (
          <ShotGenerationDemo
            project={activeProject}
            scenes={scenes}
            shots={orderedShots}
            onBack={() => navigateTo('references')}
            onContinue={() => goToStep('shots')}
          />
        ) : null}

        {step === 'shots' ? (
          <Shots
            shots={orderedShots}
            multiShotSuggestions={multiShotSuggestions}
            selectedShot={selectedShot}
            onSelect={openShot}
            onDelete={deleteShot}
            onStatus={toggleShotStatus}
            onUpdate={updateShot}
            onExport={() => goToStep('export')}
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
    </div>
  </main>
  );
}

function Dashboard({
  projects,
  onDelete,
  onNew,
  onOpen,
}: {
  projects: Project[];
  onDelete: (projectId: number) => void;
  onNew: () => void;
  onOpen: (projectId: number) => void;
}) {
  const draftProjects = projects.filter(isDraftProject);
  const activeProjects = projects.filter((project) => !isDraftProject(project));

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

      <div className="dashboard-sections">
        <section className="dashboard-section draft-section">
          <div className="dashboard-section-header">
            <div>
              <p className="eyebrow">Not ready for shots</p>
              <h3>Drafts</h3>
            </div>
            <span>{draftProjects.length}</span>
          </div>
          <div className="draft-grid">
            {draftProjects.length ? (
              draftProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onDelete={onDelete} onOpen={onOpen} />
              ))
            ) : (
              <p className="empty-section-copy">No drafts right now.</p>
            )}
          </div>
        </section>

        <section className="dashboard-section projects-section">
          <div className="dashboard-section-header">
            <div>
              <p className="eyebrow">Shot creation reached</p>
              <h3>Projects</h3>
            </div>
            <span>{activeProjects.length}</span>
          </div>
          <div className="project-grid">
            {activeProjects.length ? (
              activeProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onDelete={onDelete} onOpen={onOpen} />
              ))
            ) : (
              <p className="empty-section-copy">No projects have reached shot creation yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function CreateProjectPage({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (draft: { projectName: string; script: string; references: string; notes: string }) => void;
}) {
  return (
    <div className="view new-project-page">
      <header className="view-header">
        <div>
          <p className="eyebrow">New project</p>
          <h2>Create a project</h2>
        </div>
      </header>

      <section className="new-project-page-body">
        <NewProjectCard onCancel={onCancel} onCreate={onCreate} />
      </section>
    </div>
  );
}

function ProjectCard({
  project,
  onDelete,
  onOpen,
}: {
  project: Project;
  onDelete: (projectId: number) => void;
  onOpen: (projectId: number) => void;
}) {
  const isDraft = isDraftProject(project);
  const percent = progressPercent(project.shotsDone, project.shotsTotal);
  const isComplete = !isDraft && percent === 100;

  return (
    <article className={isComplete ? 'project-card is-complete' : 'project-card'}>
      <div className="card-topline">
        <span>{project.date}</span>
        <span>{isDraft ? 'Draft' : isComplete ? 'Completed' : 'In Progress'}</span>
      </div>
      <h3>{project.name}</h3>
      <p>{project.scriptTitle}</p>
      <div className="platform-row">
        {project.platforms.map((platform) => (
          <span key={platform}>{platform}</span>
        ))}
      </div>
      {isDraft ? (
        <p className="draft-stage">Stopped at {projectStageLabel(project.stage)}</p>
      ) : (
        <div className="timeline-strip" aria-label={`${percent}% complete`}>
          {Array.from({ length: project.shotsTotal }).map((_, index) => (
            <span className={index < project.shotsDone ? 'complete' : ''} key={index} />
          ))}
        </div>
      )}
      <div className="card-actions">
        <span>{isDraft ? 'Draft' : project.shotsDone === 0 ? 'Pending' : `${project.shotsDone} done`}</span>
        <button className="danger-action" onClick={() => onDelete(project.id)} title="Delete project" type="button">
          <Icon name="trash" />
        </button>
        <button onClick={() => onOpen(project.id)} type="button">
          {isDraft ? 'Continue' : 'Open'}
        </button>
      </div>
    </article>
  );
}

function ProjectPage({
  project,
  scenes,
  shots,
  onSceneOpen,
  onShotOpen,
}: {
  project: Project;
  scenes: Scene[];
  shots: Shot[];
  onSceneOpen: (sceneName: string) => void;
  onShotOpen: (shotId: number) => void;
}) {
  const percent = progressPercent(project.shotsDone, project.shotsTotal);

  return (
    <div className="view">
      <header className="view-header">
        <div>
          <p className="eyebrow">Project</p>
          <h2>{project.name}</h2>
        </div>
        <div className="project-progress project-page-progress">
          <span>{project.shotsDone} of {project.shotsTotal} shots done</span>
          <div className="meter" aria-label={`${percent}% complete`}>
            <span style={{ width: `${percent}%` }} />
          </div>
          <strong>{percent}%</strong>
        </div>
      </header>

      <section className="project-page-layout">
        <article className="scene-reference-card">
          <div>
            <p className="eyebrow">Script</p>
            <h3>{project.scriptTitle}</h3>
          </div>
          <div className="platform-row">
            {project.platforms.map((platform) => (
              <span key={platform}>{platform}</span>
            ))}
          </div>
          <div className="reference-mini-section">
            <span className="reference-label">Reference map</span>
            {referenceCategories.map((category) => (
              <ReferenceCategorySummary
                category={category}
                compact
                key={category.id}
                value={project.referenceMap[category.id]}
              />
            ))}
          </div>
        </article>

        <div className="scene-shot-sections">
          {scenes.map((scene, sceneIndex) => {
            const sceneShots = shots.filter((shot) => shot.scene === scene.title);
            const sceneComplete = sceneShots.length > 0 && sceneShots.every((shot) => shot.status === 'done');
            return (
              <section className={sceneComplete ? 'scene-shot-section is-complete' : 'scene-shot-section'} key={scene.id}>
                <div className="scene-section-header">
                  <div>
                    <p className="eyebrow">{sceneNumber(sceneIndex)} / {scene.location} / {scene.time}</p>
                    <h3>{scene.title}</h3>
                  </div>
                  <button className="secondary-action" onClick={() => onSceneOpen(scene.title)} type="button">
                    Open Scene
                  </button>
                </div>
                <p className="muted-copy">{scene.description}</p>
                <div className="shot-card-grid">
                  {sceneShots.map((shot) => (
                    <button
                      className={shot.status === 'done' ? 'scene-shot-card is-complete' : 'scene-shot-card'}
                      key={shot.id}
                      onClick={() => onShotOpen(shot.id)}
                      type="button"
                    >
                      <span className="index-pill">Shot {String(shot.id).padStart(2, '0')}</span>
                      <h4>{shot.size} / {shot.motion}</h4>
                      <p>{shot.prompt}</p>
                      <span className={`status-dot ${shot.status}`} />
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
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
          Continue
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

        <div className="field span-two">
          <span>Reference map</span>
          <div className="reference-map-grid">
            {referenceCategories.map((category) => (
              <label key={category.id}>
                <span>{category.label}</span>
                <textarea
                  value={form.referenceMap[category.id]}
                  onChange={(event) =>
                    onChange({
                      ...form,
                      referenceMap: {
                        ...form.referenceMap,
                        [category.id]: event.target.value,
                      },
                    })
                  }
                  placeholder={category.placeholder}
                  rows={4}
                />
              </label>
            ))}
          </div>
        </div>

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
            Continue
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
  shots = [],
  selectedSceneTitle = '',
  onSceneChange,
  onSceneDelete,
  onShotOpen,
  onBack,
  onConfirm,
}: {
  scenes: Scene[];
  shots?: Shot[];
  selectedSceneTitle?: string;
  onSceneChange: (scenes: Scene[]) => void;
  onSceneDelete: (sceneId: number) => void;
  onShotOpen?: (shotId: number) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const selectedScene = scenes.find((scene) => scene.title === selectedSceneTitle);

  if (selectedScene) {
    const selectedSceneIndex = scenes.findIndex((scene) => scene.id === selectedScene.id);
    const sceneShots = shots.filter((shot) => shot.scene === selectedScene.title);

    return (
      <div className="view">
        <header className="view-header">
          <div>
            <p className="eyebrow">{sceneNumber(selectedSceneIndex)}</p>
            <h2>{selectedScene.title}</h2>
          </div>
          <div className="action-row">
            <button className="secondary-action" onClick={onBack} type="button">
              Back
            </button>
            <button className="danger-action" onClick={() => onSceneDelete(selectedScene.id)} title="Delete scene" type="button">
              <Icon name="trash" />
            </button>
            <button className="primary-action" onClick={onConfirm} type="button">
              Continue
            </button>
          </div>
        </header>

        <div className="scene-page-layout">
          <article className="scene-reference-card">
            <div>
              <p className="eyebrow">{selectedScene.location}</p>
              <h3>{selectedScene.time}</h3>
            </div>
            <p className="muted-copy">{selectedScene.description}</p>
            <div className="reference-mini-section">
              <span className="reference-label">Scene plan</span>
              <p>{selectedScene.shots} shots</p>
              <p>{selectedScene.duration}</p>
            </div>
          </article>

          <section className="scene-shot-section">
            <div className="scene-section-header">
              <div>
                <p className="eyebrow">Shots</p>
                <h3>{sceneShots.length} generated shots</h3>
              </div>
            </div>
            <div className="shot-card-grid">
              {sceneShots.map((shot) => (
                <button
                  className={shot.status === 'done' ? 'scene-shot-card is-complete' : 'scene-shot-card'}
                  key={shot.id}
                  onClick={() => onShotOpen?.(shot.id)}
                  type="button"
                >
                  <span className="index-pill">Shot {String(shot.id).padStart(2, '0')}</span>
                  <h4>{shot.size} / {shot.motion}</h4>
                  <p>{shot.prompt}</p>
                  <span className={`status-dot ${shot.status}`} />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

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
            Continue
          </button>
        </div>
      </header>

      <div className="scene-grid">
        {scenes.map((scene, sceneIndex) => (
          <article className="scene-card" key={scene.id}>
            <span className="index-pill">{sceneNumber(sceneIndex)}</span>
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
              <button className="danger-action" onClick={() => onSceneDelete(scene.id)} title="Delete scene" type="button">
                <Icon name="trash" />
              </button>
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
  const individualImagePrompts = buildIndividualImagePrompts(project);
  const [promptOverrides, setPromptOverrides] = useState<Record<string, string>>({});
  const [activeRefineKey, setActiveRefineKey] = useState<string | null>(null);
  const [refineText, setRefineText] = useState('');
  const [copiedPromptKey, setCopiedPromptKey] = useState<string | null>(null);

  function copyPrompt(prompt: string, promptKey: string) {
    navigator.clipboard.writeText(prompt);
    setCopiedPromptKey(promptKey);
    window.setTimeout(() => {
      setCopiedPromptKey((current) => (current === promptKey ? null : current));
    }, 1400);
  }

  function openRefine(promptKey: string) {
    setActiveRefineKey(promptKey);
    setRefineText('');
  }

  function cancelRefine() {
    setActiveRefineKey(null);
    setRefineText('');
  }

  function refinePrompt(promptKey: string, currentPrompt: string) {
    const trimmedSuggestion = refineText.trim();

    if (!trimmedSuggestion) {
      return;
    }

    setPromptOverrides((current) => ({
      ...current,
      [promptKey]: `${currentPrompt} Apply this refinement: ${trimmedSuggestion}.`,
    }));
    cancelRefine();
  }

  function regeneratePrompt(promptKey: string) {
    setPromptOverrides((current) => {
      const next = { ...current };
      delete next[promptKey];
      return next;
    });
  }

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
            Continue
          </button>
        </div>
      </header>

      <div className="reference-step-grid">
        <section className="reference-prompt-panel" aria-label="Reference image prompts">
          <div className="panel-heading-row">
            <div>
              <p className="eyebrow">Prompt prep</p>
              <h3>Generate individual reference images</h3>
            </div>
            <span className="reference-label">{individualImagePrompts.length} prompts</span>
          </div>

          <div className="reference-prompt-sections">
            {imageReferenceCategories.map((category) => {
              const categoryPrompts = parseReferenceEntries(project.referenceMap[category.id]).map((entry) => ({
                title: entry.name,
                meta: entry.refId || 'Needs ID',
                prompt: buildIndividualImagePrompt(category.id, entry, project),
              }));
              const sheetPrompt = defaultPromptSheetPrompts[category.id];
              const sheetPromptKey = `${category.id}-sheet`;

              return (
                <section className="reference-prompt-category" key={category.id}>
                  <div className="reference-prompt-category-header">
                    <div>
                      <p className="eyebrow">{category.label}</p>
                      <h4>{categoryPrompts.length} individual prompts</h4>
                    </div>
                    <button className="secondary-action compact-action" onClick={() => copyPrompt(sheetPrompt.prompt, sheetPromptKey)} type="button">
                      {copiedPromptKey === sheetPromptKey ? 'Copied' : `Copy ${sheetPrompt.title}`}
                    </button>
                  </div>

                  <div className="reference-prompt-grid">
                    {categoryPrompts.length ? (
                      categoryPrompts.map((item) => {
                        const promptKey = `${category.id}-${item.meta}-${item.title}`;
                        const prompt = promptOverrides[promptKey] ?? item.prompt;
                        const isRefining = activeRefineKey === promptKey;

                        return (
                          <article className="reference-prompt-card" key={promptKey}>
                            <div className="card-topline">
                              <span>{item.title}</span>
                              <span>{item.meta}</span>
                            </div>
                            <p className="reference-prompt-preview">{prompt}</p>
                            {isRefining ? (
                              <div className="prompt-refine-box">
                                <textarea
                                  aria-label={`Refine ${item.title} prompt`}
                                  onChange={(event) => setRefineText(event.target.value)}
                                  placeholder="Describe what should change..."
                                  rows={3}
                                  value={refineText}
                                />
                                <div className="prompt-card-actions">
                                  <button className="secondary-action compact-action" onClick={cancelRefine} type="button">
                                    Cancel
                                  </button>
                                  <button className="primary-action compact-action" onClick={() => refinePrompt(promptKey, prompt)} type="button">
                                    Refine
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="prompt-card-actions">
                                <button className="secondary-action compact-action" onClick={() => openRefine(promptKey)} type="button">
                                  Refine
                                </button>
                                <button className="secondary-action compact-action" onClick={() => regeneratePrompt(promptKey)} type="button">
                                  Regenerate
                                </button>
                                <button className="secondary-action compact-action" onClick={() => copyPrompt(prompt, promptKey)} type="button">
                                  {copiedPromptKey === promptKey ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                            )}
                          </article>
                        );
                      })
                    ) : (
                      <p className="reference-empty">No {category.label.toLowerCase()} added yet.</p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

        </section>

        <ReferenceMapPanel project={project} onChange={onChange} />
      </div>
    </div>
  );
}

function ShotGenerationDemo({
  project,
  scenes,
  shots,
  onBack,
  onContinue,
}: {
  project: Project;
  scenes: Scene[];
  shots: Shot[];
  onBack: () => void;
  onContinue: () => void;
}) {
  const generatedCount = Math.min(shots.length, 4);

  return (
    <div className="view">
      <header className="view-header">
        <div>
          <p className="eyebrow">Shot generation</p>
          <h2>{project.name}</h2>
        </div>
        <div className="action-row">
          <button className="secondary-action" onClick={onBack} type="button">
            Back
          </button>
          <button className="primary-action" onClick={onContinue} type="button">
            Continue
          </button>
        </div>
      </header>

      <section className="shot-demo-panel">
        <div className="panel-heading-row">
          <div>
            <p className="eyebrow">Demo run</p>
            <h3>Shot prompts generated</h3>
          </div>
          <span className="reference-label">{generatedCount} ready</span>
        </div>

        <div className="shot-demo-meter" aria-label="Demo generation complete">
          <span />
        </div>

        <div className="shot-demo-grid">
          {shots.map((shot) => (
            <article className="shot-demo-card" key={shot.id}>
              <div className="card-topline">
                <span>Shot {String(shot.id).padStart(2, '0')}</span>
                <span>Ready</span>
              </div>
              <h4>{shot.scene}</h4>
              <p>{shot.size} / {shot.motion} / {shot.duration}</p>
              <span className="reference-label">{shot.model}</span>
            </article>
          ))}
        </div>

        <div className="shot-demo-summary">
          <span>{scenes.length} scenes mapped</span>
          <span>{shots.length} shot prompts prepared</span>
          <span>Reference IDs attached</span>
        </div>
      </section>
    </div>
  );
}

function Shots({
  shots,
  multiShotSuggestions,
  selectedShot,
  onDelete,
  onSelect,
  onStatus,
  onUpdate,
  onExport,
}: {
  shots: Shot[];
  multiShotSuggestions: MultiShotSuggestion[];
  selectedShot: Shot;
  onDelete: (shotId: number) => void;
  onSelect: (id: number) => void;
  onStatus: (id: number) => void;
  onUpdate: (id: number, key: keyof Shot, value: string) => void;
  onExport: () => void;
}) {
  const [copiedShotPrompt, setCopiedShotPrompt] = useState(false);
  const [shotPromptAction, setShotPromptAction] = useState<'idle' | 'regenerated' | 'refine'>('idle');

  function copyShotPrompt() {
    navigator.clipboard.writeText(selectedShot.prompt);
    setCopiedShotPrompt(true);
    window.setTimeout(() => {
      setCopiedShotPrompt(false);
    }, 1400);
  }

  function showShotPromptAction(action: 'regenerated' | 'refine') {
    setShotPromptAction(action);
    window.setTimeout(() => {
      setShotPromptAction((current) => (current === action ? 'idle' : current));
    }, 1400);
  }

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
              className={[
                'shot-tab',
                selectedShot.id === shot.id ? 'active' : '',
                shot.status === 'done' ? 'is-complete' : '',
              ].filter(Boolean).join(' ')}
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
              <div className="shot-header-actions">
                <button 
                  className={`status-toggle-pill ${selectedShot.status}`} 
                  onClick={() => onStatus(selectedShot.id)} 
                  type="button"
                >
                  {selectedShot.status === 'done' ? '✓ Completed' : '○ In Progress'}
                </button>
                <button 
                  className="minimal-trash-btn" 
                  onClick={() => onDelete(selectedShot.id)} 
                  title="Delete shot" 
                  type="button"
                >
                  <Icon name="trash" />
                </button>
              </div>
            </div>

            <div className="shot-detail-grid">
              <div className="shot-detail-main">
                <label>
                  <span>First frame prompt</span>
                  <textarea
                    value={selectedShot.firstFrame}
                    onChange={(event) => onUpdate(selectedShot.id, 'firstFrame', event.target.value)}
                    rows={3}
                  />
                </label>
                <label>
                  <span>Final prompt</span>
                  <textarea
                    value={selectedShot.prompt}
                    onChange={(event) => onUpdate(selectedShot.id, 'prompt', event.target.value)}
                    rows={5}
                  />
                </label>
                <label>
                  <span>Note or clip link</span>
                  <input
                    value={selectedShot.note}
                    onChange={(event) => onUpdate(selectedShot.id, 'note', event.target.value)}
                    placeholder="Paste clip link or execution note..."
                  />
                </label>

                {/* Activity Feed Section */}
                <div className="activity-feed">
                  <h4 className="eyebrow" style={{ marginTop: '24px', marginBottom: '16px' }}>Activity</h4>
                  
                  <div className="activity-item">
                    <Icon name="clapperboard" className="activity-icon" />
                    <div className="activity-content">
                      <span className="activity-user">Clapr System</span> created shot from script breakdown
                      <span className="activity-time">2 hours ago</span>
                    </div>
                  </div>

                  <div className="activity-item">
                    <Icon name="settings" className="activity-icon" />
                    <div className="activity-content">
                      User set active generating model to <span className="activity-model-badge">{selectedShot.model}</span>
                      <span className="activity-time">10 min ago</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="shot-detail-meta">
                <label>
                  <span>Status</span>
                  <div className="meta-value-row" onClick={() => onStatus(selectedShot.id)} style={{ cursor: 'pointer' }}>
                    <span className={`status-indicator-dot ${selectedShot.status}`} />
                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                      {selectedShot.status === 'done' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </label>

                <label style={{ marginTop: '8px' }}>
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
                
                <label style={{ marginTop: '8px' }}>
                  <span>Priority</span>
                  <select defaultValue="High">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </label>

                <label style={{ marginTop: '8px' }}>
                  <span>Refs</span>
                  <input
                    value={selectedShot.refs}
                    onChange={(event) => onUpdate(selectedShot.id, 'refs', event.target.value)}
                  />
                </label>

                 <div className="meta-actions-stack" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="meta-action-btn" type="button" title="Copy prompt" onClick={copyShotPrompt}>
                    {copiedShotPrompt ? 'Copied ✓' : 'Copy Prompt'}
                  </button>
                  <button className="meta-action-btn" type="button" onClick={() => showShotPromptAction('regenerated')}>
                    {shotPromptAction === 'regenerated' ? 'Regenerated ✓' : 'Regen Prompt'}
                  </button>
                  <button className="meta-action-btn" type="button" onClick={() => showShotPromptAction('refine')}>
                    {shotPromptAction === 'refine' ? 'Ready to refine ✓' : 'Refine Shot'}
                  </button>
                </div>
              </div>
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
  function deleteReferenceEntry(category: ReferenceCategory, index: number) {
    const isSoulIdMap = category === 'soulIds';
    const entries = parseReferenceEntries(project.referenceMap[category], isSoulIdMap);
    const nextEntries = entries.filter((_, entryIndex) => entryIndex !== index);
    onChange(category, serializeReferenceEntries(nextEntries));
  }

  return (
    <section className="reference-map-panel" aria-label="Project reference map">
      <div>
        <p className="eyebrow">Project reference map</p>
        <h3>Reference IDs by element type</h3>
      </div>

      <div className="reference-map-grid">
        {referenceCategories.map((category) => (
          <article className="reference-map-card" key={category.id}>
            <ReferenceCategorySummary
              category={category}
              onDeleteEntry={(index) => deleteReferenceEntry(category.id, index)}
              value={project.referenceMap[category.id]}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

function ReferenceCategorySummary({
  category,
  onDeleteEntry,
  value,
  compact = false,
}: {
  category: { id: ReferenceCategory; label: string };
  onDeleteEntry?: (index: number) => void;
  value: string;
  compact?: boolean;
}) {
  const isSoulIdMap = category.id === 'soulIds';
  const entries = parseReferenceEntries(value, isSoulIdMap);

  return (
    <div className={compact ? 'reference-entry-group compact' : 'reference-entry-group'}>
      <div className="reference-entry-heading">
        <span>{category.label}</span>
        <span>{entries.length} {entries.length === 1 ? 'item' : 'items'}</span>
      </div>
      {entries.length ? (
        <div className="reference-entry-list">
          <div className="reference-entry-column-head">
            <span>{isSoulIdMap ? 'Source ID' : 'Name'}</span>
            <span>{isSoulIdMap ? 'Soul ID' : 'ID'}</span>
          </div>
          {entries.map((entry, index) => (
            <div className="reference-entry-row" key={`${category.id}-${entry.refId || entry.name}-${index}`}>
              <span className="reference-entry-name">{entry.name}</span>
              <span className="reference-entry-id">
                <code>{entry.refId || 'Missing ID'}</code>
                {onDeleteEntry ? (
                  <button className="field-delete-btn" onClick={() => onDeleteEntry(index)} title="Delete reference" type="button">
                    <Icon name="trash" />
                  </button>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="reference-empty">No {category.label.toLowerCase()} added</p>
      )}
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
