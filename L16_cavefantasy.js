const GAME_W = 960;
const GAME_H = 600;
const FLOOR_Y = 530;

const weaponTypes = [
  { name: "Ember Wand", damage: 15, speed: 9, magazine: 12, reload: 48, delay: 16, color: "#ffd17f" },
  { name: "Bone Repeater", damage: 10, speed: 12, magazine: 24, reload: 62, delay: 8, color: "#b6ead1" },
  { name: "Prism Cannon", damage: 34, speed: 7, magazine: 5, reload: 76, delay: 34, color: "#ff8b79" }
];

const bossTypes = [
  { name: "Mossmaw", title: "The Rootbound", color: "#83b879", health: 120, damage: 1 },
  { name: "The Glass Wyrm", title: "Shard of the Deep", color: "#71cbb9", health: 175, damage: 1 },
  { name: "The Cinder King", title: "Last Light Below", color: "#ef8967", health: 230, damage: 1 }
];

let state = "title";
let player;
let playerSprite;
let boss;
let roomIndex = 0;
let projectiles = [];
let enemyShots = [];
let coins = [];
let particles = [];
let platforms = [];
let chest;
let frameTick = 0;
let message = "";
let messageTimer = 0;
let shake = 0;

function setup() {
  const canvas = createCanvas(GAME_W, GAME_H);
  canvas.parent("game-stage");
  pixelDensity(1);
  textFont("Georgia");
  world.gravity.y = 0;
  playerSprite = new Sprite(100, FLOOR_Y - 24, 34, 46, "n");
  playerSprite.visible = false;
  resetRun();
}

function resetRun() {
  state = "title";
  roomIndex = 0;
  player = {
    x: 90, y: FLOOR_Y - 46, w: 30, h: 46, vx: 0, vy: 0, facing: 1,
    health: 5, maxHealth: 5, coins: 0, exp: 0, nextExp: 45, level: 1,
    inventory: [0], weapon: 0, ammo: 12, reloadTimer: 0, fireTimer: 0,
    dashTimer: 0, dashCooldown: 0, invulnerable: 0, grounded: false
  };
  loadRoom(0);
  state = "title";
}

function loadRoom(index) {
  roomIndex = index;
  const data = bossTypes[index];
  boss = {
    x: 790, y: FLOOR_Y - 51, w: 76, h: 98, health: data.health,
    maxHealth: data.health, data, attackTimer: 92 - index * 6,
    defeated: false, hitFlash: 0
  };
  projectiles = [];
  enemyShots = [];
  particles = [];
  platforms = [
    { x: 0, y: FLOOR_Y, w: GAME_W, h: GAME_H - FLOOR_Y },
    { x: 188, y: 440, w: 136, h: 18 },
    { x: 405, y: 365, w: 150, h: 18 },
    { x: 661, y: 430, w: 148, h: 18 }
  ];
  chest = { x: 255, y: FLOOR_Y - 28, opened: false };
  coins = [
    { x: 145, y: FLOOR_Y - 16, taken: false },
    { x: 246, y: 402, taken: false },
    { x: 470, y: 327, taken: false },
    { x: 710, y: 392, taken: false }
  ];
  player.x = 90;
  player.y = FLOOR_Y - player.h;
  player.vx = 0;
  player.vy = 0;
  player.grounded = true;
  player.reloadTimer = 0;
  player.ammo = currentWeapon().magazine;
  player.invulnerable = 40;
  playerSprite.x = player.x + player.w / 2;
  playerSprite.y = player.y + player.h / 2;
  state = "playing";
  showMessage(`${data.name} waits in the ${["Moss Hall", "Shiverglass Grotto", "The Ember Vault"][index]}.`, 170);
}

function draw() {
  frameTick++;
  drawCave();
  if (state === "title") {
    drawTitle();
    return;
  }
  if (state === "playing" || state === "clear") {
    if (state === "playing") updateGame();
    push();
    if (shake > 0) {
      translate(random(-shake, shake), random(-shake, shake));
      shake *= 0.84;
      if (shake < 0.25) shake = 0;
    }
    drawPlatforms();
    drawCoins();
    drawChest();
    drawPortal();
    drawBoss();
    drawProjectiles();
    drawPlayer();
    drawParticles();
    pop();
    drawHud();
    if (state === "clear") drawClearOverlay();
    if (messageTimer > 0) {
      messageTimer--;
      drawToast(message);
    }
    return;
  }
  if (state === "lost" || state === "won") drawEndScreen();
}

