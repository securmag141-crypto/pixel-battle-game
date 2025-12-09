// ===== НАСТРОЙКИ МУЗЫКИ =====
const MusicGenerator = {
    audioContext: null,
    masterGain: null,
    currentMusic: null,
    isPlaying: false,
    isEnabled: true,
    
    // Темы для разных страниц
    themes: {
        auth: {
            type: 'ambient',
            tempo: 80,
            melody: [60, 64, 67, 72, 67, 64, 60],
            harmony: [48, 52, 55],
            waveType: 'sine'
        },
        home: {
            type: 'peaceful',
            tempo: 90,
            melody: [62, 65, 69, 74, 69, 65, 62],
            harmony: [50, 53, 57],
            waveType: 'triangle'
        },
        battle: {
            type: 'epic',
            tempo: 120,
            melody: [67, 71, 74, 79, 74, 71, 67],
            harmony: [55, 59, 62],
            waveType: 'sawtooth',
            drums: true
        }
    },
    
    init() {
        // Проверяем настройки
        this.isEnabled = localStorage.getItem('musicEnabled') !== 'false';
        
        // Создаем AudioContext
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.isEnabled ? 0.3 : 0;
            
            console.log('AudioContext инициализирован');
        } catch (error) {
            console.warn('Web Audio API не поддерживается:', error);
        }
        
        // Определяем текущую страницу и запускаем соответствующую музыку
        this.detectPageAndPlay();
    },
    
    detectPageAndPlay() {
        const path = window.location.pathname;
        let theme = 'home';
        
        if (path.includes('index.html')) {
            theme = 'auth';
        } else if (path.includes('fight.html')) {
            theme = 'battle';
        }
        
        this.playTheme(theme);
    },
    
    playTheme(themeName) {
        if (!this.audioContext) return;
        
        this.stop();
        
        const theme = this.themes[themeName];
        if (!theme) return;
        
        this.currentMusic = themeName;
        this.isPlaying = true;
        
        // Запускаем генерацию музыки
        this.generateMelody(theme);
        this.generateHarmony(theme);
        
        if (theme.drums) {
            this.generateDrums(theme);
        }
    },
    
    generateMelody(theme) {
        const melodyNotes = theme.melody;
        const tempo = theme.tempo;
        const noteDuration = 60 / tempo;
        
        let time = this.audioContext.currentTime + 0.1;
        
        // Функция для воспроизведения одной ноты мелодии
        const playMelodyNote = (noteIndex) => {
            if (!this.isPlaying || this.currentMusic !== theme.type) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.type = theme.waveType;
            oscillator.frequency.value = this.midiToFrequency(melodyNotes[noteIndex]);
            
            // Атака и затухание
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(0.2, time + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + noteDuration * 0.8);
            
            oscillator.start(time);
            oscillator.stop(time + noteDuration * 0.8);
            
            // Следующая нота
            time += noteDuration;
            
            // Рекурсивный вызов для следующей ноты
            setTimeout(() => {
                playMelodyNote((noteIndex + 1) % melodyNotes.length);
            }, noteDuration * 1000);
        };
        
        // Начинаем воспроизведение
        playMelodyNote(0);
    },
    
    generateHarmony(theme) {
        const harmonyNotes = theme.harmony;
        const tempo = theme.tempo;
        const chordDuration = 60 / tempo * 4; // Аккорд длится 4 такта
        
        let time = this.audioContext.currentTime + 0.5;
        
        // Функция для воспроизведения аккорда
        const playChord = () => {
            if (!this.isPlaying || this.currentMusic !== theme.type) return;
            
            // Создаем осцилляторы для каждой ноты аккорда
            harmonyNotes.forEach((note, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.masterGain);
                
                oscillator.type = 'sine';
                oscillator.frequency.value = this.midiToFrequency(note - 12); // На октаву ниже
                
                // Плавное появление и затухание
                gainNode.gain.setValueAtTime(0, time);
                gainNode.gain.linearRampToValueAtTime(0.1, time + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.001, time + chordDuration);
                
                oscillator.start(time);
                oscillator.stop(time + chordDuration);
            });
            
            // Следующий аккорд
            time += chordDuration;
            
            // Рекурсивный вызов
            setTimeout(playChord, chordDuration * 1000);
        };
        
        playChord();
    },
    
    generateDrums(theme) {
        const tempo = theme.tempo;
        const beatDuration = 60 / tempo;
        
        let time = this.audioContext.currentTime + 0.3;
        let beatCount = 0;
        
        // Функция для воспроизведения барабанного ритма
        const playBeat = () => {
            if (!this.isPlaying || this.currentMusic !== 'battle') return;
            
            // Бас-бочка на сильных долях
            if (beatCount % 4 === 0) {
                this.playDrumSound(time, 80, 0.15);
            }
            
            // Малый барабан на слабых долях
            if (beatCount % 2 === 1) {
                this.playDrumSound(time, 200, 0.1);
            }
            
            // Хай-хэт на каждую долю
            this.playDrumSound(time, 1000, 0.05);
            
            time += beatDuration;
            beatCount++;
            
            // Рекурсивный вызов
            setTimeout(playBeat, beatDuration * 1000);
        };
        
        playBeat();
    },
    
    playDrumSound(startTime, frequency, duration) {
        // Генератор шума для барабанов
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        // Заполняем буфер шумом
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        // Создаем источник и фильтры
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // Настраиваем фильтр
        filter.type = 'bandpass';
        filter.frequency.value = frequency;
        filter.Q.value = 1;
        
        // Огибающая амплитуды
        gainNode.gain.setValueAtTime(0.5, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        source.start(startTime);
        source.stop(startTime + duration);
    },
    
    midiToFrequency(midiNote) {
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    },
    
    toggle() {
        this.isEnabled = !this.isEnabled;
        localStorage.setItem('musicEnabled', this.isEnabled.toString());
        
        if (this.masterGain) {
            this.masterGain.gain.value = this.isEnabled ? 0.3 : 0;
        }
        
        // Обновляем кнопки на всех страницах
        this.updateMusicButtons();
        
        return this.isEnabled;
    },
    
    stop() {
        this.isPlaying = false;
        this.currentMusic = null;
        
        // Останавливаем все источники звука
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    },
    
    updateMusicButtons() {
        const musicButtons = document.querySelectorAll('[id*="MusicStatus"]');
        const isEnabled = this.isEnabled;
        
        musicButtons.forEach(element => {
            element.textContent = `Музыка: ${isEnabled ? 'Вкл' : 'Выкл'}`;
            
            // Обновляем иконку на кнопке
            const musicIcon = element.parentElement.querySelector('.music-icon');
            if (musicIcon) {
                musicIcon.textContent = isEnabled ? '♪' : '🔇';
            }
        });
    }
};

// ===== ИНИЦИАЛИЗАЦИЯ И ГЛОБАЛЬНЫЕ ФУНКЦИИ =====
function initMusic() {
    // Ждем взаимодействия пользователя (требование браузеров)
    document.addEventListener('click', function initOnFirstClick() {
        MusicGenerator.init();
        document.removeEventListener('click', initOnFirstClick);
    }, { once: true });
}

function toggleMusic() {
    return MusicGenerator.toggle();
}

function playBattleMusic() {
    MusicGenerator.playTheme('battle');
}

function playHomeMusic() {
    MusicGenerator.playTheme('home');
}

function playAuthMusic() {
    MusicGenerator.playTheme('auth');
}

// Экспортируем функции для глобального использования
window.initMusic = initMusic;
window.toggleMusic = toggleMusic;
window.playBattleMusic = playBattleMusic;
window.playHomeMusic = playHomeMusic;
window.playAuthMusic = playAuthMusic;
window.MusicGenerator = MusicGenerator;

// Автоматическая инициализация при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMusic);
} else {
    initMusic();
}