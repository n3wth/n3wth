import { lazy, Suspense } from 'react'
import { ToggleCompare } from '../kit/ToggleCompare'
import { FlowDiagram } from '../kit/FlowDiagram'
import type { FlowEdge, FlowNode } from '../kit/FlowDiagram'

const LiveMaterialDemo = lazy(() => import('../kit/LiveMaterialDemo'))

/* Five real bugs from building the night field (PR #56-#67), each with a
   live specimen instead of a screenshot. Prose drafted via Spiral from the
   git history + gbrain's 3d-worldgen-pipeline notes, in Oliver's voice. */

const CRITIQUE_NODES: FlowNode[] = [
  { id: 'actor', label: 'Actor generates', x: 60, y: 110 },
  { id: 'comp', label: 'Composition critic', x: 300, y: 40 },
  { id: '3d', label: '3D-craft critic', x: 300, y: 110 },
  { id: 'slop', label: 'Anti-slop critic', x: 300, y: 180 },
  { id: 'fixer', label: 'Fixer (tsc + screenshot)', x: 560, y: 110 },
  { id: 'ship', label: 'Shipped', x: 800, y: 110, active: true },
]
const CRITIQUE_EDGES: FlowEdge[] = [
  { from: 'actor', to: 'comp' },
  { from: 'actor', to: '3d' },
  { from: 'actor', to: 'slop' },
  { from: 'comp', to: 'fixer' },
  { from: '3d', to: 'fixer' },
  { from: 'slop', to: 'fixer' },
  { from: 'fixer', to: 'ship' },
]

