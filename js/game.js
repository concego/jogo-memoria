// Memory Game Logic
const game = (() => {
    const emojis = ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆'];
    
    let gameState = {
        difficulty: 'medium',
        grid: { rows: 4, cols: 6 },
        cards: [],
        flipped: [],
        matched: [],
        moves: 0,
        startTime: null,
        isLocked: false,
        firstCard: null,
        secondCard: null,
        currentFocusRow: 0,
        currentFocusCol: 0
    };

    const difficultySettings = {
        easy: { rows: 4, cols: 4, pairs: 8 },
        medium: { rows: 4, cols: 6, pairs: 12 },
        hard: { rows: 6, cols: 6, pairs: 18 }
    };

    // Initialize game
    function init() {
        const difficulty = document.getElementById('difficulty-select').value || 'medium';
        gameState.difficulty = difficulty;
        gameState.grid = difficultySettings[difficulty];
        gameState.cards = [];
        gameState.flipped = [];
        gameState.matched = [];
        gameState.moves = 0;
        gameState.isLocked = false;
        gameState.firstCard = null;
        gameState.secondCard = null;
        gameState.currentFocusRow = 0;
        gameState.currentFocusCol = 0;
        gameState.startTime = Date.now();

        createBoard();
        announceGameStart();
    }

    // Create game board
    function createBoard() {
        const { rows, cols, pairs } = gameState.grid;
        const boardBody = document.getElementById('board-body');
        boardBody.innerHTML = '';

        // Shuffle emojis and create pairs
        const selectedEmojis = emojis.slice(0, pairs).concat(emojis.slice(0, pairs));
        shuffleArray(selectedEmojis);

        gameState.cards = selectedEmojis;

        // Create table rows and cells
        let cardIndex = 0;
        for (let row = 0; row < rows; row++) {
            const tr = document.createElement('tr');
            tr.setAttribute('role', 'row');
            
            for (let col = 0; col < cols; col++) {
                const td = document.createElement('td');
                td.setAttribute('role', 'gridcell');
                
                const card = document.createElement('button');
                card.className = 'card hidden';
                card.setAttribute('data-index', cardIndex);
                card.setAttribute('data-row', row);
                card.setAttribute('data-col', col);
                card.setAttribute('aria-label', `Card ${cardIndex + 1}`);
                card.setAttribute('aria-pressed', 'false');
                card.textContent = '🔒';
                
                card.addEventListener('click', () => handleCardClick(cardIndex));
                card.addEventListener('keydown', (e) => handleCardKeydown(e, row, col));
                
                td.appendChild(card);
                tr.appendChild(td);
                cardIndex++;
            }
            boardBody.appendChild(tr);
        }

        // Set initial focus
        setCardFocus(0, 0);
    }

    // Shuffle array (Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Handle card click
    function handleCardClick(index) {
        if (gameState.isLocked || gameState.matched.includes(index) || gameState.flipped.includes(index)) {
            return;
        }

        revealCard(index);
    }

    // Handle card keyboard navigation
    function handleCardKeydown(e, row, col) {
        const { rows, cols } = gameState.grid;
        let newRow = row;
        let newCol = col;

        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                newRow = (row - 1 + rows) % rows;
                break;
            case 'ArrowDown':
                e.preventDefault();
                newRow = (row + 1) % rows;
                break;
            case 'ArrowLeft':
                e.preventDefault();
                newCol = (col - 1 + cols) % cols;
                break;
            case 'ArrowRight':
                e.preventDefault();
                newCol = (col + 1) % cols;
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                handleCardClick(parseInt(e.target.getAttribute('data-index')));
                return;
            default:
                return;
        }

        setCardFocus(newRow, newCol);
    }

    // Set focus to a specific card
    function setCardFocus(row, col) {
        gameState.currentFocusRow = row;
        gameState.currentFocusCol = col;
        
        const cardIndex = row * gameState.grid.cols + col;
        const card = document.querySelector(`[data-index="${cardIndex}"]`);
        
        if (card) {
            card.focus();
            announceFocusedCard(row, col, cardIndex);
        }
    }

    // Reveal card
    function revealCard(index) {
        if (gameState.flipped.length >= 2 || gameState.matched.includes(index) || gameState.flipped.includes(index)) {
            return;
        }

        gameState.flipped.push(index);
        const card = document.querySelector(`[data-index="${index}"]`);
        const emoji = gameState.cards[index];

        card.classList.add('revealed');
        card.textContent = emoji;
        card.setAttribute('aria-pressed', 'true');
        
        announceCardRevealed(emoji);

        if (gameState.flipped.length === 1) {
            gameState.firstCard = index;
        } else if (gameState.flipped.length === 2) {
            gameState.secondCard = index;
            gameState.moves++;
            updateMoveCount();
            checkMatch();
        }
    }

    // Check if cards match
    function checkMatch() {
        gameState.isLocked = true;
        const firstEmoji = gameState.cards[gameState.firstCard];
        const secondEmoji = gameState.cards[gameState.secondCard];
        const isMatch = firstEmoji === secondEmoji;

        setTimeout(() => {
            if (isMatch) {
                gameState.matched.push(gameState.firstCard, gameState.secondCard);
                announceMatch();
                updatePairCount();

                if (gameState.matched.length === gameState.cards.length) {
                    endGame();
                }
            } else {
                announceNoMatch();
                // Flip cards back
                const firstCard = document.querySelector(`[data-index="${gameState.firstCard}"]`);
                const secondCard = document.querySelector(`[data-index="${gameState.secondCard}"]`);
                
                firstCard.classList.remove('revealed');
                firstCard.textContent = '🔒';
                firstCard.setAttribute('aria-pressed', 'false');
                
                secondCard.classList.remove('revealed');
                secondCard.textContent = '🔒';
                secondCard.setAttribute('aria-pressed', 'false');
            }

            gameState.flipped = [];
            gameState.firstCard = null;
            gameState.secondCard = null;
            gameState.isLocked = false;
        }, 1000);
    }

    // Update move counter
    function updateMoveCount() {
        document.getElementById('moves-count').textContent = gameState.moves;
    }

    // Update pair counter
    function updatePairCount() {
        const pairsFound = gameState.matched.length / 2;
        document.getElementById('pairs-count').textContent = pairsFound;
    }

    // End game
    function endGame() {
        const endTime = Date.now();
        const duration = formatTime(Math.floor((endTime - gameState.startTime) / 1000));
        
        const message = i18n.translate('game-won', {
            moves: gameState.moves,
            time: duration
        });
        
        showMessage(message, 'success');
        announceGameWon(gameState.moves, duration);
    }

    // Format time
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }

    // Update timer display
    function updateTimer() {
        if (gameState.startTime) {
            const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
            document.getElementById('timer').textContent = formatTime(elapsed);
        }
    }

    // Show message
    function showMessage(message, type = '') {
        const messageEl = document.getElementById('game-message');
        messageEl.textContent = message;
        messageEl.className = 'game-message';
        if (type) messageEl.classList.add(type);
    }

    // Accessibility announcements
    function announceGameStart() {
        const message = i18n.translate('game-start');
        showMessage(message);
        console.log('Game started');
    }

    function announceCardRevealed(emoji) {
        const message = `${i18n.translate('card-revealed')}: ${emoji}`;
        console.log(message);
    }

    function announceFocusedCard(row, col, index) {
        const card = document.querySelector(`[data-index="${index}"]`);
        if (gameState.matched.includes(index)) {
            const message = i18n.translate('card-state-revealed', {
                row: row + 1,
                col: col + 1,
                value: gameState.cards[index]
            });
            card.setAttribute('aria-label', message);
        } else {
            const message = i18n.translate('card-state', {
                row: row + 1,
                col: col + 1
            });
            card.setAttribute('aria-label', message);
        }
    }

    function announceMatch() {
        const message = i18n.translate('pair-found');
        showMessage(message, 'success');
        console.log('Pair matched!');
    }

    function announceNoMatch() {
        const message = i18n.translate('pair-not-match');
        showMessage(message, 'warning');
        console.log('No match');
    }

    function announceGameWon(moves, time) {
        console.log(`Game won! Moves: ${moves}, Time: ${time}`);
    }

    // Reset game
    function reset() {
        const message = i18n.translate('game-reset');
        showMessage(message);
        init();
    }

    return {
        init,
        reset,
        updateTimer,
        getState: () => ({ ...gameState })
    };
})();

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        game.init();
        setInterval(() => game.updateTimer(), 1000);
    });
} else {
    game.init();
    setInterval(() => game.updateTimer(), 1000);
}

// Handle difficulty change
if (document.getElementById('difficulty-select')) {
    document.getElementById('difficulty-select').addEventListener('change', () => {
        game.reset();
    });
}