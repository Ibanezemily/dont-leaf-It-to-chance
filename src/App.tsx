import { useState, useRef, useEffect, type CSSProperties } from 'react';
import Back from '@/imports/Back';
import q1Paths from '@/imports/Question1/svg-sqkd0ilo4z';
import pinkCat      from '@/imports/image.png';
import purpleCat    from '@/imports/image-1.png';
import blueCat      from '@/imports/image-2.png';
import orangeCat    from '@/imports/image-3.png';
import leafLogo from '@/imports/LeafLogo/leaf.svg';
import leafIcon from '@/imports/LeafIcon/leaf-icon.svg';
import cloudToken from '@/imports/Tokens/cloud.svg';
import waspToken  from '@/imports/Tokens/wasp.svg';
import birdToken  from '@/imports/Tokens/bird.svg';
import slugToken  from '@/imports/Tokens/slug.svg';
import actionStickyBusiness from '@/imports/ActionCards/sticky-business.png';
import actionBirdSighting   from '@/imports/ActionCards/bird-sighting.png';
import actionCamouflage     from '@/imports/ActionCards/camouflage.png';
import actionSweetSpot      from '@/imports/ActionCards/sweet-spot.png';
import actionRainyWeather   from '@/imports/ActionCards/rainy-weather.png';
import actionPuddleBreak    from '@/imports/ActionCards/puddle-break.png';
import actionAntRaid        from '@/imports/ActionCards/ant-raid.png';
import actionSunnyRock      from '@/imports/ActionCards/sunny-rock.png';
import actionWaspWatch      from '@/imports/ActionCards/wasp-watch.png';
import actionMolt           from '@/imports/ActionCards/molt.png';
import actionWebTrap        from '@/imports/ActionCards/web-trap.png';
import actionTailwind       from '@/imports/ActionCards/tailwind.png';
import manualFull from '@/imports/Manual/manual-full.png';
import redButterfly    from '@/imports/Butterflies/red.png';
import purpleButterfly from '@/imports/Butterflies/purple.png';
import blueButterfly   from '@/imports/Butterflies/blue.png';
import orangeButterfly from '@/imports/Butterflies/orange.png';
import {
  ART, BLADES, BLADE_COLOR, BLADE_W, BLADE_H, BLADE_RX,
  BOARD_W, BOARD_H, BOARD_CX, BOARD_CY, PAGE_BG,
  FINISH_LABELS, START_LABEL,
  TILES, RING_SEGS, TILE_R, TILE_SZ,
  TILE_TRIVIA_FILL, TILE_PLAIN_FILL, TILE_INK, TILE_QMARK_SZ,
  TILE_ELLIPSE, TILE_ELLIPSE_SZ,
  GATES, gateAt, artTransform,
} from '@/imports/Board';

// ── Board geometry ─────────────────────────────────────────────────────────
// All positions come straight from the Figma board (src/imports/Board/index.ts).
// The SVG uses Figma's own 792×612 print-sheet coordinates and scales to fit.
const CX = BOARD_CX, CY = BOARD_CY;

function tileKind(ri: number, seg: number) {
  return TILES[ri][seg].kind;
}

function tileXY(ri: number, seg: number) {
  const t = TILES[ri][seg];
  return { x: t.x, y: t.y };
}

// ── Trivia questions — the 25 official cards from Figma ────────────────────
const QUESTIONS: Array<{
  type: 'mc' | 'tf';
  q: string;
  opts: string[];
  ans: number;
  explain?: string;
}> = [
  { type: 'mc', q: "A butterfly's transformation from egg to adult has a special name, what is it?", opts: ["Migration", "Metamorphosis", "Hibernation", "Camouflage"], ans: 1 },
  { type: 'mc', q: "What is the first stage of the butterfly's life-cycle?", opts: ["Caterpillar", "Egg", "Chrysalis", "Butterfly"], ans: 1 },
  { type: 'mc', q: "Butterflies can be picky about where they lay their eggs, what is their go to spot?", opts: ["Under rocks", "In tree bark", "In water", "On leaves or stems"], ans: 3 },
  { type: 'tf', q: "All Butterfly eggs look the same.", opts: ["True", "False"], ans: 1, explain: "eggs can be round, oval or cylindrical depending on the species." },
  { type: 'tf', q: "Butterfly eggs always hatch after exactly one day.", opts: ["True", "False"], ans: 1, explain: "hatching time varies by species, it can take anywhere from a week to several weeks." },
  { type: 'tf', q: "Butterflies lay many eggs because only a small amount of them will survive.", opts: ["True", "False"], ans: 0, explain: "Butterflies lay many eggs to increase the chances of the next generation living on." },
  { type: 'mc', q: "What is the second stage of a butterfly's life cycle?", opts: ["Caterpillar", "Egg", "Chrysalis", "Butterfly"], ans: 0 },
  { type: 'tf', q: "The Milkweed plant that monarch caterpillars eat only serves as food.", opts: ["True", "False"], ans: 1, explain: "the toxic compounds the plant has are stored and serve as defense by making them taste bad to predators." },
  { type: 'mc', q: "How does a caterpillar get out of its egg shell?", opts: ["Rain breaks it", "It eats through it", "Ants break it", "It falls open"], ans: 1 },
  { type: 'tf', q: "Spiders and ants are predators to the monarch caterpillar.", opts: ["True", "False"], ans: 0, explain: "ants and spiders are a common predator of the monarch caterpillar." },
  { type: 'mc', q: "How much larger can a caterpillar get from when it first hatches?", opts: ["10 times", "100 times", "50 times", "1000 times"], ans: 1 },
  { type: 'tf', q: "A caterpillar sheds its skin 4 to 5 times before it's done growing.", opts: ["True", "False"], ans: 0, explain: "the caterpillar sheds its skin about 4 to 5 times as it keeps growing bigger and bigger." },
  { type: 'mc', q: "What is the main job of the caterpillar during it's stage?", opts: ["Build a nest", "Finding a mate", "Eating and growing", "Migrating"], ans: 2 },
  { type: 'tf', q: "There are two different names for the third stage of the butterfly cycle.", opts: ["True", "False"], ans: 0, explain: "the third stage is both known as the Chrysalis and the Pupa stage." },
  { type: 'tf', q: "Some species can stay inside their chrysalis stage for weeks to even months.", opts: ["True", "False"], ans: 0, explain: "some butterflies can stay inside for weeks to months to wait until the conditions are favourable." },
  { type: 'mc', q: "What happens inside the chrysalis?", opts: ["It sleeps", "Its body transforms", "It stores food", "It practices flying"], ans: 1 },
  { type: 'tf', q: "A chrysalis can only be found under a branch.", opts: ["True", "False"], ans: 1, explain: "they can also be found hidden in leaves or even buried underground!" },
  { type: 'tf', q: "The last and final stage of the life cycle is known as the Pupa.", opts: ["True", "False"], ans: 1, explain: "the last stage of the life cycle is known as the Butterfly!" },
  { type: 'mc', q: "Once the caterpillar becomes a butterfly its main job is what?", opts: ["Building a chrysalis", "Eating leaves", "Laying eggs", "Shedding skin"], ans: 2 },
  { type: 'mc', q: "Every year monarch butterflies make a large trip across countries, what is this called?", opts: ["Hibernation", "Metamorphosis", "Camouflage", "Migration"], ans: 3 },
  { type: 'mc', q: "While drinking nectar, how can a butterfly help a flower?", opts: ["Help it grow taller", "Change its color", "Pollinate the flower", "Keep rain off it"], ans: 2 },
  { type: 'mc', q: "Plants need pollinators like butterflies, what share of the world's food producing plants need pollinators?", opts: ["Almost 80%", "About 25%", "About 10%", "About 50%"], ans: 0 },
  { type: 'tf', q: "A butterfly can taste with its feet.", opts: ["True", "False"], ans: 0, explain: "a butterfly has taste receptors on its feet! It helps the butterfly identify which plant it lands on." },
  { type: 'tf', q: "It takes one generation of monarch butterflies to complete full migration.", opts: ["True", "False"], ans: 1, explain: "it actually takes multiple generations to complete the full migration trip." },
  { type: 'mc', q: "Why do butterflies sometimes gather at mud puddles?", opts: ["To cool off", "To hide from threats", "To get salts & minerals", "To lay eggs"], ans: 2 },
];

