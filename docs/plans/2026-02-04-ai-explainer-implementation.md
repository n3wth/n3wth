# AI Safety Explainer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive AI safety challenge section with three decision scenarios and animated consequence visualizations.

**Architecture:** Data-driven component system with state management hook. Three challenges flow through state machine: idle → user chooses → calculate outcomes → animate visualization. GSAP ScrollTrigger reveals section on scroll. SVG visualizations for decision tree, Pareto graph, and feedback loop.

**Tech Stack:** React 18, TypeScript, GSAP (ScrollTrigger), Tailwind CSS, SVG graphics
