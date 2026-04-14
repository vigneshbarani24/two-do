# Two-Do — User Manual

A short tour of every interaction, in the order you'll encounter them.

**Where to use it:** https://task-manager-eosin-sigma-40.vercel.app

---

## 1. The first screen

When you land, four seed tasks are already there:

- **Ship the task manager assessment** — a parent task, status "In progress".
  - *Wire the reducer and reconciliation* — done.
  - *Build the time-travel slider* — todo.
- **Review assessment walkthrough notes** — a standalone task at the top level.

Everything in the header tells you the state at a glance: the count of tasks, how many are done, and how many are in progress. At the bottom sits the time-travel slider — that's where the magic lives.

> **Tip.** Nothing is persisted. Refreshing the page returns you to these four seed tasks. The history you build up during a session lives in memory only.

---

## 2. Creating a task

### A top-level task

Click **"Add task"** in the header (top right). A dialog opens:

- **Title** — required. Empty submissions are rejected with an inline error.
- **Description** — optional. Multi-line.
- **Status** — defaults to *Todo*. Pick *In progress* or *Done* up front if you want.
- **Parent task** — defaults to *None (top-level)*. You can pick any existing task here to create this one as a subtask instead.

Press **Enter** or click **Add task** to save. **Esc** closes the dialog without saving.

### A subtask

Hover any task card. The `+` icon in its action row lets you add a subtask with that task pre-selected as parent. Faster than the full dialog when you know the parent.

---

## 3. Editing a task

Everything is inline. No "open a modal and scroll" friction.

### Title

Click the title. It becomes an input, pre-selected. Type. **Enter** saves. **Esc** reverts. Clicking away (blur) also saves. An empty title is treated as "cancel" — we never store empty titles, because every task needs a name to be findable.

### Description

Click the description text — or the faint **"+ Add description"** placeholder if none is set. A textarea appears, cursor at the end.

- **Blur** saves.
- **Cmd/Ctrl + Enter** saves.
- **Esc** reverts.
- Empty is allowed — a task without a description is fine.

### Status — the full set

Click the **⋯ (more)** icon on the card. A small menu shows the three statuses; the one currently set is disabled. Pick a different one and it updates instantly (and adds a step to your timeline).

### Status — the quick way

The **checkbox** on the left of every task is the one-click done toggle. It's bound to "done" specifically:

- If the task isn't done, clicking checks it → status becomes **Done**, and the previous status (todo or in-progress) is remembered.
- If the task *is* done, clicking unchecks it → status returns to whatever it was before you checked. So a task that was *in-progress* when you checked it will restore to *in-progress*, not reset to *todo*. This avoids the classic "I unchecked by mistake and lost my WIP signal" problem.

---

## 4. Reorganising — moving a task to a new parent

Click the **Move** icon (four arrows) on any task. A dialog opens with a single dropdown: the task's new parent. Pick one, or **None (top-level)** to promote it to the root.

The dropdown excludes:

- The task itself (you can't be your own parent).
- All of that task's descendants (you can't become a child of your own child — would create a cycle).

That's the cycle-prevention guardrail. If a task has no valid parent options (e.g. literally the only task), the dialog tells you so and lets you cancel or confirm top-level.

---

## 5. Deleting a task

Trash icon on the right of the card. The task disappears — but **its children do not**.

This is the core of Two-Do's design: children reference a parent, they don't belong to one. When the parent is deleted:

1. The task itself is removed from the map.
2. Any task whose `parentId` pointed at the deleted task has that pointer cleared.
3. Those former children now render at the top level with no "Subtask of" label and no indentation.
4. **Nothing else is lost.** Grandchildren stay nested under the (now top-level) middle parent.

Same rule applies when the deletion comes from a slider scrub or an undo of the parent's creation.

---

## 6. Time travel

Every action you take — every create, edit, delete, status change — becomes a snapshot on the timeline. The slider at the bottom is the main interface; the buttons and keyboard shortcuts are convenience wrappers.

### The slider

Drag the handle, or click anywhere on the track, to jump to that point in history. The app re-renders to exactly the state it had at that step. The label on the right shows **"Step N / Total."**

Scrubbing is non-destructive. Move back, look around, move forward again.

### Undo / Redo buttons

- **← (Undo)** — disabled when you're at step 1.
- **→ (Redo)** — disabled when you're at the latest step.

These are just "pointer minus one" and "pointer plus one" on the same timeline.

### Keyboard

- **Cmd/Ctrl + Z** — undo
- **Cmd/Ctrl + Shift + Z** — redo

These are ignored when your cursor is in an input or textarea, so **native text-editing undo still works** when you're editing a title or description. Escape the input first if you want to undo the last full action.

### Forking vs truncating

If you scrub back and then take a new action, the timeline **truncates** beyond that point. The "future" you left behind is discarded. This is standard redo-stack behavior — no forking, no branches.

> **Scenario.** You're at Step 20. You scrub back to Step 10. You create a new task. Now the timeline is Step 1 through Step 11, and Steps 11–20 from before are gone. The step counter shows "Step 11 / 11."

---

## 7. Everything on one card

Each task card shows:

| Element | Meaning |
|---|---|
| Left accent stripe | Status color — slate (todo), blue (in-progress), emerald (done) |
| Checkbox | Toggle done / restore previous status |
| Title | Click to inline-edit |
| Badge next to title | Current status in words |
| Description / "+ Add description" | Click to inline-edit |
| "Created 2h ago" | Relative timestamp from task creation |
| "· Subtask of X" | Only shown for children; names the parent |
| `+` action | Add a subtask with this as parent |
| Move action (four arrows) | Reassign parent |
| `⋯` action | Full status menu |
| Trash action | Delete (children detach) |

---

## 8. Keyboard reference

| Context | Keys | What happens |
|---|---|---|
| Global (outside text fields) | Cmd/Ctrl + Z | Undo |
| Global (outside text fields) | Cmd/Ctrl + Shift + Z | Redo |
| Dialog open | Esc | Close without saving |
| Form focus | Enter | Submit form |
| Inline title edit | Enter | Save |
| Inline title edit | Esc | Cancel |
| Inline description edit | Cmd/Ctrl + Enter | Save |
| Inline description edit | Esc | Cancel |
| Inside a text input | Cmd/Ctrl + Z | Native text-undo (not app-level undo) |

---

## 9. Troubleshooting

**The slider shows only one step and I can't scrub.**
You haven't taken any actions yet — the initial state is step 1 of 1. Create or edit anything and the slider becomes useful.

**I deleted a task and its subtasks disappeared too.**
They didn't. Look at the top level — they should be there, unnested. If they're genuinely missing, that's a bug; open an issue with steps to reproduce.

**I refreshed and everything's gone.**
That's intended. Two-Do has no persistence in v0.1. Refresh = reset to seed.

**The status dropdown doesn't open.**
Fixed in G3.5 (commit `9a5a1d4`). If you're on an older deployment, pull latest. If not, capture console errors and report.

**The "Created 2h ago" label doesn't update while I'm looking at it.**
Correct — it renders once per re-render of the card, not on a timer. Take any action or scrub the slider and it'll refresh.

---

## 10. Known limits

- No persistence. Refresh resets.
- No multi-user — only one browser tab has state.
- No undo beyond the current session's timeline.
- No drag-and-drop yet (next gate).
- No search, filter, or due dates (backlog).

See [`docs/prd.md` §11](./prd.md) for the full open-questions list.
