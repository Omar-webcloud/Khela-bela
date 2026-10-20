import {describe, it, expect} from 'vitest';
import {newGame, play, legal} from '../lib/games/dots-and-boxes/engine';
import {pickMove} from '../lib/games/dots-and-boxes/computer';

describe('Dots and Boxes Engine', () => {
  it('initializes empty board with correct line count', () => {
    // 3x3 boxes has 4x4 dots
    // Horizontal lines: (3+1)*3 = 12
    // Vertical lines: 3*(3+1) = 12
    // Total lines = 24
    const s = newGame(3, 3);
    expect(s.R).toBe(3);
    expect(s.C).toBe(3);
    expect(s.lines).toHaveLength(24);
    expect(s.owner).toHaveLength(9);
    expect(s.done).toBe(false);
  });

  it('toggles turn when no box is completed', () => {
    const s = newGame(3, 3);
    expect(s.turn).toBe(0);

    const s2 = play(s, 0);
    expect(s2.lines[0]).toBe(true);
    expect(s2.turn).toBe(1); // turn switches
  });

  it('awards extra turn and claims box when 4th side is drawn', () => {
    // For box (0,0) with R=3, C=3:
    // Box sides are: top=0, bottom=3, left=12, right=13
    let s = newGame(3, 3);
    s = play(s, 0); // P1 draws top, turn -> P2
    s = play(s, 3); // P2 draws bottom, turn -> P1
    s = play(s, 12); // P1 draws left, turn -> P2

    // P2 draws right (side 13), completing the box!
    expect(s.turn).toBe(1);
    s = play(s, 13);

    expect(s.owner[0]).toBe(1);
    expect(s.scores[1]).toBe(1);
    expect(s.turn).toBe(1); // Bonus turn awarded to P2!
  });

  it('computer selects legal line for any difficulty level', () => {
    const s = newGame(2, 2);
    const legals = legal(s);

    const moveEasy = pickMove(s, 'easy');
    expect(legals).toContain(moveEasy);

    const moveMedium = pickMove(s, 'medium');
    expect(legals).toContain(moveMedium);

    const moveHard = pickMove(s, 'hard');
    expect(legals).toContain(moveHard);
  });
});
