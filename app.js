// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let database;
let gameRef;
let playersRef;
let currentGame = null;
let userName = '';
let userRole = '';
let currentTimer = null;
let currentQuestionIndex = 0;
let playerId = '';

// ===== ФУНКЦИИ ПЕРЕКЛЮЧЕНИЯ СТРАНИЦ =====
function showMain() {
    document.getElementById('main-page').style.display = 'block';
    document.getElementById('teacher-page').style.display = 'none';
    document.getElementById('student-page').style.display = 'none';
    
    // Сбрасываем состояние
    currentGame = null;
    userName = '';
    userRole = '';
    playerId = '';
    clearInterval(currentTimer);
}

function showTeacher() {
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('teacher-page').style.display = 'block';
    document.getElementById('student-page').style.display = 'none';
    
    userRole = 'teacher';
    initTeacherMode();
}

function showStudent() {
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('teacher-page').style.display = 'none';
    document.getElementById('student-page').style.display = 'block';
    
    userRole = 'student';
    initStudentMode();
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Brain Quiz загружен');
    
    try {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        console.log('✅ Firebase подключен');
    } catch (error) {
        console.error('❌ Ошибка Firebase:', error);
        alert('Не удалось подключиться к серверу');
    }
});

// ===== РЕЖИМ УЧИТЕЛЯ =====
function initTeacherMode() {
    console.log('Инициализация режима учителя');
    
    // Привязываем обработчики
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
            createBtn.addEventListener('click', createGame);
        }
        
        // Кнопки управления игрой
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) startBtn.addEventListener('click', startGame);
        
        const nextBtn = document.getElementById('next-question-btn');
        if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
        
        const endBtn = document.getElementById('end-game-btn');
        if (endBtn) endBtn.addEventListener('click', endGame);
        
        console.log('✅ Обработчики учителя привязаны');
    }, 100);
    
    checkActiveGame();
}

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
            
            // Показываем экран ожидания
            showTeacherScreen('waiting');
            
            const gameControls = document.getElementById('game-controls');
            const createGameCard = document.getElementById('create-game-card');
            
            if (gameControls) gameControls.classList.remove('hidden');
            if (createGameCard) createGameCard.classList.add('hidden');
            
            updateGameStatus('Ожидание игроков');
            
            playersRef = gameRef.child('players');
            playersRef.on('value', updatePlayersList);
            
            gameRef.on('value', handleTeacherGameState);
            
            alert(`Игра "${gameName}" создана!`);
            
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
            alert('Игра не найдена');
            return;
        }
        
        showTeacherScreen('waiting');
        updateGameStatus('Подключено');
        
        const gameControls = document.getElementById('game-controls');
        const createGameCard = document.getElementById('create-game-card');
        
        if (gameControls) gameControls.classList.remove('hidden');
        if (createGameCard) createGameCard.classList.add('hidden');
        
        playersRef.on('value', updatePlayersList);
        gameRef.on('value', handleTeacherGameState);
        
    }).catch(error => {
        console.error('❌ Ошибка подключения:', error);
        alert('Не удалось подключиться к игре');
    });
}

function showTeacherScreen(screenName) {
    const screens = {
        'welcome': 'teacher-welcome-screen',
        'waiting': 'teacher-waiting-screen',
        'question': 'teacher-question-screen',
        'results': 'teacher-results-screen',
        'final': 'teacher-final-screen'
    };
    
    // Скрываем все экраны
    Object.values(screens).forEach(screenId => {
        const el = document.getElementById(screenId);
        if (el) {
            el.classList.remove('active');
            el.classList.add('hidden');
        }
    });
    
    // Показываем нужный экран
    const targetScreen = screens[screenName];
    if (targetScreen) {
        const el = document.getElementById(targetScreen);
        if (el) {
            el.classList.remove('hidden');
            el.classList.add('active');
        }
    }
}

function updateGameStatus(status) {
    const el = document.getElementById('game-status');
    if (el) el.textContent = status;
}

function updatePlayerCount(count) {
    const el = document.getElementById('player-count');
    const bigEl = document.getElementById('big-player-count');
    if (el) el.textContent = count;
    if (bigEl) bigEl.textContent = count;
}

