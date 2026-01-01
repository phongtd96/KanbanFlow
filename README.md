# KanbanFlow

KanbanFlow is a lightweight task management system based on the Kanban methodology.
The system helps users visualize work, limit work-in-progress (WIP), and track progress
through a burndown report.

This project is designed as a backend-focused software engineering project,
following real-world development practices.

---

## 1. Project Overview

KanbanFlow allows a user to manage projects and tasks using a Kanban board.
Tasks move through defined workflow states, with strict business rules applied
to ensure data consistency and effective work management.

The system focuses on:
- Clear workflow visualization
- Work-In-Progress (WIP) limitation
- Task ordering and prioritization
- Progress tracking via burndown reporting

---

## 2. Scope

- Single-user system
- Backend API–first design
- Frontend is optional and can be integrated later
- Designed for learning and portfolio demonstration purposes

---

## 3. Core Features

### 3.1 Project Management
- Create a project
- Rename a project
- Delete a project

### 3.2 Task Management
- Create a task
- Update task details
- Delete a task
- Assign tasks to a project

### 3.3 Kanban Board
- View tasks in Kanban columns
- Drag and drop tasks between columns
- Reorder tasks within the same column
- Enforce WIP limit on the "Doing" column

### 3.4 Task Attributes
- Priority (1–5)
- Tags
- Due date

### 3.5 Search & Filter
- Filter tasks by tag
- Filter tasks by due date
- Sort tasks by priority or order

### 3.6 Reporting
- Generate a burndown report showing remaining tasks over time

---

## 4. Kanban Workflow

The Kanban board consists of three columns: To Do → Doing → Done


### Workflow Rules
- Tasks must move from left to right
- Direct transition from `To Do` to `Done` is not allowed
- Tasks in `Done` are considered completed

---

## 5. Work In Progress (WIP) Limit

- The "Doing" column has a WIP limit of **5 tasks**
- If the WIP limit is reached:
  - No additional tasks can be moved into "Doing"
  - The system returns a validation error

---

## 6. Data Model

### Project
- id
- name

### Task
- id
- title
- status (todo / doing / done)
- order (position within a column)
- priority (1–5)
- tag
- due_date
- project_id

---

## 7. Business Rules

- Each task belongs to exactly one project
- Task ordering is maintained separately for each column
- Reordering tasks updates the order of affected tasks
- When a task is deleted, remaining tasks are reordered
- WIP limit is always validated before moving a task into "Doing"

---

## 8. Edge Cases Considered

- Deleting a task in the middle of a column
- Moving a task between columns when ordering exists
- Reordering tasks within the same column
- Attempting to exceed the WIP limit
- Generating burndown data when no tasks are completed

---

## 9. Technical Stack (Planned)

- Backend: Python (FastAPI)
- Database: MySQL (Azure Database for MySQL)
- ORM: SQLAlchemy
- Testing: Pytest
- Deployment: Azure App Service

---

## 10. Testing Strategy

The project includes unit tests to validate:
- Task ordering logic
- Drag-and-drop behavior
- WIP limit enforcement
- Filtering and searching logic
- Burndown report calculations

Minimum target: **10 test cases**

---

## 11. Future Improvements

- Multi-user support
- Authentication and authorization
- Frontend Kanban UI
- Activity logs and audit trail

---

## 12. Author

KanbanFlow is developed as a learning and portfolio project,
demonstrating practical software engineering skills.


