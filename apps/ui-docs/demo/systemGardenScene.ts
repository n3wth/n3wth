import * as THREE from 'three'

/** A small, on-demand scene inspired by Garden's stems and connected crowns.
 * Navigation remains ordinary HTML; the canvas never consumes wheel or drag.
 */
export function mountGarden(host: HTMLElement, open: (index: number) => void) {
  let renderer: THREE.WebGLRenderer
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }) } catch { return () => {} }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  const resources: Array<{ dispose: () => void }> = []
  const keep = <T extends { dispose: () => void }>(value: T): T => { resources.push(value); return value }
  const ink = keep(new THREE.MeshBasicMaterial())
  const muted = keep(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.48 }))
  const ground = keep(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.13 }))
  const sphere = keep(new THREE.SphereGeometry(0.1, 12, 8))
  const targets: THREE.Object3D[] = []
  const centres = [-4.2, 0, 4.2]

  function line(points: THREE.Vector3[], material: THREE.LineBasicMaterial) {
    scene.add(new THREE.Line(keep(new THREE.BufferGeometry().setFromPoints(points)), material))
  }
  function plant(x: number, z: number, height: number, index: number, prominent = false) {
    const bow = Math.sin(index * 2.4) * 0.18
    const tip = new THREE.Vector3(x + bow, height, z)
    line([new THREE.Vector3(x, 0, z), new THREE.Vector3(x + bow * 0.3, height * 0.5, z), tip], muted)
    const branches = prominent ? 5 : 2
    for (let branch = 0; branch < branches; branch++) {
      const y = height * (0.35 + branch * 0.1)
      const angle = branch * 2.4 + index
      const reach = height * 0.3
      const end = new THREE.Vector3(x + Math.cos(angle) * reach, y + reach * 0.45, z + Math.sin(angle) * reach)
      line([new THREE.Vector3(x + bow * 0.3, y, z), end], muted)
    }
    const crown = new THREE.Mesh(sphere, ink)
    crown.position.copy(tip)
    crown.scale.setScalar(prominent ? 1.65 : 0.55)
    scene.add(crown)
    if (prominent) {
      // A larger invisible hit target keeps thin geometry easy to select.
      const hit = new THREE.Mesh(keep(new THREE.SphereGeometry(0.6, 8, 6)), keep(new THREE.MeshBasicMaterial({ visible: false })))
      hit.position.copy(tip)
      hit.userData.destination = index
      scene.add(hit)
      targets.push(hit)
    }
  }
  centres.forEach((x, i) => plant(x, 0, [2.7, 3.4, 2.4][i], i, true))
  for (let i = 0; i < 32; i++) {
    const x = Math.sin(i * 17.13) * 6
    const z = -1.5 - (i % 7) * 0.7
    plant(x, z, 0.4 + (Math.sin(i * 7) + 1) * 0.55, i)
  }
  for (let i = -6; i <= 6; i++) {
    line([new THREE.Vector3(i, -0.02, -7), new THREE.Vector3(i, -0.02, 2)], ground)
  }
  for (let z = -7; z <= 2; z++) {
    line([new THREE.Vector3(-6, -0.02, z), new THREE.Vector3(6, -0.02, z)], ground)
  }
  line(centres.map(x => new THREE.Vector3(x, 0.02, 0)), muted)

  let frame = 0
  let pointerX = 0
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const draw = () => {
    frame = 0
    const width = host.clientWidth
    const height = host.clientHeight
    if (!width || !height) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.position.set(reduced.matches ? 0 : pointerX * 0.35, 4.2, Math.max(8, 21 / camera.aspect))
    camera.lookAt(0, 1, -1)
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(draw) }
  const theme = () => {
    // Resolve light-dark() and other CSS colour expressions before passing to Three.
    const probe = document.createElement('span')
    probe.hidden = true
    host.appendChild(probe)
    probe.style.color = 'var(--color-text-primary)'
    ink.color.set(getComputedStyle(probe).color)
    probe.style.color = 'var(--color-text-secondary)'
    muted.color.set(getComputedStyle(probe).color)
    probe.remove()
    ground.color.copy(muted.color)
    schedule()
  }
  const raycaster = new THREE.Raycaster()
  const hitAt = (event: PointerEvent | MouseEvent) => {
    const rect = host.getBoundingClientRect()
    raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera)
    return raycaster.intersectObjects(targets)[0]?.object.userData.destination as number | undefined
  }
  const move = (event: PointerEvent) => {
    pointerX = (event.clientX - host.getBoundingClientRect().left) / host.clientWidth * 2 - 1
    host.style.cursor = hitAt(event) === undefined ? 'default' : 'pointer'
    if (!reduced.matches && event.pointerType === 'mouse') schedule()
  }
  const leave = () => { pointerX = 0; schedule() }
  const click = (event: MouseEvent) => { const index = hitAt(event); if (index !== undefined) open(index) }
  const resize = new ResizeObserver(schedule)
  resize.observe(host)
  const observer = new MutationObserver(theme)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-astryx-theme', 'style', 'class'] })
  host.addEventListener('pointermove', move)
  host.addEventListener('pointerleave', leave)
  host.addEventListener('click', click)
  reduced.addEventListener('change', schedule)
  theme()
  return () => {
    cancelAnimationFrame(frame)
    resize.disconnect()
    observer.disconnect()
    host.removeEventListener('pointermove', move)
    host.removeEventListener('pointerleave', leave)
    host.removeEventListener('click', click)
    reduced.removeEventListener('change', schedule)
    resources.forEach(resource => resource.dispose())
    renderer.dispose()
    renderer.domElement.remove()
  }
}
