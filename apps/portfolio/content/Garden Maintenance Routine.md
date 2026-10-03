---
draft: true
title: Garden Maintenance Routine
description: Regular practices to keep your digital garden thriving
tags: [maintenance, workflow, habits]
status: evergreen
---

# Garden Maintenance Routine

A thriving digital garden requires regular tending. This guide outlines daily, weekly, monthly, and quarterly routines to keep your knowledge system healthy and growing.

## Daily Routine (5 minutes)

### Morning Seed Planting

- [ ] Capture overnight thoughts in daily note
- [ ] Review yesterday's seeds
- [ ] Create new notes for any substantial ideas

### Evening Reflection

- [ ] Process inbox/fleeting notes
- [ ] Update daily note with key learnings
- [ ] Set tomorrow's learning intention

## Weekly Routine (30 minutes)

### Sunday Garden Walk

- [ ] Complete [[Weekly Review Template]]
- [ ] Process all seed notes from the week
- [ ] Develop 2-3 seeds into seedlings
- [ ] Update [[MOCs/Knowledge Map]] if needed
- [ ] Clean up tags and broken links

### Status Check

```dataview
TABLE status, date(file.mtime) as "Last Modified"
FROM ""
WHERE status = "seed" AND date(file.ctime) <= date(today) - dur(7 days)
LIMIT 10
```

## Monthly Routine (2 hours)

### First Sunday Deep Work

- [ ] Review and refine MOCs
- [ ] Audit note statuses
- [ ] Archive obsolete notes
- [ ] Update templates based on usage
- [ ] Create synthesis notes from clusters

### Knowledge Synthesis

1. Identify 3-5 related seedling notes
2. Use [[Synthesis Workshop Template]]
3. Create new evergreen note from synthesis
4. Update original notes with connections

### System Optimization

- [ ] Review workflow friction points
- [ ] Update shortcuts and hotkeys
- [ ] Optimize folder structure if needed
- [ ] Back up vault

## Quarterly Routine (4 hours)

### Season Change Review

- [ ] Comprehensive vault statistics
- [ ] Major MOC restructuring if needed
- [ ] Learning roadmap update
- [ ] Tool and plugin audit

### Knowledge Harvest

1. **Quantitative Review**
   - Notes created vs. developed
   - Connection density
   - Tag usage patterns

2. **Qualitative Review**
   - Most valuable insights gained
   - Knowledge gaps identified
   - Learning trajectory assessment

3. **System Evolution**
   - What workflows to keep
   - What to experiment with next
   - Process documentation updates

## Maintenance Tools

### Quick Fixes

- **Broken Links**: Use Obsidian's built-in checker
- **Orphan Notes**: Check graph view for islands
- **Empty Notes**: Search for files < 100 chars
- **Duplicate Ideas**: Regular title searches

### Batch Operations

- **Tag Cleanup**: Use Tag Wrangler plugin
- **Bulk Rename**: Use Obsidian's file explorer
- **Template Updates**: Find & replace patterns

## Health Metrics

Track these monthly:

- Seeds → Seedlings conversion rate
- Average note connections
- Weekly note creation velocity
- Time spent in synthesis vs. capture

## Growth Indicators

Signs your garden is thriving:

- Unexpected connections emerging
- Old notes gaining new relevance
- Synthesis creating novel insights
- Reduced friction in workflows
- Excitement to explore and create

## Warning Signs

Time for intervention when:

- Piling up unprocessed seeds
- No new connections forming
- Avoiding the vault
- Only consuming, not creating
- System feels overwhelming

## Pro Tips

1. **Batch Similar Tasks**: Process all seeds at once
2. **Time Box**: Set timers to avoid perfectionism
3. **Start Small**: Better to maintain daily 5 min than skip weekly 30 min
4. **Automate**: Use templates and plugins
5. **Celebrate**: Acknowledge growth and insights

---

_Remember: The goal is sustainable knowledge growth, not perfect organization._
