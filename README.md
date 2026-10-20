# KhelaBela — Local-Only Game Collection
## Revised Product Requirements Addendum v3.0

### 1. Final Product Direction

KhelaBela is a browser-based collection of traditional Bangladeshi paper games that runs entirely on the user's device.

**Core decisions:**
- No user accounts or authentication.
- No backend, API server, or cloud database.
- No Bluetooth or online multiplayer.
- No mandatory internet connection after initial loading and caching.
- All game rules and computer opponents run in the browser.
- Game settings, progress, and history are stored locally.
- Players can play against the computer or use local pass-and-play with friends.
- Bangla and English interfaces are supported.

### 2. Game Modes

Every game supports the following modes where applicable.

**Mode A: Play Against Computer**
- The user plays against a built-in computer opponent.
- Difficulty settings are available where appropriate.
- Computer decisions are calculated locally.
- No external AI API or paid AI service is used.

**Mode B: Local Pass-and-Play**
- Multiple people share the same device.
- Players take turns using the same screen.
- Chor Police includes a private role-reveal and handoff screen.

**Mode C: Solo Practice**
- Players can practice rules, explore moves, or play without competition.
- Practice results are optional and can be excluded from match history.

### 3. Game-Specific Computer Opponents

#### 3.1 Paper Cricket — কলম ক্রিকেট

- The computer acts as the opposing player.
- Each delivery resolves to a valid configured outcome.
- The computer's batting and bowling actions follow the same rules as the human player.
- Outcome generation is performed locally.
- The interface animates the pen spin independently of the resolved result.
- Difficulty settings may adjust the computer's strategy only where the game rules permit strategic decisions. Difficulty must not secretly change the configured outcome probabilities.

**Acceptance criteria:**
- Every delivery produces one valid outcome.
- Runs, wickets, and innings are recorded correctly.
- Computer and human turns follow the same rules.
- The match ends correctly and identifies the winner.

#### 3.2 Chor Police — চোর-পুলিশ

- The user can play against three computer-controlled players.
- The four roles are assigned locally, once per round.
- The computer follows the configured role rules and scoring system.
- When the human receives a secret role, a private reveal screen displays it.
- When the human is the Police, computer-controlled opponents are assigned the remaining roles.
- When the computer is the Police, its guess is determined by the selected difficulty and game rules.

**Acceptance criteria:**
- Each configured role is assigned exactly once.
- Role assignments remain consistent for the entire round.
- The computer can submit only valid guesses.
- The scoring system is applied exactly once per round.
- All roles are revealed at the appropriate phase.

#### 3.3 Dots and Boxes — কাগজে কাটাকাটি

- The user plays against a computer opponent.
- The computer selects legal, unclaimed lines.
- The same square-completion and extra-turn rules apply to both players.
- Difficulty settings determine the computer's move-selection strategy.

**Difficulty presets:**
- Easy: Selects from legal moves with limited strategic planning.
- Medium: Prioritizes immediate box completion and avoids obvious opportunities for the opponent.
- Hard: Uses deeper move evaluation and endgame strategy, within reasonable browser performance limits.

**Acceptance criteria:**
- The computer never selects an occupied line.
- Completed boxes are awarded correctly.
- Extra turns work correctly.
- The match ends only when the board is complete.
- Human and computer scores match the claimed boxes.

### 4. Local-Only Technical Architecture

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Game engines | Pure TypeScript modules |
| Computer opponents | Local deterministic algorithms and rule-based decision logic |
| Structured persistence | IndexedDB |
| Preferences | localStorage |
| Offline support | PWA manifest and service worker |
| Unit testing | Vitest |
| Browser testing | Playwright |

No WebSocket server, Socket.IO, PostgreSQL, Prisma, Redis, authentication provider, or external AI API is required.

### 5. Local Data Storage

**localStorage stores:**
- Language preference.
- Sound and animation settings.
- Preferred computer difficulty.
- Lightweight interface preferences.

**IndexedDB stores:**
- Saved and unfinished matches.
- Completed match summaries.
- Local game history.
- Custom rule presets.
- Optional local statistics.

All stored data remains within the browser's local storage for the site's origin. It is not automatically synchronized between devices.

### 6. Computer Opponent Architecture

Each game uses its own computer decision module.

```text
src/
  lib/
    games/
      paper-cricket/
        engine.ts
        computer.ts
        rules.ts

      chor-police/
        engine.ts
        computer.ts
        roles.ts
        scoring.ts

      dots-and-boxes/
        engine.ts
        computer.ts
        strategy.ts

    storage/
      database.ts
      matches.ts
      preferences.ts

    offline/
      cache-config.ts
```

The game engine validates and applies moves. The computer module selects an action from the available legal actions. Computer decisions must not bypass the game engine or alter scores directly.

### 7. Offline Requirements

- Cache the application shell, game code, fonts, and required assets.
- Support gameplay after the application has been loaded and cached successfully.
- Display a clear message if the user attempts to open the application before its assets are available offline.
- Restore valid unfinished matches when the browser retains local storage.
- Handle storage quota errors and corrupted records safely.
- Do not make gameplay dependent on analytics, remote APIs, or external AI services.
- Explain that clearing browser data can delete saved matches.

### 8. Updated Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Home page with three game cards | P0 |
| FR-02 | No authentication or account creation | P0 |
| FR-03 | Responsive mobile and desktop interface | P0 |
| FR-04 | Local pass-and-play | P0 |
| FR-05 | Play against computer | P0 |
| FR-06 | Paper Cricket game engine | P0 |
| FR-07 | Chor Police role and scoring engine | P0 |
| FR-08 | Dots and Boxes game engine | P0 |
| FR-09 | Bangla and English interface | P0 |
| FR-10 | Local settings and match history | P0 |
| FR-11 | Offline gameplay after caching | P0 |
| FR-12 | Rematch and replay | P0 |
| FR-13 | Computer difficulty settings | P1 |
| FR-14 | Configurable house rules | P1 |
| FR-15 | JSON export and import | P2 |

### 9. Updated Release Checklist

- All three games are playable against the computer.
- Local pass-and-play works without internet access.
- Computer opponents use legal actions and correct game rules.
- Chor Police secret roles remain hidden until their proper reveal phase.
- Dots and Boxes difficulty levels select valid moves.
- Paper Cricket outcomes follow the configured probability distribution.
- Settings and game history persist locally.
- Unfinished matches can be restored when valid saved state exists.
- Offline functionality works after successful initial caching.
- No account, backend, database server, Bluetooth, or external AI service is required.
- Mobile and desktop interfaces pass testing.

### Final Product Decision

KhelaBela will be a local-first browser game collection with computer opponents and optional same-device multiplayer. All gameplay and computer decisions run in the browser, and all persistent game data stays on the user's device.

The goal is to let anyone open the game, choose Paper Cricket, Chor Police, or Dots and Boxes, and start playing without registration, network-dependent gameplay, or setup friction.
