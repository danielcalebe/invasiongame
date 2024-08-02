// Definição dos sprites utilizados no jogo
var sprites = {
  monstro: {sx:0, sy:223, w: 283, h:228, frames: 1},
  ship: { sx: 0, sy: 0, w: 37, h: 42, frames: 1 },
  missile: { sx: 0, sy: 30, w: 2, h: 10, frames: 1 },
  enemy_purple: { sx: 37, sy: 0, w: 42, h: 50, frames: 1 },
  enemy_bee: { sx: 79, sy: 0, w: 38, h: 50, frames: 1 },
  enemy_ship: { sx: 116, sy: 0, w: 42, h: 50, frames: 1 },
  enemy_circle: { sx: 158, sy: 0, w: 47, h: 50, frames: 1 },
  explosion: { sx: 0, sy: 64, w: 64, h: 64, frames: 12 },
  enemy_missile: { sx: 9, sy: 42, w: 3, h: 20, frame: 1, },
  boss_missile: { sx: 79, sy: 0, w: 37, h: 43, frame: 1, }
};

// Definição dos diferentes tipos de inimigos no jogo
var enemies = {
  boss_missile: {
    x: 0, y: 0, sprite: 'boss_missile', health: 10,
    B: 120, C: 1, E: 0, firePercentage: 100, missiles: 1
  },
  boss: {
    x: 0, y: -20, sprite: 'monstro', health: 100,
    E: 0
  },
  straight: {
    x: 0, y: -50, sprite: 'enemy_ship', health: 10,
    E: 100
  },
  ltr: {
    x: 0, y: -100, sprite: 'enemy_purple', health: 10,
    B: 75, C: 1, E: 100, missiles: 2
  },
  circle: {
    x: 250, y: -50, sprite: 'enemy_circle', health: 10,
    A: 0, B: -100, C: 1, E: 20, F: 100, G: 1, H: Math.PI / 2
  },
  wiggle: {
    x: 100, y: -50, sprite: 'enemy_bee', health: 20,
    B: 50, C: 4, E: 100, firePercentage: 0.001, missiles: 2
  },
  step: {
    x: 0, y: -50, sprite: 'enemy_circle', health: 10,
    B: 150, C: 1.2, E: 75
  }
};

// Definição dos tipos de objetos no jogo
var OBJECT_PLAYER = 1,
  OBJECT_PLAYER_PROJECTILE = 2,
  OBJECT_ENEMY = 4,
  OBJECT_ENEMY_PROJECTILE = 8,
  OBJECT_POWERUP = 16;

  // Função para iniciar o jogo
var startGame = function () {
  var ua = navigator.userAgent.toLowerCase();

  // Definindo a configuração de estrelas de fundo baseado no tipo de dispositivo
  
  if (ua.match(/android/)) {
    Game.setBoard(0, new Starfield(50, 0.6, 100, true));
  } else {
    Game.setBoard(0, new Starfield(20, 0.4, 100, true));
    Game.setBoard(1, new Starfield(50, 0.6, 100));
    Game.setBoard(2, new Starfield(100, 1.0, 50));
  }
  Game.setBoard(3, new TitleScreen("Senai Invasion",
    "Pressione espaço para começar",
    playGame));
};

// Configurações de diferentes níveis do jogo
var level1 = [
  // Start,   End, Gap,  Type,   Override
  [0, 4000, 500, 'step'],
  [6000, 13000, 800, 'ltr'],
  [10000, 16000, 400, 'circle'],
  [17800, 20000, 500, 'straight', { x: 50 }],
  [18200, 20000, 500, 'straight', { x: 90 }],
  [18200, 20000, 500, 'straight', { x: 10 }],
  [22000, 25000, 400, 'wiggle', { x: 150 }],
  [22000, 25000, 400, 'wiggle', { x: 100 }],
  [22500, 25500, 300, 'step'],
];
// Configurações de diferentes níveis do jogo
var level2 = [
  // Start,   End, Gap,  Type,   Override
  [0, 4000, 500, 'ltr'],
  [6000, 13000, 800, 'wiggle'],
  [8000, 16000, 400, 'circle'],
  [17800, 20000, 400, 'step', { x: 50 }],
  [20200, 20000, 500, 'step', { x: 90 }],
  [22200, 20000, 600, 'step', { x: 10 }],
  [24000, 25000, 400, 'wiggle', { x: 150 }],
  [24000, 25000, 400, 'straight', { x: 100 }],
  [24500, 25500, 300, 'step'],
];
// Configurações de diferentes níveis do jogo
var level3 = [
  // Start,   End, Gap,  Type,   Override
  [0, 4000, 500, 'boss_missile', {x:0}],
  [0, 4000, 500, 'boss'],
  
 

];

