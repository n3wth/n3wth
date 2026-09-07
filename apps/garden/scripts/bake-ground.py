"""Bake a reusable dry-soil PBR tile with Blender 4.5 (no external assets).

blender-render --python scripts/bake-ground.py -- /path/to/output
"""
import sys
from pathlib import Path
import bpy

out = Path(sys.argv[sys.argv.index('--') + 1])
out.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.mesh.primitive_plane_add(size=2)
plane = bpy.context.object
mat = bpy.data.materials.new('Dry soil')
mat.use_nodes = True
plane.data.materials.append(mat)
nodes, links = mat.node_tree.nodes, mat.node_tree.links
shader = nodes.get('Principled BSDF')
coord = nodes.new('ShaderNodeTexCoord')
# Object coordinates make this tile repeat without discontinuities by mapping
# UVs onto a torus before sampling the procedural noise.
sep = nodes.new('ShaderNodeSeparateXYZ')
links.new(coord.outputs['UV'], sep.inputs[0])
waves = []
for axis in ('X', 'Y'):
    mul = nodes.new('ShaderNodeMath')
    mul.operation = 'MULTIPLY'
    mul.inputs[1].default_value = 6.28318530718
    links.new(sep.outputs[axis], mul.inputs[0])
    for operation in ('SINE', 'COSINE'):
        wave = nodes.new('ShaderNodeMath')
        wave.operation = operation
        links.new(mul.outputs[0], wave.inputs[0])
        waves.append(wave)
vec = nodes.new('ShaderNodeCombineXYZ')
for i in range(3):
    links.new(waves[i].outputs[0], vec.inputs[i])
noise = nodes.new('ShaderNodeTexNoise')
noise.noise_dimensions = '4D'
noise.inputs['Scale'].default_value = 12
noise.inputs['Detail'].default_value = 5
links.new(vec.outputs[0], noise.inputs['Vector'])
links.new(waves[3].outputs[0], noise.inputs['W'])
ramp = nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].position = 0.2
ramp.color_ramp.elements[0].color = (0.065, 0.054, 0.042, 1)
ramp.color_ramp.elements[1].position = 0.8
ramp.color_ramp.elements[1].color = (0.32, 0.28, 0.22, 1)
links.new(noise.outputs['Fac'], ramp.inputs[0])
links.new(ramp.outputs['Color'], shader.inputs['Base Color'])
bump = nodes.new('ShaderNodeBump')
bump.inputs['Strength'].default_value = 0.5
bump.inputs['Distance'].default_value = 0.035
links.new(noise.outputs['Fac'], bump.inputs['Height'])
links.new(bump.outputs['Normal'], shader.inputs['Normal'])
rough = nodes.new('ShaderNodeMapRange')
rough.inputs['To Min'].default_value = 0.7
rough.inputs['To Max'].default_value = 1
links.new(noise.outputs['Fac'], rough.inputs['Value'])
links.new(rough.outputs[0], shader.inputs['Roughness'])
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 16
scene.render.bake.use_pass_direct = False
scene.render.bake.use_pass_indirect = False
scene.render.bake.use_pass_color = True
for name, bake_type in [('color', 'DIFFUSE'), ('normal', 'NORMAL'), ('roughness', 'ROUGHNESS')]:
    img = bpy.data.images.new('soil-' + name, width=1024, height=1024)
    img.colorspace_settings.name = 'sRGB' if name == 'color' else 'Non-Color'
    target = nodes.new('ShaderNodeTexImage')
    target.image = img
    nodes.active = target
    bpy.ops.object.bake(type=bake_type)
    img.filepath_raw = str(out / ('soil-' + name + '.png'))
    img.file_format = 'PNG'
    img.save()
print('GROUND_BAKE_OK')
