// ======================
// VARIÁVEIS GLOBAIS
// ======================
let player;
let centerX, centerY;
let background;
let radius = 150;
let angle = 0;
let speed = 0.035;
let direction = 1;
let score = 0;
let scoreText;
let enemies = [];
let gameOver = false;
let spawnDelay = 700;
let spawnTimer;
let bgm;
let loseSound;

// ======================
// PET SELECIONADO
// ======================
let selectedPet = 'dog';

// ======================
// CONFIGURAÇÃO DOS PETS
// ======================
const PET_CONFIG = {
    dog: { key: 'dog', scale: 0.03 },
    gato: { key: 'gato', scale: 0.03 }
};

// ======================
// ESTILO TEXTO
// ======================
const uiTextStyle = {
    fontFamily: 'Arial Black',
    fontSize: '22px',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 4
};

// ======================
// SPAWN INIMIGO
// ======================
function spawnEnemy(scene) {
    const ang = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const speedEnemy = Phaser.Math.Between(2, 4);

    const texture =
        score >= 150 && Phaser.Math.Between(0, 1)
            ? 'carrapato'
            : 'pulga';

    const enemy = scene.add.image(centerX, centerY, texture);
    enemy.setScale(texture === 'pulga' ? 0.06 : 0.045);

    enemy.vx = Math.cos(ang) * speedEnemy;
    enemy.vy = Math.sin(ang) * speedEnemy;

    enemies.push(enemy);
}

// ======================
// GAME OVER (CHAMADA)
// ======================
function endGame(scene) {
    if (gameOver) return;
    gameOver = true;

    if (bgm) bgm.stop();
    if (loseSound) loseSound.play();

    enemies.forEach(e => e.destroy());
    enemies = [];

    scene.time.delayedCall(300, () => {
        scene.scene.start('GameOverScene', {
            score: Math.floor(score)
        });
    });
}

// ======================
// MENU
// ======================
class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.image('menu', 'ui/telainicial.png');
    }

    create() {
        const { width, height } = this.scale;

        const bg = this.add.image(0, 0, 'menu').setOrigin(0);
        bg.setScale(Math.max(width / bg.width, height / bg.height));

        const playX = width / 2;
        const playY = height * 0.85;
        const playW = 160;
        const playH = 50;

        // DEBUG
        // this.add.rectangle(playX, playY, playW, playH)
        //     .setStrokeStyle(2, 0x00ff00);

        this.add.zone(playX, playY, playW, playH)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('SelectPetScene');
            });
    }
}

// ======================
// SELEÇÃO DE PET
// ======================
class SelectPetScene extends Phaser.Scene {
    constructor() {
        super('SelectPetScene');
    }

    preload() {
        this.load.image('selectBG', 'escolhaseupet1.png');
    }

    create() {
        const { width, height } = this.scale;

        const bg = this.add.image(0, 0, 'selectBG').setOrigin(0);
        bg.setScale(Math.max(width / bg.width, height / bg.height));

        // DOG
        const dogX = width * 0.25;
        const dogY = height * 0.78;
        const dogW = 130;
        const dogH = 210;

        // DEBUG
        // this.add.rectangle(dogX, dogY, dogW, dogH)
        //     .setStrokeStyle(2, 0x00ff00);

        this.add.zone(dogX, dogY, dogW, dogH)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                selectedPet = 'dog';
                this.scene.start('GameScene');
            });

        // CAT
        const catX = width * 0.75;
        const catY = height * 0.80;
        const catW = 140;
        const catH = 180;

        // DEBUG
        // this.add.rectangle(catX, catY, catW, catH)
        //     .setStrokeStyle(2, 0x00ff00);

        this.add.zone(catX, catY, catW, catH)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                selectedPet = 'gato';
                this.scene.start('GameScene');
            });
    }
}

