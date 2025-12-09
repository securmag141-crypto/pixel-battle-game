// ===== УПРАВЛЕНИЕ МЕНЮ =====
function initMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const sideMenu = document.getElementById('sideMenu');
    const battleLink = document.getElementById('battleLink');
    const battleModal = document.getElementById('battleModal');
    
    if (menuToggle && sideMenu) {
        menuToggle.addEventListener('click', () => {
            sideMenu.classList.add('active');
            menuToggle.classList.add('active');
            Utils.vibrate([50]);
        });
    }
    
    if (closeMenuBtn && sideMenu) {
        closeMenuBtn.addEventListener('click', () => {
            sideMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            Utils.vibrate([50]);
        });
    }
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (sideMenu && sideMenu.classList.contains('active') &&
            !sideMenu.contains(e.target) &&
            !menuToggle.contains(e.target)) {
            sideMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
    
    // Обработка клика по ссылке "Бой"
    if (battleLink && battleModal) {
        battleLink.addEventListener('click', (e) => {
            e.preventDefault();
            battleModal.classList.add('active');
            sideMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    }
}

// ===== УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ =====
function initModals() {
    const battleModal = document.getElementById('battleModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const createBattleBtn = document.getElementById('createBattleBtn');
    const joinBattleBtn = document.getElementById('joinBattleBtn');
    const startBattleBtn = document.getElementById('startBattleBtn');
    const battleCodeInput = document.getElementById('battleCodeInput');
    const generatedCodeContainer = document.getElementById('generatedCodeContainer');
    const generatedCode = document.getElementById('generatedCode');
    
    // Закрытие модального окна
    if (closeModalBtn && battleModal) {
        closeModalBtn.addEventListener('click', () => {
            battleModal.classList.remove('active');
        });
    }
    
    // Клик вне модального окна
    if (battleModal) {
        battleModal.addEventListener('click', (e) => {
            if (e.target === battleModal) {
                battleModal.classList.remove('active');
            }
        });
    }
    
    // Генерация кода боя
    if (createBattleBtn) {
        createBattleBtn.addEventListener('click', () => {
            const code = Utils.generateCode();
            GameState.saveBattleCode(code);
            
            generatedCode.textContent = code;
            generatedCodeContainer.classList.add('active');
            
            // Активируем кнопку начала боя
            startBattleBtn.disabled = false;
            
            // Вибрация
            Utils.vibrate([100, 50, 100]);
            
            // Анимация кода
            generatedCode.classList.add('pixel-glow');
            setTimeout(() => {
                generatedCode.classList.remove('pixel-glow');
            }, 1000);
        });
    }
    
    // Присоединение к бою
    if (joinBattleBtn && battleCodeInput) {
        joinBattleBtn.addEventListener('click', () => {
            const code = battleCodeInput.value.trim().toUpperCase();
            
            if (!code || code.length !== 6) {
                showBattleError('Введите корректный код боя (6 символов)');
                return;
            }
            
            GameState.joinBattle(code);
            startBattleBtn.disabled = false;
            
            // Вибрация
            Utils.vibrate([100]);
            
            // Анимация
            battleCodeInput.classList.add('pixel-glow');
            setTimeout(() => {
                battleCodeInput.classList.remove('pixel-glow');
            }, 500);
        });
        
        // Ввод по Enter
        battleCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                joinBattleBtn.click();
            }
        });
    }
    
    // Начало боя
    if (startBattleBtn) {
        startBattleBtn.addEventListener('click', () => {
            const joinCode = GameState.getJoinBattleCode();
            const createCode = GameState.getBattleCode();
            
            if (joinCode) {
                // Присоединяемся к бою
                window.location.href = `fight.html?code=${joinCode}`;
            } else if (createCode) {
                // Создаем новый бой
                window.location.href = `fight.html?host=true&code=${createCode}`;
            }
        });
    }
    
    // Быстрый бой
    const quickBattleBtn = document.getElementById('quickBattleBtn');
    if (quickBattleBtn) {
        quickBattleBtn.addEventListener('click', () => {
            const code = Utils.generateCode();
            GameState.saveBattleCode(code);
            window.location.href = `fight.html?host=true&code=${code}`;
        });
    }
}

