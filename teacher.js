// === ОБЩИЕ ПЕРЕМЕННЫЕ ===
let database;
let gameRef;
let playersRef;
let currentGame = null;
let userName = '';
let userRole = '';
let currentTimer = null;

// === ВОПРОСЫ ДЛЯ ИГРЫ ===
const quizQuestions = [
    // ... (вопросы из предыдущего кода - оставляем без изменений)
    // Просто убедись, что они есть
];

// === ГЛОБАЛЬНЫЕ ФУНКЦИИ ===
// Эти функции должны быть доступны из HTML
window.selectRole = function(role) {
    localStorage.setItem('userRole', role);
    if (role === 'teacher') {
        document.body.innerHTML = `
            <div class="loading-screen">
                <i class="fas fa-chalkboard-teacher"></i>
                <h2>Загрузка режима учителя...</h2>
            </div>
        `;
        setTimeout(() => loadTeacherMode(), 100);
    } else {
        document.body.innerHTML = `
            <div class="loading-screen">
                <i class="fas fa-mobile-alt"></i>
                <h2>Загрузка режима ученика...</h2>
            </div>
        `;
        setTimeout(() => loadStudentMode(), 100);
    }
};

window.submitAnswer = function(answerIndex, questionIndex) {
    submitStudentAnswer(answerIndex, questionIndex);
};

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, на какой странице находимся
    const path = window.location.pathname;
    
    if (path.includes('index.html') || path === '/' || path === '') {
        // Мы на главной странице - ничего не инициализируем
        return;
    }
    
    // Проверяем роль из localStorage
    userRole = localStorage.getItem('userRole');
    
    if (!userRole) {
        // Если нет роли, возвращаем на главную
        window.location.href = 'index.html';
        return;
    }
    
    // Инициализируем Firebase
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        database = firebase.database();
        console.log('Firebase подключен');
        
        // Запускаем нужный режим
        if (userRole === 'teacher') {
            initTeacherMode();
        } else {
            initStudentMode();
        }
    } catch (error) {
        console.error('Ошибка Firebase:', error);
        showError('Ошибка подключения к серверу');
    }
});

// === РЕЖИМ УЧИТЕЛЯ ===
function initTeacherMode() {
    renderTeacherUI();
    checkActiveGame();
}

