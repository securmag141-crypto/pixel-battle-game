// ===== PWA НАСТРОЙКИ =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker зарегистрирован:', registration);
            })
            .catch(error => {
                console.log('Ошибка регистрации ServiceWorker:', error);
            });
    });
}

// ===== ОБРАБОТКА ЗАГРУЗКИ СТРАНИЦЫ =====
document.addEventListener('DOMContentLoaded', () => {
    // Скрываем экран загрузки
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }, 500);
    }
    
    // Проверяем авторизацию на игровых страницах
    const currentPage = window.location.pathname.split('/').pop();
    const gamePages = ['home.html', 'profile.html', 'fight.html'];
    
    if (gamePages.includes(currentPage)) {
        checkAuth();
    }
    
    // Инициализация музыки
    if (typeof window.initMusic === 'function') {
        window.initMusic();
    }
});

// ===== ПРОВЕРКА АВТОРИЗАЦИИ =====
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // Если пользователь не авторизован, перенаправляем на страницу входа
        window.location.href = 'index.html';
        return false;
    }
    
    // Обновляем данные пользователя на странице
    updateUserData(currentUser);
    return true;
}

// ===== ОБНОВЛЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ =====
function updateUserData(user) {
    // Общие элементы
    document.querySelectorAll('[id*="PlayerName"]').forEach(el => {
        if (el.id.includes('PlayerName')) el.textContent = user.username;
    });
    
    // Обновляем HP
    document.querySelectorAll('[id*="HP"]').forEach(el => {
        if (el.id.includes('HP') && !el.id.includes('Bar')) {
            el.textContent = user.hp;
        }
    });
    
    // Обновляем HP бары
    document.querySelectorAll('[id*="HPBar"]').forEach(el => {
        if (el.id.includes('HPBar')) {
            const percent = (user.hp / 20) * 100;
            el.style.width = `${percent}%`;
        }
    });
    
    // Обновляем монеты
    document.querySelectorAll('[id*="Coins"]').forEach(el => {
        if (el.id.includes('Coins')) el.textContent = user.coins;
    });
    
    // Обновляем опыт
    document.querySelectorAll('[id*="XP"]').forEach(el => {
        if (el.id.includes('XP')) el.textContent = user.xp;
    });
    
    // Обновляем XP бары
    document.querySelectorAll('[id*="xpBar"]').forEach(el => {
        if (el.id.includes('xpBar')) {
            const percent = (user.xp % 1000) / 10;
            el.style.width = `${percent}%`;
        }
    });
    
    // Обновляем уровень
    document.querySelectorAll('[id*="Level"]').forEach(el => {
        if (el.id.includes('Level')) {
            el.textContent = Math.floor(user.xp / 1000) + 1;
        }
    });
}

// ===== УПРАВЛЕНИЕ СОСТОЯНИЕМ ИГРЫ =====
const GameState = {
    saveBattleCode(code) {
        localStorage.setItem('battleCode', code);
        localStorage.setItem('battleTimestamp', Date.now());
    },
    
    getBattleCode() {
        const timestamp = localStorage.getItem('battleTimestamp');
        const code = localStorage.getItem('battleCode');
        
        // Код действителен 5 минут
        if (timestamp && (Date.now() - timestamp > 5 * 60 * 1000)) {
            this.clearBattleCode();
            return null;
        }
        
        return code;
    },
    
    clearBattleCode() {
        localStorage.removeItem('battleCode');
        localStorage.removeItem('battleTimestamp');
    },
    
    joinBattle(code) {
        localStorage.setItem('joinBattleCode', code);
    },
    
    getJoinBattleCode() {
        return localStorage.getItem('joinBattleCode');
    },
    
    clearJoinBattleCode() {
        localStorage.removeItem('joinBattleCode');
    },
    
    saveBattleResult(result) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return;
        
        user.wins = user.wins || 0;
        user.losses = user.losses || 0;
        user.totalBattles = user.totalBattles || 0;
        
        if (result === 'win') {
            user.wins++;
            user.coins += 10;
            user.xp += 10;
        } else if (result === 'lose') {
            user.losses++;
            user.coins = Math.max(0, user.coins - 10);
            user.xp += 3;
        }
        
        user.totalBattles++;
        user.lastBattle = new Date().toLocaleString('ru-RU');
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Обновляем данные в хранилище пользователей
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.username === user.username);
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
};

// ===== ОБРАБОТЧИКИ ОШИБОК =====
window.addEventListener('error', (event) => {
    console.error('Произошла ошибка:', event.error);
    // Можно добавить уведомление пользователю
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Необработанное обещание:', event.reason);
});

// ===== УТИЛИТЫ =====
const Utils = {
    generateCode(length = 6) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    vibrate(pattern = [100, 50, 100]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    },
    
    showNotification(title, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, options);
        }
    },
    
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
};

// ===== ИНИЦИАЛИЗАЦИЯ PWA =====
function initPWA() {
    // Запрашиваем разрешение на уведомления
    Utils.requestNotificationPermission();
    
    // Добавляем классы для определения платформы
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        document.body.classList.add('is-mobile');
    } else {
        document.body.classList.add('is-desktop');
    }
    
    // Предотвращаем масштабирование на мобильных
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Предотвращаем контекстное меню на изображениях
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });
}

// Запускаем инициализацию PWA
initPWA();

// Экспортируем функции для использования в других файлах
window.GameState = GameState;
window.Utils = Utils;
window.checkAuth = checkAuth;
window.updateUserData = updateUserData;