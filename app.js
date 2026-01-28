// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let database;
let gameRef;
let playersRef;
let currentGame = null;
let userName = '';
let userRole = '';
let currentTimer = null;
let currentQuestionIndex = 0;

// ===== ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Brain Quiz загружен');
    
    try {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        console.log('✅ Firebase подключен');
        
        showMainPage();
    } catch (error) {
        console.error('❌ Ошибка Firebase:', error);
        showError('Не удалось подключиться к серверу');
    }
});

// ===== ГЛАВНАЯ СТРАНИЦА =====
function showMainPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="role-page">
            <div class="container">
                <header class="main-header">
                    <div class="logo">
                        <i class="fas fa-brain"></i>
                        <h1>Brain Quiz</h1>
                        <p class="tagline">Интерактивный тренажер для класса</p>
                    </div>
                </header>

                <main class="main-content">
                    <div class="role-selector">
                        <div class="role-card teacher-card">
                            <div class="role-icon">
                                <i class="fas fa-chalkboard-teacher"></i>
                            </div>
                            <div class="role-info">
                                <h2>Режим учителя</h2>
                                <p class="role-desc">Для смарт-доски или компьютера</p>
                                <ul class="role-features">
                                    <li><i class="fas fa-check"></i> Создание игр</li>
                                    <li><i class="fas fa-check"></i> Управление вопросами</li>
                                    <li><i class="fas fa-check"></i> Показ статистики</li>
                                </ul>
                            </div>
                            <button class="role-btn" id="teacher-btn">
                                <i class="fas fa-play"></i> Запустить как учитель
                            </button>
                        </div>

                        <div class="role-card student-card">
                            <div class="role-icon">
                                <i class="fas fa-mobile-alt"></i>
                            </div>
                            <div class="role-info">
                                <h2>Режим ученика</h2>
                                <p class="role-desc">Для телефонов и планшетов</p>
                                <ul class="role-features">
                                    <li><i class="fas fa-check"></i> Цветные кнопки ответов</li>
                                    <li><i class="fas fa-check"></i> Подсчет очков</li>
                                    <li><i class="fas fa-check"></i> Рейтинг игроков</li>
                                </ul>
                            </div>
                            <button class="role-btn" id="student-btn">
                                <i class="fas fa-play"></i> Подключиться как ученик
                            </button>
                        </div>
                    </div>

                    <div class="instructions">
                        <h3><i class="fas fa-info-circle"></i> Как работает:</h3>
                        <div class="steps">
                            <div class="step">
                                <div class="step-num">1</div>
                                <p><strong>Учитель</strong> запускает игру на доске</p>
                            </div>
                            <div class="step">
                                <div class="step-num">2</div>
                                <p><strong>Ученики</strong> заходят на сайт с телефонов</p>
                            </div>
                            <div class="step">
                                <div class="step-num">3</div>
                                <p><strong>На доске</strong> показывается вопрос</p>
                            </div>
                            <div class="step">
                                <div class="step-num">4</div>
                                <p><strong>На телефонах</strong> — кнопки ответов</p>
                            </div>
                        </div>
                    </div>
                </main>

                <footer class="main-footer">
                    <p><i class="fas fa-bolt"></i> Все в одной комнате • Автоматический запуск • Не нужны коды</p>
                </footer>
            </div>
        </div>
    `;
    
    // Привязываем обработчики кнопок
    setTimeout(() => {
        document.getElementById('teacher-btn').addEventListener('click', function() {
            userRole = 'teacher';
            showTeacherMode();
        });
        
        document.getElementById('student-btn').addEventListener('click', function() {
            userRole = 'student';
            showStudentNameInput();
        });
        
        console.log('✅ Кнопки главной страницы готовы');
    }, 100);
}

// ===== РЕЖИМ УЧИТЕЛЯ =====
function showTeacherMode() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="teacher-header">
            <div class="container">
                <div class="logo">
                    <button onclick="showMainPage()" class="back-btn">
                        <i class="fas fa-arrow-left"></i> На главную
                    </button>
                    <i class="fas fa-chalkboard-teacher"></i>
                    <h1>Brain Quiz - Режим учителя</h1>
                    <p class="subtitle">Вопросы на доске, ответы на телефонах</p>
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
                        <span>Вопрос: <strong>-/-</strong></span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="teacher-content">
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
                        <input type="range" id="question-count" min="5" max="20" value="10" 
                               class="slider">
                    </div>
                    <button class="control-btn btn-primary" id="create-game-btn">
                        <i class="fas fa-rocket"></i> Создать игру
                    </button>
                </div>
                
                <div class="control-card hidden" id="game-controls">
                    <h3><i class="fas fa-cogs"></i> Управление игрой</h3>
                    <button class="control-btn btn-success" id="start-game-btn">
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
            
            <div class="teacher-display">
                <div class="screen active" id="welcome-screen">
                    <div class="welcome-content">
                        <div class="welcome-icon">
                            <i class="fas fa-chalkboard-teacher"></i>
                        </div>
                        <h2>Режим для смарт-доски</h2>
                        <p>Создайте игру и покажите вопросы классу</p>
                        <div class="teacher-steps">
                            <div class="teacher-step">
                                <div class="step-number">1</div>
                                <h3>Создайте игру</h3>
                                <p>Заполните форму слева</p>
                            </div>
                            <div class="teacher-step">
                                <div class="step-number">2</div>
                                <h3>Подключите учеников</h3>
                                <p>Они заходят на сайт с телефонов</p>
                            </div>
                            <div class="teacher-step">
                                <div class="step-number">3</div>
                                <h3>Начните игру</h3>
                                <p>Нажмите "Начать игру"</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="screen hidden" id="waiting-screen">
                    <div class="waiting-content">
                        <div class="waiting-icon">
                            <i class="fas fa-hourglass-half"></i>
                        </div>
                        <h2>Ожидание игроков</h2>
                        <p>Попросите учеников подключиться</p>
                        
                        <div class="players-waiting">
                            <i class="fas fa-users"></i>
                            <span><strong id="big-player-count">0</strong> игроков в комнате</span>
                        </div>
                        
                        <div class="instructions">
                            <h4><i class="fas fa-mobile-alt"></i> Как подключиться ученикам:</h4>
                            <ul>
                                <li>Откройте сайт на телефоне</li>
                                <li>Выберите "Режим ученика"</li>
                                <li>Введите своё имя</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="screen hidden" id="question-screen">
                    <div class="question-header">
                        <div class="question-meta">
                            <span class="category" id="question-category">Устное собеседование</span>
                            <div class="timer-box">
                                <i class="fas fa-clock"></i>
                                <span id="question-timer">30</span>
                            </div>
                        </div>
                        <div class="question-number">
                            Вопрос <span id="current-question">1</span> из <span id="total-questions">10</span>
                        </div>
                    </div>
                    
                    <div class="question-text-large" id="question-text">
                        Вопрос появится после начала игры
                    </div>
                </div>
                
                <div class="screen hidden" id="results-screen">
                    <div class="results-header">
                        <h2><i class="fas fa-chart-bar"></i> Результаты ответа</h2>
                    </div>
                    
                    <div class="stats-container" id="stats-container">
                        <!-- Статистика появится здесь -->
                    </div>
                    
                    <div class="quick-leaderboard">
                        <h3><i class="fas fa-trophy"></i> Текущие лидеры</h3>
                        <div id="quick-leaderboard">
                            <!-- Лидерборд появится здесь -->
                        </div>
                    </div>
                </div>
                
                <div class="screen hidden" id="final-screen">
                    <div class="final-content">
                        <div class="trophy">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <h2>Игра завершена!</h2>
                        
                        <div class="final-leaderboard" id="final-leaderboard">
                            <!-- Финальный лидерборд появится здесь -->
                        </div>
                        
                        <button class="btn btn-primary" id="new-game-btn">
                            <i class="fas fa-plus"></i> Новая игра
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    setupTeacherHandlers();
    checkActiveGame();
}

function setupTeacherHandlers() {
    // Слайдер количества вопросов
    const qCountSlider = document.getElementById('question-count');
    const qCountDisplay = document.getElementById('q-count');
    if (qCountSlider && qCountDisplay) {
        qCountSlider.addEventListener('input', () => {
            qCountDisplay.textContent = qCountSlider.value;
        });
    }
    
    // Кнопка создания игры
    document.getElementById('create-game-btn').addEventListener('click', createGame);
    
    // Кнопки управления игрой
    document.getElementById('start-game-btn').addEventListener('click', startGame);
    document.getElementById('next-question-btn').addEventListener('click', nextQuestion);
    document.getElementById('end-game-btn').addEventListener('click', endGame);
    
    // Кнопка новой игры
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => location.reload());
    }
}

// ===== ФУНКЦИИ УЧИТЕЛЯ =====
function createGame() {
    console.log('Создание игры...');
    
    const gameName = document.getElementById('game-name').value || 'Игра';
    const questionCount = parseInt(document.getElementById('question-count').value || 10);
    
    // Генерируем код игры
    const gameCode = Math.floor(1000 + Math.random() * 9000).toString();
    currentGame = gameCode;
    
    // Сохраняем как активную игру
    database.ref('activeGame').set(gameCode)
        .then(() => {
            gameRef = database.ref(`games/${gameCode}`);
            
            // Выбираем случайные вопросы
            const selectedQuestions = [...quizQuestions]
                .sort(() => Math.random() - 0.5)
                .slice(0, questionCount);
            
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
            console.log('✅ Игра создана:', gameCode);
            
            showTeacherScreen('waiting');
            
            const gameControls = document.getElementById('game-controls');
            const createGameCard = document.getElementById('create-game-card');
            
            if (gameControls) gameControls.classList.remove('hidden');
            if (createGameCard) createGameCard.classList.add('hidden');
            
            updateGameStatus('Ожидание игроков');
            
            playersRef = gameRef.child('players');
            playersRef.on('value', updatePlayersList);
            
            gameRef.on('value', handleGameState);
            
        })
        .catch(error => {
            console.error('❌ Ошибка создания игры:', error);
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
    
    gameRef.once('value').then(snapshot => {
        if (!snapshot.exists()) {
            showError('Игра не найдена');
            return;
        }
        
        showTeacherScreen('waiting');
        updateGameStatus('Подключено');
        
        const gameControls = document.getElementById('game-controls');
        const createGameCard = document.getElementById('create-game-card');
        
        if (gameControls) gameControls.classList.remove('hidden');
        if (createGameCard) createGameCard.classList.add('hidden');
        
        playersRef.on('value', updatePlayersList);
        gameRef.on('value', handleGameState);
        
    }).catch(error => {
        console.error('❌ Ошибка подключения:', error);
        showError('Не удалось подключиться к игре');
    });
}

function handleGameState(snapshot) {
    const gameData = snapshot.val();
    if (!gameData) return;
    
    const state = gameData.state;
    currentQuestionIndex = gameData.currentQuestion || 0;
    
    const statusMap = {
        'waiting': 'Ожидание',
        'question': 'Вопрос активен',
        'results': 'Результаты',
        'finished': 'Завершено'
    };
    
    updateGameStatus(statusMap[state] || 'Неизвестно');
    updateQuestionNumber(currentQuestionIndex + 1, gameData.totalQuestions);
    
    switch(state) {
        case 'waiting':
            showTeacherScreen('waiting');
            break;
            
        case 'question':
            showTeacherScreen('question');
            loadQuestion(currentQuestionIndex);
            startQuestionTimer();
            break;
            
        case 'results':
            showTeacherScreen('results');
            showQuestionResults(currentQuestionIndex);
            break;
            
        case 'finished':
            showTeacherScreen('final');
            showFinalLeaderboard();
            break;
    }
}

function showTeacherScreen(screenName) {
    const screens = ['welcome-screen', 'waiting-screen', 'question-screen', 'results-screen', 'final-screen'];
    screens.forEach(screen => {
        const el = document.getElementById(screen);
        if (el) el.classList.remove('active', 'hidden');
    });
    
    screens.forEach(screen => {
        const el = document.getElementById(screen);
        if (el) {
            if (screen === `${screenName}-screen`) {
                el.classList.add('active');
                el.classList.remove('hidden');
            } else {
                el.classList.remove('active');
                el.classList.add('hidden');
            }
        }
    });
}

function updateGameStatus(status) {
    const el = document.getElementById('game-status-display');
    if (el) {
        const strong = el.querySelector('strong');
        if (strong) strong.textContent = status;
    }
}

function updatePlayerCount(count) {
    const el = document.getElementById('player-count-display');
    const bigEl = document.getElementById('big-player-count');
    if (el) {
        const strong = el.querySelector('strong');
        if (strong) strong.textContent = count;
    }
    if (bigEl) bigEl.textContent = count;
}

function updateQuestionNumber(current, total) {
    const el = document.getElementById('question-number-display');
    if (el) {
        const strong = el.querySelector('strong');
        if (strong) strong.textContent = `${current}/${total}`;
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

function loadQuestion(questionIndex) {
    if (!gameRef) return;
    
    gameRef.child(`questions/${questionIndex}`).once('value').then(snapshot => {
        const question = snapshot.val();
        if (!question) return;
        
        const categoryEl = document.getElementById('question-category');
        const textEl = document.getElementById('question-text');
        const currentEl = document.getElementById('current-question');
        const totalEl = document.getElementById('total-questions');
        
        if (categoryEl) categoryEl.textContent = question.category;
        if (textEl) textEl.textContent = question.question;
        if (currentEl) currentEl.textContent = questionIndex + 1;
        
        gameRef.once('value').then(gameSnapshot => {
            const gameData = gameSnapshot.val();
            if (totalEl && gameData) {
                totalEl.textContent = gameData.totalQuestions;
            }
        });
        
    }).catch(error => {
        console.error('❌ Ошибка загрузки вопроса:', error);
    });
}

function startQuestionTimer() {
    clearInterval(currentTimer);
    
    let timeLeft = 30;
    const timerEl = document.getElementById('question-timer');
    if (!timerEl) return;
    
    timerEl.textContent = timeLeft;
    timerEl.style.animation = 'pulse 1s infinite';
    
    currentTimer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        
        if (timeLeft <= 10) {
            timerEl.style.color = '#ef4444';
        }
        
        if (timeLeft <= 0) {
            clearInterval(currentTimer);
            if (gameRef) {
                gameRef.update({ state: 'results' });
            }
        }
    }, 1000);
}

function showQuestionResults(questionIndex) {
    if (!gameRef || !playersRef) return;
    
    gameRef.child(`questions/${questionIndex}`).once('value').then(qSnapshot => {
        const question = qSnapshot.val();
        if (!question) return;
        
        playersRef.once('value').then(pSnapshot => {
            const players = pSnapshot.val() || {};
            
            const answerCounts = [0, 0, 0, 0];
            let totalAnswers = 0;
            
            Object.values(players).forEach(player => {
                if (player.answers && player.answers[questionIndex] !== undefined) {
                    const answer = player.answers[questionIndex];
                    if (answer >= 0 && answer < 4) {
                        answerCounts[answer]++;
                        totalAnswers++;
                    }
                }
            });
            
            const statsContainer = document.getElementById('stats-container');
            let statsHtml = '';
            
            question.options.forEach((option, i) => {
                const count = answerCounts[i];
                const percentage = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0;
                const isCorrect = i === question.correct;
                
                statsHtml += `
                    <div class="stat-row">
                        <div class="stat-label">
                            <div class="answer-letter">${String.fromCharCode(65 + i)}</div>
                            <span style="flex: 1;">${option}</span>
                            ${isCorrect ? '<span style="background: #10b981; color: white; padding: 5px 10px; border-radius: 10px; font-size: 12px;">✓ Правильный</span>' : ''}
                        </div>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: ${Math.max(10, percentage)}%">
                                ${count} (${percentage}%)
                            </div>
                        </div>
                    </div>
                `;
            });
            
            if (statsContainer) {
                statsContainer.innerHTML = statsHtml;
            }
            
            showQuickLeaderboard(players);
            
        });
    });
}

function showQuickLeaderboard(players) {
    const sortedPlayers = Object.values(players)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 5);
    
    let html = '';
    sortedPlayers.forEach((player, index) => {
        html += `
            <div class="player-item" style="margin-bottom: 10px;">
                <div class="player-avatar">${player.name?.charAt(0) || '?'}</div>
                <div class="player-info">
                    <div class="player-name">${index + 1}. ${player.name || 'Игрок'}</div>
                    <div class="player-score">${player.score || 0} очков</div>
                </div>
            </div>
        `;
    });
    
    const quickLeaderboard = document.getElementById('quick-leaderboard');
    if (quickLeaderboard) {
        quickLeaderboard.innerHTML = html;
    }
}

function showFinalLeaderboard() {
    if (!playersRef) return;
    
    playersRef.once('value').then(snapshot => {
        const players = snapshot.val() || {};
        const sorted = Object.values(players).sort((a, b) => (b.score || 0) - (a.score || 0));
        
        let html = '';
        sorted.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            html += `
                <div class="player-item" style="margin-bottom: 15px;">
                    <div class="player-avatar">${player.name?.charAt(0) || '?'}</div>
                    <div class="player-info">
                        <div class="player-name">${index + 1}. ${player.name || 'Игрок'} ${medal}</div>
                        <div class="player-score">${player.score || 0} очков</div>
                    </div>
                </div>
            `;
        });
        
        const finalLeaderboard = document.getElementById('final-leaderboard');
        if (finalLeaderboard) {
            finalLeaderboard.innerHTML = html;
        }
    });
}

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
        console.log('✅ Игра начата');
    }).catch(error => {
        console.error('❌ Ошибка начала игры:', error);
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
            });
        } else {
            gameRef.update({ state: 'finished' });
        }
    }).catch(error => {
        console.error('❌ Ошибка перехода:', error);
        alert('Ошибка: ' + error.message);
    });
}

function endGame() {
    if (confirm('Завершить игру досрочно?')) {
        if (gameRef) {
            gameRef.update({ state: 'finished' });
        }
    }
}

// ===== РЕЖИМ УЧЕНИКА =====
function showStudentNameInput() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="student-page">
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
                               placeholder="Введите ваше имя" maxlength="20" autofocus>
                        <button class="control-btn btn-primary" id="join-game-btn">
                            <i class="fas fa-sign-in-alt"></i> Присоединиться к игре
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const joinBtn = document.getElementById('join-game-btn');
    const nameInput = document.getElementById('student-name');
    
    joinBtn.addEventListener('click', joinGame);
    
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            joinGame();
        }
    });
    
    nameInput.focus();
}

function joinGame() {
    const nameInput = document.getElementById('student-name');
    userName = nameInput.value.trim();
    
    if (!userName) {
        alert('Пожалуйста, введите ваше имя!');
        nameInput.focus();
        return;
    }
    
    console.log('Имя ученика:', userName);
    findActiveGame();
}

function findActiveGame() {
    console.log('Ищем активную игру...');
    
    database.ref('activeGame').once('value').then(snapshot => {
        const gameCode = snapshot.val();
        if (gameCode) {
            console.log('✅ Найдена игра:', gameCode);
            joinAsStudent(gameCode);
        } else {
            showError('Нет активной игры. Попросите учителя создать игру.');
        }
    }).catch(error => {
        console.error('❌ Ошибка поиска игры:', error);
        showError('Ошибка подключения к серверу');
    });
}

function joinAsStudent(gameCode) {
    console.log('Подключаем ученика к игре:', gameCode);
    
    currentGame = gameCode;
    gameRef = database.ref(`games/${gameCode}`);
    playersRef = gameRef.child('players');
    
    const playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    playersRef.child(playerId).set({
        id: playerId,
        name: userName,
        score: 0,
        joinedAt: Date.now(),
        answers: {}
    }).then(() => {
        console.log('✅ Ученик подключен:', userName);
        
        showStudentWaiting();
        
        gameRef.on('value', handleStudentGameState);
        
        localStorage.setItem('playerId', playerId);
        
    }).catch(error => {
        console.error('❌ Ошибка подключения:', error);
        showError('Не удалось подключиться к игре');
    });
}

function showStudentWaiting() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="student-page">
            <div class="student-container">
                <div class="student-header">
                    <i class="fas fa-mobile-alt"></i>
                    <h1>Brain Quiz</h1>
                    <p>Игрок: ${userName}</p>
                </div>
                
                <div class="student-content">
                    <div class="waiting-screen-student">
                        <div class="waiting-icon-student">
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
        </div>
    `;
}

