# Frontend TODO: Task Restrictions & Flexible Deliverables

The backend has been updated to include task status restrictions and a new link-based deliverable system. Please implement the following changes in the frontend:

Modify the steps as needed as the AI has not checked the frontend structure

## 1. Task Status Restrictions
**Goal**: Restrict the task status dropdown/actions based on user assignment.

- [X] **Auth Check**: In the task details/list view, check if the current user is an assignee of the task OR has the `TEAM_LEAD` / `ADVISER` role.
- [X] **UI Update**: 
    - Disable or hide the "Status" dropdown if the user is not authorized to change it.
    - Add a tooltip or message explaining why the status change is disabled (e.g., "Only assigned members can change task status").
- [X] **Error Handling**: Gracefully handle `400/403` errors from the `PATCH /tasks/:id/status` endpoint if a user attempts an unauthorized update

## 2. Flexible Deliverables (Evidence)
**Goal**: Support both file uploads (PDF) and links (Figma, etc.) for deliverables.

- [ ] **New Upload Modal**:
    - Update the "Submit Evidence" modal to have two tabs or a toggle: **"Upload File"** and **"Submit Link"**.
    - **Upload File**: Keep the current file upload logic (`POST /evidence`).
    - **Submit Link**: Add a form with fields for `link` (required, URL) and `fileName` (optional display name). This should hit the new `POST /evidence/link` endpoint.
- [ ] **Evidence List**:
    - Update the evidence list to distinguish between `FILE` and `LINK` types.
    - Show an appropriate icon (e.g., a paperclip/file icon for files, an external link icon for links).
    - For links, change the action from "Download" to "Open Link" (opens in a new tab).
- [ ] **Types Update**:
    - Update the `Evidence` type/interface to include the new `type` field (`'FILE' | 'LINK'`).
    - Ensure `fileName` and `fileType` are treated as optional/nullable.

## API Reference
- **POST `/evidence/link`**:
    ```json
    {
      "deliverableId": "string (uuid)",
      "link": "string (url)",
      "fileName": "string (optional)"
    }
    ```
- **Task Status Endpoint**: `PATCH /tasks/:id/status` (now requires internal role validation).
