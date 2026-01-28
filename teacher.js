// === ОБЩИЕ ПЕРЕМЕННЫЕ ===
let database;
let gameRef;
let playersRef;
let currentGame = null;
let userName = '';
let userRole = '';

// === ВОПРОСЫ ДЛЯ ИГРЫ ===
const quizQuestions = [
    {
        id: 1,
        category: "Устное собеседование",
        question: "Что важно сделать перед чтением текста вслух на собеседовании?",
        options: [
            "Бегло просмотреть текст, отметить ключевые мысли",
            "Сразу начать читать, чтобы сэкономить время",
            "Выписать все незнакомые слова",
            "Продумать интонацию только для первого абзаца"
        ],
        correct: 0,
        time: 30
    },
    {
        id: 2,
        category: "Устное собеседование",
        question: "При пересказе текста с цитатой необходимо:",
        options: [
            "Сначала пересказать текст, потом добавить цитату",
            "Вписать цитату в пересказ логично и уместно",
            "Оставить цитату на конец",
            "Игнорировать цитату, если она сложная"
        ],
        correct: 1,
        time: 30
    },
    {
        id: 3,
        category: "ОГЭ",
        question: "В каком слове пишется удвоенная согласная?",
        options: [
            "Ап...етит",
            "Кол...ективный",
            "Ил...юстрация",
            "Ас...оциация"
        ],
        correct: 1,
        time: 20
    },
    {
        id: 4,
        category: "ОГЭ",
        question: "Где нужно поставить запятую? «Я вышел на улицу (1) и (2) когда увидел радугу (3) сразу улыбнулся».",
        options: [
            "1, 2",
            "2, 3",
            "1, 3",
            "1, 2, 3"
        ],
        correct: 2,
        time: 20
    },
    {
        id: 5,
        category: "ОГЭ",
        question: "Какое средство выразительности использовано: «Время летит стрелой»?",
        options: [
            "Сравнение",
            "Метафора",
            "Гипербола",
            "Олицетворение"
        ],
        correct: 1,
        time: 15
    },
    {
        id: 6,
        category: "Устное собеседование",
        question: "Какая структура рекомендуется для монолога-описания фотографии?",
        options: [
            "Начать с планов на будущее",
            "Описать место, время, объекты, свои чувства",
            "Только перечислить предметы на фото",
            "Сравнить фотографию с другими"
        ],
        correct: 1,
        time: 30
    },
    {
        id: 7,
        category: "ОГЭ",
        question: "Какое предложение является сложносочинённым?",
        options: [
            "Я знаю, что ты сделал.",
            "Небо прояснилось, и выглянуло солнце.",
            "Человек, который пришёл, был знаком.",
            "Устав, он прилёг отдохнуть."
        ],
        correct: 1,
        time: 15
    },
    {
        id: 8,
        category: "ОГЭ",
        question: "Какой стиль используется в научных статьях?",
        options: [
            "Разговорный",
            "Художественный",
            "Научный",
            "Официально-деловой"
        ],
        correct: 2,
        time: 15
    },
    {
        id: 9,
        category: "Устное собеседование",
        question: "Во время диалога с экзаменатором важно:",
        options: [
            "Отвечать односложно",
            "Поддерживать беседу, задавать вопросы",
            "Говорить без пауз",
            "Спорить с экзаменатором"
        ],
        correct: 1,
        time: 25
    },
    {
        id: 10,
        category: "ОГЭ",
        question: "Выберите правильный вариант:",
        options: [
            "Преветствовать",
            "Приветствовать",
            "Преветсвовать",
            "Приветсвовать"
        ],
        correct: 1,
        time: 15
    }
];

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем роль из localStorage
    userRole = localStorage.getItem('userRole');
    
    if (!userRole) {
        // Если нет роли, возвращаем на главную
        window.location.href = 'index.html';
        return;
    }
    
    // Инициализируем Firebase
    try {
        firebase.initializeApp(firebaseConfig);
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
    
    // Ищем активную игру или создаем новую
    checkActiveGame();
}

function renderTeacherUI() {
    const app = document.getElementById('teacher-app') || document.body;
    app.innerHTML = `
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
    `;
    
    // Привязываем обработчики
    setupTeacherHandlers();
}

function setupTeacherHandlers() {
    // Слайдер количества вопросов
    const qCountSlider = document.getElementById('question-count');
    const qCountDisplay = document.getElementById('q-count');
    if (qCountSlider) {
        qCountSlider.addEventListener('input', () => {
            qCountDisplay.textContent = qCountSlider.value;
        });
    }
    
    // Кнопка создания игры
    document.getElementById('create-game-btn')?.addEventListener('click', createGame);
    
    // Кнопки управления игрой
    document.getElementById('start-game-btn')?.addEventListener('click', startGame);
    document.getElementById('next-question-btn')?.addEventListener('click', nextQuestion);
    document.getElementById('end-game-btn')?.addEventListener('click', endGame);
}

