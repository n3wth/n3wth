# Source and publishing authority

Imported from https://github.com/n3wth/ui at commit 62839d33ae0a439901b9515339e6259ce6dcf274.

This pilot uses the existing 0.9.2 public package contract. Publishing remains owned by the original repository and its release workflow. Do not publish from this workspace or create competing package releases during the pilot. The original repository retains its full history and rollback path.

Workspace validation: npm run check --workspace @n3wth/ui. Build the library before consuming it in UI docs. Generated CSS resolves dependencies through package resolution to support hoisted installs.
