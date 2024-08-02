// Esta seção detecta e configura o pedido de animação de quadro. Se o navegador não suportar nativamente, uma função alternativa é definida.
(function () {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame =
      window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function (callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function () { callback(currTime + timeToCall); },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
}());

// Definição do objeto Game, responsável pelo controle do jogo
var Game = new function () {
  var boards = [];

  // Inicialização do jogo
  this.initialize = function (canvasElementId, sprite_data, callback) {

    // Configuração do canvas e contexto
    this.canvas = document.getElementById(canvasElementId);

    this.playerOffset = 10;
    this.canvasMultiplier = 1;
    this.setupMobile();

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.ctx = this.canvas.getContext && this.canvas.getContext('2d');
    if (!this.ctx) { return alert("Please upgrade your browser to play"); }

    this.setupInput();

    this.loop();

    if (this.mobile) {
      this.setBoard(4, new TouchControls());
    }

    SpriteSheet.load(sprite_data, callback);

  };


  // Inicialização de eventos de entrada
  var KEY_CODES = { 37: 'left', 39: 'right', 32: 'fire' };
  this.keys = {};

  this.setupInput = function () {
    window.addEventListener('keydown', function (e) {

      if (KEY_CODES[e.keyCode]) {
        Game.keys[KEY_CODES[e.keyCode]] = true;
        e.preventDefault();
      }
    }, false);

    window.addEventListener('keyup', function (e) {
      if (KEY_CODES[e.keyCode]) {
        Game.keys[KEY_CODES[e.keyCode]] = false;
        e.preventDefault();
      }
    }, false);
  };


  var lastTime = new Date().getTime();
  var maxTime = 1 / 30;


  // game loop
  this.loop = function () {

    // Loop principal do jogo, atualizando e desenhando os quadros
    var curTime = new Date().getTime();
    requestAnimationFrame(Game.loop);
    var dt = (curTime - lastTime) / 1000;
    if (dt > maxTime) { dt = maxTime; }

    for (var i = 0, len = boards.length; i < len; i++) {
      if (boards[i]) {
        boards[i].step(dt);
        boards[i].draw(Game.ctx);
      }
    }
    lastTime = curTime;
  };

  // Altera um quadro de jogo ativo 
  this.setBoard = function (num, board) { boards[num] = board; };

  // Configuração para dispositivos móveis
  this.setupMobile = function () {

    // Configuração da interface de toque e redimensionamento do canvas
    var container = document.getElementById("container"),
      hasTouch = !!('ontouchstart' in window),
      w = window.innerWidth, h = window.innerHeight;

    if (hasTouch) { this.mobile = true; }

    if (screen.width >= 1280 || !hasTouch) { return false; }

    if (w > h) {
      alert("Please rotate the device and then click OK");
      w = window.innerWidth; h = window.innerHeight;
    }

    container.style.height = h * 2 + "px";
    window.scrollTo(0, 1);

    h = window.innerHeight + 2;
    container.style.height = h + "px";
    container.style.width = w + "px";
    container.style.padding = 0;

    if (h >= this.canvas.height * 1.75 || w >= this.canvas.height * 1.75) {
      this.canvasMultiplier = 2;
      this.canvas.width = w / 2;
      this.canvas.height = h / 2;
      this.canvas.style.width = w + "px";
      this.canvas.style.height = h + "px";
    } else {
      this.canvas.width = w;
      this.canvas.height = h;
    }

    this.canvas.style.position = 'absolute';
    this.canvas.style.left = "0px";
    this.canvas.style.top = "0px";

  };

};

// Objeto SpriteSheet para carregar e desenhar sprites
var SpriteSheet = new function () {
  this.map = {};
  // Método para carregar a folha de sprite
  this.load = function (spriteData, callback) {
    this.map = spriteData;
    this.image = new Image();
    this.image.onload = callback;
    this.image.src = 'images/sprites.png';
  };

  // Método para desenhar um sprite na tela
  this.draw = function (ctx, sprite, x, y, frame) {
    var s = this.map[sprite];
    if (!frame) frame = 0;
    ctx.drawImage(this.image,
      s.sx + frame * s.w,
      s.sy,
      s.w, s.h,
      Math.floor(x), Math.floor(y),
      s.w, s.h);
  };

  return this;
};



// Tela de título do jogo
var TitleScreen = function TitleScreen(title, subtitle, callback) {
  var up = false;
  this.step = function (dt) {
    if (!Game.keys['fire']); up = true;
    if (up && Game.keys['fire'] && callback) callback();
  };

  this.draw = function (ctx) {
    ctx.fillStyle = "#FFFFFF";

    ctx.font = "bold 30px bangers";
    var measure = ctx.measureText(title);
    ctx.fillText(title, Game.width / 2 - measure.width / 2, Game.height / 2);

    ctx.font = "bold 20px bangers";
    var measure2 = ctx.measureText(subtitle);
    ctx.fillText(subtitle, Game.width / 2 - measure2.width / 2, Game.height / 2 + 40);
  };
};

// Classe GameBoard para controlar objetos em um quadro de jogo
var GameBoard = function () {
  var board = this;

  // Métodos para adicionar, remover e atualizar objetos no quadro de jogo

  // Atual lista de objetos
  this.objects = [];
  this.cnt = {};

  // Adicionar novo objeto a lista
  this.add = function (obj) {
    obj.board = this;
    this.objects.push(obj);
    this.cnt[obj.type] = (this.cnt[obj.type] || 0) + 1;
    return obj;
  };

  // Marcar um objeto para remoção
  this.remove = function (obj) {
    var idx = this.removed.indexOf(obj);
    if (idx == -1) {
      this.removed.push(obj);
      return true;
    } else {
      return false;
    }
  };

  // Reset da lista de objetos removidos
  this.resetRemoved = function () { this.removed = []; };

  // Removido um objeto marcado para remoção da lista
  this.finalizeRemoved = function () {
    for (var i = 0, len = this.removed.length; i < len; i++) {
      var idx = this.objects.indexOf(this.removed[i]);
      if (idx != -1) {
        this.cnt[this.removed[i].type]--;
        this.objects.splice(idx, 1);
      }
    }
  };

  // Chame o mesmo metodo para todos os objetos da lista atual
  this.iterate = function (funcName) {
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0, len = this.objects.length; i < len; i++) {
      var obj = this.objects[i];
      obj[funcName].apply(obj, args);
    }
  };

  // Encontre o primeiro objeto para o qual func é verdadeiro
  this.detect = function (func) {
    for (var i = 0, val = null, len = this.objects.length; i < len; i++) {
      if (func.call(this.objects[i])) return this.objects[i];
    }
    return false;
  };

  // Chame step em todos os objetos e exclua qualquer objeto que tenha sido marcado para remoção
  this.step = function (dt) {
    this.resetRemoved();
    this.iterate('step', dt);
    this.finalizeRemoved();
  };

  // desenhe todos os objetos
  this.draw = function (ctx) {
    this.iterate('draw', ctx);
  };

  // Verifique se há uma colisão entre os retângulos delimitadores de dois objetos
  this.overlap = function (o1, o2) {
    return !((o1.y + o1.h - 1 < o2.y) || (o1.y > o2.y + o2.h - 1) ||
      (o1.x + o1.w - 1 < o2.x) || (o1.x > o2.x + o2.w - 1));
  };

  // Encontre o primeiro objeto que colide com a correspondência de obj em um tipo opcional
  this.collide = function (obj, type) {
    return this.detect(function () {
      if (obj != this) {
        var col = (!type || this.type & type) && board.overlap(obj, this);
        return col ? this : false;
      }
    });
  };


};