// === РЕЖИМ УЧЕНИКА ===
function initStudentMode() {
    // Запрашиваем имя пользователя
    showNameInput();
}

function showNameInput() {
    const app = document.getElementById('student-app') || document.body;
    app.innerHTML = `
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
    `;
    
    // Фокус на поле ввода
    document.getElementById('student-name')?.focus();
    
    // Обработчик кнопки
    document.getElementById('join-game-btn')?.addEventListener('click', joinGame);
}

function joinGame() {
    const nameInput = document.getElementById('student-name');
    userName = nameInput.value.trim();
    
    if (!userName) {
        alert('Пожалуйста, введите ваше имя!');
        nameInput.focus();
        return;
    }
    
    // Ищем активную игру
    findActiveGame();
}

// === ОБЩАЯ ЛОГИКА FIREBASE ===
function checkActiveGame() {
    // Проверяем, есть ли активная игра в базе
    database.ref('activeGame').once('value').then(snapshot => {
        const activeGame = snapshot.val();
        if (activeGame) {
            // Подключаемся к существующей игре
            connectToGame(activeGame);
        }
    });
}

function createGame() {
    const gameName = document.getElementById('game-name').value || 'Игра';
    const questionCount = parseInt(document.getElementById('question-count').value);
    
    // Генерируем код игры
    const gameCode = Math.floor(1000 + Math.random() * 9000).toString();
    currentGame = gameCode;
    
    // Сохраняем как активную игру
    database.ref('activeGame').set(gameCode);
    
    // Создаем структуру игры
    gameRef = database.ref(`games/${gameCode}`);
    
    // Выбираем случайные вопросы
    const selectedQuestions = [...quizQuestions]
        .sort(() => Math.random() - 0.5)
        .slice(0, questionCount)
        .map((q, i) => ({ ...q, number: i + 1 }));
    
    // Сохраняем настройки игры
    gameRef.set({
        name: gameName,
        code: gameCode,
        state: 'waiting',
        currentQuestion: 0,
        totalQuestions: questionCount,
        createdAt: Date.now(),
        teacherConnected: true
    }).then(() => {
        // Сохраняем вопросы
        return gameRef.child('questions').set(selectedQuestions);
    }).then(() => {
        console.log('Игра создана:', gameCode);
        
        // Показываем экран ожидания
        showScreen('waiting-screen');
        document.getElementById('game-controls').classList.remove('hidden');
        document.getElementById('create-game-card').classList.add('hidden');
        
        // Обновляем статус
        updateGameStatus('Ожидание игроков');
        
        // Начинаем слушать игроков
        playersRef = gameRef.child('players');
        playersRef.on('value', updatePlayersList);
        
        // Слушаем изменения игры
        gameRef.on('value', handleGameState);
        
    }).catch(error => {
        console.error('Ошибка создания игры:', error);
        alert('Ошибка: ' + error.message);
    });
}

function findActiveGame() {
    database.ref('activeGame').once('value').then(snapshot => {
        const gameCode = snapshot.val();
        if (gameCode) {
            connectToGame(gameCode);
        } else {
            showError('Нет активной игры. Попросите учителя создать игру.');
        }
    });
}

function connectToGame(gameCode) {
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
        
        if (userRole === 'teacher') {
            // Учитель подключается к игре
            showScreen('waiting-screen');
            updateGameStatus('Подключено');
            
            // Слушаем игроков и состояние
            playersRef.on('value', updatePlayersList);
            gameRef.on('value', handleGameState);
            
        } else {
            // Ученик подключается к игре
            joinAsStudent(gameData);
        }
    });
}

