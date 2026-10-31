const GAME_W = 960;
const GAME_H = 600;
const FLOOR_Y = 530;

const weaponTypes = [
  { name: "Ember Wand", damage: 15, speed: 9, magazine: 12, reload: 48, delay: 16, color: "#ffd17f" },
  { name: "Bone Repeater", damage: 10, speed: 12, magazine: 24, reload: 62, delay: 8, color: "#b6ead1" },
  { name: "Prism Cannon", damage: 34, speed: 7, magazine: 5, reload: 76, delay: 34, color: "#ff8b79" },
  { name: "Cave Sword", damage: 42, magazine: Infinity, reload: 0, delay: 30, color: "#d8e6c1", melee: true },
  { name: "Bazooka", damage: 58, speed: 5, magazine: 1, reload: 96, delay: 42, color: "#ff8d65", explosive: true }
];

const chestLoot = [
  { name: "Cave Sword", kind: "weapon", weaponIndex: 3, color: "#d8e6c1" },
  { name: "Bone Repeater", kind: "weapon", weaponIndex: 1, color: "#b6ead1" },
  { name: "Bazooka", kind: "weapon", weaponIndex: 4, color: "#ff8d65" },
  { name: "Medkit", kind: "medkit", color: "#f17f72" },
  { name: "Prism Cannon", kind: "weapon", weaponIndex: 2, color: "#ff8b79" }
];

const bossTypes = [
  { name: "Mossmaw", title: "The Rootbound", color: "#83b879", health: 125, damage: 1, archetype: "root", flying: false, difficulty: 3, chaseSpeed: 1.1, verticalSpeed: 0, moveRange: 110, altitudeRange: 0, maneuverMin: 62, maneuverMax: 104, attackDelay: 108 },
  { name: "The Glass Wyrm", title: "Shard of the Deep", color: "#71cbb9", health: 205, damage: 1, archetype: "shard", flying: true, difficulty: 7, chaseSpeed: 2, verticalSpeed: 1.4, moveRange: 190, altitudeRange: 115, maneuverMin: 34, maneuverMax: 65, attackDelay: 82 },
  { name: "The Cinder King", title: "Last Light Below", color: "#ef8967", health: 260, damage: 1, archetype: "ember", flying: true, difficulty: 10, chaseSpeed: 3.1, verticalSpeed: 2.2, moveRange: 250, altitudeRange: 145, maneuverMin: 20, maneuverMax: 44, attackDelay: 66 }
];

const caveThemes = [
  { top: "#172b2b", middle: "#213b34", bottom: "#111b1b", glow: [103, 220, 188], floor: "#25352e", platform: "#425747", edge: "#91aa78" },
  { top: "#142733", middle: "#1c3c4a", bottom: "#101a25", glow: [101, 209, 229], floor: "#20343d", platform: "#38606a", edge: "#83d3d5" },
  { top: "#321d24", middle: "#51282a", bottom: "#1d1418", glow: [255, 131, 72], floor: "#382629", platform: "#65403a", edge: "#e09565" }
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
let chestLootIndex = 0;
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
  chestLootIndex = 0;
  player = {
    x: 90, y: FLOOR_Y - 46, w: 30, h: 46, vx: 0, vy: 0, facing: 1,
    health: 5, maxHealth: 5, coins: 0, exp: 0, nextExp: 45, level: 1,
    inventory: [0], weapon: 0, ammo: 12, reloadTimer: 0, fireTimer: 0,
    dashTimer: 0, dashCooldown: 0, invulnerable: 0, grounded: false, meleeTimer: 0
  };
  loadRoom(0);
  state = "title";
}

