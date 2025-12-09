// ===== ТЕСТОВЫЕ ПОЛЬЗОВАТЕЛИ =====
const testUsers = [
    {
        username: 'Player1',
        password: '123',
        firstName: 'Артур',
        lastName: 'Воинский',
        class: 'Воин',
        hp: 20,
        coins: 100,
        xp: 100,
        level: 1,
        wins: 0,
        losses: 0,
        totalBattles: 0,
        registrationDate: new Date().toLocaleDateString('ru-RU'),
        lastBattle: null
    },
    {
        username: 'Player2',
        password: '123',
        firstName: 'Гвендолин',
        lastName: 'Щитоносная',
        class: 'Воин',
        hp: 20,
        coins: 100,
        xp: 100,
        level: 1,
        wins: 0,
        losses: 0,
        totalBattles: 0,
        registrationDate: new Date().toLocaleDateString('ru-RU'),
        lastBattle: null
    }
];

// ===== ИНИЦИАЛИЗАЦИЯ ХРАНИЛИЩА =====
function initStorage() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(testUsers));
    }
    
    if (!localStorage.getItem('musicEnabled')) {
        localStorage.setItem('musicEnabled', 'true');
    }
}

// ===== ЛОГИКА АВТОРИЗАЦИИ =====
function login(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password
    );
    
    if (user) {
        // Удаляем пароль из объекта пользователя для безопасности
        const { password, ...userData } = user;
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        return {
            success: true,
            user: userData
        };
    }
    
    return {
        success: false,
        message: 'Неверный логин или пароль'
    };
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// ===== ОБРАБОТЧИКИ DOM =====
document.addEventListener('DOMContentLoaded', () => {
    initStorage();
    
    // Обработчики для страницы авторизации
    const loginBtn = document.getElementById('loginBtn');
    const guestBtn = document.getElementById('guestBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const musicToggle = document.getElementById('musicToggle');
    const musicStatus = document.getElementById('musicStatus');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    if (guestBtn) {
        guestBtn.addEventListener('click', handleGuestLogin);
    }
    
    if (usernameInput && passwordInput) {
        // Автозаполнение тестовых данных
        usernameInput.addEventListener('focus', () => {
            if (!usernameInput.value) {
                usernameInput.value = 'Player1';
                passwordInput.value = '123';
            }
        });
        
        // Ввод по Enter
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') passwordInput.focus();
        });
        
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }
    
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
});

// ===== ФУНКЦИИ ОБРАБОТКИ =====
function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    if (!username || !password) {
        showError('Введите логин и пароль', errorMessage);
        return;
    }
    
    const result = login(username, password);
    
    if (result.success) {
        // Анимация успешного входа
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.classList.add('pixel-glow');
        
        // Вибрация на мобильных
        Utils.vibrate([100, 50, 100]);
        
        // Перенаправление через 1 секунду
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1000);
    } else {
        showError(result.message, errorMessage);
        
        // Анимация ошибки
        const authBox = document.querySelector('.auth-box');
        authBox.classList.add('pixel-shake');
        
        // Вибрация на мобильных
        Utils.vibrate([200, 100, 200]);
        
        setTimeout(() => {
            authBox.classList.remove('pixel-shake');
        }, 500);
    }
}

function handleGuestLogin() {
    // Гостевой вход как Player1
    const result = login('Player1', '123');
    
    if (result.success) {
        // Добавляем пометку о госте
        const user = result.user;
        user.isGuest = true;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Перенаправление
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 500);
    }
}

function showError(message, errorElement) {
    if (!errorElement) return;
    
    errorElement.textContent = message;
    errorElement.classList.add('show');
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        errorElement.classList.remove('show');
    }, 5000);
}

function updateMusicButton(musicStatusElement) {
    if (!musicStatusElement) return;
    
    const isEnabled = localStorage.getItem('musicEnabled') === 'true';
    musicStatusElement.textContent = `Музыка: ${isEnabled ? 'Вкл' : 'Выкл'}`;
    
    // Обновляем иконку на кнопке переключения музыки
    const musicIcon = musicStatusElement.parentElement.querySelector('.music-icon');
    if (musicIcon) {
        musicIcon.textContent = isEnabled ? '♪' : '🔇';
    }
}

// ===== ВЫХОД ИЗ СИСТЕМЫ =====
function setupLogoutButtons() {
    const logoutButtons = document.querySelectorAll('.logout');
    
    logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Подтверждение выхода
            if (confirm('Вы уверены, что хотите выйти?')) {
                logout();
            }
        });
    });
}

// ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupLogoutButtons();
    });
} else {
    setupLogoutButtons();
}

// Экспортируем функции для использования в других файлах
window.login = login;
window.logout = logout;
window.getCurrentUser = getCurrentUser;