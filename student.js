// ============================================
// student.js
// Логика для интерфейса ученика
// ============================================

// Глобальные переменные
let currentGameId = null;
let playerName = null;
let currentQuestionId = null;
let hasAnswered = false;
let timerInterval = null;
let gameListener = null;
let answerListener = null;

// DOM элементы
const joinScreen = document.getElementById('joinScreen');
const waitingScreen = document.getElementById('waitingScreen');
const questionScreen = document.getElementById('questionScreen');
const resultScreen = document.getElementById('resultScreen');
const playerNameInput = document.getElementById('playerNameInput');
const gameCodeInput = document.getElementById('gameCodeInput');
const displayPlayerName = document.getElementById('displayPlayerName');
const displayGameCode = document.getElementById('displayGameCode');
const studentQuestionText = document.getElementById('studentQuestionText');
const optionsGrid = document.getElementById('optionsGrid');
const studentTimer = document.getElementById('studentTimer');
const answerStatus = document.getElementById('answerStatus');
const resultCard = document.getElementById('resultCard');
const currentQuestionNum = document.getElementById('currentQuestionNum');
const progressFill = document.getElementById('progressFill');
const roomPlayers = document.getElementById('roomPlayers');
const nextCountdown = document.getElementById('nextCountdown');

// ================ ОСНОВНЫЕ ФУНКЦИИ ================

/**
 * Присоединиться к игре
 */
function joinGame() {
    // Получить данные из формы
    const name = playerNameInput.value.trim();
    const code = gameCodeInput.value.trim();
    
    // Валидация
    if (!name || !code) {
        showError("Введите имя и код игры!");
        return;
    }
    
    if (name.length < 2) {
        showError("Имя должно быть не короче 2 символов");
        return;
    }
    
    if (!/^\d+$/.test(code)) {
        showError("Код игры должен содержать только цифры");
        return;
    }
    
    // Сохранить данные
    playerName = name;
    currentGameId = "game_" + code;
    
    // Проверить существование игры
    db.ref(`games/${currentGameId}`).once('value').then(snapshot => {
        if (!snapshot.exists()) {
            showError("Игра с таким кодом не найдена! Проверьте код или попросите учителя начать игру.");
            return;
        }
        
        const game = snapshot.val();
        
        // Проверить статус игры
        if (game.status === "finished") {
            showError("Эта игра уже завершена");
            return;
        }
        
        // Проверить максимальное число игроков
        const players = game.players ? Object.keys(game.players) : [];
        if (players.length >= (game.maxPlayers || 50)) {
            showError("В игре достигнуто максимальное число игроков");
            return;
        }
        
        // Проверить, не занято ли имя
        if (game.players && game.players[name]) {
            showError("Игрок с таким именем уже есть в игре");
            return;
        }
        
        // Зарегистрировать игрока
        const playerData = {
            name: name,
            avatar: getAvatarColor(name),
            device: getDeviceInfo()
        };
        
        firebaseAPI.addPlayer(currentGameId, playerData).then(() => {
            // Успешное подключение
            displayPlayerName.textContent = name;
            displayGameCode.textContent = code;
            roomPlayers.textContent = players.length + 1;
            
            // Переключить экраны
            switchScreen('waiting');
            
            // Начать слушать игру
            startGameListener();
            
            console.log(`✅ Игрок "${name}" присоединился к игре ${currentGameId}`);
            showMessage("Подключение успешно! Ожидайте начала игры...");
            
        }).catch(error => {
            console.error("Ошибка регистрации:", error);
            showError("Ошибка подключения. Попробуйте снова.");
        });
        
    }).catch(error => {
        console.error("Ошибка проверки игры:", error);
        showError("Ошибка сети. Проверьте интернет-соединение.");
    });
}

/**
 * Отсоединиться от игры
 */
function disconnectGame() {
    if (currentGameId && playerName) {
        // Удалить игрока из Firebase
        db.ref(`games/${currentGameId}/players/${playerName}`).remove();
    }
    
    // Сбросить состояние
    resetGameState();
    
    // Вернуться на экран подключения
    switchScreen('join');
    
    showMessage("Вы вышли из игры");
}