function OrbitSpecimen({ broken }: { broken: boolean }) {
  return (
    <svg viewBox="0 0 300 160" className="h-40 w-full max-w-sm" role="presentation" focusable="false">
      <circle cx="150" cy="80" r="2" fill="var(--ink-faint)" />
      <g
        style={{
          transformBox: 'fill-box',
          transformOrigin: broken ? '210px 80px' : '150px 80px',
          animation: 'kit-spin 6s linear infinite',
        }}
      >
        <rect x="135" y="65" width="30" height="30" fill="none" stroke="var(--ink)" strokeWidth={1.5} />
      </g>
      {broken && (
        <circle cx="210" cy="80" r="2" fill="var(--rail-strong)" stroke="var(--rail-strong)" />
      )}
      <style>{`@keyframes kit-spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  )
}

function GaitSpecimen({ broken }: { broken: boolean }) {
  return (
    <svg viewBox="0 0 300 80" className="h-20 w-full max-w-sm" role="presentation" focusable="false">
      <line x1="10" y1="60" x2="290" y2="60" stroke="var(--rail)" strokeWidth={1} />
      <circle cx="150" cy="20" r="4" fill="var(--ink)">
        <animate attributeName="cx" values="20;280;20" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="150" cy="60" r="4" fill="none" stroke="var(--rail-strong)" strokeWidth={1.5}>
        <animate attributeName="cx" values="20;280;20" dur={broken ? '2.6s' : '4s'} repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function ContextLostSpecimen({ broken }: { broken: boolean }) {
  return (
    <div
      className="flex h-40 w-full max-w-sm items-center justify-center rounded-md text-xs"
      style={{
        border: '1px solid var(--rail)',
        background: broken ? '#000' : '#08090b',
        color: broken ? '#3a3d42' : 'var(--ink-dim)',
        animation: broken ? 'kit-glitch 2.6s ease-in-out infinite' : undefined,
      }}
    >
      {broken ? 'Context Lost' : 'stable — Suspense inside Canvas'}
      <style>{`@keyframes kit-glitch { 0%, 70%, 100% { opacity: 1; } 74% { opacity: 0.1; } 78% { opacity: 1; } 82% { opacity: 0.2; } 86% { opacity: 1; } }`}</style>
    </div>
  )
}

export default function NightField() {
  return (
    <div className="space-y-14 max-w-3xl">
      <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--ink)' }}>
        The first thing the night field did was go black. The homepage uses Blender for scene
        layout and Hyper3D Rodin for mesh generation. Rodin GLBs ship with the
        KHR_materials_pbrSpecularGlossiness extension and metalness set to 1. Under a point light
        with no environment map, that renders as pure black: no ambient, no diffuse, nothing. The
        fix takes three lines. Rebuild the material on load, drop metalness to 0.15, set
        roughness to 0.7. Two floats. The problem is invisible unless you know what Rodin ships by
        default, and the error gives you nothing useful: a dark viewport where a mesh should be.
      </p>
      <Suspense fallback={<div className="h-64" aria-hidden />}>
        <LiveMaterialDemo />
      </Suspense>

      <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--ink)' }}>
        The parked model orbited the wrong center. Blender's export_apply bakes object transforms
        into vertex coordinates, so any offset from origin gets permanently cooked into the mesh.
        The model sat wrong in the scene and rotated around a ghost point in empty space. The
        fix: zero the location, apply all transforms, and recenter geometry before export, in
        that order. It's a Blender hygiene rule that's easy to skip when you're iterating fast,
        and it only costs you when the model needs to sit somewhere specific.
      </p>
      <ToggleCompare
        beforeLabel="orbits a phantom point"
        afterLabel="spins in place"
        before={<OrbitSpecimen broken />}
        after={<OrbitSpecimen broken={false} />}
        caption="transform_apply(location=True) before export — every time, not just when it looks wrong."
      />

      <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--ink)' }}>
        The scene went black on first load. WebGL context lost. In react-three-fiber, Suspense
        for async loads has to live inside the Canvas component. Put it outside and every
        useGLTF or useTexture call triggers a full Canvas remount. Chain enough of those together
        and the browser drops the WebGL context entirely. The surface error pointed at the GPU.
        The actual cause was Suspense placement, two components up the tree. That distance
        between symptom and source is what makes it slow to diagnose: you look at the wrong layer
        for a while before you find the real one.
      </p>
      <ToggleCompare
        beforeLabel="Suspense outside Canvas"
        afterLabel="Suspense inside Canvas"
        before={<ContextLostSpecimen broken />}
        after={<ContextLostSpecimen broken={false} />}
      />

      <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--ink)' }}>
        The four-legged creature's feet skated. The animation ran without a rig, using a
        skin-modifier skeleton decimated for a low-poly faceted look, body and legs as separate
        meshes articulated through pivot groups. The constraint is arithmetic: foot-ground speed
        must equal body travel speed. Amplitude times frequency times leg length. Those numbers
        have to agree, and there's no automatic feedback when they don't. Without a rig to
        enforce ground contact, nothing catches the drift. You adjust the keyframes and check
        again. You do that until the feet actually step.
      </p>
      <ToggleCompare
        beforeLabel="feet skate"
        afterLabel="feet stick"
        before={<GaitSpecimen broken />}
        after={<GaitSpecimen broken={false} />}
        caption="the ring is the foot, the dot is the body. Watch where they land."
      />

      <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--ink)' }}>
        None of this got caught by one agent generating and shipping. It took a critique-panel
        workflow: a composition critic, a 3D-craft critic, and an anti-slop reviewer looking at
        renders separately, with a fixer agent gated on typecheck and screenshot confirmation.
        Capped at two or three rounds, because quality converges by then. More rounds just drift.
        The homepage is proof of the same argument made elsewhere on this site about production
        AI. Agents generate, agents and humans review, in that order, on purpose. The front door
        of n3wth isn't a metaphor for that argument. It is that argument, running live.
      </p>
      <div className="h-56 w-full max-w-2xl">
        <FlowDiagram nodes={CRITIQUE_NODES} edges={CRITIQUE_EDGES} width={860} height={220} />
      </div>
    </div>
  )
}