var Sprite = function () { };

Sprite.prototype.setup = function (sprite, props) {
  this.sprite = sprite;
  this.merge(props);
  this.frame = this.frame || 0;
  this.w = SpriteSheet.map[sprite].w;
  this.h = SpriteSheet.map[sprite].h;
};

Sprite.prototype.merge = function (props) {
  if (props) {
    for (var prop in props) {
      this[prop] = props[prop];
    }
  }
};

Sprite.prototype.draw = function (ctx) {
  SpriteSheet.draw(ctx, this.sprite, this.x, this.y, this.frame);
};

Sprite.prototype.hit = function (damage) {
  this.board.remove(this);
};


var Level = function (levelData, callback) {
  this.levelData = [];
  for (var i = 0; i < levelData.length; i++) {
    this.levelData.push(Object.create(levelData[i]));
  }
  this.t = 0;
  this.callback = callback;
};

Level.prototype.step = function (dt) {
  var idx = 0, remove = [], curShip = null;

  //Atualizar o deslocamento no tempo atual
  this.t += dt * 1000;

  //Início, Fim, Espaço, Tipo, Substituição
  // [ 0,     4000, 500, 'step', { x: 100 } ]
  while ((curShip = this.levelData[idx]) &&
    (curShip[0] < this.t + 2000)) {
    // Verifique se já passamos no tempo final
    if (this.t > curShip[1]) {
      remove.push(curShip);
    } else if (curShip[0] < this.t) {
      //  plano de definição do inimigo
      var enemy = enemies[curShip[3]],
        override = curShip[4];

     //Adiciona um novo inimigo com o projeto e substitui
      this.board.add(new Enemy(enemy, override));

      // Increment the start time by the gap
      curShip[0] += curShip[2];
    }
    idx++;
  }
// Remove todos os objetos do levelData que passaram
  for (var i = 0, len = remove.length; i < len; i++) {
    var remIdx = this.levelData.indexOf(remove[i]);
    if (remIdx != -1) this.levelData.splice(remIdx, 1);
  }

  
// Se não houver mais inimigos na tela ou no
  //levelData, este nível está concluído
  if (this.levelData.length === 0 && this.board.cnt[OBJECT_ENEMY] === 0) {
    if (this.callback) this.callback();
  }

};

