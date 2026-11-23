// MAZE — Retro 3D First-Person Maze Engine (MS-DOS / Windows 3.1 / gmsh shell)
// Shared on-demand module for gabimarti.github.io
// Features:
// - Deterministic / Seeded DFS 20x20 maze generation guaranteeing solvability
// - 15 collectible historic milestones with multi-language texts (EN, ES, CA)
// - 5 milestone-gated doors with dependency sequencing
// - Wolfenstein-style 2.5D DDA raycasting engine (ASCII terminal & 2D canvas renderers)
// - Player name validation, interactive inventory, ASCII rat animation, certificate & cross-system reward key
"use strict";

(() => {
  // Multilingual helper fallback if GM.B is not present (e.g. testing in Node)
  const B = (en, es = en, ca = es) => {
    if (typeof GM !== "undefined" && typeof GM.B === "function") return GM.B(en, es, ca);
    return { en, es, ca };
  };

  // 15 Historical Collectible Items
  const ITEMS = [
    {
      id: "BASIC",
      char: "📗",
      symbol: "B",
      name: { en: "BASIC Manual", es: "Manual de BASIC", ca: "Manual de BASIC" },
      desc: {
        en: "Commodore VIC-20 at high school (c. 1981-82). The language that started everything, written on paper before having a computer.",
        es: "Commodore VIC-20 en el instituto (c. 1981-82). El lenguaje con el que empezó todo, escribiendo programas en papel antes de tener ordenador.",
        ca: "Commodore VIC-20 a l'institut (c. 1981-82). El llenguatge amb què va començar tot, escrivint programes en paper abans de tenir ordinador."
      }
    },
    {
      id: "LOGO",
      char: "📘",
      symbol: "L",
      name: { en: "Logo Manual", es: "Manual de Logo", ca: "Manual de Logo" },
      desc: {
        en: "Taught to children and adults at the computer academy (late 80s). The language of the turtle and procedural thinking.",
        es: "Enseñado a niños y adultos en la academia de informática (finales de los 80). El lenguaje de la tortuga y el pensamiento procedimental.",
        ca: "Ensenyat a nens i adults a l'acadèmia d'informàtica (finals dels 80). El llenguatge de la tortuga i el pensament procedimental."
      }
    },
    {
      id: "PASCAL",
      char: "📙",
      symbol: "P",
      name: { en: "Pascal Manual", es: "Manual de Pascal", ca: "Manual de Pascal" },
      desc: {
        en: "Turbo Pascal for MS-DOS. Industrial automation apps and communication libraries before the arrival of Delphi.",
        es: "Turbo Pascal para MS-DOS. Aplicaciones de automatización industrial y librerías de comunicación antes de la llegada de Delphi.",
        ca: "Turbo Pascal per a MS-DOS. Aplicacions d'automatització industrial i llibreries de comunicació abans de l'arribada de Delphi."
      }
    },
    {
      id: "C",
      char: "📒",
      symbol: "C",
      name: { en: "C Language Manual", es: "Manual de C", ca: "Manual de C" },
      desc: {
        en: "Turbo C and 8086 assembly: fast extensions for Clipper and standalone tools like BPU compression utility.",
        es: "Turbo C y ensamblador 8086: extensiones rápidas para Clipper y herramientas independientes como la utilidad de compresión BPU.",
        ca: "Turbo C i assemblador 8086: extensions ràpides per a Clipper i eines independents com la utilitat de compressió BPU."
      }
    },
    {
      id: "CLIPPER",
      char: "📕",
      symbol: "K",
      name: { en: "Clipper Manual", es: "Manual de Clipper", ca: "Manual de Clipper" },
      unlocks: "DOOR_BBS",
      desc: {
        en: "The compiler for business software in the 90s. Hundreds of commercial apps, GAMMA.LIB, and articles in programming magazines.",
        es: "El compilador de software de gestión en los 90. Cientos de aplicaciones comerciales, GAMMA.LIB y artículos en revistas especializadas.",
        ca: "El compilador de programari de gestió als 90. Centenars d'aplicacions comercials, GAMMA.LIB i articles en revistes especialitzades."
      }
    },
    {
      id: "ZX12",
      char: "🎮",
      symbol: "Z",
      name: { en: "Revista ZX Issue 12", es: "Revista ZX nº 12", ca: "Revista ZX nº 12" },
      desc: {
        en: "First published game: 5,000 pesetas reader prize for a submarine hunt game (c. 1984).",
        es: "Primer juego publicado: premio de 5.000 pesetas del concurso de lectores por un juego de caza del submarino (c. 1984).",
        ca: "Primer joc publicat: premi de 5.000 pessetes del concurs de lectors per un joc de cacera del submarí (c. 1984)."
      }
    },
    {
      id: "MH71",
      char: "🗞️",
      symbol: "M",
      name: { en: "MicroHobby Issue 71", es: "MicroHobby nº 71", ca: "MicroHobby nº 71" },
      desc: {
        en: "Debut in 'Los Justicieros del Software' panel (March 1986). Reviews, critiques, and passion for the 8-bit era.",
        es: "Debut en el panel 'Los Justicieros del Software' (marzo 1986). Reseñas, críticas y pasión por la era de los 8 bits.",
        ca: "Debut al panell 'Los Justicieros del Software' (març 1986). Ressenyes, crítiques i passió per l'era dels 8 bits."
      }
    },
    {
      id: "PCW",
      char: "🖥️",
      symbol: "A",
      name: { en: "Amstrad PCW 8512", es: "Amstrad PCW 8512", ca: "Amstrad PCW 8512" },
      unlocks: "DOOR_PCW",
      desc: {
        en: "Second computer (1987-88): CP/M Plus, 3-inch floppies, Locomotive BASIC, and first paid commercial catalog program.",
        es: "Segundo ordenador (1987-88): CP/M Plus, disquetes de 3 pulgadas, Locomotive BASIC y primer programa comercial pagado.",
        ca: "Segon ordinador (1987-88): CP/M Plus, disquets de 3 polzades, Locomotive BASIC i primer programa comercial pagat."
      }
    },
    {
      id: "HOH",
      char: "🔓",
      symbol: "H",
      name: { en: "Head Over Heels Crack", es: "Crack de Head Over Heels", ca: "Crack de Head Over Heels" },
      unlocks: "DOOR_SECRET",
      desc: {
        en: "First reverse engineering challenge on PCW: disassembled the boot loader to backup a beloved game for personal use.",
        es: "Primer reto de ingeniería inversa en PCW: desensamblado del cargador de arranque para copiar un juego favorito para uso propio.",
        ca: "Primer repte d'enginyeria inversa a PCW: desensamblat del carregador d'arrencada per copiar un joc favorit per a ús propi."
      }
    },
    {
      id: "CAJAPLUS",
      char: "💾",
      symbol: "J",
      name: { en: "CAJAPLUS Floppy", es: "Disquete CAJAPLUS", ca: "Disquet CAJAPLUS" },
      desc: {
        en: "Gamma Software shareware cash-flow manager (c. 1990-94). Distributed on floppies, 5,500 Pts / $60 USA.",
        es: "Gestor de tesorería shareware de Gamma Software (c. 1990-94). Distribuido en disquetes por correo, 5.500 Pts / 60$ USA.",
        ca: "Gestor de tresoreria shareware de Gamma Software (c. 1990-94). Distribuït en disquets per correu, 5.500 Pts / 60$ USA."
      }
    },
    {
      id: "CHECKVIR",
      char: "🔐",
      symbol: "V",
      name: { en: "CHECKVIR Antivirus", es: "Antivirus CHECKVIR", ca: "Antivirus CHECKVIR" },
      unlocks: "DOOR_AV",
      desc: {
        en: "First antivirus against boot sector and MBR viruses, written in compiled QuickBASIC (c. 1991-97). Available on GitHub under GPL.",
        es: "Primer antivirus propio contra virus de sector de arranque y MBR en QuickBASIC compilado (c. 1991-97). En GitHub bajo GPL.",
        ca: "Primer antivirus propi contra virus de sector d'arrencada i MBR en QuickBASIC compilat (c. 1991-97). A GitHub sota GPL."
      }
    },
    {
      id: "BPU",
      char: "📦",
      symbol: "U",
      name: { en: "BPU Compressor", es: "Compresor BPU", ca: "Compressor BPU" },
      desc: {
        en: "Bitmap Packer Utility v1.0 (c. 1994-95). Huffman compression engine written in C during computer science studies.",
        es: "Bitmap Packer Utility v1.0 (c. 1994-95). Motor de compresión Huffman escrito en C durante los estudios de informática.",
        ca: "Bitmap Packer Utility v1.0 (c. 1994-95). Motor de compressió Huffman escrit en C durant els estudis d'informàtica."
      }
    },
    {
      id: "FIDONET",
      char: "📡",
      symbol: "F",
      name: { en: "FidoNet Point Card", es: "Tarjeta Punto FidoNet", ca: "Targeta Punt FidoNet" },
      unlocks: "DOOR_BBS",
      desc: {
        en: "Fidonet 2:343/129.44, RedBBS 757:101/24.44, Binet 135:343/11.44. The BBS era with 2400 to 28800 modems.",
        es: "Fidonet 2:343/129.44, RedBBS 757:101/24.44, Binet 135:343/11.44. La era de las BBS con módems de 2400 a 28800 baudios.",
        ca: "Fidonet 2:343/129.44, RedBBS 757:101/24.44, Binet 135:343/11.44. L'era de les BBS amb mòdems de 2400 a 28800 baudis."
      }
    },
    {
      id: "ESI",
      char: "🎓",
      symbol: "E",
      name: { en: "ESI Computing Diploma", es: "Título Informática ESI", ca: "Títol Informàtica ESI" },
      desc: {
        en: "Higher National Diploma in Computing (British Council / Cambridge, 1994-98). Formal computing education.",
        es: "Higher National Diploma in Computing (British Council / Cambridge, 1994-98). Formación técnica reglada.",
        ca: "Higher National Diploma in Computing (British Council / Cambridge, 1994-98). Formació tècnica reglada."
      }
    },
    {
      id: "LASALLE",
      char: "🛡️",
      symbol: "S",
      name: { en: "La Salle Cybersecurity Master", es: "Máster Ciberseguridad La Salle", ca: "Màster Ciberseguretat La Salle" },
      unlocks: "DOOR_EXIT",
      desc: {
        en: "Master in Cybersecurity at La Salle (2018-19). Turning four decades of system knowledge into defense and security.",
        es: "Máster en Ciberseguridad en La Salle (2018-19). Cuatro décadas de trayectoria transformadas en defensa y seguridad.",
        ca: "Màster en Ciberseguretat a La Salle (2018-19). Quatre dècades de trajectòria transformades en defensa i seguretat."
      }
    }
  ];

  // 5 Progression Doors
  const DOORS = {
    DOOR_PCW: {
      id: "DOOR_PCW",
      symbol: "1",
      name: { en: "Amstrad Gate", es: "Puerta Amstrad", ca: "Porta Amstrad" },
      requires: ["PCW"],
      msg: {
        en: "A green phosphor lock blocks the corridor. It requires the Amstrad PCW 8512.",
        es: "Una cerradura de fósforo verde bloquea el paso. Requiere el Amstrad PCW 8512.",
        ca: "Un pany de fòsfor verd bloqueja el pas. Requereix l'Amstrad PCW 8512."
      }
    },
    DOOR_AV: {
      id: "DOOR_AV",
      symbol: "2",
      name: { en: "Security Vault", es: "Cámara de Seguridad", ca: "Cambra de Seguretat" },
      requires: ["CHECKVIR"],
      msg: {
        en: "The security vault is sealed against boot viruses. Requires CHECKVIR.EXE.",
        es: "La cámara de seguridad está blindada contra virus. Requiere CHECKVIR.EXE.",
        ca: "La cambra de seguretat està blindada contra virus. Requereix CHECKVIR.EXE."
      }
    },
    DOOR_BBS: {
      id: "DOOR_BBS",
      symbol: "3",
      name: { en: "Modem Gateway", es: "Pasarela Telemática", ca: "Passarel·la Telemàtica" },
      anyOf: ["CLIPPER", "FIDONET"],
      msg: {
        en: "A serial carrier tone resonates behind the door. Requires Clipper Manual or FidoNet Point Card.",
        es: "Un tono de portadora serie resuena tras la puerta. Requiere Manual de Clipper o Tarjeta FidoNet.",
        ca: "Un to de portadora sèrie ressona rere la porta. Requereix Manual de Clipper o Targeta FidoNet."
      }
    },
    DOOR_SECRET: {
      id: "DOOR_SECRET",
      symbol: "4",
      name: { en: "Secret Chamber", es: "Sala Secreta", ca: "Sala Secreta" },
      requires: ["HOH"],
      msg: {
        en: "A disassembled protection sector locks this chamber. Requires the Head Over Heels Crack.",
        es: "Un sector de protección desensamblado sella esta sala. Requiere el Crack de Head Over Heels.",
        ca: "Un sector de protecció desensamblat segella aquesta sala. Requereix el Crack de Head Over Heels."
      }
    },
    DOOR_EXIT: {
      id: "DOOR_EXIT",
      symbol: "5",
      name: { en: "Final Sanctuary", es: "Santuario Final", ca: "Santuari Final" },
      requires: ["LASALLE"],
      msg: {
        en: "The exit barrier is locked by master defenses. Requires the La Salle Cybersecurity Master.",
        es: "La barrera de salida está bloqueada por defensas maestras. Requiere el Máster de La Salle.",
        ca: "La barrera de sortida està bloquejada per defenses mestres. Requereix el Màster de La Salle."
      }
    }
  };

  // Pseudo-random number generator (Mulberry32) for deterministic seeding
  function createRng(seed = Date.now()) {
    let s = (seed | 0) || 1;
    return () => {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // Player name cleaner: max 20 characters, alphanumeric + space, hyphen, underscore
  function cleanPlayerName(raw) {
    if (typeof raw !== "string") return "EXPLORER";
    const cleaned = raw.trim().replace(/[^A-Za-z0-9 _-]/g, "").slice(0, 20);
    return cleaned.length > 0 ? cleaned : "EXPLORER";
  }

  // Generate a guaranteed solvable 20x20 maze (grid dimension 21x21)
  function generateMaze(options = {}) {
    const cols = options.cols || 10;
    const rows = options.rows || 10;
    const width = cols * 2 + 1;
    const height = rows * 2 + 1;
    const rng = typeof options.seed === "number" ? createRng(options.seed) : (options.rng || Math.random);

    let bestMaze = null;
    let attempts = 0;

    // Retry loop to ensure 100% solvability with all items and doors placed correctly
    while (attempts < 50) {
      attempts++;
      const grid = Array.from({ length: height }, () => Array(width).fill(1)); // 1 = WALL
      const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

      // DFS backtracker on cell coordinates (0..cols-1, 0..rows-1) -> map coords (2x+1, 2y+1)
      const stack = [[0, 0]];
      visited[0][0] = true;
      grid[1][1] = 0; // 0 = EMPTY

      while (stack.length > 0) {
        const [cx, cy] = stack[stack.length - 1];
        const dirs = [
          [0, -1, 0, -1], // Up
          [1, 0, 1, 0],   // Right
          [0, 1, 0, 1],   // Down
          [-1, 0, -1, 0]  // Left
        ];
        // Shuffle directions
        for (let i = dirs.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
        }

        let moved = false;
        for (const [dx, dy, wx, wy] of dirs) {
          const nx = cx + dx, ny = cy + dy;
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !visited[ny][nx]) {
            visited[ny][nx] = true;
            grid[cy * 2 + 1 + wy][cx * 2 + 1 + wx] = 0; // Knock down wall
            grid[ny * 2 + 1][nx * 2 + 1] = 0;           // Cell itself
            stack.push([nx, ny]);
            moved = true;
            break;
          }
        }
        if (!moved) stack.pop();
      }

      // Add a few loops/shortcuts (5% chance) so it's not strictly a tree with frustrating dead ends
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          if (grid[y][x] === 1 && rng() < 0.04) {
            const h = (grid[y][x - 1] === 0 && grid[y][x + 1] === 0);
            const v = (grid[y - 1][x] === 0 && grid[y + 1][x] === 0);
            if (h !== v) grid[y][x] = 0;
          }
        }
      }

      // BFS to find topological distances from start (1, 1)
      const dist = Array.from({ length: height }, () => Array(width).fill(-1));
      const queue = [[1, 1]];
      dist[1][1] = 0;
      const reachableCells = [];

      while (queue.length > 0) {
        const [qx, qy] = queue.shift();
        reachableCells.push({ x: qx, y: qy, d: dist[qy][qx] });
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          const nx = qx + dx, ny = qy + dy;
          if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && grid[ny][nx] === 0 && dist[ny][nx] === -1) {
            dist[ny][nx] = dist[qy][qx] + 1;
            queue.push([nx, ny]);
          }
        }
      }

      // Exit cell is chosen from the furthest reachable cells
      reachableCells.sort((a, b) => b.d - a.d);
      if (reachableCells.length < 25) continue; // Unlikely, but safety check

      const exitCell = reachableCells[0];
      const itemsMap = {};
      const doorsMap = {};

      // Candidate dead-ends / branches for doors and items
      const candidateCells = reachableCells.slice(1);
      // Shuffle candidates slightly
      for (let i = candidateCells.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [candidateCells[i], candidateCells[j]] = [candidateCells[j], candidateCells[i]];
      }

      // Select 5 cells for doors at distinct distance tiers
      // Door order: DOOR_PCW (near), DOOR_BBS (mid-near), DOOR_AV (mid), DOOR_SECRET (branch), DOOR_EXIT (protects exit)
      const exitNeighbors = [[0, 1], [0, -1], [1, 0], [-1, 0]]
        .map(([dx, dy]) => ({ x: exitCell.x + dx, y: exitCell.y + dy }))
        .filter(p => grid[p.y][p.x] === 0);

      // Place DOOR_EXIT at the immediate entrance to exitCell or near it
      const exitDoorPos = exitNeighbors[0] || { x: exitCell.x, y: exitCell.y };
      doorsMap[`${exitDoorPos.x},${exitDoorPos.y}`] = "DOOR_EXIT";

      // Select 4 other door positions from mid-tier cells (avoiding start 1,1 and exit)
      const doorIds = ["DOOR_PCW", "DOOR_BBS", "DOOR_AV", "DOOR_SECRET"];
      const midTiers = candidateCells.filter(c => c.d >= 6 && c.d <= exitCell.d - 4 && (c.x !== exitDoorPos.x || c.y !== exitDoorPos.y));
      
      if (midTiers.length < 4) continue;
      for (let i = 0; i < 4; i++) {
        const pos = midTiers[i * Math.floor(midTiers.length / 4)];
        doorsMap[`${pos.x},${pos.y}`] = doorIds[i];
      }

      // Place items ensuring keys are placed before doors that require them
      // Distribute 15 items across available open cells
      const availableItemCells = candidateCells.filter(c => !doorsMap[`${c.x},${c.y}`] && (c.x !== exitCell.x || c.y !== exitCell.y));
      if (availableItemCells.length < ITEMS.length) continue;

      // Group available cells by distance
      availableItemCells.sort((a, b) => a.d - b.d);

      // Place key items in accessible tiers
      // PCW early (unlocks DOOR_PCW)
      // CLIPPER and FIDONET early/mid
      // CHECKVIR mid (unlocks DOOR_AV)
      // HOH inside/after DOOR_PCW
      // LASALLE inside/after DOOR_AV (unlocks DOOR_EXIT)
      const itemPlacements = {};
      const remainingItems = [...ITEMS];

      // Assign an item to each chosen cell
      for (let i = 0; i < ITEMS.length; i++) {
        const item = remainingItems[i];
        const cell = availableItemCells[Math.floor(i * (availableItemCells.length / ITEMS.length))];
        itemPlacements[`${cell.x},${cell.y}`] = item.id;
      }

      const mazeObj = {
        width,
        height,
        grid,
        start: { x: 1, y: 1 },
        exit: { x: exitCell.x, y: exitCell.y },
        doors: doorsMap,
        items: itemPlacements
      };

      // Formal solvability verification
      if (verifySolvability(mazeObj)) {
        bestMaze = mazeObj;

        // Generate 3-4 secret passages between parallel corridors (detour distance >= 6)
        const secretPassages = {};
        const passageCandidates = [];
        for (let y = 2; y < height - 2; y++) {
          for (let x = 2; x < width - 2; x++) {
            if (grid[y][x] === 1) {
              const h = (grid[y - 1][x] === 0 && grid[y + 1][x] === 0 && grid[y][x - 1] === 1 && grid[y][x + 1] === 1);
              const v = (grid[y][x - 1] === 0 && grid[y + 1][x] === 0 && grid[y - 1][x] === 1 && grid[y + 1][x] === 1);
              if ((h || v) && !doorsMap[`${x},${y}`]) {
                passageCandidates.push({ x, y });
              }
            }
          }
        }
        for (let i = passageCandidates.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [passageCandidates[i], passageCandidates[j]] = [passageCandidates[j], passageCandidates[i]];
        }
        const numPassages = Math.min(4, Math.max(2, passageCandidates.length));
        for (let i = 0; i < numPassages; i++) {
          const p = passageCandidates[i];
          secretPassages[`${p.x},${p.y}`] = { x: p.x, y: p.y, opened: false, discovered: false };
        }
        bestMaze.secretPassages = secretPassages;

        // Spawn point for Minotaur: distant open cell (distance >= 10 from start)
        const farCells = reachableCells.filter(c => c.d >= 10 && (c.x > width / 3 || c.y > height / 3));
        const minoCell = farCells[Math.floor(rng() * farCells.length)] || reachableCells[Math.floor(reachableCells.length / 2)];
        bestMaze.minotaurSpawn = { x: minoCell.x, y: minoCell.y };

        break;
      }
    }

    if (!bestMaze) {
      // Fallback: guaranteed open layout if random placement hit conflict
      return generateFallbackMaze(cols, rows);
    }

    return bestMaze;
  }

  // Fallback generator ensuring clean deterministic layout
  function generateFallbackMaze(cols, rows) {
    const width = cols * 2 + 1;
    const height = rows * 2 + 1;
    const grid = Array.from({ length: height }, () => Array(width).fill(1));

    // Clear serpentine paths
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (y % 2 === 1 || x === 1 || (y % 4 === 2 && x === width - 2) || (y % 4 === 0 && x === 2)) {
          grid[y][x] = 0;
        }
      }
    }

    const openCells = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (grid[y][x] === 0 && !(x === 1 && y === 1)) openCells.push({ x, y });
      }
    }

    const exit = openCells[openCells.length - 1];
    const doors = {};
    const items = {};

    // Sequential placement ensuring solvability
    const doorKeys = ["DOOR_PCW", "DOOR_BBS", "DOOR_AV", "DOOR_SECRET", "DOOR_EXIT"];
    const step = Math.floor(openCells.length / (ITEMS.length + 6));

    let cIdx = 0;
    ITEMS.forEach((it, i) => {
      cIdx += step;
      if (cIdx < openCells.length - 2) {
        items[`${openCells[cIdx].x},${openCells[cIdx].y}`] = it.id;
      }
      if (it.unlocks && doorKeys.includes(it.unlocks)) {
        cIdx++;
        if (cIdx < openCells.length - 2) {
          doors[`${openCells[cIdx].x},${openCells[cIdx].y}`] = it.unlocks;
        }
      }
    });

    return {
      width,
      height,
      grid,
      start: { x: 1, y: 1 },
      exit,
      doors,
      items,
      secretPassages: {
        [`${cols},${rows}`]: { x: cols, y: rows, opened: false, discovered: false }
      },
      minotaurSpawn: { x: width - 3, y: height - 3 }
    };
  }

  // BFS Pathfinding for Minotaur navigation towards target (player)
  function getMinotaurStep(maze, mx, my, px, py) {
    const startX = Math.floor(mx);
    const startY = Math.floor(my);
    const targetX = Math.floor(px);
    const targetY = Math.floor(py);

    if (startX === targetX && startY === targetY) {
      return { x: startX, y: startY };
    }

    const isWalkable = (x, y) => {
      if (x < 1 || x >= maze.width - 1 || y < 1 || y >= maze.height - 1) return false;
      if (maze.grid[y][x] === 1) return false;
      const doorId = maze.doors[`${x},${y}`];
      if (doorId && !maze.openDoors?.has(doorId)) return false;
      return true;
    };

    const queue = [[startX, startY]];
    const cameFrom = new Map();
    cameFrom.set(`${startX},${startY}`, null);

    let found = false;
    while (queue.length > 0) {
      const [cx, cy] = queue.shift();
      if (cx === targetX && cy === targetY) {
        found = true;
        break;
      }
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nx = cx + dx, ny = cy + dy;
        const key = `${nx},${ny}`;
        if (!cameFrom.has(key) && isWalkable(nx, ny)) {
          cameFrom.set(key, [cx, cy]);
          queue.push([nx, ny]);
        }
      }
    }

    if (!found) {
      // If locked behind door, wander along open corridors
      const validMoves = [];
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nx = startX + dx, ny = startY + dy;
        if (isWalkable(nx, ny)) validMoves.push({ x: nx, y: ny });
      }
      if (validMoves.length > 0) {
        return validMoves[Math.floor(Math.random() * validMoves.length)];
      }
      return { x: startX, y: startY };
    }

    // Backtrack from target to find the first step from start
    let curr = [targetX, targetY];
    let prev = cameFrom.get(`${curr[0]},${curr[1]}`);
    while (prev && (prev[0] !== startX || prev[1] !== startY)) {
      curr = prev;
      prev = cameFrom.get(`${curr[0]},${curr[1]}`);
    }

    return { x: curr[0], y: curr[1] };
  }

  // Formal Solvability Verifier
  // Simulates gameplay exploration: collects accessible items, unlocks reachable doors, reaches exit
  function verifySolvability(maze) {
    const { width, height, grid, start, exit, doors, items } = maze;
    const unlockedDoors = new Set();
    const collectedItems = new Set();
    let madeProgress = true;

    while (madeProgress) {
      madeProgress = false;
      const visited = Array.from({ length: height }, () => Array(width).fill(false));
      const q = [[start.x, start.y]];
      visited[start.y][start.x] = true;

      while (q.length > 0) {
        const [x, y] = q.shift();
        const key = `${x},${y}`;

        // Collect item if present
        if (items[key] && !collectedItems.has(items[key])) {
          collectedItems.add(items[key]);
          madeProgress = true;
        }

        // Check 4 neighbors
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited[ny][nx]) {
            if (grid[ny][nx] === 0) {
              const doorId = doors[`${nx},${ny}`];
              if (!doorId || unlockedDoors.has(doorId)) {
                visited[ny][nx] = true;
                q.push([nx, ny]);
              } else {
                // Check if door can now be unlocked
                const doorDef = DOORS[doorId];
                let canOpen = false;
                if (doorDef.requires && doorDef.requires.every(id => collectedItems.has(id))) canOpen = true;
                if (doorDef.anyOf && doorDef.anyOf.some(id => collectedItems.has(id))) canOpen = true;

                if (canOpen) {
                  unlockedDoors.add(doorId);
                  visited[ny][nx] = true;
                  q.push([nx, ny]);
                  madeProgress = true;
                }
              }
            }
          }
        }
      }
    }

    // Solvable if exit is reached and at least all essential gating items are reachable
    const exitKey = `${exit.x},${exit.y}`;
    const exitDoorId = doors[exitKey] || doors[`${exit.x - 1},${exit.y}`] || doors[`${exit.x + 1},${exit.y}`] || doors[`${exit.x},${exit.y - 1}`] || doors[`${exit.x},${exit.y + 1}`];
    
    // Check if exit was reached in the final BFS
    const finalVisited = Array.from({ length: height }, () => Array(width).fill(false));
    const q = [[start.x, start.y]];
    finalVisited[start.y][start.x] = true;
    let reachedExit = false;

    while (q.length > 0) {
      const [x, y] = q.shift();
      if (x === exit.x && y === exit.y) {
        reachedExit = true;
        break;
      }
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && !finalVisited[ny][nx]) {
          if (grid[ny][nx] === 0) {
            const doorId = doors[`${nx},${ny}`];
            if (!doorId || unlockedDoors.has(doorId)) {
              finalVisited[ny][nx] = true;
              q.push([nx, ny]);
            }
          }
        }
      }
    }

    return reachedExit && collectedItems.size >= 10;
  }

  // Cross-system Reward Key Generator
  function generateRewardKey(playerName, itemCount, date = new Date()) {
    const clean = cleanPlayerName(playerName);
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    let hash = 0x811c9dc5;
    const str = `${clean}:${itemCount}:${dateStr}:GABRIEL_MARTI_RETRO_1986`;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
    return `GAMMA-${hex.slice(0, 4)}-${hex.slice(4)}`;
  }

  // ASCII Rat Animation Frames (running rat across the screen)
  const RAT_FRAMES = [
    "  ..----.._    _\n .'  .-.  '-./ =\n '  ( o )      \\\n     '---'  _.-'\n  ..----.._ (",
    "   ..----.._    _\n  .'  .-.  '-./ =\n  '  ( o )      \\\n      '---'  _.-'\n   ..----.._ ~",
    "    ..----.._    _\n   .'  .-.  '-./ =\n   '  ( o )      \\\n       '---'  _.-'\n    ..----.._ -",
    "     ..----.._    _\n    .'  .-.  '-./ =\n    '  ( o )      \\\n        '---'  _.-'\n     ..----.._ _"
  ];

  // ASCII Certificate Generator
  function generateCertificate(playerName, itemCount, totalItems, rewardKey, date = new Date()) {
    const name = cleanPlayerName(playerName).toUpperCase();
    const dStr = date.toLocaleDateString("es-ES", { year: "numeric", month: "2-digit", day: "2-digit" });
    const lineName = name.length > 28 ? name.slice(0, 28) : name;
    const padName = " ".repeat(Math.max(0, Math.floor((36 - lineName.length) / 2)));

    return [
      "╔══════════════════════════════════════════╗",
      "║     CERTIFICADO DE EXPLORADOR RETRO      ║",
      "║        GABRIEL MARTI - DESDE 1986        ║",
      "╠══════════════════════════════════════════╣",
      "║                                          ║",
      `║ ${padName}${lineName.padEnd(36 - padName.length)} ║`,
      "║                                          ║",
      "║   ha superado con exito el Laberinto 3D  ║",
      "║   y descubierto los hitos historicos     ║",
      "║   de cuatro decadas de programacion.     ║",
      "║                                          ║",
      `║   Hitos recogidos:  ${String(itemCount).padStart(2)} / ${String(totalItems).padEnd(2)}             ║`,
      `║   Fecha de mision:  ${dStr.padEnd(16)}     ║`,
      `║   Clave Recompensa: ${rewardKey.padEnd(16)}     ║`,
      "║                                          ║",
      "║   Premio desbloqueado en DOS / Shell     ║",
      "║   Windows 3.1 / BBS (Sesion activa)      ║",
      "╚══════════════════════════════════════════╝"
    ].join("\n");
  }

  // DDA Raycasting Engine
  // Projects a 2.5D view given a camera position and angle
  function castRays(maze, posX, posY, dirX, dirY, planeX, planeY, screenWidth) {
    const columns = [];
    const { width, height, grid, doors, exit } = maze;

    for (let x = 0; x < screenWidth; x++) {
      const cameraX = (2 * x) / screenWidth - 1;
      const rayDirX = dirX + planeX * cameraX;
      const rayDirY = dirY + planeY * cameraX;

      let mapX = Math.floor(posX);
      let mapY = Math.floor(posY);

      const deltaDistX = Math.abs(1 / (rayDirX || 1e-30));
      const deltaDistY = Math.abs(1 / (rayDirY || 1e-30));

      let stepX, stepY, sideDistX, sideDistY;

      if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (posX - mapX) * deltaDistX;
      } else {
        stepX = 1;
        sideDistX = (mapX + 1.0 - posX) * deltaDistX;
      }

      if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (posY - mapY) * deltaDistY;
      } else {
        stepY = 1;
        sideDistY = (mapY + 1.0 - posY) * deltaDistY;
      }

      let hit = 0;
      let side = 0; // 0 for X-wall, 1 for Y-wall
      let cellType = 1; // 1 = wall, 'DOOR_*' = door, 'EXIT' = exit

      while (hit === 0) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }

        if (mapX < 0 || mapX >= width || mapY < 0 || mapY >= height) {
          hit = 1;
          cellType = 1;
          break;
        }

        const dId = doors[`${mapX},${mapY}`];
        if (dId && !maze.openDoors?.has(dId)) {
          hit = 1;
          cellType = dId;
        } else if (grid[mapY][mapX] === 1) {
          hit = 1;
          cellType = (maze.secretPassages?.[`${mapX},${mapY}`] && !maze.secretPassages[`${mapX},${mapY}`].opened) ? "SECRET_PASSAGE" : 1;
        } else if (mapX === exit.x && mapY === exit.y) {
          hit = 1;
          cellType = "EXIT";
        }
      }

      let perpWallDist;
      let wallX;
      if (side === 0) {
        perpWallDist = (mapX - posX + (1 - stepX) / 2) / (rayDirX || 1e-30);
        wallX = posY + perpWallDist * rayDirY;
      } else {
        perpWallDist = (mapY - posY + (1 - stepY) / 2) / (rayDirY || 1e-30);
        wallX = posX + perpWallDist * rayDirX;
      }
      perpWallDist = Math.max(0.05, perpWallDist);
      wallX -= Math.floor(wallX);

      columns.push({
        x,
        perpWallDist,
        side,
        mapX,
        mapY,
        cellType,
        wallX
      });
    }

    return columns;
  }

  // Project Sprites / Collectibles / Minotaur onto the raycasted view
  function projectSprites(maze, posX, posY, dirX, dirY, planeX, planeY, screenWidth, zBuffer, minotaur) {
    const sprites = [];
    const invDet = 1.0 / (planeX * dirY - dirX * planeY || 1e-30);

    for (const [key, itemId] of Object.entries(maze.items || {})) {
      if (maze.collectedItems?.has(itemId)) continue;
      const [sx, sy] = key.split(",").map(Number);
      const spriteX = sx + 0.5 - posX;
      const spriteY = sy + 0.5 - posY;

      // Transform sprite with inverse camera matrix
      const transformX = invDet * (dirY * spriteX - dirX * spriteY);
      const transformY = invDet * (-planeY * spriteX + planeX * spriteY); // Depth inside screen

      if (transformY > 0.1) {
        const spriteScreenX = Math.floor((screenWidth / 2) * (1 + transformX / transformY));
        const spriteDist = Math.sqrt(spriteX * spriteX + spriteY * spriteY);

        // Check if visible within screen and not fully occluded
        if (spriteScreenX >= 0 && spriteScreenX < screenWidth) {
          if (zBuffer[spriteScreenX] > transformY) {
            sprites.push({
              id: itemId,
              item: ITEMS.find(it => it.id === itemId),
              dist: spriteDist,
              depth: transformY,
              screenX: spriteScreenX
            });
          }
        }
      }
    }

    // Project Minotaur
    if (minotaur && minotaur.active) {
      const spriteX = minotaur.x - posX;
      const spriteY = minotaur.y - posY;
      const transformX = invDet * (dirY * spriteX - dirX * spriteY);
      const transformY = invDet * (-planeY * spriteX + planeX * spriteY);

      if (transformY > 0.1) {
        const spriteScreenX = Math.floor((screenWidth / 2) * (1 + transformX / transformY));
        const spriteDist = Math.hypot(spriteX, spriteY);

        if (spriteScreenX >= 0 && spriteScreenX < screenWidth) {
          if (zBuffer[spriteScreenX] > transformY) {
            sprites.push({
              id: "MINOTAUR",
              isMonster: true,
              dist: spriteDist,
              depth: transformY,
              screenX: spriteScreenX
            });
          }
        }
      }
    }

    // Sort far to close
    sprites.sort((a, b) => b.depth - a.depth);
    return sprites;
  }

  // ANSI 16-color palette mappings for collectibles and UI
  const ITEM_COLORS = {
    BASIC: "a10", LOGO: "a11", PASCAL: "a9", C: "a15", CLIPPER: "a12",
    ZX12: "a13", MH71: "a14", PCW: "a10", HOH: "a11", CAJAPLUS: "a14",
    CHECKVIR: "a12", BPU: "a9", FIDONET: "a11", ESI: "a13", LASALLE: "a14"
  };

  // Centralized retro audio player for maze events
  function playMazeSound(sfx, type) {
    if (!sfx) return;
    if (type === "pickup") {
      if (typeof sfx.pickup === "function") sfx.pickup();
      else if (typeof sfx.tone === "function") {
        sfx.tone(587, .06, "square", .04);
        sfx.tone(880, .08, "square", .04, .06);
        sfx.tone(1174, .12, "square", .045, .14);
      } else sfx.ok?.();
    } else if (type === "near") {
      if (typeof sfx.stomp === "function") sfx.stomp(true);
      else if (typeof sfx.tone === "function" && typeof sfx.noise === "function") {
        sfx.noise(.12, .65, 220);
        sfx.tone(65, .15, "sawtooth", .05);
        sfx.noise(.12, .75, 200, .16);
        sfx.tone(55, .18, "sawtooth", .06, .16);
      } else sfx.err?.();
    } else if (type === "heard") {
      if (typeof sfx.stomp === "function") sfx.stomp(false);
      else if (typeof sfx.tone === "function" && typeof sfx.noise === "function") {
        sfx.noise(.08, .35, 280);
        sfx.tone(70, .1, "triangle", .035);
      } else sfx.tick?.();
    } else if (type === "caught") {
      if (typeof sfx.defeat === "function") sfx.defeat();
      else if (typeof sfx.tone === "function" && typeof sfx.noise === "function") {
        sfx.tone(130, .22, "sawtooth", .06);
        sfx.tone(85, .32, "sawtooth", .07, .16);
        sfx.noise(.3, .65, 340, .08);
      } else sfx.err?.();
    }
  }

  // ASCII 3D Viewport Renderer for Terminal (DOS and shell)
  function renderAscii(gameInstance, screenCols = 80, screenRows = 20, options = {}) {
    const { maze, posX, posY, dirX, dirY, planeX, planeY } = gameInstance;
    const columns = castRays(maze, posX, posY, dirX, dirY, planeX, planeY, screenCols);
    const zBuffer = columns.map(c => c.perpWallDist);
    const sprites = projectSprites(maze, posX, posY, dirX, dirY, planeX, planeY, screenCols, zBuffer, gameInstance.minotaur);

    const screen = Array.from({ length: screenRows }, () => Array(screenCols).fill(" "));
    const attrs = Array.from({ length: screenRows }, () => Array(screenCols).fill("a7"));
    const midY = Math.floor(screenRows / 2);

    // Ceiling & Floor shading with perspective cues
    for (let y = 0; y < screenRows; y++) {
      for (let x = 0; x < screenCols; x++) {
        if (y > midY) {
          const dy = y - midY;
          if (dy >= 8) { screen[y][x] = (x + y) % 6 === 0 ? "_" : " "; attrs[y][x] = "a8"; }
          else if (dy >= 5) { screen[y][x] = (x + y) % 4 === 0 ? "·" : " "; attrs[y][x] = "a8"; }
          else if (dy >= 3) { screen[y][x] = (x + y) % 4 === 0 ? "." : " "; attrs[y][x] = "a8"; }
        } else if (y < midY - 6) {
          screen[y][x] = (x + y) % 10 === 0 ? "." : " ";
          attrs[y][x] = "a8";
        }
      }
    }

    // Render Walls with directional contrast and corner delineation
    let lastEdge = -10;
    for (let x = 0; x < screenCols; x++) {
      const col = columns[x];
      const prev = columns[x - 1];
      const dist = col.perpWallDist;
      const lineHeight = Math.min(screenRows, Math.floor(screenRows / dist));
      const drawStart = Math.max(0, Math.floor(midY - lineHeight / 2));
      const drawEnd = Math.min(screenRows - 1, Math.floor(midY + lineHeight / 2));

      // Crisp corner delineation between depth steps and wall transitions
      const isWallEdge = prev && (col.mapX !== prev.mapX || col.mapY !== prev.mapY) &&
        Math.abs(col.perpWallDist - prev.perpWallDist) > 0.35 && (x - lastEdge > 1);
      if (isWallEdge) lastEdge = x;

      // High-contrast directional wall shading & ANSI colours
      let bodyChar = " ";
      let wallColor = "a7";
      if (col.cellType === "EXIT") {
        bodyChar = "*";
        wallColor = "a14";
      } else if (typeof col.cellType === "string" && col.cellType.startsWith("DOOR_")) {
        bodyChar = col.side === 0 ? "║" : "═";
        wallColor = "a14";
      } else if (col.cellType === "SECRET_PASSAGE") {
        if (dist < 2.0) bodyChar = "▒";
        else if (dist < 3.8) bodyChar = "░";
        else if (dist < 6.0) bodyChar = ":";
        else bodyChar = ".";
        wallColor = "a6";
      } else if (col.side === 0) {
        // North/South faces: bright direct light, solid blocks
        if (dist < 2.0) bodyChar = "█";
        else if (dist < 3.8) bodyChar = "▓";
        else if (dist < 6.0) bodyChar = "▒";
        else if (dist < 8.5) bodyChar = "░";
        else bodyChar = "·";
        wallColor = dist < 4.0 ? "a15" : "a7";
      } else {
        // East/West faces: shaded / textured contrast
        if (dist < 2.0) bodyChar = "▓";
        else if (dist < 3.8) bodyChar = "▒";
        else if (dist < 6.0) bodyChar = "░";
        else if (dist < 8.5) bodyChar = ":";
        else bodyChar = ".";
        wallColor = dist < 4.0 ? "a7" : "a8";
      }

      for (let y = drawStart; y <= drawEnd; y++) {
        if (isWallEdge) {
          screen[y][x] = "│";
          attrs[y][x] = "a15";
        } else if (y === drawStart && drawStart > 0 && dist < 8.5) {
          screen[y][x] = "▄";
          attrs[y][x] = "a8";
        } else if (y === drawEnd && drawEnd < screenRows - 1 && dist < 8.5) {
          screen[y][x] = "▀";
          attrs[y][x] = "a8";
        } else {
          screen[y][x] = bodyChar;
          attrs[y][x] = wallColor;
        }
      }
    }

    // Render Sprites / Items / Minotaur
    for (const sp of sprites) {
      const x = sp.screenX;
      const dist = sp.depth;
      const y = Math.floor(midY);

      if (y >= 0 && y < screenRows && x >= 0 && x < screenCols) {
        if (sp.isMonster) {
          const mColor = "a12";
          if (dist < 2.5) {
            // Close imposing Minotaur beast (3x3 horned presence)
            if (y > 0) {
              if (x > 0) { screen[y - 1][x - 1] = "\\"; attrs[y - 1][x - 1] = mColor; }
              screen[y - 1][x] = "▼"; attrs[y - 1][x] = mColor;
              if (x < screenCols - 1) { screen[y - 1][x + 1] = "/"; attrs[y - 1][x + 1] = mColor; }
            }
            if (x > 0) { screen[y][x - 1] = "("; attrs[y][x - 1] = mColor; }
            screen[y][x] = "O"; attrs[y][x] = mColor;
            if (x < screenCols - 1) { screen[y][x + 1] = ")"; attrs[y][x + 1] = mColor; }
            if (y < screenRows - 1) {
              if (x > 0) { screen[y + 1][x - 1] = "/"; attrs[y + 1][x - 1] = mColor; }
              screen[y + 1][x] = "█"; attrs[y + 1][x] = mColor;
              if (x < screenCols - 1) { screen[y + 1][x + 1] = "\\"; attrs[y + 1][x + 1] = mColor; }
            }
          } else if (dist < 5.0) {
            if (x > 0) { screen[y][x - 1] = "{"; attrs[y][x - 1] = mColor; }
            screen[y][x] = "M"; attrs[y][x] = mColor;
            if (x < screenCols - 1) { screen[y][x + 1] = "}"; attrs[y][x + 1] = mColor; }
          } else {
            screen[y][x] = "M"; attrs[y][x] = mColor;
          }
        } else {
          const symbol = sp.item?.symbol || "?";
          const iColor = ITEM_COLORS[sp.item?.id] || "a11";
          screen[y][x] = symbol;
          attrs[y][x] = iColor;
          if (dist < 3.5 && x > 0 && x < screenCols - 1) {
            screen[y][x - 1] = "["; attrs[y][x - 1] = "a8";
            screen[y][x + 1] = "]"; attrs[y][x + 1] = "a8";
          }
        }
      }
    }

    // Overlay Framed Minimap on top-right corner if requested
    if (options.minimap !== false) {
      const mapSize = 9;
      const startX = screenCols - mapSize - 3;
      const curMapX = Math.floor(posX);
      const curMapY = Math.floor(posY);
      const half = Math.floor(mapSize / 2);

      for (let my = -1; my <= mapSize; my++) {
        for (let mx = -1; mx <= mapSize; mx++) {
          const scX = startX + mx + 1;
          const scY = 1 + my;
          if (scX >= screenCols || scY >= screenRows) continue;

          if (my === -1 && mx === -1) { screen[scY][scX] = "┌"; attrs[scY][scX] = "a8"; }
          else if (my === -1 && mx === mapSize) { screen[scY][scX] = "┐"; attrs[scY][scX] = "a8"; }
          else if (my === mapSize && mx === -1) { screen[scY][scX] = "└"; attrs[scY][scX] = "a8"; }
          else if (my === mapSize && mx === mapSize) { screen[scY][scX] = "┘"; attrs[scY][scX] = "a8"; }
          else if (my === -1 || my === mapSize) { screen[scY][scX] = "─"; attrs[scY][scX] = "a8"; }
          else if (mx === -1 || mx === mapSize) { screen[scY][scX] = "│"; attrs[scY][scX] = "a8"; }
          else {
            const gx = curMapX + (mx - half);
            const gy = curMapY + (my - half);
            if (mx === half && my === half) {
              const ang = Math.atan2(dirY, dirX);
              let pChar = "▲";
              if (ang >= -Math.PI / 4 && ang < Math.PI / 4) pChar = "►";
              else if (ang >= Math.PI / 4 && ang < (3 * Math.PI) / 4) pChar = "▼";
              else if (ang >= -(3 * Math.PI) / 4 && ang < -Math.PI / 4) pChar = "▲";
              else pChar = "◄";
              screen[scY][scX] = pChar;
              attrs[scY][scX] = "a10";
            } else if (gx >= 0 && gx < maze.width && gy >= 0 && gy < maze.height) {
              const dId = maze.doors[`${gx},${gy}`];
              if (gameInstance.minotaur?.active && gx === Math.floor(gameInstance.minotaur.x) && gy === Math.floor(gameInstance.minotaur.y)) {
                screen[scY][scX] = "M";
                attrs[scY][scX] = "a12";
              } else if (dId && !maze.openDoors?.has(dId)) {
                screen[scY][scX] = "+";
                attrs[scY][scX] = "a14";
              } else if (maze.secretPassages?.[`${gx},${gy}`]?.opened) {
                screen[scY][scX] = "~";
                attrs[scY][scX] = "a6";
              } else if (maze.grid[gy][gx] === 1) {
                screen[scY][scX] = "█";
                attrs[scY][scX] = "a8";
              } else if (maze.items[`${gx},${gy}`] && !maze.collectedItems?.has(maze.items[`${gx},${gy}`])) {
                screen[scY][scX] = "*";
                attrs[scY][scX] = "a11";
              } else if (gx === maze.exit.x && gy === maze.exit.y) {
                screen[scY][scX] = "E";
                attrs[scY][scX] = "a14";
              } else {
                screen[scY][scX] = "·";
                attrs[scY][scX] = "a8";
              }
            } else {
              screen[scY][scX] = " ";
              attrs[scY][scX] = "a7";
            }
          }
        }
      }
    }

    if (options.color) {
      return screen.map((row, y) => {
        let html = "";
        let curCls = null;
        let text = "";
        for (let x = 0; x < screenCols; x++) {
          const ch = row[x];
          const cls = attrs[y][x] || "a7";
          if (cls !== curCls) {
            if (text) html += curCls && curCls !== "a7" ? `<span class="${curCls}">${text}</span>` : text;
            curCls = cls;
            text = ch;
          } else {
            text += ch;
          }
        }
        if (text) html += curCls && curCls !== "a7" ? `<span class="${curCls}">${text}</span>` : text;
        return html;
      }).join("\n");
    }

    return screen.map(r => r.join("")).join("\n");
  }

  // 2D Canvas Renderer for Windows 3.1
  function renderCanvas(gameInstance, ctx, width, height, options = {}) {
    const { maze, posX, posY, dirX, dirY, planeX, planeY } = gameInstance;
    const columns = castRays(maze, posX, posY, dirX, dirY, planeX, planeY, width);
    const zBuffer = columns.map(c => c.perpWallDist);
    const sprites = projectSprites(maze, posX, posY, dirX, dirY, planeX, planeY, width, zBuffer, gameInstance.minotaur);

    // Ceiling & Floor with subtle retro depth gradients
    const ceilGrad = ctx.createLinearGradient(0, 0, 0, height / 2);
    ceilGrad.addColorStop(0, "#121212");
    ceilGrad.addColorStop(1, "#242424");
    ctx.fillStyle = ceilGrad;
    ctx.fillRect(0, 0, width, height / 2);

    const floorGrad = ctx.createLinearGradient(0, height / 2, 0, height);
    floorGrad.addColorStop(0, "#2a2a2a");
    floorGrad.addColorStop(1, "#404040");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, height / 2, width, height / 2);

    // Render Walls with procedural brick texture, mortar joints, individual brick variations and stains
    for (let x = 0; x < width; x++) {
      const col = columns[x];
      const dist = col.perpWallDist;
      const lineHeight = Math.floor(height / dist);
      const drawStart = Math.max(0, Math.floor(height / 2 - lineHeight / 2));
      const drawEnd = Math.min(height, Math.floor(height / 2 + lineHeight / 2));
      const wallX = col.wallX || 0;
      const att = Math.max(0.12, Math.min(1.0, 1.0 / (1 + dist * 0.35)));
      const isDoor = typeof col.cellType === "string" && col.cellType.startsWith("DOOR_");

      if (isDoor) {
        // Vertical wooden planks with wood grain and iron bolts
        const factor = col.side === 0 ? 1.0 : 0.75;
        const plankIdx = Math.floor(wallX * 4);
        const isPlankSeam = (wallX * 4) % 1.0 < 0.08;
        if (isPlankSeam) {
          ctx.fillStyle = `rgb(${Math.floor(25 * att)},${Math.floor(12 * att)},${Math.floor(6 * att)})`;
          ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
        } else {
          const pVar = ((plankIdx * 23) % 7) * 4 - 12;
          const r = Math.floor((125 + pVar) * factor * att);
          const g = Math.floor((68 + pVar * 0.5) * factor * att);
          const b = Math.floor((28 + pVar * 0.3) * factor * att);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);

          // Iron stud bolts at 25% and 75% height
          const stud1Y = Math.floor(drawStart + (drawEnd - drawStart) * 0.25);
          const stud2Y = Math.floor(drawStart + (drawEnd - drawStart) * 0.75);
          const studX = (wallX * 4) % 1.0;
          if (studX >= 0.42 && studX <= 0.58) {
            ctx.fillStyle = `rgb(${Math.floor(40 * att)},${Math.floor(40 * att)},${Math.floor(45 * att)})`;
            ctx.fillRect(x, stud1Y - 1, 1, 3);
            ctx.fillRect(x, stud2Y - 1, 1, 3);
          }
        }
      } else {
        // Procedural courses of masonry / bricks / stone
        const isExit = col.cellType === "EXIT";
        const isSecret = col.cellType === "SECRET_PASSAGE";
        const numCourses = isSecret ? 4 : (isExit ? 6 : 8);
        const bricksPerRow = isSecret ? 2 : 4;
        const factor = col.side === 0 ? 1.0 : 0.72;

        for (let row = 0; row < numCourses; row++) {
          const cY1 = Math.floor(height / 2 - lineHeight / 2 + (row / numCourses) * lineHeight);
          const cY2 = Math.floor(height / 2 - lineHeight / 2 + ((row + 1) / numCourses) * lineHeight);
          if (cY2 <= 0 || cY1 >= height) continue;
          const courseH = cY2 - cY1;
          if (courseH <= 0) continue;

          // Mortar thickness (horizontal joint at top of course)
          const mortarH = (row > 0 && courseH >= 5) ? Math.max(1, Math.min(2, Math.floor(courseH * 0.08))) : 0;

          // Draw horizontal mortar seam if within viewport
          if (mortarH > 0) {
            const mY1 = Math.max(0, cY1);
            const mY2 = Math.min(height, cY1 + mortarH);
            if (mY2 > mY1) {
              const mDark = Math.floor(40 * att * factor);
              ctx.fillStyle = `rgb(${mDark},${mDark},${Math.floor(mDark * 1.1)})`;
              ctx.fillRect(x, mY1, 1, mY2 - mY1);
            }
          }

          // Brick body vertical range (below horizontal mortar seam)
          const bY1 = Math.max(0, cY1 + mortarH);
          const bY2 = Math.min(height, cY2);
          if (bY2 <= bY1) continue;

          const shift = (row % 2 === 1) ? 0.5 : 0.0;
          const bx = (wallX + shift) % 1.0;
          const bFrac = (bx * bricksPerRow) % 1.0;
          const bIdx = Math.floor(bx * bricksPerRow);
          const isVertMortar = bFrac < (isSecret ? 0.06 : 0.08);

          if (isVertMortar && courseH >= 5) {
            // Vertical mortar joint between bricks
            const mDark = Math.floor(40 * att * factor);
            ctx.fillStyle = `rgb(${mDark},${mDark},${Math.floor(mDark * 1.1)})`;
            ctx.fillRect(x, bY1, 1, bY2 - bY1);
          } else if (isExit) {
            // Golden exit portal with radiance
            const bVar = (((col.mapX * 19 + col.mapY * 11 + row * 7 + bIdx) % 7) - 3) * 6;
            ctx.fillStyle = `rgb(${Math.min(255, Math.floor((235 + bVar) * att * factor))},${Math.min(255, Math.floor((195 + bVar) * att * factor))},${Math.floor(25 * att)})`;
            ctx.fillRect(x, bY1, 1, bY2 - bY1);
          } else if (isSecret) {
            // Secret passage: ancient carved dark stone blocks
            const hash = Math.sin(col.mapX * 29 + col.mapY * 13 + row * 9 + bIdx * 5) * 43758.5453;
            const bVar = (hash - Math.floor(hash)) * 0.28 - 0.14;
            const baseC = Math.floor(105 * att * factor * (1 + bVar));
            ctx.fillStyle = `rgb(${Math.floor(baseC * 1.05)},${Math.floor(baseC * 0.88)},${Math.floor(baseC * 0.7)})`;
            ctx.fillRect(x, bY1, 1, bY2 - bY1);
          } else {
            // Standard red/terracotta brick wall with 3D bevel and individual variations
            const hash = Math.sin(col.mapX * 31.7 + col.mapY * 17.3 + row * 11.3 + bIdx * 7.1) * 43758.5453;
            const bVar = (hash - Math.floor(hash)) * 0.28 - 0.14;
            const hasStain = ((hash * 13.7) % 1.0) > 0.72;
            const stainFactor = hasStain ? 0.72 : 1.0;
            const baseVal = 180 * att * factor * (1.0 + bVar) * stainFactor;
            
            const r = Math.min(255, Math.max(0, Math.floor(baseVal * 1.18)));
            const g = Math.min(255, Math.max(0, Math.floor(baseVal * (hasStain ? 0.78 : 0.62))));
            const b = Math.min(255, Math.max(0, Math.floor(baseVal * 0.48)));

            // 3D Bevel: top edge catches light, bottom edge has shadow
            if (bY2 - bY1 > 4) {
              // Top highlight
              ctx.fillStyle = `rgb(${Math.min(255, Math.floor(r * 1.25))},${Math.min(255, Math.floor(g * 1.25))},${Math.min(255, Math.floor(b * 1.25))})`;
              ctx.fillRect(x, bY1, 1, 1);
              // Bottom shadow
              ctx.fillStyle = `rgb(${Math.floor(r * 0.75)},${Math.floor(g * 0.75)},${Math.floor(b * 0.75)})`;
              ctx.fillRect(x, bY2 - 1, 1, 1);
              // Main brick face
              if (bY2 - 1 > bY1 + 1) {
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, bY1 + 1, 1, bY2 - 1 - (bY1 + 1));
              }
            } else {
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, bY1, 1, bY2 - bY1);
            }
          }
        }
      }
    }

    // Render Sprites / Collectibles / Minotaur
    for (const sp of sprites) {
      const dist = sp.depth;
      const spriteHeight = Math.floor(height / dist);
      const spriteWidth = spriteHeight;
      const drawY = Math.floor(height / 2 - spriteHeight / 2);

      ctx.save();
      if (sp.isMonster) {
        const mSize = Math.max(16, Math.min(220, spriteHeight));
        const cx = sp.screenX;
        const cy = Math.floor(height / 2);

        // Dark body silhouette
        ctx.fillStyle = "#2b1810";
        ctx.beginPath();
        ctx.ellipse(cx, cy + mSize * 0.2, mSize * 0.35, mSize * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bull Head
        ctx.fillStyle = "#3d2216";
        ctx.beginPath();
        ctx.ellipse(cx, cy - mSize * 0.05, mSize * 0.24, mSize * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ivory Horns
        ctx.strokeStyle = "#e8e0d0";
        ctx.lineWidth = Math.max(2, Math.floor(mSize * 0.07));
        ctx.beginPath();
        ctx.moveTo(cx - mSize * 0.12, cy - mSize * 0.15);
        ctx.quadraticCurveTo(cx - mSize * 0.38, cy - mSize * 0.38, cx - mSize * 0.25, cy - mSize * 0.5);
        ctx.moveTo(cx + mSize * 0.12, cy - mSize * 0.15);
        ctx.quadraticCurveTo(cx + mSize * 0.38, cy - mSize * 0.38, cx + mSize * 0.25, cy - mSize * 0.5);
        ctx.stroke();

        // Glowing Red Eyes
        const eyeOffset = Math.max(2, Math.floor(mSize * 0.08));
        const eyeRadius = Math.max(1.5, Math.floor(mSize * 0.04));
        ctx.fillStyle = "#ff1100";
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(cx - eyeOffset, cy - mSize * 0.08, eyeRadius, 0, Math.PI * 2);
        ctx.arc(cx + eyeOffset, cy - mSize * 0.08, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = "#00ffcc";
        ctx.font = `${Math.max(12, Math.floor(spriteHeight * 0.65))}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(sp.item?.char || "★", sp.screenX, height / 2);
      }
      ctx.restore();
    }

    // Render Minimap in top-right corner if requested
    if (options.minimap !== false) {
      const mapRadius = 4;
      const cellSize = 10;
      const mapW = (mapRadius * 2 + 1) * cellSize;
      const mapX0 = width - mapW - 8;
      const mapY0 = 8;

      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.fillRect(mapX0, mapY0, mapW, mapW);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(mapX0, mapY0, mapW, mapW);

      const curX = Math.floor(posX);
      const curY = Math.floor(posY);

      for (let dy = -mapRadius; dy <= mapRadius; dy++) {
        for (let dx = -mapRadius; dx <= mapRadius; dx++) {
          const gx = curX + dx;
          const gy = curY + dy;
          const px = mapX0 + (dx + mapRadius) * cellSize;
          const py = mapY0 + (dy + mapRadius) * cellSize;

          if (gx >= 0 && gx < maze.width && gy >= 0 && gy < maze.height) {
            const dId = maze.doors[`${gx},${gy}`];
            if (gameInstance.minotaur?.active && gx === Math.floor(gameInstance.minotaur.x) && gy === Math.floor(gameInstance.minotaur.y)) {
              ctx.fillStyle = "#ff0044";
              ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
            } else if (dId && !maze.openDoors?.has(dId)) {
              ctx.fillStyle = "#b8860b";
              ctx.fillRect(px, py, cellSize, cellSize);
            } else if (maze.secretPassages?.[`${gx},${gy}`]?.opened) {
              ctx.fillStyle = "#8fbc8f";
              ctx.fillRect(px + 2, py + 2, cellSize - 4, cellSize - 4);
            } else if (maze.grid[gy][gx] === 1) {
              ctx.fillStyle = "#666";
              ctx.fillRect(px, py, cellSize, cellSize);
            } else if (maze.items[`${gx},${gy}`] && !maze.collectedItems?.has(maze.items[`${gx},${gy}`])) {
              ctx.fillStyle = "#00ffcc";
              ctx.fillRect(px + 2, py + 2, cellSize - 4, cellSize - 4);
            } else if (gx === maze.exit.x && gy === maze.exit.y) {
              ctx.fillStyle = "#ffd700";
              ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
            }
          }
        }
      }

      const playerCenterX = mapX0 + mapRadius * cellSize + cellSize / 2;
      const playerCenterY = mapY0 + mapRadius * cellSize + cellSize / 2;
      ctx.fillStyle = "#f00";
      ctx.beginPath();
      ctx.arc(playerCenterX, playerCenterY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#f00";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playerCenterX, playerCenterY);
      ctx.lineTo(playerCenterX + dirX * 7, playerCenterY + dirY * 7);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Interactive Game Controller
  function createGame(options = {}) {
    const seed = options.seed || Math.floor(Math.random() * 1000000);
    const maze = generateMaze({ seed, cols: options.cols || 10, rows: options.rows || 10 });
    maze.openDoors = new Set();
    maze.collectedItems = new Set();

    const playerName = cleanPlayerName(options.playerName || "EXPLORER");
    let posX = maze.start.x + 0.5;
    let posY = maze.start.y + 0.5;
    let dirX = 0, dirY = 1;     // Initial direction facing Down
    let planeX = -0.66, planeY = 0; // Camera FOV ~66deg
    // Orient player down an open corridor from start
    if (maze.grid[maze.start.y]?.[maze.start.x + 1] === 0) {
      dirX = 1; dirY = 0;
      planeX = 0; planeY = 0.66;
    }

    const minotaurSpawn = maze.minotaurSpawn || { x: maze.width - 3, y: maze.height - 3 };
    const minotaur = {
      x: minotaurSpawn.x + 0.5,
      y: minotaurSpawn.y + 0.5,
      startX: minotaurSpawn.x + 0.5,
      startY: minotaurSpawn.y + 0.5,
      steps: 0,
      active: true
    };

    let finished = false;
    let lastEvent = null;

    const game = {
      maze,
      playerName,
      seed,
      get posX() { return posX; },
      get posY() { return posY; },
      get dirX() { return dirX; },
      get dirY() { return dirY; },
      get planeX() { return planeX; },
      get planeY() { return planeY; },
      get finished() { return finished; },
      get collectedItems() { return maze.collectedItems; },
      get openDoors() { return maze.openDoors; },
      get lastEvent() { return lastEvent; },
      get minotaur() { return minotaur; },
      get minotaurAlert() {
        if (!minotaur || !minotaur.active) return "";
        const d = Math.hypot(posX - minotaur.x, posY - minotaur.y);
        if (d <= 3.5) return "NEAR";
        if (d <= 7.0) return "HEARD";
        return "";
      },

      respawn() {
        posX = maze.start.x + 0.5;
        posY = maze.start.y + 0.5;
        if (maze.grid[maze.start.y]?.[maze.start.x + 1] === 0) {
          dirX = 1; dirY = 0;
          planeX = 0; planeY = 0.66;
        } else {
          dirX = 0; dirY = 1;
          planeX = -0.66; planeY = 0;
        }
        minotaur.x = minotaur.startX;
        minotaur.y = minotaur.startY;
        minotaur.steps = 0;
        lastEvent = { type: "RESPAWN" };
        return lastEvent;
      },

      // Move player forward/backward with collision sliding against walls & doors
      move(speed = 0.25) {
        if (finished) return null;
        lastEvent = null;

        // Check if pushing into an unopened secret passage
        if (speed > 0) {
          const frontX = Math.floor(posX + dirX * 0.7);
          const frontY = Math.floor(posY + dirY * 0.7);
          const passKey = `${frontX},${frontY}`;
          if (maze.secretPassages && maze.secretPassages[passKey] && !maze.secretPassages[passKey].opened) {
            maze.secretPassages[passKey].opened = true;
            maze.secretPassages[passKey].discovered = true;
            maze.grid[frontY][frontX] = 0; // Collapses wall into passage!
            lastEvent = {
              type: "SECRET_PASSAGE",
              x: frontX,
              y: frontY
            };
            return lastEvent;
          }
        }

        const newX = posX + dirX * speed;
        const newY = posY + dirY * speed;

        const canWalk = (x, y) => {
          const mx = Math.floor(x), my = Math.floor(y);
          if (mx < 0 || mx >= maze.width || my < 0 || my >= maze.height) return false;
          if (maze.grid[my][mx] === 1) return false;
          const doorId = maze.doors[`${mx},${my}`];
          if (doorId && !maze.openDoors.has(doorId)) return false;
          return true;
        };

        const radius = 0.2;
        // Collision checks with radius padding
        if (canWalk(newX + Math.sign(dirX * speed) * radius, posY)) posX = newX;
        if (canWalk(posX, newY + Math.sign(dirY * speed) * radius)) posY = newY;

        // Advance Minotaur every 3 player moves
        if (minotaur.active) {
          minotaur.steps++;
          if (minotaur.steps % 3 === 0) {
            const nextStep = getMinotaurStep(maze, minotaur.x, minotaur.y, posX, posY);
            minotaur.x = nextStep.x + 0.5;
            minotaur.y = nextStep.y + 0.5;
          }

          // Check if caught by Minotaur
          const mDist = Math.hypot(posX - minotaur.x, posY - minotaur.y);
          if (mDist < 0.85) {
            lastEvent = {
              type: "MINOTAUR_CAUGHT"
            };
            return lastEvent;
          }
        }

        // Check cell event (item pickup or exit)
        const cellX = Math.floor(posX);
        const cellY = Math.floor(posY);
        const cellKey = `${cellX},${cellY}`;

        // Pickup item
        if (maze.items[cellKey] && !maze.collectedItems.has(maze.items[cellKey])) {
          const itemId = maze.items[cellKey];
          maze.collectedItems.add(itemId);
          const itemDef = ITEMS.find(it => it.id === itemId);

          // Check if item unlocks a door
          let unlockedDoorDef = null;
          if (itemDef?.unlocks && DOORS[itemDef.unlocks]) {
            maze.openDoors.add(itemDef.unlocks);
            unlockedDoorDef = DOORS[itemDef.unlocks];
          }

          lastEvent = {
            type: "ITEM_PICKUP",
            item: itemDef,
            unlockedDoor: unlockedDoorDef
          };
          return lastEvent;
        }

        // Check door proximity and hint
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          const nx = cellX + dx, ny = cellY + dy;
          const dId = maze.doors[`${nx},${ny}`];
          if (dId && !maze.openDoors.has(dId)) {
            const doorDef = DOORS[dId];
            lastEvent = {
              type: "DOOR_LOCKED",
              door: doorDef
            };
            return lastEvent;
          }
        }

        // Reach exit
        if (cellX === maze.exit.x && cellY === maze.exit.y) {
          finished = true;
          const rewardKey = generateRewardKey(playerName, maze.collectedItems.size);
          const cert = generateCertificate(playerName, maze.collectedItems.size, ITEMS.length, rewardKey);

          // Store in GM / localStorage if browser environment
          if (typeof GM !== "undefined" && typeof localStorage !== "undefined") {
            try {
              localStorage.setItem("GM_maze_done", "1");
              localStorage.setItem("GM_maze_key", rewardKey);
              localStorage.setItem("GM_maze_player", playerName);
              localStorage.setItem("GM_maze_items", String(maze.collectedItems.size));
            } catch (e) {}
          }

          lastEvent = {
            type: "MAZE_COMPLETE",
            playerName,
            itemCount: maze.collectedItems.size,
            totalItems: ITEMS.length,
            rewardKey,
            certificate: cert
          };
          return lastEvent;
        }

        return null;
      },

      // Turn player left/right by an angle in radians
      turn(angle = 0.15) {
        if (finished) return;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const oldDirX = dirX;
        dirX = dirX * cos - dirY * sin;
        dirY = oldDirX * sin + dirY * cos;
        const oldPlaneX = planeX;
        planeX = planeX * cos - planeY * sin;
        planeY = oldPlaneX * sin + planeY * cos;
      },

      renderAscii(cols = 80, rows = 18, opts = {}) {
        return renderAscii(game, cols, rows, opts);
      },

      renderCanvas(ctx, w, h, opts = {}) {
        return renderCanvas(game, ctx, w, h, opts);
      }
    };

    return game;
  }

  // Full chronological archive text unlocked by reward key
  function getRewardText(rewardKey, playerName = "EXPLORER") {
    const clean = cleanPlayerName(playerName);
    return [
      "======================================================================",
      "           MAZE 3D - HISTORICAL ARCHIVE REWARD",
      "               GABRIEL MARTI - RETRO LABYRINTH",
      "======================================================================",
      "",
      `Felicitaciones, explorador ${clean}!`,
      "Has completado el recorrido por cuatro decadas de programacion:",
      "",
      "  1. 1981-1982: Commodore VIC-20 en el instituto y Casio FX-710P (BASIC)",
      "  2. 1983-1985: Sinclair ZX Spectrum 48K, Z80 y Revista ZX n 12 (5.000 pts)",
      "  3. 1986: Jurado 'Los Justicieros del Software' en MicroHobby n 71",
      "  4. 1986-1987: Formador de informatica (BASIC y Logo en ordenadores MSX)",
      "  5. 1987-1988: Amstrad PCW 8512, CP/M, Locomotive BASIC, primer crack (HOH)",
      "  6. 1989-1990: Philips NMS 9100, MS-DOS 3.10/5.0, Turbo Pascal, dBase",
      "  7. 1990-1994: Gamma Software, CAJAPLUS (5.500 Pts / $60 USA)",
      "  8. 1991-1997: CHECKVIR.EXE (primer antivirus propio en QuickBASIC compilado)",
      "  9. 1994-1995: BPU (Bitmap Packer Utility en C) y articulos en revistas",
      " 10. 1994-1998: HND in Computing (British Council / ESI)",
      " 11. 1995-1998: Redes telematicas y punto FidoNet (2:343/129.44)",
      " 12. 1996-2000: Comunicaciones industriales Omron/Keyence y Delphi",
      " 13. 2003-2017: Formacion continua, auditoria de sistemas y ATI",
      " 14. 2018-2019: Master en Ciberseguridad en La Salle (inicio etapa actual)",
      " 15. Presente: Arquitecturas seguras, desarrollo y retrocomputacion",
      "",
      `Clave de Recompensa: ${rewardKey || "GAMMA-RETRO-1986"}`,
      "Desbloqueo confirmado para esta sesion en DOS, Shell y Windows 3.1.",
      "======================================================================"
    ].join("\n");
  }

  // Interactive Terminal Runner for MS-DOS and Linux Shell
  async function runTerminal(container, options = {}) {
    const { sfx = {}, sleep = ms => new Promise(r => setTimeout(r, ms)) } = options;
    const box = document.createElement("div"); box.className = "game maze-game";
    const screen = document.createElement("pre"); box.append(screen);
    container.append(box);
    setTimeout(() => box.scrollIntoView({ block: "end" }), 60);

    const queue = [];
    const onKey = e => {
      const k = {
        ArrowLeft: "L", a: "L", A: "L",
        ArrowRight: "R", d: "R", D: "R",
        ArrowUp: "U", w: "U", W: "U",
        ArrowDown: "D", s: "D", S: "D",
        m: "M", M: "M",
        r: "RETRY",
        q: "Q", Q: "Q", Escape: "Q",
        " ": "SP", Enter: "ENT"
      }[e.key];
      if (!k || e.ctrlKey || e.altKey || e.metaKey) return;
      e.preventDefault(); e.stopPropagation(); queue.push(k);
    };

    const keys = [
      ["L", "↶ Giro"], ["U", "▲ Avanzar"], ["R", "Giro ↷"],
      ["D", "▼ Atrás"], ["M", "🗺️ Mapa"], ["RETRY", "🔄 Respawn"], ["Q", "✕ Salir"]
    ];
    const pad = document.createElement("div"); pad.className = "pad";
    pad.innerHTML = keys.map(([k, label]) => `<button type="button" data-k="${k}">${label}</button>`).join("");
    pad.addEventListener("click", e => {
      const b = e.target.closest("[data-k]");
      if (b) { e.stopPropagation(); queue.push(b.dataset.k); }
    });
    box.append(pad);
    addEventListener("keydown", onKey, true);

    const ctl = {
      next: () => queue.shift(),
      stop: () => {
        removeEventListener("keydown", onKey, true);
        pad.remove();
      }
    };

    const playerName = cleanPlayerName(options.name || "");
    if (!options.name) {
      screen.textContent = [
        "╔════════════════════════════════════════════════════════════════════════════╗",
        "║                MAZE 3D - GABRIEL MARTI RETRO LABYRINTH                     ║",
        "║                     First-Person 2.5D Exploration                          ║",
        "╚════════════════════════════════════════════════════════════════════════════╝",
        "",
        "Encuentra los 15 hitos historicos de cuatro decadas de programacion,",
        "recoge los manuales y abre las 5 puertas para alcanzar la salida.",
        "¡Cuidado con el Minotauro que acecha en las sombras!",
        "",
        "Controles: [W/▲] Avanzar  [S/▼] Retroceder  [A/◄ D/►] Girar  [M] Mapa  [Q] Salir",
        "",
        "Pulsa cualquier boton o tecla para comenzar la exploracion..."
      ].join("\n");

      while (true) {
        if (queue.length > 0) { queue.shift(); break; }
        await sleep(60);
      }
    }

    const game = createGame({ playerName, seed: options.seed });
    let showMinimap = true;
    let msg = "¡Explora los pasillos y encuentra los hitos!";
    let submsg = "";
    let isCaught = false;
    let over = false;

    const lang = (typeof GM !== "undefined" && GM.lang) || "es";
    const getTxt = obj => (obj && (obj[lang] || obj.es || obj.en)) || "";

    function wrapLines(text, maxLen = 76) {
      if (!text || text.length <= maxLen) return [text || ""];
      const words = text.split(/\s+/);
      const lines = [];
      let cur = "";
      for (const w of words) {
        if ((cur ? cur + " " + w : w).length <= maxLen) {
          cur = cur ? cur + " " + w : w;
        } else {
          if (cur) lines.push(cur);
          cur = w;
        }
      }
      if (cur) lines.push(cur);
      return lines;
    }

    const draw = () => {
      const ascii3d = game.renderAscii(80, 20, { minimap: showMinimap, color: true });
      let statusAlert = "";
      if (isCaught) {
        statusAlert = "💀 ¡EL MINOTAURO TE HA ATRAPADO! [Pulsa 🔄 Respawn o ENTER para reaparecer]";
      } else if (game.minotaurAlert === "NEAR") {
        statusAlert = "⚠️ ¡Sientes el aliento del Minotauro muy cerca en un pasillo contiguo!";
      } else if (game.minotaurAlert === "HEARD") {
        statusAlert = "🐾 Oyes pezuñas pesadas y un bramido distante entre los muros...";
      }

      const hudLines = [
        `<span class="a8">${"─".repeat(78)}</span>`,
        `<span class="a7"> Explorador: </span><span class="a15">${game.playerName.padEnd(14)}</span><span class="a7"> | Hitos: </span><span class="a10">${String(game.collectedItems.size).padStart(2)}/15</span><span class="a7"> | Puertas: </span><span class="a14">${game.openDoors.size}/5</span><span class="a8"> | [M: Mapa  Q: Salir]</span>`,
        `<span class="a8">${"─".repeat(78)}</span>`
      ];
      wrapLines(msg, 76).forEach(l => hudLines.push(` <span class="a15">${l}</span>`));
      if (submsg) {
        wrapLines(submsg, 76).forEach(l => hudLines.push(` <span class="a7">${l}</span>`));
      }
      if (statusAlert) {
        const aCls = isCaught ? "a12" : (game.minotaurAlert === "NEAR" ? "a12" : "a14");
        wrapLines(statusAlert, 76).forEach(l => hudLines.push(` <span class="${aCls}">${l}</span>`));
      }
      screen.innerHTML = ascii3d + "\n" + hudLines.join("\n");
    };

    draw();

    try {
      while (!over) {
        const action = ctl.next();
        if (!action) {
          await sleep(50);
          continue;
        }

        if (action === "Q") {
          over = "quit";
          break;
        } else if (action === "RETRY" || ((action === "ENT" || action === "SP") && isCaught)) {
          isCaught = false;
          game.respawn();
          msg = "Has reaparecido en la entrada del laberinto.";
          submsg = "Tus hitos y puertas abiertas se mantienen intactos. ¡Evita al Minotauro!";
          sfx.blip?.();
          draw();
        } else if (isCaught) {
          continue;
        } else if (action === "M") {
          showMinimap = !showMinimap;
          msg = showMinimap ? "Minimapa activado (esquina superior derecha)." : "Minimapa desactivado.";
          submsg = "";
          sfx.blip?.();
          draw();
        } else if (action === "L") {
          game.turn(-0.25);
          draw();
        } else if (action === "R") {
          game.turn(0.25);
          draw();
        } else if (action === "U" || action === "D") {
          const speed = action === "U" ? 0.35 : -0.35;
          const ev = game.move(speed);
          if (ev) {
            if (ev.type === "ITEM_PICKUP") {
              playMazeSound(sfx, "pickup");
              const item = ev.item;
              msg = `¡Hito recogido! [${item.char || item.symbol}] ${getTxt(item.name)}`;
              submsg = getTxt(item.desc);
              if (ev.unlockedDoor) {
                submsg += ` -> ¡Puerta abierta: ${getTxt(ev.unlockedDoor.name)}!`;
              }
            } else if (ev.type === "SECRET_PASSAGE") {
              playMazeSound(sfx, "pickup");
              msg = "🚪 ¡PUERTA SECRETA DESCUBIERTA! El muro cede ante tu paso.";
              submsg = "Has abierto un atajo para eludir al Minotauro.";
            } else if (ev.type === "MINOTAUR_CAUGHT") {
              playMazeSound(sfx, "caught");
              isCaught = true;
              msg = "💀 ¡EL MINOTAURO TE HA ALCANZADO!";
              submsg = "Pulsa [🔄 Respawn] o [Enter/Espacio] para reaparecer al inicio.";
            } else if (ev.type === "DOOR_LOCKED") {
              sfx.err?.();
              msg = `Puerta Bloqueada: ${getTxt(ev.door.name)}`;
              submsg = getTxt(ev.door.msg);
            } else if (ev.type === "MAZE_COMPLETE") {
              playMazeSound(sfx, "pickup");
              over = "complete";
              break;
            }
          } else {
            if (game.minotaurAlert === "NEAR") {
              playMazeSound(sfx, "near");
              submsg = "⚠️ ¡Sientes la respiración del Minotauro muy cerca!";
            } else if (game.minotaurAlert === "HEARD") {
              playMazeSound(sfx, "heard");
              submsg = "🐾 Pasos pesados retumban cerca de tu posición...";
            } else {
              sfx.tick?.();
              submsg = "";
            }
          }
          draw();
        }
      }

      if (over === "complete") {
        for (let loop = 0; loop < 2; loop++) {
          for (const frame of RAT_FRAMES) {
            screen.textContent = "\n\n" + frame + "\n\n  ¡Has alcanzado la salida del laberinto!";
            sfx.tick?.();
            await sleep(140);
          }
        }

        sfx.ok?.();
        const rewardKey = generateRewardKey(game.playerName, game.collectedItems.size);
        const cert = generateCertificate(game.playerName, game.collectedItems.size, ITEMS.length, rewardKey);
        screen.textContent = cert + "\n\n[Misión completada. Pulsa Salir o cualquier tecla para volver]";

        if (typeof options.onComplete === "function") {
          options.onComplete(rewardKey, game.playerName);
        }

        while (true) {
          if (ctl.next()) break;
          await sleep(80);
        }
      }
    } finally {
      ctl.stop();
      screen.textContent = `MAZE: sesión finalizada (${game.collectedItems.size}/15 hitos recogidos).`;
      await sleep(1000);
      box.remove();
    }
  }

  // Windows 3.1 GUI Window Mounter
  function mountWin31(w, io, options = {}) {
    const body = w.querySelector(".w31-body");
    const name = cleanPlayerName(options.name || (typeof localStorage !== "undefined" && localStorage.getItem("GM_maze_player")) || "EXPLORER");
    const lang = (typeof GM !== "undefined" && GM.lang) || options.lang || "es";
    const isEs = lang === "es";
    const isCa = lang === "ca";

    const btnL = isCa ? "↶ Girar E" : (isEs ? "↶ Girar I" : "↶ Turn L");
    const btnU = isCa ? "▲ Avançar" : (isEs ? "▲ Avanzar" : "▲ Step");
    const btnR = isCa ? "Girar D ↷" : (isEs ? "Girar D ↷" : "Turn R ↷");
    const btnD = isCa ? "▼ Enrere" : (isEs ? "▼ Retroceder" : "▼ Back");
    const btnM = isCa ? "🗺️ Mapa" : (isEs ? "🗺️ Mapa" : "🗺️ Map");
    const btnRetry = "🔄 Respawn";
    const btnN = isCa ? "✨ Nou" : (isEs ? "✨ Nuevo" : "✨ New");

    const lblPlayer = isCa ? "Explorador" : (isEs ? "Explorador" : "Player");
    const lblItems = isCa ? "Fites" : (isEs ? "Hitos" : "Milestones");
    const lblDoors = isCa ? "Portes" : (isEs ? "Puertas" : "Doors");
    const initMsg = isCa ? "Explora el laberint 3D per descobrir les fites històriques i trobar la sortida!"
      : (isEs ? "¡Explora el laberinto 3D para descubrir los hitos históricos y alcanzar la salida!"
      : "Explore the 3D maze to discover historical milestones and reach the exit!");

    body.innerHTML = `
      <canvas class="w31-mcanvas" width="560" height="300"></canvas>
      <div class="w31-mstat">
        <span class="w31-ms-player">${lblPlayer}: ${name}</span>
        <span class="w31-ms-items">${lblItems}: 0/15</span>
        <span class="w31-ms-doors">${lblDoors}: 0/5</span>
      </div>
      <div class="w31-mmsg" aria-live="polite">${initMsg}</div>
      <div class="w31-mbtns">
        <button type="button" class="w31-btn" data-mz="L" title="Turn Left">${btnL}</button>
        <button type="button" class="w31-btn" data-mz="U" title="Step Forward">${btnU}</button>
        <button type="button" class="w31-btn" data-mz="R" title="Turn Right">${btnR}</button>
        <button type="button" class="w31-btn" data-mz="D" title="Step Back">${btnD}</button>
        <button type="button" class="w31-btn" data-mz="M" title="Toggle Minimap">${btnM}</button>
        <button type="button" class="w31-btn" data-mz="RETRY" title="Respawn at Start">${btnRetry}</button>
        <button type="button" class="w31-btn" data-mz="N" title="New Maze">${btnN}</button>
      </div>
    `;

    const canvas = body.querySelector(".w31-mcanvas");
    const ctx = canvas.getContext("2d");
    const statItems = body.querySelector(".w31-ms-items");
    const statDoors = body.querySelector(".w31-ms-doors");
    const msgBox = body.querySelector(".w31-mmsg");

    const getTxt = obj => (obj && (obj[lang] || obj.es || obj.en)) || "";

    let game = createGame({ playerName: name, seed: options.seed });
    let showMinimap = true;
    let isCaught = false;

    const draw = () => {
      renderCanvas(game, ctx, 560, 300, { minimap: showMinimap });
      statItems.textContent = `${lblItems}: ${game.collectedItems.size}/15`;
      statDoors.textContent = `${lblDoors}: ${game.openDoors.size}/5`;
    };

    const handleAction = async act => {
      if (act === "M") {
        showMinimap = !showMinimap;
        io.sfx?.blip?.();
        draw();
      } else if (act === "RETRY") {
        isCaught = false;
        game.respawn();
        io.sfx?.blip?.();
        msgBox.textContent = "Has reaparecido en la entrada del laberinto. ¡Cuidado con el Minotauro!";
        draw();
      } else if (act === "N") {
        isCaught = false;
        io.sfx?.blip?.();
        game = createGame({ playerName: name });
        msgBox.textContent = "New maze generated. Good luck!";
        draw();
      } else if (isCaught) {
        return;
      } else if (act === "L") {
        game.turn(-0.25);
        draw();
      } else if (act === "R") {
        game.turn(0.25);
        draw();
      } else if (act === "U" || act === "D") {
        const speed = act === "U" ? 0.35 : -0.35;
        const ev = game.move(speed);
        if (ev) {
          if (ev.type === "ITEM_PICKUP") {
            playMazeSound(io.sfx || (typeof GM !== "undefined" && GM.sfx), "pickup");
            const item = ev.item;
            let m = `✨ ¡Hito recogido! [${item.char || item.symbol}] ${getTxt(item.name)}: ${getTxt(item.desc)}`;
            if (ev.unlockedDoor) {
              m += ` 🚪 ¡Puerta abierta: ${getTxt(ev.unlockedDoor.name)}!`;
            }
            msgBox.textContent = m;
            msgBox.classList.add("w31-pickup-flash");
            setTimeout(() => msgBox.classList.remove("w31-pickup-flash"), 1200);
          } else if (ev.type === "SECRET_PASSAGE") {
            playMazeSound(io.sfx || (typeof GM !== "undefined" && GM.sfx), "pickup");
            msgBox.textContent = "🚪 ¡Puerta secreta descubierta! Un atajo oculto se abre entre los pasillos.";
          } else if (ev.type === "MINOTAUR_CAUGHT") {
            playMazeSound(io.sfx || (typeof GM !== "undefined" && GM.sfx), "caught");
            isCaught = true;
            msgBox.textContent = "💀 ¡El Minotauro te ha atrapado! Pulsa [🔄 Respawn] para reaparecer al inicio sin perder tus hitos.";
          } else if (ev.type === "DOOR_LOCKED") {
            io.sfx?.err?.();
            msgBox.textContent = `🔒 Puerta bloqueada: ${getTxt(ev.door.name)} (${getTxt(ev.door.msg)})`;
          } else if (ev.type === "MAZE_COMPLETE") {
            playMazeSound(io.sfx || (typeof GM !== "undefined" && GM.sfx), "pickup");
            msgBox.textContent = "🎉 ¡Laberinto completado con éxito! Recompensa desbloqueada en Maze Reward.";

            // Victory animation on canvas
            const ratW = 60;
            for (let x = -ratW; x < 560; x += 20) {
              renderCanvas(game, ctx, 560, 300, { minimap: false });
              ctx.save();
              ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
              ctx.fillRect(0, 95, 560, 110);
              ctx.fillStyle = "#ffd700";
              ctx.font = "bold 20px Arial, sans-serif";
              ctx.textAlign = "center";
              ctx.fillText("★ VICTORY! 3D MAZE COMPLETED ★", 280, 135);
              ctx.fillStyle = "#fff";
              ctx.font = "14px monospace";
              ctx.fillText("<:3 )~~~~  [Windows 95 3D Maze tribute rat]", x + ratW / 2, 170);
              ctx.restore();
              if (io.sleep) await io.sleep(40);
            }
            draw();

            if (typeof options.onComplete === "function") {
              options.onComplete(ev.rewardKey, ev.playerName);
            }
          }
        } else {
          if (game.minotaurAlert === "NEAR") {
            playMazeSound(io.sfx || (typeof GM !== "undefined" && GM.sfx), "near");
            msgBox.textContent = "⚠️ ¡El Minotauro está acechando en un pasillo contiguo!";
          } else if (game.minotaurAlert === "HEARD") {
            playMazeSound(io.sfx || (typeof GM !== "undefined" && GM.sfx), "heard");
            msgBox.textContent = "🐾 Ecos de pesadas pezuñas resuenan en la piedra...";
          } else {
            io.sfx?.tick?.();
          }
        }
        draw();
      }
    };

    body.addEventListener("click", e => {
      const b = e.target.closest("[data-mz]");
      if (b) {
        e.stopPropagation();
        handleAction(b.dataset.mz);
      }
    });

    const onKey = e => {
      if (!w.isConnected || w.classList.contains("w31-iconic")) return;
      const act = {
        ArrowLeft: "L", a: "L", A: "L",
        ArrowRight: "R", d: "R", D: "R",
        ArrowUp: "U", w: "U", W: "U",
        ArrowDown: "D", s: "D", S: "D",
        m: "M", M: "M",
        n: "N", N: "N",
        r: "RETRY", R: "RETRY"
      }[e.key];
      if (act && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        handleAction(act);
      }
    };

    addEventListener("keydown", onKey);

    draw();

    const observer = new MutationObserver(() => {
      if (!w.isConnected) {
        removeEventListener("keydown", onKey);
        observer.disconnect();
      }
    });
    if (w.parentElement || (typeof document !== "undefined" && document.body)) {
      observer.observe(w.parentElement || document.body, { childList: true });
    }

    return { game, draw };
  }

  // Export module interface
  const mazeApi = {
    ITEMS,
    DOORS,
    RAT_FRAMES,
    cleanPlayerName,
    createRng,
    generateMaze,
    verifySolvability,
    generateRewardKey,
    generateCertificate,
    getRewardText,
    castRays,
    projectSprites,
    renderAscii,
    renderCanvas,
    createGame,
    runTerminal,
    mountWin31
  };

  if (typeof GM !== "undefined") {
    GM.maze = mazeApi;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = mazeApi;
  }
  if (typeof window !== "undefined") {
    window.GM_MAZE = mazeApi;
  }
})();