// ── Characters ─────────────────────────────────────────────────────────────
const CHARS = [
  { img: pinkCat,   name: 'Rosie',  color: '#e05a5a', butterfly: redButterfly },
  { img: purpleCat, name: 'Violet', color: '#9b4dca', butterfly: purpleButterfly },
  { img: blueCat,   name: 'Azure',  color: '#4b7bbf', butterfly: blueButterfly },
  { img: orangeCat, name: 'Sunny',  color: '#e87c2a', butterfly: orangeButterfly },
];

// ── Leaf icon (Figma leaf glyph, used in place of the 🍃 emoji) ────────────
function LeafIcon({ size = 20, style, className }: { size?: number; style?: CSSProperties; className?: string }) {
  return (
    <img
      src={leafIcon} alt="" className={className}
      style={{ width: size, height: size * (53.5513 / 30.6442), objectFit: 'contain', display: 'inline-block', ...style }}
    />
  );
}

// ── Leaf-gain flourish ───────────────────────────────────────────────────
// A one-shot feedback animation triggered by an actual leaf gain (correct
// trivia, a "keep as leaf" card, a successful steal) — not a decorative loop.
// The leaf starts big at the middle of the screen, then shrinks and flies
// into the player's card; landing there triggers a brief pop (see .leaf-pop
// in index.css) on the card's newest leaf.
function FlyingLeaf({ from, to, onDone }: {
  from: { x: number; y: number }; to: { x: number; y: number }; onDone: () => void;
}) {
  const [flying, setFlying] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setFlying(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const dx = to.x - from.x, dy = to.y - from.y;
  return (
    <div
      onTransitionEnd={onDone}
      style={{
        position: 'fixed', left: from.x, top: from.y, zIndex: 200, pointerEvents: 'none',
        transition: 'transform 0.7s cubic-bezier(0.3, 0.7, 0.4, 1), opacity 0.65s ease-in',
        transform: flying
          ? `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(0.35)`
          : 'translate(-50%, -50%) scale(2.8)',
        opacity: flying ? 0 : 1,
      }}
    >
      <LeafIcon size={22} />
    </div>
  );
}

// ── Die ────────────────────────────────────────────────────────────────────
const DOT_PCT = [18, 50, 82];
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
      borderRadius: 12, border: '2px solid #d1d5db',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: rolling ? 'tumble 0.12s linear infinite' : 'none',
    }}>
      <div style={{ width: 48, height: 48, position: 'relative' }}>
        {(DOT_MAP[val] ?? []).map(([r, c], i) => (
          <div key={i} style={{
            position: 'absolute', width: 11, height: 11,
            background: '#2d2d2d', borderRadius: '50%',
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
  butterflyImg: string;
  name: string;
  color: string;
  ringIdx: number;
  seg: number;
  leaves: number;
  shield?: boolean;   // Camouflage — blocks the next negative effect against this player
  skipNext?: boolean; // Sticky Business — this player skips their next turn
}
type Phase = 'setup' | 'playersetup' | 'play' | 'win';
// 'card'         = landed on a trivia tile; card back shown until player taps to flip
// 'action'       = an action card was drawn; showing its card back/front
// 'placingToken' = an action card requires placing a trap token on the board
// 'chooseTarget' = an action card requires picking another player (e.g. steal a leaf)
type TurnState = 'idle' | 'card' | 'action' | 'placingToken' | 'chooseTarget' | 'gate' | 'moved';

// ── Action cards — the 12 official cards from Figma, shuffled into the same
// deck as the trivia cards. Trap cards let a player leave a token on any
// board space; the next player to land there triggers its effect.
type ActionKind = 'trap' | 'keepLeaf' | 'shield' | 'instantLoseLeaf' | 'instantSteal' | 'instantAdvance';
interface ActionCard {
  title: string;
  body: string;
  kind: ActionKind;
  img: string;
  tokenName?: string;
  tokenImg?: string;
  trapEffect?: 'skip' | 'loseLeaf';
  amount?: number;
}
const ACTIONS: ActionCard[] = [
  { title: 'Sticky Business!', kind: 'trap', tokenName: 'Slug', tokenImg: slugToken, trapEffect: 'skip',
    img: actionStickyBusiness,
    body: "Place the Slug on any space on the board. The next player to land on that space will get stuck and have to skip their next turn. Remove the slug after it's been landed on." },
  { title: 'Bird Sighting!', kind: 'trap', tokenName: 'Bird', tokenImg: birdToken, trapEffect: 'loseLeaf',
    img: actionBirdSighting,
    body: "Place the Bird on any space on the board. The next player to land on that space will lose a leaf. Remove the Bird after it's been landed on." },
  { title: 'Camouflage!', kind: 'shield',
    img: actionCamouflage,
    body: "Your coloring blends perfectly into the leaves. Keep this card. You are protected the next time you encounter a predator. Discard after use." },
  { title: 'Sweet Spot!', kind: 'keepLeaf',
    img: actionSweetSpot,
    body: "You found rich nectar in the milkweed flowers! Keep this card as a Leaf Card." },
  { title: 'Rainy Weather', kind: 'trap', tokenName: 'Cloud', tokenImg: cloudToken, trapEffect: 'loseLeaf',
    img: actionRainyWeather,
    body: "Place a stormy cloud on any space. Any player who lands there loses a leaf. Remove the cloud after it's been landed on." },
  { title: 'Puddle Break!', kind: 'instantSteal',
    img: actionPuddleBreak,
    body: "You stopped at a puddle to drink water. Take one leaf from any player!" },
  { title: 'Ant Raid', kind: 'instantLoseLeaf',
    img: actionAntRaid,
    body: "A hungry ant colony found your egg. Discard 1 leaf." },
  { title: 'Sunny Rock!', kind: 'keepLeaf',
    img: actionSunnyRock,
    body: "You found a warm rock to bask on and warm your wings. Keep this card as a Leaf Card!" },
  { title: 'Wasp Watch', kind: 'trap', tokenName: 'Wasp', tokenImg: waspToken, trapEffect: 'loseLeaf',
    img: actionWaspWatch,
    body: "Place a Wasp predator token on any space. Any player who lands there loses 1 leaf. Remove the Wasp after it's been landed on." },
  { title: 'Molt!', kind: 'keepLeaf',
    img: actionMolt,
    body: "You shed your skin and grew stronger. Keep this card as a Leaf Card!" },
  { title: 'Web Trap', kind: 'instantLoseLeaf',
    img: actionWebTrap,
    body: "You flew into a spider's web, discard 1 leaf." },
  { title: 'Tailwind', kind: 'instantAdvance', amount: 2,
    img: actionTailwind,
    body: "Strong winds helped push your migration, move ahead two spaces." },
];

// The shared draw deck — trivia and action cards shuffled together.
type DeckCard =
  | { cat: 'trivia'; data: typeof QUESTIONS[number] }
  | { cat: 'action'; data: ActionCard };
const DECK: DeckCard[] = [
  ...QUESTIONS.map(q => ({ cat: 'trivia' as const, data: q })),
  ...ACTIONS.map(a => ({ cat: 'action' as const, data: a })),
];

const FONT = "'Balsamiq Sans', sans-serif";

// ── Leaf decoration (from Question1 Figma import) ─────────────────────────
// The Figma source insets this 10px/11px on each side of a 168-wide card
// (matching its own 8px corner radius) — proportionally fine there, but once
// scaled up to our 300px-wide overlay card that becomes an ~18px gap on a
// 14px-radius corner, reading as a big chunk of unused white margin rather
// than a deliberate clearance. Tightened to just clear the corner (plus a
// few px for the grain filter's own edge jitter).
function CardLeaf() {
  return (
    <div style={{ position: 'absolute', height: 96, left: 3, top: 10, width: 162 }}>
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
              // The filter region matched the artwork's own bounding box exactly
              // (0,0,149,96), but feDisplacementMap's jitter (scale=3) pushes the
              // wobbly edge outside that box — clipping it hard at the card's
              // left/right edges. Padding the region gives the displacement room.
              <filter key={id} id={id} colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"
                height="116" width="169" x="-10" y="-10">
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

  const W = 300, H = 610;
  const BACK_SCALE = W / 168;

  const handleAnswer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(10,50,15,0.62)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18,
        backdropFilter: 'blur(2px)', overflowY: 'auto', padding: '24px 0',
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
                  {question.type === 'tf' ? 'True or False?' : 'Multiple Choice'}
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

                    if (selected !== null) {
                      if (isSelected && isCorrect)  { bg = '#c3e5ec'; border = '2px solid #0096A9'; }
                      if (isSelected && !isCorrect) { bg = '#fde8e8'; border = '2px solid transparent'; }
                      if (!isSelected && isCorrect) { bg = '#c3e5ec'; border = '2px solid #0096A9'; }
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
                          lineHeight: 1.4, transition: 'background 0.15s ease, border-color 0.15s ease',
                        }}
                      >
                        {question.type === 'tf' ? opt : <>{OPT_LABELS[i]}) {opt}</>}
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
                      fontFamily: BOLD, fontWeight: 700, fontSize: 13, color: '#444240', lineHeight: 1.4,
                    }}>
                      {question.type === 'tf'
                        ? <>{question.opts[question.ans].toUpperCase()}{question.explain && <> - <span style={{ fontFamily: REG, fontWeight: 400 }}>{question.explain}</span></>}</>
                        : <>{OPT_LABELS[question.ans].toUpperCase()}) {question.opts[question.ans]}</>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Always rendered (just invisible until answered) so the card doesn't
          shift up when this slot's content appears — a conditional render
          here changes the centered column's total height. */}
      <button
        onClick={() => selected !== null && onAnswer(selected)}
        disabled={selected === null}
        style={{
          padding: '12px 40px', borderRadius: 12, border: 'none',
          background: '#0096A9', color: 'white',
          fontFamily: BOLD, fontWeight: 700, fontSize: 16,
          cursor: selected !== null ? 'pointer' : 'default',
          opacity: selected !== null ? 1 : 0,
          pointerEvents: selected !== null ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      >
        Next →
      </button>
    </div>
  );
}

// ── Action card overlay — same flip-card chrome as trivia, simpler body ───
function ActionCardOverlay({
  card,
  onContinue,
}: {
  card: ActionCard;
  onContinue: () => void;
}) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFlipped(true), 420);
    return () => clearTimeout(t);
  }, []);

  const W = 300, H = Math.round(305 * W / 168);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(10,50,15,0.62)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div style={{ perspective: 1100 }}>
        <div style={{ position: 'relative', width: W + 14, height: H + 14 }}>
          <div style={{ position: 'absolute', top: 12, left: 12, width: W, height: H, borderRadius: 14, background: '#2e4018' }} />
          <div style={{ position: 'absolute', top: 6,  left: 6,  width: W, height: H, borderRadius: 14, background: '#4a6424' }} />

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
              <div style={{ width: 168, height: 305, transform: `scale(${W / 168})`, transformOrigin: 'top left' }}>
                <Back />
              </div>
            </div>

            {/* ── Back: action card — official Figma artwork ──────── */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 14, overflow: 'hidden',
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' as 'hidden',
              transform: 'rotateY(180deg)',
            }}>
              <img src={card.img} alt={card.title} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Always rendered (just invisible until flipped) so the card doesn't
          shift up when this slot's content appears. */}
      <button
        onClick={() => flipped && onContinue()}
        disabled={!flipped}
        style={{
          padding: '12px 40px', borderRadius: 12, border: 'none',
          background: '#0096A9', color: 'white',
          fontFamily: BOLD, fontWeight: 700, fontSize: 16,
          cursor: flipped ? 'pointer' : 'default',
          opacity: flipped ? 1 : 0,
          pointerEvents: flipped ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      >
        Continue
      </button>
    </div>
  );
}

