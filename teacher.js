// ============================================
// teacher.js
// Логика для панели учителя
// ============================================

// Глобальные переменные
let currentGameId = null;
let currentQuestionIndex = 0;
let gameInterval = null;

// DOM элементы
const startSection = document.getElementById('startSection');
const gameControls = document.getElementById('gameControls');
const gameCodeDisplay = document.getElementById('gameCode');
const questionDisplay = document.getElementById('questionDisplay');
const questionTimer = document.getElementById('questionTimer');
const statsContent = document.getElementById('statsContent');
const playersGrid = document.getElementById('playersGrid');
const playerCount = document.getElementById('playerCount');
const questionsScroll = document.getElementById('questionsScroll');

// ================ ОСНОВНЫЕ ФУНКЦИИ ================

/**
 * Начать новую игру
 */
function startNewGame() {
    if (!window.firebaseAPI || !window.QUIZ_DATA) {
        alert("Система не загружена. Обновите страницу.");
        return;
    }
    
    const gameData = {
        title: "ОГЭ по русскому языку - " + new Date().toLocaleDateString(),
        quiz: QUIZ_DATA,
        teacher: "Учитель",
        maxPlayers: 50,
        timePerQuestion: 30
    };
    
    firebaseAPI.createGame(gameData).then(gameId => {
        currentGameId = gameId;
        currentQuestionIndex = 0;
        
        // Обновить интерфейс
        startSection.style.display = 'none';
        gameControls.style.display = 'block';
        gameCodeDisplay.textContent = gameId.replace('game_', '');
        
        // Показать список вопросов
        renderQuestionsList();
        
        // Начать слушать игроков
        listenToPlayers();
        
        // Начать слушать ответы
        listenToAnswers();
        
        // Запустить обновление статуса игры
        updateGameStatus("lobby");
        
        console.log("🎮 Игра создана:", gameId);
        showNotification("Игра создана! Код: " + gameId.replace('game_', ''));
        
    }).catch(error => {
        console.error("Ошибка создания игры:", error);
        alert("Ошибка создания игры: " + error.message);
    });
}

/**
 * Начать следующий вопрос
 */
function startNextQuestion() {
    if (!currentGameId || currentQuestionIndex >= QUIZ_DATA.questions.length) {
        alert("Все вопросы пройдены!");
        return;
    }
    
    const question = QUIZ_DATA.questions[currentQuestionIndex];
    
    // Обновить статус игры
    updateGameStatus("question_active", question.id);
    
    // Показать вопрос на доске
    renderQuestion(question);
    
    // Запустить таймер
    startQuestionTimer(question.time);
    
    // Сбросить предыдущие ответы
    db.ref(`games/${currentGameId}/answers/${question.id}`).remove();
    
    console.log("📝 Вопрос начат:", question.id);
    showNotification("Вопрос " + (currentQuestionIndex + 1) + " запущен");
    
    currentQuestionIndex++;
}

/**
 * Показать статистику
 */
function showResults() {
    if (!currentGameId || currentQuestionIndex === 0) {
        alert("Сначала запустите хотя бы один вопрос!");
        return;
    }
    
    const prevQuestionId = QUIZ_DATA.questions[currentQuestionIndex - 1]?.id;
    if (!prevQuestionId) return;
    
    updateGameStatus("showing_results", prevQuestionId);
    
    // Получить статистику
    firebaseAPI.getQuestionStats(currentGameId, prevQuestionId, (stats) => {
        if (stats) {
            renderStats(stats, prevQuestionId);
        }
    });
}

/**
 * Начать заново
 */
function resetGame() {
    if (confirm("Вы уверены? Все данные текущей игры будут удалены.")) {
        if (currentGameId) {
            firebaseAPI.removeGame(currentGameId);
        }
        
        // Сбросить интерфейс
        currentGameId = null;
        currentQuestionIndex = 0;
        startSection.style.display = 'block';
        gameControls.style.display = 'none';
        gameCodeDisplay.textContent = '----';
        questionDisplay.innerHTML = `
            <div class="question-placeholder">
                <i class="fas fa-question-circle fa-4x"></i>
                <h3>Вопрос появится здесь</h3>
                <p>Начните игру, чтобы увидеть первый вопрос</p>
            </div>
        `;
        statsContent.innerHTML = `
            <div class="stats-placeholder">
                <p>Здесь будет отображаться статистика ответов учеников</p>
            </div>
        `;
        playersGrid.innerHTML = `
            <div class="empty-players">
                <i class="fas fa-user-friends fa-2x"></i>
                <p>Ожидаем подключения учеников...</p>
            </div>
        `;
        
        clearInterval(gameInterval);
        console.log("🔄 Игра сброшена");
    }
}

