# Requirements

## Overview

This document defines the functional and non-functional requirements for **SportsHub Version 1**.

SportsHub is a centralized sports tournament management platform initially designed for a single university. The primary goal of Version 1 is to digitize tournament management and provide real-time sports updates while keeping the architecture scalable for future expansion.

This document focuses on **what the system should do**, independent of implementation technologies.

---

# 1. Functional Requirements

## 1.1 Authentication & User Management

### Guest Users

Guests shall be able to access SportsHub without creating an account.

Guests can:

- View live scores.
- View tournament fixtures.
- View match schedules.
- View completed match results.
- View tournament standings.
- View player statistics.
- Search players.
- Search teams.
- Search tournaments.

Guests shall not be allowed to modify any system data.

---

### Registered Users

Users shall be able to register using:

- Email Address
- Password

After registration, users shall complete their profile by providing:

- Full Name
- Roll Number
- Department
- Academic Year
- Profile Photo (Optional)
- Phone Number (Optional)

Each registered user shall have a single SportsHub profile throughout their university journey.

Future versions may support:

- Google Sign-In
- University Single Sign-On (SSO)

---

### User Roles

The system shall support the following roles:

- Guest
- Registered User
- Sports Coordinator
- University Administrator

A registered user's permissions may change over time without creating a new account.

Examples:

Registered User → Cricket Player

Registered User → Sports Coordinator

Registered User → University Administrator

---

## 1.2 Profile Management

Registered users shall be able to:

- View their profile.
- Edit personal information.
- Change profile picture.
- Change password.

Future versions may include:

- Personal achievements
- Sports history
- Favourite teams
- Favourite players

---

## 1.3 University Management

Version 1 is designed for a single university.

The system shall allow administrative users to:

- Configure university information.
- Update university details.
- Upload university logo.

Although Version 1 supports only one university, the architecture shall allow future support for multiple universities.

---

## 1.4 Sports Management

Administrative users shall be able to:

- Create sports.
- Update sports.
- Disable sports.
- Assign Sports Coordinators.
- Remove Sports Coordinators.

Examples:

- Cricket
- Football
- Kabaddi
- Volleyball
- Basketball

---

## 1.5 Tournament Management

Sports Coordinators shall be able to:

- Create tournaments.
- Edit tournament details.
- Publish tournaments.
- Archive tournaments.
- View previous tournaments.

Each tournament shall contain:

- Tournament Name
- Sport
- Tournament Format
- Description
- Start Date
- End Date
- Status

Tournament Status:

- Upcoming
- Ongoing
- Completed
- Archived

---

## 1.6 Team Management

Sports Coordinators shall be able to:

- Create teams.
- Edit teams.
- Delete teams.
- Search registered users.
- Add registered users to teams.
- Remove users from teams.
- Assign captain.
- Assign vice-captain.

The system shall prevent duplicate team members.

---

## 1.7 Player Management

Players shall not have separate accounts.

Instead, a Player is a Registered User who has been assigned to a team.

Sports Coordinators shall be able to:

- Search registered users.
- Add users to tournament teams.
- Remove users from teams.
- Assign jersey numbers.
- Mark captain/vice-captain.

Player information shall automatically be retrieved from the user's profile.

---

## 1.8 Match Management

Sports Coordinators shall be able to:

- Schedule matches.
- Edit schedules.
- Postpone matches.
- Cancel matches.
- Change venues.
- Assign participating teams.
- Publish fixtures.

Match Status:

- Upcoming
- Live
- Completed
- Cancelled
- Postponed

---

## 1.9 Live Scoring

Sports Coordinators shall be able to:

- Start matches.
- Update scores.
- Update overs.
- Update wickets.
- Record extras.
- End innings.
- Finish matches.

Guests and Registered Users shall receive score updates in near real-time.

---

## 1.10 Statistics

The system shall automatically maintain:

### Team Statistics

- Matches Played
- Wins
- Losses
- Points
- Net Run Rate (Cricket)

### Player Statistics

- Matches Played
- Runs
- Wickets
- Strike Rate
- Economy Rate
- Highest Score
- Best Bowling Figures

---

## 1.11 Search

The system shall support searching for:

- Players
- Teams
- Sports
- Matches
- Tournaments

---

## 1.12 Tournament History

The system shall preserve historical records including:

- Tournament Winners
- Runner-up
- Match Results
- Team Statistics
- Player Statistics
- Tournament Standings

Historical records shall remain accessible after tournament completion.

---

# 2. Non-Functional Requirements

## 2.1 Performance

The system shall:

- Load pages quickly.
- Display live score updates with minimal delay.
- Support multiple users viewing live matches simultaneously.
- Handle concurrent score updates safely.

---

## 2.2 Security

The system shall:

- Store passwords securely.
- Restrict score updates to authenticated Sports Coordinators.
- Restrict administrative functions to authorized administrators.
- Prevent unauthorized modification of data.

---

## 2.3 Reliability

The platform shall remain operational during tournaments.

Temporary network interruptions should not result in loss of match data.

---

## 2.4 Scalability

The architecture shall support future expansion to:

- Multiple Universities
- Multiple Sports
- Mobile Applications
- Larger User Base

without requiring major redesign.

---

## 2.5 Usability

The application shall:

- Be simple enough for first-time users.
- Allow Sports Coordinators to update live scores quickly.
- Provide an intuitive interface for tournament management.
- Work well on desktop, tablet, and mobile browsers.

---

## 2.6 Maintainability

The application shall follow a modular architecture to simplify future development, testing, and maintenance.

---

## 2.7 Availability

The platform shall remain available during live matches and tournament finals, where user traffic is expected to be significantly higher.

---

# 3. Version 1 Scope

Version 1 includes:

- Single University
- Cricket Support
- Guest Access
- User Registration
- User Profiles
- Role-Based Authentication
- Sports Coordinator Dashboard
- Tournament Management
- Team Management
- Player Management
- Match Scheduling
- Live Scoring
- Player Statistics
- Team Statistics
- Tournament History
- Search Functionality

---

# 4. Out of Scope (Future Versions)

The following features are intentionally excluded from Version 1:

- AI-Assisted Tournament Scheduling
- Drag-and-Drop Fixture Planner
- Push Notifications
- Mobile Applications (Android/iOS)
- Multiple University Support
- Google Sign-In
- University SSO
- Online Sports Trial Registration
- Coach Portal
- Referee Portal
- Live Streaming Integration
- AI Match Summaries
- Performance Analytics Dashboard
- Digital Certificates
- Sports Achievement Timeline

---

# 5. Business Rules

- A registered user shall have only one SportsHub account.
- A registered user may participate in multiple sports.
- A Sports Coordinator may manage only the sports assigned to them.
- A user shall not appear twice in the same team.
- A match cannot begin until both participating teams are assigned.
- Tournament history shall not be deleted after completion.
- Guests shall have read-only access to public information.