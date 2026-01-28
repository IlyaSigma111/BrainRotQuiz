// ============================================
// teacher.js - ОБНОВЛЕННЫЙ
// ============================================

let currentGameId = null;
let currentQuestionIndex = 0;
let playersListener = null;
let gameListener = null;
let currentStats = null;

// Элементы DOM
const startSection = document.getElementById('startSection');
const gameControls = document.getElementById('gameControls');
const gameCodeDisplay = document.getElementById('gameCode');
const playersList = document.getElementById('playersList');
const playerCount = document.getElementById('playerCount');
const statsContent = document.getElementById('statsContent');
const questionsList = document.getElementById('questionsList');
const currentQ = document.getElementById('currentQ');
const totalQ = document.getElementById('totalQ');

// Режим презентации
const mainInterface = document.getElementById('mainInterface');
const presentationMode = document.getElementById('presentationMode');
const presentationQNum = document.getElementById('presentationQNum');
const presentationTimer = document.getElementById('presentationTimer');
const presentationQuestion = document.getElementById('presentationQuestion');

// ================ ОСНОВНЫЕ ФУНКЦИИ ================

function startNewGame() {
    if (!window.firebaseAPI) {
        alert("Firebase не загружен. Обновите страницу.");
        return;
    }
    
    const gameId = "game_" + Math.floor(10000000 + Math.random() * 90000000);
    currentGameId = gameId;
    currentQuestionIndex = 0;
    
    // Обновить UI
    startSection.style.display = 'none';
    gameControls.style.display = 'block';
    gameCodeDisplay.textContent = gameId.replace('game_', '');
    currentQ.textContent = '0';
    totalQ.textContent = QUIZ_DATA.questions.length;
    
    // Создать игру в Firebase
    const gameData = {
        id: gameId,
        created: Date.now(),
        status: "lobby",
        quiz: QUIZ_DATA,
        players: {},
        currentQuestion: null,
        answers: {}
    };
    
    db.ref('games/' + gameId).set(gameData).then(() => {
        console.log("✅ Игра создана:", gameId);
        showNotification("Игра создана! Код: " + gameId.replace('game_', ''));
        
        // Начать слушать игроков
        listenToPlayers();
        
        // Обновить список вопросов
        updateQuestionsList();
        
    }).catch(error => {
        console.error("Ошибка создания игры:", error);
        alert("Ошибка: " + error.message);
    });
}

function startNextQuestion() {
    if (!currentGameId) return;
    
    const question = QUIZ_DATA.questions[currentQuestionIndex];
    if (!question) {
        alert("Все вопросы пройдены!");
        return;
    }
    
    // Переключить в режим презентации
    enterPresentationMode(question);
    
    // Обновить в Firebase
    db.ref('games/' + currentGameId).update({
        status: "question_active",
        currentQuestion: question.id,
        questionStartTime: Date.now()
    });
    
    // Запустить таймер
    startPresentationTimer(question.time);
    
    // Обновить счетчик вопросов
    currentQuestionIndex++;
    currentQ.textContent = currentQuestionIndex;
    
    console.log("▶️ Вопрос запущен:", question.id);
}

function enterPresentationMode(question) {
    // Скрыть основной интерфейс
    mainInterface.style.display = 'none';
    presentationMode.style.display = 'flex';
    
    // Показать вопрос
    presentationQNum.textContent = currentQuestionIndex + 1;
    presentationQuestion.innerHTML = `
        <h2>${question.text}</h2>
        ${question.image ? `<img src="${question.image}" style="max-width: 400px; margin: 20px auto; display: block; border-radius: 10px;">` : ''}
        <div style="text-align: center; margin-top: 30px; color: #00adb5; font-size: 18px;">
            📱 Ответы принимаются на телефонах...
        </div>
    `;
    
    // Начать слушать ответы для статистики
    listenToQuestionAnswers(question.id);
}

function exitPresentation() {
    // Вернуться к основному интерфейсу
    mainInterface.style.display = 'flex';
    presentationMode.style.display = 'none';
    
    // Обновить статус игры
    if (currentGameId) {
        db.ref('games/' + currentGameId).update({
            status: "lobby"
        });
    }
}

