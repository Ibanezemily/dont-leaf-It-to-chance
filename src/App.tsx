import { useState, useRef, useEffect } from 'react';
import Back from '@/imports/Back';
import q1Paths from '@/imports/Question1/svg-sqkd0ilo4z';
import pinkCat      from '@/imports/image.png';
import purpleCat    from '@/imports/image-1.png';
import blueCat      from '@/imports/image-2.png';
import orangeCat    from '@/imports/image-3.png';
import g77Paths from '@/imports/Group77/svg-d7ctobszwm';

// ── Board geometry ─────────────────────────────────────────────────────────
const SZ = 640;
const CX = SZ / 2, CY = SZ / 2; // 320, 320
const BOARD_R = 300;
const CENTER_R = 48; // "Start" circle radius

// Ring tile circle radius (all tiles same size, matching 53px Figma tiles)
const TILE_R = 26;

// Mid-radius for each ring's tile centers
const RING_MID = [145, 220, 278] as const;

// Gate exit angle per ring (where the gate tab sticks out)
// Spiral: inner exits upper-right → middle exits lower-right → outer exits left (WIN)
const GATE_ANGLES = [
  -Math.PI / 4,   // ring 0: ~1:30 o'clock (upper-right)
  Math.PI / 4,    // ring 1: ~4:30 o'clock (lower-right)
  Math.PI,        // ring 2: 9:00 o'clock (left) — FINISH
];

// Number of tiles per ring
const RING_SEGS = [8, 12, 16] as const;

// RINGS_DEF is kept for game-logic compatibility (segs, inner/outer used for gate sticker only)
const RINGS_DEF = [
  { inner: 119, outer: 171, segs: 8  }, // mid = 145
  { inner: 194, outer: 246, segs: 12 }, // mid = 220
  { inner: 252, outer: 304, segs: 16 }, // mid = 278
] as const;

// Starting angle so segment 0's midpoint falls at GATE_ANGLES[ri]
const RING_START = RING_SEGS.map((n, i) => GATE_ANGLES[i] - Math.PI / n);

type SegKind = 'gate' | 'trivia' | 'normal';

function segKind(ri: number, seg: number): SegKind {
  if (seg === 0) return 'gate';
  return seg % 2 === 1 ? 'trivia' : 'normal';
}

// All [a1, a2] angle pairs for ring ri
function ringSeg(ri: number): [number, number][] {
  const n = RING_SEGS[ri];
  const step = (2 * Math.PI) / n;
  const off = RING_START[ri];
  return Array.from({ length: n }, (_, j) => [off + j * step, off + (j + 1) * step]);
}

// Center point of segment seg on ring ri
function segCenter(ri: number, seg: number): { x: number; y: number; a: number } {
  const [a1, a2] = ringSeg(ri)[seg];
  const a = (a1 + a2) / 2;
  return { x: CX + RING_MID[ri] * Math.cos(a), y: CY + RING_MID[ri] * Math.sin(a), a };
}

function tileXY(ri: number, seg: number) {
  const { x, y } = segCenter(ri, seg);
  return { x, y };
}

// ── Trivia questions ───────────────────────────────────────────────────────
const QUESTIONS = [
  { q: "How many legs does a spider have?",        opts: ["4","6","8","10"],                            ans: 2 },
  { q: "What do bees make?",                        opts: ["Honey","Milk","Jam","Wax"],                 ans: 0 },
  { q: "What do caterpillars turn into?",           opts: ["Butterflies","Beetles","Ants","Fireflies"],  ans: 0 },
  { q: "How many wings does a butterfly have?",     opts: ["2","4","6","8"],                             ans: 1 },
  { q: "What is the tallest land animal?",          opts: ["Giraffe","Elephant","Camel","Horse"],        ans: 0 },
  { q: "How many colors are in a rainbow?",         opts: ["5","6","7","8"],                             ans: 2 },
  { q: "What do plants need to grow?",              opts: ["Sun, water & soil","Only water","Only sun","Only wind"], ans: 0 },
  { q: "A baby frog is called a?",                  opts: ["Tadpole","Pup","Cub","Fawn"],                ans: 0 },
  { q: "How many legs does an ant have?",           opts: ["4","6","8","12"],                            ans: 1 },
  { q: "Which bird cannot fly?",                    opts: ["Penguin","Eagle","Sparrow","Robin"],         ans: 0 },
  { q: "Where do bees live?",                       opts: ["In a hive","In a burrow","In a dam","In a den"], ans: 0 },
  { q: "A group of fish is called a?",              opts: ["School","Pack","Flock","Herd"],              ans: 0 },
  { q: "Which season do trees lose leaves?",        opts: ["Autumn","Spring","Summer","Winter"],         ans: 0 },
  { q: "What gas do plants use for food?",          opts: ["Carbon dioxide","Oxygen","Nitrogen","Steam"], ans: 0 },
  { q: "Which insect makes silk?",                  opts: ["Silkworm","Ant","Beetle","Cricket"],         ans: 0 },
  { q: "A group of birds is called a?",             opts: ["Flock","Pack","School","Pod"],               ans: 0 },
  { q: "What covers most of Earth?",                opts: ["Water","Forest","Desert","Ice"],             ans: 0 },
  { q: "Which planet is closest to the Sun?",       opts: ["Mercury","Venus","Earth","Mars"],            ans: 0 },
  { q: "How do ants find their way home?",          opts: ["Scent trails","Sound","Light","Maps"],       ans: 0 },
  { q: "What do roots absorb from the soil?",       opts: ["Water & nutrients","Sunlight","CO₂","Air"], ans: 0 },
];

// ── Characters ─────────────────────────────────────────────────────────────
const CHARS = [
  { img: pinkCat,   name: 'Rosie',  color: '#e05a5a' },
  { img: purpleCat, name: 'Violet', color: '#9b4dca' },
  { img: blueCat,   name: 'Azure',  color: '#4b7bbf' },
  { img: orangeCat, name: 'Sunny',  color: '#e87c2a' },
];

