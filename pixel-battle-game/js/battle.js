// ===== СОСТОЯНИЕ БОЯ =====
const BattleState = {
    player: null,
    opponent: null,
    currentTurn: 'player', // 'player' или 'opponent'
    round: 1,
    maxRounds: 10,
    timer: 30,
    timerInterval: null,
    isPractice: false,
    isHost: false,
    battleCode: null,
    battleStarted: false,
    
    init() {
        this.player = getCurrentUser();
        
        // Определяем режим боя из URL
        const urlParams = new URLSearchParams(window.location.search);
        this.isPractice = urlParams.get('practice') === 'true';
        this.isHost = urlParams.get('host') === 'true';
        this.battleCode = urlParams.get('code');
        
        // Создаем противника
        this.createOpponent();
        
        // Если это не тренировка, проверяем код боя
        if (!this.isPractice) {
            if (this.isHost) {
                // Мы создали бой, ждем противника
                this.waitForOpponent();
            } else {
                // Мы присоединяемся к бою
                this.joinBattle();
            }
        }
        
        return this;
    },
    
    createOpponent() {
        if (this.isPractice) {
            // Для тренировки создаем бота
            this.opponent = {
                username: 'Тренировочный бот',
                firstName: 'Бот',
                lastName: 'Тренировочный',
                class: 'Воин',
                hp: 20,
                coins: 100,
                xp: 0,
                isBot: true
            };
        } else {
            // Для реального боя создаем фиктивного противника
            // В реальном приложении здесь был бы запрос к серверу
            this.opponent = {
                username: 'Соперник',
                firstName: 'Соперник',
                lastName: 'Неизвестный',
                class: 'Воин',
                hp: 20,
                coins: 100,
                xp: 0
            };
        }
    },
    
    waitForOpponent() {
        // В реальном приложении здесь была бы проверка подключения противника
        // Для демо просто начинаем бой через 2 секунды
        setTimeout(() => {
            this.battleStarted = true;
            this.startBattle();
            
            // Добавляем запись в журнал
            this.addLogEntry('Противник присоединился к бою!');
        }, 2000);
    },
    
    joinBattle() {
        // В реальном приложении здесь было бы подключение к бою
        setTimeout(() => {
            this.battleStarted = true;
            this.startBattle();
            this.currentTurn = 'opponent'; // Первым ходит создатель боя
            
            // Добавляем запись в журнал
            this.addLogEntry('Вы присоединились к бою!');
        }, 1000);
    },
    
    startBattle() {
        this.updateUI();
        this.startTimer();
        
        // Добавляем начальную запись в журнал
        this.addLogEntry('Бой начался! Приготовьтесь!');
        
        // Если ход противника (в режиме присоединения), делаем его ход через 1.5 секунды
        if (this.currentTurn === 'opponent' && !this.opponent.isBot) {
            setTimeout(() => {
                this.opponentTurn();
            }, 1500);
        } else if (this.opponent.isBot && this.currentTurn === 'opponent') {
            // Если это бот и его ход
            setTimeout(() => {
                this.botTurn();
            }, 2000);
        }
    },
    
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            this.timer--;
            
            // Обновляем таймер на экране
            const timerElement = document.getElementById('battleTimer');
            if (timerElement) {
                timerElement.textContent = Utils.formatTime(this.timer);
                
                // Мигание при низком времени
                if (this.timer <= 10) {
                    timerElement.style.animation = 'pixel-glow 0.5s infinite';
                    timerElement.style.color = '#f8a8a8';
                }
            }
            
            // Если время вышло
            if (this.timer <= 0) {
                this.endTurn();
            }
        }, 1000);
    },
    
    playerTurn() {
        // Активируем кнопку броска кубиков
        const rollBtn = document.getElementById('rollDiceBtn');
        if (rollBtn) {
            rollBtn.disabled = false;
            rollBtn.classList.add('pixel-glow');
        }
        
        // Обновляем индикаторы хода
        this.updateTurnIndicators();
        
        // Добавляем запись в журнал
        this.addLogEntry('Ваш ход! Бросьте кубики.');
    },
    
    opponentTurn() {
        // Деактивируем кнопку броска кубиков
        const rollBtn = document.getElementById('rollDiceBtn');
        if (rollBtn) {
            rollBtn.disabled = true;
            rollBtn.classList.remove('pixel-glow');
        }
        
        // Обновляем индикаторы хода
        this.updateTurnIndicators();
        
        // Добавляем запись в журнал
        this.addLogEntry('Ход противника...');
        
        // Если это бот, делаем его ход
        if (this.opponent.isBot) {
            setTimeout(() => {
                this.botTurn();
            }, 1500);
        }
    },
    
    botTurn() {
        // Бот бросает кубики
        this.rollDice(true);
    },
    
    async rollDice(isBot = false) {
        if (!this.battleStarted) return;
        
        // Деактивируем кнопку
        const rollBtn = document.getElementById('rollDiceBtn');
        if (rollBtn && !isBot) {
            rollBtn.disabled = true;
        }
        
        // Анимация броска кубиков
        await this.animateDiceRoll();
        
        // Генерация результатов
        const attackRoll = Math.floor(Math.random() * 6) + 1;
        const defenseRoll = Math.floor(Math.random() * 3) + 1;
        
        // Показываем результаты
        this.showDiceResult(attackRoll, defenseRoll);
        
        // Обработка результатов
        if (this.currentTurn === 'player') {
            this.processPlayerTurn(attackRoll, defenseRoll);
        } else {
            this.processOpponentTurn(attackRoll, defenseRoll);
        }
        
        // Вибрация
        Utils.vibrate([100, 50, 100, 50, 100]);
    },
    
    async animateDiceRoll() {
        const attackDice = document.getElementById('attackDice');
        const defenseDice = document.getElementById('defenseDice');
        
        if (attackDice && defenseDice) {
            attackDice.classList.add('rolling');
            defenseDice.classList.add('rolling');
            
            // Меняем значения кубиков во время анимации
            const rollDuration = 500;
            const interval = 100;
            const rolls = Math.floor(rollDuration / interval);
            
            for (let i = 0; i < rolls; i++) {
                attackDice.querySelector('.dice-face').textContent = 
                    Math.floor(Math.random() * 6) + 1;
                defenseDice.querySelector('.dice-face').textContent = 
                    Math.floor(Math.random() * 3) + 1;
                
                await new Promise(resolve => setTimeout(resolve, interval));
            }
            
            attackDice.classList.remove('rolling');
            defenseDice.classList.remove('rolling');
        }
    },
    
    showDiceResult(attack, defense) {
        // Обновляем значения на кубиках
        const attackFace = document.querySelector('#attackDice .dice-face');
        const defenseFace = document.querySelector('#defenseDice .dice-face');
        
        if (attackFace) attackFace.textContent = attack;
        if (defenseFace) defenseFace.textContent = defense;
        
        // Показываем результаты
        const attackValue = document.getElementById('attackValue');
        const defenseValue = document.getElementById('defenseValue');
        
        if (attackValue) attackValue.textContent = attack;
        if (defenseValue) defenseValue.textContent = defense;
        
        // Показываем блок результатов
        const diceResult = document.getElementById('diceResult');
        if (diceResult) {
            diceResult.style.display = 'block';
        }
    },
    
    processPlayerTurn(attack, defense) {
        // Расчет урона
        const damage = Math.max(0, attack - defense);
        
        // Применение урона противнику
        this.opponent.hp = Math.max(0, this.opponent.hp - damage);
        
        // Добавление щита игроку
        const playerShield = parseInt(document.getElementById('playerShield').textContent) || 0;
        document.getElementById('playerShield').textContent = playerShield + defense;
        
        // Обновление HP противника
        this.updateHP('opponent');
        
        // Показываем нанесенный урон
        const damageDealt = document.getElementById('damageDealt');
        if (damageDealt) {
            damageDealt.querySelector('span').textContent = damage;
            damageDealt.style.display = 'block';
        }
        
        // Добавляем запись в журнал
        this.addLogEntry(`Вы нанесли ${damage} урона!`);
        
        // Проверка победы
        if (this.opponent.hp <= 0) {
            this.endBattle('win');
            return;
        }
        
        // Переход хода
        setTimeout(() => {
            this.endTurn();
        }, 1500);
    },
    
    processOpponentTurn(attack, defense) {
        // Расчет урона
        const damage = Math.max(0, attack - defense);
        
        // Применение урона игроку
        this.player.hp = Math.max(0, this.player.hp - damage);
        
        // Добавление щита противнику
        const opponentShield = parseInt(document.getElementById('opponentShield').textContent) || 0;
        document.getElementById('opponentShield').textContent = opponentShield + defense;
        
        // Обновление HP игрока
        this.updateHP('player');
        
        // Показываем полученный урон
        const damageDealt = document.getElementById('damageDealt');
        if (damageDealt) {
            damageDealt.querySelector('span').textContent = damage;
            damageDealt.textContent = `Получено урона: ${damage}`;
            damageDealt.style.display = 'block';
        }
        
        // Добавляем запись в журнал
        this.addLogEntry(`Противник нанес ${damage} урона!`);
        
        // Проверка поражения
        if (this.player.hp <= 0) {
            this.endBattle('lose');
            return;
        }
        
        // Переход хода
        setTimeout(() => {
            this.endTurn();
        }, 1500);
    },
    
    endTurn() {
        // Сбрасываем таймер
        this.timer = 30;
        
        // Меняем ход
        this.currentTurn = this.currentTurn === 'player' ? 'opponent' : 'player';
        this.round++;
        
        // Обновляем счетчик раундов
        const roundCounter = document.getElementById('currentRound');
        if (roundCounter) {
            roundCounter.textContent = this.round;
        }
        
        // Скрываем результаты броска
        const diceResult = document.getElementById('diceResult');
        if (diceResult) {
            diceResult.style.display = 'none';
        }
        
        // Проверка максимального количества раундов
        if (this.round > this.maxRounds) {
            // Ничья по истечении раундов
            this.endBattle('draw');
            return;
        }
        
        // Начинаем следующий ход
        if (this.currentTurn === 'player') {
            this.playerTurn();
        } else {
            this.opponentTurn();
        }
        
        // Обновляем таймер
        const timerElement = document.getElementById('battleTimer');
        if (timerElement) {
            timerElement.textContent = Utils.formatTime(this.timer);
            timerElement.style.animation = '';
            timerElement.style.color = '';
        }
    },
    
    endBattle(result) {
        // Останавливаем таймер
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Сохраняем результат
        if (!this.isPractice) {
            GameState.saveBattleResult(result);
        }
        
        // Показываем результаты
        this.showBattleResult(result);
        
        // Деактивируем кнопки
        const rollBtn = document.getElementById('rollDiceBtn');
        if (rollBtn) {
            rollBtn.disabled = true;
            rollBtn.classList.remove('pixel-glow');
        }
    },
    
    showBattleResult(result) {
        const resultOverlay = document.getElementById('resultOverlay');
        const resultIcon = document.getElementById('resultIcon');
        const resultTitle = document.getElementById('resultTitle');
        const resultMessage = document.getElementById('resultMessage');
        const rewardCoins = document.getElementById('rewardCoins');
        const rewardXP = document.getElementById('rewardXP');
        const totalRounds = document.getElementById('totalRounds');
        const totalDamage = document.getElementById('totalDamage');
        const battleTime = document.getElementById('battleTime');
        
        if (!resultOverlay) return;
        
        // Настройка в зависимости от результата
        switch(result) {
            case 'win':
                resultIcon.textContent = '🏆';
                resultTitle.textContent = 'С ПОБЕДОЙ!';
                resultMessage.textContent = 'Ты одержал победу в честном бою!';
                rewardCoins.textContent = this.isPractice ? '+0' : '+10';
                rewardXP.textContent = this.isPractice ? '+0' : '+10';
                break;
                
            case 'lose':
                resultIcon.textContent = '💀';
                resultTitle.textContent = 'ТЫ ПРОИГРАЛ';
                resultMessage.textContent = 'Ты побежден, но теряешь не все, а 10-ку';
                rewardCoins.textContent = this.isPractice ? '+0' : '-10';
                rewardXP.textContent = this.isPractice ? '+0' : '+3';
                break;
                
            case 'draw':
                resultIcon.textContent = '🤝';
                resultTitle.textContent = 'НИЧЬЯ!';
                resultMessage.textContent = 'Поединок окончен с равным счетом';
                rewardCoins.textContent = '+5';
                rewardXP.textContent = '+5';
                break;
        }
        
        // Заполняем статистику
        if (totalRounds) totalRounds.textContent = this.round;
        if (totalDamage) totalDamage.textContent = Math.abs(20 - this.player.hp);
        if (battleTime) battleTime.textContent = Utils.formatTime(this.maxRounds * 30 - this.timer);
        
        // Показываем оверлей
        resultOverlay.classList.add('active');
        
        // Вибрация
        if (result === 'win') {
            Utils.vibrate([100, 50, 100, 50, 200]);
        } else {
            Utils.vibrate([200, 100, 200]);
        }
    },
    
    updateUI() {
        // Обновляем данные игрока
        document.getElementById('playerNameBattle').textContent = this.player.username;
        document.getElementById('playerClassBattle').textContent = this.player.class;
        document.getElementById('playerHPBattle').textContent = this.player.hp;
        
        // Обновляем данные противника
        document.getElementById('opponentName').textContent = this.opponent.username;
        document.getElementById('opponentClass').textContent = this.opponent.class;
        document.getElementById('opponentHP').textContent = this.opponent.hp;
        
        // Обновляем ID боя
        const battleId = document.getElementById('battleId');
        if (battleId && this.battleCode) {
            battleId.textContent = this.battleCode;
        }
        
        // Обновляем индикаторы хода
        this.updateTurnIndicators();
        
        // Обновляем HP бары
        this.updateHP('player');
        this.updateHP('opponent');
    },
    
    updateHP(target) {
        const hp = target === 'player' ? this.player.hp : this.opponent.hp;
        const hpBar = target === 'player' ? 
            document.getElementById('playerHPBar') : 
            document.getElementById('opponentHPBar');
        
        if (hpBar) {
            const percent = (hp / 20) * 100;
            hpBar.style.width = `${percent}%`;
            
            // Изменение цвета при низком HP
            if (percent <= 25) {
                hpBar.style.background = '#f8a8a8';
            } else if (percent <= 50) {
                hpBar.style.background = '#f8d8a8';
            } else {
                hpBar.style.background = '#a8d8b8';
            }
        }
    },
    
    updateTurnIndicators() {
        const playerIndicator = document.getElementById('playerTurnIndicator');
        const opponentIndicator = document.getElementById('opponentTurnIndicator');
        
        if (playerIndicator) {
            if (this.currentTurn === 'player') {
                playerIndicator.classList.add('active');
            } else {
                playerIndicator.classList.remove('active');
            }
        }
        
        if (opponentIndicator) {
            if (this.currentTurn === 'opponent') {
                opponentIndicator.classList.add('active');
            } else {
                opponentIndicator.classList.remove('active');
            }
        }
    },
    
    addLogEntry(message) {
        const logContent = document.querySelector('.log-content');
        if (!logContent) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        const timestamp = new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;
    }
};