function showAnswer() {
    const question = QUIZ_DATA.questions[currentQuestionIndex - 1];
    if (!question) return;
    
    // Показать правильный ответ
    presentationQuestion.innerHTML += `
        <div style="margin-top: 40px; padding: 20px; background: rgba(0, 255, 136, 0.1); border-radius: 15px; border: 2px solid #00ff88;">
            <h3 style="color: #00ff88; margin-top: 0;">✅ ПРАВИЛЬНЫЙ ОТВЕТ:</h3>
            <div style="font-size: 24px; color: white; margin: 15px 0;">${question.options[question.correct]}</div>
            <div style="color: #8f8f8f; font-style: italic;">${question.explanation}</div>
        </div>
    `;
    
    // Показать статистику
    if (currentStats) {
        showQuestionStats(currentStats, question);
    }
}

function showStats() {
    if (currentQuestionIndex === 0) {
        alert("Сначала запустите хотя бы один вопрос!");
        return;
    }
    
    const question = QUIZ_DATA.questions[currentQuestionIndex - 1];
    if (!question) return;
    
    // Получить статистику из Firebase
    db.ref(`games/${currentGameId}/answers/${question.id}`).once('value').then(snapshot => {
        const answers = snapshot.val() || {};
        const stats = calculateStats(answers, question);
        showQuestionStats(stats, question);
    });
}

function endQuestion() {
    if (currentGameId) {
        db.ref('games/' + currentGameId).update({
            status: "lobby",
            currentQuestion: null
        });
    }
    
    // Если в режиме презентации - выйти
    if (presentationMode.style.display !== 'none') {
        exitPresentation();
    }
}

function resetGame() {
    if (confirm("Удалить текущую игру и начать заново?")) {
        if (currentGameId) {
            db.ref('games/' + currentGameId).remove();
        }
        
        // Сбросить всё
        currentGameId = null;
        currentQuestionIndex = 0;
        startSection.style.display = 'block';
        gameControls.style.display = 'none';
        gameCodeDisplay.textContent = '----';
        playersList.innerHTML = '<div class="empty-lobby"><div class="empty-icon">👤</div><p>Игроки появятся здесь после подключения</p></div>';
        playerCount.textContent = '0';
        statsContent.innerHTML = '<div class="empty-stats"><div class="stats-icon">📊</div><p>Статистика появится после ответов на вопросы</p></div>';
        currentQ.textContent = '0';
        
        // Отписаться от слушателей
        if (playersListener) playersListener();
        if (gameListener) gameListener();
        
        console.log("🔄 Игра сброшена");
    }
}

// ================ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ================

function listenToPlayers() {
    if (!currentGameId) return;
    
    playersListener = db.ref(`games/${currentGameId}/players`).on('value', snapshot => {
        const players = snapshot.val() || {};
        const playerArray = Object.entries(players).map(([name, data]) => ({
            name,
            ...data
        }));
        
        // Обновить счетчик
        playerCount.textContent = playerArray.length;
        
        // Обновить список
        updatePlayersList(playerArray);
    });
}

function updatePlayersList(players) {
    if (players.length === 0) {
        playersList.innerHTML = '<div class="empty-lobby"><div class="empty-icon">👤</div><p>Игроки появятся здесь после подключения</p></div>';
        return;
    }
    
    playersList.innerHTML = players.map(player => `
        <div class="player-card">
            <div class="player-avatar">${player.name.charAt(0).toUpperCase()}</div>
            <div class="player-name">${player.name}</div>
            <div class="player-score">🎯 ${player.score || 0} очков</div>
        </div>
    `).join('');
}

function listenToQuestionAnswers(questionId) {
    if (!currentGameId) return;
    
    db.ref(`games/${currentGameId}/answers/${questionId}`).on('value', snapshot => {
        const answers = snapshot.val() || {};
        const question = QUIZ_DATA.questions.find(q => q.id == questionId);
        
        if (question) {
            currentStats = calculateStats(answers, question);
            updateLiveStats(currentStats);
        }
    });
}

function calculateStats(answers, question) {
    const stats = {
        total: Object.keys(answers).length,
        correct: 0,
        byOption: question.options.map(() => 0)
    };
    
    Object.values(answers).forEach(answer => {
        const optionIndex = answer.answerIndex;
        if (optionIndex >= 0 && optionIndex < question.options.length) {
            stats.byOption[optionIndex]++;
            if (optionIndex === question.correct) {
                stats.correct++;
            }
        }
    });
    
    return stats;
}

