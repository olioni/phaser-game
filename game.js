var config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 570,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 1200
            },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player = ''
let backgroundImage = ''

var spawnX = 50
var spawnY = 400

function preload() {
    // preload background layers
    this.load.image('under-layer', 'assets/images/Backgrounds/TreeLine/under-layer.png')
    this.load.image('back-row', 'assets/images/Backgrounds/TreeLine/back-row.png')
    this.load.image('middle-row', 'assets/images/Backgrounds/TreeLine/middle-row.png')
    this.load.image('front-row', 'assets/images/Backgrounds/TreeLine/front-row.png')

    // preload tiledmap json file, ground textures, tile textures, item textures
    this.load.tilemapTiledJSON('map', 'assets/map/untitled.json')
    this.load.image('groundsImg', 'assets/spritesheets/spritesheet_ground.png')
    this.load.image('tilesImg', 'assets/spritesheets/spritesheet_tiles.png')
    this.load.image('itemsImg', 'assets/spritesheets/spritesheet_items.png')

    // preload player spritesheet
    this.load.spritesheet('taneIdle', 'https://cdn.glitch.com/cd67e3a9-81c5-485d-bf8a-852d63395343%2Ftane-idle.png?v=1606611069685', {
        frameWidth: 128,
        frameHeight: 128
      }
    );

    this.load.spritesheet('taneJump',
      'https://cdn.glitch.com/cd67e3a9-81c5-485d-bf8a-852d63395343%2Ftane-jump.png?v=1606611070167', {
        frameWidth: 128,
        frameHeight: 128
      }
    );

    this.load.spritesheet('taneRun',
      'https://cdn.glitch.com/cd67e3a9-81c5-485d-bf8a-852d63395343%2Ftane-run.png?v=1606611070188', {
        frameWidth: 128,
        frameHeight: 128
      }
    );

    this.load.spritesheet('taneAttack',
      'https://cdn.glitch.com/5095b2d7-4d22-4866-a3b8-5f744eb40eb0%2F128-Attack%20Sprite.png?v=1602576237547', {
        frameWidth: 128,
        frameHeight: 128
      }
    );

    this.load.spritesheet('taneDeath',
      'https://cdn.glitch.com/5095b2d7-4d22-4866-a3b8-5f744eb40eb0%2F128-Death-Sprite.png?v=1602576237169', {
        frameWidth: 128,
        frameHeight: 128
      }
    );
}

function create() {
    // create and display background image
    layer1 = this.add.image(0, 0, 'under-layer').setOrigin(0, 0)
    layer2 = this.add.image(0, 0, 'back-row').setOrigin(0, 0)
    layer3 = this.add.image(0, 0, 'middle-row').setOrigin(0, 0)
    layer4 = this.add.image(0, 0, 'front-row').setOrigin(0, 0)
    
    layer1.setScale(0.6)
    layer1.setScrollFactor(0.25)

    layer2.setScale(0.6)
    layer2.setScrollFactor(0.2)

    layer3.setScale(0.6)
    layer3.setScrollFactor(0.15)

    layer4.setScale(0.6)
    layer4.setScrollFactor(0.1)

    // create and define the map for the player
    const map = this.make.tilemap({key: 'map'})
    
    // add the ground image to the tileset of the map
    const groundTileset = map.addTilesetImage('spritesheet_ground', 'groundsImg')
    // const tileTileset = map.addTilesetImage('spritesheet_tiles', 'tilesImg')
    // const itemTileset = map.addTilesetImage('spritesheet_items', 'itemsImg')

    // create and define each layer in the json file as its on layer
    const platforms = map.createLayer('Platforms', groundTileset, 0, 0)
    // const items = map.createLayer('Coins', itemTileset, 0, 0)
    // const crates = map.createLayer('Crates', tileTileset, 0, 0)
    // const bridges = map.createLayer('Bridges', tileTileset, 0, 0)
    // const liquids = map.createLayer('Liquids', tileTileset, 0, 0)
    // const spikes = map.createLayer('Spikes', tileTileset, 0, 0)

    platforms.setScale(0.3)
    platforms.setCollisionByExclusion(-1, true)

    // crates.setScale(0.3)
    // crates.setCollisionByExclusion(-1, true)

    // items.setScale(0.3)
    // items.setCollisionByExclusion(-1, true)

    // bridges.setScale(0.3)
    // bridges.setCollisionByExclusion(-1, true)

    // liquids.setScale(0.3)
    // liquids.setCollisionByExclusion(-1, true)

    // spikes.setScale(0.3)
    // spikes.setCollisionByExclusion(-1, true)

    // create and define the moveable player
    player = this.physics.add.sprite(50, 400, 'taneIdle')
    player.setScale(0.8)
    player.setBounce(0.2)
    player.body.setSize(player.width - 100, player.height - 50).setOffset(50, 25)

    // add collisions between player and the map
    this.physics.add.collider(player, platforms)
    // this.physics.add.collider(player, crates)
    // this.physics.add.collider(player, bridges)

    // this.physics.add.collider(player, spikes, function(player, spikes){console.log('player touched spikes')})

    // define the keyboard keys
    cursors = this.input.keyboard.createCursorKeys()

    // create and define a camera
    var camera = this.cameras.main
    camera.setBounds(0, 0, 5765, 1140)
    camera.startFollow(player, true)
    camera.setZoom(1.2)

    // camera config
    const controlConfig = {
        camera: camera,
        left: cursors.left,
        right: cursors.right,
        up: cursors.up,
        down: cursors.down,
        acceleration: 0.01,
        drag: 0.0005,
        maxSpeed: 0.2
    }

    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig)

    // player walking animation
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNames('taneRun', {
        frames: [16, 17, 18, 19, 20, 21, 22, 23]
      }),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('taneIdle', {
        frames: [6, 7, 8]
      }),
      frameRate: 5,
      repeat: -1
    });

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('taneJump', {
        frames: [13, 15]
      }),
      frameRate: 10,
    });

    this.anims.create({
      key: 'attack',
      frames: this.anims.generateFrameNumbers('taneAttack', {
          frames: [8, 9, 10, 11]
      }),
      frameRate: 10,
    });

    this.anims.create({
      key: 'die',
      frames: this.anims.generateFrameNumbers('taneDeath', {
          frames: [1, 2, 3, 4, 5]
      }),
      frameRate: 10,
    })
}

function update(time, delta) {
  player.setFlipX(true)
  // define player walking speed
  const speedX = 300
  const speedY = -620

  this.controls.update(delta)

  // flip the player depending on the velocity of the player
  // if (player.body.velocity.x > 0) {
    // player.setFlipX(true)
  // } else if (player.body.velocity.x < 0) {
    // player.setFlipX(false)
  // }

  // detect left and right movement and go at constant speedX
  if (cursors.left.isDown) {
    player.setVelocityX(-speedX)
    player.play('walk', true)
    player.setFlipX(false)
  } else if (cursors.right.isDown) {
    player.setVelocityX(speedX)
    player.setFlipX(true)
    player.play('walk', true)
  } else {
    player.setVelocityX(0)
    player.play('jump',)
    if (player.body.onFloor()) {
      player.play('idle', true)
    }
  }

  if (cursors.up.isDown && player.body.onFloor()) {
    player.body.setVelocityY(speedY)
  }
}