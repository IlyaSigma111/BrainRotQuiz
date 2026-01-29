// ============================================
// teacher.js - ПОЛНАЯ ВЕРСИЯ С ФИКСАМИ
// ============================================

let currentGameId = null;
let currentQuestionIndex = 0;
let playersListener = null;
let gameListener = null;
let currentStats = null;
let presentationTimerInterval = null;
let updateLiveStatsInterval = null;

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
    if (!window.db) {
        alert("Firebase не загружен. Обновите страницу.");
        return;
    }
    
    // Генерируем код игры из 8 цифр
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    currentGameId = "game_" + code;
    currentQuestionIndex = 0;
    
    console.log(`🎮 Создаю игру: ${currentGameId}`);
    
    // Обновить UI
    startSection.style.display = 'none';
    gameControls.style.display = 'block';
    gameCodeDisplay.textContent = code;
    currentQ.textContent = '0';
    totalQ.textContent = QUIZ_DATA.questions.length;
    
    // Создать игру в Firebase
    const gameData = {
        id: currentGameId,
        created: Date.now(),
        status: "lobby",
        quizId: QUIZ_DATA.id,
        currentQuestion: null,
        players: {},
        answers: {},
        settings: {
            timer: 45, // ИЗМЕНЕНО: 45 секунд вместо 25
            autoShowResults: true
        }
    };
    
    db.ref('games/' + currentGameId).set(gameData).then(() => {
        console.log("✅ Игра создана в Firebase");
        showNotification("🎮 Игра создана! Код: " + code);
        
        // Начать слушать игроков
        listenToPlayers();
        
        // Обновить список вопросов
        updateQuestionsList();
        
        // Начать слушать изменения игры
        listenToGameChanges();
        
    }).catch(error => {
        console.error("❌ Ошибка создания игры:", error);
        alert("Ошибка создания игры: " + error.message);
    });
}

function startNextQuestion() {
    if (!currentGameId) {
        alert("Сначала создайте игру!");
        return;
    }
    
    const question = QUIZ_DATA.questions[currentQuestionIndex];
    if (!question) {
        alert("🎉 Все вопросы пройдены!");
        return;
    }
    
    console.log(`▶️ Запускаю вопрос ${currentQuestionIndex + 1}: ${question.id}`);
    
    // 1. ОЧИСТИТЬ старые ответы на этот вопрос
    db.ref(`games/${currentGameId}/answers/${question.id}`).remove();
    
    // 2. Обновить статус игры в Firebase - ВАЖНО: сначала меняем вопрос
    db.ref('games/' + currentGameId).update({
        status: "question_active",
        currentQuestion: question.id,
        questionStartTime: Date.now(),
        lastAction: "question_started"
    }).then(() => {
        // 3. Переключить в режим презентации
        enterPresentationMode(question);
        
        // 4. Запустить таймер НА 45 СЕКУНД (ИЗМЕНЕНО)
        startPresentationTimer(45);
        
        // 5. Обновить счетчик вопросов
        currentQuestionIndex++;
        currentQ.textContent = currentQuestionIndex;
        
        // 6. Обновить список вопросов (подсветить текущий)
        updateQuestionsList();
        
        console.log(`✅ Вопрос ${question.id} запущен`);
        
    }).catch(error => {
        console.error("❌ Ошибка запуска вопроса:", error);
        alert("Ошибка: " + error.message);
    });
}

function enterPresentationMode(question) {
    // Скрыть основной интерфейс
    mainInterface.style.display = 'none';
    presentationMode.style.display = 'flex';
    
    // Показать вопрос
    presentationQNum.textContent = currentQuestionIndex;
    
    // Форматируем текст вопроса
    let questionHTML = `<h2>${question.text}</h2>`;
    
    // Если вопрос длинный, добавляем прокрутку
    if (question.text.length > 200) {
        questionHTML = `<div style="max-height: 400px; overflow-y: auto; padding-right: 10px;">
            <h2>${question.text}</h2>
        </div>`;
    }
    
    presentationQuestion.innerHTML = questionHTML;
    
    // Начать слушать ответы для статистики
    listenToQuestionAnswers(question.id);
    
    // Обновить статистику каждые 3 секунды
    updateLiveStatsInterval = setInterval(() => {
        if (currentGameId && question.id) {
            db.ref(`games/${currentGameId}/answers/${question.id}`).once('value').then(snapshot => {
                const answers = snapshot.val() || {};
                const stats = calculateStats(answers, question);
                updateLiveStats(stats);
            });
        }
    }, 3000);
}

