"""Headless-Blender asset build for the n3wth night field.

Models every portal sculpture as real geometry (tubes with radius, boards
with thickness, logs with taper) and exports a single GLB with named nodes:
  them, tower, signpost, firelogs, stones, terrain_ridge
Coordinates are authored in three.js space (Y up) via t2b(); the glTF
exporter's Y-up conversion round-trips them exactly.
Run: pip install bpy && python3 scripts/build-night-field-assets.py
"""
import math
import bpy
from mathutils import Vector, noise

OUT = "/workspace/n3wth/public/models/sculptures.glb"


def t2b(x, y, z):
    """three.js (x, y, z) -> Blender (x, -z, y)."""
    return (x, -z, y)


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    for block in (bpy.data.meshes, bpy.data.curves, bpy.data.materials):
        for item in list(block):
            if item.users == 0:
                block.remove(item)


def tube_object(name, polylines, radius, resolution=3):
    """One curve object holding many POLY splines, beveled into tubes."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = resolution
    cu.use_fill_caps = True
    for pts in polylines:
        sp = cu.splines.new("POLY")
        sp.points.add(len(pts) - 1)
        for i, p in enumerate(pts):
            bx, by, bz = t2b(*p)
            sp.points[i].co = (bx, by, bz, 1.0)
    obj = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(obj)
    to_mesh(obj)
    return obj


def to_mesh(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="MESH")


def join(objs, name):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    objs[0].name = name
    objs[0].data.name = name
    return objs[0]


def prand(i, salt=0.0):
    """Deterministic pseudo-random in [0, 1)."""
    return (math.sin(i * 12.9898 + salt * 78.233) * 43758.5453) % 1.0


# ---------------------------------------------------------------- THEM
def build_them():
    v = [
        (2.3, 0, 1.2), (2.6, 0, -1.0), (-2.5, 0, 1.1), (-2.8, 0, -1.2),
        (2.15, 2.1, 1.0), (2.4, 2.1, -0.9), (-2.35, 2.2, 0.9), (-2.6, 2.2, -1.0),
        (1.9, 4.1, 0.85), (2.0, 4.1, -0.8), (-2.0, 4.3, 0.8), (-2.2, 4.3, -0.75),
        (1.5, 5.1, 0), (-1.6, 5.3, 0),
        (2.0, 4.8, 0), (3.4, 6.6, 0),
        (4.4, 6.3, 0), (3.5, 7.3, 0.35), (3.3, 7.3, -0.35),
    ]
    # legs read as continuous limbs (tip->knee->shoulder), body/head as struts
    legs = [[v[0], v[4], v[8]], [v[1], v[5], v[9]], [v[2], v[6], v[10]], [v[3], v[7], v[11]]]
    struts = [
        [v[8], v[9]], [v[10], v[11]], [v[8], v[10]], [v[9], v[11]],
        [v[8], v[12]], [v[9], v[12]], [v[10], v[13]], [v[11], v[13]], [v[12], v[13]],
        [v[12], v[14]], [v[14], v[15]],
        [v[15], v[16]], [v[15], v[17]], [v[15], v[18]], [v[16], v[17]], [v[16], v[18]],
    ]
    a = tube_object("them_legs", legs, 0.085)
    b = tube_object("them_struts", struts, 0.06)
    return join([a, b], "them")


# ------------------------------------------------------------- WORK TOWER
def build_tower():
    w = 1.5
    levels = [0, 2.2, 4.4, 6.6]

    def corners(y):
        return [(-w, y, -w), (w, y, -w), (w, y, w), (-w, y, w)]

    frame = []
    for c in range(4):
        frame.append([corners(0)[c], corners(levels[3])[c]])
    for y in levels[1:]:
        ring = corners(y)
        for c in range(4):
            frame.append([ring[c], ring[(c + 1) % 4]])
    diag = []
    for i in range(3):
        y0, y1 = levels[i], levels[i + 1]
        diag.append([(-w, y0, w), (w, y1, w)])
        diag.append([(w, y0, -w), (-w, y1, -w)])
        diag.append([(w, y0, w), (w, y1, -w)])
        diag.append([(-w, y0, -w), (-w, y1, w)])
    crane = [
        [(0, levels[3], 0), (0, 8.4, 0)],
        [(0, 8.4, 0), (3.4, 8.0, 0)],
        [(0, 8.4, 0), (-1.2, 8.15, 0)],  # counter-jib
        [(3.4, 8.0, 0), (3.1, 6.75, 0)],  # hook cable
    ]
    a = tube_object("tower_frame", frame, 0.07)
    b = tube_object("tower_diag", diag, 0.04)
    c = tube_object("tower_crane", crane, 0.05)
    return join([a, b, c], "tower")


# --------------------------------------------------------------- SIGNPOST
def arrow_board(name, flip=False, yaw_deg=0.0):
    """Pentagon arrow prism pointing +X (or -X when flipped)."""
    L, H, T = 1.9, 0.62, 0.055
    pts = [(0.0, -H / 2), (L * 0.72, -H / 2), (L, 0.0), (L * 0.72, H / 2), (0.0, H / 2)]
    if flip:
        pts = [(-x, y) for (x, y) in pts]
        pts.reverse()
    verts = [t2b(x, y, -T) for (x, y) in pts] + [t2b(x, y, T) for (x, y) in pts]
    n = len(pts)
    faces = [list(range(n)), [i + n for i in reversed(range(n))]]
    for i in range(n):
        j = (i + 1) % n
        faces.append([i, j, j + n, i + n])
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    obj = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(obj)
    obj.rotation_euler = (0, 0, math.radians(yaw_deg))
    return obj


def build_signpost():
    post = tube_object("sign_post", [[(0, 0, 0), (0, 4.75, 0)]], 0.09)
    cap = tube_object("sign_cap", [[(0, 4.75, 0), (0, 4.95, 0)]], 0.13)
    right = arrow_board("sign_r", flip=False, yaw_deg=9)
    right.location = t2b(0.08, 4.18, 0)
    left = arrow_board("sign_l", flip=True, yaw_deg=-12)
    left.location = t2b(-0.08, 3.42, 0)
    bpy.ops.object.select_all(action="DESELECT")
    for o in (right, left):
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
    bpy.ops.object.transform_apply(location=True, rotation=True)
    return join([post, cap, right, left], "signpost")


# --------------------------------------------------------------- CAMPFIRE
def cylinder_between(name, a, b, r0, r1, verts=8):
    av, bv = Vector(t2b(*a)), Vector(t2b(*b))
    d = bv - av
    bpy.ops.mesh.primitive_cone_add(
        vertices=verts, radius1=r0, radius2=r1, depth=d.length,
        location=(av + bv) / 2,
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = d.to_track_quat("Z", "Y")
    bpy.ops.object.transform_apply(rotation=True)
    return obj


def build_fire():
    logs = []
    for i in range(6):
        a = (i / 6) * math.pi * 2 + 0.4 + prand(i) * 0.25
        base = (math.cos(a) * 1.45, 0.10, math.sin(a) * 1.45)
        tip = (math.cos(a + math.pi) * 0.30, 1.05 + prand(i, 3) * 0.18, math.sin(a + math.pi) * 0.30)
        logs.append(cylinder_between(f"log{i}", base, tip, 0.13, 0.08, verts=7))
    firelogs = join(logs, "firelogs")

    stones = []
    for i in range(9):
        a = (i / 9) * math.pi * 2 + prand(i, 7) * 0.5
        r = 2.0 + prand(i, 11) * 0.25
        bpy.ops.mesh.primitive_ico_sphere_add(
            subdivisions=1, radius=0.16 + prand(i, 13) * 0.09,
            location=t2b(math.cos(a) * r, 0.07, math.sin(a) * r),
        )
        s = bpy.context.active_object
        s.name = f"stone{i}"
        s.scale = (1.0, 1.0, 0.62)
        s.rotation_euler = (0, 0, prand(i, 17) * math.pi)
        bpy.ops.object.transform_apply(rotation=True, scale=True)
        stones.append(s)
    stone_ring = join(stones, "stones")
    return firelogs, stone_ring


# ------------------------------------------------------------ TERRAIN RIDGE
def build_ridge():
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=200, y_subdivisions=10, size=1)
    obj = bpy.context.active_object
    obj.name = "terrain_ridge"
    obj.data.name = "terrain_ridge"
    obj.scale = (270, 16, 1)
    bpy.ops.object.transform_apply(scale=True)
    for vtx in obj.data.vertices:
        x, y = vtx.co.x, vtx.co.y
        # jagged skyline: two octaves of noise, never dropping below a
        # low continuous band so the horizon stays unbroken
        n1 = noise.noise(Vector((x * 0.045, y * 0.05, 0.0)))
        n2 = noise.noise(Vector((x * 0.16, y * 0.2, 7.7)))
        h = max(2.2, 9.5 + n1 * 14.0 + n2 * 4.0)
        # fade to flat at strip edges so it meets the playa
        edge = min(1.0, (16 - abs(y)) / 7.0)
        vtx.co.z = h * max(0.0, edge)
    return obj


# ------------------------------------------------------------------ MAIN
reset_scene()
build_them()
build_tower()
build_signpost()
build_fire()
build_ridge()


# Bake every object transform into its vertices: R3F consumes raw
# geometry, so node-level transforms would silently be lost.
bpy.ops.object.select_all(action="SELECT")
bpy.context.view_layer.objects.active = bpy.data.objects[0]
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

import os
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    export_materials="NONE",
    export_yup=True,
    export_apply=True,
)
sizes = os.path.getsize(OUT)
print(f"exported {OUT} ({sizes/1024:.0f} KB)")
print("objects:", [o.name for o in bpy.data.objects])