function drawCave() {
  const ctx = drawingContext;
  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_H);
  gradient.addColorStop(0, "#172b2b");
  gradient.addColorStop(0.55, "#213b34");
  gradient.addColorStop(1, "#111b1b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME_W, GAME_H);

  noStroke();
  fill(8, 20, 21, 180);
  beginShape();
  vertex(0, 0); vertex(GAME_W, 0); vertex(GAME_W, 82);
  for (let x = GAME_W; x >= 0; x -= 80) vertex(x, 58 + noise(x * 0.012, frameTick * 0.001) * 56);
  endShape(CLOSE);
  fill(10, 22, 23, 140);
  beginShape();
  vertex(0, GAME_H); vertex(GAME_W, GAME_H); vertex(GAME_W, 475);
  for (let x = GAME_W; x >= 0; x -= 90) vertex(x, 483 + noise(x * 0.009, 20) * 46);
  endShape(CLOSE);

  for (let i = 0; i < 13; i++) {
    const x = (i * 83 + 38) % GAME_W;
    const y = 110 + (i * 61) % 310;
    const pulse = 0.55 + sin(frameTick * 0.035 + i) * 0.18;
    fill(i % 2 ? 103 : 255, i % 2 ? 220 : 169, i % 2 ? 188 : 100, 25 * pulse);
    circle(x, y, 34 + pulse * 17);
    fill(i % 2 ? 143 : 255, i % 2 ? 235 : 197, i % 2 ? 203 : 131, 90);
    circle(x, y, 4 + pulse * 3);
  }

  stroke(123, 169, 139, 34);
  strokeWeight(1);
  for (let i = 0; i < 34; i++) {
    const x = (i * 137 + 19) % GAME_W;
    const y = (i * 79 + frameTick * (i % 3 + 1) * 0.25) % 455;
    point(x, y);
  }
}

function drawTitle() {
  noStroke();
  fill(7, 15, 16, 150);
  rect(0, 0, GAME_W, GAME_H);
  fill("#ffd18a");
  textAlign(CENTER, CENTER);
  textSize(52);
  text("LANTERNS BELOW", GAME_W / 2, 143);
  fill("#b9d8c4");
  textSize(17);
  text("Three ancient guardians. One way back to the light.", GAME_W / 2, 190);
  drawTitleHero();
  fill("#f5e9d0");
  textSize(19);
  text("Press SPACE or ENTER to descend", GAME_W / 2, 414);
  fill("#c1d3c5");
  textSize(14);
  text("A / D move     W / SPACE jump     SHIFT dash     S crouch", GAME_W / 2, 462);
  text("Click or J fire     E open chest / descend     Q reload     1-10 select weapon", GAME_W / 2, 489);
  fill("#91cdae");
  textSize(13);
  text("Defeat every guardian. Find the chests. Keep your lantern lit.", GAME_W / 2, 540);
}

function drawTitleHero() {
  push();
  translate(GAME_W / 2, 320);
  noStroke();
  fill(255, 170, 87, 30 + sin(frameTick * 0.05) * 7);
  circle(0, 0, 120 + sin(frameTick * 0.04) * 8);
  fill("#d9b784");
  ellipse(0, 12, 38, 48);
  fill("#263a32");
  arc(0, -4, 43, 42, PI, TWO_PI);
  fill("#ffbc69");
  circle(14, 14, 10);
  fill("#4a5544");
  rect(-15, 34, 13, 28, 4);
  rect(3, 34, 13, 28, 4);
  stroke("#d2b88a");
  strokeWeight(4);
  line(15, 10, 40, -7);
  noStroke();
  fill("#ffd080");
  circle(42, -9, 8);
  pop();
}

function updateGame() {
  updatePlayer();
  updateCombat();
  updatePickups();
  updateBoss();
  updateParticles();
  if (player.health <= 0) {
    player.health = 0;
    state = "lost";
  }
}

