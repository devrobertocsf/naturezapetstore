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
// ESTILOS
// ======================
const uiTextStyle = {
    fontFamily: 'Arial Black',
    fontSize: '22px',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 4
};

const gameOverTitleStyle = {
    fontFamily: 'Arial Black',
    fontSize: '64px',
    color: '#ef4444',
    stroke: '#000000',
    strokeThickness: 6
};

const buttonStyle = {
    fontFamily: 'Arial Black',
    fontSize: '22px',
    color: '#22c55e',
    backgroundColor: '#ffffff',
    padding: { x: 22, y: 12 },
    stroke: '#000000',
    strokeThickness: 3
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
// GAME OVER
// ======================
function endGame(scene) {
    if (gameOver) return;
    gameOver = true;

    if (bgm) bgm.stop();
    if (loseSound) loseSound.play();

    enemies.forEach(e => e.destroy());
    enemies = [];

    scene.add.text(centerX, centerY + 170, 'PERDEU', gameOverTitleStyle)
        .setOrigin(0.5);

    scene.add.text(
        centerX,
        centerY + 255,
        'JOGAR NOVAMENTE',
        buttonStyle
    )
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => {
        scene.scene.restart();
    });
}

// ======================
// MENU (TELA INICIAL)
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

        // BOTÃO PLAY (invisível)
        const playX = width / 2;
        const playY = height * 0.9;

        this.add.zone(playX, playY, 125, 78)
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
        this.load.image('selectBG', 'escolhaseupet.png');
    }

    create() {
        const { width, height } = this.scale;

        const bg = this.add.image(0, 0, 'selectBG').setOrigin(0);
        bg.setScale(Math.max(width / bg.width, height / bg.height));

        // CACHORRO
        this.add.zone(width * 0.25, height * 0.5, 150, 195)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                selectedPet = 'dog';
                this.scene.start('GameScene');
            });

        // GATO
        this.add.zone(width * 0.75, height * 0.5, 150, 195)
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
// CONFIGURAÇÃO DO JOGO
// ======================
new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 360,
    height: 640,
    backgroundColor: '#020617',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        MenuScene,
        SelectPetScene,
        GameScene
    ]
});
