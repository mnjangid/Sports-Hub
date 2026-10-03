# Database Design

## 1. Overview

This document defines the proposed database architecture and schema for SportsHub Version 1.

SportsHub contains several strongly related entities such as users, teams, tournaments, matches, innings, and score events.

The database must maintain data consistency while supporting:

- User accounts
- Role-based permissions
- Sports and tournaments
- Teams and players
- Match scheduling
- Live cricket scoring
- Player statistics
- Team statistics
- Tournament standings
- Historical match data

---

# 2. Database Technology Decision

## Selected Database: PostgreSQL

SportsHub will use PostgreSQL as the primary database.

Although the developer has previous experience with MongoDB through the MERN stack, PostgreSQL is a better fit for SportsHub because the application contains many relationships between entities.

Examples include:

```text
User
  ↓
Team Membership
  ↓
Team
  ↓
Tournament
  ↓
Match
  ↓
Innings
  ↓
Score Events