function updatePlayer() {
  if (player.invulnerable > 0) player.invulnerable--;
  if (player.dashCooldown > 0) player.dashCooldown--;
  if (player.fireTimer > 0) player.fireTimer--;
  if (player.reloadTimer > 0) {
    player.reloadTimer--;
    if (player.reloadTimer === 0) {
      player.ammo = currentWeapon().magazine;
      showMessage("Reloaded", 45);
    }
  }

  const left = keyIsDown(65) || keyIsDown(LEFT_ARROW);
  const right = keyIsDown(68) || keyIsDown(RIGHT_ARROW);
  const crouching = keyIsDown(83) || keyIsDown(DOWN_ARROW);
  const speed = crouching ? 2 : 4.2;
  if (player.dashTimer > 0) {
    player.dashTimer--;
    player.vx = player.facing * 13;
  } else {
    player.vx = (right ? speed : 0) - (left ? speed : 0);
    if (player.vx !== 0) player.facing = Math.sign(player.vx);
  }

  const oldBottom = player.y + player.h;
  player.x += player.vx;
  player.x = constrain(player.x, 12, GAME_W - player.w - 12);
  player.vy = min(player.vy + 0.62, 14);
  player.y += player.vy;
  player.grounded = false;

  for (const platform of platforms) {
    const horizontalOverlap = player.x + player.w > platform.x && player.x < platform.x + platform.w;
    const newBottom = player.y + player.h;
    if (horizontalOverlap && player.vy >= 0 && oldBottom <= platform.y + 2 && newBottom >= platform.y) {
      player.y = platform.y - player.h;
      player.vy = 0;
      player.grounded = true;
    }
  }

  if (player.y > GAME_H + 90) damagePlayer(1);
  playerSprite.x = player.x + player.w / 2;
  playerSprite.y = player.y + player.h / 2;

  if (mouseIsPressed || keyIsDown(74)) fireWeapon();
}

function updateCombat() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const shot = projectiles[i];
    shot.x += shot.vx;
    shot.y += shot.vy;
    shot.life--;
    if (shot.life <= 0 || shot.x < -30 || shot.x > GAME_W + 30 || shot.y > FLOOR_Y) {
      projectiles.splice(i, 1);
      continue;
    }
    if (!boss.defeated && rectCircle(boss.x - boss.w / 2, boss.y - boss.h / 2, boss.w, boss.h, shot.x, shot.y, 9)) {
      boss.health -= shot.damage;
      boss.hitFlash = 7;
      burst(shot.x, shot.y, shot.color, 5);
      projectiles.splice(i, 1);
      if (boss.health <= 0) defeatBoss();
    }
  }

  for (let i = enemyShots.length - 1; i >= 0; i--) {
    const shot = enemyShots[i];
    shot.x += shot.vx;
    shot.y += shot.vy;
    shot.life--;
    if (shot.life <= 0 || shot.x < -20 || shot.x > GAME_W + 20 || shot.y > GAME_H + 20) {
      enemyShots.splice(i, 1);
      continue;
    }
    const crouching = keyIsDown(83) || keyIsDown(DOWN_ARROW);
    const hitboxY = player.y + (crouching ? 15 : 0);
    const hitboxHeight = crouching ? 31 : player.h;
    if (rectCircle(player.x, hitboxY, player.w, hitboxHeight, shot.x, shot.y, shot.r * 2)) {
      enemyShots.splice(i, 1);
      damagePlayer(boss.data.damage);
    }
  }
}

function updatePickups() {
  for (const coin of coins) {
    if (coin.taken) continue;
    coin.y += sin(frameTick * 0.08 + coin.x) * 0.2;
    if (dist(player.x + player.w / 2, player.y + player.h / 2, coin.x, coin.y) < 27) {
      coin.taken = true;
      player.coins += 1;
      burst(coin.x, coin.y, "#ffd36f", 8);
      showMessage("Coin +1", 38);
    }
  }
}

function updateBoss() {
  if (boss.defeated) return;
  boss.x = 785 + sin(frameTick * (0.012 + roomIndex * 0.002)) * 30;
  if (boss.hitFlash > 0) boss.hitFlash--;
  boss.attackTimer--;
  if (boss.attackTimer <= 0) {
    fireBossShot();
    boss.attackTimer = 100 - roomIndex * 8;
  }
}

