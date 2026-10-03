# Domain Model

## 1. Overview

This document defines the major entities and relationships within SportsHub Version 1.

The domain model represents the real-world concepts that SportsHub needs to manage.

It acts as a bridge between the requirements/user stories and the database design.

Version 1 focuses on managing cricket tournaments for a single university while keeping the model extensible for additional sports and future features.

---

# 2. Core Domain

The core SportsHub domain can be represented as:

```text
University
    │
    └── Sports
          │
          └── Tournaments
                │
                ├── Teams
                │     │
                │     └── Users (Players)
                │
                └── Matches
                       │
                       └── Score / Match Events