function updateQuestionNumber(current, total) {
    const el = document.getElementById('question-number');
    if (el) el.textContent = `${current}/${total}`;
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

function handleTeacherGameState(snapshot) {
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
function initStudentMode() {
    console.log('Инициализация режима ученика');
    
    // Привязываем обработчики формы имени
    setTimeout(() => {
        const joinBtn = document.getElementById('join-game-btn');
        const nameInput = document.getElementById('student-name');
        
        if (joinBtn && nameInput) {
            joinBtn.addEventListener('click', joinGame);
            
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    joinGame();
                }
            });
            
            nameInput.focus();
        }
        
        console.log('✅ Обработчики ученика привязаны');
    }, 100);
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
    
    // Показываем имя ученика
    const displayName = document.getElementById('display-student-name');
    if (displayName) {
        displayName.textContent = userName;
    }
    
    // Скрываем форму, показываем ожидание
    const nameForm = document.getElementById('name-form');
    const waitingScreen = document.getElementById('student-waiting');
    
    if (nameForm) nameForm.classList.add('hidden');
    if (waitingScreen) waitingScreen.classList.remove('hidden');
    
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
            showStudentError('Нет активной игры. Попросите учителя создать игру.');
        }
    }).catch(error => {
        console.error('❌ Ошибка поиска игры:', error);
        showStudentError('Ошибка подключения к серверу');
    });
}

function joinAsStudent(gameCode) {
    console.log('Подключаем ученика к игре:', gameCode);
    
    currentGame = gameCode;
    gameRef = database.ref(`games/${gameCode}`);
    playersRef = gameRef.child('players');
    
    playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    playersRef.child(playerId).set({
        id: playerId,
        name: userName,
        score: 0,
        joinedAt: Date.now(),
        answers: {}
    }).then(() => {
        console.log('✅ Ученик подключен:', userName);
        
        gameRef.on('value', handleStudentGameState);
        
        localStorage.setItem('playerId', playerId);
        
    }).catch(error => {
        console.error('❌ Ошибка подключения:', error);
        showStudentError('Не удалось подключиться к игре');
    });
}

function handleStudentGameState(snapshot) {
    const gameData = snapshot.val();
    if (!gameData) return;
    
    const state = gameData.state;
    currentQuestionIndex = gameData.currentQuestion || 0;
    
    // Скрываем все экраны ученика
    hideAllStudentScreens();
    
    switch(state) {
        case 'waiting':
            showStudentScreen('waiting');
            break;
            
        case 'question':
            showStudentScreen('question');
            loadStudentQuestion(gameData, currentQuestionIndex);
            break;
            
        case 'results':
            showStudentScreen('result');
            showStudentResults(gameData, currentQuestionIndex);
            break;
            
        case 'finished':
            showStudentScreen('final');
            showStudentFinalResults(gameData);
            break;
    }
}

function hideAllStudentScreens() {
    const screens = ['student-waiting', 'student-question', 'student-result', 'student-final'];
    screens.forEach(screenId => {
        const el = document.getElementById(screenId);
        if (el) el.classList.add('hidden');
    });
}

function showStudentScreen(screenName) {
    const screens = {
        'waiting': 'student-waiting',
        'question': 'student-question',
        'result': 'student-result',
        'final': 'student-final'
    };
    
    hideAllStudentScreens();
    
    const targetScreen = screens[screenName];
    if (targetScreen) {
        const el = document.getElementById(targetScreen);
        if (el) {
            el.classList.remove('hidden');
        }
    }
}