function fireWeapon() {
  const weapon = currentWeapon();
  if (player.fireTimer > 0 || player.reloadTimer > 0 || player.ammo <= 0) return;
  const startX = player.x + player.w / 2 + player.facing * 16;
  const startY = player.y + (keyIsDown(83) ? 31 : 21);
  let angle = player.facing === 1 ? 0 : PI;
  if (mouseIsPressed && mouseX >= 0 && mouseX <= GAME_W && mouseY >= 0 && mouseY <= GAME_H) {
    angle = atan2(mouseY - startY, mouseX - startX);
    player.facing = cos(angle) >= 0 ? 1 : -1;
  }
  projectiles.push({
    x: startX, y: startY, vx: cos(angle) * weapon.speed, vy: sin(angle) * weapon.speed,
    damage: weapon.damage + (player.level - 1) * 2, color: weapon.color, life: 115
  });
  player.ammo--;
  player.fireTimer = weapon.delay;
  burst(startX, startY, weapon.color, 2);
}

function fireBossShot() {
  const startX = boss.x - 26;
  const startY = boss.y - 3;
  const angle = atan2(player.y + player.h / 2 - startY, player.x + player.w / 2 - startX);
  const speed = 3.2 + roomIndex * 0.45;
  enemyShots.push({
    x: startX, y: startY, vx: cos(angle) * speed, vy: sin(angle) * speed,
    r: 10 + roomIndex, life: 220, color: boss.data.color
  });
  burst(startX, startY, boss.data.color, 7);
}

function defeatBoss() {
  if (boss.defeated) return;
  boss.defeated = true;
  enemyShots = [];
  burst(boss.x, boss.y, boss.data.color, 38);
  shake = 8;
  player.coins += 10 + roomIndex * 5;
  gainExperience(55 + roomIndex * 30);
  state = "clear";
  showMessage(`${boss.data.name} defeated.`, 180);
}

function gainExperience(amount) {
  player.exp += amount;
  while (player.exp >= player.nextExp) {
    player.exp -= player.nextExp;
    player.level++;
    player.nextExp = 45 + player.level * 35;
    player.maxHealth++;
    player.health = min(player.maxHealth, player.health + 2);
    showMessage(`Level ${player.level}! Lantern strength increased.`, 130);
    burst(player.x + player.w / 2, player.y + player.h / 2, "#ffe08a", 20);
  }
}

function damagePlayer(amount) {
  if (player.invulnerable > 0 || state !== "playing") return;
  player.health -= amount;
  player.invulnerable = 62;
  shake = 5;
  burst(player.x + player.w / 2, player.y + player.h / 2, "#ff806f", 10);
  showMessage("Hit! Evade the next burst.", 55);
}

function interact() {
  if (state === "title") {
    state = "playing";
    return;
  }
  if (state === "clear") {
    if (roomIndex === bossTypes.length - 1) {
      state = "won";
    } else {
      loadRoom(roomIndex + 1);
    }
    return;
  }
  if (state !== "playing") return;
  const nearChest = !chest.opened && dist(player.x + player.w / 2, player.y + player.h / 2, chest.x, chest.y) < 82;
  if (nearChest) {
    chest.opened = true;
    const rewardWeapon = min(roomIndex + 1, weaponTypes.length - 1);
    if (!player.inventory.includes(rewardWeapon)) player.inventory.push(rewardWeapon);
    player.coins += 8;
    player.ammo = currentWeapon().magazine;
    burst(chest.x, chest.y - 12, "#ffd477", 20);
    showMessage(`Chest opened: ${weaponTypes[rewardWeapon].name} + 8 coins`, 130);
  }
}

function startReload() {
  if (state !== "playing" || player.reloadTimer > 0 || player.ammo === currentWeapon().magazine) return;
  player.reloadTimer = currentWeapon().reload;
  showMessage("Reloading...", 45);
}

function selectWeapon(number) {
  const slot = number - 1;
  if (slot < 0 || slot >= player.inventory.length || slot >= 10) return;
  player.weapon = player.inventory[slot];
  player.ammo = min(player.ammo, currentWeapon().magazine);
  showMessage(`${currentWeapon().name} equipped`, 55);
}

function currentWeapon() {
  return weaponTypes[player.weapon] || weaponTypes[0];
}

function drawPlatforms() {
  noStroke();
  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    fill(i === 0 ? "#25352e" : "#425747");
    rect(p.x, p.y, p.w, p.h, 3);
    fill("#91aa78");
    rect(p.x, p.y, p.w, 4, 2);
    fill(24, 39, 33, 170);
    for (let x = p.x + 12; x < p.x + p.w - 5; x += 35) circle(x, p.y + 12, 3);
  }
  fill(164, 196, 146, 50);
  rect(0, FLOOR_Y - 2, GAME_W, 2);
}

