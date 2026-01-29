// ============================================
// teacher.js - БЕЗ ТАЙМЕРА, С СЧЕТЧИКОМ ОТВЕТОВ
// ============================================

let currentGameId = null;
let currentQuestionIndex = 0;
let playersListener = null;
let answersListener = null;
let totalPlayers = 0;
let currentQuestionData = null;

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
const presentationQuestion = document.getElementById('presentationQuestion');
const presentationCounter = document.getElementById('presentationCounter');
const answeredCount = document.getElementById('answeredCount');
const totalPlayersCount = document.getElementById('totalPlayersCount');
const counterProgressFill = document.getElementById('counterProgressFill');
const resultsContainer = document.getElementById('resultsContainer');
const liveAnsweredCount = document.getElementById('liveAnsweredCount');
const liveTotalPlayers = document.getElementById('liveTotalPlayers');

// ================ ОСНОВНЫЕ ФУНКЦИИ ================

function startNewGame() {
    console.log("Создание новой игры");
    
    if (!window.db) {
        alert("Firebase не загружен. Обновите страницу.");
        return;
    }
    
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    currentGameId = "game_" + code;
    currentQuestionIndex = 0;
    totalPlayers = 0;
    currentQuestionData = null;
    
    // Обновить UI
    startSection.style.display = 'none';
    gameControls.style.display = 'block';
    gameCodeDisplay.textContent = code;
    currentQ.textContent = '0';
    totalQ.textContent = window.QUIZ_DATA ? window.QUIZ_DATA.questions.length : '30';
    playerCount.textContent = '0';
    
    // Очистить списки
    playersList.innerHTML = '<div class="empty-state"><div class="empty-icon">👤</div><p>Игроки появятся здесь после подключения</p></div>';
    statsContent.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p>Статистика появится после ответов на вопросы</p></div>';
    
    // Создать игру в Firebase
    const gameData = {
        id: currentGameId,
        created: Date.now(),
        status: "lobby",
        quizId: "oge_2026",
        currentQuestion: null,
        players: {},
        answers: {}
    };
    
    db.ref('games/' + currentGameId).set(gameData).then(() => {
        console.log("✅ Игра создана в Firebase");
        showNotification("🎮 Игра создана! Код: " + code);
        
        // Начать слушать игроков
        listenToPlayers();
        
        // Обновить список вопросов
        updateQuestionsList();
        
    }).catch(error => {
        console.error("❌ Ошибка создания игры:", error);
        alert("Ошибка создания игры: " + error.message);
    });
}

function startNextQuestion() {
    console.log("Запуск следующего вопроса");
    
    if (!currentGameId) {
        alert("Сначала создайте игру!");
        return;
    }
    
    const questions = window.QUIZ_DATA ? window.QUIZ_DATA.questions : [];
    currentQuestionData = questions[currentQuestionIndex];
    
    if (!currentQuestionData) {
        alert("🎉 Все вопросы пройдены!");
        return;
    }
    
    // Очистить старые ответы
    db.ref(`games/${currentGameId}/answers/${currentQuestionData.id}`).remove();
    
    // Скрыть результаты
    resultsContainer.classList.remove('visible');
    resultsContainer.innerHTML = '';
    
    // Обновить статус игры
    db.ref('games/' + currentGameId).update({
        status: "question_active",
        currentQuestion: currentQuestionData.id,
        questionStartTime: Date.now()
    }).then(() => {
        // Сбросить счетчик
        answeredCount.textContent = '0';
        totalPlayersCount.textContent = totalPlayers;
        liveAnsweredCount.textContent = '0';
        liveTotalPlayers.textContent = totalPlayers;
        counterProgressFill.style.width = '0%';
        
        // Переключить в режим презентации
        enterPresentationMode(currentQuestionData);
        
        // Начать слушать ответы в реальном времени
        listenToAnswers(currentQuestionData.id);
        
        // Обновить счетчик вопросов
        currentQuestionIndex++;
        currentQ.textContent = currentQuestionIndex;
        
        // Обновить список вопросов
        updateQuestionsList();
        
        showNotification("Вопрос " + currentQuestionIndex + " запущен");
        
    }).catch(error => {
        alert("Ошибка: " + error.message);
    });
}

