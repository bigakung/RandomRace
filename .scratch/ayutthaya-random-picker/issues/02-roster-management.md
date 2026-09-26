# 02 — Full Roster management

**What to build:** The user can manage the **Roster** comfortably: each **Participant** row shows its number, can be edited in place or deleted, and there is a clear-all action. Duplicate names are allowed but flagged. Pasting is forgiving and capped at 50 with a notice.

**Blocked by:** 01 — Walking skeleton.

**Status:** done

- [x] Each row shows #n (position number), name, edit and delete controls, all keyboard-operable with aria-labels
- [x] Editing a name to empty/whitespace is rejected with a Thai message; the previous name is kept
- [x] Duplicate names are kept, numbered distinctly and marked with a "ชื่อซ้ำ" badge; Start is not blocked
- [x] Paste splits on any newline style (\n, \r\n, \r), trims, drops blank lines
- [x] A paste that would exceed 50 Participants keeps the first 50 and shows how many names were dropped
- [x] Clear all empties the Roster; the empty state shows a hint on how to begin
- [x] Participant count and the 2–50 limit are visible; Start disabled with an explanation below 2
- [x] Numbers renumber after deleting an earlier Participant
- [x] Tests via `PickerSession`: trimming, blank removal, mixed newlines, >50 cap + dropped count, empty-edit rejection, duplicates flagged, delete/clear behaviour, garbage paste (only whitespace/separators) does not crash

**Notes:** Duplicate detection ignores letter case. Because the Roster is capped on entry, the start-time "too many" check was removed as unreachable. Clear all uses the browser confirm dialog; 06 may replace it with the shared confirmation dialog. Not committed — the folder is not a git repo yet.
