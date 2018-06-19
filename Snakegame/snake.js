const $ = (ele) => (document.querySelector(ele))

class Vector {
  /**
   * Create a vector.
   * @param {Number} x - the x-axis value.
   * @param {Number} y - the y-axis value.
   */
  constructor(x, y) {
    this.x = x || 0
    this.y = y || 0
  }
  /**
   * Vector addition
   * @param {Object<x: Number, y: Number>} value - argument with x-y values.
   */
  add (value) {
    return new Vector(this.x + value.x, this.y + value.y)
  }
  /**
   * Vector length
   */
  length () {
    return Math.sqrt(Math.pow(this.x, 2), Math.pow(this.y, 2))
  }
  /**
   * Compare vector
   * @param {Object<x: Number, y: Number>} value - argument with x-y values.
   */
  equal (value) {
    return this.x === value.x && this.y === value.y
  }
  /**
   * Compare vector
   * @param {Number} value - argument
   */
  mul (value) {
    return new Vector(this.x * value, this.y * value)
  }
}

class Snake {
  constructor (options = {}) {
    this.options    = options
    this.body       = options.body || new Array()
    this.maxLength  = options.maxLength || 5
    this.head       = new Vector()
    this.speed      = new Vector(1, 0) || new Vector(options.speed, 0)
    this.direction  = 'Right' || options.direction
  }
  update () {
    this.body.push(this.head)
    this.head = this.head.add(this.speed)
    if (this.body.length > this.maxLength) this.body.splice(0, this.body.length - this.maxLength)
  }
  setDirection (arrow) {
    let target
    const speed = (this.options.speed || 1)
    switch (arrow) {
      case 'Up':
        target = new Vector(0, -speed)
        break
      case 'Right':
        target = new Vector(speed, 0)
        break
      case 'Left':
        target = new Vector(-speed, 0)
        break
      case 'Down':
        target = new Vector(0, speed)
        break
    }
    if (!target.equal(this.speed.mul(-1))) {
      this.speed = target
    }
  }
  checkBoundary (gameWidth) {
    let xInRange = 0 <= this.head.x && this.head.x < gameWidth
    let yInRange = 0 <= this.head.y && this.head.y < gameWidth
    return xInRange && yInRange
  }
}

class Game {
  constructor(options = {}) {
    this.blockWidth     = options.blockWidth || 22
    this.blockGap       = options.blockGap || 2
    this.gameWidth      = options.gameWidth || 26
    this.speed          = options.speed || 30
    this.food           = new Array()
    this.snake          = new Snake()
    this.isStart        = false
    this.init()
    this.generateFood()
  }
  init () {
    this.canvas         = document.getElementById('mycanvas')
    this.ctx            = this.canvas.getContext('2d')
    this.canvas.width   = this.blockWidth * this.gameWidth + this.blockGap * (this.gameWidth - 1) //格子寬度*格子數＋格子兼具＊（格子數-1）
    this.canvas.height  = this.canvas.width
    this.render()
    this.update()
  }
  start () {
    this.isStart = true
    this.snake = new Snake()
    $('#gameover').innerText = ''
    $('#gameoverscore').innerText = ''
  }
  end () {
    this.isStart = false
    $('h2').innerText = '分數' + (this.snake.maxLength - 5) * 10
  }
  getPosition (x, y) {
    return new Vector(
      x * this.blockWidth + (x - 1) * this.blockGap,
      y * this.blockWidth + (y - 1) * this.blockGap
    )
  }
  drawBlock (vector, color) {
    const point = this.getPosition(vector.x, vector.y)
    this.ctx.fillStyle = color
    this.ctx.fillRect(point.x, point.y, this.blockWidth, this.blockWidth)
  }
  drawEffect (x, y) {
    const point   = this.getPosition(x, y)
    let el        = this
    let radius    = 2
    const effect = () => {
      radius++
      el.ctx.strokeStyle = `rgba(255, 0, 0, ${(100 - radius) / 100})`
      el.ctx.beginPath()
      el.ctx.arc(point.x + el.blockWidth / 2, point.y + el.blockWidth / 2, 20 * Math.log(radius / 2), 0, Math.PI * 2)
      el.ctx.stroke()
      if (radius < 100) requestAnimationFrame(effect)
    }
    requestAnimationFrame(effect)
  }
  render () {
    this.ctx.fillStyle = 'rgba(28, 165, 206, 0.926)'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    for (let x = 0; x < this.gameWidth; x++) {
      for (let y = 0; y < this.gameWidth; y++) {
        this.drawBlock(new Vector(x, y), 'white')
      }
    }
    this.snake.body.forEach((sp, i) => {
      this.drawBlock(sp, 'rgb(53, 102, 207) ')
    })
    this.food.forEach((p) => {
      this.drawBlock(p, 'red')
    })
    requestAnimationFrame(() => {
      this.render()
    })
  }
  generateFood () {
    let x = parseInt(Math.random() * this.gameWidth)
    let y = parseInt(Math.random() * this.gameWidth)
    this.food.push(new Vector(x, y))
    this.drawEffect(x, y)
    this.playSound('E5', 1)
    this.playSound('A5', 10, 200)
  }
  playSound (note, volume, when = 0) {
    setTimeout(() => {
      var synth = new Tone.Synth().toMaster()
      synth.volume.value = volume || -12
      synth.triggerAttackRelease(note, '8n')
    }, when)
  }
  update () {
    if (this.isStart) {
      this.playSound('A2', -20)
      this.snake.update()
      this.food.forEach((food, i) => {
        if (this.snake.head.equal(food)) {
          this.snake.maxLength++
          this.food.splice(i, 1)
          this.generateFood()
        }
      })
      this.snake.body.forEach((bp) => {
        if (this.snake.head.equal(bp)) {
          this.end()
          $('#gameover').innerText = 'Game Over'
          $('#gameoverscore').innerText = '分數:' + (this.snake.maxLength - 5) * 10
        }
      })
      if (this.snake.checkBoundary(this.gameWidth) == false) {
        this.end()
  
        $('#gameover').innerText = 'Game Over'
        $('#gameoverscore').innerText = 'score:' + (this.snake.maxLength - 5) * 10
  
      }
      $('.lefttop h2').innerText = 'score:' + (this.snake.maxLength - 5) * 10
    }
    setTimeout(() => {
      this.update()
    }, 150)
  }
}

var game = new Game()

window.addEventListener('keydown', (event) => {
  if (event.key.indexOf('Arrow') > -1) game.snake.setDirection(event.key.replace('Arrow', ''))
})