// ── Die ────────────────────────────────────────────────────────────────────
const DOT_PCT = [14, 45, 76];
const DOT_MAP: Record<number, [number, number][]> = {
  1: [[1,1]],
  2: [[0,0],[2,2]],
  3: [[0,0],[1,1],[2,2]],
  4: [[0,0],[0,2],[2,0],[2,2]],
  5: [[0,0],[0,2],[1,1],[2,0],[2,2]],
  6: [[0,0],[0,2],[1,0],[1,2],[2,0],[2,2]],
};

function Die({ val, rolling }: { val: number; rolling: boolean }) {
  return (
    <div style={{
      width: 72, height: 72, background: 'white',
      borderRadius: 18, border: '3px solid #CAECC3',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: rolling ? 'tumble 0.12s linear infinite' : 'none',
    }}>
      <div style={{ width: 48, height: 48, position: 'relative' }}>
        {(DOT_MAP[val] ?? []).map(([r, c], i) => (
          <div key={i} style={{
            position: 'absolute', width: 11, height: 11,
            background: '#0096A9', borderRadius: '50%',
            top: `${DOT_PCT[r]}%`, left: `${DOT_PCT[c]}%`,
            transform: 'translate(-50%,-50%)',
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────
interface Player {
  id: number;
  img: string;
  name: string;
  color: string;
  ringIdx: number;
  seg: number;
  leaves: number;
}
type Phase = 'setup' | 'playersetup' | 'play' | 'win';
// 'card' = landed on trivia tile; card back shown until player taps to flip
type TurnState = 'idle' | 'card' | 'gate' | 'moved';

const FONT = "'Balsamiq Sans', sans-serif";

// ── Gate sticker ───────────────────────────────────────────────────────────
// Renders the "3🍃" gate badge tab + pink "finish" blob for every ring exit.
function GateSticker({ ri }: { ri: number }) {
  const ga     = GATE_ANGLES[ri];
  const outerR = RINGS_DEF[ri].outer;

  // Badge circle sits just outside the ring outer boundary
  const badgeR = outerR + 26;
  const bx = CX + badgeR * Math.cos(ga);
  const by = CY + badgeR * Math.sin(ga);

  // Finish blob further out — larger for the final ring
  const finR  = outerR + (ri === 2 ? 72 : 60);
  const finSz = ri === 2 ? 30 : 24;
  const fx = CX + finR * Math.cos(ga);
  const fy = CY + finR * Math.sin(ga);

  return (
    <g>
      {/* Thick green tab from ring edge to badge */}
      <line
        x1={CX + (outerR + 2) * Math.cos(ga)}
        y1={CY + (outerR + 2) * Math.sin(ga)}
        x2={CX + (badgeR + finSz - 4) * Math.cos(ga)}
        y2={CY + (badgeR + finSz - 4) * Math.sin(ga)}
        stroke="#3DA84E" strokeWidth={22} strokeLinecap="round"
      />

      {/* Gate badge — Group77 icon inlined (viewBox 0 0 13.635 11.5223, scaled 3.2×) */}
      <g transform={`translate(${(bx - 13.635 * 1.6).toFixed(2)}, ${(by - 11.5223 * 1.6).toFixed(2)}) scale(3.2)`}>
        <path d={g77Paths.p3b55e00} fill="#AECD55" />
        <path d={g77Paths.p12b79700} fill="#6D8A1C" />
        <path d={g77Paths.p3ed3f900} fill="#4B4B4B" />
      </g>

      {/* Pink "finish" flower blob */}
      {([0,1,2,3,4] as const).map(i => {
        const ba = (i / 5) * Math.PI * 2;
        const blobR = finSz * 0.72;
        return (
          <circle key={i}
            cx={fx + blobR * Math.cos(ba)} cy={fy + blobR * Math.sin(ba)}
            r={finSz * 0.62}
            fill={ri === 2 ? '#E84855' : '#E88C95'}
            opacity={ri === 2 ? 1 : 0.88}
          />
        );
      })}
      <circle cx={fx} cy={fy} r={finSz * 0.7}
        fill={ri === 2 ? '#E84855' : '#E88C95'}
        opacity={ri === 2 ? 1 : 0.88}
      />
      <text x={fx} y={fy}
        textAnchor="middle" dominantBaseline="central"
        fontSize={ri === 2 ? 12 : 10} fill="white"
        fontFamily={FONT} style={{ userSelect: 'none', fontWeight: 700 }}>
        {ri === 2 ? 'FINISH!' : 'finish'}
      </text>
    </g>
  );
}

// ── Leaf decoration (from Question1 Figma import) ─────────────────────────
function CardLeaf() {
  return (
    <div style={{ position: 'absolute', height: 96, left: 10, top: 10, width: 147 }}>
      <div style={{ position: 'absolute', inset: '0 -0.99% 0 0' }}>
        <svg fill="none" height="96" preserveAspectRatio="none" viewBox="0 0 148.53 96" width="148.53" style={{ display: 'block', width: '100%', height: '100%' }}>
          <g>
            <g filter="url(#cfl0)">
              <path d={q1Paths.p2d7cb700} fill="#7E9E46" />
            </g>
            <g filter="url(#cfl1)">
              <path d={q1Paths.p24a5ca00} fill="#486123" />
            </g>
            <g filter="url(#cfl2)">
              <mask id="cflm" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' as const }} height="91" width="132" x="16" y="2">
                <path d={q1Paths.p3ac96280} fill="#666A0C" />
              </mask>
              <g mask="url(#cflm)">
                <path d={q1Paths.pd697000} fill="#486123" />
              </g>
            </g>
          </g>
          <defs>
            {(['cfl0','cfl1','cfl2'] as const).map(id => (
              <filter key={id} id={id} colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"
                height="96" width="149" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feTurbulence baseFrequency="0.102" numOctaves="3" seed="5466" type="fractalNoise" />
                <feDisplacementMap in="shape" result="disp" scale="3" width="100%" height="100%" xChannelSelector="R" yChannelSelector="G" />
                <feMerge><feMergeNode in="disp" /></feMerge>
              </filter>
            ))}
          </defs>
        </svg>
      </div>
    </div>
  );
}

const OPT_LABELS = ['a', 'b', 'c', 'd'];
const BOLD  = "'Balsamiq Sans:Bold', 'Balsamiq Sans', sans-serif";
const REG   = "'Balsamiq Sans:Regular', 'Balsamiq Sans', sans-serif";

// ── Small deck preview shown in the sidebar ────────────────────────────────
function CardDeckPreview({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const W = 148, H = Math.round(305 * 148 / 168);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', width: W + 10, height: H + 10 }}>
        <div style={{ position: 'absolute', top: 8, left: 8, width: W, height: H, borderRadius: 8, background: '#3d5522' }} />
        <div style={{ position: 'absolute', top: 4, left: 4, width: W, height: H, borderRadius: 8, background: '#5a7a30' }} />
        <div
          onClick={onClick}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            position: 'absolute', top: 0, left: 0, width: W, height: H,
            borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
            transform: hov ? 'translateY(-4px) scale(1.03)' : 'translateY(0) scale(1)',
            transition: 'transform 0.18s ease',
          }}
        >
          <div style={{ width: 168, height: 305, transform: `scale(${W / 168})`, transformOrigin: 'top left' }}>
            <Back />
          </div>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            paddingBottom: 14,
            background: `linear-gradient(to top, rgba(0,0,0,${hov ? 0.35 : 0.22}) 0%, transparent 55%)`,
            transition: 'background 0.18s',
          }}>
            <span style={{ color: 'white', fontSize: 11, fontWeight: 700, fontFamily: FONT, letterSpacing: 1.5 }}>
              TAP TO DRAW
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Full-screen centered card overlay with flip + hover states ─────────────
function TriviaCardOverlay({
  question,
  onAnswer,
}: {
  question: typeof QUESTIONS[0];
  onAnswer: (idx: number) => void;
}) {
  const [flipped, setFlipped]   = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered]   = useState<number | null>(null);

  // Auto-flip shortly after mounting so the player sees the back briefly
  useEffect(() => {
    const t = setTimeout(() => setFlipped(true), 420);
    return () => clearTimeout(t);
  }, []);

  const W = 300, H = Math.round(305 * W / 168);
  const BACK_SCALE = W / 168;

  const handleAnswer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    setTimeout(() => onAnswer(i), 1500);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(10,50,15,0.62)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(2px)',
      }}
    >
      {/* perspective wrapper keeps the 3-D effect centred */}
      <div style={{ perspective: 1100 }}>
        {/* card stack shadow */}
        <div style={{ position: 'relative', width: W + 14, height: H + 14 }}>
          <div style={{ position: 'absolute', top: 12, left: 12, width: W, height: H, borderRadius: 14, background: '#2e4018' }} />
          <div style={{ position: 'absolute', top: 6,  left: 6,  width: W, height: H, borderRadius: 14, background: '#4a6424' }} />

          {/* flip inner */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: W, height: H,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.65s cubic-bezier(0.4,0,0.2,1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}>

            {/* ── Front: card back ─────────────────────────────── */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 14, overflow: 'hidden',
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' as 'hidden',
            }}>
              <div style={{ width: 168, height: 305, transform: `scale(${BACK_SCALE})`, transformOrigin: 'top left' }}>
                <Back />
              </div>
            </div>

            {/* ── Back: question card ──────────────────────────── */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 14, overflow: 'hidden',
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' as 'hidden',
              transform: 'rotateY(180deg)',
              background: 'white',
            }}>
              {/* Leaf decoration — scaled to match wider card */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: Math.round(96 * BACK_SCALE), overflow: 'hidden' }}>
                <div style={{ width: 168, height: 96, transform: `scale(${BACK_SCALE})`, transformOrigin: 'top left' }}>
                  <CardLeaf />
                </div>
              </div>

              {/* Body */}
              <div style={{
                position: 'absolute',
                top: Math.round(96 * BACK_SCALE) - 8,
                left: 0, right: 0, bottom: 0,
                padding: '14px 20px 18px',
                display: 'flex', flexDirection: 'column', gap: 10,
                overflowY: 'auto',
              }}>
                <p style={{ margin: 0, fontFamily: BOLD, fontWeight: 700, fontSize: 17, color: '#444240' }}>
                  Multiple Choice
                </p>

                <p style={{ margin: 0, fontFamily: REG, fontWeight: 400, fontSize: 14, color: '#444240', lineHeight: 1.55 }}>
                  {question.q}
                </p>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {question.opts.map((opt, i) => {
                    const isCorrect  = i === question.ans;
                    const isSelected = selected === i;
                    const isHov      = hovered === i && selected === null;

                    let bg     = isHov ? '#e8f7f9' : 'transparent';
                    let border = isHov ? '2px solid #0096A9' : '2px solid transparent';
                    let tx     = isHov ? 'translateX(5px)' : 'translateX(0)';

                    if (selected !== null) {
                      if (isSelected && isCorrect)  { bg = '#c3e5ec'; border = '2px solid #0096A9'; tx = 'translateX(0)'; }
                      if (isSelected && !isCorrect) { bg = '#fde8e8'; border = '2px solid #e05a5a'; tx = 'translateX(0)'; }
                      if (!isSelected && isCorrect) { bg = '#c3e5ec'; border = '2px solid #0096A9'; tx = 'translateX(0)'; }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        onMouseEnter={() => selected === null && setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        disabled={selected !== null}
                        style={{
                          background: bg, border, borderRadius: 8,
                          padding: '7px 12px', textAlign: 'left',
                          cursor: selected !== null ? 'default' : 'pointer',
                          fontFamily: BOLD, fontWeight: 700, fontSize: 14, color: '#444240',
                          lineHeight: 1.4, transition: 'all 0.15s ease',
                          transform: tx,
                        }}
                      >
                        {OPT_LABELS[i]}) {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Answer reveal */}
                {selected !== null && (
                  <div style={{ marginTop: 4 }}>
                    <p style={{ margin: '0 0 5px', fontFamily: BOLD, fontWeight: 700, fontSize: 13, color: '#7e9e46' }}>
                      {selected === question.ans ? 'Answer:' : 'Correct answer:'}
                    </p>
                    <div style={{
                      background: '#c3e5ec', borderRadius: 7, padding: '5px 12px',
                      fontFamily: BOLD, fontWeight: 700, fontSize: 13, color: '#444240',
                    }}>
                      {OPT_LABELS[question.ans].toUpperCase()}) {question.opts[question.ans]}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase]         = useState<Phase>('setup');
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers]     = useState<Player[]>([]);
  const [curIdx, setCurIdx]       = useState(0);
  const [dieVal, setDieVal]       = useState(1);
  const [rolling, setRolling]     = useState(false);
  const [turnState, setTurnState] = useState<TurnState>('idle');
  const [question, setQuestion]       = useState<typeof QUESTIONS[0] | null>(null);
  const [cardOverlayOpen, setCardOverlayOpen] = useState(false);
  const [logs, setLogs]           = useState<string[]>([]);
  const [winner, setWinner]       = useState<Player | null>(null);
  const ivRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const usedQs = useRef(new Set<number>());

  const addLog = (msg: string) => setLogs(p => [msg, ...p].slice(0, 5));

  const startGame = (configs: Array<{ name: string; charIdx: number }>) => {
    const built = configs.map((cfg, i) => ({
      id: i, img: CHARS[cfg.charIdx].img, name: cfg.name.trim() || `Player ${i + 1}`,
      color: CHARS[cfg.charIdx].color, ringIdx: -1, seg: 0, leaves: 0,
    }));
    setPlayers(built);
    setCurIdx(0); setDieVal(1); setTurnState('idle'); setCardOverlayOpen(false);
    setLogs([`${built[0].name} goes first!`]);
    setPhase('play');
  };

  const doRoll = () => {
    if (rolling || turnState !== 'idle') return;
    setRolling(true);
    ivRef.current = setInterval(() => setDieVal(Math.ceil(Math.random() * 6)), 70);
    setTimeout(() => {
      clearInterval(ivRef.current!);
      const roll = Math.ceil(Math.random() * 6);
      setDieVal(roll);
      setRolling(false);
      processMove(roll);
    }, 650);
  };

  const processMove = (roll: number) => {
    const p = players[curIdx];
    let ri = p.ringIdx, seg = p.seg;

    if (p.ringIdx === -1) {
      ri = 0;
      seg = roll % RING_SEGS[0];
      addLog(`${p.name} enters Ring 1, tile ${seg + 1}!`);
    } else {
      const n = RING_SEGS[p.ringIdx];
      seg = (p.seg + roll) % n;
      addLog(`${p.name} rolled ${roll} → tile ${seg + 1}`);
    }

    setPlayers(prev => prev.map((pl, i) =>
      i === curIdx ? { ...pl, ringIdx: ri, seg } : pl
    ));

    const kind = segKind(ri, seg);
    if (kind === 'trivia') {
      let qi = Math.floor(Math.random() * QUESTIONS.length);
      for (let t = 0; t < QUESTIONS.length; t++) {
        if (!usedQs.current.has(qi)) break;
        qi = (qi + 1) % QUESTIONS.length;
        if (t === QUESTIONS.length - 1) usedQs.current.clear();
      }
      usedQs.current.add(qi);
      setQuestion(QUESTIONS[qi]); setTurnState('card');
    } else if (kind === 'gate') {
      if (p.leaves >= 3) setTurnState('gate');
      else { addLog(`${p.name} at gate — need ${3 - p.leaves} more 🍃`); setTurnState('moved'); }
    } else {
      setTurnState('moved');
    }
  };

  const doAnswer = (optIdx: number) => {
    if (!question) return;
    const correct = optIdx === question.ans;
    const p = players[curIdx];
    const newLeaves = correct ? p.leaves + 1 : p.leaves;
    if (correct) {
      setPlayers(prev => prev.map((pl, i) =>
        i === curIdx ? { ...pl, leaves: newLeaves } : pl
      ));
      addLog(`${p.name} correct! +1 🍃 (${newLeaves} total)`);
    } else {
      addLog(`${p.name} wrong — no leaf this time.`);
    }
    setQuestion(null);
    if (segKind(p.ringIdx >= 0 ? p.ringIdx : 0, p.seg) === 'gate' && newLeaves >= 3)
      setTurnState('gate');
    else setTurnState('moved');
  };

  const doAdvance = () => {
    const p = players[curIdx];
    const nextRi = p.ringIdx + 1;
    if (nextRi >= 3) {
      setPlayers(prev => prev.map((pl, i) =>
        i === curIdx ? { ...pl, ringIdx: 3, leaves: 0 } : pl
      ));
      setWinner(p);
      addLog(`🏆 ${p.name} completed the Leaf Trail!`);
      setPhase('win');
    } else {
      setPlayers(prev => prev.map((pl, i) =>
        i === curIdx ? { ...pl, ringIdx: nextRi, seg: 0, leaves: 0 } : pl
      ));
      addLog(`${p.name} advanced to Ring ${nextRi + 1}! 🌿`);
      setTurnState('moved');
    }
  };

  const doNextTurn = () => {
    setTurnState('idle'); setCardOverlayOpen(false);
    const n = players.length;
    let next = (curIdx + 1) % n;
    for (let i = 1; i <= n; i++) {
      const idx = (curIdx + i) % n;
      if (players[idx].ringIdx < 3) { next = idx; break; }
    }
    setCurIdx(next);
    addLog(`${players[next].name}'s turn.`);
  };

  if (phase === 'setup') return (
    <SetupScreen onSelectCount={n => { setPlayerCount(n); setPhase('playersetup'); }} />
  );
  if (phase === 'playersetup') return (
    <PlayerSetupScreen
      count={playerCount}
      onStart={startGame}
      onBack={() => setPhase('setup')}
    />
  );
  if (phase === 'win' && winner) return <WinScreen winner={winner} onRestart={() => setPhase('setup')} />;

  const cur = players[curIdx];

  const groups = new Map<string, Player[]>();
  players.forEach(p => {
    const key = p.ringIdx < 0 ? 'center' : p.ringIdx >= 3 ? 'done' : `${p.ringIdx}-${p.seg}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  });

  return (
    <div style={{
      minHeight: '100vh', background: '#d8f0d8',
      fontFamily: FONT,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '12px 8px', gap: 12,
    }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>

        {/* ── Board SVG ─────────────────────────────────────────── */}
        <svg
          width={SZ} height={SZ}
          viewBox={`0 0 ${SZ} ${SZ}`}
          style={{ display: 'block', overflow: 'visible', flexShrink: 0 }}
        >
          {/* Board disc */}
          <circle cx={CX} cy={CY} r={BOARD_R} fill="#3EAA4A" />
          <circle cx={CX} cy={CY} r={BOARD_R} fill="none" stroke="#2E8A38" strokeWidth={8} />

          {/* ── Ring path tracks (slightly lighter bands so paths are visible) ── */}
          {([0, 1, 2] as const).map(ri => (
            <circle key={`track-${ri}`}
              cx={CX} cy={CY}
              r={RING_MID[ri]}
              fill="none"
              stroke="#4DC462"
              strokeWidth={RINGS_DEF[ri].outer - RINGS_DEF[ri].inner}
            />
          ))}

          {/* Subtle ring separator lines */}
          {[RINGS_DEF[0].inner, RINGS_DEF[0].outer, RINGS_DEF[1].outer, RINGS_DEF[2].outer].map((r, i) => (
            <circle key={`sep-${i}`} cx={CX} cy={CY} r={r}
              fill="none" stroke="#2E8A38" strokeWidth={1.5} opacity={0.45} />
          ))}

          {/* ── Tiles ─────────────────────────────────────────── */}
          {([0, 1, 2] as const).map(ri =>
            Array.from({ length: RING_SEGS[ri] }, (_, seg) => {
              const kind = segKind(ri, seg);
              const { x, y } = segCenter(ri, seg);
              const isTrivia = kind === 'trivia';
              const isLandedTile =
                turnState !== 'idle' && ri === cur.ringIdx && seg === cur.seg;

              return (
                <g key={`${ri}-${seg}`}>
                  {/* Pulse ring when player is on this tile */}
                  {isLandedTile && (
                    <circle cx={x} cy={y} r={TILE_R + 8} fill="none"
                      stroke={isTrivia ? '#7FD6E0' : 'white'} strokeWidth={3.5}>
                      <animate attributeName="r"
                        values={`${TILE_R + 5};${TILE_R + 16};${TILE_R + 5}`}
                        dur="1.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity"
                        values="0.9;0;0.9" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={x} cy={y} r={TILE_R}
                    fill={isTrivia ? '#0096A9' : '#E2F8DC'}
                    stroke={isTrivia ? 'white' : '#B8E4B0'}
                    strokeWidth={isTrivia ? 3 : 2}
                  />
                  {isTrivia && (
                    <text
                      x={x} y={y}
                      textAnchor="middle" dominantBaseline="central"
                      fontSize={21} fill="#00444d"
                      fontFamily={FONT}
                      style={{ userSelect: 'none', fontWeight: 700 }}>
                      ?
                    </text>
                  )}
                </g>
              );
            })
          )}

          {/* ── Direction arrows — placed between tiles, not on them ── */}
          <defs>
            <marker id="darr" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
              <polyline points="0,0.5 4.5,3 0,5.5"
                fill="none" stroke="rgba(255,255,255,0.75)"
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
          {([0, 1, 2] as const).map(ri => {
            const mr = RING_MID[ri];
            const n = RING_SEGS[ri];
            const step = (2 * Math.PI) / n;
            // Pick between-tile angles (k + 0.5), skip gate area (k=0),
            // take every floor(n/3) apart so we get ~3 arrows per ring
            const every = Math.floor(n / 3);
            return Array.from({ length: n }, (_, k) => k)
              .filter(k => k !== 0 && (k - 1) % every === 0)
              .map((k, ai) => {
                const angCenter = RING_START[ri] + (k + 0.5) * step;
                const span = 0.13; // small arc so it fits between tiles
                const a1 = angCenter - span;
                const a2 = angCenter + span;
                const x1 = (CX + mr * Math.cos(a1)).toFixed(2);
                const y1 = (CY + mr * Math.sin(a1)).toFixed(2);
                const x2 = (CX + mr * Math.cos(a2)).toFixed(2);
                const y2 = (CY + mr * Math.sin(a2)).toFixed(2);
                return (
                  <path key={`da-${ri}-${ai}`}
                    d={`M ${x1} ${y1} A ${mr} ${mr} 0 0 1 ${x2} ${y2}`}
                    fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={4}
                    strokeLinecap="round" markerEnd="url(#darr)"
                  />
                );
              });
          })}

          {/* ── Gate stickers (drawn over tiles so badges are visible) ── */}
          {([0, 1, 2] as const).map(ri => <GateSticker key={ri} ri={ri} />)}

          {/* ── Center "Start" circle ─────────────────────────── */}
          <circle cx={CX} cy={CY} r={CENTER_R + 8} fill="#2E8A38" />
          <circle cx={CX} cy={CY} r={CENTER_R}     fill="#D8F5CE" />
          <text x={CX} y={CY - 10}
            textAnchor="middle" dominantBaseline="central"
            fontSize={14} fill="#2a6e32"
            fontFamily={FONT} style={{ userSelect: 'none', fontWeight: 700 }}>
            Start
          </text>
          {/* Two egg shapes below "Start" text */}
          <ellipse cx={CX - 9} cy={CY + 12} rx={7} ry={9} fill="#F0F8E8" />
          <ellipse cx={CX + 9} cy={CY + 12} rx={7} ry={9} fill="#F0F8E8" />

          {/* ── Decorations outside board ─────────────────────── */}
          {/* Pink flower — upper-left */}
          {[0,1,2,3,4].map(i => {
            const ba = (i / 5) * Math.PI * 2;
            return <circle key={i} cx={CX - 305 + 18 * Math.cos(ba)} cy={CY - 188 + 18 * Math.sin(ba)} r={16} fill="#E88C95" opacity={0.9} />;
          })}
          <circle cx={CX - 305} cy={CY - 188} r={10} fill="#F0ADBA" />
          {/* Pink flower — lower-right */}
          {[0,1,2,3,4].map(i => {
            const ba = (i / 5) * Math.PI * 2;
            return <circle key={i} cx={CX + 305 + 16 * Math.cos(ba)} cy={CY + 200 + 16 * Math.sin(ba)} r={14} fill="#E88C95" opacity={0.88} />;
          })}
          <circle cx={CX + 305} cy={CY + 200} r={8} fill="#F0ADBA" />
          {/* Pink flower — lower-left */}
          {[0,1,2,3,4].map(i => {
            const ba = (i / 5) * Math.PI * 2;
            return <circle key={i} cx={CX - 295 + 14 * Math.cos(ba)} cy={CY + 208 + 14 * Math.sin(ba)} r={12} fill="#E88C95" opacity={0.85} />;
          })}
          <circle cx={CX - 295} cy={CY + 208} r={7} fill="#F0ADBA" />
          {/* Small pink flower — upper-right area */}
          {[0,1,2,3,4].map(i => {
            const ba = (i / 5) * Math.PI * 2;
            return <circle key={i} cx={CX + 68 + 10 * Math.cos(ba)} cy={CY - 315 + 10 * Math.sin(ba)} r={9} fill="#E88C95" opacity={0.82} />;
          })}
          <circle cx={CX + 68} cy={CY - 315} r={5} fill="#F0ADBA" />
          {/* Blue puddle — left */}
          <ellipse cx={CX - 318} cy={CY + 45} rx={28} ry={16} fill="#7EC8D8" opacity={0.75} />
          <ellipse cx={CX - 318} cy={CY + 43} rx={22} ry={10} fill="#A8DDED" opacity={0.6} />
          {/* Dark grass plant — right */}
          {[-8, 0, 8].map((dx, i) => (
            <path key={i}
              d={`M ${CX + 318 + dx} ${CY + 8} C ${CX + 316 + dx} ${CY - 12}, ${CX + 324 + dx} ${CY - 22}, ${CX + 318 + dx} ${CY - 32}`}
              fill="none" stroke="#2a5e28" strokeWidth={4} strokeLinecap="round"
            />
          ))}

          {/* ── Player tokens ─────────────────────────────────── */}
          {Array.from(groups.entries()).map(([key, ps]) => {
            if (key === 'done') return null;
            const isCenter = key === 'center';
            const base = isCenter
              ? { x: CX, y: CY }
              : (() => {
                  const [ri, seg] = key.split('-').map(Number);
                  return tileXY(ri, seg);
                })();
            return ps.map((p, idx) => {
              const count = ps.length;
              let dx = 0, dy = 0;
              if (count > 1) {
                const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
                const off = count === 2 ? 14 : 16;
                dx = off * Math.cos(angle); dy = off * Math.sin(angle);
              }
              const tx = base.x + dx, ty = base.y + dy;
              const active = p.id === curIdx;
              const tokenSz = 46;
              const half = tokenSz / 2;
              return (
                <g key={p.id}>
                  {/* Active glow ring */}
                  {active && (
                    <circle cx={tx} cy={ty} r={28} fill="none"
                      stroke={p.color} strokeWidth={3.5}>
                      <animate attributeName="r"       values="24;32;24"    dur="1.3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.85;0;0.85" dur="1.3s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Caterpillar sticker image */}
                  <image
                    href={p.img}
                    x={tx - half} y={ty - half}
                    width={tokenSz} height={tokenSz}
                    style={{
                      filter: active
                        ? `drop-shadow(0 0 5px ${p.color}cc) drop-shadow(0 2px 4px rgba(0,0,0,0.4))`
                        : 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
                    }}
                  />
                </g>
              );
            });
          })}
        </svg>

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 256 }}>

          {/* Current player */}
          <div style={{
            background: 'white', borderRadius: 20, padding: 16,
            border: `3px solid ${cur.color}`,
          }}>
            <div style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 2, marginBottom: 10, fontFamily: FONT }}>
              CURRENT TURN
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: cur.color + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${cur.color}55`,
              }}>
                <img src={cur.img} alt={cur.name} style={{ width: 48, height: 48, objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontSize: 22, color: '#1a5e3a', fontWeight: 700, fontFamily: FONT }}>{cur.name}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, fontFamily: FONT }}>
                  {cur.ringIdx < 0 ? 'Center (Start)' : `Ring ${cur.ringIdx + 1} · Tile ${cur.seg + 1}`}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 2, marginBottom: 6, fontFamily: FONT }}>
                LEAVES (need 3 to advance)
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    fontSize: 28,
                    filter: i < cur.leaves ? 'none' : 'grayscale(1) opacity(0.22)',
                    transition: 'filter 0.3s',
                  }}>🍃</span>
                ))}
              </div>
            </div>
          </div>

          {/* Die + roll/turn actions */}
          <div style={{ background: 'white', borderRadius: 20, padding: 16, border: '2px solid #CAECC3' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <Die val={dieVal} rolling={rolling} />
            </div>
            {turnState === 'idle' && (
              <button onClick={doRoll} disabled={rolling} style={{
                width: '100%', padding: '12px 0', borderRadius: 14, border: 'none',
                background: rolling ? '#e5e7eb' : '#0096A9',
                color: rolling ? '#9ca3af' : 'white',
                fontSize: 17, fontWeight: 700, cursor: rolling ? 'not-allowed' : 'pointer',
                fontFamily: FONT,
              }}>
                {rolling ? 'Rolling…' : '🎲 Roll Dice!'}
              </button>
            )}
            {turnState === 'moved' && (
              <button onClick={doNextTurn} style={{
                width: '100%', padding: '12px 0', borderRadius: 14, border: 'none',
                background: '#4CB85E', color: 'white',
                fontSize: 17, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
              }}>
                Next Turn →
              </button>
            )}
            {turnState === 'card' && (
              <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 13, color: '#9ca3af', fontFamily: FONT }}>
                Landed on a trivia tile!
              </div>
            )}
            {turnState === 'gate' && (
              <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 13, color: '#4CB85E', fontWeight: 700, fontFamily: FONT }}>
                🍃 Gate reached!
              </div>
            )}
          </div>

          {/* Trivia card deck — tap to open the centered overlay */}
          {turnState === 'card' && question && (
            <div style={{ background: 'white', borderRadius: 20, padding: 16, border: '2px solid #0096A9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 10, color: '#0096A9', letterSpacing: 2, fontFamily: FONT, fontWeight: 700 }}>DRAW A CARD</div>
              <CardDeckPreview onClick={() => setCardOverlayOpen(true)} />
            </div>
          )}

          {/* Players */}
          <div style={{ background: 'white', borderRadius: 20, padding: 16, border: '2px solid #CAECC3' }}>
            <div style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 2, marginBottom: 10, fontFamily: FONT }}>PLAYERS</div>
            {players.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                opacity: p.ringIdx >= 3 ? 0.4 : 1,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: p.color + '22', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                  border: i === curIdx ? `2.5px solid ${p.color}` : '2.5px solid transparent',
                }}>
                  <img src={p.img} alt={p.name} style={{ width: 30, height: 30, objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: i === curIdx ? 700 : 500, color: i === curIdx ? '#1a5e3a' : '#6b7280', fontFamily: FONT }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: FONT }}>
                    {p.ringIdx < 0 ? 'Center' : p.ringIdx >= 3 ? '🏁 Finished!' : `Ring ${p.ringIdx + 1}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[0, 1, 2].map(l => (
                    <span key={l} style={{ fontSize: 13, filter: l < p.leaves ? 'none' : 'grayscale(1) opacity(0.22)' }}>🍃</span>
                  ))}
                </div>
              </div>
            ))}
          </div>


          {/* Legend */}
          <div style={{ background: 'white', borderRadius: 20, padding: 16, border: '2px solid #CAECC3' }}>
            <div style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 2, marginBottom: 10, fontFamily: FONT }}>LEGEND</div>
            {[
              { mark: '?',  bg: '#e0f7fa', fg: '#00444d', label: 'Trivia — answer to earn 🍃' },
              { mark: '🍃', bg: '#f0fdf4', fg: '#15803d', label: '×3 gate — need 3 🍃 to pass' },
            ].map(({ mark, bg, fg, label }) => (
              <div key={mark} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 14, background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: fg, fontWeight: 700, flexShrink: 0, fontFamily: FONT,
                }}>{mark}</div>
                <span style={{ fontSize: 11, color: '#6b7280', fontFamily: FONT }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Trivia card overlay — centred full-screen flip ───────── */}
      {cardOverlayOpen && question && (
        <TriviaCardOverlay
          question={question}
          onAnswer={(idx) => {
            setCardOverlayOpen(false);
            doAnswer(idx);
          }}
        />
      )}

      {/* ── Gate advance modal ───────────────────────────────────── */}
      {turnState === 'gate' && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,60,20,0.42)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: 16,
        }}>
          <div style={{
            background: 'white', borderRadius: 28, padding: 32, maxWidth: 380, width: '100%',
            textAlign: 'center', border: '3px solid #4CB85E',
          }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>🍃🍃🍃</div>
            <div style={{ fontSize: 26, color: '#1a5e3a', fontWeight: 700, marginBottom: 6, fontFamily: FONT }}>
              You have 3 leaves!
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
              <img src={cur.img} alt={cur.name} style={{ width: 44, height: 44, objectFit: 'contain' }} />
              <span style={{ fontSize: 14, color: '#6b7280', fontFamily: FONT }}>
                {cur.name} can pass through the gate!
              </span>
            </div>
            <button onClick={doAdvance} style={{
              padding: '14px 32px', borderRadius: 14, border: 'none',
              background: '#0096A9', color: 'white',
              fontSize: 18, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
            }}>
              🌿 Advance to Next Ring!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Setup screen ───────────────────────────────────────────────────────────
function SetupScreen({ onSelectCount }: { onSelectCount: (n: number) => void }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#d8f0d8',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 36, fontFamily: FONT,
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#1a5e3a', fontSize: 54, margin: 0, fontWeight: 700 }}>🌿 Leaf Trail</h1>
        <p style={{ color: '#6b7280', marginTop: 8, fontSize: 16, maxWidth: 360, margin: '8px auto 0', fontFamily: FONT }}>
          Answer trivia to earn leaves 🍃 · Collect 3 to pass each gate · Spiral out to the finish!
        </p>
      </div>

      <div>
        <div style={{ textAlign: 'center', marginBottom: 18, fontSize: 13, color: '#9ca3af', letterSpacing: 2, fontFamily: FONT }}>
          HOW MANY PLAYERS?
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {[2, 3, 4].map(n => (
            <button key={n} onClick={() => onSelectCount(n)} style={{
              width: 130, height: 140, borderRadius: 22,
              border: '3px solid #CAECC3', background: 'white',
              color: '#1a5e3a', cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 6,
              fontFamily: FONT, transition: 'all 0.15s',
            }}
              onMouseEnter={e => Object.assign(e.currentTarget.style, {
                borderColor: '#0096A9', transform: 'scale(1.06)',
              })}
              onMouseLeave={e => Object.assign(e.currentTarget.style, {
                borderColor: '#CAECC3', transform: 'scale(1)',
              })}>
              <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', justifyContent: 'center', width: 96 }}>
                {CHARS.slice(0, n).map(c => (
                  <img key={c.name} src={c.img} alt={c.name}
                    style={{ width: 40, height: 40, objectFit: 'contain' }} />
                ))}
              </div>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{n} Players</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Player setup screen ────────────────────────────────────────────────────
function PlayerSetupScreen({
  count,
  onStart,
  onBack,
}: {
  count: number;
  onStart: (configs: Array<{ name: string; charIdx: number }>) => void;
  onBack: () => void;
}) {
  const [setups, setSetups] = useState(() =>
    Array.from({ length: count }, (_, i) => ({ name: '', charIdx: i }))
  );

  const takenChars = new Set(setups.map(s => s.charIdx));

  const setName = (pi: number, val: string) =>
    setSetups(prev => prev.map((s, i) => i === pi ? { ...s, name: val } : s));

  const setChar = (pi: number, ci: number) =>
    setSetups(prev => prev.map((s, i) => i === pi ? { ...s, charIdx: ci } : s));

  const allValid = setups.every(s => s.name.trim().length > 0);

  const PLAYER_LABELS = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
  const PLAYER_COLORS = ['#e05a5a', '#9b4dca', '#4b7bbf', '#e87c2a'];

  return (
    <div style={{
      minHeight: '100vh', background: '#d8f0d8',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 28, fontFamily: FONT, padding: '24px 16px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#1a5e3a', fontSize: 36, margin: 0, fontWeight: 700 }}>
          Choose Your Bug
        </h2>
        <p style={{ color: '#6b7280', margin: '6px 0 0', fontSize: 14, fontFamily: FONT }}>
          Enter your name and pick a character
        </p>
      </div>

      <div style={{
        display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
        maxWidth: 920,
      }}>
        {setups.map((setup, pi) => {
          const accent = PLAYER_COLORS[pi];
          return (
            <div key={pi} style={{
              background: 'white', borderRadius: 24,
              border: `3px solid ${accent}55`,
              padding: '20px 18px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
              width: 200, flexShrink: 0,
              boxShadow: `0 4px 18px ${accent}18`,
            }}>
              {/* Player label */}
              <div style={{
                fontSize: 11, letterSpacing: 2, color: accent,
                fontWeight: 700, fontFamily: FONT,
              }}>
                {PLAYER_LABELS[pi]}
              </div>

              {/* Selected character large preview */}
              <div style={{
                width: 80, height: 80, borderRadius: 20,
                background: accent + '18',
                border: `2.5px solid ${accent}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img
                  src={CHARS[setup.charIdx].img}
                  alt={CHARS[setup.charIdx].name}
                  style={{ width: 66, height: 66, objectFit: 'contain' }}
                />
              </div>

              {/* Name input */}
              <input
                value={setup.name}
                onChange={e => setName(pi, e.target.value)}
                placeholder="Your name…"
                maxLength={16}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: 12,
                  border: `2px solid ${setup.name.trim() ? accent + '77' : '#d1d5db'}`,
                  fontFamily: FONT, fontSize: 15, fontWeight: 700,
                  color: '#1a5e3a', outline: 'none',
                  background: setup.name.trim() ? accent + '08' : 'white',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = accent; }}
                onBlur={e => { e.currentTarget.style.borderColor = setup.name.trim() ? accent + '77' : '#d1d5db'; }}
              />

              {/* Character selector grid */}
              <div>
                <div style={{
                  fontSize: 10, color: '#9ca3af', letterSpacing: 2,
                  marginBottom: 8, textAlign: 'center', fontFamily: FONT,
                }}>
                  PICK YOUR BUG
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
                }}>
                  {CHARS.map((c, ci) => {
                    const isSelected = setup.charIdx === ci;
                    const isTaken = takenChars.has(ci) && !isSelected;
                    return (
                      <button
                        key={ci}
                        disabled={isTaken}
                        onClick={() => setChar(pi, ci)}
                        title={isTaken ? 'Taken' : c.name}
                        style={{
                          width: 72, height: 72, borderRadius: 14,
                          border: isSelected
                            ? `3px solid ${accent}`
                            : isTaken
                              ? '2px solid #e5e7eb'
                              : '2px solid #d1d5db',
                          background: isSelected
                            ? accent + '18'
                            : isTaken ? '#f9fafb' : 'white',
                          cursor: isTaken ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: 0, position: 'relative',
                          transition: 'all 0.15s',
                          transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                          opacity: isTaken ? 0.35 : 1,
                          boxShadow: isSelected ? `0 0 0 3px ${accent}33` : 'none',
                        }}
                        onMouseEnter={e => {
                          if (!isTaken && !isSelected)
                            Object.assign(e.currentTarget.style, { borderColor: accent + 'aa', transform: 'scale(1.04)' });
                        }}
                        onMouseLeave={e => {
                          if (!isTaken && !isSelected)
                            Object.assign(e.currentTarget.style, { borderColor: '#d1d5db', transform: 'scale(1)' });
                        }}
                      >
                        <img src={c.img} alt={c.name}
                          style={{ width: 54, height: 54, objectFit: 'contain' }} />
                        {isSelected && (
                          <div style={{
                            position: 'absolute', bottom: 3, right: 4,
                            width: 14, height: 14, borderRadius: '50%',
                            background: accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <polyline points="1.5,4 3.2,6 6.5,2" stroke="white" strokeWidth="1.5"
                                strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={onBack}
          style={{
            padding: '12px 22px', borderRadius: 14,
            border: '2px solid #d1d5db', background: 'white',
            color: '#6b7280', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: FONT,
          }}
        >
          ← Back
        </button>
        <button
          disabled={!allValid}
          onClick={() => onStart(setups)}
          style={{
            padding: '14px 36px', borderRadius: 14, border: 'none',
            background: allValid ? '#0096A9' : '#e5e7eb',
            color: allValid ? 'white' : '#9ca3af',
            fontSize: 17, fontWeight: 700,
            cursor: allValid ? 'pointer' : 'not-allowed',
            fontFamily: FONT, transition: 'background 0.15s, color 0.15s',
          }}
        >
          🌿 Start Game!
        </button>
      </div>

      {!allValid && (
        <p style={{ color: '#9ca3af', fontSize: 13, margin: 0, fontFamily: FONT }}>
          All players need a name to continue
        </p>
      )}
    </div>
  );
}

// ── Win screen ─────────────────────────────────────────────────────────────
function WinScreen({ winner, onRestart }: { winner: Player; onRestart: () => void }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#d8f0d8',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 20, fontFamily: FONT, textAlign: 'center',
    }}>
      <img src={winner.img} alt={winner.name} style={{ width: 140, height: 140, objectFit: 'contain' }} />
      <div style={{ fontSize: 46, fontWeight: 700, color: '#1a5e3a' }}>{winner.name} Wins!</div>
      <div style={{ fontSize: 36 }}>🍃🍃🍃 🏆 🍃🍃🍃</div>
      <p style={{ color: '#6b7280', fontSize: 16, margin: 0, fontFamily: FONT }}>
        Blazed through all three rings of the Leaf Trail!
      </p>
      <button onClick={onRestart} style={{
        padding: '14px 36px', borderRadius: 16, border: 'none',
        background: '#0096A9', color: 'white',
        fontSize: 20, fontWeight: 700, cursor: 'pointer',
        fontFamily: FONT, marginTop: 8,
      }}>🌿 Play Again</button>
    </div>
  );
}
