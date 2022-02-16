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

var player = ''
var gameOver = false
var backgroundImage = ''
var timedEvent = ''

var spawnX = 50
var spawnY = 400

var doubleJump = false
var jumps = 0

var health = 100

function preload() {
    // background
    this.load.image('background', 'assets/images/Backgrounds/game-background.png')
    
    // map
    this.load.tilemapTiledJSON('map', 'assets/map/test.json')
    this.load.image('groundsImg', 'assets/spritesheets/spritesheet_ground.png');
    this.load.image('tilesImg', 'assets/spritesheets/spritesheet_tiles.png');
    
    // player
    this.load.atlasXML('alien', 'assets/spritesheets/spritesheet_players.png', 'assets/spritesheets/spritesheet_players.xml');
    
    // enemy
    this.load.atlasXML('enemies', 'assets/spritesheets/spritesheet_enemies.png', 'assets/spritesheets/spritesheet_enemies.xml');
    this.load.image('bee', 'assets/images/Enemies/bee.png')
    this.load.image('fish', 'assets/images/Enemies/fishBlue.png')

}

function create() {
    /* Create and define player, enemies, items and map */
    // background
    backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0);
    backgroundImage.setScale(1)
    // map
    const map = this.make.tilemap({key: 'map' });
    // ground
    const groundsTileset = map.addTilesetImage('spritesheet_ground', 'groundsImg');
    const tilesTileset = map.addTilesetImage('spritesheet_tiles', 'tilesImg')
    
    const platforms = map.createStaticLayer('Platforms', groundsTileset, 0, 0);
    const tiles = map.createStaticLayer('Tiles', tilesTileset, 0, 0)

    platforms.setScale(0.3)
    platforms.setCollisionByExclusion(-1, true);

    tiles.setScale(0.3)
    tiles.setCollisionByExclusion(-1, true)

    // player
    player = this.physics.add.sprite(50, 400, 'alien');
    player.setScale(0.5)
    player.setBounce(0.05);
    player.body.setSize(player.width, player.height - 150).setOffset(0, 150);
    
    // collider
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, tiles)

    /* Create and define a camera to follow the player */
    // --- Camera ---
    this.cameras.main.setBounds(0, 0, 4200, 570)
    var camera = this.cameras.main
    camera.startFollow(player, true)
    camera.setZoom(1)

    // --- Controls ---
    this.cursors = this.input.keyboard.createCursorKeys();

    // --- Camera config ---
    const controlConfig = {
        camera: camera,
        left: this.cursors.left,
        right: this.cursors.right,
        up: this.cursors.up,
        down: this.cursors.down,
        acceleration: 0.01,
        drag: 0.0005,
        maxSpeed: 0.2,
    }

    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
    
    // animations
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('alien', { 
            prefix: 'alienYellow_walk', 
            suffix: '.png',
            start: 1,
            end: 2,
            zeroPad: 1
        }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'idle',
        frames: [{ key: 'alien', frame: 'alienYellow_front.png' }],
        frameRate: 10,
    });
    this.anims.create({
        key: 'jump',
        frames: [{ key: 'alien', frame: 'alienYellow_jump.png' }],
        frameRate: 10,
    });
   
    // enemies
    this.anims.create({
        key: 'beeMove',
        frames: [{ key: 'enemies', frame: 'bee.png'},{ key: 'enemies', frame: 'bee_move.png'} ],
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'fishUp',
        frames: [{key: 'enemies', frame: 'fishBlue.png'}]
    })
    
    this.enemies = this.physics.add.group({allowGravity: false,immovable: true});
    const enemyObj = map.getObjectLayer('Enemies')['objects'];
    enemyObj.forEach(enemyObj => {
        if (enemyObj.type == 'bee') {
            const bee = this.enemies.create(enemyObj.x * 0.3, (enemyObj.y * 0.3) - enemyObj.height, 'bee').setOrigin(0, 0).setScale(0.3)
            this.tweens.add({
                targets: bee,
                y: 200,
                duration: 2000,
                ease: 'Sine.easeInOut',
                repeat: -1,
                yoyo: true
            });
            bee.play('beeMove', true);
        }
        if (enemyObj.type == 'fish') {
            const fish = this.enemies.create(enemyObj.x * 0.3, (enemyObj.y * 0.4) - enemyObj.height, 'fish').setOrigin(0, 0).setScale(0.3)
            this.tweens.add({
                targets: fish,
                y: 200,
                duration: 1000,
                ease: 'Sine.easeInOut',
                repeat: -1,
                yoyo: true
            });
            fish.play('fishUp', true);
        }
    })
    this.physics.add.overlap(player, this.enemies, hitEnemy, null, this);
}

function update(time, delta) {
    if (gameOver === true) {
        return;
    }

    this.controls.update(delta);

    const speed = 500
    // Control the player with left or right keys
    // if (touchedBee == false) {
        if (this.cursors.left.isDown) {
            player.setVelocityX(-speed);
            if (player.body.onFloor()) {
            player.play('walk', true);
            }
        } else if (this.cursors.right.isDown) {
            player.setVelocityX(speed);
            if (player.body.onFloor()) {
            player.play('walk', true);
            }
        } else {
            // If no keys are pressed, the player keeps still
            player.setVelocityX(0);
            player.play('jump', true);
            // Only show the idle animation if the player is footed
            // If this is not included, the player would look idle while jumping
            if (player.body.onFloor()) {
            player.play('idle', true);
            }
        }
    // }

    // Player can jump while walking any direction by pressing the space bar
    // or the 'UP' arrow
    if ((this.cursors.space.isDown || this.cursors.up.isDown) && player.body.onFloor() && jumps == 0 && doubleJump == false) {
        player.setVelocityY(-620);
        player.play('jump', true);
        jumps += 1
    }
    if (player.body.onFloor()) {
        jumps = 0 
        doubleJump = false
    }
    
    if (player.body.y >= 560) {
        player.body.x = spawnX
        player.body.y = spawnY
    }

    // flip player
    if (player.body.velocity.x > 0) {
        player.setFlipX(false);
    } else if (player.body.velocity.x < 0) {
        // otherwise, make them face the other side
        player.setFlipX(true);
    }

    if (health == 0) {
        player.body.x = spawnX
        player.body.y = spawnY
        player.clearTint()
        health = 100
    }

    // console.log(health)

}

function hitEnemy(player, enemy) {
    health -= 10
    player.setTint(0xff0000)
    if (player.body.x >= enemy.body.x) {
        player.body.x += 5
    } else {
        player.body.x -= 5
    }
}