function exitPresentation() {
    // Вернуться к основному интерфейсу
    mainInterface.style.display = 'flex';
    presentationMode.style.display = 'none';
    
    // Остановить таймер
    if (presentationTimerInterval) {
        clearInterval(presentationTimerInterval);
        presentationTimerInterval = null;
    }
    
    // Остановить обновление статистики
    if (updateLiveStatsInterval) {
        clearInterval(updateLiveStatsInterval);
        updateLiveStatsInterval = null;
    }
    
    // Обновить статус игры
    if (currentGameId) {
        db.ref('games/' + currentGameId).update({
            status: "lobby",
            lastAction: "presentation_exited"
        });
    }
}

function toggleCompactMode() {
    const questionElement = document.getElementById('presentationQuestion');
    const btn = document.getElementById('compactBtn');
    
    if (questionElement.classList.contains('compact')) {
        questionElement.classList.remove('compact');
        btn.innerHTML = '📱 КОМПАКТНО';
    } else {
        questionElement.classList.add('compact');
        btn.innerHTML = '📊 ПОЛНЫЙ ВИД';
    }
}

function showAnswer() {
    const question = QUIZ_DATA.questions[currentQuestionIndex - 1];
    if (!question) return;
    
    // ФИКС: Получение правильного ответа для массивов
    let correctAnswerText = '';
    if (Array.isArray(question.correct)) {
        // Для вопросов с несколькими правильными ответами
        const correctOptions = question.correct.map(index => question.options[index]);
        correctAnswerText = correctOptions.join('<br>• ');
    } else {
        // Для вопросов с одним правильным ответом
        correctAnswerText = question.options[question.correct];
    }
    
    // Показать правильный ответ
    presentationQuestion.innerHTML += `
        <div style="margin-top: 40px; padding: 25px; background: rgba(0, 255, 136, 0.1); border-radius: 15px; border: 3px solid #00ff88;">
            <h3 style="color: #00ff88; margin-top: 0; font-size: 24px;">✅ ПРАВИЛЬНЫЙ ОТВЕТ:</h3>
            <div style="font-size: 28px; color: white; margin: 20px 0; font-weight: bold;">${correctAnswerText}</div>
            <div style="color: #8f8f8f; font-style: italic; font-size: 18px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">${question.explanation}</div>
        </div>
    `;
    
    // Показать статистику
    if (currentStats) {
        showQuestionStats(currentStats, question);
    }
    
    // Переключить статус игры на показ результатов
    if (currentGameId) {
        db.ref('games/' + currentGameId).update({
            status: "showing_results",
            lastAction: "answer_shown"
        });
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
            currentQuestion: null,
            lastAction: "question_ended"
        });
    }
    
    // Если в режиме презентации - выйти
    if (presentationMode.style.display !== 'none') {
        exitPresentation();
    }
}

function resetGame() {
    if (confirm("Вы уверены? Это удалит текущую игру и все результаты!")) {
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
        if (playersListener) {
            playersListener();
            playersListener = null;
        }
        if (gameListener) {
            gameListener();
            gameListener = null;
        }
        
        // Остановить таймеры
        if (presentationTimerInterval) {
            clearInterval(presentationTimerInterval);
            presentationTimerInterval = null;
        }
        
        console.log("🔄 Игра сброшена");
        showNotification("Игра сброшена");
    }
}

// ================ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ================