// ================ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ================

/**
 * Обновить статус игры в Firebase
 */
function updateGameStatus(status, questionId = null) {
    if (!currentGameId) return;
    
    firebaseAPI.updateGameStatus(currentGameId, status, questionId);
}

/**
 * Показать вопрос на доске
 */
function renderQuestion(question) {
    const optionsHTML = question.options.map((option, index) => `
        <div class="option-card ${index === question.correct ? 'correct' : ''}">
            <div class="option-letter">${String.fromCharCode(65 + index)}</div>
            <div class="option-text">${option}</div>
        </div>
    `).join('');
    
    questionDisplay.innerHTML = `
        <div class="question-content">
            <div class="question-meta">
                <span class="question-type-badge">${getTypeLabel(question.type)}</span>
                <span class="question-points">${question.points} баллов</span>
            </div>
            <h2 class="question-text">${question.text}</h2>
            ${question.image ? `<img src="${question.image}" class="question-image" alt="Иллюстрация">` : ''}
            <div class="options-grid-teacher">
                ${optionsHTML}
            </div>
            <div class="question-explanation" id="questionExplanation" style="display: none;">
                <h4><i class="fas fa-lightbulb"></i> Объяснение:</h4>
                <p>${question.explanation}</p>
            </div>
        </div>
    `;
}

/**
 * Запустить таймер вопроса
 */
function startQuestionTimer(seconds) {
    let timeLeft = seconds;
    questionTimer.textContent = timeLeft;
    questionTimer.style.color = '#10b981';
    
    const timer = setInterval(() => {
        timeLeft--;
        questionTimer.textContent = timeLeft;
        
        // Изменить цвет при малом времени
        if (timeLeft <= 10) {
            questionTimer.style.color = '#ef4444';
            questionTimer.classList.add('pulse');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            questionTimer.classList.remove('pulse');
            showQuestionResults();
        }
    }, 1000);
}

/**
 * Показать результаты вопроса
 */
function showQuestionResults() {
    const question = QUIZ_DATA.questions[currentQuestionIndex - 1];
    if (!question) return;
    
    // Показать правильный ответ
    document.querySelectorAll('.option-card').forEach((card, index) => {
        if (index === question.correct) {
            card.classList.add('highlight-correct');
        } else {
            card.classList.add('highlight-wrong');
        }
    });
    
    // Показать объяснение
    const explanationEl = document.getElementById('questionExplanation');
    if (explanationEl) {
        explanationEl.style.display = 'block';
    }
    
    // Получить статистику
    firebaseAPI.getQuestionStats(currentGameId, question.id, (stats) => {
        renderStats(stats, question.id);
    });
    
    // Обновить статус игры
    updateGameStatus("showing_results", question.id);
}

/**
 * Отобразить статистику
 */
function renderStats(stats, questionId) {
    const question = QUIZ_DATA.questions.find(q => q.id == questionId);
    if (!question) return;
    
    let statsHTML = `
        <div class="stats-summary">
            <div class="stat-item">
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">Всего ответов</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.correct}</div>
                <div class="stat-label">Правильных</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</div>
                <div class="stat-label">Успешность</div>
            </div>
        </div>
        
        <div class="stats-detailed">
            <h4>Распределение по вариантам:</h4>
    `;
    
    question.options.forEach((option, index) => {
        const count = stats.byOption[index] || 0;
        const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
        const isCorrect = index === question.correct;
        
        statsHTML += `
            <div class="option-stat ${isCorrect ? 'correct' : ''}">
                <div class="option-stat-header">
                    <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                    <span class="option-text">${option}</span>
                    ${isCorrect ? '<span class="correct-badge">✓ Правильный</span>' : ''}
                </div>
                <div class="option-stat-bar">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                    <span class="bar-label">${count} (${percentage}%)</span>
                </div>
            </div>
        `;
    });
    
    statsHTML += `</div>`;
    
    statsContent.innerHTML = statsHTML;
}

/**
 * Слушать подключение игроков
 */
function listenToPlayers() {
    if (!currentGameId) return;
    
    db.ref(`games/${currentGameId}/players`).on('value', (snapshot) => {
        const players = snapshot.val() || {};
        const playerList = Object.values(players);
        
        // Обновить счетчик
        playerCount.textContent = playerList.length;
        
        // Отобразить игроков
        renderPlayers(playerList);
    });
}