function renderTeacherUI() {
    document.body.innerHTML = `
        <div class="teacher-header">
            <div class="container">
                <div class="logo">
                    <i class="fas fa-chalkboard-teacher"></i>
                    <h1>Brain Quiz - Режим учителя</h1>
                </div>
                <div class="teacher-stats">
                    <div class="stat-item" id="player-count-display">
                        <i class="fas fa-users"></i>
                        <span>Игроков: <strong>0</strong></span>
                    </div>
                    <div class="stat-item" id="game-status-display">
                        <i class="fas fa-gamepad"></i>
                        <span>Статус: <strong>Неактивно</strong></span>
                    </div>
                    <div class="stat-item" id="question-number-display">
                        <i class="fas fa-question-circle"></i>
                        <span>Вопрос: <strong>-</strong></span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="teacher-content">
            <!-- Левая панель управления -->
            <div class="teacher-sidebar">
                <div class="control-card" id="create-game-card">
                    <h3><i class="fas fa-plus-circle"></i> Создать игру</h3>
                    <div class="form-group">
                        <label for="game-name">Название игры:</label>
                        <input type="text" id="game-name" class="form-input" 
                               value="Подготовка к ОГЭ" placeholder="Введите название">
                    </div>
                    <div class="form-group">
                        <label>Количество вопросов: <span id="q-count">10</span></label>
                        <input type="range" id="question-count" min="5" max="15" value="10" 
                               class="form-input" style="padding: 0;">
                    </div>
                    <button class="control-btn btn-primary" id="create-game-btn">
                        <i class="fas fa-rocket"></i> Создать игру
                    </button>
                </div>
                
                <div class="control-card hidden" id="game-controls">
                    <h3><i class="fas fa-cogs"></i> Управление игрой</h3>
                    <button class="control-btn btn-primary" id="start-game-btn">
                        <i class="fas fa-play"></i> Начать игру
                    </button>
                    <button class="control-btn btn-secondary" id="next-question-btn">
                        <i class="fas fa-forward"></i> Следующий вопрос
                    </button>
                    <button class="control-btn btn-danger" id="end-game-btn">
                        <i class="fas fa-stop"></i> Завершить игру
                    </button>
                </div>
                
                <div class="players-list" id="players-list">
                    <h3><i class="fas fa-users"></i> Игроки (<span id="players-count">0</span>)</h3>
                    <div id="players-container">
                        <p class="empty">Игроки появятся здесь</p>
                    </div>
                </div>
            </div>
            
            <!-- Основной экран -->
            <div class="question-screen hidden" id="question-screen">
                <div class="question-header">
                    <div class="question-category" id="question-category">ОГЭ</div>
                    <div class="question-timer" id="question-timer">30</div>
                    <div class="question-number" id="question-number">Вопрос 1/10</div>
                </div>
                <div class="question-text" id="question-text">
                    Вопрос появится после начала игры
                </div>
            </div>
            
            <div class="stats-container hidden" id="results-screen">
                <h2><i class="fas fa-chart-bar"></i> Результаты ответа</h2>
                <div id="stats-content"></div>
            </div>
            
            <div class="question-screen hidden" id="waiting-screen">
                <div class="question-text" style="font-size: 32px;">
                    <i class="fas fa-hourglass-half" style="font-size: 64px; margin-bottom: 20px;"></i>
                    <br>
                    Ожидание подключения учеников...
                    <br>
                    <small style="font-size: 24px; opacity: 0.8;">Попросите их зайти на сайт с телефонов</small>
                </div>
            </div>
        </div>
        
        <script>
            // Привязываем обработчики сразу после рендера
            setTimeout(() => {
                // Слайдер количества вопросов
                const qCountSlider = document.getElementById('question-count');
                const qCountDisplay = document.getElementById('q-count');
                if (qCountSlider && qCountDisplay) {
                    qCountSlider.addEventListener('input', () => {
                        qCountDisplay.textContent = qCountSlider.value;
                    });
                }
                
                // Кнопка создания игры
                const createBtn = document.getElementById('create-game-btn');
                if (createBtn) {
                    createBtn.addEventListener('click', () => {
                        if (window.createGame) window.createGame();
                    });
                }
                
                // Кнопки управления игрой
                const startBtn = document.getElementById('start-game-btn');
                if (startBtn) {
                    startBtn.addEventListener('click', () => {
                        if (window.startGame) window.startGame();
                    });
                }
                
                const nextBtn = document.getElementById('next-question-btn');
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        if (window.nextQuestion) window.nextQuestion();
                    });
                }
                
                const endBtn = document.getElementById('end-game-btn');
                if (endBtn) {
                    endBtn.addEventListener('click', () => {
                        if (window.endGame) window.endGame();
                    });
                }
                
                console.log('Обработчики кнопок привязаны');
            }, 100);
        </script>
    `;
    
    // Делаем функции глобальными
    window.createGame = createGame;
    window.startGame = startGame;
    window.nextQuestion = nextQuestion;
    window.endGame = endGame;
}

function loadTeacherMode() {
    // Просто перезагружаем страницу для учителя
    window.location.href = 'teacher.html';
}

// === РЕЖИМ УЧЕНИКА ===
function initStudentMode() {
    showNameInput();
}