function drawCoins() {
  for (const coin of coins) {
    if (coin.taken) continue;
    const pulse = 1 + sin(frameTick * 0.12 + coin.x) * 0.14;
    noStroke();
    fill(255, 205, 91, 40);
    circle(coin.x, coin.y, 27 * pulse);
    fill("#f6c45f");
    ellipse(coin.x, coin.y, 13, 17 * pulse);
    fill("#fff0aa");
    ellipse(coin.x - 2, coin.y - 2, 3, 7);
  }
}

function drawChest() {
  const x = chest.x;
  const y = chest.y;
  noStroke();
  fill(chest.opened ? "#48554a" : "#81583b");
  rect(x - 25, y - 17, 50, 30, 5);
  fill(chest.opened ? "#647563" : "#b07d4f");
  rect(x - 25, y - 19, 50, 12, 5);
  fill("#e9c574");
  rect(x - 3, y - 10, 7, 13, 2);
  if (!chest.opened && dist(player.x + player.w / 2, player.y + player.h / 2, x, y) < 82) {
    drawPrompt("E  OPEN CHEST", x, y - 44);
  }
}

function drawPortal() {
  if (!boss.defeated) return;
  const x = 875;
  const pulse = 1 + sin(frameTick * 0.09) * 0.08;
  noFill();
  stroke(143, 226, 189, 70);
  strokeWeight(18);
  ellipse(x, FLOOR_Y - 54, 60 * pulse, 102 * pulse);
  stroke("#a8e8c1");
  strokeWeight(3);
  ellipse(x, FLOOR_Y - 54, 55 * pulse, 96 * pulse);
  noStroke();
  fill(174, 241, 197, 50);
  ellipse(x, FLOOR_Y - 54, 38 * pulse, 78 * pulse);
  if (dist(player.x + player.w / 2, player.y + player.h / 2, x, FLOOR_Y - 54) < 90) {
    drawPrompt("E  DESCEND", x, FLOOR_Y - 120);
  }
}

function drawBoss() {
  if (boss.defeated) return;
  const x = boss.x;
  const y = boss.y;
  const color = boss.hitFlash > 0 ? "#fff1c8" : boss.data.color;
  const breathe = sin(frameTick * 0.045) * 3;
  if (boss.attackTimer < 28) {
    stroke(255, 105, 88, 125 + sin(frameTick * 0.3) * 90);
    strokeWeight(2);
    line(x - 28, y, player.x + player.w / 2, player.y + player.h / 2);
  }
  noStroke();
  fill(242, 138, 91, 22);
  ellipse(x, y + 10, 150 + sin(frameTick * 0.04) * 10, 145);
  fill(color);
  ellipse(x, y + breathe, boss.w, boss.h);
  fill(31, 48, 41);
  ellipse(x - 12, y - 12 + breathe, 12, 18);
  ellipse(x + 13, y - 12 + breathe, 12, 18);
  fill("#f5d894");
  circle(x - 10, y - 11 + breathe, 4);
  circle(x + 15, y - 11 + breathe, 4);
  fill(20, 31, 28, 190);
  arc(x, y + 20 + breathe, 32, 21, 0, PI);
  for (let i = 0; i < 3; i++) {
    fill(color);
    triangle(x - 29 + i * 22, y - 39 + breathe, x - 20 + i * 22, y - 67 + breathe, x - 11 + i * 22, y - 39 + breathe);
  }
  drawBossBar();
}

function drawBossBar() {
  const barW = 250;
  const x = GAME_W - barW - 28;
  const y = 42;
  noStroke();
  fill(8, 16, 15, 190);
  rect(x - 10, y - 18, barW + 20, 47, 5);
  textAlign(LEFT, CENTER);
  textSize(13);
  fill("#eee0c8");
  text(`${boss.data.name}  ·  ${boss.data.title}`, x, y - 7);
  fill("#492f30");
  rect(x, y + 6, barW, 9, 4);
  fill(boss.data.color);
  rect(x, y + 6, barW * constrain(boss.health / boss.maxHealth, 0, 1), 9, 4);
}