// ── Info icon — opens the digital game manual ──────────────────────────────
function InfoIconButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="How to play"
      style={{
        position: 'fixed', top: 16, right: 16, zIndex: 40,
        width: 38, height: 38, borderRadius: '50%',
        border: 'none', background: '#1a5e3a',
        color: 'white', fontFamily: BOLD, fontWeight: 700, fontSize: 17,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      i
    </button>
  );
}

// ── Digital game manual — "Online Game Manual" from Figma ──────────────────
function GameManualModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 70,
        background: 'rgba(10,50,15,0.62)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, backdropFilter: 'blur(2px)',
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 71,
          width: 34, height: 34, borderRadius: '50%',
          border: '2px solid #d1d5db', background: 'white', color: '#6b7280',
          fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
        }}
      >
        ✕
      </button>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 16,
          maxWidth: 900, width: '100%', maxHeight: '92vh',
          overflow: 'auto', lineHeight: 0,
        }}
      >
        <img
          src={manualFull}
          alt="How to play — Don't Leaf it to Chance game manual"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
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
  const [actionCard, setActionCard]   = useState<ActionCard | null>(null);
  const [actionCardOpen, setActionCardOpen] = useState(false);
  const [tokens, setTokens] = useState<Record<string, { name: string; img: string; effect: 'skip' | 'loseLeaf' }>>({});
  const [pendingTrap, setPendingTrap] = useState<ActionCard | null>(null);
  const [hoverTile, setHoverTile] = useState<string | null>(null);
  const [logs, setLogs]           = useState<string[]>([]);
  const [winner, setWinner]       = useState<Player | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const ivRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const usedCardIdx = useRef(new Set<number>());

  // Leaf-gain flourish state — see FlyingLeaf above.
  const [leafFlights, setLeafFlights] = useState<Array<{ key: number; from: { x: number; y: number }; to: { x: number; y: number }; playerId: number }>>([]);
  const leafFlightId = useRef(0);
  const [justGained, setJustGained] = useState<Record<number, boolean>>({});
  const playerCardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const addLog = (msg: string) => setLogs(p => [msg, ...p].slice(0, 5));

  // Send a leaf flying from the middle of the screen into playerId's card.
  const flyLeafToPlayer = (playerId: number) => {
    const targetEl = playerCardRefs.current[playerId];
    if (!targetEl) return; // card not mounted (e.g. mid-transition) — skip the flourish
    const toRect = targetEl.getBoundingClientRect();
    const to = { x: toRect.left + toRect.width / 2, y: toRect.top + toRect.height / 2 };
    const from = { x: window.innerWidth / 2, y: window.innerHeight * 0.35 };
    setLeafFlights(prev => [...prev, { key: ++leafFlightId.current, from, to, playerId }]);
  };

  // Flight has landed — clear it and pop the card's newest leaf briefly.
  const landLeafFlight = (flightKey: number, playerId: number) => {
    setLeafFlights(prev => prev.filter(f => f.key !== flightKey));
    setJustGained(prev => ({ ...prev, [playerId]: true }));
    setTimeout(() => {
      setJustGained(prev => { const { [playerId]: _drop, ...rest } = prev; return rest; });
    }, 450);
  };

  // A gentle hop on the board token whenever it lands on a space — see
  // .token-hop in index.css. HOP_MS must match the animation's own duration
  // so a walked sequence (below) lands each hop just as the next one starts.
  // Passing dx/dy carries the token across to the next tile as part of the
  // hop's arc (via CSS vars --hop-dx/--hop-dy) instead of snapping there —
  // without this a multi-space walk read as teleport-then-bounce.
  const HOP_MS = 320;
  const [hopping, setHopping] = useState<Record<number, boolean>>({});
  const [hopDelta, setHopDelta] = useState<Record<number, { dx: number; dy: number; easing: string }>>({});
  // `easing` shapes the travel layer only (see .token-hop-move in index.css):
  // 'ease-in-out' for a lone hop, 'ease-in' leaving the start of a walk,
  // 'linear' through its middle hops, 'ease-out' landing on the last one —
  // so consecutive hops hand off at matching speed instead of each one
  // decelerating to a dead stop and re-accelerating into the next.
  const triggerHop = (playerId: number, dx = 0, dy = 0, easing = 'ease-in-out') => {
    setHopDelta(prev => ({ ...prev, [playerId]: { dx, dy, easing } }));
    setHopping(prev => ({ ...prev, [playerId]: false }));
    requestAnimationFrame(() => {
      setHopping(prev => ({ ...prev, [playerId]: true }));
      setTimeout(() => {
        setHopping(prev => { const { [playerId]: _drop, ...rest } = prev; return rest; });
      }, HOP_MS);
    });
  };

  // Walking a dice roll or Tailwind card: the token hops tile-by-tile along
  // its ring rather than teleporting straight to the destination. `moving`
  // gates the Roll button/next-turn flow until the walk (and its landing
  // logic) finishes; `walkedPos` overrides that one player's rendered
  // position for the duration — the real ringIdx/seg only commits on arrival.
  // Each step renders at the tile being hopped FROM; the CSS arc (driven by
  // triggerHop's dx/dy) carries it visually to the next tile, and the base
  // position only jumps there once the arc has actually arrived.
  const [moving, setMoving] = useState(false);
  const [walkedPos, setWalkedPos] = useState<{ playerId: number; ring: number; seg: number } | null>(null);

  const posOf = (ring: number, seg: number) => ring < 0 ? { x: CX, y: CY } : tileXY(ring, seg);

  const walkToken = (
    playerId: number, ring: number, fromRing: number, fromSeg: number,
    path: number[], onArrive: () => void,
  ) => {
    setMoving(true);
    let curRing = fromRing, curSeg = fromSeg;
    let i = 0;
    const step = () => {
      const nextSeg = path[i];
      const from = posOf(curRing, curSeg);
      const to = posOf(ring, nextSeg);
      const isFirst = i === 0, isLast = i === path.length - 1;
      const easing = isFirst && isLast ? 'ease-in-out' : isFirst ? 'ease-in' : isLast ? 'ease-out' : 'linear';
      setWalkedPos({ playerId, ring: curRing, seg: curSeg });
      triggerHop(playerId, to.x - from.x, to.y - from.y, easing);
      setTimeout(() => {
        curRing = ring; curSeg = nextSeg;
        i++;
        if (i < path.length) {
          step();
        } else {
          setWalkedPos(null);
          setMoving(false);
          onArrive();
        }
      }, HOP_MS);
    };
    step();
  };

  const startGame = (configs: Array<{ name: string; charIdx: number }>) => {
    const built = configs.map((cfg, i) => ({
      id: i, img: CHARS[cfg.charIdx].img, butterflyImg: CHARS[cfg.charIdx].butterfly, name: cfg.name.trim() || `Player ${i + 1}`,
      color: CHARS[cfg.charIdx].color, ringIdx: -1, seg: 0, leaves: 0,
    }));
    setPlayers(built);
    setCurIdx(0); setDieVal(1); setTurnState('idle'); setCardOverlayOpen(false);
    setActionCard(null); setActionCardOpen(false); setTokens({}); setPendingTrap(null);
    setMoving(false); setWalkedPos(null);
    usedCardIdx.current.clear();
    setLogs([`${built[0].name} goes first!`]);
    setPhase('play');
  };

  const doRoll = () => {
    if (rolling || moving || turnState !== 'idle') return;
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

  // Shared "what happens when you land here" resolver — used by dice rolls
  // and by extra movement (e.g. the Tailwind action card).
  const resolveLanding = (ri: number, seg: number) => {
    const p = players[curIdx];
    const key = `${ri}-${seg}`;
    const tok = tokens[key];

    if (tok) {
      if (p.shield) {
        setPlayers(prev => prev.map((pl, i) => i === curIdx ? { ...pl, shield: false } : pl));
        addLog(`${p.name} was protected by Camouflage from the ${tok.name}!`);
      } else if (tok.effect === 'skip') {
        setPlayers(prev => prev.map((pl, i) => i === curIdx ? { ...pl, skipNext: true } : pl));
        addLog(`${p.name} got stuck on the ${tok.name} and will skip their next turn!`);
      } else {
        const nl = Math.max(0, p.leaves - 1);
        setPlayers(prev => prev.map((pl, i) => i === curIdx ? { ...pl, leaves: nl } : pl));
        addLog(`${p.name} landed on the ${tok.name} and lost 1 🍃`);
      }
      setTokens(prev => { const next = { ...prev }; delete next[key]; return next; });
      setTurnState('moved');
      return;
    }

    // Gate tiles are the six "3 🍃" bridges on the Figma board. A tile can be a
    // gate *and* a question space, so an unaffordable gate falls through to its
    // normal behaviour — giving the player a chance to earn the leaves they need.
    const gate = gateAt(ri, seg);
    if (gate) {
      if (p.leaves >= 3) { setTurnState('gate'); return; }
      addLog(`${p.name} reached a gate — needs ${3 - p.leaves} more 🍃`);
    }

    const kind = tileKind(ri, seg);
    if (kind === 'trivia') {
      let ci = Math.floor(Math.random() * DECK.length);
      for (let t = 0; t < DECK.length; t++) {
        if (!usedCardIdx.current.has(ci)) break;
        ci = (ci + 1) % DECK.length;
        if (t === DECK.length - 1) usedCardIdx.current.clear();
      }
      usedCardIdx.current.add(ci);
      const card = DECK[ci];
      if (card.cat === 'trivia') { setQuestion(card.data); setTurnState('card'); }
      else { setActionCard(card.data); setTurnState('action'); }
    } else {
      setTurnState('moved');
    }
  };

  const processMove = (roll: number) => {
    const p = players[curIdx];
    const ri = p.ringIdx < 0 ? 0 : p.ringIdx;
    const n = RING_SEGS[ri];
    // Entering from the center starts the count at tile 0; already on the
    // ring, it continues from the current tile — either way, one hop per space.
    const startSeg = p.ringIdx < 0 ? 0 : p.seg;
    const path = Array.from({ length: roll }, (_, i) => (startSeg + i + 1) % n);
    const seg = path[path.length - 1];

    if (p.ringIdx === -1) addLog(`${p.name} enters Ring 1, tile ${seg + 1}!`);
    else addLog(`${p.name} rolled ${roll} → tile ${seg + 1}`);

    walkToken(p.id, ri, p.ringIdx, p.seg, path, () => {
      setPlayers(prev => prev.map((pl, i) => i === curIdx ? { ...pl, ringIdx: ri, seg } : pl));
      resolveLanding(ri, seg);
    });
  };

  // Extra movement granted by an action card (e.g. Tailwind's +2 spaces).
  const advanceExtra = (n: number) => {
    const p = players[curIdx];
    const ri = p.ringIdx < 0 ? 0 : p.ringIdx;
    const segCount = RING_SEGS[ri];
    const path = Array.from({ length: n }, (_, i) => (p.seg + i + 1) % segCount);
    const seg = path[path.length - 1];
    addLog(`${p.name} rides the tailwind ${n} spaces ahead → tile ${seg + 1}`);
    walkToken(p.id, ri, ri, p.seg, path, () => {
      setPlayers(prev => prev.map((pl, i) => i === curIdx ? { ...pl, ringIdx: ri, seg } : pl));
      resolveLanding(ri, seg);
    });
  };

  const finishAfterCard = (p: Player, leaves: number) => {
    if (gateAt(p.ringIdx >= 0 ? p.ringIdx : 0, p.seg) && leaves >= 3) setTurnState('gate');
    else setTurnState('moved');
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
      flyLeafToPlayer(p.id);
    } else {
      addLog(`${p.name} wrong — no leaf this time.`);
    }
    setQuestion(null);
    finishAfterCard(p, newLeaves);
  };

  // Resolve the currently-drawn action card. Trap and steal cards need a
  // follow-up interaction (placing a token / picking a target) handled by
  // placeToken() and stealFrom() below.
  const doActionCard = () => {
    if (!actionCard) return;
    const p = players[curIdx];
    switch (actionCard.kind) {
      case 'keepLeaf': {
        const newLeaves = p.leaves + 1;
        setPlayers(prev => prev.map((pl, i) => i === curIdx ? { ...pl, leaves: newLeaves } : pl));
        addLog(`${p.name} keeps "${actionCard.title}" as a leaf card! (+1 🍃)`);
        flyLeafToPlayer(p.id);
        setActionCard(null);
        finishAfterCard(p, newLeaves);
        break;
      }
      case 'shield': {
        setPlayers(prev => prev.map((pl, i) => i === curIdx ? { ...pl, shield: true } : pl));
        addLog(`${p.name} is camouflaged and protected from the next predator!`);
        setActionCard(null);
        finishAfterCard(p, p.leaves);
        break;
      }
      case 'instantLoseLeaf': {
        if (p.shield) {
          setPlayers(prev => prev.map((pl, i) => i === curIdx ? { ...pl, shield: false } : pl));
          addLog(`${p.name} was protected by Camouflage from "${actionCard.title}"!`);
          setActionCard(null);
          finishAfterCard(p, p.leaves);
        } else {
          const newLeaves = Math.max(0, p.leaves - 1);
          setPlayers(prev => prev.map((pl, i) => i === curIdx ? { ...pl, leaves: newLeaves } : pl));
          addLog(`${p.name}: ${actionCard.title} — lost 1 🍃`);
          setActionCard(null);
          finishAfterCard(p, newLeaves);
        }
        break;
      }
      case 'instantAdvance': {
        const amount = actionCard.amount ?? 1;
        setActionCard(null);
        advanceExtra(amount);
        break;
      }
      case 'trap': {
        setPendingTrap(actionCard);
        setActionCard(null);
        setTurnState('placingToken');
        break;
      }
      case 'instantSteal': {
        setActionCard(null);
        if (players.length > 1) setTurnState('chooseTarget');
        else finishAfterCard(p, p.leaves);
        break;
      }
    }
  };

  const placeToken = (ri: number, seg: number) => {
    if (!pendingTrap) return;
    const key = `${ri}-${seg}`;
    if (tokens[key]) return; // already occupied — pick another tile
    setTokens(prev => ({
      ...prev,
      [key]: { name: pendingTrap.tokenName!, img: pendingTrap.tokenImg!, effect: pendingTrap.trapEffect! },
    }));
    addLog(`${players[curIdx].name} placed the ${pendingTrap.tokenName} on Ring ${ri + 1}, tile ${seg + 1}.`);
    setPendingTrap(null);
    setHoverTile(null);
    setTurnState('moved');
  };

  const stealFrom = (targetIdx: number) => {
    const p = players[curIdx];
    const target = players[targetIdx];
    if (target.shield) {
      setPlayers(prev => prev.map((pl, i) => i === targetIdx ? { ...pl, shield: false } : pl));
      addLog(`${target.name} was protected by Camouflage!`);
      finishAfterCard(p, p.leaves);
    } else if (target.leaves <= 0) {
      addLog(`${target.name} had no leaves to take.`);
      finishAfterCard(p, p.leaves);
    } else {
      setPlayers(prev => prev.map((pl, i) => {
        if (i === targetIdx) return { ...pl, leaves: pl.leaves - 1 };
        if (i === curIdx) return { ...pl, leaves: pl.leaves + 1 };
        return pl;
      }));
      addLog(`${p.name} took a leaf from ${target.name}!`);
      flyLeafToPlayer(p.id);
      finishAfterCard(p, p.leaves + 1);
    }
  };

  // Cross the bridge the player is standing on. Each gate lands somewhere
  // specific — the tile the Figma arrow points at, or one of the three finishes.
  const doAdvance = () => {
    const p = players[curIdx];
    const gate = gateAt(p.ringIdx, p.seg);
    if (!gate) { setTurnState('moved'); return; }

    if (gate.to === 'finish') {
      setPlayers(prev => prev.map((pl, i) =>
        i === curIdx ? { ...pl, ringIdx: 3, leaves: 0 } : pl
      ));
      setWinner(p);
      addLog(`🏆 ${p.name} completed the Leaf Trail!`);
      setPhase('win');
    } else {
      const { ring, seg } = gate.to;
      setPlayers(prev => prev.map((pl, i) =>
        i === curIdx ? { ...pl, ringIdx: ring, seg, leaves: 0 } : pl
      ));
      addLog(`${p.name} crossed the bridge to Ring ${ring + 1}! 🌿`);
      triggerHop(p.id);
      setTurnState('moved');
    }
  };

  const doNextTurn = () => {
    setTurnState('idle'); setCardOverlayOpen(false); setActionCardOpen(false);
    const n = players.length;
    let next = (curIdx + 1) % n;
    const stuck: number[] = [];
    for (let i = 1; i <= n * 2; i++) {
      const idx = (curIdx + i) % n;
      if (players[idx].ringIdx >= 3) continue;
      if (players[idx].skipNext) { stuck.push(idx); continue; }
      next = idx;
      break;
    }
    if (stuck.length) {
      setPlayers(prev => prev.map((pl, i) => stuck.includes(i) ? { ...pl, skipNext: false } : pl));
      stuck.forEach(i => addLog(`${players[i].name} is stuck and skips their turn!`));
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
  // Which of the six bridges the current player is standing on, if any.
  const curGate = cur ? gateAt(cur.ringIdx, cur.seg) : undefined;
  const gateToFinish = curGate?.to === 'finish';

  // While a token is walking to its destination, render it at its current
  // hop stop (walkedPos) instead of its committed ringIdx/seg.
  const groups = new Map<string, Player[]>();
  players.forEach(p => {
    const ring = walkedPos?.playerId === p.id ? walkedPos.ring : p.ringIdx;
    const seg = walkedPos?.playerId === p.id ? walkedPos.seg : p.seg;
    const key = ring < 0 ? 'center' : ring >= 3 ? 'done' : `${ring}-${seg}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  });

  return (
    <div style={{
      minHeight: '100vh', background: '#d8f0d8',
      fontFamily: FONT,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '12px 8px', gap: 12,
    }}>
      {!manualOpen && <InfoIconButton onClick={() => setManualOpen(true)} />}
      {manualOpen && <GameManualModal onClose={() => setManualOpen(false)} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 1180 }}>

        {/* ── Board + sidebar — board bigger and to the left, dice/deck to the right ── */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── Board SVG ─────────────────────────────────────────── */}
        <div style={{ position: 'relative', flex: '1 1 560px', minWidth: 420, maxWidth: 900 }}>
          {turnState === 'placingToken' && pendingTrap && (
            <div style={{
              position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
              zIndex: 5, background: '#e05a5a', color: 'white', fontFamily: FONT, fontWeight: 700,
              fontSize: 15, padding: '10px 22px', borderRadius: 14, whiteSpace: 'nowrap',
            }}>
              Click a tile on the board to place the {pendingTrap.tokenName}
            </div>
          )}
          {turnState === 'chooseTarget' && (
            <div style={{
              position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
              zIndex: 5, background: '#0096A9', color: 'white', fontFamily: FONT, fontWeight: 700,
              fontSize: 15, padding: '10px 22px', borderRadius: 14, whiteSpace: 'nowrap',
            }}>
              choose a player to take a leaf from
            </div>
          )}
        <svg
          viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
          style={{ display: 'block', width: '100%', height: 'auto', background: PAGE_BG, borderRadius: 20 }}
        >
          {/* ── Paper-grain filters ──────────────────────────────
              The Figma-exported ring bands, splats and scenery all carry a
              speckle + wobbly-edge "grain" filter baked into their SVGs. Our
              own flat shapes (blank tiles, grass blades) don't come from an
              export, so these two filters give them the same hand-drawn,
              textured feel instead of looking flat and vector-perfect. */}
          <defs>
            <filter id="tileGrain" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
              {/* Pulled from the Figma node the user hand-tuned (254:2762): its exported
                  SVG has no filter at all — the "stroke" is really the tile's own
                  silhouette redrawn as a jittered path in the same fill color, giving a
                  hand-drawn, uneven edge instead of a perfect circle. feDisplacementMap
                  does the same thing live here; the speckle stage (a wide contiguous
                  threshold band, matched to the Figma ring-band grain so it resolves
                  into a handful of visible flecks rather than dust) rides on top,
                  clipped to the now-wobbly silhouette so it never spills past the edge. */}
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="15" result="edgeWobble" />
              <feDisplacementMap in="SourceGraphic" in2="edgeWobble" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="wobbled" />
              <feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="3" seed="8" result="noise" />
              <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
              <feComponentTransfer in="alphaNoise" result="speckle">
                <feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0" />
              </feComponentTransfer>
              <feComposite in="speckle" in2="wobbled" operator="in" result="speckleClipped" />
              <feFlood floodColor="#c9e2a8" result="speckColor" />
              <feComposite in="speckColor" in2="speckleClipped" operator="in" result="speck" />
              <feMerge>
                <feMergeNode in="wobbled" />
                <feMergeNode in="speck" />
              </feMerge>
            </filter>
            <filter id="bladeGrain" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="wobble" />
              <feDisplacementMap in="SourceGraphic" in2="wobble" scale="1.4" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>

          {/* ── Figma artwork ─────────────────────────────────────
              Ring bands, the three "finish" splats and the scenery, each placed
              at its Figma position. The bridges and their "3 🍃" badges are held
              back and drawn after the tiles, so a gate is never hidden. */}
          {ART.filter(a => !a.top).map((a, i) => (
            <g key={`art-${i}`} transform={artTransform(a)}>
              <image href={a.src} width={a.w} height={a.h} />
            </g>
          ))}

          {/* Grass tufts and the caterpillar by the puddle */}
          {BLADES.map((b, i) => (
            <rect key={`blade-${i}`}
              x={b.cx - BLADE_W / 2} y={b.cy - BLADE_H / 2}
              width={BLADE_W} height={BLADE_H} rx={BLADE_RX}
              fill={BLADE_COLOR} stroke={BLADE_COLOR} strokeWidth={BLADE_RX}
              filter="url(#bladeGrain)"
              transform={b.rot ? `rotate(${b.rot} ${b.cx} ${b.cy})` : undefined}
            />
          ))}

          {/* "Start" in the middle, "finish" on each red splat */}
          <text x={START_LABEL.x} y={START_LABEL.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize={14} fill={TILE_INK}
            fontFamily={FONT} style={{ userSelect: 'none', fontWeight: 700 }}>
            Start
          </text>
          {FINISH_LABELS.map((f, i) => (
            <text key={`finish-${i}`} x={f.x} y={f.y}
              textAnchor="middle" dominantBaseline="central"
              fontSize={14} fill="white"
              stroke="#E65558" strokeWidth={2.5} paintOrder="stroke"
              fontFamily={FONT} style={{ userSelect: 'none', fontWeight: 700 }}>
              finish
            </text>
          ))}

          {/* ── Tiles ─────────────────────────────────────────── */}
          {TILES.map((ring, ri) =>
            ring.map((t, seg) => {
              const isTrivia = t.kind === 'trivia';
              const tileKey = `${ri}-${seg}`;
              const tok = tokens[tileKey];
              const isPlaceable = turnState === 'placingToken' && !tok;

              return (
                <g key={tileKey}
                  onClick={isPlaceable ? () => placeToken(ri, seg) : undefined}
                  onMouseEnter={isPlaceable ? () => setHoverTile(tileKey) : undefined}
                  onMouseLeave={isPlaceable ? () => setHoverTile(prev => prev === tileKey ? null : prev) : undefined}
                  style={{ cursor: isPlaceable ? 'pointer' : 'default' }}
                >
                  {/* Dashed spinning ring only on the tile currently hovered — showing it on
                      every placeable tile at once was too busy. */}
                  {isPlaceable && hoverTile === tileKey && (
                    <circle cx={t.x} cy={t.y} r={TILE_R + 6} fill="none"
                      stroke="white" strokeWidth={2.5} strokeDasharray="4 4">
                      <animateTransform attributeName="transform" type="rotate"
                        from={`0 ${t.x} ${t.y}`} to={`360 ${t.x} ${t.y}`} dur="14s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Tile face carries Figma's own rotation, so each "?" faces along the track */}
                  <g transform={`rotate(${t.rot} ${t.x} ${t.y})`}>
                    <circle
                      cx={t.x} cy={t.y} r={TILE_R - 1}
                      fill={isTrivia ? TILE_TRIVIA_FILL : TILE_PLAIN_FILL}
                      stroke={isTrivia ? '#ffffff' : TILE_PLAIN_FILL}
                      strokeWidth={2}
                      filter={isTrivia ? undefined : 'url(#tileGrain)'}
                    />
                    {isTrivia && (
                      <>
                        <image href={TILE_ELLIPSE}
                          x={t.x - TILE_ELLIPSE_SZ / 2} y={t.y - TILE_ELLIPSE_SZ / 2}
                          width={TILE_ELLIPSE_SZ} height={TILE_ELLIPSE_SZ} />
                        <text x={t.x} y={t.y}
                          textAnchor="middle" dominantBaseline="central"
                          fontSize={TILE_QMARK_SZ} fill={TILE_INK}
                          fontFamily={FONT} style={{ userSelect: 'none', fontWeight: 700 }}>
                          ?
                        </text>
                      </>
                    )}
                  </g>
                  {/* Faint preview of the actual predator/token on the hovered tile */}
                  {isPlaceable && hoverTile === tileKey && pendingTrap && (
                    <image
                      href={pendingTrap.tokenImg}
                      x={t.x - TILE_R} y={t.y - TILE_R}
                      width={TILE_R * 2} height={TILE_R * 2}
                      opacity={0.45}
                      style={{ pointerEvents: 'none' }}
                    />
                  )}
                  {/* Trap token sitting on this space */}
                  {tok && (
                    <image
                      href={tok.img}
                      x={t.x - TILE_R} y={t.y - TILE_R}
                      width={TILE_R * 2} height={TILE_R * 2}
                    />
                  )}
                </g>
              );
            })
          )}

          {/* ── Gate layer — bridges and their "3 🍃" badges, above the tiles ── */}
          {ART.filter(a => a.top).map((a, i) => (
            <g key={`gate-${i}`} transform={artTransform(a)}>
              <image href={a.src} width={a.w} height={a.h} />
            </g>
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
                const off = count === 2 ? 18 : 20;
                dx = off * Math.cos(angle); dy = off * Math.sin(angle);
              }
              const tx = base.x + dx, ty = base.y + dy;
              const tokenSz = TILE_SZ + 5;
              const half = tokenSz / 2;
              return (
                <g key={p.id}>
                  {/* Caterpillar sticker — hops gently when it moves to a new space, split
                      into two layers so a multi-space walk glides instead of stuttering:
                      this outer <g> carries the actual travel (--hop-dx/--hop-dy, eased
                      per-hop below) while the inner image plays the same bounce arc
                      every time regardless of which leg of the walk it's on. */}
                  <g
                    className={hopping[p.id] ? 'token-hop-move' : undefined}
                    style={hopping[p.id] ? ({
                      '--hop-dx': `${hopDelta[p.id]?.dx ?? 0}px`,
                      '--hop-dy': `${hopDelta[p.id]?.dy ?? 0}px`,
                      animationTimingFunction: hopDelta[p.id]?.easing,
                    } as CSSProperties) : undefined}
                  >
                    <image
                      href={p.img}
                      x={tx - half} y={ty - half}
                      width={tokenSz} height={tokenSz}
                      className={hopping[p.id] ? 'token-hop-bounce' : undefined}
                    />
                  </g>
                </g>
              );
            });
          })}
        </svg>
        </div>

        {/* ── Sidebar — die/turn controls + card deck, to the right of the board ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 256, flexShrink: 0 }}>

          {/* Die + roll/turn actions */}
          <div style={{ background: 'white', borderRadius: 20, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              <img src={cur.img} alt={cur.name} style={{ width: 44, height: 44, objectFit: 'contain' }} />
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: '#374151' }}>{cur.name}'s turn</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <Die val={dieVal} rolling={rolling} />
            </div>
            {turnState === 'idle' && (
              <button onClick={doRoll} disabled={rolling || moving} style={{
                width: '100%', padding: '12px 0', borderRadius: 14, border: 'none',
                background: (rolling || moving) ? '#e5e7eb' : '#5F7A34',
                color: (rolling || moving) ? '#9ca3af' : 'white',
                fontSize: 17, fontWeight: 700, cursor: (rolling || moving) ? 'not-allowed' : 'pointer',
                fontFamily: FONT,
              }}>
                {rolling ? 'Rolling…' : moving ? 'Hopping…' : 'Roll Dice!'}
              </button>
            )}
            {turnState === 'moved' && (
              <button onClick={doNextTurn} style={{
                width: '100%', padding: '12px 0', borderRadius: 14, border: 'none',
                background: '#5F7A34', color: 'white',
                fontSize: 17, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
              }}>
                Next Turn →
              </button>
            )}
            {(turnState === 'card' || turnState === 'action') && (
              <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 13, color: '#9ca3af', fontFamily: FONT }}>
                Landed on a card tile!
              </div>
            )}
            {turnState === 'placingToken' && (
              <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 13, color: '#e05a5a', fontWeight: 700, fontFamily: FONT }}>
                Click a tile on the board to place the {pendingTrap?.tokenName}
              </div>
            )}
            {turnState === 'chooseTarget' && (
              <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 13, color: '#0096A9', fontWeight: 700, fontFamily: FONT }}>
                choose a player to take a leaf from
              </div>
            )}
            {turnState === 'gate' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 0', fontSize: 13, color: '#4CB85E', fontWeight: 700, fontFamily: FONT }}>
                <LeafIcon size={14} /> Gate reached!
              </div>
            )}
          </div>

          {/* Card deck — always sits on the table; opens the overlay once a card is drawn */}
          {(() => {
            const hasCard = (turnState === 'card' && !!question) || (turnState === 'action' && !!actionCard);
            return (
              <div style={{
                background: hasCard ? '#F1FDE8' : '#d8f0d8', borderRadius: 20, padding: 16, border: 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                transition: 'background 0.3s ease',
              }}>
                <div style={{
                  fontSize: hasCard ? 13 : 10, color: hasCard ? '#0096A9' : '#9ca3af', letterSpacing: 2,
                  fontFamily: FONT, fontWeight: 700,
                  transition: 'font-size 0.3s ease, color 0.3s ease',
                }}>
                  {hasCard ? 'Draw a Card' : 'Card Deck'}
                </div>
                <CardDeckPreview onClick={() => {
                  if (turnState === 'card') setCardOverlayOpen(true);
                  else if (turnState === 'action') setActionCardOpen(true);
                }} />
              </div>
            );
          })()}

        </div>
        </div>

        {/* ── Players ─────────────────────────────────────────── */}
        {/* During a steal (chooseTarget), the player cards themselves become the
            picker — no separate selection list. */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {players.map((p, i) => {
            const selectable = turnState === 'chooseTarget' && i !== curIdx;
            return (
            <div
              key={p.id}
              ref={el => { playerCardRefs.current[p.id] = el; }}
              onClick={selectable ? () => stealFrom(i) : undefined}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
                background: 'white', borderRadius: 16, padding: '12px 16px',
                border: selectable ? '3px solid #0096A9' : '3px solid transparent',
                cursor: selectable ? 'pointer' : 'default',
                width: 160, opacity: p.ringIdx >= 3 ? 0.4 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: p.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <img src={p.img} alt={p.name} style={{ width: 44, height: 44, objectFit: 'contain' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: i === curIdx ? 700 : 500, color: i === curIdx ? '#374151' : '#6b7280', fontFamily: FONT }}>
                    {p.name}
                  </span>
                  {p.shield && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: '#0096A9',
                      background: '#e8f7f9', borderRadius: 6, padding: '1px 6px', fontFamily: FONT, alignSelf: 'flex-start',
                    }}>PROTECTED</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {Array.from({ length: Math.max(3, p.leaves) }, (_, l) => (
                  <LeafIcon
                    key={l} size={12}
                    className={justGained[p.id] && l === p.leaves - 1 ? 'leaf-pop' : undefined}
                    style={{ filter: l < p.leaves ? 'none' : 'grayscale(1) opacity(0.22)' }}
                  />
                ))}
              </div>
            </div>
          );})}
        </div>
      </div>

      {/* ── Leaf-gain flourish ───────────────────────────────────── */}
      {leafFlights.map(f => (
        <FlyingLeaf
          key={f.key} from={f.from} to={f.to}
          onDone={() => landLeafFlight(f.key, f.playerId)}
        />
      ))}

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

      {/* ── Action card overlay — centred full-screen flip ───────── */}
      {actionCardOpen && actionCard && (
        <ActionCardOverlay
          card={actionCard}
          onContinue={() => {
            setActionCardOpen(false);
            doActionCard();
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
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
              <LeafIcon size={44} /><LeafIcon size={44} /><LeafIcon size={44} />
            </div>
            <div style={{ fontSize: 26, color: '#1a5e3a', fontWeight: 700, marginBottom: 6, fontFamily: FONT }}>
              You have 3 leaves!
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
              <img src={cur.img} alt={cur.name} style={{ width: 44, height: 44, objectFit: 'contain' }} />
              <span style={{ fontSize: 14, color: '#6b7280', fontFamily: FONT }}>
                {cur.name} can {gateToFinish ? 'fly out to the finish!' : 'cross the bridge!'}
              </span>
            </div>
            <button onClick={doAdvance} style={{
              padding: '14px 32px', borderRadius: 14, border: 'none',
              background: '#0096A9', color: 'white',
              fontSize: 18, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
            }}>
              {gateToFinish ? 'Finish the Trail!' : 'Cross the Bridge!'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Setup screen ───────────────────────────────────────────────────────────
function SetupScreen({ onSelectCount }: { onSelectCount: (n: number) => void }) {
  const [manualOpen, setManualOpen] = useState(false);
  return (
    <div style={{
      minHeight: '100vh', background: '#d8f0d8',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 36, fontFamily: FONT,
    }}>
      {!manualOpen && <InfoIconButton onClick={() => setManualOpen(true)} />}
      {manualOpen && <GameManualModal onClose={() => setManualOpen(false)} />}
      <div style={{
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}>
        {/* Leaf graphic, sitting above the title */}
        <div style={{
          width: 190, height: 173, marginBottom: -30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ transform: 'rotate(-125.34deg)' }}>
            <div style={{ width: 93, height: 165 }}>
              <img src={leafLogo} alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        </div>

        <h1 style={{
          fontFamily: FONT, fontWeight: 700, fontSize: 44, lineHeight: '48px',
          margin: 0, color: '#ffffff', WebkitTextStroke: '3px #3f4d28',
          textShadow: [
            '-2px -2px 0 #3f4d28', '2px -2px 0 #3f4d28',
            '-2px 2px 0 #3f4d28', '2px 2px 0 #3f4d28',
            '0 3px 0 #3f4d28', '0 -3px 0 #3f4d28',
            '3px 0 0 #3f4d28', '-3px 0 0 #3f4d28',
          ].join(', '),
        }}>
          Don't Leaf it to Chance!
        </h1>
        <p style={{
          fontFamily: FONT, fontWeight: 400, fontSize: 15, color: '#69861b', margin: 0, whiteSpace: 'nowrap',
        }}>
          a butterfly life-cycle &amp; migration game
        </p>
      </div>

      <div>
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
          {[2, 3, 4].map(n => (
            <button key={n} onClick={() => onSelectCount(n)} style={{
              width: 160, height: 170, borderRadius: 26,
              border: '3px solid #d1d5db', background: 'white',
              color: '#374151', cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: FONT, transition: 'all 0.15s',
            }}
              onMouseEnter={e => Object.assign(e.currentTarget.style, {
                borderColor: '#1a5e3a', transform: 'scale(1.06)',
              })}
              onMouseLeave={e => Object.assign(e.currentTarget.style, {
                borderColor: '#d1d5db', transform: 'scale(1)',
              })}>
              <div style={{ display: 'flex', gap: 0, flexWrap: 'nowrap', justifyContent: 'center', width: '100%' }}>
                {CHARS.slice(0, n).map(c => (
                  <img key={c.name} src={c.img} alt={c.name}
                    style={{ width: 38, height: 38, objectFit: 'contain', flexShrink: 0 }} />
                ))}
              </div>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{n} Players</span>
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
  const [setups, setSetups] = useState<Array<{ name: string; charIdx: number | null }>>(() =>
    Array.from({ length: count }, () => ({ name: '', charIdx: null }))
  );

  const takenChars = new Set(setups.map(s => s.charIdx).filter((ci): ci is number => ci !== null));

  const setName = (pi: number, val: string) =>
    setSetups(prev => prev.map((s, i) => i === pi ? { ...s, name: val } : s));

  const setChar = (pi: number, ci: number) =>
    setSetups(prev => prev.map((s, i) => i === pi ? { ...s, charIdx: s.charIdx === ci ? null : ci } : s));

  const allValid = setups.every(s => s.name.trim().length > 0 && s.charIdx !== null);

  return (
    <div style={{
      minHeight: '100vh', background: '#d8f0d8',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 28, fontFamily: FONT, padding: '24px 16px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#374151', fontSize: 36, margin: 0, fontWeight: 700 }}>
          Choose Your Caterpillar
        </h2>
      </div>

      <div style={{
        display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
        maxWidth: 920,
      }}>
        {setups.map((setup, pi) => {
          const picked = setup.charIdx !== null;
          const accent = picked ? CHARS[setup.charIdx!].color : '#9ca3af';
          return (
            <div key={pi} style={{
              background: 'white', borderRadius: 24,
              border: '3px solid #e5e7eb',
              padding: '20px 18px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
              width: 200, flexShrink: 0,
            }}>
              {/* Selected character large preview */}
              <div style={{
                width: 80, height: 80, borderRadius: 20,
                background: picked ? accent + '18' : '#f3f4f6',
                border: picked ? `2.5px solid ${accent}55` : '2.5px dashed #d1d5db',
                transition: 'background 0.15s, border-color 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {picked ? (
                  <img
                    src={CHARS[setup.charIdx!].img}
                    alt={CHARS[setup.charIdx!].name}
                    style={{ width: 66, height: 66, objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#d1d5db', fontFamily: FONT }}>?</span>
                )}
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
                  border: '2px solid #d1d5db',
                  fontFamily: FONT, fontSize: 15, fontWeight: 700,
                  color: '#374151', outline: 'none',
                  background: 'white',
                }}
              />

              {/* Character selector grid */}
              <div>
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
                        title={isTaken ? 'Taken' : isSelected ? 'Click to unselect' : c.name}
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
          onClick={() => onStart(setups.map(s => ({ name: s.name, charIdx: s.charIdx as number })))}
          style={{
            padding: '14px 36px', borderRadius: 14, border: 'none',
            background: allValid ? '#5F7A34' : '#e5e7eb',
            color: allValid ? 'white' : '#9ca3af',
            fontSize: 17, fontWeight: 700,
            cursor: allValid ? 'pointer' : 'not-allowed',
            fontFamily: FONT, transition: 'background 0.15s, color 0.15s',
          }}
        >
          Start Game!
        </button>
      </div>
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
      <img src={winner.butterflyImg} alt={`${winner.name} the butterfly`} style={{ width: 140, height: 140, objectFit: 'contain' }} />
      <div style={{ fontSize: 46, fontWeight: 700, color: '#1a5e3a' }}>{winner.name} Wins!</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <LeafIcon size={30} /><LeafIcon size={30} /><LeafIcon size={30} />
        <span style={{ fontSize: 36 }}>🏆</span>
        <LeafIcon size={30} /><LeafIcon size={30} /><LeafIcon size={30} />
      </div>
      <p style={{ color: '#6b7280', fontSize: 16, margin: 0, fontFamily: FONT }}>
        Blazed through all three rings of the Leaf Trail!
      </p>
      <button onClick={onRestart} style={{
        padding: '14px 36px', borderRadius: 16, border: 'none',
        background: '#0096A9', color: 'white',
        fontSize: 20, fontWeight: 700, cursor: 'pointer',
        fontFamily: FONT, marginTop: 8,
      }}>Play Again</button>
    </div>
  );
}