Level.prototype.draw = function (ctx) { };

// Controles de toque para dispositivos móveis
var TouchControls = function () {

  var gutterWidth = 10;
  var unitWidth = Game.width / 5;
  var blockWidth = unitWidth - gutterWidth;

  this.drawSquare = function (ctx, x, y, txt, on) {
    ctx.globalAlpha = on ? 0.9 : 0.6;
    ctx.fillStyle = "#CCC";
    ctx.fillRect(x, y, blockWidth, blockWidth);

    ctx.fillStyle = "#FFF";
    ctx.globalAlpha = 1.0;
    ctx.font = "bold " + (3 * unitWidth / 4) + "px arial";

    var txtSize = ctx.measureText(txt);

    ctx.fillText(txt,
      x + blockWidth / 2 - txtSize.width / 2,
      y + 3 * blockWidth / 4 + 5);
  };

  this.draw = function (ctx) {
    ctx.save();
  // Métodos para desenhar e rastrear controles de toque
    var yLoc = Game.height - unitWidth;
    this.drawSquare(ctx, gutterWidth, yLoc, "\u25C0", Game.keys['left']);
    this.drawSquare(ctx, unitWidth + gutterWidth, yLoc, "\u25B6", Game.keys['right']);
    this.drawSquare(ctx, 4 * unitWidth, yLoc, "A", Game.keys['fire']);

    ctx.restore();
  };

  this.step = function (dt) { };

  this.trackTouch = function (e) {
    var touch, x;

    e.preventDefault();
    Game.keys['left'] = false;
    Game.keys['right'] = false;
    for (var i = 0; i < e.targetTouches.length; i++) {
      touch = e.targetTouches[i];
      x = touch.pageX / Game.canvasMultiplier - Game.canvas.offsetLeft;
      if (x < unitWidth) {
        Game.keys['left'] = true;
      }
      if (x > unitWidth && x < 2 * unitWidth) {
        Game.keys['right'] = true;
      }
    }

    if (e.type == 'touchstart' || e.type == 'touchend') {
      for (i = 0; i < e.changedTouches.length; i++) {
        touch = e.changedTouches[i];
        x = touch.pageX / Game.canvasMultiplier - Game.canvas.offsetLeft;
        if (x > 4 * unitWidth) {

          Game.keys['fire'] = (e.type == 'touchstart');
        }
      }
    }
  };

  Game.canvas.addEventListener('touchstart', this.trackTouch, true);
  Game.canvas.addEventListener('touchmove', this.trackTouch, true);
  Game.canvas.addEventListener('touchend', this.trackTouch, true);

  // para Android
  Game.canvas.addEventListener('dblclick', function (e) { e.preventDefault(); }, true);
  Game.canvas.addEventListener('click', function (e) { e.preventDefault(); }, true);

  Game.playerOffset = unitWidth + 20;
};


// Classe GamePoints para controlar e exibir os pontos do jogador
var GamePoints = function () {
  Game.points = 0;

  var pointsLength = 8;

  this.draw = function (ctx) {
    ctx.save();
    ctx.font = "bold 18px arial";
    ctx.fillStyle = "#FFFFFF";
  // Método para desenhar e atualizar pontos
    var txt = "" + Game.points;
    var i = pointsLength - txt.length, zeros = "";
    while (i-- > 0) { zeros += "0"; }

    ctx.fillText(zeros + txt, 10, 20);
    ctx.restore();

  };

  this.step = function (dt) { };
};