function updateLiveStats(stats) {
    // Обновить в режиме презентации
    if (presentationMode.style.display !== 'none') {
        const statsElement = document.getElementById('liveStats');
        if (!statsElement) {
            presentationQuestion.innerHTML += `
                <div id="liveStats" style="margin-top: 30px; padding: 15px; background: rgba(0, 173, 181, 0.1); border-radius: 10px;">
                    <div style="color: #00ff88; font-weight: bold; margin-bottom: 10px;">📊 ОТВЕТОВ: ${stats.total}</div>
                    <div style="color: white;">✅ Правильных: ${stats.correct}</div>
                </div>
            `;
        } else {
            statsElement.innerHTML = `
                <div style="color: #00ff88; font-weight: bold; margin-bottom: 10px;">📊 ОТВЕТОВ: ${stats.total}</div>
                <div style="color: white;">✅ Правильных: ${stats.correct}</div>
            `;
        }
    }
}

function showQuestionStats(stats, question) {
    let statsHTML = `
        <div class="stats-item">
            <div class="stats-value">${stats.total}</div>
            <div class="stats-label">Всего ответов</div>
        </div>
        <div class="stats-item">
            <div class="stats-value">${stats.correct}</div>
            <div class="stats-label">Правильных</div>
        </div>
        <div class="stats-item">
            <div class="stats-value">${stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</div>
            <div class="stats-label">Успешность</div>
        </div>
        
        <div style="margin-top: 20px; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px;">
            <h4 style="color: #00adb5; margin-top: 0;">Распределение ответов:</h4>
    `;
    
    question.options.forEach((option, index) => {
        const count = stats.byOption[index] || 0;
        const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
        const isCorrect = index === question.correct;
        
        statsHTML += `
            <div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 5px; border-left: 4px solid ${isCorrect ? '#00ff88' : '#ff416c'}">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: ${isCorrect ? '#00ff88' : 'white'}">
                        <strong>${String.fromCharCode(65 + index)}.</strong> ${option}
                        ${isCorrect ? ' ✅' : ''}
                    </span>
                    <span style="color: #8f8f8f">${count} (${percentage}%)</span>
                </div>
                <div style="height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden;">
                    <div style="height: 100%; width: ${percentage}%; background: ${isCorrect ? '#00ff88' : '#ff416c'};"></div>
                </div>
            </div>
        `;
    });
    
    statsHTML += `</div>`;
    
    statsContent.innerHTML = statsHTML;
}

function updateQuestionsList() {
    questionsList.innerHTML = QUIZ_DATA.questions.map((q, index) => `
        <div class="question-item ${index === currentQuestionIndex ? 'active' : ''}">
            <div class="question-number">${index + 1}</div>
            <div>${q.type === 'oral' ? '🎤' : '📝'} ${q.text.substring(0, 50)}...</div>
            <div class="question-type">${getTypeLabel(q.type)}</div>
        </div>
    `).join('');
}

function getTypeLabel(type) {
    const labels = {
        oral: "Устное",
        spelling: "Орфография",
        punctuation: "Пунктуация",
        syntax: "Синтаксис"
    };
    return labels[type] || type;
}

function startPresentationTimer(seconds) {
    let timeLeft = seconds;
    presentationTimer.textContent = timeLeft;
    presentationTimer.style.color = '#00ff88';
    
    const timer = setInterval(() => {
        timeLeft--;
        presentationTimer.textContent = timeLeft;
        
        // Менять цвет при окончании времени
        if (timeLeft <= 10) {
            presentationTimer.style.color = '#ff416c';
            presentationTimer.style.animation = 'pulse 0.5s infinite';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            showAnswer(); // Автоматически показать ответ
        }
    }, 1000);
}

function copyGameCode() {
    if (!currentGameId) {
        alert("Сначала создайте игру!");
        return;
    }
    
    const code = currentGameId.replace('game_', '');
    navigator.clipboard.writeText(code).then(() => {
        showNotification("Код скопирован!");
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #00ff88;
        color: #000;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Добавить анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log("Teacher panel loaded");
    updateQuestionsList();
});