/**
 * Отобразить список игроков
 */
function renderPlayers(players) {
    if (players.length === 0) {
        playersGrid.innerHTML = `
            <div class="empty-players">
                <i class="fas fa-user-friends fa-2x"></i>
                <p>Ожидаем подключения учеников...</p>
            </div>
        `;
        return;
    }
    
    playersGrid.innerHTML = players.map(player => `
        <div class="player-card">
            <div class="player-avatar">
                ${player.name.charAt(0).toUpperCase()}
            </div>
            <div class="player-info">
                <h4>${player.name}</h4>
                <div class="player-score">
                    <i class="fas fa-star"></i> ${player.score || 0} очков
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Слушать ответы в реальном времени
 */
function listenToAnswers() {
    if (!currentGameId) return;
    
    db.ref(`games/${currentGameId}/answers`).on('value', (snapshot) => {
        const answers = snapshot.val() || {};
        // Можно добавить live-обновление статистики
    });
}

/**
 * Показать список вопросов
 */
function renderQuestionsList() {
    if (!QUIZ_DATA.questions) return;
    
    questionsScroll.innerHTML = QUIZ_DATA.questions.map((question, index) => `
        <div class="question-item ${index === currentQuestionIndex ? 'active' : ''} 
             ${index < currentQuestionIndex ? 'completed' : ''}">
            <div class="question-number">${index + 1}</div>
            <div class="question-content-small">
                <div class="question-text-small">${question.text.substring(0, 60)}...</div>
                <div class="question-meta-small">
                    <span class="question-type-small">${getTypeLabel(question.type)}</span>
                    <span class="question-time">${question.time} сек</span>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Получить метку типа вопроса
 */
function getTypeLabel(type) {
    const labels = {
        oral: "🎤 Устное",
        spelling: "📝 Орфография",
        punctuation: "🔤 Пунктуация",
        syntax: "📚 Синтаксис",
        reading: "📖 Чтение",
        writing: "✍️ Письмо"
    };
    return labels[type] || type;
}

/**
 * Копировать код игры
 */
function copyGameCode() {
    if (!currentGameId) {
        alert("Сначала создайте игру!");
        return;
    }
    
    const code = currentGameId.replace('game_', '');
    navigator.clipboard.writeText(code).then(() => {
        showNotification("Код скопирован: " + code);
    });
}

/**
 * Показать уведомление
 */
function showNotification(message) {
    // Создать временное уведомление
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: fadeIn 0.3s;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ================ ИНИЦИАЛИЗАЦИЯ ================

// Добавить стили для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
    
    .question-item.active {
        border-left: 4px solid #4361ee;
        background: rgba(67, 97, 238, 0.1);
    }
    
    .question-item.completed {
        opacity: 0.7;
    }
    
    .question-item.completed .question-number {
        background: #10b981;
    }
    
    .highlight-correct {
        border: 3px solid #10b981 !important;
        background: rgba(16, 185, 129, 0.1) !important;
    }
    
    .highlight-wrong {
        opacity: 0.6;
    }
    
    .correct-badge {
        background: #10b981;
        color: white;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 0.8rem;
        margin-left: 10px;
    }
    
    .option-stat-bar {
        height: 20px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        margin: 10px 0;
        position: relative;
        overflow: hidden;
    }
    
    .bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #4361ee, #3a0ca3);
        border-radius: 10px;
        transition: width 1s ease;
    }
    
    .bar-label {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.9rem;
        color: white;
    }
`;
document.head.appendChild(style);

// Проверка загрузки
document.addEventListener('DOMContentLoaded', function() {
    console.log("teacher.js загружен");
    
    if (!window.db) {
        console.error("Firebase не загружен!");
        document.body.innerHTML += `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.9);
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
                text-align: center;
            ">
                <h2>❌ ОШИБКА ЗАГРУЗКИ</h2>
                <p>Firebase не загрузился. Проверьте:</p>
                <ol style="text-align: left; max-width: 500px; margin: 20px auto;">
                    <li>Интернет-соединение</li>
                    <li>Блокировку рекламы (может блокировать Firebase)</li>
                    <li>Консоль браузера (F12) на наличие ошибок</li>
                </ol>
                <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 20px;">
                    🔄 Перезагрузить страницу
                </button>
            </div>
        `;
    }
});
