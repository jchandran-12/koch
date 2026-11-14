(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const root = document.documentElement;

  const confettiColors = ["#c9a24d", "#e6cf94", "#fffdf8", "#9a7425"];
  const fire = (opts = {}) => {
    if (reduceMotion || typeof window.confetti !== "function") return;
    window.confetti({ colors: confettiColors, disableForReducedMotion: true, zIndex: 2100, ...opts });
  };

  // ── Background music (only if assets/music/song.mp3 exists) ──
  const audio = new Audio("assets/music/song.mp3");
  audio.loop = true;
  let audioReady = false;
  let musicBtn = null;
  const setPlaying = (on) => {
    if (!musicBtn) return;
    musicBtn.classList.toggle("playing", on);
    musicBtn.setAttribute("aria-label", on ? "Pause music" : "Play music");
  };
  audio.addEventListener("canplaythrough", () => {
    if (audioReady) return;
    audioReady = true;
    musicBtn = document.createElement("button");
    musicBtn.className = "music-toggle";
    musicBtn.type = "button";
    musicBtn.textContent = "♪";
    musicBtn.addEventListener("click", () => {
      if (audio.paused) audio.play().then(() => setPlaying(true)).catch(() => {});
      else { audio.pause(); setPlaying(false); }
    });
    document.body.appendChild(musicBtn);
    setPlaying(!audio.paused);
  }, { once: true });
  audio.load();

  // ── Gift overlay: opening it reveals the page ──
  const overlay = $(".gift-overlay");
  const gift = $(".gift", overlay || document);
  const openGift = () => {
    if (root.classList.contains("opened")) return;
    window.scrollTo(0, 0);
    gift && gift.classList.add("open");
    audio.play().then(() => setPlaying(true)).catch(() => {});
    setTimeout(() => fire({ particleCount: 160, spread: 110, startVelocity: 40, origin: { y: 0.55 }, scalar: 0.9 }), 350);
    setTimeout(() => root.classList.add("opened"), reduceMotion ? 0 : 900);
    setTimeout(() => overlay && overlay.remove(), 2200);
  };
  if (gift) gift.addEventListener("click", openGift);
  else root.classList.add("opened");

  // ── Hide the numbers section until a birth date is filled in ──
  const numbers = $("[data-birthdate]");
  const born = numbers && new Date(numbers.dataset.birthdate);
  if (numbers && (!numbers.dataset.birthdate || isNaN(born))) numbers.remove();

  // ── Scroll progress bar ──
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  document.body.appendChild(bar);

  // ── Dot navigation (built from every element with data-nav) ──
  const navSections = $$("[data-nav]");
  if (navSections.length) {
    const nav = document.createElement("nav");
    nav.className = "dot-nav";
    nav.setAttribute("aria-label", "Sections");
    navSections.forEach((sec) => {
      const a = document.createElement("a");
      a.href = `#${sec.id}`;
      a.innerHTML = `<span>${sec.dataset.nav}</span>`;
      a.setAttribute("aria-label", sec.dataset.nav);
      nav.appendChild(a);
    });
    document.body.appendChild(nav);

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        $$("a", nav).forEach((a) => a.classList.toggle("active", a.hash === `#${e.target.id}`));
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    navSections.forEach((s) => navObserver.observe(s));
  }

  // ── Word-by-word quotes (split before reveal so the first frame is hidden) ──
  $$(".word-reveal").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", words.join(" "));
    el.innerHTML = words
      .map((w, i) => `<span class="word" aria-hidden="true" style="--d:${0.3 + i * 0.12}s">${w}</span>`)
      .join(" ");
  });

  // ── Reveal on scroll (with a small stagger between siblings) ──
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-visible");
      e.target.dispatchEvent(new CustomEvent("revealed"));
      obs.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el) => {
    const siblings = $$(":scope > .reveal", el.parentElement);
    el.style.setProperty("--delay", `${Math.min(siblings.indexOf(el), 5) * 0.1}s`);
    revealObserver.observe(el);
  });

  // ── Hero: letters rise in once, gold dust drifts ──
  const heroName = $(".hero-name");
  if (heroName) {
    const text = heroName.textContent.trim();
    heroName.setAttribute("aria-label", text);
    heroName.innerHTML = [...text]
      .map((ch, i) => `<span class="letter-char" aria-hidden="true" style="--i:${i}">${ch === " " ? "&nbsp;" : ch}</span>`)
      .join("");
  }

  const hero = $(".hero");
  const heroContent = $(".hero-content");
  if (hero && !reduceMotion) {
    const dust = document.createElement("div");
    dust.className = "dust";
    dust.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 26; i++) {
      const m = document.createElement("span");
      m.className = "mote";
      m.style.setProperty("--left", `${Math.random() * 100}%`);
      m.style.setProperty("--s", `${2 + Math.random() * 3}px`);
      m.style.setProperty("--x", `${(Math.random() - 0.5) * 80}px`);
      m.style.setProperty("--dur", `${14 + Math.random() * 12}s`);
      m.style.setProperty("--delay", `${-Math.random() * 26}s`);
      dust.appendChild(m);
    }
    hero.appendChild(dust);
  }

  // ── Scroll effects: progress bar, hero fade, chapter parallax ──
  const chapterLinks = $$(".chapter-photo a");
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (reduceMotion) return;
    if (heroContent && y < vh) {
      heroContent.style.transform = `translateY(${y * 0.3}px)`;
      heroContent.style.opacity = String(Math.max(0, 1 - y / (vh * 0.85)));
    }
    chapterLinks.forEach((a) => {
      const r = a.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const centre = (r.top + r.height / 2 - vh / 2) / vh;
      a.style.setProperty("--py", `${(centre * -40).toFixed(1)}px`);
    });
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // ── Typewriter ──
  $$(".typewriter").forEach((el) => {
    const full = el.textContent.trim();
    if (reduceMotion) return;
    el.textContent = "";
    const card = el.closest(".reveal") || el;
    card.addEventListener("revealed", () => {
      el.classList.add("typing");
      let i = 0;
      const tick = () => {
        el.textContent = full.slice(0, ++i);
        if (i < full.length) setTimeout(tick, 32);
        else setTimeout(() => el.classList.remove("typing"), 1500);
      };
      setTimeout(tick, 500);
    }, { once: true });
  });

  // ── Counters (calculated from data-birthdate) ──
  if (numbers && numbers.isConnected) {
    const days = Math.floor((Date.now() - born) / 86400000);
    const stats = { days, hours: days * 24, heartbeats: days * 24 * 60 * 80 };
    $$(".count[data-stat]", numbers).forEach((el) => {
      const target = stats[el.dataset.stat] ?? 0;
      const render = (v) => (el.textContent = Math.round(v).toLocaleString());
      if (reduceMotion) return render(target);
      (el.closest(".reveal") || el).addEventListener("revealed", () => {
        const start = performance.now();
        const dur = 2200;
        const step = (now) => {
          const t = Math.min((now - start) / dur, 1);
          render(target * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, { once: true });
    });
  }

  // ── Gallery: gentle 3D tilt toward the cursor ──
  if (finePointer && !reduceMotion) {
    $$(".g-item a").forEach((a) => {
      a.addEventListener("mousemove", (e) => {
        const r = a.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        a.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
      });
      a.addEventListener("mouseleave", () => (a.style.transform = ""));
    });
  }

  // ── Photo stack: tap to send the top photo to the back ──
  $$(".card-stack").forEach((stack) => {
    let cards = $$(":scope > .stack-card", stack);
    const tilts = [-2, 3, -4, 2, -3];
    const layout = () => cards.forEach((c, i) => {
      c.style.zIndex = String(cards.length - i);
      c.style.setProperty("--t", `translate(${i * 8}px, ${i * 8}px) rotate(${tilts[i % tilts.length]}deg)`);
    });
    layout();
    let busy = false;
    stack.addEventListener("click", () => {
      if (busy || cards.length < 2) return;
      busy = true;
      const top = cards[0];
      top.classList.add("fly");
      setTimeout(() => {
        cards = [...cards.slice(1), top];
        top.classList.remove("fly");
        layout();
        busy = false;
      }, reduceMotion ? 0 : 450);
    });
  });

  // ── Flip cards ──
  const pressable = (el, fn) => {
    el.addEventListener("click", fn);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(e); }
    });
  };
  $$(".flip-card").forEach((card) => pressable(card, () => card.classList.toggle("flipped")));

  // ── Notes: little envelopes that open into a card ──
  const notes = $$(".note");
  if (notes.length) {
    const modal = document.createElement("div");
    modal.className = "note-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = '<div class="note-card"><button class="note-close" type="button" aria-label="Close">×</button><p class="note-title"></p><div class="note-text"></div></div>';
    document.body.appendChild(modal);
    let lastNote = null;
    const close = () => { modal.classList.remove("open"); lastNote && lastNote.focus(); };
    modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest(".note-close")) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("open")) close(); });

    notes.forEach((note) => {
      const env = document.createElement("div");
      env.className = "note-env";
      env.setAttribute("aria-hidden", "true");
      note.prepend(env);
      pressable(note, () => {
        lastNote = note;
        $(".note-title", modal).textContent = $(".note-label", note).textContent;
        $(".note-text", modal).innerHTML = $(".note-body", note).innerHTML;
        modal.classList.add("open");
        $(".note-close", modal).focus();
      });
    });
  }

  // ── Scratch card ──
  $$(".scratch-card").forEach((card) => {
    const canvas = document.createElement("canvas");
    canvas.className = "scratch-foil";
    canvas.setAttribute("aria-hidden", "true");
    card.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;

    const paint = () => {
      w = canvas.width = card.offsetWidth * dpr;
      h = canvas.height = card.offsetHeight * dpr;
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#e6cf94"); g.addColorStop(0.45, "#c9a24d");
      g.addColorStop(0.55, "#e9d39c"); g.addColorStop(1, "#9a7425");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) { // foil sparkle
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.35})`;
        ctx.fillRect(Math.random() * w, Math.random() * h, dpr * 1.5, dpr * 1.5);
      }
      ctx.fillStyle = "rgba(20,33,61,.55)";
      ctx.font = `italic ${Math.round(28 * dpr)}px "Cormorant Garamond", Georgia, serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("for Koch, only", w / 2, h / 2);
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(paint);

    let drawing = false, last = null, moves = 0;
    const point = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (w / r.width), y: (e.clientY - r.top) * (h / r.height) };
    };
    const scratch = (p) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 46 * dpr; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo((last || p).x, (last || p).y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
      if (++moves % 12 === 0) checkDone();
    };
    const checkDone = () => {
      const data = ctx.getImageData(0, 0, w, h).data;
      let clear = 0, total = 0;
      for (let i = 3; i < data.length; i += 4 * 24) { total++; if (data[i] === 0) clear++; }
      if (clear / total > 0.5 && !card.classList.contains("done")) {
        card.classList.add("done");
        const r = card.getBoundingClientRect();
        fire({ particleCount: 70, spread: 80, scalar: 0.8, origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight } });
      }
    };
    canvas.addEventListener("pointerdown", (e) => { drawing = true; last = null; canvas.setPointerCapture(e.pointerId); scratch(point(e)); });
    canvas.addEventListener("pointermove", (e) => { if (drawing) scratch(point(e)); });
    const stop = () => { drawing = false; last = null; checkDone(); };
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);
  });

  // ── Envelope letter ──
  $$(".envelope-wrap").forEach((wrap) => pressable($(".envelope", wrap), () => wrap.classList.add("open")));

  // ── Wishes marquee (duplicated so it loops seamlessly) ──
  $$(".wishes").forEach((box) => {
    const track = document.createElement("div");
    track.className = "wishes-track";
    const items = $$(":scope > .wish", box);
    items.forEach((w) => track.appendChild(w));
    items.forEach((w) => {
      const clone = w.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
    track.style.setProperty("--marquee-dur", `${items.length * 9}s`);
    box.appendChild(track);
  });

  // ── Star sky: each star holds a wish; lit stars join into a constellation ──
  $$(".sky").forEach((sky) => {
    const section = sky.closest(".block");
    const caption = $(".sky-caption", section);
    const wishes = $$(".sky-wishes li", section).map((li) => li.textContent.trim());
    const finalLine = ($(".sky-final", section) || {}).textContent || "";
    const spots = [[10, 38], [22, 70], [33, 26], [46, 58], [57, 20], [68, 64], [80, 32], [91, 66]];

    for (let i = 0; i < 70; i++) { // faint background stars
      const d = document.createElement("span");
      d.className = "sky-dot";
      d.style.left = `${Math.random() * 100}%`;
      d.style.top = `${Math.random() * 100}%`;
      d.style.setProperty("--tw", `${2 + Math.random() * 3}s`);
      d.style.setProperty("--td", `${-Math.random() * 4}s`);
      sky.appendChild(d);
    }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "sky-lines");
    sky.appendChild(svg);

    const lit = [];
    const say = (text) => {
      caption.classList.add("fading");
      setTimeout(() => { caption.textContent = text; caption.classList.remove("fading"); }, 300);
    };
    wishes.forEach((wish, i) => {
      const [x, y] = spots[i % spots.length];
      const star = document.createElement("button");
      star.type = "button";
      star.className = "star-btn";
      star.style.left = `${x}%`;
      star.style.top = `${y}%`;
      star.style.setProperty("--sd", `${(i * 0.3).toFixed(1)}s`);
      star.setAttribute("aria-label", `Wish ${i + 1}`);
      star.addEventListener("click", () => {
        say(wish);
        if (star.classList.contains("lit")) return;
        star.classList.add("lit");
        const prev = lit[lit.length - 1];
        lit.push([x, y]);
        if (prev) {
          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.setAttribute("x1", `${prev[0]}%`); line.setAttribute("y1", `${prev[1]}%`);
          line.setAttribute("x2", `${x}%`); line.setAttribute("y2", `${y}%`);
          svg.appendChild(line);
        }
        if (lit.length === wishes.length && finalLine) {
          setTimeout(() => {
            say(finalLine);
            const r = sky.getBoundingClientRect();
            fire({ particleCount: 90, spread: 120, scalar: 0.7, origin: { y: (r.top + r.height / 2) / innerHeight } });
          }, 2600);
        }
      });
      sky.appendChild(star);
    });
  });

  // ── Floating hearts (used by the hug) ──
  const heartBurst = (x, y, n = 22) => {
    if (reduceMotion) return;
    const colours = ["#c9a24d", "#e6cf94", "#fffdf8", "#f2d7a0"];
    for (let i = 0; i < n; i++) {
      const h = document.createElement("span");
      h.className = "float-heart";
      h.textContent = "♥";
      h.style.left = `${x}px`;
      h.style.top = `${y}px`;
      h.style.setProperty("--c", colours[i % colours.length]);
      h.style.setProperty("--fs", `${14 + Math.random() * 22}px`);
      h.style.setProperty("--x", `${(Math.random() - 0.5) * 320}px`);
      h.style.setProperty("--r", `${(Math.random() - 0.5) * 60}deg`);
      h.style.setProperty("--dur", `${2.2 + Math.random() * 1.8}s`);
      h.style.animationDelay = `${Math.random() * 0.4}s`;
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 4800);
    }
  };

  // ── Candles → wish message → hug heart ──
  $$(".candles-row").forEach((row) => {
    const stage = row.closest(".candles-stage");
    const msg = $(".wish-message", stage);
    const hug = $(".hug", stage);
    const hugMsg = $(".hug-message", stage);
    const n = parseInt(row.dataset.candles, 10) || 7;
    const mid = (n - 1) / 2;

    for (let i = 0; i < n; i++) {
      const c = document.createElement("div");
      c.className = "candle";
      c.style.setProperty("--h", `${72 - Math.abs(i - mid) * 5}px`); // tallest in the middle
      c.innerHTML = '<span class="flame"></span><span class="smoke"></span>';
      c.setAttribute("role", "button");
      c.setAttribute("aria-label", "Blow out candle");
      row.appendChild(c);
    }

    const celebrate = () => {
      msg.classList.add("show");
      fire({ particleCount: 140, spread: 100, startVelocity: 35, origin: { y: 0.65 }, scalar: 0.8 });
      setTimeout(() => {
        fire({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, scalar: 0.8 });
        fire({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, scalar: 0.8 });
      }, 300);
      setTimeout(() => hug && hug.classList.add("show"), 2200);
    };

    const blow = (candle) => {
      if (candle.classList.contains("out")) return;
      candle.classList.add("out");
      if ($$(".candle:not(.out)", row).length === 0) setTimeout(celebrate, 500);
    };

    row.addEventListener("click", (e) => {
      const candle = e.target.closest(".candle");
      if (candle) blow(candle);
    });
    $(".blow-btn", stage).addEventListener("click", () => {
      $$(".candle", row).forEach((c, i) => setTimeout(() => blow(c), i * 140));
    });

    if (hug) hug.addEventListener("click", () => {
      const r = hug.getBoundingClientRect();
      heartBurst(r.left + r.width / 2, r.top + r.height / 2);
      hugMsg.classList.add("show");
    });
  });

  // ── Soft gold sparkle following the cursor (desktop only) ──
  if (finePointer && !reduceMotion) {
    let lastSpark = 0;
    window.addEventListener("mousemove", (e) => {
      const now = performance.now();
      if (now - lastSpark < 45) return;
      lastSpark = now;
      const s = document.createElement("span");
      s.className = "spark";
      s.style.left = `${e.clientX}px`;
      s.style.top = `${e.clientY}px`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }, { passive: true });
  }
})();
