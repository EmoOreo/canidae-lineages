# Simulator Design Package Review Roadmap

## Purpose

This roadmap defines who should review Canidae Lineages as the simulator becomes more biologically realistic. It is separate from the code roadmap and should be included in the future simulator design package.

## Review Strategy

You do not need a full scientific panel immediately. Use staged review.

### Stage 1 — Near-Term Review

Use:

- 1 veterinary student
- 1 animal science student

Best for reviewing:

- canine health realism
- breeding assumptions
- litter and fertility modeling
- congenital defects
- inbreeding consequences
- pedigree and population-management realism

### Stage 2 — Genetics Review

Use after the genetics layer is more mature, especially after chromosome/linkage work:

- 1 genetics graduate student

Best for reviewing:

- quantitative genetics
- polygenic trait modeling
- locus design
- inheritance abstractions
- linkage/crossover assumptions
- mutation modeling

### Stage 3 — Final Scientific Audit

Use once the simulator is near a stable 95% realism target:

- 1 veterinary geneticist or professional geneticist

Best for reviewing:

- subtle inheritance errors
- disease architecture
- breed/population genetics
- congenital anomaly realism
- scientific credibility before public release or Project Genesis reuse

## Design Package Contents

The review packet should include:

1. Executive Overview
2. System Architecture Document
3. Current Genetics Rules
4. Developmental Biology Specification
5. Health System Specification
6. Extinct Reconstruction Notes
7. Reproduction and Litter Rules
8. Population Genetics Notes
9. Reviewer Prompt Sheet
10. Known Abstractions / Gameplay Compromises

## Core Reviewer Prompt

You are acting as a scientific advisor for a realistic canid genetics simulator.

The simulator models domestic dogs, wolves, coyotes, foxes, dire wolves, extinct canids, and hybrids. It includes genotype inheritance, phenotype resolution, polygenic health, fertility, pregnancy, litter generation, inbreeding, developmental stability, congenital anomaly generation, and extinct DNA reconstruction.

Review the attached architecture and identify:

1. Missing biological systems
2. Unrealistic assumptions
3. Incorrect genetics
4. Missing developmental biology
5. Missing reproductive biology
6. Missing health systems
7. Missing population genetics
8. Missing evolutionary systems

For every issue, explain why it is biologically inaccurate, rate severity as minor/moderate/major, and recommend an architecture-safe improvement. Avoid recommending a full rewrite unless absolutely necessary.

## Library Note

This roadmap should be preserved for the later `CANIDAE_LINEAGES_REALISM_REVIEW_PACKET_v1.0.md` and the Project Genesis `DRM_GENETICS_ENGINE_v2_SPECIFICATION` handoff.