function listenToPlayers() {
    if (!currentGameId || playersListener) return;
    
    console.log(`👥 Начинаю слушать игроков в игре ${currentGameId}`);
    
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

function listenToGameChanges() {
    if (!currentGameId || gameListener) return;
    
    gameListener = db.ref(`games/${currentGameId}`).on('value', snapshot => {
        const game = snapshot.val();
        if (!game) return;
        
        // Обновить статус игры в заголовке
        updateGameStatusDisplay(game.status);
    });
}

function updatePlayersList(players) {
    if (players.length === 0) {
        playersList.innerHTML = '<div class="empty-lobby"><div class="empty-icon">👤</div><p>Игроки появятся здесь после подключения</p></div>';
        return;
    }
    
    // Сортируем по очкам
    players.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    playersList.innerHTML = players.map((player, index) => `
        <div class="player-card" style="border-color: ${getRankColor(index)};">
            <div class="player-avatar" style="background: ${getRankColor(index)};">${player.name.charAt(0).toUpperCase()}</div>
            <div class="player-name">${player.name}</div>
            <div class="player-score">🎯 ${player.score || 0} очков</div>
            <div class="player-device">${player.device || '📱'}</div>
        </div>
    `).join('');
}

function getRankColor(rank) {
    const colors = [
        'linear-gradient(135deg, #FFD700, #FFA500)', // 1 место - золото
        'linear-gradient(135deg, #C0C0C0, #A0A0A0)', // 2 место - серебро
        'linear-gradient(135deg, #CD7F32, #A0522D)', // 3 место - бронза
        '#00adb5', // остальные
        '#4361ee',
        '#3a0ca3',
        '#7209b7'
    ];
    return colors[Math.min(rank, colors.length - 1)];
}

function listenToQuestionAnswers(questionId) {
    if (!currentGameId) return;
    
    console.log(`📊 Слушаю ответы на вопрос ${questionId}`);
    
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
        byOption: question.options.map(() => 0),
        averageTime: 0,
        times: []
    };
    
    Object.values(answers).forEach(answer => {
        stats.total++;
        if (answer.answerIndex >= 0 && answer.answerIndex < question.options.length) {
            stats.byOption[answer.answerIndex]++;
            
            // ФИКС: Проверка для массивов правильных ответов
            let isCorrect = false;
            if (Array.isArray(question.correct)) {
                isCorrect = question.correct.includes(answer.answerIndex);
            } else {
                isCorrect = (answer.answerIndex === question.correct);
            }
            
            if (isCorrect) {
                stats.correct++;
            }
        }
        if (answer.timeSpent) {
            stats.times.push(answer.timeSpent);
        }
    });
    
    if (stats.times.length > 0) {
        stats.averageTime = Math.round(stats.times.reduce((a, b) => a + b) / stats.times.length);
    }
    
    return stats;
}

function updateLiveStats(stats) {
    // Обновить в режиме презентации
    if (presentationMode.style.display !== 'none') {
        let statsHTML = `
            <div style="margin-top: 30px; padding: 20px; background: rgba(0, 173, 181, 0.2); border-radius: 15px; border: 2px solid #00adb5;">
                <div style="display: flex; justify-content: space-around; text-align: center;">
                    <div>
                        <div style="font-size: 32px; color: #00ff88; font-weight: bold;">${stats.total}</div>
                        <div style="color: rgba(255,255,255,0.8);">ответов</div>
                    </div>
                    <div>
                        <div style="font-size: 32px; color: #00ff88; font-weight: bold;">${stats.correct}</div>
                        <div style="color: rgba(255,255,255,0.8);">правильно</div>
                    </div>
                    <div>
                        <div style="font-size: 32px; color: #00ff88; font-weight: bold;">${stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</div>
                        <div style="color: rgba(255,255,255,0.8);">успешность</div>
                    </div>
                </div>
        `;
        
        // Добавить прогресс-бары для каждого варианта
        if (stats.total > 0) {
            const question = QUIZ_DATA.questions.find(q => q.id == currentStats?.questionId);
            if (question && question.options) {
                statsHTML += `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="color: #00adb5; font-weight: bold; margin-bottom: 10px;">Распределение ответов:</div>`;
                
                question.options.forEach((option, index) => {
                    const count = stats.byOption[index] || 0;
                    const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    
                    // ФИКС: Проверка правильности для массивов
                    let isCorrect = false;
                    if (Array.isArray(question.correct)) {
                        isCorrect = question.correct.includes(index);
                    } else {
                        isCorrect = (index === question.correct);
                    }
                    
                    statsHTML += `
                        <div style="margin: 8px 0;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                <span style="color: ${isCorrect ? '#00ff88' : 'white'}">
                                    ${String.fromCharCode(65 + index)}. ${option.substring(0, 30)}${option.length > 30 ? '...' : ''}
                                </span>
                                <span style="color: #8f8f8f">${count} (${percentage}%)</span>
                            </div>
                            <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                                <div style="height: 100%; width: ${percentage}%; background: ${isCorrect ? '#00ff88' : '#ff416c'}; transition: width 0.5s;"></div>
                            </div>
                        </div>
                    `;
                });
                
                statsHTML += `</div>`;
            }
        }
        
        statsHTML += `</div>`;
        
        // Обновить или добавить блок статистики
        let statsElement = document.getElementById('liveStats');
        if (!statsElement) {
            presentationQuestion.innerHTML += `<div id="liveStats">${statsHTML}</div>`;
        } else {
            statsElement.innerHTML = statsHTML;
        }
    }
}