// ===== ИНИЦИАЛИЗАЦИЯ БОЯ =====
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем авторизацию
    if (!checkAuth()) return;
    
    // Инициализируем состояние боя
    const battle = BattleState.init();
    
    // Обработчики кнопок
    const rollDiceBtn = document.getElementById('rollDiceBtn');
    const useItemBtn = document.getElementById('useItemBtn');
    const fleeBtn = document.getElementById('fleeBtn');
    const resultContinueBtn = document.getElementById('resultContinueBtn');
    
    if (rollDiceBtn) {
        rollDiceBtn.addEventListener('click', () => {
            battle.rollDice();
        });
    }
    
    if (useItemBtn) {
        useItemBtn.addEventListener('click', () => {
            // В будущем можно добавить использование предметов
            alert('Система предметов в разработке!');
        });
    }
    
    if (fleeBtn) {
        fleeBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите сбежать из боя?')) {
                if (!battle.isPractice) {
                    GameState.saveBattleResult('lose');
                }
                window.location.href = 'home.html';
            }
        });
    }
    
    if (resultContinueBtn) {
        resultContinueBtn.addEventListener('click', () => {
            window.location.href = 'home.html';
        });
    }
    
    // Инициализируем музыку для боя
    const musicToggle = document.querySelector('#battleMusicToggle');
    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            const isEnabled = localStorage.getItem('musicEnabled') === 'true';
            localStorage.setItem('musicEnabled', (!isEnabled).toString());
            
            if (typeof window.toggleMusic === 'function') {
                window.toggleMusic();
            }
        });
    }
    
    // Автоматический старт боя для тренировки
    if (battle.isPractice) {
        setTimeout(() => {
            battle.battleStarted = true;
            battle.startBattle();
            battle.addLogEntry('Тренировочный бой начался!');
        }, 1000);
    }
});