function enterPresentationMode(question) {
    console.log("Вход в режим презентации");
    
    // Скрыть основной интерфейс
    mainInterface.style.display = 'none';
    
    // Показать режим презентации
    presentationMode.classList.add('active');
    
    // Показать номер вопроса
    presentationQNum.textContent = currentQuestionIndex;
    
    // Показать вопрос
    let questionHTML = `<h2 style="color: white; text-align: center; line-height: 1.4; margin: 0;">${question.text}</h2>`;
    
    if (question.text.length > 200) {
        questionHTML = `<div style="max-height: 400px; overflow-y: auto; padding-right: 20px;">
            <h2 style="color: white; text-align: center; line-height: 1.4; margin: 0;">${question.text}</h2>
        </div>`;
    }
    
    presentationQuestion.innerHTML = questionHTML;
}

function listenToAnswers(questionId) {
    // Отписаться от предыдущего слушателя
    if (answersListener) {
        answersListener();
    }
    
    // Слушать ответы на текущий вопрос в реальном времени
    answersListener = db.ref(`games/${currentGameId}/answers/${questionId}`).on('value', snapshot => {
        const answers = snapshot.val() || {};
        const answered = Object.keys(answers).length;
        
        // Обновить счетчик в режиме презентации
        answeredCount.textContent = answered;
        liveAnsweredCount.textContent = answered;
        
        // Обновить прогресс-бар
        if (totalPlayers > 0) {
            const percentage = Math.min(100, (answered / totalPlayers) * 100);
            counterProgressFill.style.width = `${percentage}%`;
            
            // Менять цвет прогресс-бара
            if (percentage >= 80) {
                counterProgressFill.style.background = 'linear-gradient(90deg, var(--success), #00ff88)';
            } else if (percentage >= 50) {
                counterProgressFill.style.background = 'linear-gradient(90deg, var(--warning), var(--accent))';
            } else {
                counterProgressFill.style.background = 'linear-gradient(90deg, var(--primary), var(--accent))';
            }
        }
    });
}

function showAnswerInPresentation() {
    console.log("Показать ответ в режиме презентации");
    
    if (!currentQuestionData) {
        showNotification("Нет активного вопроса!");
        return;
    }
    
    // Отписаться от слушателя ответов
    if (answersListener) {
        answersListener();
        answersListener = null;
    }
    
    // Получить статистику ответов
    db.ref(`games/${currentGameId}/answers/${currentQuestionData.id}`).once('value').then(snapshot => {
        const answers = snapshot.val() || {};
        showQuestionResults(answers, currentQuestionData);
        
        // Обновить статус игры
        if (currentGameId) {
            db.ref('games/' + currentGameId).update({
                status: "showing_results"
            });
        }
        
        showNotification("Ответ показан");
        
    }).catch(error => {
        console.error("Ошибка получения ответов:", error);
        showQuestionResults({}, currentQuestionData);
    });
}