/**
 * Начать слушать состояние игры
 */
function startGameListener() {
    if (!currentGameId) return;
    
    // Отписаться от предыдущего слушателя
    if (gameListener) {
        gameListener();
    }
    
    gameListener = firebaseAPI.getGame(currentGameId, (game) => {
        if (!game) {
            showError("Игра не найдена или была удалена");
            disconnectGame();
            return;
        }
        
        // Обновить счетчик игроков
        const players = game.players ? Object.keys(game.players) : [];
        if (roomPlayers) {
            roomPlayers.textContent = players.length;
        }
        
        // Обработать статус игры
        switch (game.status) {
            case "waiting":
            case "lobby":
                handleWaitingState();
                break;
                
            case "question_active":
                handleQuestionActive(game);
                break;
                
            case "showing_results":
                handleShowingResults(game);
                break;
                
            case "finished":
                handleGameFinished(game);
                break;
        }
    });
}

/**
 * Обработка состояния ожидания
 */
function handleWaitingState() {
    if (hasAnswered) {
        hasAnswered = false;
    }
    
    // Если мы не на экране ожидания, переключиться
    if (!waitingScreen.classList.contains('active')) {
        switchScreen('waiting');
    }
    
    // Сбросить таймер
    clearTimer();
}

/**
 * Обработка активного вопроса
 */
function handleQuestionActive(game) {
    if (!game.currentQuestion || hasAnswered) return;
    
    currentQuestionId = game.currentQuestion;
    const question = findQuestionById(game.currentQuestion);
    
    if (!question) {
        console.error("Вопрос не найден:", game.currentQuestion);
        return;
    }
    
    // Обновить номер вопроса
    if (currentQuestionNum && game.quiz) {
        const questionIndex = game.quiz.questions.findIndex(q => q.id === game.currentQuestion);
        if (questionIndex !== -1) {
            currentQuestionNum.textContent = questionIndex + 1;
        }
    }
    
    // Переключить на экран вопроса
    switchScreen('question');
    
    // Отобразить вопрос
    displayQuestion(question);
    
    // Запустить таймер
    startQuestionTimer(question.time);
    
    // Запустить прогресс-бар
    startProgressBar(question.time);
    
    // Установить бейдж типа вопроса
    updateQuestionTypeBadge(question.type);
}

/**
 * Обработка показа результатов
 */
function handleShowingResults(game) {
    if (!currentQuestionId) return;
    
    // Переключить на экран результата
    switchScreen('result');
    
    // Показать результат ответа
    showQuestionResult(game, currentQuestionId);
    
    // Запустить отсчет до следующего вопроса
    startNextQuestionCountdown();
    
    // Сбросить флаг ответа
    setTimeout(() => {
        hasAnswered = false;
        currentQuestionId = null;
    }, 3000);
}

/**
 * Обработка завершения игры
 */
function handleGameFinished(game) {
    switchScreen('result');
    
    resultCard.innerHTML = `
        <div class="final-result">
            <h3><i class="fas fa-flag-checkered"></i> ИГРА ЗАВЕРШЕНА!</h3>
            <div class="final-stats">
                <p>Ваше имя: <strong>${playerName}</strong></p>
                <p>Правильных ответов: <strong>${game.players[playerName]?.totalCorrect || 0}/${game.quiz.questions.length}</strong></p>
                <p>Общий счет: <strong>${game.players[playerName]?.score || 0} очков</strong></p>
                <p>Место в рейтинге: <strong>${calculateRank(game.players, playerName)}</strong></p>
            </div>
            <button onclick="location.reload()" class="btn btn-primary mt-3">
                <i class="fas fa-redo"></i> Новая игра
            </button>
        </div>
    `;
    
    nextCountdown.style.display = 'none';
}

// ================ РАБОТА С ВОПРОСАМИ ================

/**
 * Отобразить вопрос
 */
