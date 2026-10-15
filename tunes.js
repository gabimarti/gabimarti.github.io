// PC speaker tunes shared by the BIOS Setup (PC Speaker Test) and MS-DOS (C:\MUSIC\MIDI, PLAY). Loaded on demand.
"use strict";
(() => {
  const { sfx } = GM;
  // PC speaker tunes: public-domain pieces heard in 90s games, one picked at random.
  // [title, game, seconds per unit, "NOTE[#]octave[:units] ...", R = rest]. Most were extracted from the flutetunes.com
  // MIDI transcriptions of the original scores (not from the games' arrangements); Korobeiniki, Jingle Bells,
  // Good King Wenceslas and the Toccata were written by hand. The Bach Menuet comes from the Mutopia Project MIDI
  // (Bach-Gesellschaft edition) and Night on Bald Mountain was read from its Mutopia LilyPond score (Chernov's piano score).
  const TUNES = [
    ["Korobeiniki", "Tetris, Game Boy 1989", .19, "E5:2 B4 C5 D5:2 C5 B4 A4:2 A4 C5 E5:2 D5 C5 B4:3 C5 D5:2 E5:2 C5:2 A4:2 A4:2 R:3 D5:2 F5 A5:2 G5 F5 E5:3 C5 E5:2 D5 C5 B4:2 B4 C5 D5:2 E5:2 C5:2 A4:2 A4:2"],
    ["Trepak (Tchaikovsky)", "Tetris, Game Boy 1989", .099, "G5 R G5 F#5 G5 R G5 R E5 R D5 R C5:2 E5 R D5 R D5 C#5 D5 R D5 R B4 R A4 R G4 R B4 D5 A4 R A4 D5 G4 R G4 D5 F#4 R F#4 D5 A4 R A4 D5 B4 R B4 D5 G4 R G4 D5 A4 R G4 R A4 D5 E5 F#5 G5 R G5 F#5 G5 R G5 R E5 R D5 R C5:2 E5 R D5 R D5 C#5 D5 R D5 R B4 R A4 R G4:4"],
    ["Kalinka (Larionov)", "Tetris, Tengen 1989", .063, "E5:8 D5:8 B4:4 C5:4 D5:8 B4:4 C5:4 D5:8 C5:4 B4:4 A4:8 E5:4 E5:4 D5:4 D5:4 B4:4 C5:4 D5:8 B4:4 C5:4 D5:8 C5:4 B4:4 A4:8 E5:8 D5:8 B4:4 C5:4 D5:8 B4:4 C5:4 D5:8 C5:4 B4:4 A4:8"],
    ["Galop Infernal, the Can-Can (Offenbach)", "Lemmings, 1991", .094, "G4:8 A4:2 C5:2 B4:2 A4:2 D5:4 D5:4 D5:2 E5:2 B4:2 C5:2 A4:4 A4:4 A4:2 C5:2 B4:2 A4:2 G4:2 G5:2 F#5:2 E5:2 D5:2 C5:2 B4:2 A4:2 G4:8 A4:2 C5:2 B4:2 A4:2 D5:4 D5:4 D5:2 E5:2 B4:2 C5:2 A4:4 A4:4 A4:2 C5:2 B4:2 A4:2 G4:2 D5:2 A4:2 B4:2 G4:4"],
    ["Dance of the Reed Flutes (Tchaikovsky)", "Lemmings, 1991", .19, "D5 C#5 D5 C#5 D5 R C#5 R E5 R D5 A5 F#6:4 G6 F#6 G6 F#6 E6 D6 A5 F#5 D5:4 C#6:4 B5 B4 B4 B4 B4 R A4 R B5 B4 B4 B4 B4 R A4 R D6 D5 D5 D5 D5"],
    ["Rondo alla Turca (Mozart)", "Lemmings, 1991", .119, "B4 A4 G#4 A4 C5 R:3 D5 C5 B4 C5 E5 R:3 F5 E5 D#5 E5 B5 A5 G#5 A5 B5 A5 G#5 A5 C6:4 A5 R C6 R G5 R A5 R G5 R A5 R G5 R A5 R G5 R A5 R G5 R A5 R G5 R F#5 R E5:4 B4 A4 G#4 A4 C5 R:3 D5 C5 B4 C5 E5 R:3 F5 E5 D#5 E5 B5 A5 G#5 A5 B5 A5 G#5 A5 C6:4 A5 R C6 R G5"],
    ["London Bridge Is Falling Down", "Lemmings, 1991", .163, "C5:3 D5 C5:2 A#4:2 A4:2 A#4:2 C5:4 G4:2 A4:2 A#4:4 A4:2 A#4:2 C5:4 C5:3 D5 C5:2 A#4:2 A4:2 A#4:2 C5:4 G4:4 C5:4 A4:2 F4:6"],
    ["Jingle Bells (Pierpont)", "Holiday Lemmings, 1993", .12, "E5:2 E5:2 E5:4 E5:2 E5:2 E5:4 E5:2 G5:2 C5:3 D5 E5:8 F5:2 F5:2 F5:3 F5 F5:2 E5:2 E5:2 E5 E5 E5:2 D5:2 D5:2 E5:2 D5:4 G5:4 E5:2 E5:2 E5:4 E5:2 E5:2 E5:4 E5:2 G5:2 C5:3 D5 E5:8 F5:2 F5:2 F5:3 F5 F5:2 E5:2 E5:2 E5 E5 G5:2 G5:2 F5:2 D5:2 C5:8"],
    ["Good King Wenceslas", "Holiday Lemmings, 1993", .078, "D5:4 D5:4 D5:4 E5:4 D5:4 D5:4 A4:8 B4:4 A4:4 B4:4 C#5:4 D5:8 D5:8 D5:4 D5:4 D5:4 E5:4 D5:4 D5:4 A4:8 B4:4 A4:4 B4:4 C#5:4 D5:8 D5:8 A5:4 G5:4 F#5:4 E5:4 F#5:4 E5:4 D5:8 B4:4 A4:4 B4:4 C#5:4 D5:8 D5:8"],
    ["Flight of the Bumblebee (Rimsky-Korsakov)", "Parodius Da!, 1990", .082, "E6 D#6 D6 C#6 D6 C#6 C6 B5 C6 B5 A#5 A5 G#5 G5 F#5 F5 E5 D#5 D5 C#5 D5 C#5 C5 B4 C5 B4 A#4 A4 G#4 G4 F#4 F4 E4 R:2 E5 D#5 D5 C#5 C5 F5 E5 D#5 E5 D#5 D5 C#5 C5 C#5 D5 D#5 E5 D#5 D5 C#5 C5 F5 E5 D#5 E5 D#5 D5 C#5 C5 C#5 D5 D#5 E5 D#5 D5 C#5 D5 C#5 C5 B4 C5 C#5 D5 D#5 E5 F5 E5 D#5 E5 D#5 D5 C#5 D5 C#5 C5 B4 C5 C#5 D5 D#5 E5 F#5 G5"],
    ["William Tell Overture (Rossini)", "Parodius Da!, 1990", .099, "B4 B4 B4 R B4 B4 B4 R B4 B4 E5 R F#5 R G#5 R B4 B4 B4 R B4 B4 E5 R G#5 G#5 F#5 R D#5 R B4 R B4 B4 B4 R B4 B4 B4 R B4 B4 E5:2 F#5:2 G#5:2 E5 G#5 B5:5 A5 G#5 F#5 E5:2 G#5:2 E5:2 B5 B5 B5:2 B5 B5 B5:2 B5 B5 E6:2 F#6:2 G#6:2 B5 B5 B5:2 B5 B5 E6:2 G#6 G#6 F#6:2"],
    ["Ode to Joy (Beethoven)", "Parodius Da!, 1990", .104, "F#5:4 F#5:4 G5:4 A5:4 A5:4 G5:4 F#5:4 E5:4 D5:4 D5:4 E5:4 F#5:4 F#5:6 E5:2 E5:8 F#5:4 F#5:4 G5:4 A5:4 A5:4 G5:4 F#5:4 E5:4 D5:4 D5:4 E5:4 F#5:4 E5:6 D5:2 D5:8"],
    ["In the Hall of the Mountain King (Grieg)", "Parodius, Game Boy 1991", .109, "B4 R C#5 R D5 R E5 R F#5 R D5 R F#5:2 R:2 F5 R C#5 R F5:2 R:2 E5 R C5 R E5:2 R:2 B4 R C#5 R D5 R E5 R F#5 R D5 R F#5 R B5 R A5 R F#5 R D5 R F#5 R A5:8 B5 R C#6 R D6 R E6 R F#6 R D6 R F#6:2 R:2 F6 R C#6 R F6:2 R:2 E6 R C6 R E6:2 R:2 B5 R C#6 R D6 R E6 R F#6 R D6 R F#6 R B6 R A6 R F#6 R D6 R F#6 R A6:8"],
    ["Maple Leaf Rag (Joplin)", "Earthworm Jim, 1994", .144, "D#4:2 G#4 G#4 D#5 G#4 C5 D#5:2 G4 D#5 G4 A#4 D#5:5 G#4 G#4 D#5 G#4 C5 D#5:2 G4 D#5 G4 A#4 D#5:3 R D#5 E4 G#4 B4 E5 R D#5 R D#5 E4 G#4 B4 E5 R D#5 R:2 G#4 G#4 B4 G#5 G#4 G#5 B5 G#6 G#4 G#4 B4 G#5 G#4 G#5 B5 G#6:4"],
    ["Ride of the Valkyries (Wagner)", "King Arthur's World, 1992", .1, "F#4 R B4:3 F#4 B4 R D5:6 B4:6 D5:3 B4 D5 R F#5:6 D5:6 F#5:3 D5 F#5 R A5:6 A4:6 D5:3 A4 D5 R F#5:12"],
    ["Toccata and Fugue in D minor (Bach)", "Fantasia, Mega Drive 1991", .07, "A5 G5 A5:20 R:4 G5:2 F5:2 E5:2 D5:2 C#5:12 D5:24 R:8 A4 G4 A4:20 R:4 E4:4 F4:4 C#4:4 D4:24 R:8 A3 G3 A3:20 R:4 G3:2 F3:2 E3:2 D3:2 C#3:12 D3:24"],
    ["Dance of the Hours (Ponchielli)", "Fantasia, Mega Drive 1991", .16, "G#4 B4 B4 C#5 R:4 C#5 E5 E5 D#5 R:4 B4 C#5 C#5 D#5 R:4 D#5 A5 A5 G#5 R:4 G#5 E6 E6 D#6 R:4 D#5 C#6 C#6 B5 R:4 B4 G#5 G#5 F#5:4"],
    ["Menuet, French Suite No. 3 (Bach)", "Tetris, Game Boy 1989", .19, "D5 F#5 B5 F#5 C#5 F#5 D5 F#5 B4 F#5 A#4 F#5 B4 F#5 B5 F#5 C#5 F#5 D5 F#5 B4 F#5 A#4 F#5 D5 F#5 D5 B4 G5 E5 C#5 E5 C#5 A4 F#5 D5 B4 F#5 E5 D5 C#5 B4 A#4 F#4 A#4 C#5 F#5 E5 D5 F#5 B5 F#5 C#5 F#5 D5 F#5 B4 F#5 A#4 F#5 B4 F#5 B5 F#5 C#5 F#5 D5 F#5 B4 F#5 A#4 F#5 D5 F#5 D5 B4 G5 E5 C#5 E5 C#5 A4 A5 E5 F#5 A5 F#5 D5 A4 C#5 D5:6"],
    ["Dance of the Little Swans (Tchaikovsky)", "Lemmings, 1991", .13, "A5 R A5 R A5 R A5:3 G#5 B5 R A5 R G#5 R B5 R B5 R B5 R B5:3 A5 C#6 R B5 R A5 R C#6 R F#6 R F6 R C#6:10 C#6 R F#6 R F6 R C#6:10 A5 R A5 R A5 R A5:3 G#5 B5 R A5 R G#5 R B5 R B5 R B5 R B5:3 A5 C#6 R B5 R A5 R C#6 R F#6 R F6 R C#6:10 C#6 R F#6 R F6 R C#6:10"],
    ["Night on Bald Mountain (Mussorgsky)", "Fantasia, Mega Drive 1991", .017, "A5:8 G#5:8 A5:8 A#5:8 A5:8 G#5:8 A5:8 G#5:8 A5:8 A#5:8 A5:8 G#5:8 A5:8 G#5:8 A5:8 A#5:8 A5:8 G#5:8 A5:8 G#5:8 A5:8 A#5:8 A5:8 G#5:8 A5:8 G#5:8 A5:8 A#5:8 A5:8 G#5:8 A5:8 G#5:8 A5:8 A#5:8 A5:8 G#5:8 A5:8 G#5:8 A5:8 A#5:8 A5:8 G#5:8 A5:8 G#5:8 A5:8 A#5:8 A5:8 G#5:8 "
      + "A5:6 G#5:6 A5:6 G#5:6 A5:15 A#5:3 C6:3 D6:3 D#6:39 D6:3 C6:3 A#5:3 A5:6 G#5:6 A5:6 G#5:6 A5:15 B5:3 C6:3 D6:3 E6:39 D6:3 C6:3 B5:3 "
      + "A5:8 G#5:8 A5:8 A#5:8 A5:8 G#5:8 A5:8 G#5:8 A5:8 A#5:8 A5:8 G#5:8 A5:8 G#5:8 A5:8 A#5:8 A5:8 G#5:8 A5:8 G#5:8 A5:8 A#5:8 A5:8 G#5:8 "
      + "A5:6 G#5:6 A5:6 G#5:6 A5:12 A#5:3 C6:3 D6:3 E6:3 F6:36 E6:3 D6:3 C6:3 A#5:3 A5:6 G#5:6 A5:6 G#5:6 A5:12 B5:3 C6:3 D6:3 E6:3 F#6:36 E6:3 D6:3 C6:3 B5:3 "
      + "A5:8 G#5:8 A5:8 A#5:8 A5:8 G#5:8 A5:8 G#5:8 A5:8 A#5:8 A5:8 G#5:8"],
  ];
  const SEMI = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  function play([, , step, notes]) {                    // schedules the whole tune; returns [stop function, length in s]
    let t = 0; const osc = [];
    for (const n of notes.split(" ")) {
      const [note, len = 1] = n.split(":");
      if (note !== "R") osc.push(sfx.tone(440 * 2 ** ((SEMI[note[0]] + (note[1] === "#") + (note.at(-1) - 4) * 12) / 12), len * step * .9, "square", .04, t));
      t += len * step;
    }
    return [() => osc.forEach(o => o?.stop()), t];
  }
  // 8.3 names of the .MID files in MS-DOS, in the same order as TUNES
  const NAMES = ["KOROBEIN", "TREPAK", "KALINKA", "CANCAN", "REEDFLUT", "RONDO", "LONDONBR", "JINGLEB", "WENCESLS", "BUMBLEBE", "WILLTELL", "ODETOJOY", "MOUNTKNG", "MAPLELF", "VALKYRIE", "TOCCATA", "HOURS", "MENUET", "SWANS", "BALDMTN"];
  // the 10-15 party tune (dos.js, shell.js), kept out of the list: the Hill sisters' 1893 melody, public domain
  const PARTY = ["Good Morning to All (Hill, 1893)", "", .1, "G4:3 G4 A4:4 G4:4 C5:4 B4:8 G4:3 G4 A4:4 G4:4 D5:4 C5:8 G4:3 G4 G5:4 E5:4 C5:4 B4:4 A4:8 F5:3 F5 E5:4 C5:4 D5:4 C5:8"];
  GM.tunes = { list: TUNES.map((t, i) => ({ title: t[0], game: t[1], file: NAMES[i] + ".MID", tune: t })), play, party: PARTY };
})();
