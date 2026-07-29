// Internationalization module
const i18n = (() => {
    const translations = {
        'pt-BR': {
            'difficulty': 'Dificuldade',
            'difficulty-easy': 'Fácil (4x4)',
            'difficulty-medium': 'Médio (4x6)',
            'difficulty-hard': 'Difícil (6x6)',
            'difficulty-desc': 'Selecione a dificuldade para começar um novo jogo',
            'moves': 'Movimentos',
            'pairs-found': 'Pares Encontrados',
            'time': 'Tempo',
            'game-board': 'Tabuleiro do Jogo',
            'board-instructions': 'Use as setas para navegar, Enter ou Espaço para revelar cartas',
            'footer-text': 'Desenvolvido com ♥ para inclusão e acessibilidade',
            'game-start': 'Jogo iniciado! Use as setas para navegar entre as cartas.',
            'card-revealed': 'Carta revelada',
            'pair-found': '🎉 Par encontrado!',
            'pair-not-match': '❌ As cartas não combinam. Tente novamente!',
            'game-won': '🏆 Parabéns! Você ganhou em {moves} movimentos e {time}!',
            'game-reset': 'Jogo reiniciado.',
            'card-state': 'Linha {row}, Coluna {col}. Carta oculta. Pressione Enter para revelar.',
            'card-state-revealed': 'Linha {row}, Coluna {col}. Carta revelada: {value}. Já foi revelada.',
            'wait': 'Aguarde...',
            'accessibility-info': 'Para melhor acessibilidade, recomendamos usar um leitor de tela como NVDA ou JAWS com este jogo.'
        },
        'en-US': {
            'difficulty': 'Difficulty',
            'difficulty-easy': 'Easy (4x4)',
            'difficulty-medium': 'Medium (4x6)',
            'difficulty-hard': 'Hard (6x6)',
            'difficulty-desc': 'Select difficulty level to start a new game',
            'moves': 'Moves',
            'pairs-found': 'Pairs Found',
            'time': 'Time',
            'game-board': 'Game Board',
            'board-instructions': 'Use arrow keys to navigate, Enter or Space to reveal cards',
            'footer-text': 'Developed with ♥ for inclusion and accessibility',
            'game-start': 'Game started! Use arrow keys to navigate between cards.',
            'card-revealed': 'Card revealed',
            'pair-found': '🎉 Pair found!',
            'pair-not-match': '❌ Cards do not match. Try again!',
            'game-won': '🏆 Congratulations! You won in {moves} moves and {time}!',
            'game-reset': 'Game reset.',
            'card-state': 'Row {row}, Column {col}. Hidden card. Press Enter to reveal.',
            'card-state-revealed': 'Row {row}, Column {col}. Revealed card: {value}. Already matched.',
            'wait': 'Please wait...',
            'accessibility-info': 'For better accessibility, we recommend using a screen reader like NVDA or JAWS with this game.'
        }
    };

    let currentLanguage = localStorage.getItem('game-language') || 'pt-BR';

    return {
        setLanguage(lang) {
            if (translations[lang]) {
                currentLanguage = lang;
                localStorage.setItem('game-language', lang);
                document.documentElement.lang = lang === 'pt-BR' ? 'pt-BR' : 'en-US';
                this.updatePageLanguage();
                return true;
            }
            return false;
        },

        getCurrentLanguage() {
            return currentLanguage;
        },

        translate(key, variables = {}) {
            let text = translations[currentLanguage][key] || translations['pt-BR'][key] || key;
            
            Object.keys(variables).forEach(varKey => {
                text = text.replace(`{${varKey}}`, variables[varKey]);
            });
            
            return text;
        },

        updatePageLanguage() {
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                element.textContent = this.translate(key);
            });
        },

        init() {
            // Set initial language
            document.documentElement.lang = currentLanguage === 'pt-BR' ? 'pt-BR' : 'en-US';
            
            // Setup language buttons
            const ptBtn = document.getElementById('lang-pt');
            const enBtn = document.getElementById('lang-en');

            if (ptBtn && enBtn) {
                ptBtn.addEventListener('click', () => {
                    this.setLanguage('pt-BR');
                    ptBtn.classList.add('active');
                    ptBtn.setAttribute('aria-pressed', 'true');
                    enBtn.classList.remove('active');
                    enBtn.setAttribute('aria-pressed', 'false');
                });

                enBtn.addEventListener('click', () => {
                    this.setLanguage('en-US');
                    enBtn.classList.add('active');
                    enBtn.setAttribute('aria-pressed', 'true');
                    ptBtn.classList.remove('active');
                    ptBtn.setAttribute('aria-pressed', 'false');
                });

                // Set initial button state
                if (currentLanguage === 'pt-BR') {
                    ptBtn.classList.add('active');
                    ptBtn.setAttribute('aria-pressed', 'true');
                    enBtn.setAttribute('aria-pressed', 'false');
                } else {
                    enBtn.classList.add('active');
                    enBtn.setAttribute('aria-pressed', 'true');
                    ptBtn.setAttribute('aria-pressed', 'false');
                }
            }

            this.updatePageLanguage();
        }
    };
})();

// Initialize i18n when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        i18n.init();
    });
} else {
    i18n.init();
}