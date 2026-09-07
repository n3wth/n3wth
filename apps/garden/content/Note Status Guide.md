---
title: Note Status Guide
description: Understanding and using the note maturity system
tags: [meta, guide, organization]
status: evergreen
---

# Note Status Guide

This guide explains the note maturity system used in this [[Digital Garden|digital garden]] to track the development and refinement of ideas.

## Status Levels

### Seed

**Description**: Raw, unprocessed ideas captured quickly.

- **Characteristics**:
  - Brief, often just a few sentences
  - May contain questions or incomplete thoughts
  - Links not yet established
  - Minimal formatting
- **Purpose**: Capture ideas before they're lost
- **Next Steps**: Add context, expand, create connections

### Seedling

**Description**: Ideas that have been revisited and developed.

- **Characteristics**:
  - Core concept clearly articulated
  - Basic structure in place
  - Some connections to other notes
  - May still have open questions
- **Purpose**: Develop understanding, explore implications
- **Next Steps**: Add evidence, refine structure, strengthen connections

### Evergreen

**Description**: Mature, well-developed ideas that stand on their own.

- **Characteristics**:
  - Self-contained and comprehensive
  - Well-connected to other notes
  - Clear structure and arguments
  - Regularly maintained and updated
  - Can be shared confidently
- **Purpose**: Serve as reliable knowledge building blocks
- **Next Steps**: Maintain currency, update with new insights

## How to Use Status Tags

### In Frontmatter

```yaml
---
status: seed # or seedling, evergreen
---
```

### Visual Indicators

Consider using these emoji prefixes in note titles:

- for seeds
- for seedlings
- for evergreen notes

## Status Progression Workflow

### From Seed → Seedling

- [ ] Clarify the core idea
- [ ] Add relevant context
- [ ] Create at least 2 connections to other notes
- [ ] Structure with headings
- [ ] Add examples or evidence

### From Seedling → Evergreen

- [ ] Ensure idea is atomic and focused
- [ ] Verify all claims with sources
- [ ] Create bidirectional links
- [ ] Polish writing for clarity
- [ ] Test: Could this stand alone as valuable?

## Maintenance Guidelines

### Weekly Review

- Review all seeds older than 1 week
- Develop 2-3 seeds into seedlings
- Update 1-2 seedlings toward evergreen

### Monthly Review

- Audit evergreen notes for accuracy
- Archive or merge redundant notes
- Celebrate progression metrics

## Status Search Queries

Use these to find notes by status:

- `status:seed` - Find all seed notes
- `status:seedling` - Find developing notes
- `status:evergreen` - Find mature notes
- `-status` - Find notes without status

---

_Remember: Not every note needs to become evergreen. Some ideas serve their purpose as seeds or seedlings._
