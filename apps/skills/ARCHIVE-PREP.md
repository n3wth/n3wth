# Skills source migration

The installer and active source links now use n3wth/n3wth and apps/skills. The CLI and VS Code extension are preserved from n3wth/skills main 138c6ff16cb49d2e73c29c7e4faeaeced946ba2e as standalone source packages. Publication is unchanged; npm newth-skills and Marketplace newth.newth-skills were not found during the archive audit. They are excluded from application TypeScript checks, as in the original project.

Installer regression tests exercise all six assistant destinations with a temporary SKILLS_INSTALL_HOME and a fixture git executable. CI runs the same tests on Linux and macOS. Real user home directories and installations are untouched. The original validate-skills workflow watched nonexistent root *.skill directories and had no runs; it was not copied as a misleading empty gate.

Nested CLI and extension dependency maintenance is covered by root Dependabot. Pending source repository PR192–195 are preserved in https://linear.app/newth/issue/N-421 for separate upgrade review. No package upgrade or publication is part of this change.

Validation: clean root npm install, Skills typecheck/lint/unit tests/production build, six installer fixture tests and 24 migration browser checks passed. Authorship and browser storage identifiers are unchanged. Existing install links remain skills.n3wth.com/install.sh; registry/public origins are unchanged.