function showQuestionStats(stats, question) {
    let statsHTML = `
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
            <div class="stats-item" style="background: rgba(0, 173, 181, 0.1); padding: 15px; border-radius: 10px; text-align: center;">
                <div class="stats-value" style="font-size: 32px; color: #00ff88; font-weight: bold;">${stats.total}</div>
                <div class="stats-label" style="color: #8f8f8f;">Всего ответов</div>
            </div>
            <div class="stats-item" style="background: rgba(0, 173, 181, 0.1); padding: 15px; border-radius: 10px; text-align: center;">
                <div class="stats-value" style="font-size: 32px; color: #00ff88; font-weight: bold;">${stats.correct}</div>
                <div class="stats-label" style="color: #8f8f8f;">Правильных</div>
            </div>
            <div class="stats-item" style="background: rgba(0, 173, 181, 0.1); padding: 15px; border-radius: 10px; text-align: center;">
                <div class="stats-value" style="font-size: 32px; color: #00ff88; font-weight: bold;">${stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</div>
                <div class="stats-label" style="color: #8f8f8f;">Успешность</div>
            </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin-top: 20px;">
            <h4 style="color: #00adb5; margin-top: 0; margin-bottom: 15px;">📈 Распределение ответов:</h4>
    `;
    
    question.options.forEach((option, index) => {
        const count = stats.byOption[index] || 0;
        const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
        
        // ФИКС: Проверка правильности для массивов
        let isCorrect = false;
        if (Array.isArray(question.correct)) {
            isCorrect = question.correct.includes(index);
        } else {
            isCorrect = (index === question.correct);
        }
        
        statsHTML += `
            <div style="margin: 12px 0; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 4px solid ${isCorrect ? '#00ff88' : '#ff416c'}">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: ${isCorrect ? '#00ff88' : 'white'}; font-weight: ${isCorrect ? 'bold' : 'normal'}">
                        <strong>${String.fromCharCode(65 + index)}.</strong> ${option}
                        ${isCorrect ? ' ✅' : ''}
                    </span>
                    <span style="color: #8f8f8f">${count} ответов (${percentage}%)</span>
                </div>
                <div style="height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden;">
                    <div style="height: 100%; width: ${percentage}%; background: ${isCorrect ? '#00ff88' : '#ff416c'}; transition: width 0.5s;"></div>
                </div>
            </div>
        `;
    });
    
    statsHTML += `</div>`;
    
    statsContent.innerHTML = statsHTML;
}

function updateQuestionsList() {
    questionsList.innerHTML = QUIZ_DATA.questions.map((q, index) => {
        const isCurrent = index === currentQuestionIndex - 1;
        const isUpcoming = index === currentQuestionIndex;
        const isCompleted = index < currentQuestionIndex - 1;
        
        let statusClass = '';
        let statusText = '';
        
        if (isCurrent) {
            statusClass = 'active';
            statusText = '🔴 СЕЙЧАС';
        } else if (isUpcoming) {
            statusClass = 'upcoming';
            statusText = '⏳ ДАЛЕЕ';
        } else if (isCompleted) {
            statusClass = 'completed';
            statusText = '✅ ПРОЙДЕН';
        }
        
        return `
            <div class="question-item ${statusClass}" onclick="selectQuestion(${index})" style="cursor: pointer;">
                <div class="question-number" style="background: ${isCurrent ? '#ff416c' : isCompleted ? '#00ff88' : '#00adb5'}">${index + 1}</div>
                <div style="flex: 1;">
                    <div style="font-weight: ${isCurrent ? 'bold' : 'normal'}; color: white;">${q.type === 'oral' ? '🎤' : '📝'} Вопрос ${index + 1}</div>
                    <div class="question-type">${getTypeLabel(q.type)}</div>
                    <div style="font-size: 12px; color: ${isCurrent ? '#ff9e00' : '#8f8f8f'}; margin-top: 3px;">${statusText}</div>
                </div>
            </div>
        `;
    }).join('');
}

