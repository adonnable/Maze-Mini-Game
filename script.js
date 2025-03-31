document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const timeDisplay = document.getElementById("time");
  const coinCounter = document.getElementById("coin-counter");
  const coinTotal = document.getElementById("coin-total");
  const playButton = document.getElementById("play-btn");
  const overlay = document.getElementById("overlay");

  const modal = document.getElementById("game-over-modal");
  const exitBtn = document.getElementById("exit-btn");
  const modalMessage = document.getElementById("modal-message");
  const modalCoins = document.getElementById("modal-coins");

  //Show the overlay initially
  overlay.style.display = "flex";

  // Game parameters
  const numRows = 13;
  const numCols = 25;
  const blockSize = 60;
  const containerWidth = numCols * blockSize;
  const containerHeight = numRows * blockSize;
  const canvasWidth = containerWidth;
  const canvasHeight = containerHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  let gameActive = true;
  let collisionOccurred = false;
  let animationFrameId;

  let lives = 3;
  let coinsCollected = 0;
  let gameTimerInterval;
  let gameStarted = false;
  const gameDurationSeconds = 180;
  let timeLeftSeconds = gameDurationSeconds;
  let isWalking = false;

  // --- Sound Effects ---
  const backgroundMusic = new Audio("assets/audios/background.wav");
  const clickSound = new Audio("assets/audios/click.mp3");
  const coinCollectSound = new Audio("assets/audios/coin.wav");
  const helpSound = new Audio("assets/audios/help.ogg");
  const gameOverSound = new Audio("assets/audios/gameover.wav");
  const winSound = new Audio("assets/audios/win.wav");
  const footstepSound = new Audio("assets/audios/step.mp3");
  const growlSound = new Audio("assets/audios/growl.mp3");
  const reviveSound = new Audio("assets/audios/revive.mp3");

  // --- Volume Control (Optional) ---
  backgroundMusic.volume = 0.4; // Adjust volume (0.0 to 1.0)
  clickSound.volume = 0.8;
  coinCollectSound.volume = 0.6;
  helpSound.volume = 0.8;
  gameOverSound.volume = 0.9;
  winSound.volume = 1.0;
  footstepSound.volume = 0.2;
  growlSound.volume = 1.0;
  reviveSound.volume = 1.0;

  // --- Background Music ---
  function playBackgroundMusic() {
    backgroundMusic.loop = true;
    backgroundMusic.play();
  }

  function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }

  // Load Images
  const heartImg = new Image();
  heartImg.src = "assets/heart.png";
  const woodBlockImg = new Image();
  woodBlockImg.src = "assets/brick_wall.jpg";
  const slimeImg = new Image();
  slimeImg.src = "assets/slime.png";
  const playerImg = new Image();
  playerImg.src = "assets/girl.png";

  let imagesLoaded = 0;
  const totalImages = 4;

  function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
      init();
    }
  }

  heartImg.onload = imageLoaded;
  woodBlockImg.onload = imageLoaded;
  slimeImg.onload = imageLoaded;
  playerImg.onload = imageLoaded;

  heartImg.onerror = function () {
    console.error("Error loading heart.png");
  };
  woodBlockImg.onerror = function () {
    console.error("Error loading wood_block.png");
  };
  slimeImg.onerror = function () {
    console.error("Error loading slime.png");
  };
  playerImg.onerror = function () {
    console.error("Error loading girl.png");
  };

  // Player
  const initialPlayerCol = 12;
  const initialPlayerRow = 0;

  const player = {
    x: initialPlayerCol * blockSize,
    y: initialPlayerRow * blockSize,
    width: blockSize * 0.65,
    height: blockSize * 0.65,
    speed: 3,
    direction: "down",
    spriteCol: 2,
    spriteRow: 0,
    animationFrame: 0,
    animationSpeed: 10,
    animationCounter: 0,
    isCaught: false,
    isRespawning: false,
    chatBubbleDuration: 2000,
    previousDirection: null,
    color: "pink",
    name: "Donna",
  };

  // Slime Monsters
  const slimes = [
    {
      x: blockSize * 3,
      y: blockSize * 3,
      color: "red",
      width: blockSize * 0.78,
      height: blockSize * 0.78,
      speed: 1.7,
      direction: "right",
      spriteCol: 1,
      spriteRow: 0,
      animationFrame: 0,
      animationSpeed: 15,
      animationCounter: 0,
      name: "Nel",
    },
    {
      x: canvasWidth - blockSize * 4,
      y: blockSize * 3,
      color: "yellow",
      width: blockSize * 0.78,
      height: blockSize * 0.78,
      speed: 1.7,
      direction: "left",
      spriteCol: 3,
      spriteRow: 0,
      animationFrame: 0,
      animationSpeed: 15,
      animationCounter: 0,
      name: "Kolat",
    },
    {
      x: blockSize * 5,
      y: canvasHeight - blockSize * 6,
      color: "blue",
      width: blockSize * 0.78,
      height: blockSize * 0.78,
      speed: 1.7,
      direction: "down",
      spriteCol: 0,
      spriteRow: 0,
      animationFrame: 0,
      animationSpeed: 15,
      animationCounter: 0,
      name: "Paul",
    },
    {
      x: blockSize * 13,
      y: canvasHeight - blockSize * 8,
      color: "blue",
      width: blockSize * 0.78,
      height: blockSize * 0.78,
      speed: 1.7,
      direction: "left",
      spriteCol: 0,
      spriteRow: 0,
      animationFrame: 0,
      animationSpeed: 15,
      animationCounter: 0,
      name: "Kel",
    },
    {
      x: canvasWidth - blockSize * 4,
      y: canvasHeight - blockSize * 4,
      color: "green",
      width: blockSize * 0.78,
      height: blockSize * 0.78,
      speed: 1.7,
      direction: "right",
      spriteCol: 2,
      spriteRow: 0,
      animationFrame: 0,
      animationSpeed: 15,
      animationCounter: 0,
      name: "Adwen",
    },
    {
      x: canvasWidth - blockSize * 13,
      y: canvasHeight - blockSize * 2,
      color: "none",
      width: blockSize * 0.78,
      height: blockSize * 0.78,
      speed: 1.7,
      direction: "up",
      spriteCol: 2,
      spriteRow: 0,
      animationFrame: 0,
      animationSpeed: 15,
      animationCounter: 0,
      name: "Pril",
    },
  ];

  // Maze Generation (Fixed Maze based on image - Adjusted dimensions)
  const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  function createHeartElement() {
    const heartElement = document.createElement("div");
    heartElement.classList.add("heart");
    return heartElement;
  }

  // Function to create a coin element
  function createCoinElement(x, y) {
    const coinElement = document.createElement("div");
    coinElement.classList.add("coin");

    // Set coin size
    const coinSize = blockSize * 0.5;
    coinElement.style.width = coinSize + "px";
    coinElement.style.height = coinSize + "px";

    coinElement.style.setProperty("--delay", Math.random() * 5);

    // Center the coin by offsetting half of its size
    coinElement.style.left = x - coinSize / 2 + "px";
    coinElement.style.top = y - coinSize / 2 + "px";

    coinElement.textContent = "₱";
    document.getElementById("game-container").appendChild(coinElement);

    return coinElement;
  }

  const coins = [];

  function generateCoins() {
    coins.length = 0; // Clear coins array in case of regeneration

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        // Skip the player's starting position
        if (maze[row][col] === 0) {
          const x = col * blockSize + blockSize / 2;
          const y = row * blockSize + blockSize / 2;

          // Check if the coin overlaps the player's initial position
          if (
            x === player.x + blockSize / 2 &&
            y === player.y + blockSize / 2
          ) {
            continue; // Skip this coin position
          }

          const coinElement = createCoinElement(x, y);
          coins.push({
            x: x,
            y: y,
            collected: false,
            element: coinElement,
          });
        }
      }
    }

    // Display total number of coins
    coinTotal.textContent = coins.length;
    coinCounter.textContent = coinsCollected;
  }

  // Coin collection
  function collectCoins() {
    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];
      if (
        !coin.collected &&
        checkCollision(player, {
          x: coin.x - blockSize * 0.3125,
          y: coin.y - blockSize * 0.3125,
          width: blockSize * 0.625,
          height: blockSize * 0.625,
        })
      ) {
        // Adjust coin collision box
        coin.collected = true;
        coinsCollected++;
        coinCounter.textContent = coinsCollected;
        coin.element.style.display = "none";
        playSound(coinCollectSound);
        break;
      }
    }

    if (coinsCollected === coins.length) {
      clearInterval(gameTimerInterval);
      stopBackgroundMusic();

      showModal("win", coinsCollected);
    }
  }
  // Helper function to check for collision
  function checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect2.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect2.height > rect2.y
    );
  }

  // Helper function to check for wall collision
  function checkWallCollision(x, y, width, height) {
    const gridXStart = Math.floor(x / blockSize);
    const gridYStart = Math.floor(y / blockSize);
    const gridXEnd = Math.ceil((x + width) / blockSize);
    const gridYEnd = Math.ceil((y + height) / blockSize);

    for (let row = gridYStart; row < gridYEnd; row++) {
      for (let col = gridXStart; col < gridXEnd; col++) {
        if (
          row < 0 ||
          row >= numRows ||
          col < 0 ||
          col >= numCols ||
          maze[row][col] === 1
        ) {
          return true;
        }
      }
    }
    return false;
  }

  let keys = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  // Keydown event listener for player movement
  document.addEventListener("keydown", function (event) {
    switch (event.key) {
      case "ArrowUp":
        if (!player.isCaught) {
          player.direction = "up";
          keys.up = true;
        }
        break;
      case "ArrowDown":
        if (!player.isCaught) {
          player.direction = "down";
          keys.down = true;
        }
        break;
      case "ArrowLeft":
        if (!player.isCaught) {
          player.direction = "left";
          keys.left = true;
        }
        break;
      case "ArrowRight":
        if (!player.isCaught) {
          player.direction = "right";
          keys.right = true;
        }
        break;
    }
  });

  document.addEventListener("keyup", function (event) {
    switch (event.key) {
      case "ArrowUp":
        keys.up = false;
        break;
      case "ArrowDown":
        keys.down = false;
        break;
      case "ArrowLeft":
        keys.left = false;
        break;
      case "ArrowRight":
        keys.right = false;
        break;
    }
  });

  function playFootstepSound() {
    if (!isWalking) {
      footstepSound.playbackRate = 2.3;
      footstepSound.loop = true;
      footstepSound.play().catch((error) => {
        console.error("Error playing footstep sound:", error);
      });
      isWalking = true;
    }
  }

  //Stop the footsteps
  function stopFootstepSound() {
    if (isWalking) {
      footstepSound.pause();
      footstepSound.currentTime = 0; // Reset to the beginning
      footstepSound.loop = false;
      isWalking = false;
      console.log("Footstep sound stopped");
    }
  }

  //Player Movement
  function movePlayer() {
    if (!gameActive) return;

    if (keys.up || keys.down || keys.left || keys.right) {
      let newX = player.x;
      let newY = player.y;

      switch (player.direction) {
        case "up":
          newY -= player.speed;
          player.spriteCol = 0;
          break;
        case "down":
          newY += player.speed;
          player.spriteCol = 2;
          break;
        case "left":
          newX -= player.speed;
          player.spriteCol = 3;
          break;
        case "right":
          newX += player.speed;
          player.spriteCol = 1;
          break;
      }

      if (!checkWallCollision(newX, newY, player.width, player.height)) {
        if (!player.isRespawning) {
          playFootstepSound();
          player.x = newX;
          player.y = newY;
          player.animationCounter++;

          // Update animation frame only when animationCounter reaches animationSpeed
          if (player.animationCounter >= player.animationSpeed) {
            player.animationFrame = (player.animationFrame + 1) % 3;
            player.animationCounter = 0;
          }
        }
      } else {
        stopFootstepSound(); // Stop if there's a wall collision
        player.animationFrame = 0;
      }
    } else {
      stopFootstepSound(); // Stop footstep if no key is pressed
    }
  }

  //Slime Movement
  function moveSlime(slime) {
    if (!gameActive) return;

    // Basic AI:  Move in the current direction until a wall is hit, then change direction
    let newX = slime.x;
    let newY = slime.y;

    if (!slime.isCaught) {
      // Stop Slime if the isCaught Flag is working
      switch (slime.direction) {
        case "up":
          newY -= slime.speed;
          slime.spriteCol = 0;
          break;
        case "down":
          newY += slime.speed;
          slime.spriteCol = 2;
          break;
        case "left":
          newX -= slime.speed;
          slime.spriteCol = 3;
          break;
        case "right":
          newX += slime.speed;
          slime.spriteCol = 1;
          break;
      }

      if (!checkWallCollision(newX, newY, slime.width, slime.height)) {
        slime.x = newX;
        slime.y = newY;

        //Increment the animation counter
        slime.animationCounter++;
        if (slime.animationCounter >= slime.animationSpeed) {
          slime.animationFrame = (slime.animationFrame + 1) % 3;
          slime.animationCounter = 0;
        }
      } else {
        // Change Direction
        const directions = ["up", "down", "left", "right"];
        slime.direction = directions[Math.floor(Math.random() * 4)];
        slime.spriteCol =
          slime.direction === "up"
            ? 0
            : slime.direction === "right"
            ? 1
            : slime.direction === "down"
            ? 2
            : 3;
        slime.animationFrame = 0;
      }
    }
  }

  function startRespawnBlink() {
    resetPlayerPosition();
    playSound(reviveSound);
    player.isRespawning = true;
    player.blinkCount = 0;
    let blinkInterval = setInterval(() => {
      player.blinkCount++;
      if (player.blinkCount >= 6) {
        player.isRespawning = false;
        player.direction = player.previousDirection; //Go back to original place on timeline.
        clearInterval(blinkInterval); //stop blink
      }
    }, 200); //This should follow 200 to follow its place.
  }

  function checkSlimeCollision() {
    if (!gameActive) return;
    if (collisionOccurred) return;

    for (const slime of slimes) {
      if (
        checkCollision(player, slime) &&
        !player.isRespawning &&
        !player.isCaught
      ) {
        player.isCaught = true;
        player.caughtSlime = slime;
        slime.isCaught = true;
        player.previousDirection = player.direction;
        player.direction = null;
        keys.up = keys.down = keys.left = keys.right = false;

        playSound(helpSound);
        playSound(growlSound);

        const fadeOutDuration = 1200;
        const fadeInterval = 50;
        const steps = fadeOutDuration / fadeInterval;
        let volumeStep = growlSound.volume / steps;

        let fadeOut = setInterval(() => {
          if (growlSound.volume > volumeStep) {
            growlSound.volume -= volumeStep;
          } else {
            growlSound.pause();
            growlSound.currentTime = 0;
            growlSound.volume = 1;
            clearInterval(fadeOut);
          }
        }, fadeInterval);

        setTimeout(() => {
          if (lives > 0) {
            if (lives === 1) {
              removeHeartDisplay();

              setTimeout(() => {
                lives--;

                clearInterval(gameTimerInterval);
                playSound(gameOverSound);
                showModal("gameOver", coinsCollected);
              }, 800);
            } else {
              removeHeartDisplay();
              lives--;
              startRespawnBlink();
            }
            player.isCaught = false;
            slime.isCaught = false;
          }
        }, 1500);

        break;
      }
    }
  }

  function resetPlayerPosition() {
    player.x = initialPlayerCol * blockSize;
    player.y = initialPlayerRow * blockSize;
  }

  function removeHeartDisplay() {
    const heartContainer = document.getElementById("heart-container");
    const hearts = heartContainer.getElementsByClassName("heart");

    if (hearts.length > 0) {
      // Add the 'pop' class to the last heart

      hearts[hearts.length - 1].classList.add("pop");
      // Remove the pop class and heart after a delay
      setTimeout(() => {
        if (hearts.length > 0) {
          heartContainer.removeChild(hearts[hearts.length - 1]);
        }
      }, 200); // Wait for 200ms to make the animation visible
    }
  }

  // Timer Function
  function updateTimer() {
    if (!gameStarted) return;

    // ✅ First, check if the timer has reached 0 BEFORE decrementing
    if (timeLeftSeconds === 0) {
      clearInterval(gameTimerInterval);
      playSound(gameOverSound);
      showModal("gameOver", coinsCollected);
      return;
    }

    timeLeftSeconds--;

    const minutes = Math.floor(timeLeftSeconds / 60);
    const seconds = timeLeftSeconds % 60;

    timeDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }

  function drawMaze() {
    for (let row = 0; row < numRows; row++) {
      // Use numRows
      for (let col = 0; col < numCols; col++) {
        // Use numCols
        if (maze[row][col] === 1) {
          // Draw a block
          const blockImg = woodBlockImg;
          ctx.drawImage(
            blockImg,
            col * blockSize,
            row * blockSize,
            blockSize,
            blockSize
          );
        }
      }
    }
  }

  function drawPlayer() {
    if (player.isRespawning && player.blinkCount % 2 === 0) {
      // Blink effect
      return; // Skip drawing the player during even blinks (odd is the opposite)
    }

    // ctx.fillStyle = player.color;
    // ctx.fillRect(player.x, player.y, player.width, player.height);
    const spriteWidth = 120 / 5;
    const spriteHeight = 72 / 3;
    ctx.drawImage(
      playerImg,
      player.spriteCol * spriteWidth,
      player.animationFrame * spriteHeight,
      spriteWidth,
      spriteHeight,
      player.x,
      player.y,
      player.width,
      player.height
    );

    ctx.fillStyle = "white";
    ctx.font = `${blockSize * 0.3}px Arial`;
    ctx.textAlign = "center";

    const nameX = player.x + player.width / 2;
    const nameY = player.y - 5;
    ctx.fillText(player.name, nameX, nameY);
  }

  function drawSlimes() {
    for (const slime of slimes) {
      //Draws a colored rectangle for every slime
      // ctx.fillStyle = slime.color;
      // ctx.fillRect(slime.x, slime.y, slime.width, slime.height);
      const spriteWidth = 120 / 5;
      const spriteHeight = 72 / 3;

      ctx.drawImage(
        slimeImg,
        slime.spriteCol * spriteWidth,
        slime.animationFrame * spriteHeight,
        spriteWidth,
        spriteHeight,
        slime.x,
        slime.y,
        slime.width,
        slime.height
      );

      // Draw name above the slime
      ctx.fillStyle = "white";
      ctx.font = `${blockSize * 0.3}px Arial`;
      ctx.textAlign = "center";

      const nameX = slime.x + slime.width / 2;
      const nameY = slime.y - 5;
      ctx.fillText(slime.name, nameX, nameY);
    }
  }

  function drawHelpText() {
    if (player.isCaught) {
      drawChatBubble("Help Me!", player.x + player.width / 2, player.y - 10);
    }
  }

  function drawChatBubble(text, x, y) {
    ctx.font = "20px Comic Sans MS";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";

    // Measure the text width
    const textWidth = ctx.measureText(text).width;
    const padding = 10;
    const bubbleWidth = textWidth + 2 * padding;
    const bubbleHeight = 30;

    // Draw the bubble
    ctx.beginPath();
    ctx.ellipse(
      x,
      y - 25,
      bubbleWidth / 2 + 5,
      bubbleHeight / 2 + 5,
      0,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.stroke();

    // Draw the text
    ctx.fillStyle = "black";
    ctx.fillText(text, x, y - 17);
  }

  function showModal(messageType, coinsCollected) {
    let imageSrc;
    if (messageType === "win") {
      imageSrc = "assets/you_win_text.png";
    } else if (messageType === "gameOver") {
      imageSrc = "assets/game_over_text.png";
    } else {
      console.error("Invalid message type:", messageType);
      return;
    }

    modalMessage.src = imageSrc;
    modalMessage.alt = messageType === "win" ? "You Win!" : "Game Over";

    modalCoins.textContent = coinsCollected.toString();
    modal.style.display = "flex";
    stopBackgroundMusic();
    gameActive = false;
    cancelAnimationFrame(animationFrameId);
  }

  function exitGame() {
    clearInterval(gameTimerInterval);
    clearInterval(gameTimerInterval);
    window.location.href = "index.html";
  }

  exitBtn.addEventListener("click", () => {
    stopBackgroundMusic();
    playSound(clickSound);

    // Delay the navigation to allow the sound to play
    setTimeout(() => {
      exitGame();
    }, clickSound.duration * 1000);
  });

  function playSound(audio) {
    audio.currentTime = 0; // Reset to the beginning (allows quick replay)
    audio.play();
  }

  function gameLoop() {
    if (!gameStarted) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear the canvas
    drawMaze();
    drawHelpText();
    drawPlayer();
    drawSlimes();
    movePlayer();
    for (const slime of slimes) {
      moveSlime(slime);
    }
    collectCoins();
    checkSlimeCollision();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Initialize the game
  function init() {
    const heartContainer = document.getElementById("heart-container");
    heartContainer.innerHTML = "";

    for (let i = 0; i < lives; i++) {
      const heartElement = createHeartElement();
      heartContainer.appendChild(heartElement);
    }
    gameLoop();
  }

  playButton.addEventListener("click", () => {
    playBackgroundMusic();
    playSound(clickSound);
    if (!gameStarted && imagesLoaded === totalImages) {
      gameStarted = true;
      overlay.style.display = "none";

      clearInterval(gameTimerInterval);
      timeLeftSeconds = gameDurationSeconds;

      updateTimer();
      gameTimerInterval = setInterval(updateTimer, 1000);
      generateCoins();
      init();
    }
  });
});