function drawProjectiles() {
  noStroke();
  for (const shot of projectiles) {
    fill(255, 192, 106, 45);
    circle(shot.x, shot.y, 24);
    fill(shot.color);
    circle(shot.x, shot.y, 10);
    fill("#fff2ce");
    circle(shot.x - 2, shot.y - 2, 3);
  }
  for (const shot of enemyShots) {
    fill(255, 100, 89, 35);
    circle(shot.x, shot.y, shot.r * 4);
    fill(shot.color);
    circle(shot.x, shot.y, shot.r * 2);
    fill("#fff0ce");
    circle(shot.x - 2, shot.y - 2, 4);
  }
}

function drawPlayer() {
  const crouching = keyIsDown(83) || keyIsDown(DOWN_ARROW);
  const blink = player.invulnerable > 0 && frameTick % 8 < 4;
  if (blink) return;
  const x = player.x + player.w / 2;
  const h = crouching ? 31 : player.h;
  const y = player.y + player.h - h;
  noStroke();
  fill(255, 173, 91, 30);
  circle(x, y + h / 2, 75 + sin(frameTick * 0.08) * 7);
  fill("#bfad84");
  rect(x - 13, y + 15, 26, h - 15, 7);
  fill("#293c34");
  arc(x, y + 19, 31, 29, PI, TWO_PI);
  fill("#f1ce95");
  circle(x + player.facing * 8, y + 29, 4);
  fill("#4e5948");
  rect(x - 12, y + h - 8, 10, 11, 3);
  rect(x + 2, y + h - 8, 10, 11, 3);
  stroke(currentWeapon().color);
  strokeWeight(4);
  line(x + player.facing * 8, y + 28, x + player.facing * 24, y + 23);
  noStroke();
}

function drawHud() {
  noStroke();
  fill(8, 16, 16, 205);
  rect(18, 17, 300, 91, 7);
  textAlign(LEFT, CENTER);
  textSize(14);
  fill("#f4e8d0");
  text(`CHAMBER ${roomIndex + 1} / 3     LV ${player.level}`, 32, 36);
  for (let i = 0; i < player.maxHealth; i++) {
    fill(i < player.health ? "#ef8673" : "#573f3d");
    drawHeart(40 + i * 23, 62, 8);
  }
  fill("#ffd36f");
  text(`Coins ${player.coins}`, 175, 62);
  fill("#c3d8c9");
  text(`XP ${player.exp} / ${player.nextExp}`, 32, 88);
  fill("#293a32");
  rect(130, 82, 166, 9, 4);
  fill("#9bd5ad");
  rect(130, 82, 166 * constrain(player.exp / player.nextExp, 0, 1), 9, 4);

  fill(8, 16, 16, 205);
  rect(GAME_W - 250, GAME_H - 80, 232, 60, 7);
  textAlign(LEFT, CENTER);
  textSize(13);
  fill(currentWeapon().color);
  text(`${currentWeapon().name}  [${player.weapon + 1}]`, GAME_W - 234, GAME_H - 58);
  fill("#e7e2d4");
  const ammoText = player.reloadTimer > 0 ? `RELOADING ${ceil(player.reloadTimer / 60)}s` : `${player.ammo} / ${currentWeapon().magazine}  ·  Q reload`;
  text(ammoText, GAME_W - 234, GAME_H - 34);
  drawInventory();
}

function drawInventory() {
  const startX = 337;
  const y = GAME_H - 58;
  for (let slot = 0; slot < 10; slot++) {
    const x = startX + slot * 38;
    const weaponIndex = player.inventory[slot];
    fill(weaponIndex !== undefined && weaponIndex === player.weapon ? "#a4c99c" : "#172622");
    stroke(weaponIndex !== undefined && weaponIndex === player.weapon ? "#e5d59b" : "#65766a");
    strokeWeight(1);
    rect(x, y, 32, 32, 4);
    noStroke();
    fill(weaponIndex === undefined ? "#718076" : "#f4e8d0");
    textAlign(CENTER, CENTER);
    textSize(11);
    text(`${slot + 1}`, x + 16, y + 16);
  }
}

function drawClearOverlay() {
  noStroke();
  fill(8, 15, 15, 125);
  rect(0, 0, GAME_W, GAME_H);
  fill("#ffe0a2");
  textAlign(CENTER, CENTER);
  textSize(36);
  text("GUARDIAN DEFEATED", GAME_W / 2, 255);
  fill("#d4e5d5");
  textSize(17);
  text(`+${10 + roomIndex * 5} coins  ·  ${55 + roomIndex * 30} experience`, GAME_W / 2, 297);
  text(roomIndex === bossTypes.length - 1 ? "Press E to return to the surface" : "Press E to descend to the next chamber", GAME_W / 2, 342);
}