function selectQuestion(index) {
    if (index < 0 || index >= QUIZ_DATA.questions.length) return;
    
    const question = QUIZ_DATA.questions[index];
    if (!question) return;
    
    // Переключиться на выбранный вопрос
    currentQuestionIndex = index;
    
    // Очистить ответы на этот вопрос
    if (currentGameId) {
        db.ref(`games/${currentGameId}/answers/${question.id}`).remove();
    }
    
    // Запустить вопрос
    startNextQuestion();
}

function getTypeLabel(type) {
    const labels = {
        oral: "Устное собеседование",
        grammar: "Грамматика",
        syntax: "Синтаксис",
        punctuation: "Пунктуация",
        spelling: "Орфография",
        morphology: "Морфология",
        reading: "Чтение",
        stylistics: "Стилистика",
        lexicology: "Лексикология",
        writing: "Изложение",
        composition: "Сочинение",
        exam_rules: "Правила ОГЭ",
        grading: "Оценивание"
    };
    return labels[type] || type;
}

function startPresentationTimer(seconds) {
    let timeLeft = seconds;
    presentationTimer.textContent = timeLeft;
    presentationTimer.style.color = '#00ff88';
    presentationTimer.style.animation = 'none';
    
    // Очищаем предыдущий таймер
    if (presentationTimerInterval) {
        clearInterval(presentationTimerInterval);
    }
    
    presentationTimerInterval = setInterval(() => {
        timeLeft--;
        presentationTimer.textContent = timeLeft;
        
        // Менять цвет при окончании времени
        if (timeLeft <= 5) {
            presentationTimer.style.color = '#ff416c';
            presentationTimer.style.animation = 'pulse 0.5s infinite';
        } else if (timeLeft <= 15) {
            presentationTimer.style.color = '#ff9e00';
            presentationTimer.style.animation = 'none';
        }
        
        if (timeLeft <= 0) {
            clearInterval(presentationTimerInterval);
            // Автоматически показываем ответ через 3 секунды
            setTimeout(() => {
                if (presentationMode.style.display !== 'none') {
                    showAnswer();
                }
            }, 3000);
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
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function updateGameStatusDisplay(status) {
    // Можно добавить отображение статуса в заголовок
    const statusElement = document.getElementById('gameStatus');
    if (statusElement) {
        const statusText = {
            'lobby': '🟢 ЛОББИ',
            'question_active': '🔴 ВОПРОС АКТИВЕН',
            'showing_results': '🟡 РЕЗУЛЬТАТЫ',
            'finished': '⚫ ЗАВЕРШЕНО'
        }[status] || status;
        
        statusElement.textContent = statusText;
    }
}

// Добавляем стили для анимаций
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
    
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.05); }
    }
    
    .question-item.active {
        border: 2px solid #ff416c !important;
        background: rgba(255, 65, 108, 0.1) !important;
    }
    
    .question-item.completed {
        border: 2px solid #00ff88 !important;
        background: rgba(0, 255, 136, 0.1) !important;
    }
    
    .question-item.upcoming {
        border: 2px solid #00adb5 !important;
        background: rgba(0, 173, 181, 0.1) !important;
    }
`;
document.head.appendChild(style);

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Teacher panel loaded");
    
    // Проверяем загрузку данных
    if (!window.QUIZ_DATA) {
        console.error("❌ QUIZ_DATA не загружен!");
        alert("Ошибка загрузки вопросов. Обновите страницу.");
        return;
    }
    
    console.log(`📚 Загружено вопросов: ${QUIZ_DATA.questions.length}`);
    
    // Инициализируем список вопросов
    updateQuestionsList();
    
    // Проверяем Firebase
    if (!window.db) {
        console.error("❌ Firebase не загружен!");
        alert("Ошибка загрузки базы данных. Обновите страницу.");
    }
});