// ===== ОБНОВЛЕНИЕ СТАТИСТИКИ НА ГЛАВНОЙ =====
function updateHomeStats() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Обновляем счетчики
    const winCount = document.getElementById('winCount');
    const loseCount = document.getElementById('loseCount');
    const playerLevel = document.getElementById('playerLevel');
    const welcomeTitle = document.getElementById('welcomeTitle');
    
    if (winCount) winCount.textContent = user.wins || 0;
    if (loseCount) loseCount.textContent = user.losses || 0;
    if (playerLevel) playerLevel.textContent = Math.floor((user.xp || 0) / 1000) + 1;
    
    // Персонализируем приветствие
    if (welcomeTitle) {
        const titles = [
            'Добро пожаловать, Воин!',
            'Приветствуем, Герой!',
            'С возвращением, Воитель!',
            'Рады видеть, Боец!'
        ];
        const randomTitle = titles[Math.floor(Math.random() * titles.length)];
        welcomeTitle.textContent = randomTitle;
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ ПРОФИЛЯ =====
function initProfile() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Заполняем данные профиля
    document.getElementById('profileName').textContent = user.username;
    document.getElementById('profileHP').textContent = user.hp;
    document.getElementById('profileCoins').textContent = user.coins;
    document.getElementById('profileXP').textContent = user.xp;
    document.getElementById('profileLevel').textContent = Math.floor(user.xp / 1000) + 1;
    document.getElementById('profileWins').textContent = user.wins || 0;
    
    // Детали профиля
    document.getElementById('detailFirstName').textContent = user.firstName || '-';
    document.getElementById('detailLastName').textContent = user.lastName || '-';
    document.getElementById('detailClass').textContent = user.class;
    document.getElementById('regDate').textContent = user.registrationDate || '-';
    document.getElementById('totalBattles').textContent = user.totalBattles || 0;
    document.getElementById('lastBattleTime').textContent = user.lastBattle || 'Не было';
    
    // Прогресс-бары
    const hpBar = document.getElementById('hpBar');
    const xpBar = document.getElementById('xpBar');
    
    if (hpBar) {
        const hpPercent = (user.hp / 20) * 100;
        hpBar.style.width = `${hpPercent}%`;
    }
    
    if (xpBar) {
        const xpPercent = (user.xp % 1000) / 10;
        xpBar.style.width = `${xpPercent}%`;
    }
    
    // Кнопка сброса прогресса
    const resetBtn = document.getElementById('resetProgressBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
                // Сбрасываем данные пользователя к начальным
                user.hp = 20;
                user.coins = 100;
                user.xp = 100;
                user.wins = 0;
                user.losses = 0;
                user.totalBattles = 0;
                user.lastBattle = null;
                
                // Сохраняем
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Обновляем в хранилище пользователей
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const userIndex = users.findIndex(u => u.username === user.username);
                if (userIndex !== -1) {
                    users[userIndex] = { ...users[userIndex], ...user, password: '123' };
                    localStorage.setItem('users', JSON.stringify(users));
                }
                
                // Перезагружаем страницу
                location.reload();
            }
        });
    }
}

// ===== УПРАВЛЕНИЕ МУЗЫКОЙ НА ГЛАВНОЙ =====
function initHomeMusic() {
    const musicToggle = document.getElementById('homeMusicToggle');
    const musicStatus = document.getElementById('homeMusicStatus');
    
    if (musicToggle && musicStatus) {
        updateMusicButton(musicStatus);
        
        musicToggle.addEventListener('click', () => {
            const isEnabled = localStorage.getItem('musicEnabled') === 'true';
            localStorage.setItem('musicEnabled', (!isEnabled).toString());
            updateMusicButton(musicStatus);
            
            if (typeof window.toggleMusic === 'function') {
                window.toggleMusic();
            }
        });
    }
}

// ===== ОБЩИЕ ФУНКЦИИ =====
function showBattleError(message) {
    // Создаем временное уведомление об ошибке
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message show';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        animation: pixel-shake 0.5s ease;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ =====
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем авторизацию
    if (!checkAuth()) return;
    
    // Инициализируем меню
    initMenu();
    
    // Инициализируем модальные окна
    initModals();
    
    // Обновляем статистику на главной
    updateHomeStats();
    
    // Инициализируем музыку на главной
    initHomeMusic();
    
    // Если это страница профиля, инициализируем её
    if (window.location.pathname.includes('profile.html')) {
        initProfile();
    }
    
    // Инициализируем музыку на профиле
    const profileMusicToggle = document.getElementById('profileMusicToggle');
    const profileMusicStatus = document.getElementById('profileMusicStatus');
    
    if (profileMusicToggle && profileMusicStatus) {
        updateMusicButton(profileMusicStatus);
        
        profileMusicToggle.addEventListener('click', () => {
            const isEnabled = localStorage.getItem('musicEnabled') === 'true';
            localStorage.setItem('musicEnabled', (!isEnabled).toString());
            updateMusicButton(profileMusicStatus);
            
            if (typeof window.toggleMusic === 'function') {
                window.toggleMusic();
            }
        });
    }
    
    // Обработка тренировки
    const practiceBtn = document.getElementById('practiceBtn');
    if (practiceBtn) {
        practiceBtn.addEventListener('click', () => {
            window.location.href = 'fight.html?practice=true';
        });
    }
});