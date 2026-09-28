# Elephant-Goldfish for Codex

An instruction-only plugin for independent design checks, diagnosis, and code review. The working session keeps project context. Fresh subagents test bounded artifacts without inheriting the conversation.

## Use

Select Elephant-Goldfish in a new Codex chat and describe the task, or select a focused bundled skill:

| Skill | Result |
| --- | --- |
| `eg-brainstorm` | Compared concepts and validation steps |
| `eg-prd` | Source-grounded requirements and open questions |
| `eg-new-feature` | Checked design, then implementation if requested |
| `eg-fix-bug` | Independent diagnosis, then repair if requested |
| `eg-precommit-review` | Evidence-backed findings on an exact change scope |

Example: `Use $eg-precommit-review to review only my staged changes. Do not edit files.`

The entry skill routes plugin mentions to these bundled copies. Existing global skills with the same names are untouched; choose the plugin's copy if both are installed.

## Boundaries

- Independent checks require a host that supports fresh subagents and permits delegation. A same-chat self-review is never labeled independent.
- Fresh context does not prevent filesystem access. Reviewers receive explicit read-only and source restrictions; this is not a security sandbox.
- Review and diagnosis alone do not apply fixes. Features and bug fixes include verification and review within the authorized task.
- The default loop is one initial pass and at most two revision/fix rounds. User and repository instructions take precedence.
- No MCP service, hooks, credentials, runtime dependencies, telemetry, or global AGENTS.md changes are included. Normal Codex model/tool use still applies.

## Installation and updates

Release: **0.1.0**. See the [project page](https://n3wth.com/projects/elephant-goldfish) for the source download and attribution. A public directory listing is not yet available. Add the extracted plugin through your Codex plugin development or marketplace setup, install its plugin card, then start a new chat.

For local development updates, use the plugin-creator reinstall workflow. Do not edit installed cache copies as the source of truth. Published release versions use plain semantic versions.

## Privacy, terms, and support

The plugin has no publisher-operated backend or telemetry. Codex and selected tools still process task data under their own settings and policies. See [privacy](https://n3wth.com/privacy) and [terms](https://n3wth.com/terms). Support: support@n3wth.com.

## Sources and validation

The plugin includes [12 native SVG assets](assets/README.md): its square master mark and five workflow icons in light and dark palettes. Plugin and skill metadata reference the vector files directly.

See [research and adaptation decisions](references/research.md), [acceptance scenarios](references/acceptance.md), and [upstream license](LICENSE).

This is an adapted package, not an official release from the upstream authors. No claim of improved model accuracy or reduced defect rates is made without measured evidence.