function showNameInput() {
    document.body.innerHTML = `
        <div class="student-container">
            <div class="student-header">
                <i class="fas fa-mobile-alt"></i>
                <h1>Brain Quiz</h1>
                <p>Режим ученика</p>
            </div>
            
            <div class="student-content">
                <div class="name-form">
                    <h3>Как тебя зовут?</h3>
                    <input type="text" id="student-name" class="name-input" 
                           placeholder="Введите ваше имя" maxlength="20">
                    <button class="control-btn btn-primary" id="join-game-btn">
                        <i class="fas fa-sign-in-alt"></i> Присоединиться к игре
                    </button>
                </div>
            </div>
        </div>
        
        <script>
            // Привязываем обработчики
            setTimeout(() => {
                const joinBtn = document.getElementById('join-game-btn');
                const nameInput = document.getElementById('student-name');
                
                if (joinBtn) {
                    joinBtn.addEventListener('click', () => {
                        const name = nameInput ? nameInput.value.trim() : '';
                        if (window.joinGame) window.joinGame(name);
                    });
                }
                
                // Enter для отправки
                if (nameInput) {
                    nameInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            const name = nameInput.value.trim();
                            if (window.joinGame) window.joinGame(name);
                        }
                    });
                }
                
                console.log('Обработчики ученика привязаны');
            }, 100);
        </script>
    `;
    
    // Делаем функцию глобальной
    window.joinGame = function(name) {
        userName = name;
        
        if (!userName) {
            alert('Пожалуйста, введите ваше имя!');
            document.getElementById('student-name')?.focus();
            return;
        }
        
        findActiveGame();
    };
}

function loadStudentMode() {
    window.location.href = 'student.html';
}

// === ОСНОВНАЯ ЛОГИКА УЧИТЕЛЯ ===
function createGame() {
    console.log('Создание игры...');
    
    const gameName = document.getElementById('game-name')?.value || 'Игра';
    const questionCount = parseInt(document.getElementById('question-count')?.value || 10);
    
    // Генерируем код игры
    const gameCode = Math.floor(1000 + Math.random() * 9000).toString();
    currentGame = gameCode;
    
    console.log('Создаем игру с кодом:', gameCode);
    
    // Сохраняем как активную игру
    database.ref('activeGame').set(gameCode)
        .then(() => {
            // Создаем структуру игры
            gameRef = database.ref(`games/${gameCode}`);
            
            // Выбираем случайные вопросы
            const selectedQuestions = [...quizQuestions]
                .sort(() => Math.random() - 0.5)
                .slice(0, questionCount)
                .map((q, i) => ({ ...q, number: i + 1 }));
            
            // Сохраняем настройки игры
            return gameRef.set({
                name: gameName,
                code: gameCode,
                state: 'waiting',
                currentQuestion: 0,
                totalQuestions: questionCount,
                createdAt: Date.now(),
                teacherConnected: true
            });
        })
        .then(() => {
            // Сохраняем вопросы
            const questionsRef = gameRef.child('questions');
            const questionsObj = {};
            const selectedQuestions = [...quizQuestions]
                .sort(() => Math.random() - 0.5)
                .slice(0, questionCount);
            
            selectedQuestions.forEach((q, i) => {
                questionsObj[i] = q;
            });
            
            return gameRef.child('questions').set(questionsObj);
        })
        .then(() => {
            console.log('Игра создана:', gameCode);
            
            // Показываем экран ожидания
            showScreen('waiting-screen');
            
            const gameControls = document.getElementById('game-controls');
            const createGameCard = document.getElementById('create-game-card');
            
            if (gameControls) gameControls.classList.remove('hidden');
            if (createGameCard) createGameCard.classList.add('hidden');
            
            // Обновляем статус
            updateGameStatus('Ожидание игроков');
            
            // Начинаем слушать игроков
            playersRef = gameRef.child('players');
            playersRef.on('value', updatePlayersList);
            
            // Слушаем изменения игры
            gameRef.on('value', handleGameState);
            
            alert(`Игра "${gameName}" создана! Код: ${gameCode}`);
        })
        .catch(error => {
            console.error('Ошибка создания игры:', error);
            alert('Ошибка: ' + error.message);
        });
}