function showQuestionResults(answers, question) {
    // Подсчитать статистику по вариантам ответов
    const stats = question.options.map(() => 0);
    let totalAnswered = 0;
    let correctCount = 0;
    
    Object.values(answers).forEach(answer => {
        if (answer.answerIndex >= 0 && answer.answerIndex < question.options.length) {
            stats[answer.answerIndex]++;
            totalAnswered++;
            if (answer.answerIndex === question.correct) {
                correctCount++;
            }
        }
    });
    
    // Скрыть счетчик ответов
    presentationCounter.style.display = 'none';
    
    // Показать правильный ответ
    let questionHTML = `<h2 style="color: white; text-align: center; line-height: 1.4; margin: 0;">${question.text}</h2>`;
    
    if (question.text.length > 200) {
        questionHTML = `<div style="max-height: 400px; overflow-y: auto; padding-right: 20px;">
            <h2 style="color: white; text-align: center; line-height: 1.4; margin: 0;">${question.text}</h2>
        </div>`;
    }
    
    // Добавить правильный ответ
    questionHTML += `
        <div style="margin-top: 30px; padding: 25px; background: rgba(0, 255, 136, 0.1); border-radius: 15px; border: 3px solid #00ff88;">
            <h3 style="color: #00ff88; margin-top: 0; font-size: 1.5rem;">✅ ПРАВИЛЬНЫЙ ОТВЕТ:</h3>
            <div style="font-size: 1.8rem; color: white; margin: 15px 0; font-weight: bold;">${question.options[question.correct]}</div>
            <div style="color: #8f8f8f; font-style: italic; padding-top: 15px; border-top: 2px solid rgba(255,255,255,0.1); font-size: 1.1rem;">${question.explanation}</div>
        </div>
    `;
    
    presentationQuestion.innerHTML = questionHTML;
    
    // Показать детальные результаты
    showDetailedResults(stats, question, totalAnswered, correctCount);
    
    // Обновить статистику в основном интерфейсе
    updateMainStats(stats, question, totalAnswered, correctCount);
}

