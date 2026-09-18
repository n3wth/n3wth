---
title: "System Design"
description: "Overview of system design concepts: architecture patterns, scalability, reliability, and the design process"
---

# System Design

## Overview

System design principles and patterns for building scalable applications.

## Key Concepts

### Architecture Patterns

- Microservices
- Monolithic
- Serverless
- Event-driven

### Scalability

- Horizontal vs Vertical scaling
- Load balancing
- Caching strategies
- Database sharding

### Reliability

- Fault tolerance
- Redundancy
- Monitoring
- Disaster recovery

<figure class="research-figure">
<a class="research-figure-image" href="/figures/frameworks/system-design.svg" aria-label="Open full-size graphic: Fail fast while a dependency recovers"><img src="/figures/frameworks/system-design.svg" alt="Closed permits calls until a failure threshold opens the circuit. Open rejects calls. After a reset timeout, half-open permits a trial; success returns to closed and failure returns to open and restarts the timeout." width="960" height="830" loading="lazy" decoding="async" /></a>
<figcaption>Conceptual circuit-breaker state machine illustrating fault tolerance. Thresholds and retry timing depend on the system; the diagram supplies no measured performance claims or default settings. Original diagram based on <a href="https://martinfowler.com/bliki/CircuitBreaker.html">Martin Fowler, Circuit Breaker</a>.</figcaption>
</figure>

## Design Process

1. Requirements gathering
2. Capacity estimation
3. System interface design
4. Data model design
5. High-level design
6. Detailed design
7. Scalability considerations

## Related Topics

- [[Career Journey]]
- [[Technical Skills]]
- [[Interview Preparation]]
- [[Software Engineering]]
