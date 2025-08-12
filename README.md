# CampusConnect — Frontend

CampusConnect is a lightweight, accessible front-end interface for exploring a campus.  
It features a searchable UI, floor navigation sidebar, and clearly labeled explore cards (Class, Department, Faculties).

## Features

- **Responsive Navigation Bar**
  - Semantic header with branding.
  - Accessible menu button that opens a sidebar.

- **Search Interface**
  - Search bar with proper form semantics.
  - Screen-reader-friendly label (visually hidden) and submit affordance.

- **Sidebar Floor Navigation**
  - Slide-in sidebar triggered by the menu button.
  - Floor links (Floor 1–4) with placeholder handlers (to be wired to map logic).
  - Multiple close mechanisms: close button, outside click, Escape key.
  - Focus management and background scroll lock for accessibility.

- **Explore Section**
  - Unified “explore-card” components for Class, Department, and Faculties.
  - Icons with alt text and accessible link labels.
