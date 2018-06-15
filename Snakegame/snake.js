var Vector = function (x,y){
  this.x = x || 0 
  this.y = y || 0 
}
Vector.prototype.add = function(v) {
  return new Vector(this.x + v.x, this.y + v.y);
}; //現在身上的x加上，外來向量的x//v為外來向量
Vector.prototype.sub = function(v) {
  return new Vector(this.x - v.x, this.y - v.y);
}; //現在身上的x減掉，外來向量的x
Vector.prototype.length = function(v) {
  return Math.sqrt(this.x * this.x + this.y * this.y);
}; //長度，畢氏定理//sqrt為開根號
Vector.prototype.set = function(x, y) {
  this.x = x;
  this.y = y;
  return x + y;
}; //重設向量
Vector.prototype.equal = function(v) {
  return this.x == v.x && this.y == v.y;
}; //是否相等
Vector.prototype.mul = function(s) {
  return new Vector(this.x * s, this.y * s);
}; //與傳入數相乘//s為純量（數字）
Vector.prototype.clone = function() {
  return new Vector(this.x, this.y);
}; //複製一個一樣的向量

var Snake = function (){
  this.body = []
  this.maxLength = 5
  this.head = new Vector()
  this.speed = new Vector(1,0)
  this.direction = "Right"  
}

Snake.prototype.update = function(){
  var newHead = this.head.add(this.speed)
  this.body.push(this.head)
  this.head = newHead 
  while (this.body.length > this.maxLength){
    this.body.shift()
  }
}

Snake.prototype.setDirection = function(dir){
  var target 
  if(dir=="Up"){
    target = new Vector(0,-1)
  }
  if(dir=="Right"){
    target = new Vector(1,0)
  }
  if(dir=="Left"){
    target = new Vector(-1,0)
  }
  if(dir=="Down"){
    target = new Vector(0,1)
  }
  if (target.equal(this.speed.mul(-1))==false){
    this.speed = target
  }
}

var Game = function() {
  this.bw = 22; //每個格子的寬度
  this.bs = 2; //每個格子的間距
  this.gameWidth = 26; //遊戲格子數
  this.speed = 30; //速度
  this.snake = new Snake()
  this.food = [];
  this.init()
  this.start = false
  this.generateFood()
};

Snake.prototype.checkBoundary = function (gameWidth){
  let xInRange = 0 <= this.head.x && this.head.x < gameWidth
  let yInRange = 0 <= this.head.y && this.head.y < gameWidth
  return xInRange && yInRange
  console.log(xInRange && yInRange)  
}

Game.prototype.init = function() {
  this.canvas = document.getElementById("mycanvas");
  this.ctx = this.canvas.getContext("2d");
  this.canvas.width = this.bw*this.gameWidth + this.bs*(this.gameWidth-1); //格子寬度*格子數＋格子兼具＊（格子數-1）
  this.canvas.height = this.canvas.width; //設定高度和寬度相等
  this.render();
  this.update() ;
};

Game.prototype.startGame = function() {
  this.start = true
  this.snake = new Snake()
  $('#gameover').text("")
  $('#gameoverscore').text("")

}

Game.prototype.endGame = function() {
  this.start = false
  $('h2').text("分數" + (this.snake.maxLength-5)*10)
}

Game.prototype.getPosition = function(x, y) {
  return new Vector(
    x *this.bw + (x-1) *this.bs, //bw為每個格子的寬度，bs為每個格子的間距
    y *this.bw + (y-1) *this.bs
  ); //算出來的為實際位置
};

Game.prototype.drawBlock = function(v, color) {
  //v為格子向量
  this.ctx.fillStyle = color;
  var pos = this.getPosition(v.x, v.y); //return的pos為一物件（new Vector）
  this.ctx.fillRect(pos.x, pos.y, this.bw, this.bw);
};

Game.prototype.drawEffect = function(x,y) {
  var r = 2
  var pos = this.getPosition(x,y)
  var _this = this
  var effect = ()=>{
    r++
    _this.ctx.strokeStyle = "rgba(255,0,0,"+(100-r)/100 +")"
    _this.ctx.beginPath()
    _this.ctx.arc(pos.x+_this.bw/2,pos.y+_this.bw/2,20*Math.log(r/2),
                  0,Math.PI*2)
    _this.ctx.stroke()
    if(r<100){
      requestAnimationFrame(effect)
    }  
  }
  requestAnimationFrame(effect)
}

Game.prototype.render = function() {
  this.ctx.fillStyle = "rgba(28, 165, 206, 0.926)"; //顏色
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  //(矩形左上角的x座標,矩形左上角的y座標,寬度,高度)
  for (var x=0; x<this.gameWidth; x++) {
    //gameWidth為遊戲格字數
    for (var y=0; y<this.gameWidth; y++) {
      this.drawBlock(new Vector(x, y), "white");
    }
  }
  this.snake.body.forEach((sp,i)=>{
    this.drawBlock(sp,"rgb(53, 102, 207) ")
  })
  this.food.forEach((p)=>{
    this.drawBlock(p,"red")
  })
  requestAnimationFrame(()=>{
    this.render()
  })
};

Game.prototype.generateFood = function(){
  var x = parseInt(Math.random()*this.gameWidth)
  var y = parseInt(Math.random()*this.gameWidth)
  this.food.push(new Vector(x,y))
  this.drawEffect(x,y)
  this.playSound("E5",1)
  this.playSound("A5",10,200)
}

Game.prototype.playSound = function(note,volume,when){
  setTimeout(function(){
    var synth = new Tone.Synth().toMaster();
    synth.volume = volume || -12
    synth.triggerAttackRelease(note,"8n")
    console.log("a")
  },when || 0)  
}

Game.prototype.update = function(){
  if(this.start){
    this.playSound("A2",-20)
    this.snake.update()
    this.food.forEach((food,i)=>{
      if(this.snake.head.equal(food)){
        this.snake.maxLength++
        this.food.splice(i,1)
        this.generateFood()
      }
    })
    this.snake.body.forEach((bp)=>{
      if(this.snake.head.equal(bp)){
        console.log("碰")
        this.endGame()
        $('#gameover').text("Game Over")
        $('#gameoverscore').text("分數:"+ (this.snake.maxLength-5)*10)
      }
    })
    if(this.snake.checkBoundary(this.gameWidth)== false){
      this.endGame()

      $('#gameover').text("Game Over")
      $('#gameoverscore').text("score:"+ (this.snake.maxLength-5)*10)

    }
    $('.lefttop h2').text("score:"+ (this.snake.maxLength-5)*10)
  }
  setTimeout(()=>{
    this.update()
  },150)
};

var game = new Game();

$(window).keydown(function(evt){
  console.log(evt.key)
  game.snake.setDirection(evt.key.replace("Arrow",""))
})