function showDetailedResults(stats, question, totalAnswered, correctCount) {
    const percentage = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    
    let optionsHTML = '';
    
    question.options.forEach((option, index) => {
        const isCorrect = index === question.correct;
        const count = stats[index] || 0;
        const optionPercentage = totalAnswered > 0 ? Math.round((count / totalAnswered) * 100) : 0;
        
        optionsHTML += `
            <div style="padding: 15px; background: ${isCorrect ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)'}; 
                         border-radius: 10px; border: 2px solid ${isCorrect ? 'var(--success)' : 'transparent'};">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <div style="font-size: 1.1rem; line-height: 1.4;">${option}</div>
                    <div style="font-weight: bold; font-size: 1.3rem; color: ${isCorrect ? 'var(--success)' : 'var(--accent)'}">
                        ${count} (${optionPercentage}%)
                    </div>
                </div>
                <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-top: 8px; overflow: hidden;">
                    <div style="height: 100%; width: ${optionPercentage}%; background: ${isCorrect ? 'var(--success)' : 'var(--accent)'}; border-radius: 4px;"></div>
                </div>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = `
        <h3 style="color: var(--accent); margin-top: 0; font-size: 1.5rem; text-align: center;">📊 РЕЗУЛЬТАТЫ ОТВЕТОВ</h3>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; text-align: center;">
            <div style="padding: 15px; background: rgba(67, 97, 238, 0.1); border-radius: 10px;">
                <div style="font-size: 2rem; color: var(--accent); font-weight: bold;">${totalAnswered}</div>
                <div style="color: var(--gray); font-size: 0.9rem;">Всего ответов</div>
            </div>
            <div style="padding: 15px; background: rgba(0, 255, 136, 0.1); border-radius: 10px;">
                <div style="font-size: 2rem; color: var(--success); font-weight: bold;">${correctCount}</div>
                <div style="color: var(--gray); font-size: 0.9rem;">Правильных</div>
            </div>
            <div style="padding: 15px; background: rgba(255, 158, 0, 0.1); border-radius: 10px;">
                <div style="font-size: 2rem; color: var(--warning); font-weight: bold;">${percentage}%</div>
                <div style="color: var(--gray); font-size: 0.9rem;">Успешность</div>
            </div>
        </div>
        
        <h4 style="color: var(--accent); margin: 20px 0 15px 0; font-size: 1.2rem;">Распределение по вариантам:</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            ${optionsHTML}
        </div>
        
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); color: var(--gray); font-size: 0.9rem; text-align: center;">
            ✅ - правильный ответ
        </div>
    `;
    
    resultsContainer.classList.add('visible');
}

function updateMainStats(stats, question, totalAnswered, correctCount) {
    const percentage = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    
    statsContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-value">${totalAnswered}</div>
                <div class="stat-label">Всего ответов</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${correctCount}</div>
                <div class="stat-label">Правильных</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${percentage}%</div>
                <div class="stat-label">Успешность</div>
            </div>
        </div>
    `;
}

// ================ УПРАВЛЕНИЕ ИГРОКАМИ ================

function listenToPlayers() {
    if (!currentGameId) return;
    
    if (playersListener) {
        playersListener();
    }
    
    playersListener = db.ref(`games/${currentGameId}/players`).on('value', snapshot => {
        const players = snapshot.val() || {};
        const playerArray = Object.entries(players).map(([name, data]) => ({
            name,
            ...data
        }));
        
        totalPlayers = playerArray.length;
        playerCount.textContent = totalPlayers;
        totalPlayersCount.textContent = totalPlayers;
        liveTotalPlayers.textContent = totalPlayers;
        updatePlayersList(playerArray);
    });
}

function updatePlayersList(players) {
    if (players.length === 0) {
        playersList.innerHTML = '<div class="empty-state"><div class="empty-icon">👤</div><p>Игроки появятся здесь после подключения</p></div>';
        return;
    }
    
    // Сортируем по очкам
    players.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    playersList.innerHTML = players.map((player, index) => `
        <div class="player-card">
            <div class="player-avatar">${player.name.charAt(0).toUpperCase()}</div>
            <div class="player-name">${player.name}</div>
            <div class="player-score">🎯 ${player.score || 0} очков</div>
            
            <!-- Кнопка кика -->
            <div class="kick-player-btn" onclick="event.stopPropagation(); kickPlayer('${player.name.replace(/'/g, "\\'")}')" title="Удалить игрока">
                <i class="fas fa-times"></i>
            </div>
        </div>
    `).join('');
}

function kickPlayer(playerName) {
    if (!currentGameId || !playerName) return;
    
    if (confirm(`Вы уверены, что хотите удалить игрока "${playerName}" из игры?`)) {
        db.ref(`games/${currentGameId}/players/${playerName}`).remove()
            .then(() => {
                console.log(`✅ Игрок ${playerName} удален`);
                showNotification(`👢 Игрок "${playerName}" удален из игры`);
            })
            .catch(error => {
                console.error("❌ Ошибка удаления игрока:", error);
                showNotification(`❌ Не удалось удалить игрока "${playerName}"`);
            });
    }
}

// ================ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ================

function showAnswer() {
    console.log("Показать ответ из основного интерфейса");
    
    if (!currentGameId) {
        alert("Сначала создайте игру!");
        return;
    }
    
    if (currentQuestionIndex === 0) {
        alert("Сначала запустите вопрос!");
        return;
    }
    
    // Если мы не в режиме презентации, нужно его включить
    if (!presentationMode.classList.contains('active')) {
        const questions = window.QUIZ_DATA ? window.QUIZ_DATA.questions : [];
        const questionIndex = currentQuestionIndex - 1;
        currentQuestionData = questions[questionIndex];
        
        if (currentQuestionData) {
            // Входим в режим презентации с текущим вопросом
            enterPresentationMode(currentQuestionData);
            
            // Через секунду показываем ответ
            setTimeout(() => {
                showAnswerInPresentation();
            }, 1000);
        }
    } else {
        // Если уже в режиме презентации
        showAnswerInPresentation();
    }
}

function exitPresentation() {
    console.log("Выход из режима презентации");
    
    // Отписаться от слушателя ответов
    if (answersListener) {
        answersListener();
        answersListener = null;
    }
    
    // Скрыть режим презентации
    presentationMode.classList.remove('active');
    
    // Показать основной интерфейс
    mainInterface.style.display = 'flex';
    
    // Обновить статус игры
    if (currentGameId) {
        db.ref('games/' + currentGameId).update({
            status: "lobby"
        });
    }
    
    showNotification("Вы вернулись в панель управления");
}

function nextQuestion() {
    console.log("Следующий вопрос");
    exitPresentation();
}

function resetGame() {
    console.log("Сброс игры");
    
    if (confirm("Удалить текущую игру и начать заново?")) {
        if (currentGameId) {
            db.ref('games/' + currentGameId).remove();
        }
        
        // Сбросить всё
        currentGameId = null;
        currentQuestionIndex = 0;
        currentQuestionData = null;
        totalPlayers = 0;
        startSection.style.display = 'block';
        gameControls.style.display = 'none';
        gameCodeDisplay.textContent = '----';
        playersList.innerHTML = '<div class="empty-state"><div class="empty-icon">👤</div><p>Игроки появятся здесь после подключения</p></div>';
        playerCount.textContent = '0';
        statsContent.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p>Статистика появится после ответов на вопросы</p></div>';
        currentQ.textContent = '0';
        
        // Отписаться от слушателей
        if (playersListener) {
            playersListener();
            playersListener = null;
        }
        if (answersListener) {
            answersListener();
            answersListener = null;
        }
        
        // Выйти из режима презентации
        if (presentationMode.classList.contains('active')) {
            presentationMode.classList.remove('active');
            mainInterface.style.display = 'flex';
        }
        
        showNotification("Игра сброшена");
    }
}

function updateQuestionsList() {
    const questions = window.QUIZ_DATA ? window.QUIZ_DATA.questions : [];
    questionsList.innerHTML = questions.map((q, index) => {
        const isCurrent = index === currentQuestionIndex - 1;
        const isUpcoming = index === currentQuestionIndex;
        const isCompleted = index < currentQuestionIndex - 1;
        
        let statusClass = '';
        if (isCurrent) statusClass = 'active';
        else if (isUpcoming) statusClass = '';
        else if (isCompleted) statusClass = 'completed';
        
        return `
            <div class="question-item ${statusClass}" onclick="selectQuestion(${index})">
                <div class="question-number">${index + 1}</div>
                <div style="font-size: 0.9rem; color: ${isCurrent ? '#ff9e00' : '#8f8f8f'}; margin-top: 5px;">
                    ${isCurrent ? 'Текущий' : isCompleted ? 'Пройден' : 'Предстоящий'}
                </div>
            </div>
        `;
    }).join('');
}

function selectQuestion(index) {
    const questions = window.QUIZ_DATA ? window.QUIZ_DATA.questions : [];
    if (index < 0 || index >= questions.length) return;
    
    const question = questions[index];
    if (!question) return;
    
    // Переключиться на выбранный вопрос
    currentQuestionIndex = index;
    
    // Запустить вопрос
    startNextQuestion();
}

function copyGameCode() {
    if (!currentGameId) {
        alert("Сначала создайте игру!");
        return;
    }
    
    const code = currentGameId.replace('game_', '');
    navigator.clipboard.writeText(code).then(() => {
        showNotification("📋 Код скопирован в буфер!");
    }).catch(err => {
        alert("Не удалось скопировать код: " + err);
    });
}

function showNotification(message) {
    // Удаляем старые уведомления
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ================ ИНИЦИАЛИЗАЦИЯ ================

document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Teacher panel loaded");
    
    if (!window.QUIZ_DATA) {
        console.error("❌ QUIZ_DATA не загружен!");
        alert("Ошибка загрузки вопросов. Обновите страницу.");
        return;
    }
    
    console.log(`📚 Загружено вопросов: ${window.QUIZ_DATA.questions.length}`);
    totalQ.textContent = window.QUIZ_DATA.questions.length;
    updateQuestionsList();
});