function loadStudentQuestion(gameData, questionIndex) {
    gameRef.child(`questions/${questionIndex}`).once('value').then(snapshot => {
        const question = snapshot.val();
        if (!question) return;
        
        // Обновляем информацию о вопросе
        const categoryEl = document.getElementById('student-category');
        const questionNumEl = document.getElementById('student-question-number');
        const totalQuestionsEl = document.getElementById('student-total-questions');
        const timeLeftEl = document.getElementById('student-time-left');
        
        if (categoryEl) categoryEl.textContent = question.category;
        if (questionNumEl) questionNumEl.textContent = questionIndex + 1;
        if (totalQuestionsEl) totalQuestionsEl.textContent = gameData.totalQuestions;
        if (timeLeftEl) timeLeftEl.textContent = question.time || 30;
        
        // Создаем кнопки ответов
        const answerButtons = document.getElementById('answer-buttons');
        if (answerButtons) {
            let buttonsHtml = '';
            question.options.forEach((option, i) => {
                buttonsHtml += `
                    <button class="answer-btn answer-btn-${i + 1}" 
                            onclick="submitStudentAnswer(${i}, ${questionIndex})">
                        <div class="answer-letter">${String.fromCharCode(65 + i)}</div>
                        <div class="answer-text">${option}</div>
                    </button>
                `;
            });
            answerButtons.innerHTML = buttonsHtml;
        }
        
        // Запускаем таймер
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
    
    timerEl.textContent = timeLeft;
    
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
    if (!playerId) return;
    
    gameRef.child(`questions/${questionIndex}`).once('value').then(qSnapshot => {
        const question = qSnapshot.val();
        if (!question) return;
        
        playersRef.child(playerId).once('value').then(pSnapshot => {
            const player = pSnapshot.val();
            const playerAnswer = player?.answers?.[questionIndex];
            const isCorrect = playerAnswer === question.correct;
            const points = isCorrect ? 100 : 0;
            
            // Обновляем UI результатов
            const resultIcon = document.getElementById('result-icon');
            const resultTitle = document.getElementById('result-title');
            const resultMessage = document.getElementById('result-message');
            const resultPoints = document.getElementById('result-points');
            
            if (resultIcon) {
                resultIcon.innerHTML = isCorrect ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-times-circle"></i>';
                resultIcon.parentElement.className = isCorrect ? 'result-screen result-correct' : 'result-screen result-wrong';
            }
            
            if (resultTitle) resultTitle.textContent = isCorrect ? 'Правильно! 🎉' : 'Неправильно 😕';
            if (resultMessage) resultMessage.textContent = isCorrect ? 'Отличный ответ!' : `Правильный ответ: ${String.fromCharCode(65 + question.correct)}`;
            if (resultPoints) resultPoints.textContent = isCorrect ? '+100' : '0';
            
            // Обновляем счет
            if (isCorrect && player) {
                const newScore = (player.score || 0) + points;
                playersRef.child(playerId).update({ score: newScore });
            }
            
        });
    });
}

function showStudentFinalResults(gameData) {
    if (!playerId) return;
    
    playersRef.once('value').then(snapshot => {
        const players = snapshot.val() || {};
        const sorted = Object.values(players).sort((a, b) => (b.score || 0) - (a.score || 0));
        
        // Показываем итоговый счет
        const finalScore = document.getElementById('final-score');
        if (finalScore) {
            const playerScore = players[playerId]?.score || 0;
            finalScore.textContent = `${playerScore} очков`;
        }
        
        // Показываем рейтинг
        const leaderboardContainer = document.getElementById('final-leaderboard-container');
        if (leaderboardContainer) {
            let leaderboardHtml = '';
            sorted.forEach((player, index) => {
                const isCurrent = player.id === playerId;
                leaderboardHtml += `
                    <div class="ranking-item ${isCurrent ? 'current-player' : ''}">
                        <div class="rank-number">${index + 1}</div>
                        <div class="player-name-student">${player.name}</div>
                        <div class="player-score-student">${player.score || 0}</div>
                    </div>
                `;
            });
            leaderboardContainer.innerHTML = leaderboardHtml;
        }
        
    });
}

function showStudentError(message) {
    alert(message);
    // Возвращаем к форме имени
    const nameForm = document.getElementById('name-form');
    const waitingScreen = document.getElementById('student-waiting');
    
    if (nameForm) nameForm.classList.remove('hidden');
    if (waitingScreen) waitingScreen.classList.add('hidden');
}

// ===== ГОТОВО! =====
console.log('✅ Brain Quiz готов к работе!');