// ======================
// GAME
// ======================
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('fundo', 'fundo01.png');
        this.load.image('tronco', 'tronco.png');
        this.load.image('pulga', 'pulga.png');
        this.load.image('carrapato', 'carrapato.png');
        this.load.image('dog', 'dog12.png');
        this.load.image('gato', 'gato12.png');
        this.load.audio('bgm', 'bgm.mp3');
        this.load.audio('lose', 'lose.wav');
    }

    create() {
        gameOver = false;
        score = 0;
        angle = 0;
        direction = 1;
        enemies = [];

        centerX = this.cameras.main.centerX;
        centerY = this.cameras.main.centerY;

        const { width, height } = this.scale;

        background = this.add.image(0, 0, 'fundo')
            .setOrigin(0)
            .setDepth(-10);

        background.setScale(
            Math.max(width / background.width, height / background.height)
        );

        bgm = this.sound.add('bgm', { loop: true, volume: 0.6 });
        bgm.play();
        loseSound = this.sound.add('lose');

        this.add.image(centerX, centerY, 'tronco').setScale(0.29);

        const pet = PET_CONFIG[selectedPet];
        player = this.add.image(centerX + radius, centerY, pet.key)
            .setScale(pet.scale);

        scoreText = this.add.text(24, 24, 'Pontos: 0', uiTextStyle);

        this.input.on('pointerdown', () => {
            if (!gameOver) direction *= -1;
        });

        spawnTimer = this.time.addEvent({
            delay: spawnDelay,
            loop: true,
            callback: () => {
                if (!gameOver) spawnEnemy(this);
            }
        });
    }

    update() {
        if (gameOver) return;

        angle += speed * direction;

        player.setPosition(
            centerX + Math.cos(angle) * radius,
            centerY + Math.sin(angle) * radius
        );

        score += 0.25;
        scoreText.setText('Pontos: ' + Math.floor(score));

        enemies.forEach(enemy => {
            enemy.x += enemy.vx;
            enemy.y += enemy.vy;

            if (
                Phaser.Math.Distance.Between(
                    enemy.x, enemy.y,
                    player.x, player.y
                ) < 18
            ) {
                endGame(this);
            }
        });
    }
}

// ======================
// GAME OVER SCENE
// ======================
class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    preload() {
        this.load.image('gameover', 'ui/gamerover.jpg');
        this.load.image('btnJogar', 'ui/jogar.png');
        this.load.image('btnCompartilhar', 'ui/compartilhar.png');
    }

    create(data) {
        const { width, height } = this.scale;

        const bg = this.add.image(0, 0, 'gameover').setOrigin(0);
        bg.setScale(Math.max(width / bg.width, height / bg.height));

        // JOGAR
        const retryX = width / 2;
        const retryY = height * 0.50;
        const retryW = 170;
        const retryH = 70;

        this.add.image(retryX, retryY, 'btnJogar').setScale(0.4);

        // DEBUG
        // this.add.rectangle(retryX, retryY, retryW, retryH)
        //     .setStrokeStyle(2, 0x00ff00);

        this.add.zone(retryX, retryY, retryW, retryH)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('GameScene');
            });

        // COMPARTILHAR
        const shareX = width / 2;
        const shareY = height * 0.65;
        const shareW = 170;
        const shareH = 70;

        this.add.image(shareX, shareY, 'btnCompartilhar').setScale(0.2);

        // DEBUG
        // this.add.rectangle(shareX, shareY, shareW, shareH)
        //     .setStrokeStyle(2, 0x0000ff);

        this.add.zone(shareX, shareY, shareW, shareH)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                const msg = `Joguei no Natureza PetStore e fiz ${data.score} pontos! 🐾`;
                const url = `https://wa.me/5583987542951?text=${encodeURIComponent(msg)}`;
                window.open(url, '_blank');
            });
    }
}

// ======================
// CONFIGURAÇÃO DO JOGO
// ======================
new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 360,
    height: 640,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        MenuScene,
        SelectPetScene,
        GameScene,
        GameOverScene
    ]
});
