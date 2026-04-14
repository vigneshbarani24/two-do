# Technical Assessment: AI-First Collaborative Task Manager (TimeTravel State)

## Overview

This assessment is designed for engineers who actively leverage AI-assisted development ("vibe coding") to build products quickly and thoughtfully.

You will build a collaborative task manager with a real-time "time-travel" capability. We are specifically evaluating how effectively you use AI tools while maintaining control over system design, correctness, and state management.

- **Duration:** 90 minutes
- **Format:** Live coding + walkthrough
- **AI usage:** Encouraged. You will be evaluated on HOW you use it.

## Objective

Build a collaborative task manager that supports:

- Creating and managing tasks
- Parent-child task relationships
- Undo/redo using a "time-travel" slider

**Key challenge:** When a parent task is undone, the system must reconcile all dependent child tasks without breaking state.

## Core Requirements

### 1. Task Management

- Create, list, and update tasks

### 2. Task Dependencies

- Support parent-child relationships
- A parent may have multiple children

### 3. Time-Travel State

- Undo/redo functionality
- Slider or control to navigate history

### 4. Dependency Handling (Critical)

- Undoing a parent must not corrupt state
- You must define and implement a consistent strategy:
  - Delete children
  - Detach them
  - Mark invalid

## AI Usage Expectations

You are encouraged to use AI tools. We will assess:

- How you prompt and guide AI
- Whether you validate generated code
- Your ability to simplify or refactor AI output
- Your understanding of the final system

You should be able to clearly explain any code you use.

## What We're Looking For

- Fast iteration with clear prioritization
- Strong state modeling (history + dependencies)
- Practical handling of edge cases
- Clear reasoning and communication
- Ownership of AI-generated code

## During the Session

Please:

- Think aloud while building
- Use AI tools as you normally would
- Focus on getting a working core system first
- Make reasonable assumptions without waiting for approval

## Final Walkthrough

Be ready to explain:

- Your state model (how time-travel works)
- How dependencies are handled during undo
- What AI helped with vs what you changed
- What you would improve next

We are particularly interested in how you balance speed, correctness, and clarity while using AI.