var level10 = [
  // Start,   End, Gap,  Type,   Override
  [0, 4000, 500, 'step'],
  [6000, 13000, 800, 'ltr'],
  [10000, 16000, 400, 'circle'],
  [17800, 20000, 500, 'straight', { x: 50 }],
  [18200, 20000, 500, 'straight', { x: 90 }],
  [18200, 20000, 500, 'straight', { x: 10 }],
  [22000, 25000, 400, 'wiggle', { x: 150 }],
  [22000, 25000, 400, 'wiggle', { x: 100 }],
  [22500, 25500, 300, 'step'],
];



var i = 1
var lvl = document.getElementById('lvl').innerHTML 
   
// Função que exibe os gameboards de cada level
var playGame = function () {
  var board = new GameBoard();
  board.add(new PlayerShip());
  document.getElementById('lvl').innerHTML = (lvl + i)
  
  switch (i) {
    case 1:
      board.add(new Level(level1, winGame));
      break;
    case 2:
      board.add(new Level(level2, winGame));
      break;
    case 3:
      board.add(new Level(level3, winGame));
      break;


  }

  Game.setBoard(3, board);
  Game.setBoard(5, new GamePoints(0));
};

// Função chamada quando o jogador ganha o jogo
var winGame = function () {
    // Aumenta o nível do jogo ou finaliza o jogo
  i++
  if (i < 4) {
    
  
    Game.setBoard(3, new TitleScreen("Você Ganhou!",
    "Pressione espaço para o próximo nível",
    playGame));
  }
  else {
    i = 1
  Game.setBoard(3, new TitleScreen("Você finalizou o jogo!",
    "obrigado por jogar  -  Kebab" ,  
    playGame));
  
  }
};
// Função chamada quando o jogador perde o jogo
var loseGame = function () {
  // Reinicia o jogo
  i = 1
  Game.setBoard(3, new TitleScreen("Você perdeu!",
    "Pressione espaço para recomeçar",
    playGame));
};
// Classe para o fundo estelar
var Starfield = function (speed, opacity, numStars, clear) {
// Configuração e desenho do fundo estelar
  // Tela do canvas
  var stars = document.createElement("canvas");
  stars.width = Game.width;
  stars.height = Game.height;
  var starCtx = stars.getContext("2d");

  var offset = 0;

  // If the clear option is set, 
  // make the background black instead of transparent
  if (clear) {
    starCtx.fillStyle = "#000";
    starCtx.fillRect(0, 0, stars.width, stars.height);
  }


// Se a opção clear estiver definida,
  //torna o fundo preto em vez de transparente
  starCtx.fillStyle = "#FFF";
  starCtx.globalAlpha = opacity;
  for (var i = 0; i < numStars; i++) {
    starCtx.fillRect(Math.floor(Math.random() * stars.width),
      Math.floor(Math.random() * stars.height),
      2,
      2);
  }

// Este método é chamado a cada frame
  //para desenhar o campo estelar na tela
  this.draw = function (ctx) {
    var intOffset = Math.floor(offset);
    var remaining = stars.height - intOffset;

    //Desenha a metade superior do campo estelar
    if (intOffset > 0) {
      ctx.drawImage(stars,
        0, remaining,
        stars.width, intOffset,
        0, 0,
        stars.width, intOffset);
    }


//Desenha a metade inferior do campo estelar
    if (remaining > 0) {
      ctx.drawImage(stars,
        0, 0,
        stars.width, remaining,
        0, intOffset,
        stars.width, remaining);
    }
  };

//Este método é chamado para atualizar
  // o campo estelar
  this.step = function (dt) {
    offset += dt * speed;
    offset = offset % stars.height;
  };
};

// Classe para a nave do jogador