function checkActiveGame() {
    database.ref('activeGame').once('value').then(snapshot => {
        const activeGame = snapshot.val();
        if (activeGame) {
            connectToGame(activeGame);
        }
    });
}

function connectToGame(gameCode) {
    console.log('Подключение к игре:', gameCode);
    
    currentGame = gameCode;
    gameRef = database.ref(`games/${gameCode}`);
    playersRef = gameRef.child('players');
    
    // Проверяем существует ли игра
    gameRef.once('value').then(snapshot => {
        if (!snapshot.exists()) {
            showError('Игра не найдена');
            return;
        }
        
        const gameData = snapshot.val();
        
        // Учитель подключается к игре
        showScreen('waiting-screen');
        updateGameStatus('Подключено');
        
        // Показываем панель управления
        const gameControls = document.getElementById('game-controls');
        const createGameCard = document.getElementById('create-game-card');
        
        if (gameControls) gameControls.classList.remove('hidden');
        if (createGameCard) createGameCard.classList.add('hidden');
        
        // Слушаем игроков и состояние
        playersRef.on('value', updatePlayersList);
        gameRef.on('value', handleGameState);
        
    }).catch(error => {
        console.error('Ошибка подключения:', error);
        showError('Не удалось подключиться к игре');
    });
}

// === ОБРАБОТКА СОСТОЯНИЙ ИГРЫ ===
function handleGameState(snapshot) {
    const gameData = snapshot.val();
    if (!gameData) return;
    
    const state = gameData.state;
    const currentQ = gameData.currentQuestion || 0;
    
    console.log('Состояние игры:', state, 'вопрос:', currentQ);
    
    // Обновляем статус
    const statusMap = {
        'waiting': 'Ожидание',
        'question': 'Вопрос активен',
        'results': 'Результаты',
        'finished': 'Завершено'
    };
    updateGameStatus(statusMap[state] || 'Неизвестно');
    
    // Обновляем номер вопроса
    updateQuestionNumber(currentQ + 1, gameData.totalQuestions);
    
    // Обрабатываем состояние
    switch(state) {
        case 'waiting':
            showScreen('waiting-screen');
            break;
            
        case 'question':
            showQuestion(gameData, currentQ);
            break;
            
        case 'results':
            showResults(gameData, currentQ);
            break;
            
        case 'finished':
            showFinalResults();
            break;
    }
}

// === ПОМОЩНИКИ ДЛЯ УЧИТЕЛЯ ===
function updateGameStatus(status) {
    const el = document.getElementById('game-status-display');
    if (el) {
        const strong = el.querySelector('strong');
        if (strong) strong.textContent = status;
    }
}

function updatePlayerCount(count) {
    const el = document.getElementById('player-count-display');
    if (el) {
        const strong = el.querySelector('strong');
        if (strong) strong.textContent = count;
    }
}

function updateQuestionNumber(current, total) {
    const el = document.getElementById('question-number-display');
    if (el) {
        const strong = el.querySelector('strong');
        if (strong) strong.textContent = `${current}/${total}`;
    }
}

function showScreen(screenId) {
    console.log('Показываем экран:', screenId);
    
    // Скрываем все экраны
    ['question-screen', 'results-screen', 'waiting-screen'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    
    // Показываем нужный экран
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('hidden');
    }
}