function displayQuestion(question) {
    // Обновить текст вопроса
    studentQuestionText.textContent = question.text;
    
    // Очистить предыдущие варианты
    optionsGrid.innerHTML = '';
    
    // Создать кнопки вариантов ответов
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.dataset.index = index;
        button.innerHTML = `
            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
            <span class="option-text">${option}</span>
        `;
        
        button.onclick = () => submitAnswer(index, question);
        
        optionsGrid.appendChild(button);
    });
    
    // Сбросить статус
    answerStatus.textContent = "Выберите вариант ответа";
    answerStatus.className = "answer-status";
}

/**
 * Отправить ответ
 */
function submitAnswer(answerIndex, question) {
    if (hasAnswered || !currentGameId || !playerName || !currentQuestionId) {
        return;
    }
    
    hasAnswered = true;
    clearTimer();
    
    // Блокировать все кнопки
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.7';
    });
    
    // Подсветить выбранный ответ
    const selectedBtn = document.querySelector(`.option-btn[data-index="${answerIndex}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // Определить правильность
    const isCorrect = (answerIndex === question.correct);
    const timeSpent = question.time - parseInt(studentTimer.textContent);
    
    // Отправить ответ в Firebase
    const answerData = {
        answerIndex: answerIndex,
        isCorrect: isCorrect,
        timeSpent: timeSpent,
        timestamp: Date.now()
    };
    
    firebaseAPI.submitAnswer(currentGameId, currentQuestionId, playerName, answerData).then(() => {
        // Показать статус ответа
        updateAnswerStatus(isCorrect);
        
        // Обновить прогресс-бар
        if (progressFill) {
            progressFill.style.width = '100%';
            progressFill.style.background = isCorrect ? '#10b981' : '#ef4444';
        }
        
        // Обновить счет в Firebase
        if (isCorrect) {
            updatePlayerScore(question.points || 10);
        }
        
        console.log(`📤 Ответ отправлен: ${answerIndex}, правильно: ${isCorrect}`);
        
    }).catch(error => {
        console.error("Ошибка отправки ответа:", error);
        answerStatus.innerHTML = '<span style="color: #f59e0b">⚠️ Ошибка отправки ответа</span>';
    });
}

/**
 * Показать результат вопроса
 */
function showQuestionResult(game, questionId) {
    const question = findQuestionById(questionId);
    if (!question) return;
    
    // Получить ответ пользователя
    db.ref(`games/${currentGameId}/answers/${questionId}/${playerName}`).once('value').then(snapshot => {
        const userAnswer = snapshot.val();
        
        let resultHTML = '';
        
        if (userAnswer) {
            const isCorrect = userAnswer.isCorrect;
            const userAnswerText = question.options[userAnswer.answerIndex];
            const correctAnswerText = question.options[question.correct];
            
            resultHTML = `
                <div class="question-result ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="result-icon">
                        ${isCorrect ? '✅' : '❌'}
                    </div>
                    <h4>${isCorrect ? 'ПРАВИЛЬНО!' : 'НЕПРАВИЛЬНО'}</h4>
                    
                    <div class="result-details">
                        <div class="detail-row">
                            <span class="detail-label">Ваш ответ:</span>
                            <span class="detail-value">${userAnswerText}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Правильный ответ:</span>
                            <span class="detail-value correct-answer">${correctAnswerText}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Время ответа:</span>
                            <span class="detail-value">${question.time - userAnswer.timeSpent} сек.</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Объяснение:</span>
                            <span class="detail-value explanation">${question.explanation}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            resultHTML = `
                <div class="question-result no-answer">
                    <div class="result-icon">⏰</div>
                    <h4>ВЫ НЕ УСПЕЛИ</h4>
                    
                    <div class="result-details">
                        <div class="detail-row">
                            <span class="detail-label">Правильный ответ:</span>
                            <span class="detail-value correct-answer">${question.options[question.correct]}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Объяснение:</span>
                            <span class="detail-value explanation">${question.explanation}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (resultCard) {
            resultCard.innerHTML = resultHTML;
        }
        
    }).catch(error => {
        console.error("Ошибка получения результата:", error);
        resultCard.innerHTML = `<p style="color: #f59e0b">Ошибка загрузки результата</p>`;
    });
}

// ================ ТАЙМЕРЫ И АНИМАЦИИ ================

/**
 * Запустить таймер вопроса
 */
function startQuestionTimer(seconds) {
    clearTimer();
    
    let timeLeft = seconds;
    updateTimerDisplay(timeLeft);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeUp();
        }
    }, 1000);
}

/**
 * Обновить отображение таймера
 */
function updateTimerDisplay(timeLeft) {
    if (!studentTimer) return;
    
    studentTimer.textContent = timeLeft;
    
    // Изменить цвет при малом времени
    if (timeLeft <= 10) {
        studentTimer.style.color = '#ef4444';
        studentTimer.classList.add('pulse');
    } else if (timeLeft <= 20) {
        studentTimer.style.color = '#f59e0b';
    } else {
        studentTimer.style.color = '#10b981';
        studentTimer.classList.remove('pulse');
    }
}

/**
 * Запустить прогресс-бар
 */
function startProgressBar(totalTime) {
    if (!progressFill) return;
    
    progressFill.style.width = '0%';
    progressFill.style.background = 'linear-gradient(90deg, #4361ee, #3a0ca3)';
    progressFill.style.transition = `width ${totalTime}s linear`;
    
    // Запустить анимацию через небольшой таймаут
    setTimeout(() => {
        progressFill.style.width = '100%';
    }, 100);
}

/**
 * Запустить отсчет до следующего вопроса
 */
function startNextQuestionCountdown() {
    let countdown = 5;
    
    if (nextCountdown) {
        nextCountdown.textContent = countdown;
    }
    
    const countdownInterval = setInterval(() => {
        countdown--;
        
        if (nextCountdown) {
            nextCountdown.textContent = countdown;
        }
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
}

/**
 * Обработка истечения времени
 */
function handleTimeUp() {
    if (hasAnswered) return;
    
    hasAnswered = true;
    
    // Блокировать кнопки
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
    });
    
    // Показать сообщение
    answerStatus.innerHTML = '<span style="color: #f59e0b">⏰ Время вышло! Ответ не засчитан</span>';
    
    // Обновить прогресс-бар
    if (progressFill) {
        progressFill.style.width = '100%';
        progressFill.style.background = '#f59e0b';
    }
    
    // Через 2 секунды переключить на ожидание
    setTimeout(() => {
        if (questionScreen.classList.contains('active')) {
            switchScreen('waiting');
        }
    }, 2000);
}

// ================ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ================

/**
 * Переключить экран
 */
function switchScreen(screenName) {
    // Скрыть все экраны
    [joinScreen, waitingScreen, questionScreen, resultScreen].forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    // Показать нужный экран
    switch (screenName) {
        case 'join':
            joinScreen.classList.add('active');
            joinScreen.style.display = 'block';
            break;
            
        case 'waiting':
            waitingScreen.classList.add('active');
            waitingScreen.style.display = 'block';
            break;
            
        case 'question':
            questionScreen.classList.add('active');
            questionScreen.style.display = 'flex';
            break;
            
        case 'result':
            resultScreen.classList.add('active');
            resultScreen.style.display = 'block';
            break;
    }
}

/**
 * Найти вопрос по ID
 */
function findQuestionById(questionId) {
    if (!window.QUIZ_DATA || !QUIZ_DATA.questions) return null;
    return QUIZ_DATA.questions.find(q => q.id == questionId);
}

/**
 * Обновить статус ответа
 */
function updateAnswerStatus(isCorrect) {
    if (!answerStatus) return;
    
    if (isCorrect) {
        answerStatus.innerHTML = '<span style="color: #10b981">✅ Ответ принят! Ожидайте результатов...</span>';
    } else {
        answerStatus.innerHTML = '<span style="color: #ef4444">❌ Ответ принят! Ожидайте результатов...</span>';
    }
}

/**
 * Обновить бейдж типа вопроса
 */
function updateQuestionTypeBadge(type) {
    const badge = document.getElementById('questionTypeBadge');
    if (!badge) return;
    
    const labels = {
        oral: "🎤 УСТНОЕ",
        spelling: "📝 ОРФОГРАФИЯ",
        punctuation: "🔤 ПУНКТУАЦИЯ",
        syntax: "📚 СИНТАКСИС",
        reading: "📖 ЧТЕНИЕ",
        writing: "✍️ ПИСЬМО"
    };
    
    badge.textContent = labels[type] || type.toUpperCase();
}

/**
 * Обновить счет игрока
 */
function updatePlayerScore(points) {
    if (!currentGameId || !playerName) return;
    
    db.ref(`games/${currentGameId}/players/${playerName}/score`).transaction(current => {
        return (current || 0) + points;
    });
    
    db.ref(`games/${currentGameId}/players/${playerName}/totalCorrect`).transaction(current => {
        return (current || 0) + 1;
    });
}

/**
 * Рассчитать место в рейтинге
 */
function calculateRank(players, playerName) {
    if (!players || !playerName || !players[playerName]) return '-';
    
    const playerList = Object.values(players);
    playerList.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    const rank = playerList.findIndex(p => p.name === playerName) + 1;
    
    if (rank === 1) return '🥇 1-е место';
    if (rank === 2) return '🥈 2-е место';
    if (rank === 3) return '🥉 3-е место';
    
    return `${rank}-е место`;
}

/**
 * Получить цвет аватара
 */
function getAvatarColor(name) {
    const colors = ['#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0', '#4895ef'];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
}

/**
 * Получить информацию об устройстве
 */
function getDeviceInfo() {
    const ua = navigator.userAgent;
    let device = 'Unknown';
    
    if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
        device = 'Mobile';
    } else {
        device = 'Desktop';
    }
    
    return device;
}

/**
 * Очистить таймер
 */
function clearTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

/**
 * Сбросить состояние игры
 */
function resetGameState() {
    currentGameId = null;
    playerName = null;
    currentQuestionId = null;
    hasAnswered = false;
    
    clearTimer();
    
    if (gameListener) {
        gameListener();
        gameListener = null;
    }
    
    if (answerListener) {
        answerListener();
        answerListener = null;
    }
    
    // Сбросить форму
    playerNameInput.value = '';
    gameCodeInput.value = '';
}

/**
 * Показать сообщение об ошибке
 */
function showError(message) {
    alert(`❌ ${message}`);
}

/**
 * Показать сообщение
 */
function showMessage(message) {
    // Можно заменить на красивый toast
    console.log("💡", message);
}

// ================ ИНИЦИАЛИЗАЦИЯ ================

// Обработчики событий
document.addEventListener('DOMContentLoaded', function() {
    console.log("student.js загружен");
    
    // Обработчик Enter в полях ввода
    if (playerNameInput && gameCodeInput) {
        playerNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') joinGame();
        });
        
        gameCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') joinGame();
        });
        
        // Автофокус на первом поле
        playerNameInput.focus();
    }
    
    // Проверка Firebase
    if (typeof firebase === 'undefined') {
        showError("Firebase не загружен! Проверьте интернет-соединение и блокировщики рекламы.");
    }
    
    // Добавить CSS для дополнительных стилей
    const style = document.createElement('style');
    style.textContent = `
        .question-result {
            padding: 20px;
            border-radius: 15px;
            margin: 20px 0;
        }
        
        .question-result.correct {
            background: rgba(16, 185, 129, 0.1);
            border: 2px solid #10b981;
        }
        
        .question-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            border: 2px solid #ef4444;
        }
        
        .question-result.no-answer {
            background: rgba(245, 158, 11, 0.1);
            border: 2px solid #f59e0b;
        }
        
        .result-icon {
            font-size: 3rem;
            text-align: center;
            margin-bottom: 15px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            color: #94a3b8;
            font-weight: 500;
        }
        
        .detail-value {
            text-align: right;
            max-width: 70%;
        }
        
        .correct-answer {
            color: #10b981;
            font-weight: 600;
        }
        
        .explanation {
            font-style: italic;
            color: #cbd5e1;
        }
        
        .final-result {
            text-align: center;
            padding: 20px;
        }
        
        .final-stats {
            background: rgba(255, 255, 255, 0.05);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
    `;
    document.head.appendChild(style);
});

// Глобальный экспорт функций
window.joinGame = joinGame;
window.disconnectGame = disconnectGame;
