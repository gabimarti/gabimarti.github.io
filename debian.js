// 1998 Debian 2.0 boot (GRUB -> Linux 2.0 kernel messages -> SysV init -> login) for gabimarti.github.io.
// Loaded on demand by site.js from the GRUB entry; resolves "shell" so site.js opens gmsh. Any key or tap fast-forwards.
"use strict";
(() => {
  const { sleep, sfx } = GM;
  // [text, pause ms after it]
  const LOG = [
    ["  Booting 'Debian GNU/Linux'\n\nroot (hd0,0)\n Filesystem type is ext2fs, partition type 0x83\nkernel /vmlinuz-2.0.34 root=/dev/hda1 ro\n   [Linux-bzImage, setup=0x1400, size=0xa2b80]\n\n", 900],
    ["Uncompressing Linux... ", 1100], ["Ok, booting the kernel.\n", 500],
    ["Linux version 2.0.34 (root@gabimarti) (gcc version 2.7.2.3) #1 Mon Jul 6 21:12:04 CEST 1998\n", 120],
    ["Console: 16 point font, 400 scans\nConsole: colour VGA+ 80x25, 1 virtual console (max 63)\n", 120],
    ["Calibrating delay loop.. ", 700], ["ok - 33.28 BogoMIPS\n", 100],
    ["Memory: 63104k/65536k available (744k kernel code, 384k reserved, 1304k data)\n", 150],
    ["Swansea University Computer Society NET3.035 for Linux 2.0\nNET3: Unix domain sockets 0.13 for Linux NET3.035.\nSwansea University Computer Society TCP/IP for NET3.034\nIP Protocols: IGMP, ICMP, UDP, TCP\n", 200],
    ["VFS: Diskquotas version dquot_5.6.0 initialized\n", 80],
    ["Checking 386/387 coupling... Ok, fpu using exception 16 error reporting.\nChecking 'hlt' instruction... Ok.\n", 200],
    ["Serial driver version 4.13 with no serial options enabled\ntty00 at 0x03f8 (irq = 4) is a 16550A\ntty01 at 0x02f8 (irq = 3) is a 16550A\nlp1 at 0x0378, (polling)\n", 200],
    ["PCI: PCI BIOS revision 2.10 entry at 0xfd8d1\n", 150],
    ["hda: GM-HDD 1986MB, 1986MB w/256kB Cache, CHS=4092/16/63\nhdc: CD-ROM 52X, ATAPI CDROM drive\nhdd: ZIP 100, ATAPI FLOPPY drive\n", 500],
    ["ide0 at 0x1f0-0x1f7,0x3f6 on irq 14\nide1 at 0x170-0x177,0x376 on irq 15\n", 150],
    ["Floppy drive(s): fd0 is 1.44M\nFDC 0 is a post-1991 82077\n", 300],
    ["Partition check:\n hda: hda1 hda2 < hda5 >\n", 400],
    ["VFS: Mounted root (ext2 filesystem) readonly.\nAdding Swap: 65532k swap-space (priority -1)\n", 400],
    ["INIT: version 2.74 booting\n", 300],
    ["Activating swap.\nChecking root file system...\nfsck 1.12, 9-Jul-98 for EXT2 FS 0.5b, 95/08/09\n", 400],
    ["/dev/hda1: clean, 24871/128520 files, 301245/514048 blocks\n", 600],
    ["Remounting root filesystem in read-write mode.\n", 200],
    ["Loading the saved-state of the serial devices...\nConfiguring network interfaces: done.\n", 300],
    ["Starting system log daemon: syslogd klogd.\n", 200],
    ["Starting internet superserver: inetd.\n", 150],
    ["Starting deferred execution scheduler: atd.\nStarting periodic command scheduler: cron.\n", 200],
    ["Starting curiosity daemon: curiousd.\n", 300],
    ["INIT: Entering runlevel: 2\n\n", 500],
    ["Debian GNU/Linux 2.0 gabimarti.github.io tty1\n\n", 600],
  ];
  const DAYS = "Sun Mon Tue Wed Thu Fri Sat".split(" "), MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");

  let fast = false;
  const skip = e => { if (e.type === "keydown") { e.preventDefault(); e.stopPropagation(); } fast = true; };
  const wait = ms => fast ? 0 : sleep(ms);
  async function typeIn(el, text, echo = true) {        // a person typing at the login prompt
    for (const c of text) { if (echo) el.append(c); if (!fast) { sfx.clack(c); await sleep(70 + Math.random() * 90); } }
  }

  GM.debian = {
    async open(container) {
      const main = container.closest("main"), out = document.createElement("div"); container.append(out);
      const add = t => { out.append(t); main.scrollTop = main.scrollHeight; };
      fast = false;
      document.addEventListener("keydown", skip, true); document.addEventListener("click", skip, true);
      try {
        for (const [t, ms] of LOG) { add(t); await wait(ms); }
        add("gabimarti.github.io login: "); await wait(700); await typeIn(out, "gabimarti"); add("\n");
        add("Password: "); await wait(400); await typeIn(out, "********", false); add("\n"); await wait(600);
        const d = GM.now();
        add(`Last login: ${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()} on tty1\nLinux gabimarti 2.0.34 #1 Mon Jul 6 21:12:04 CEST 1998 i486 unknown\n`);
        await wait(1200);
      } finally {
        document.removeEventListener("keydown", skip, true); document.removeEventListener("click", skip, true);
      }
      return "shell";
    },
  };
})();