function loadRoom(index) {
  roomIndex = index;
  const data = bossTypes[index];
  boss = {
    x: 790, y: data.flying ? FLOOR_Y - 120 : FLOOR_Y - 51, w: 76, h: 98, health: data.health,
    maxHealth: data.health, data, attackTimer: data.attackDelay,
    movementTimer: 0, movementTargetX: 790, movementTargetY: data.flying ? FLOOR_Y - 120 : FLOOR_Y - 51,
    movementBurstFrames: 0,
    defeated: false, hitFlash: 0
  };
  projectiles = [];
  enemyShots = [];
  particles = [];
  const platformLayouts = [
    [
      { x: 0, y: FLOOR_Y, w: GAME_W, h: GAME_H - FLOOR_Y },
      { x: 188, y: 440, w: 136, h: 18 }, { x: 405, y: 365, w: 150, h: 18 }, { x: 661, y: 430, w: 148, h: 18 }
    ],
    [
      { x: 0, y: FLOOR_Y, w: GAME_W, h: GAME_H - FLOOR_Y },
      { x: 112, y: 448, w: 124, h: 18 }, { x: 280, y: 374, w: 140, h: 18 },
      { x: 484, y: 430, w: 142, h: 18 }, { x: 701, y: 359, w: 148, h: 18 }
    ],
    [
      { x: 0, y: FLOOR_Y, w: GAME_W, h: GAME_H - FLOOR_Y },
      { x: 140, y: 424, w: 150, h: 18 }, { x: 355, y: 365, w: 136, h: 18 },
      { x: 570, y: 420, w: 145, h: 18 }, { x: 765, y: 335, w: 132, h: 18 }
    ]
  ];
  platforms = platformLayouts[index];
  chest = spawnChest();
  const coinLayouts = [
    [[145, FLOOR_Y - 16], [246, 402], [470, 327], [710, 392]],
    [[165, 422], [345, 348], [550, 404], [772, 333]],
    [[185, 398], [420, 339], [635, 394], [820, 309]]
  ];
  coins = coinLayouts[index].map(([x, y]) => ({ x, y, taken: false }));
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

function spawnChest() {
  const loot = chestLoot[chestLootIndex % chestLoot.length];
  chestLootIndex++;
  return {
    x: random(130, GAME_W - 130), y: -42, targetY: FLOOR_Y - 28,
    fallSpeed: 7, timer: 120, falling: true, opened: false, loot
  };
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
  const theme = caveThemes[roomIndex] || caveThemes[0];
  const ctx = drawingContext;
  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_H);
  gradient.addColorStop(0, theme.top);
  gradient.addColorStop(0.55, theme.middle);
  gradient.addColorStop(1, theme.bottom);
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

  if (roomIndex === 0) {
    stroke(102, 143, 82, 70);
    strokeWeight(5);
    for (let i = 0; i < 8; i++) {
      const x = 35 + i * 132;
      line(x, 0, x + sin(i * 3) * 24, 72 + (i % 3) * 23);
      line(x + sin(i * 3) * 24, 72 + (i % 3) * 23, x + 7, 94 + (i % 3) * 23);
    }
  } else if (roomIndex === 1) {
    noStroke();
    for (let i = 0; i < 7; i++) {
      const x = 22 + i * 151;
      fill(67, 151, 164, 52);
      triangle(x - 24, 445, x, 286 + (i % 3) * 32, x + 27, 445);
      fill(125, 222, 222, 55);
      triangle(x - 8, 420, x, 310 + (i % 3) * 32, x + 6, 420);
    }
  } else {
    stroke(255, 106, 58, 95);
    strokeWeight(3);
    for (let i = 0; i < 8; i++) {
      const x = 24 + i * 129;
      line(x, 514, x + 13, 506);
      line(x + 13, 506, x + 22, 515);
      line(x + 9, 525, x + 17, 519);
    }
  }

  for (let i = 0; i < 13; i++) {
    const x = (i * 83 + 38) % GAME_W;
    const y = 110 + (i * 61) % 310;
    const pulse = 0.55 + sin(frameTick * 0.035 + i) * 0.18;
    fill(theme.glow[0], theme.glow[1], theme.glow[2], 25 * pulse);
    circle(x, y, 34 + pulse * 17);
    fill(theme.glow[0], theme.glow[1], theme.glow[2], 90);
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
  updateChest();
  updateCombat();
  updatePickups();
  updateBoss();
  updateParticles();
  if (player.health <= 0) {
    player.health = 0;
    state = "lost";
  }
}

function updateChest() {
  if (chest.opened) return;
  if (chest.falling) {
    chest.y += chest.fallSpeed;
    if (chest.y >= chest.targetY) {
      chest.y = chest.targetY;
      chest.falling = false;
      chest.timer = 120;
      burst(chest.x, chest.y, chest.loot.color, 8);
      showMessage(`${chest.loot.name} chest landed. Open it within 2 seconds.`, 90);
    }
    return;
  }
  chest.timer--;
  if (chest.timer <= 0) {
    burst(chest.x, chest.y, chest.loot.color, 14);
    chest = spawnChest();
    showMessage("Chest missed. A new chest is falling!", 75);
  }
}

function updatePlayer() {
  if (player.invulnerable > 0) player.invulnerable--;
  if (player.dashCooldown > 0) player.dashCooldown--;
  if (player.fireTimer > 0) player.fireTimer--;
  if (player.meleeTimer > 0) player.meleeTimer--;
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
      burst(shot.x, shot.y, shot.color, shot.explosive ? 24 : 5);
      if (shot.explosive) shake = 5;
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
  const playerCenterX = player.x + player.w / 2;
  boss.movementTimer--;
  if (boss.movementTimer <= 0) {
    boss.movementTargetX = constrain(
      playerCenterX + random(-boss.data.moveRange, boss.data.moveRange),
      boss.w / 2 + 12,
      GAME_W - boss.w / 2 - 12
    );
    if (boss.data.flying) {
      const hoverHeight = boss.data.archetype === "shard" ? 118 : 92;
      boss.movementTargetY = constrain(
        player.y + player.h / 2 - hoverHeight + random(-boss.data.altitudeRange, boss.data.altitudeRange),
        142,
        FLOOR_Y - boss.h / 2 - 8
      );
    }
    boss.movementTimer = random(boss.data.maneuverMin, boss.data.maneuverMax);
    boss.movementBurstFrames = random(1) < 0.22 ? Math.floor(random(6, 12)) : 0;
  }

  const phaseBoost = boss.health < boss.maxHealth * 0.35 ? 1.25 : 1;
  const burstBoost = boss.movementBurstFrames > 0 ? 2.2 : 1;
  const movementSpeed = boss.data.chaseSpeed * phaseBoost * burstBoost;
  boss.x += constrain(boss.movementTargetX - boss.x, -movementSpeed, movementSpeed);
  if (boss.movementBurstFrames > 0) boss.movementBurstFrames--;

  if (boss.data.flying) {
    const movementSpeedY = boss.data.verticalSpeed * burstBoost;
    boss.y += constrain(boss.movementTargetY - boss.y, -movementSpeedY, movementSpeedY);
  } else {
    boss.y = FLOOR_Y - boss.h / 2 + sin(frameTick * 0.035) * 3;
  }
  if (boss.hitFlash > 0) boss.hitFlash--;
  const touchingPlayer = player.x < boss.x + boss.w / 2 &&
    player.x + player.w > boss.x - boss.w / 2 &&
    player.y < boss.y + boss.h / 2 &&
    player.y + player.h > boss.y - boss.h / 2;
  if (touchingPlayer) damagePlayer(1);
  boss.attackTimer--;
  if (boss.attackTimer <= 0) {
    fireBossShot();
    boss.attackTimer = boss.data.attackDelay;
  }
}

function fireWeapon() {
  const weapon = currentWeapon();
  if (player.fireTimer > 0 || player.reloadTimer > 0 || (!weapon.melee && player.ammo <= 0)) return;
  const centerX = player.x + player.w / 2;
  const startY = player.y + (keyIsDown(83) ? 31 : 21);
  let targetX = centerX + player.facing * 100;
  let targetY = startY;
  if (mouseIsPressed && mouseX >= 0 && mouseX <= GAME_W && mouseY >= 0 && mouseY <= GAME_H) {
    targetX = mouseX;
    targetY = mouseY;
  } else if (boss && !boss.defeated) {
    targetX = boss.x;
    targetY = boss.y;
  }
  player.facing = targetX >= centerX ? 1 : -1;
  const startX = centerX + player.facing * 16;
  const angle = atan2(targetY - startY, targetX - startX);
  if (weapon.melee) {
    player.fireTimer = weapon.delay;
    player.meleeTimer = 9;
    const bossDeltaX = boss.x - centerX;
    const verticalReach = Math.abs(boss.y - (player.y + player.h / 2)) < boss.h / 2 + player.h / 2 + 28;
    if (!boss.defeated && bossDeltaX * player.facing >= 0 && Math.abs(bossDeltaX) < 78 && verticalReach) {
      boss.health -= weapon.damage + (player.level - 1) * 2;
      boss.hitFlash = 7;
      burst(boss.x, boss.y, weapon.color, 14);
      if (boss.health <= 0) defeatBoss();
    }
    return;
  }
  projectiles.push({
    x: startX, y: startY, vx: cos(angle) * weapon.speed, vy: sin(angle) * weapon.speed,
    damage: weapon.damage + (player.level - 1) * 2, color: weapon.color, life: 115,
    explosive: weapon.explosive === true
  });
  player.ammo--;
  player.fireTimer = weapon.delay;
  burst(startX, startY, weapon.color, 2);
}

function fireBossShot() {
  const startX = boss.x - 26;
  const startY = boss.y;
  const angle = atan2(player.y + player.h / 2 - startY, player.x + player.w / 2 - startX);
  let spread = [0];
  let speed = 3.4;
  let radius = 11;
  let kind = "root";
  if (boss.data.archetype === "shard") {
    spread = [-0.25, 0, 0.25];
    speed = 4.2;
    radius = 8;
    kind = "shard";
  } else if (boss.data.archetype === "ember") {
    spread = [-0.38, -0.19, 0, 0.19, 0.38];
    speed = 4.6;
    radius = 9;
    kind = "ember";
  }
  for (const offset of spread) {
    const shotAngle = angle + offset;
    enemyShots.push({
      x: startX, y: startY, vx: cos(shotAngle) * speed, vy: sin(shotAngle) * speed,
      r: radius, life: 220, color: boss.data.color, kind
    });
  }
  burst(startX, startY, boss.data.color, spread.length * 3);
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
  const nearChest = !chest.falling && !chest.opened &&
    dist(player.x + player.w / 2, player.y + player.h / 2, chest.x, chest.y) < 82;
  if (nearChest) {
    chest.opened = true;
    player.coins += 8;
    if (chest.loot.kind === "medkit") {
      if (player.health < player.maxHealth) {
        player.health = min(player.maxHealth, player.health + 2);
      } else {
        player.maxHealth++;
        player.health++;
      }
      burst(chest.x, chest.y - 12, chest.loot.color, 20);
      showMessage("Medkit used: 2 hearts restored", 130);
      return;
    }

    const rewardWeapon = chest.loot.weaponIndex;
    if (!player.inventory.includes(rewardWeapon)) {
      player.inventory.push(rewardWeapon);
      player.weapon = rewardWeapon;
    } else {
      player.coins += 5;
    }
    player.ammo = currentWeapon().magazine;
    burst(chest.x, chest.y - 12, chest.loot.color, 20);
    showMessage(`Chest opened: ${chest.loot.name} + 8 coins`, 130);
  }
}

function startReload() {
  if (state !== "playing" || currentWeapon().melee || player.reloadTimer > 0 || player.ammo === currentWeapon().magazine) return;
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
  const theme = caveThemes[roomIndex] || caveThemes[0];
  noStroke();
  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    fill(i === 0 ? theme.floor : theme.platform);
    rect(p.x, p.y, p.w, p.h, 3);
    fill(theme.edge);
    rect(p.x, p.y, p.w, 4, 2);
    fill(theme.glow[0], theme.glow[1], theme.glow[2], 70);
    for (let x = p.x + 12; x < p.x + p.w - 5; x += 35) circle(x, p.y + 12, 3);
  }
  fill(theme.glow[0], theme.glow[1], theme.glow[2], 50);
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
  if (chest.falling) {
    stroke(chest.loot.color);
    strokeWeight(2);
    line(x, y - 34, x, y - 62);
  }
  noStroke();
  fill(chest.opened ? "#48554a" : "#81583b");
  rect(x - 25, y - 17, 50, 30, 5);
  fill(chest.opened ? "#647563" : "#b07d4f");
  rect(x - 25, y - 19, 50, 12, 5);
  fill(chest.opened ? "#647563" : chest.loot.color);
  rect(x - 3, y - 10, 7, 13, 2);
  if (!chest.falling && !chest.opened) {
    fill(chest.loot.color);
    textAlign(CENTER, CENTER);
    textSize(11);
    text(chest.loot.name, x, y - 39);
    fill(13, 22, 20, 220);
    rect(x - 25, y - 31, 50, 4, 2);
    fill(chest.loot.color);
    rect(x - 25, y - 31, 50 * constrain(chest.timer / 120, 0, 1), 4, 2);
    if (dist(player.x + player.w / 2, player.y + player.h / 2, x, y) < 82) {
      drawPrompt("E  OPEN CHEST", x, y - 53);
    }
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
    if (boss.data.archetype === "root") {
      line(x - 28, y, player.x + player.w / 2, player.y + player.h / 2);
    } else if (boss.data.archetype === "shard") {
      for (let offset = -1; offset <= 1; offset++) {
        line(x - 24, y, player.x + player.w / 2, player.y + player.h / 2 + offset * 54);
      }
    } else {
      const startX = x - 26;
      const aim = atan2(player.y + player.h / 2 - y, player.x + player.w / 2 - startX);
      for (let offset = -2; offset <= 2; offset++) {
        const shotAngle = aim + offset * 0.19;
        line(startX, y, startX + cos(shotAngle) * 112, y + sin(shotAngle) * 112);
      }
    }
  }
  noStroke();
  fill(242, 138, 91, 22);
  ellipse(x, y + 10, 150 + sin(frameTick * 0.04) * 10, 145);
  if (boss.data.archetype === "root") {
    fill(color);
    ellipse(x, y + breathe, 88, 104);
    fill("#476445");
    arc(x, y - 10 + breathe, 82, 72, PI, TWO_PI);
    for (let i = 0; i < 5; i++) {
      fill(i % 2 ? "#78985b" : "#a5bd71");
      triangle(x - 36 + i * 18, y - 29 + breathe, x - 28 + i * 18, y - 61 - (i % 2) * 8 + breathe, x - 18 + i * 18, y - 26 + breathe);
    }
    fill("#263a32");
    ellipse(x - 14, y - 7 + breathe, 10, 15);
    ellipse(x + 14, y - 7 + breathe, 10, 15);
    fill("#f6d58b");
    circle(x - 12, y - 7 + breathe, 4);
    circle(x + 16, y - 7 + breathe, 4);
    stroke("#668657");
    strokeWeight(5);
    line(x - 31, y + 20, x - 47, y + 39);
    line(x + 31, y + 20, x + 48, y + 38);
  } else if (boss.data.archetype === "shard") {
    push();
    translate(x, y + breathe);
    rotate(sin(frameTick * 0.025) * 0.08);
    noStroke();
    for (let i = 0; i < 5; i++) {
      const segmentY = sin(frameTick * 0.05 + i * 0.8) * 7;
      fill(i % 2 ? "#398b88" : color);
      ellipse((i - 2) * 17, segmentY, 27, 35);
      fill("#d0fff0");
      triangle((i - 2) * 17 - 8, segmentY - 5, (i - 2) * 17, segmentY - 20, (i - 2) * 17 + 5, segmentY + 2);
    }
    fill("#b9fff0");
    triangle(26, -8, 48, 0, 26, 9);
    fill("#163a3a");
    circle(30, -3, 4);
    pop();
  } else {
    fill("#9d463d");
    ellipse(x, y + 12 + breathe, 86, 100);
    fill(color);
    arc(x, y + 15 + breathe, 102, 96, PI, TWO_PI);
    fill("#ffbc69");
    for (let i = 0; i < 5; i++) {
      const crownX = x - 32 + i * 16;
      triangle(crownX - 8, y - 22 + breathe, crownX, y - 67 - (i % 2) * 12 + breathe, crownX + 8, y - 22 + breathe);
    }
    fill("#432c2e");
    ellipse(x - 14, y - 3 + breathe, 12, 17);
    ellipse(x + 14, y - 3 + breathe, 12, 17);
    fill("#fff0ad");
    circle(x - 12, y - 4 + breathe, 4);
    circle(x + 16, y - 4 + breathe, 4);
    fill("#6e3c36");
    triangle(x - 18, y + 19 + breathe, x, y + 48 + breathe, x + 18, y + 19 + breathe);
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
  text(`${boss.data.name}  ·  ${boss.data.difficulty}/10`, x, y - 7);
  fill("#492f30");
  rect(x, y + 6, barW, 9, 4);
  fill(boss.data.color);
  rect(x, y + 6, barW * constrain(boss.health / boss.maxHealth, 0, 1), 9, 4);
}

function drawProjectiles() {
  noStroke();
  for (const shot of projectiles) {
    if (shot.explosive) {
      fill(255, 111, 63, 45);
      circle(shot.x, shot.y, 34);
      stroke(255, 188, 112, 150);
      strokeWeight(3);
      line(shot.x - shot.vx * 2, shot.y - shot.vy * 2, shot.x - shot.vx * 4, shot.y - shot.vy * 4);
      noStroke();
      fill(shot.color);
      circle(shot.x, shot.y, 15);
      fill("#fff0ce");
      circle(shot.x - 2, shot.y - 2, 4);
    } else {
      fill(255, 192, 106, 45);
      circle(shot.x, shot.y, 24);
      fill(shot.color);
      circle(shot.x, shot.y, 10);
      fill("#fff2ce");
      circle(shot.x - 2, shot.y - 2, 3);
    }
  }
  for (const shot of enemyShots) {
    const angle = atan2(shot.vy, shot.vx);
    push();
    translate(shot.x, shot.y);
    rotate(angle);
    if (shot.kind === "root") {
      fill(65, 93, 52, 45);
      ellipse(0, 0, shot.r * 4, shot.r * 2.5);
      fill(shot.color);
      triangle(-shot.r, -shot.r * 0.7, shot.r * 1.5, 0, -shot.r, shot.r * 0.7);
    } else if (shot.kind === "shard") {
      fill(shot.color);
      triangle(-shot.r, -shot.r, shot.r * 1.5, 0, -shot.r, shot.r);
      fill("#e8fff2");
      triangle(-shot.r * 0.5, -shot.r * 0.4, shot.r * 0.7, 0, -shot.r * 0.5, shot.r * 0.4);
    } else {
      stroke(255, 174, 87, 130);
      strokeWeight(3);
      line(-shot.r * 2.2, 0, -shot.r * 0.3, 0);
      noStroke();
      fill(255, 126, 67, 45);
      circle(0, 0, shot.r * 4);
      fill(shot.color);
      circle(0, 0, shot.r * 2);
      fill("#fff0ce");
      circle(-2, -2, 4);
    }
    pop();
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
  if (player.meleeTimer > 0) {
    stroke("#f4e3b1");
    strokeWeight(4);
    line(x + player.facing * 20, y + 27, x + player.facing * 52, y + 8);
  }
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
  const ammoText = currentWeapon().melee ? "MELEE  ·  close range" :
    player.reloadTimer > 0 ? `RELOADING ${ceil(player.reloadTimer / 60)}s` : `${player.ammo} / ${currentWeapon().magazine}  ·  Q reload`;
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