---
theme: default
title: SQL Showdown · DevFest Paris
info: |
  SQL Showdown by itenium, DevFest Paris 2026.
gameUrl: http://TODO-HOST
wifiNetwork: TODO-NETWORK
wifiPassword: TODO-PASSWORD
favicon: /favicon.png
colorSchema: dark
aspectRatio: 16/9
canvasWidth: 980
transition: fade
fonts:
  sans: Plus Jakarta Sans
  mono: JetBrains Mono
  weights: '400,600,700,800'
  provider: none
layout: center
class: cover
---

<img src="/img/building-bw.jpg" class="absolute right-0 top-0 h-full w-1/2 object-cover opacity-25" style="mask-image: linear-gradient(90deg, transparent, #000 60%)" alt="" />

<div class="relative w-full">
  <img src="/img/itenium-logo.png" class="h-10 mb-8" alt="itenium" />
  <div class="pill eyebrow !text-xs mb-6">27 November 2026 · La Fabrique de la Connaissance</div>
  <h1 class="!text-7xl !mb-6 !leading-none">SQL Showdown<br><span class="gradient-gold">DevFest Paris</span> <span class="gradient-copper">edition.</span></h1>
</div>

---
layout: two-cols
---

# What

- Score points by solving the exercises
- +6 bonus for every record you hold
  - Solved fastest
  - Shortest query
  - Leanest query (fewest reads)
- Extra point for ⭐ the repository ;)
- Prize for most points!
- There are memes!
- Dbs: Postgres & SQL Server
- Timer starts when first viewing the q
- Hint and expected result cost points
- Every 3 wrong attempts: −1 point

::right::

<div class="h-full flex items-center justify-end">
  <img src="/img/building-night.jpg" class="photo w-11/12 h-[400px]" alt="" />
</div>

<img src="/img/itenium-logo.png" class="brand" alt="itenium" />

---
layout: default
---

<span class="eyebrow">What</span>
<h1 class="!mb-1">The <span class="gradient-gold">Competition</span></h1>

<div class="zone-gain">You gain</div>
<div class="award-grid">
  <div class="award" v-click><div class="chip" style="color:var(--c-correct)"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div><div class="l"><b>Correct</b><span>A right answer</span></div><div class="bonus" style="color:var(--c-correct)">base</div></div>
  <div class="award" v-click><div class="chip" style="color:var(--df-gold)"><svg viewBox="0 0 24 24"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg></div><div class="l"><b>Fastest</b><span>Least time on the clock</span></div><div class="bonus">+6</div></div>
  <div class="award" v-click><div class="chip" style="color:var(--df-orange-1)"><svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></div><div class="l"><b>Shortest</b><span>Fewest chars</span></div><div class="bonus">+6</div></div>
  <div class="award" v-click><div class="chip" style="color:var(--c-leanest)"><svg viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg></div><div class="l"><b>Leanest</b><span>Fewest reads</span></div><div class="bonus">+6</div></div>
</div>

<div class="zone-lose" v-click="5">You lose</div>
<div class="pen-strip">
  <div class="pen" v-click="5"><span class="m">−1</span><div>Reveal hint / expected result</div></div>
  <div class="pen" v-click="6"><span class="m">−1</span><div>Every 3 wrong attempts</div></div>
</div>

<img src="/img/itenium-logo.png" class="brand" alt="itenium" />

---
layout: center
---

<div class="text-center">
  <span class="eyebrow">For the most points</span>
  <h1>Le Prize</h1>
  <img src="/img/prize.jpg" class="photo mx-auto h-[330px] w-[440px]" alt="A wrapped prize next to a mandarin" />
  <p class="mt-4 text-lg text-[var(--df-muted)]">* Banana for scale</p>
</div>

<img src="/img/itenium-logo.png" class="brand" alt="itenium" />

---
layout: center
---

<img src="/img/meme-special-skills.jpg" class="photo mx-auto h-[440px]" alt="Yes I do have a special skill set... What? No... what the hell is SQL?" />

---
layout: default
---

<div class="grid grid-cols-[1fr_auto] gap-10 items-center h-full">
<div>
  <h1 class="!mb-2">Let’s get this <span class="gradient-copper">party</span> started!</h1>

  <ol class="steps">
    <li>Join the WiFi <strong>{{ $slidev.configs.wifiNetwork }}</strong></li>
    <li>Browse to the game</li>
    <li>Pick a name and an avatar</li>
    <li>Wait for the start signal</li>
  </ol>
  <div class="mt-6"><span class="cta">{{ $slidev.configs.gameUrl }}</span></div>
</div>
<img src="/img/party-rocket.png" class="photo-round w-64 h-64" alt="Database rocket launching amid confetti" />
</div>

<img src="/img/itenium-logo.png" class="brand" alt="itenium" />

---
layout: default
disabled: true
---

<div class="grid grid-cols-[1fr_auto] gap-10 items-center h-full">
<div>
  <span class="eyebrow">Follow us</span>
  <h1>Our Socials</h1>
  <div class="grid grid-cols-4 gap-4">
    <a class="social" href="https://www.instagram.com/itenium/" target="_blank"><img src="/icons/instagram.png" alt="" />@itenium</a>
    <a class="social" href="https://x.com/itenium_be" target="_blank"><img src="/icons/x.png" alt="" />@itenium_be</a>
    <a class="social" href="https://www.linkedin.com/company/itenium/posts/?feedView=all" target="_blank"><img src="/icons/linkedin.png" alt="" />itenium</a>
    <a class="social" href="https://github.com/itenium-be" target="_blank"><img src="/icons/github.png" alt="" style="background: var(--df-cream); border-radius: 50%; padding: 4px" />itenium-be</a>
    <a class="social" href="https://itenium.be/" target="_blank"><img src="/icons/www.png" alt="" />itenium.be</a>
    <a class="social" href="https://www.youtube.com/channel/UCot8h-KwjxhLG-QYQppYjZQ" target="_blank"><img src="/icons/youtube.png" alt="" />@itenium</a>
    <a class="social" href="https://www.facebook.com/itenium.be" target="_blank"><img src="/icons/facebook.png" alt="" />itenium.be</a>
  </div>
</div>
<img src="/img/socials.jpg" class="photo-round w-56 h-56" alt="" />
</div>

<img src="/img/itenium-logo.png" class="brand" alt="itenium" />

---
layout: center
---

<div class="text-center">
  <h1>Get the code</h1>
  <img src="/img/qr-github.svg" class="w-72 h-72 mx-auto mt-4 rounded-xl" alt="QR code to github.com/itenium-be/sql-training" />
  <p class="mt-6 text-xl"><a href="https://github.com/itenium-be/sql-training" target="_blank">github.com/itenium-be/sql-training</a></p>
</div>

<img src="/img/itenium-logo.png" class="brand" alt="itenium" />
