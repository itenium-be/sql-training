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

<img src="/img/building-day.jpg" class="photo w-11/12 h-[420px]" alt="itenium office" />

::right::

<div class="h-full flex flex-col justify-center menu">
  <span class="eyebrow">Today</span>

# Menu

- Intro
- Gotchas
- Exercises!

</div>

<img src="/img/itenium-logo.png" class="brand" alt="itenium" />

---
layout: two-cols
---

# Intro

- Score points by solving the exercises
- +6 bonus for every record you hold
  - Solved fastest
  - Shortest query
  - Leanest query (fewest reads)
- Extra point for ⭐ the repository ;)
- Prize for most points!
- There are memes!
- Dbs: Postgres & SQL Server

::right::

<div class="h-full flex items-center justify-end">
  <img src="/img/building-night.jpg" class="photo w-11/12 h-[400px]" alt="" />
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
layout: two-cols
---

# Gotchas

- Timer starts when first viewing the q
- Hint and expected result cost points
- Every 3 wrong attempts: −1 point
- Red squiggle = the database says no
  - Autocomplete knows every table & column
- <kbd>Ctrl</kbd>+<kbd>Enter</kbd> submits
- Read-only databases, 5 second timeout
- Pick a unique and recognizable name!
- Your SQL is stored, no “cheating”
- End game: see winning SQLs

::right::

<div class="h-full flex items-center justify-end">
  <img src="/img/building-night.jpg" class="photo w-11/12 h-[400px]" alt="" />
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
  <span class="eyebrow">Exercises</span>
  <h1 class="!mb-2">Let’s get this <span class="gradient-copper">party</span> started!</h1>

  <ol class="steps">
    <li>Join the WiFi <strong>{{ $slidev.configs.wifiNetwork }}</strong></li>
    <li>Browse to the game</li>
    <li>Pick a name and an avatar</li>
    <li>Wait for the start signal</li>
  </ol>
  <div class="mt-6"><span class="cta">{{ $slidev.configs.gameUrl }}</span></div>
  <p class="mt-6 text-sm text-[var(--df-muted)]">Play at home: <a href="https://github.com/itenium-be/sql-training" target="_blank">github.com/itenium-be/sql-training</a></p>
</div>
<img src="/img/exercises.jpg" class="photo-round w-64 h-64" alt="" />
</div>

<img src="/img/itenium-logo.png" class="brand" alt="itenium" />

---
layout: default
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
layout: image-right
image: /img/laptop.jpg
---

<div class="h-full flex flex-col justify-center">
  <span class="eyebrow">Get connected</span>
  <h1>WiFi</h1>
  <div class="flex flex-col gap-3 text-2xl">
    <div><span class="text-[var(--df-muted)]">Network</span> <strong>{{ $slidev.configs.wifiNetwork }}</strong></div>
    <div><span class="text-[var(--df-muted)]">Password</span> <code>{{ $slidev.configs.wifiPassword }}</code></div>
    <div><span class="text-[var(--df-muted)]">Then</span> <strong>{{ $slidev.configs.gameUrl }}</strong></div>
  </div>
</div>

---
layout: center
---

<img src="/img/building-night.jpg" class="absolute inset-0 w-full h-full object-cover opacity-20" alt="" />

<div class="relative text-center">
  <h1 class="!text-8xl"><span class="gradient-gold">THANK YOU!</span></h1>
  <img src="/img/itenium-logo.png" class="h-9 mx-auto mt-6" alt="itenium" />
</div>

---
layout: center
---

<div class="text-center">
  <span class="eyebrow">Play at home</span>
  <h1>Get the code</h1>
  <img src="/img/qr-github.svg" class="w-72 h-72 mx-auto mt-4 rounded-xl" alt="QR code to github.com/itenium-be/sql-training" />
  <p class="mt-6 text-xl"><a href="https://github.com/itenium-be/sql-training" target="_blank">github.com/itenium-be/sql-training</a></p>
</div>

<img src="/img/itenium-logo.png" class="brand" alt="itenium" />
