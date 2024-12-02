var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var platforms;
var player;
var cursors;
var stars;
var score = 0;
var scoreText;
var bombs;
var shields;
var protected = false;
var highestScore = 0;

function preload ()
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('shield', 'assets/shield.png')
    this.load.spritesheet('dude',
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 });
}

function create ()
{
    this.add.image(400, 300, 'sky');
    
    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 
        'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 450, 'dude');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers('dude', 
            { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    })

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude',
            { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    })

    this.physics.add.collider(player, platforms);

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(stars, platforms);

    this.physics.add.overlap(player, stars, collectStar, null, this);

    scoreText = this.add.text(16, 16, 'Score: ' + score + '\nHighest Score: ' + highestScore, {
        fontSize: '32px', fill: '#000'
    });

    bombs = this.physics.add.group();
    
    this.physics.add.collider(bombs, platforms);

    this.physics.add.collider(player, bombs, hitBomb, null, this);

    shields = this.physics.add.group();

    this.physics.add.collider(shields, platforms);

    this.physics.add.overlap(player, shields, collectShield, null, this);

}

function update ()
{
    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {                
        player.setVelocityY(-330);
    }

    
}

function collectStar (player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score + '\nHighest Score: ' + highestScore);

    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x < 400) ? 
            Phaser.Math.Between(400, 800) :
            Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

        x = Phaser.Math.Between(0, 800);

        var shield = shields.create(x, 16, 'shield');
        shield.setScale(.15);
        shield.setBounce(1);
        shield.setCollideWorldBounds(true);

        shield.setVelocity(Phaser.Math.Between(-100, 100), 20);
    }
}

function hitBomb (player, bomb) {
    
    if (protected) {
        protected = false;
        player.setTint(0xffffff);
    }else {
        this.physics.pause();
        
        player.setTint(0xff0000);

        player.anims.play('turn');

        gameOver = true;

        scoreText = this.add.text(400, 300, 'GAME OVER', {
            fontSize: '32px', fill: '#FF0000'
        }).setOrigin(0.5);

        var playAgain = this.add.text(400, 400, 'Play Again')
            .setOrigin(0.5)
            .setPadding(10)
            .setStyle({ backgroundColor: '#111' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.registry.destroy();
                this.events.off();
                this.scene.restart();
                protected = false;
                if( score > highestScore ){
                    highestScore = score;
                }
                score = 0;
            })
            .on('pointerover', () => playAgain.setStyle({ fill: '#f39c12' , backgroundColor: '#111'}))
            .on('pointerout', () => playAgain.setStyle({ fill: '#FFF', backgroundColor: '#111' }))
    }
}

function collectShield (player, shield) {
    shield.disableBody(true, true);

    protected = true;
    player.setTint(0xFFC0CB);

    setTimeout(() => {
        protected = false;
        player.setTint(0xffffff);
    }, 10000);
}

