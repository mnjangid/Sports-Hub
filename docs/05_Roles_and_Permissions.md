# Roles and Permissions

## 1. Overview

This document defines the roles and permissions used in SportsHub Version 1.

The purpose of this document is to clearly define which users are allowed to access, create, update, or manage different parts of the system.

SportsHub follows a role-based access control model (RBAC).

A single registered user may receive additional roles or permissions without requiring the creation of a separate account.

---

# 2. Access Levels

SportsHub has four main access levels:

1. Guest
2. Registered User
3. Sports Coordinator
4. System Administrator

---

# 3. Guest

## Description

A Guest is an unauthenticated visitor who accesses SportsHub without logging in.

Guests can access publicly available sports information but cannot modify any system data.

## Permissions

Guests can:

- View live matches.
- View live scores.
- View upcoming matches.
- View completed match results.
- View tournament fixtures.
- View tournament standings.
- View teams.
- View player information.
- View player statistics.
- Search public sports information.

Guests cannot:

- Create or edit an account.
- Create tournaments.
- Manage teams.
- Update scores.
- Modify match schedules.
- Access coordinator dashboards.
- Access administrative features.

---

# 4. Registered User

## Description

A Registered User is a person who has created a SportsHub account and authenticated successfully.

A registered user has a persistent SportsHub identity and may later become a player, coordinator, or administrator.

## Permissions

A Registered User can:

- Access all public features available to Guests.
- View their own profile.
- Edit their own profile.
- Change their profile picture.
- Change their password.
- Log out of their account.

A Registered User cannot:

- Modify tournaments.
- Create teams.
- Add players to teams.
- Update live scores.
- Manage other users.
- Assign roles or permissions.

---

# 5. Sports Coordinator

## Description

A Sports Coordinator is a registered user who has been granted permission to manage one or more sports.

For example:

```text
User: Rahul

Assigned Sport:
Cricket