function updatePlayersList(snapshot) {
    const players = snapshot.val() || {};
    const count = Object.keys(players).length;
    
    updatePlayerCount(count);
    
    const container = document.getElementById('players-container');
    const countElement = document.getElementById('players-count');
    
    if (!container) return;
    
    if (count === 0) {
        container.innerHTML = '<p class="empty">Игроки появятся здесь</p>';
        if (countElement) countElement.textContent = '0';
        return;
    }
    
    let html = '';
    Object.values(players).forEach(player => {
        html += `
            <div class="player-item">
                <div class="player-avatar">${player.name?.charAt(0) || '?'}</div>
                <div class="player-info">
                    <div class="player-name">${player.name || 'Игрок'}</div>
                    <div class="player-score">${player.score || 0} очков</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    if (countElement) countElement.textContent = count;
}

function showQuestion(gameData, questionIndex) {
    console.log('Показываем вопрос:', questionIndex);
    
    showScreen('question-screen');
    
    gameRef.child(`questions/${questionIndex}`).once('value').then(snapshot => {
        const question = snapshot.val();
        if (!question) {
            console.error('Вопрос не найден:', questionIndex);
            return;
        }
        
        // Обновляем интерфейс
        const categoryEl = document.getElementById('question-category');
        const textEl = document.getElementById('question-text');
        const numberEl = document.getElementById('question-number');
        
        if (categoryEl) categoryEl.textContent = question.category;
        if (textEl) textEl.textContent = question.question;
        if (numberEl) numberEl.textContent = 
            `Вопрос ${questionIndex + 1}/${gameData.totalQuestions}`;
        
        // Запускаем таймер
        startQuestionTimer(question.time || 30);
        
    }).catch(error => {
        console.error('Ошибка загрузки вопроса:', error);
    });
}

function startQuestionTimer(seconds) {
    // Очищаем предыдущий таймер
    if (currentTimer) {
        clearInterval(currentTimer);
    }
    
    let timeLeft = seconds;
    const timerEl = document.getElementById('question-timer');
    if (!timerEl) return;
    
    timerEl.textContent = timeLeft;
    timerEl.style.background = '#ef4444';
    timerEl.style.animation = '';
    
    currentTimer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        
        if (timeLeft <= 10) {
            timerEl.style.animation = 'pulse 0.5s infinite';
        }
        
        if (timeLeft <= 0) {
            clearInterval(currentTimer);
            currentTimer = null;
            // Автоматически переходим к результатам
            if (gameRef) {
                gameRef.update({ state: 'results' });
            }
        }
    }, 1000);
}

function showResults(gameData, questionIndex) {
    showScreen('results-screen');
    
    gameRef.child(`questions/${questionIndex}`).once('value').then(qSnapshot => {
        const question = qSnapshot.val();
        if (!question) return;
        
        // Получаем ответы игроков
        playersRef.once('value').then(pSnapshot => {
            const players = pSnapshot.val() || {};
            
            // Считаем статистику
            const stats = [0, 0, 0, 0];
            Object.values(players).forEach(player => {
                if (player.answers && player.answers[questionIndex] !== undefined) {
                    const answer = player.answers[questionIndex];
                    if (answer >= 0 && answer < 4) {
                        stats[answer]++;
                    }
                }
            });
            
            const total = stats.reduce((a, b) => a + b, 0);
            
            // Показываем статистику
            let html = '';
            question.options.forEach((option, i) => {
                const count = stats[i];
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                const isCorrect = i === question.correct;
                
                html += `
                    <div class="stat-row">
                        <div class="stat-label">
                            <div class="answer-letter">${String.fromCharCode(65 + i)}</div>
                            <span style="flex: 1;">${option}</span>
                            ${isCorrect ? '<span style="background: #10b981; color: white; padding: 5px 10px; border-radius: 10px; font-size: 12px;">✓ Правильный</span>' : ''}
                        </div>
                        <div class="stat-bar">
                            <div class="bar-fill" style="width: ${Math.max(10, percent)}%">
                                ${count} (${percent}%)
                            </div>
                        </div>
                    </div>
                `;
            });
            
            const statsContent = document.getElementById('stats-content');
            if (statsContent) {
                statsContent.innerHTML = html;
            }
            
        });
    });
}

function showFinalResults() {
    playersRef.once('value').then(snapshot => {
        const players = snapshot.val() || {};
        const sorted = Object.values(players).sort((a, b) => (b.score || 0) - (a.score || 0));
        
        let html = '<h2 style="margin-bottom: 20px;"><i class="fas fa-trophy"></i> Финальные результаты</h2>';
        sorted.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            html += `
                <div class="player-item" style="margin-bottom: 10px;">
                    <div class="player-avatar">${player.name?.charAt(0) || '?'}</div>
                    <div class="player-info">
                        <div class="player-name">${index + 1}. ${player.name || 'Игрок'} ${medal}</div>
                        <div class="player-score">${player.score || 0} очков</div>
                    </div>
                </div>
            `;
        });
        
        const statsContent = document.getElementById('stats-content');
        if (statsContent) {
            statsContent.innerHTML = html;
        }
        showScreen('results-screen');
    });
}

// === УПРАВЛЕНИЕ ИГРОЙ ===
function startGame() {
    console.log('Начинаем игру');
    
    if (!gameRef) {
        alert('Сначала создайте игру!');
        return;
    }
    
    gameRef.update({ 
        state: 'question',
        currentQuestion: 0,
        startedAt: Date.now()
    }).then(() => {
        console.log('Игра начата');
    }).catch(error => {
        console.error('Ошибка начала игры:', error);
        alert('Ошибка: ' + error.message);
    });
}

function nextQuestion() {
    console.log('Следующий вопрос');
    
    if (!gameRef) return;
    
    gameRef.once('value').then(snapshot => {
        const game = snapshot.val();
        const nextIndex = (game.currentQuestion || 0) + 1;
        
        if (nextIndex < (game.totalQuestions || 10)) {
            gameRef.update({ 
                state: 'question',
                currentQuestion: nextIndex
            }).then(() => {
                console.log('Переход к вопросу', nextIndex);
            });
        } else {
            gameRef.update({ state: 'finished' }).then(() => {
                console.log('Игра завершена');
            });
        }
    }).catch(error => {
        console.error('Ошибка перехода:', error);
        alert('Ошибка: ' + error.message);
    });
}

function endGame() {
    if (confirm('Завершить игру досрочно?')) {
        if (gameRef) {
            gameRef.update({ state: 'finished' }).then(() => {
                console.log('Игра завершена досрочно');
            });
        }
    }
}

// === РЕЖИМ УЧЕНИКА ===
function findActiveGame() {
    console.log('Ищем активную игру...');
    
    database.ref('activeGame').once('value').then(snapshot => {
        const gameCode = snapshot.val();
        if (gameCode) {
            console.log('Найдена игра:', gameCode);
            joinAsStudent(gameCode);
        } else {
            showError('Нет активной игры. Попросите учителя создать игру.');
        }
    }).catch(error => {
        console.error('Ошибка поиска игры:', error);
        showError('Ошибка подключения к серверу');
    });
}

function joinAsStudent(gameCode) {
    console.log('Подключаем ученика к игре:', gameCode);
    
    currentGame = gameCode;
    gameRef = database.ref(`games/${gameCode}`);
    playersRef = gameRef.child('players');
    
    // Генерируем ID игрока
    const playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Сохраняем игрока
    playersRef.child(playerId).set({
        id: playerId,
        name: userName,
        score: 0,
        joinedAt: Date.now(),
        answers: {}
    }).then(() => {
        console.log('Ученик подключен:', userName);
        
        // Показываем экран ожидания ученика
        renderStudentWaiting();
        
        // Слушаем состояние игры
        gameRef.on('value', handleStudentGameState);
        
        // Сохраняем ID игрока
        localStorage.setItem('playerId', playerId);
        
    }).catch(error => {
        console.error('Ошибка подключения:', error);
        showError('Не удалось подключиться к игре');
    });
}

function renderStudentWaiting() {
    document.body.innerHTML = `
        <div class="student-container">
            <div class="student-header">
                <i class="fas fa-mobile-alt"></i>
                <h1>Brain Quiz</h1>
                <p>Игрок: ${userName}</p>
            </div>
            
            <div class="student-content">
                <div class="waiting-screen">
                    <div class="waiting-icon">
                        <i class="fas fa-hourglass-half"></i>
                    </div>
                    <div class="waiting-message">
                        <h2>Ожидание начала игры...</h2>
                        <p>Учитель скоро запустит вопросы</p>
                    </div>
                    <div class="loading-dots">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function handleStudentGameState(snapshot) {
    const gameData = snapshot.val();
    if (!gameData) return;
    
    const state = gameData.state;
    const currentQ = gameData.currentQuestion || 0;
    
    console.log('Состояние игры (ученик):', state, 'вопрос:', currentQ);
    
    switch(state) {
        case 'waiting':
            renderStudentWaiting();
            break;
            
        case 'question':
            showStudentQuestion(gameData, currentQ);
            break;
            
        case 'results':
            showStudentResults(gameData, currentQ);
            break;
            
        case 'finished':
            showStudentFinalResults(gameData);
            break;
    }
}

function showStudentQuestion(gameData, questionIndex) {
    console.log('Показываем вопрос ученику:', questionIndex);
    
    gameRef.child(`questions/${questionIndex}`).once('value').then(snapshot => {
        const question = snapshot.val();
        if (!question) return;
        
        document.body.innerHTML = `
            <div class="student-container">
                <div class="student-header">
                    <div class="timer-circle" id="student-timer">${question.time || 30}</div>
                    <p>Вопрос ${questionIndex + 1}/${gameData.totalQuestions}</p>
                </div>
                
                <div class="student-content">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h3 style="font-size: 20px; opacity: 0.9; margin-bottom: 10px;">${question.category}</h3>
                        <p style="font-size: 18px; opacity: 0.8;">Выберите правильный ответ:</p>
                    </div>
                    
                    <div class="answer-buttons">
                        ${question.options.map((option, i) => `
                            <button class="answer-btn answer-btn-${i + 1}" 
                                    data-answer="${i}" data-question="${questionIndex}">
                                <div class="answer-letter">${String.fromCharCode(65 + i)}</div>
                                <div class="answer-text">${option}</div>
                            </button>
                        `).join('')}
                    </div>
                    
                    <div style="margin-top: 20px; text-align: center; opacity: 0.7;">
                        <i class="fas fa-clock"></i> Время на ответ: ${question.time || 30} сек
                    </div>
                </div>
            </div>
            
            <script>
                // Привязываем обработчики кнопок
                setTimeout(() => {
                    const buttons = document.querySelectorAll('.answer-btn');
                    buttons.forEach(btn => {
                        btn.addEventListener('click', function() {
                            const answerIndex = parseInt(this.getAttribute('data-answer'));
                            const questionIndex = parseInt(this.getAttribute('data-question'));
                            console.log('Выбран ответ:', answerIndex, 'на вопрос:', questionIndex);
                            
                            // Отключаем все кнопки
                            buttons.forEach(b => {
                                b.disabled = true;
                                b.style.opacity = '0.7';
                                b.style.cursor = 'not-allowed';
                            });
                            
                            // Подсвечиваем выбранную
                            this.style.transform = 'scale(0.95)';
                            this.style.boxShadow = 'inset 0 0 20px rgba(255,255,255,0.5)';
                            
                            // Вызываем глобальную функцию
                            if (window.submitStudentAnswer) {
                                window.submitStudentAnswer(answerIndex, questionIndex);
                            }
                        });
                    });
                    
                    console.log('Кнопки ответов привязаны');
                }, 100);
            </script>
        `;
        
        // Делаем функцию глобальной
        window.submitStudentAnswer = submitStudentAnswer;
        
        // Запускаем таймер
        startStudentTimer(question.time || 30);
        
    }).catch(error => {
        console.error('Ошибка загрузки вопроса:', error);
    });
}

function submitStudentAnswer(answerIndex, questionIndex) {
    console.log('Отправка ответа:', answerIndex, 'на вопрос:', questionIndex);
    
    const playerId = localStorage.getItem('playerId');
    if (!playerId || !playersRef) {
        console.error('Нет ID игрока или ссылки на игроков');
        return;
    }
    
    // Сохраняем ответ
    playersRef.child(playerId).child('answers').child(questionIndex).set(answerIndex)
        .then(() => {
            console.log('Ответ сохранен');
        })
        .catch(error => {
            console.error('Ошибка сохранения ответа:', error);
        });
}

function startStudentTimer(seconds) {
    // Очищаем предыдущий таймер
    if (currentTimer) {
        clearInterval(currentTimer);
    }
    
    let timeLeft = seconds;
    const timerEl = document.getElementById('student-timer');
    if (!timerEl) return;
    
    currentTimer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        
        if (timeLeft <= 10) {
            timerEl.style.borderColor = '#ef4444';
            timerEl.style.color = '#ef4444';
        }
        
        if (timeLeft <= 0) {
            clearInterval(currentTimer);
            currentTimer = null;
        }
    }, 1000);
}

function showStudentResults(gameData, questionIndex) {
    const playerId = localStorage.getItem('playerId');
    
    gameRef.child(`questions/${questionIndex}`).once('value').then(qSnapshot => {
        const question = qSnapshot.val();
        if (!question) return;
        
        // Получаем ответ игрока
        playersRef.child(playerId).once('value').then(pSnapshot => {
            const player = pSnapshot.val();
            const playerAnswer = player?.answers?.[questionIndex];
            const isCorrect = playerAnswer === question.correct;
            const points = isCorrect ? 100 : 0;
            
            // Обновляем счет
            if (isCorrect && player) {
                const newScore = (player.score || 0) + points;
                playersRef.child(playerId).update({ score: newScore });
            }
            
            // Показываем результат
            document.body.innerHTML = `
                <div class="student-container">
                    <div class="student-content">
                        <div class="result-screen ${isCorrect ? 'result-correct' : 'result-wrong'}">
                            <div class="result-icon">
                                ${isCorrect ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-times-circle"></i>'}
                            </div>
                            <h2>${isCorrect ? 'Правильно! 🎉' : 'Неправильно 😕'}</h2>
                            <p>${isCorrect ? 'Отличный ответ!' : 'Правильный ответ: ' + String.fromCharCode(65 + question.correct)}</p>
                            
                            <div class="result-points">
                                <h3>Получено очков:</h3>
                                <div class="points-value">${isCorrect ? '+100' : '0'}</div>
                            </div>
                            
                            <div style="margin-top: 30px; opacity: 0.8;">
                                <i class="fas fa-hourglass-half"></i> Следующий вопрос скоро...
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
        });
    });
}

function showStudentFinalResults(gameData) {
    const playerId = localStorage.getItem('playerId');
    
    playersRef.once('value').then(snapshot => {
        const players = snapshot.val() || {};
        const sorted = Object.values(players).sort((a, b) => (b.score || 0) - (a.score || 0));
        
        document.body.innerHTML = `
            <div class="student-container">
                <div class="student-header">
                    <i class="fas fa-trophy"></i>
                    <h1>Игра завершена!</h1>
                </div>
                
                <div class="student-content">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2>Ваш результат</h2>
                        <div style="font-size: 48px; font-weight: 800; color: #fbbf24; margin: 20px 0;">
                            ${players[playerId]?.score || 0} очков
                        </div>
                    </div>
                    
                    <div style="width: 100%;">
                        <h3 style="margin-bottom: 15px;"><i class="fas fa-crown"></i> Рейтинг игроков:</h3>
                        ${sorted.map((player, index) => `
                            <div class="ranking-item ${player.id === playerId ? 'current-player' : ''}">
                                <div class="rank-number">${index + 1}</div>
                                <div class="player-name-student">${player.name}</div>
                                <div class="player-score-student">${player.score || 0}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center;">
                        <button onclick="location.reload()" class="control-btn btn-primary" 
                                style="margin-top: 20px; width: 100%;">
                            <i class="fas fa-redo"></i> Играть снова
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
function showError(message) {
    alert(message);
}