function handleStudentGameState(snapshot) {
    const gameData = snapshot.val();
    if (!gameData) return;
    
    const state = gameData.state;
    currentQuestionIndex = gameData.currentQuestion || 0;
    
    switch(state) {
        case 'waiting':
            showStudentWaiting();
            break;
            
        case 'question':
            showStudentQuestion(gameData, currentQuestionIndex);
            break;
            
        case 'results':
            showStudentResults(gameData, currentQuestionIndex);
            break;
            
        case 'finished':
            showStudentFinalResults(gameData);
            break;
    }
}

function showStudentQuestion(gameData, questionIndex) {
    gameRef.child(`questions/${questionIndex}`).once('value').then(snapshot => {
        const question = snapshot.val();
        if (!question) return;
        
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="student-page">
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
                                        onclick="submitStudentAnswer(${i}, ${questionIndex})">
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
            </div>
        `;
        
        startStudentTimer(question.time || 30);
        
    }).catch(error => {
        console.error('❌ Ошибка загрузки вопроса:', error);
    });
}

window.submitStudentAnswer = function(answerIndex, questionIndex) {
    submitStudentAnswer(answerIndex, questionIndex);
};

function submitStudentAnswer(answerIndex, questionIndex) {
    console.log('Отправка ответа:', answerIndex, 'на вопрос:', questionIndex);
    
    const playerId = localStorage.getItem('playerId');
    if (!playerId || !playersRef) {
        console.error('Нет ID игрока или ссылки на игроков');
        return;
    }
    
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.7';
        btn.style.cursor = 'not-allowed';
    });
    
    const selectedBtn = document.querySelector(`.answer-btn-${answerIndex + 1}`);
    if (selectedBtn) {
        selectedBtn.style.transform = 'scale(0.95)';
        selectedBtn.style.boxShadow = 'inset 0 0 20px rgba(255,255,255,0.5)';
    }
    
    playersRef.child(playerId).child('answers').child(questionIndex).set(answerIndex)
        .then(() => {
            console.log('✅ Ответ сохранен');
        })
        .catch(error => {
            console.error('❌ Ошибка сохранения ответа:', error);
        });
}

function startStudentTimer(seconds) {
    clearInterval(currentTimer);
    
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
        }
    }, 1000);
}

function showStudentResults(gameData, questionIndex) {
    const playerId = localStorage.getItem('playerId');
    
    gameRef.child(`questions/${questionIndex}`).once('value').then(qSnapshot => {
        const question = qSnapshot.val();
        if (!question) return;
        
        playersRef.child(playerId).once('value').then(pSnapshot => {
            const player = pSnapshot.val();
            const playerAnswer = player?.answers?.[questionIndex];
            const isCorrect = playerAnswer === question.correct;
            const points = isCorrect ? 100 : 0;
            
            if (isCorrect && player) {
                const newScore = (player.score || 0) + points;
                playersRef.child(playerId).update({ score: newScore });
            }
            
            const app = document.getElementById('app');
            app.innerHTML = `
                <div class="student-page">
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
        
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="student-page">
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
            </div>
        `;
    });
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function showError(message) {
    alert(message);
}

function showSuccess(message) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #10b981; color: white;">
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-check-circle" style="font-size: 64px; margin-bottom: 20px;"></i>
                <h2 style="margin-bottom: 10px;">${message}</h2>
                <p>Перенаправление...</p>
            </div>
        </div>
    `;
}

// ===== ГОТОВО! =====
console.log('✅ Brain Quiz готов к работе!');