function joinAsStudent(gameData) {
    // Генерируем ID игрока
    const playerId = 'player_' + Date.now() + Math.random().toString(36).substr(2, 9);
    
    // Сохраняем игрока
    playersRef.child(playerId).set({
        id: playerId,
        name: userName,
        score: 0,
        joinedAt: Date.now(),
        answers: {}
    }).then(() => {
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

// === ОБРАБОТКА СОСТОЯНИЙ ИГРЫ ===
function handleGameState(snapshot) {
    const gameData = snapshot.val();
    if (!gameData) return;
    
    const state = gameData.state;
    const currentQ = gameData.currentQuestion || 0;
    
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

function handleStudentGameState(snapshot) {
    const gameData = snapshot.val();
    if (!gameData) return;
    
    const state = gameData.state;
    const currentQ = gameData.currentQuestion || 0;
    
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

// === ПОМОЩНИКИ ДЛЯ УЧИТЕЛЯ ===
function updateGameStatus(status) {
    const el = document.getElementById('game-status-display');
    if (el) el.querySelector('strong').textContent = status;
}

function updatePlayerCount(count) {
    const el = document.getElementById('player-count-display');
    if (el) el.querySelector('strong').textContent = count;
}

function updateQuestionNumber(current, total) {
    const el = document.getElementById('question-number-display');
    if (el) el.querySelector('strong').textContent = `${current}/${total}`;
}

function showScreen(screenId) {
    // Скрываем все экраны
    ['question-screen', 'results-screen', 'waiting-screen'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    
    // Показываем нужный экран
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.remove('hidden');
}

function updatePlayersList(snapshot) {
    const players = snapshot.val() || {};
    const count = Object.keys(players).length;
    
    updatePlayerCount(count);
    
    const container = document.getElementById('players-container');
    if (!container) return;
    
    if (count === 0) {
        container.innerHTML = '<p class="empty">Игроки появятся здесь</p>';
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
    document.getElementById('players-count').textContent = count;
}

function showQuestion(gameData, questionIndex) {
    showScreen('question-screen');
    
    gameRef.child(`questions/${questionIndex}`).once('value').then(snapshot => {
        const question = snapshot.val();
        if (!question) return;
        
        // Обновляем интерфейс
        document.getElementById('question-category').textContent = question.category;
        document.getElementById('question-text').textContent = question.question;
        document.getElementById('question-number').textContent = 
            `Вопрос ${questionIndex + 1}/${gameData.totalQuestions}`;
        
        // Запускаем таймер
        startQuestionTimer(question.time || 30);
        
    }).catch(error => {
        console.error('Ошибка загрузки вопроса:', error);
    });
}

function startQuestionTimer(seconds) {
    let timeLeft = seconds;
    const timerEl = document.getElementById('question-timer');
    if (!timerEl) return;
    
    timerEl.textContent = timeLeft;
    timerEl.style.background = '#ef4444';
    
    const timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        
        if (timeLeft <= 10) {
            timerEl.style.animation = 'pulse 0.5s infinite';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // Автоматически переходим к результатам
            gameRef.update({ state: 'results' });
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
            
            document.getElementById('stats-content').innerHTML = html;
            
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
        
        document.getElementById('stats-content').innerHTML = html;
        showScreen('results-screen');
    });
}

// === УПРАВЛЕНИЕ ИГРОЙ ===
function startGame() {
    if (!gameRef) return;
    gameRef.update({ 
        state: 'question',
        currentQuestion: 0,
        startedAt: Date.now()
    });
}

function nextQuestion() {
    if (!gameRef) return;
    
    gameRef.once('value').then(snapshot => {
        const game = snapshot.val();
        const nextIndex = (game.currentQuestion || 0) + 1;
        
        if (nextIndex < (game.totalQuestions || 10)) {
            gameRef.update({ 
                state: 'question',
                currentQuestion: nextIndex
            });
        } else {
            gameRef.update({ state: 'finished' });
        }
    });
}

function endGame() {
    if (confirm('Завершить игру досрочно?')) {
        gameRef.update({ state: 'finished' });
    }
}

// === РЕЖИМ УЧЕНИКА ===
function renderStudentWaiting() {
    const app = document.getElementById('student-app') || document.body;
    app.innerHTML = `
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

function showStudentQuestion(gameData, questionIndex) {
    gameRef.child(`questions/${questionIndex}`).once('value').then(snapshot => {
        const question = snapshot.val();
        if (!question) return;
        
        const app = document.getElementById('student-app') || document.body;
        app.innerHTML = `
            <div class="student-container">
                <div class="student-header">
                    <div class="timer-circle">${question.time || 30}</div>
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
                                    onclick="submitAnswer(${i}, ${questionIndex})">
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
        `;
        
        // Запускаем таймер
        startStudentTimer(question.time || 30);
        
    }).catch(error => {
        console.error('Ошибка загрузки вопроса:', error);
    });
}

function startStudentTimer(seconds) {
    let timeLeft = seconds;
    const timerEl = document.querySelector('.timer-circle');
    if (!timerEl) return;
    
    const timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        
        if (timeLeft <= 10) {
            timerEl.style.borderColor = '#ef4444';
            timerEl.style.color = '#ef4444';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);
}

function submitAnswer(answerIndex, questionIndex) {
    const playerId = localStorage.getItem('playerId');
    if (!playerId || !playersRef) return;
    
    // Отключаем все кнопки
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.7';
    });
    
    // Подсвечиваем выбранный ответ
    const selectedBtn = document.querySelector(`.answer-btn-${answerIndex + 1}`);
    if (selectedBtn) {
        selectedBtn.style.transform = 'scale(0.95)';
        selectedBtn.style.boxShadow = 'inset 0 0 20px rgba(255,255,255,0.5)';
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
            if (isCorrect) {
                const newScore = (player.score || 0) + points;
                playersRef.child(playerId).update({ score: newScore });
            }
            
            // Показываем результат
            const app = document.getElementById('student-app') || document.body;
            app.innerHTML = `
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
        
        const app = document.getElementById('student-app') || document.body;
        app.innerHTML = `
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

// Экспортируем функции для использования в HTML
window.submitAnswer = submitAnswer;