var PlayerShip = function () {
 // Configurações e movimento da nave do jogador
  this.setup('ship', { vx: 0, reloadTime: 0.25, maxVel: 200 });

  this.reload = this.reloadTime;
  this.x = Game.width / 2 - this.w / 2;
  this.y = Game.height - Game.playerOffset - this.h;

  this.step = function (dt) {
    if (Game.keys['left']) { this.vx = -this.maxVel; }
    else if (Game.keys['right']) { this.vx = this.maxVel; }
    else { this.vx = 0; }

    this.x += this.vx * dt;

    if (this.x < 0) { this.x = 0; }
    else if (this.x > Game.width - this.w) {
      this.x = Game.width - this.w;
    }

    this.reload -= dt;

    if (Game.keys['fire'] && this.reload < 0) {
    


      

      this.reload = this.reloadTime;

      this.board.add(new PlayerMissile(this.x, this.y + this.h / 2));
      this.board.add(new PlayerMissile(this.x + this.w, this.y + this.h / 2));


    }
  };
};

PlayerShip.prototype = new Sprite();
PlayerShip.prototype.type = OBJECT_PLAYER;

PlayerShip.prototype.hit = function (damage) {
  if (this.board.remove(this)) {
    loseGame();
  }
};

// Classe para os mísseis do jogador
var PlayerMissile = function (x, y) {

 // Configurações e movimento dos mísseis do jogador
  this.setup('missile', { vy: -700, damage: 10 });

  this.x = x - this.w / 2;
  this.y = y - this.h;
};

PlayerMissile.prototype = new Sprite();
PlayerMissile.prototype.type = OBJECT_PLAYER_PROJECTILE;

PlayerMissile.prototype.step = function (dt) {
  this.y += this.vy * dt;
  var collision = this.board.collide(this, OBJECT_ENEMY);
  if (collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if (this.y < -this.h) {
    this.board.remove(this);
  }
};

// Classe para os inimigos
var Enemy = function (blueprint, override) {
   // Configurações e movimento dos inimigos
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite, blueprint);
  this.merge(override);
};

Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_ENEMY;

Enemy.prototype.baseParameters = {
  A: 0, B: 0, C: 0, D: 0,
  E: 0, F: 0, G: 0, H: 0,
  t: 0, reloadTime: 0.75,
  reload: 0
};

Enemy.prototype.step = function (dt) {
  this.t += dt;

  this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
  this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);

  this.x += this.vx * dt;
  this.y += this.vy * dt;

  var collision = this.board.collide(this, OBJECT_PLAYER);
  if (collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  }

  if (Math.random() < 0.01 && this.reload <= 0) {
    this.reload = this.reloadTime;
    if (this.missiles == 2) {
      this.board.add(new EnemyMissile(this.x + this.w - 2, this.y + this.h));
      this.board.add(new EnemyMissile(this.x + 2, this.y + this.h));
    } else {
      this.board.add(new EnemyMissile(this.x + this.w / 2, this.y + this.h));
    }

  }
  this.reload -= dt;

  if (this.y > Game.height ||
    this.x < -this.w ||
    this.x > Game.width) {
    this.board.remove(this);
  }
};

Enemy.prototype.hit = function (damage) {
  this.health -= damage;
  if (this.health <= 0) {
    if (this.board.remove(this)) {
      Game.points += this.points || 100;
      this.board.add(new Explosion(this.x + this.w / 2,
        this.y + this.h / 2));
    }
  }
};
// Classe para os mísseis dos inimigos
var EnemyMissile = function (x, y) {
  // Configurações e movimento dos mísseis dos inimigos
  this.setup('enemy_missile', { vy: 200, damage: 10 });
  this.x = x - this.w / 2;
  this.y = y;
};

EnemyMissile.prototype = new Sprite();
EnemyMissile.prototype.type = OBJECT_ENEMY_PROJECTILE;

EnemyMissile.prototype.step = function (dt) {
  this.y += this.vy * dt;
  var collision = this.board.collide(this, OBJECT_PLAYER)
  if (collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if (this.y > Game.height) {
    this.board.remove(this);
  }
};



var Explosion = function (centerX, centerY) {
  this.setup('explosion', { frame: 0 });
  this.x = centerX - this.w / 2;
  this.y = centerY - this.h / 2;
};

Explosion.prototype = new Sprite();

Explosion.prototype.step = function (dt) {
  this.frame++;
  if (this.frame >= 12) {
    this.board.remove(this);
  }
};
// Configurações e movimento dos mísseis dos inimigos
window.addEventListener("load", function () {
  // Inicialização do jogo
  Game.initialize("game", sprites, startGame);
});


