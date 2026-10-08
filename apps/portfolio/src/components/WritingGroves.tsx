import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentRef } from 'react'
import { Html, Line, useCursor } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Button } from '@n3wth/ui/primitives'
import * as THREE from 'three'
import { hashString, layoutWritingGroves, plantSegments, type WritingWorld } from '../lib/writingGroves'
import './writingGroves.css'

const EMPTY_WORLD: WritingWorld = { nodes: [], edges: [] }
const PULSE_START = 1
const PULSE_TRAVEL = 2.2
const PULSE_ARRIVAL = PULSE_START + PULSE_TRAVEL

export default function WritingGroves({ onEnter, reducedMotion }: { onEnter: (href: string) => void; reducedMotion: boolean }) {
  const [world, setWorld] = useState<WritingWorld>(EMPTY_WORLD)
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [ambient, setAmbient] = useState<{ id: string; points: THREE.Vector3[]; length: number }[]>([])
  const trails = useRef(new Map<string, ComponentRef<typeof Line>>())
  const panel = useRef<HTMLDivElement>(null)
  const focusPanel = useCallback((element: HTMLDivElement | null) => {
    panel.current = element
    element?.focus({ preventScroll: true })
  }, [])
  const stems = useRef<THREE.InstancedMesh>(null)
  const leaves = useRef<THREE.InstancedMesh>(null)
  const hits = useRef<THREE.InstancedMesh>(null)
  const blooms = useRef<THREE.InstancedMesh>(null)
  const light = useRef({ from: '', targets: new Set<string>(), started: -10, next: 0 })
  const wind = useRef({ plants: new Map<string, { seed: number; delta: THREE.Matrix4 }>(), instances: [] as { mesh: THREE.InstancedMesh; index: number; base: THREE.Matrix4; delta: THREE.Matrix4 }[], matrix: new THREE.Matrix4() })
  const palette = useRef({ bark: new THREE.Color('#8a7a68'), leaf: new THREE.Color('#b9c9a8'), active: new THREE.Color('#ffce8a'), pulse: new THREE.Color('#b9c9a8').multiplyScalar(3), mixed: new THREE.Color() })
  const aspect = useThree(({ size }) => size.width / size.height)
  const invalidate = useThree(({ invalidate }) => invalidate)
  useCursor(hovered !== null)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/writing/world.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Writing world unavailable')
        return response.json() as Promise<WritingWorld>
      })
      .then(setWorld)
      .catch(() => { /* The existing Thinking navigation remains available. */ })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!selected) return
    panel.current?.focus({ preventScroll: true })
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', dismiss)
    return () => window.removeEventListener('keydown', dismiss)
  }, [selected])

  const compact = aspect < 1.35
  const spread = compact ? Math.max(1, Math.min(1.35, aspect) / 0.5) : 1
  const trees = useMemo(() => layoutWritingGroves(world.nodes, compact, spread), [world.nodes, compact, spread])
  const segments = useMemo(() => trees.flatMap((tree) => plantSegments(tree).map((segment) => ({ ...segment, treeId: tree.id }))), [trees])
  const foliage = useMemo(() => segments.filter((segment) => segment.leaf), [segments])
  const flowers = useMemo(() => trees.filter((_, index) => index % 4 === 0), [trees])
  const treeById = useMemo(() => new Map(trees.map((tree) => [tree.id, tree])), [trees])
  const edges = useMemo(() => world.edges.filter(edge => edge.source !== edge.target && treeById.has(edge.source) && treeById.has(edge.target)), [world.edges, treeById])
  const current = selected ? treeById.get(selected) : undefined
  const preview = hovered ? treeById.get(hovered) : undefined
  const connections = useMemo(() => world.edges.filter((edge) => edge.source === selected || edge.target === selected).flatMap((edge) => {
    const a = treeById.get(edge.source)
    const b = treeById.get(edge.target)
    if (!a || !b) return []
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(a.x, a.height, a.z), new THREE.Vector3((a.x + b.x) / 2, Math.max(a.height, b.height) + 2, (a.z + b.z) / 2), new THREE.Vector3(b.x, b.height, b.z))
    return [{ id: `${edge.source}:${edge.target}`, points: curve.getPoints(16) }]
  }), [world.edges, selected, treeById])

  useLayoutEffect(() => {
    wind.current.instances = []
    wind.current.plants.clear()
    const remember = (mesh: THREE.InstancedMesh | null, index: number, id: string, matrix: THREE.Matrix4) => {
      if (!mesh) return
      let plant = wind.current.plants.get(id)
      if (!plant) {
        plant = { seed: hashString(id) / 4294967296, delta: new THREE.Matrix4() }
        wind.current.plants.set(id, plant)
      }
      wind.current.instances.push({ mesh, index, base: matrix.clone(), delta: plant.delta })
    }
    const dummy = new THREE.Object3D()
    const up = new THREE.Vector3(0, 1, 0)
    const direction = new THREE.Vector3()
    segments.forEach((segment, index) => {
      const a = new THREE.Vector3(...segment.a)
      const b = new THREE.Vector3(...segment.b)
      direction.subVectors(b, a)
      dummy.position.copy(a).add(b).multiplyScalar(0.5)
      const height = treeById.get(segment.treeId)?.height ?? 1
      const radius = segment.detail ? 0.009 : 0.012 + height * 0.004
      dummy.scale.set(radius, direction.length(), radius)
      dummy.quaternion.setFromUnitVectors(up, direction.normalize())
      dummy.updateMatrix()
      stems.current?.setMatrixAt(index, dummy.matrix)
      remember(stems.current, index, segment.treeId, dummy.matrix)
    })
    foliage.forEach((segment, index) => {
      dummy.position.set(...segment.b)
      dummy.rotation.set(0.4, index * 2.4, -0.6)
      dummy.scale.set(0.1, 0.025, 0.2)
      dummy.updateMatrix()
      leaves.current?.setMatrixAt(index, dummy.matrix)
      remember(leaves.current, index, segment.treeId, dummy.matrix)
    })
    trees.forEach((tree, index) => {
      dummy.position.set(tree.x, tree.height * 0.65, tree.z)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(0.55, Math.max(0.6, tree.height * 0.65), 0.55)
      dummy.updateMatrix()
      hits.current?.setMatrixAt(index, dummy.matrix)
      remember(hits.current, index, tree.id, dummy.matrix)
    })
    flowers.forEach((tree, index) => {
      dummy.position.set(tree.x, tree.height, tree.z)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.setScalar(tree.stage === 'evergreen' ? .12 : .045)
      dummy.updateMatrix()
      blooms.current?.setMatrixAt(index, dummy.matrix)
      remember(blooms.current, index, tree.id, dummy.matrix)
    })
    for (const mesh of [stems.current, leaves.current, hits.current, blooms.current]) {
      if (!mesh) continue
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
    }
    invalidate()
  }, [segments, foliage, flowers, trees, treeById, invalidate])

  useLayoutEffect(() => {
    const bark = new THREE.Color('#8a7a68')
    const leaf = new THREE.Color('#b9c9a8')
    const active = new THREE.Color('#ffce8a')
    const isActive = (id: string) => id === selected || id === hovered
    segments.forEach((segment, index) => stems.current?.setColorAt(index, isActive(segment.treeId) ? active : bark))
    foliage.forEach((segment, index) => leaves.current?.setColorAt(index, isActive(segment.treeId) ? active : leaf))
    for (const mesh of [stems.current, leaves.current]) {
      if (mesh?.instanceColor) mesh.instanceColor.needsUpdate = true
    }
    invalidate()
  }, [selected, hovered, segments, foliage, invalidate])

  const selectTree = (event: ThreeEvent<MouseEvent>) => {
    if (event.instanceId === undefined) return
    event.stopPropagation()
    setSelected(trees[event.instanceId].id)
  }

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const colors = palette.current
    const time = clock.elapsedTime
    const state = light.current
    const motion = wind.current
    motion.plants.forEach(({ seed, delta }) => {
      delta.elements[4] = Math.sin(time * (.3 + seed * .2) + seed * 20) * (.012 + seed * .018)
      delta.elements[6] = Math.sin(time * (.22 + seed * .15) + seed * 31) * .016
    })
    motion.instances.forEach(({ mesh, index, base, delta }) => {
      motion.matrix.multiplyMatrices(delta, base)
      mesh.setMatrixAt(index, motion.matrix)
    })
    for (const mesh of [stems.current, leaves.current, hits.current, blooms.current]) {
      if (mesh) mesh.instanceMatrix.needsUpdate = true
    }
    if (!edges.length) return
    if (time >= state.next) {
      const edge = edges[Math.floor(Math.random() * edges.length)]
      state.from = Math.random() < .5 ? edge.source : edge.target
      const a = treeById.get(state.from)!
      const neighbors = [...new Set(edges.filter(item => item.source === state.from || item.target === state.from)
        .map(item => item.source === state.from ? item.target : item.source))]
      // Nearby actual links read as one small gesture instead of crossing the grove.
      const distance = (id: string) => {
        const b = treeById.get(id)!
        return (a.x - b.x) ** 2 + (a.z - b.z) ** 2
      }
      neighbors.sort((a, b) => distance(a) - distance(b))
      state.targets = new Set(neighbors.slice(0, Math.random() < .5 ? 2 : 3))
      setAmbient([...state.targets].map(id => {
        const b = treeById.get(id)!
        const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(a.x, a.height, a.z), new THREE.Vector3((a.x + b.x) / 2, Math.max(a.height, b.height) + 2, (a.z + b.z) / 2), new THREE.Vector3(b.x, b.height, b.z))
        return { id, points: curve.getPoints(32), length: curve.getLength() }
      }))
      state.started = time
      state.next = time + 8 + Math.random() * 3
    }
    const age = time - state.started
    ambient.forEach(connection => {
      const trail = trails.current.get(connection.id)
      if (!trail) return
      const progress = (age - PULSE_START) / PULSE_TRAVEL
      trail.visible = !selected && progress >= 0 && progress <= 1
      trail.material.opacity = .8 * THREE.MathUtils.smoothstep(progress, 0, .15)
        * (1 - THREE.MathUtils.smoothstep(progress, .65, 1))
      trail.material.dashOffset = -progress * connection.length
    })
    const paint = (mesh: THREE.InstancedMesh | null, index: number, treeId: string, y: number, base: THREE.Color) => {
      if (!mesh) return
      const height = treeById.get(treeId)?.height ?? 1
      const arrival = treeId === state.from ? y / height
        : state.targets.has(treeId) ? PULSE_ARRIVAL + 1 - y / height : -10
      const amount = Math.max(0, 1 - Math.abs(age - arrival) / .65)
      mesh.setColorAt(index, treeId === selected || treeId === hovered
        ? colors.active : colors.mixed.copy(base).lerp(colors.pulse, amount))
    }
    segments.forEach((segment, index) => paint(stems.current, index, segment.treeId, segment.b[1], colors.bark))
    foliage.forEach((segment, index) => paint(leaves.current, index, segment.treeId, segment.b[1], colors.leaf))
    if (stems.current?.instanceColor) stems.current.instanceColor.needsUpdate = true
    if (leaves.current?.instanceColor) leaves.current.instanceColor.needsUpdate = true
    flowers.forEach((tree, index) => {
      const arrival = tree.id === state.from ? PULSE_START : state.targets.has(tree.id) ? PULSE_ARRIVAL : -10
      const amount = Math.max(0, 1 - Math.abs(age - arrival) / .65)
      blooms.current?.setColorAt(index, colors.mixed.copy(colors.leaf).multiplyScalar(.8 + amount * 2))
    })
    if (blooms.current?.instanceColor) blooms.current.instanceColor.needsUpdate = true
  })

  return <>
    {!reducedMotion && ambient.map(connection => <Line key={connection.id} ref={line => {
      if (line) trails.current.set(connection.id, line)
      else trails.current.delete(connection.id)
    }} points={connection.points} color="#e2e8d8" dashed dashSize={.9} gapSize={1000} transparent opacity={0} toneMapped={false} lineWidth={1.5} raycast={() => null} />)}
    <Html center position={[compact ? -4.2 * spread : -6, -.8, -13]} zIndexRange={[20, 10]}>
      <a className="world-portal-link" href="/thinking#notes" aria-label="Notes" onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        onEnter('/thinking#notes')
      }}>Notes</a>
    </Html>
    <instancedMesh ref={blooms} args={[undefined, undefined, flowers.length]} raycast={() => null}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color="#e2e8d8" wireframe toneMapped={false} />
    </instancedMesh>
    <instancedMesh ref={stems} args={[undefined, undefined, segments.length]} raycast={() => null}>
      <cylinderGeometry args={[0.65, 1, 1, 8, 1, true]} />
      <meshStandardMaterial color="#ffffff" roughness={0.9} emissive="#8a7a68" emissiveIntensity={0.06} />
    </instancedMesh>
    <instancedMesh ref={leaves} args={[undefined, undefined, foliage.length]} raycast={() => null}>
      <sphereGeometry args={[1, 10, 6]} />
      <meshStandardMaterial color="#ffffff" roughness={0.85} emissive="#b9c9a8" emissiveIntensity={0.08} />
    </instancedMesh>
    <instancedMesh ref={hits} args={[undefined, undefined, trees.length]} onClick={selectTree} onPointerMove={(event) => {
      if (event.instanceId === undefined) return
      event.stopPropagation()
      setHovered(trees[event.instanceId].id)
    }} onPointerOut={() => setHovered(null)}>
      <sphereGeometry args={[1, 6, 4]} />
      <meshBasicMaterial colorWrite={false} depthWrite={false} />
    </instancedMesh>
    {connections.map((connection) => <Line key={connection.id} points={connection.points} color="#b9c9a8" transparent opacity={0.45} lineWidth={1} />)}
    {!current && preview && <Html fullscreen calculatePosition={(_, __, size) => [size.width / 2, size.height / 2]} zIndexRange={[25, 20]} style={{ pointerEvents: 'none' }}>
      <div className="writing-grove-hint">
        {preview && <span>{preview.title}</span>}
        <a href="/thinking">Explore writing</a>
      </div>
    </Html>}
    {current && <Html fullscreen calculatePosition={(_, __, size) => [size.width / 2, size.height / 2]} zIndexRange={[40, 30]} style={{ pointerEvents: 'none' }}>
      <div ref={focusPanel} tabIndex={-1} className="writing-grove-panel" role="region" aria-label="Selected writing">
        <div className="writing-grove-heading">
          <h2>{current.title}</h2>
          <Button label="Close" variant="ghost" size="sm" clickAction={() => setSelected(null)} />
        </div>
        {current.description && <p>{current.description}</p>}
        <div className="writing-grove-links">
          <a href={current.id} onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
            event.preventDefault()
            onEnter(current.id)
          }}>Read</a>
          {current.tags.map((tag) => <a key={tag} href={`/thinking?topic=${encodeURIComponent(tag)}`}>{tag}</a>)}
          <a href="/thinking">All thinking</a>
        </div>
      </div>
    </Html>}
  </>
}
