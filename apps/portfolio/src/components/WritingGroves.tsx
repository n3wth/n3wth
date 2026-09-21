import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Html, Line, useCursor } from '@react-three/drei'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { Button } from '@n3wth/ui/primitives'
import * as THREE from 'three'
import { layoutWritingGroves, plantSegments, type WritingWorld } from '../lib/writingGroves'
import './writingGroves.css'

const EMPTY_WORLD: WritingWorld = { nodes: [], edges: [] }

export default function WritingGroves({ onEnter }: { onEnter: (href: string) => void }) {
  const [world, setWorld] = useState<WritingWorld>(EMPTY_WORLD)
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const focusPanel = useCallback((element: HTMLDivElement | null) => {
    panel.current = element
    element?.focus({ preventScroll: true })
  }, [])
  const stems = useRef<THREE.InstancedMesh>(null)
  const leaves = useRef<THREE.InstancedMesh>(null)
  const hits = useRef<THREE.InstancedMesh>(null)
  const aspect = useThree(({ size }) => size.width / size.height)
  const invalidate = useThree(({ invalidate }) => invalidate)
  useCursor(hovered)

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
  const segments = useMemo(() => trees.flatMap((tree) => plantSegments(tree)), [trees])
  const foliage = useMemo(() => segments.filter((segment, i) => segment.detail && i % 2 === 0), [segments])
  const treeById = useMemo(() => new Map(trees.map((tree) => [tree.id, tree])), [trees])
  const current = selected ? treeById.get(selected) : undefined
  const connections = useMemo(() => world.edges.filter((edge) => edge.source === selected || edge.target === selected).flatMap((edge) => {
    const a = treeById.get(edge.source)
    const b = treeById.get(edge.target)
    if (!a || !b) return []
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(a.x, a.height, a.z), new THREE.Vector3((a.x + b.x) / 2, Math.max(a.height, b.height) + 2, (a.z + b.z) / 2), new THREE.Vector3(b.x, b.height, b.z))
    return [{ id: `${edge.source}:${edge.target}`, points: curve.getPoints(16) }]
  }), [world.edges, selected, treeById])

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D()
    const up = new THREE.Vector3(0, 1, 0)
    const direction = new THREE.Vector3()
    segments.forEach((segment, index) => {
      const a = new THREE.Vector3(...segment.a)
      const b = new THREE.Vector3(...segment.b)
      direction.subVectors(b, a)
      dummy.position.copy(a).add(b).multiplyScalar(0.5)
      const radius = segment.detail ? 0.026 : 0.06
      dummy.scale.set(radius, direction.length(), radius)
      dummy.quaternion.setFromUnitVectors(up, direction.normalize())
      dummy.updateMatrix()
      stems.current?.setMatrixAt(index, dummy.matrix)
    })
    foliage.forEach((segment, index) => {
      dummy.position.set(...segment.b)
      dummy.rotation.set(0.4, index * 2.4, -0.6)
      dummy.scale.set(0.19, 0.055, 0.35)
      dummy.updateMatrix()
      leaves.current?.setMatrixAt(index, dummy.matrix)
    })
    trees.forEach((tree, index) => {
      dummy.position.set(tree.x, tree.height * 0.65, tree.z)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(0.55, Math.max(0.6, tree.height * 0.65), 0.55)
      dummy.updateMatrix()
      hits.current?.setMatrixAt(index, dummy.matrix)
    })
    for (const mesh of [stems.current, leaves.current, hits.current]) {
      if (!mesh) continue
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
    }
    invalidate()
  }, [segments, foliage, trees, invalidate])

  const selectTree = (event: ThreeEvent<MouseEvent>) => {
    if (event.instanceId === undefined) return
    event.stopPropagation()
    setSelected(trees[event.instanceId].id)
  }

  return <>
    <instancedMesh ref={stems} args={[undefined, undefined, segments.length]} raycast={() => null}>
      <cylinderGeometry args={[0.65, 1, 1, 5, 1, true]} />
      <meshStandardMaterial color="#b9c9a8" roughness={0.9} emissive="#b9c9a8" emissiveIntensity={0.12} />
    </instancedMesh>
    <instancedMesh ref={leaves} args={[undefined, undefined, foliage.length]} raycast={() => null}>
      <sphereGeometry args={[1, 6, 4]} />
      <meshStandardMaterial color="#b9c9a8" roughness={0.85} emissive="#b9c9a8" emissiveIntensity={0.16} />
    </instancedMesh>
    <instancedMesh ref={hits} args={[undefined, undefined, trees.length]} onClick={selectTree} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <sphereGeometry args={[1, 6, 4]} />
      <meshBasicMaterial colorWrite={false} depthWrite={false} />
    </instancedMesh>
    {connections.map((connection) => <Line key={connection.id} points={connection.points} color="#b9c9a8" transparent opacity={0.45} lineWidth={1} />)}
    {!current && trees.length > 0 && <Html fullscreen calculatePosition={(_, __, size) => [size.width / 2, size.height / 2]} zIndexRange={[25, 20]} style={{ pointerEvents: 'none' }}>
      <div className="writing-grove-hint">
        <span>{hovered ? 'Select a tree to read' : 'Each tree is a piece of writing'}</span>
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