function drawEndScreen() {
  noStroke();
  fill(7, 14, 15, 190);
  rect(0, 0, GAME_W, GAME_H);
  textAlign(CENTER, CENTER);
  fill(state === "won" ? "#ffd18a" : "#f18b78");
  textSize(44);
  text(state === "won" ? "THE CAVE REMEMBERS" : "YOUR LANTERN FADES", GAME_W / 2, 220);
  fill("#e4e6d7");
  textSize(18);
  text(state === "won" ? "Every guardian has fallen. The way home is yours." : "The guardians remain. Gather your strength and try again.", GAME_W / 2, 273);
  fill("#ffd18a");
  textSize(17);
  text("Press ENTER to begin again", GAME_W / 2, 339);
  fill("#c3d4c8");
  textSize(14);
  text(`Level ${player.level}  ·  ${player.coins} coins  ·  ${player.inventory.length} weapons found`, GAME_W / 2, 380);
}

function drawPrompt(label, x, y) {
  noStroke();
  fill(8, 15, 14, 210);
  rect(x - 59, y - 12, 118, 24, 4);
  fill("#fff0ce");
  textAlign(CENTER, CENTER);
  textSize(12);
  text(label, x, y);
}

function drawToast(label) {
  noStroke();
  fill(8, 15, 15, 210);
  rect(GAME_W / 2 - 210, 117, 420, 34, 5);
  fill("#f4e8d0");
  textAlign(CENTER, CENTER);
  textSize(14);
  text(label, GAME_W / 2, 134);
}

function drawHeart(x, y, size) {
  beginShape();
  vertex(x, y + size * 0.8);
  bezierVertex(x - size * 1.2, y, x - size * 0.3, y - size * 0.6, x, y);
  bezierVertex(x + size * 0.3, y - size * 0.6, x + size * 1.2, y, x, y + size * 0.8);
  endShape(CLOSE);
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = random(TWO_PI);
    const speed = random(0.8, 4.2);
    particles.push({ x, y, vx: cos(angle) * speed, vy: sin(angle) * speed, life: random(18, 40), color, size: random(2, 5) });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.025;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  noStroke();
  for (const particle of particles) {
    const particleColor = color(particle.color);
    particleColor.setAlpha(map(particle.life, 0, 40, 0, 190));
    fill(particleColor);
    circle(particle.x, particle.y, particle.size);
  }
}

function rectCircle(rx, ry, rw, rh, cx, cy, diameter) {
  const nearestX = constrain(cx, rx, rx + rw);
  const nearestY = constrain(cy, ry, ry + rh);
  return dist(cx, cy, nearestX, nearestY) < diameter / 2;
}

function showMessage(textValue, duration) {
  message = textValue;
  messageTimer = duration;
}

function keyPressed() {
  if (key === " " || keyCode === ENTER) {
    if (state === "title") interact();
    else if (state === "lost" || state === "won") resetRun();
    else if (state === "playing" && player.grounded) {
      player.vy = -13.2;
      player.grounded = false;
      burst(player.x + player.w / 2, player.y + player.h, "#b9d7bb", 4);
    }
    return false;
  }
  if (state === "playing") {
    if (key === "w" || key === "W" || keyCode === UP_ARROW) {
      if (player.grounded) {
        player.vy = -13.2;
        player.grounded = false;
      }
    } else if (key === "e" || key === "E") {
      interact();
    } else if (key === "q" || key === "Q") {
      startReload();
    } else if (key === "Shift" && player.dashCooldown === 0) {
      player.dashTimer = 9;
      player.dashCooldown = 48;
      player.invulnerable = max(player.invulnerable, 12);
      burst(player.x + player.w / 2, player.y + player.h / 2, "#a9e3c2", 8);
    } else if (key === "j" || key === "J") {
      fireWeapon();
    } else if (key >= "1" && key <= "9") {
      selectWeapon(Number(key));
    } else if (key === "0") {
      selectWeapon(10);
    }
  } else if (state === "clear" && (key === "e" || key === "E")) {
    interact();
  }
  return false;
}

function mousePressed() {
  if (state === "title") interact();
  else if (state === "playing") fireWeapon();
  return false;
}

function windowResized() {
  const canvas = document.querySelector("#game-stage canvas");
  if (canvas) canvas.style.width = "100%";
}