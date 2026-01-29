// ============================================
// student.js - ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ С РЕАЛЬНЫМ КИКОМ
// ============================================

let currentGameId = null;
let playerName = null;
let currentQuestion = null;
let hasAnswered = false;
let timerInterval = null;
let gameListener = null;
let kickListener = null;
let playerStatusListener = null;
let selectedOption = null;

// DOM элементы
const joinScreen = document.getElementById('joinScreen');
const waitingScreen = document.getElementById('waitingScreen');
const questionScreen = document.getElementById('questionScreen');
const resultScreen = document.getElementById('resultScreen');
const playerNameInput = document.getElementById('playerName');
const gameCodeInput = document.getElementById('gameCode');
const displayName = document.getElementById('displayName');
const displayCode = document.getElementById('displayCode');
const roomPlayers = document.getElementById('roomPlayers');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const studentTimer = document.getElementById('studentTimer');
const answerStatus = document.getElementById('answerStatus');
const resultContent = document.getElementById('resultContent');
const nextCountdown = document.getElementById('nextCountdown');
const currentQ = document.getElementById('currentQ');
const questionType = document.getElementById('questionType');

// ================ СИСТЕМА КИКА ================

// Основная функция кика - ВЫЗЫВАЕТСЯ ИЗВНЕ!
function forceKickPlayer() {
    console.log("🚫 ВЫЗВАН ПРИНУДИТЕЛЬНЫЙ КИК!");
    
    // 1. Остановить ВСЕ слушатели
    stopAllListeners();
    
    // 2. Очистить все таймеры
    clearAllTimers();
    
    // 3. Удалить себя из базы (если еще есть доступ)
    if (currentGameId && playerName) {
        try {
            db.ref(`games/${currentGameId}/players/${playerName}`).remove();
        } catch (e) {
            console.log("Не удалось удалить из базы, но это нормально");
        }
    }
    
    // 4. Сбросить все переменные
    resetGameState();
    
    // 5. Показать сообщение и перезагрузить
    alert("❌ Вас удалили из игры модератором!");
    setTimeout(() => {
        location.reload(); // ПОЛНАЯ перезагрузка страницы
    }, 1000);
}

// Остановить все слушатели Firebase
function stopAllListeners() {
    if (gameListener) {
        gameListener();
        gameListener = null;
        console.log("✅ Остановлен слушатель игры");
    }
    
    if (kickListener) {
        kickListener();
        kickListener = null;
        console.log("✅ Остановлен слушатель киков");
    }
    
    if (playerStatusListener) {
        playerStatusListener();
        playerStatusListener = null;
        console.log("✅ Остановлен слушатель статуса");
    }
}

// Очистить все таймеры
function clearAllTimers() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Очистить все возможные таймауты
    const maxTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < maxTimeoutId; i++) {
        clearTimeout(i);
        clearInterval(i);
    }
}

// ================ ПРОВЕРКА КИКА ================

// Проверяем, кикнули ли нас
function checkIfKicked() {
    if (!currentGameId || !playerName) return;
    
    console.log("🔍 Проверяю, не кикнули ли меня...");
    
    // Слушаем свой статус в игре
    playerStatusListener = db.ref(`games/${currentGameId}/players/${playerName}`).on('value', snapshot => {
        if (!snapshot.exists()) {
            console.log("🚫 Меня удалили из игры!");
            forceKickPlayer();
        }
    }, error => {
        console.error("❌ Ошибка проверки статуса:", error);
    });
    
    // Также слушаем команды кика (как дополнительная защита)
    kickListener = db.ref(`kick_commands/${currentGameId}/${playerName}`).on('value', snapshot => {
        const command = snapshot.val();
        if (command && command.command === "KICK") {
            console.log("🚫 Получена команда кика!");
            forceKickPlayer();
            // Удаляем команду
            db.ref(`kick_commands/${currentGameId}/${playerName}`).remove();
        }
    });
}

// ================ ОСНОВНЫЕ ФУНКЦИИ ================

function joinGame() {
    const name = playerNameInput.value.trim();
    const code = gameCodeInput.value.trim();
    
    if (!name || name.length < 2) {
        alert("Введите имя (минимум 2 символа)");
        playerNameInput.focus();
        return;
    }
    
    if (!code || code.length !== 8 || !/^\d+$/.test(code)) {
        alert("Введите 8 цифр кода игры");
        gameCodeInput.focus();
        return;
    }
    
    playerName = name;
    currentGameId = "game_" + code;
    
    console.log(`🎮 Подключаюсь как "${name}" к игре ${code}`);
    
    // Проверить игру
    db.ref(`games/${currentGameId}`).once('value').then(snapshot => {
        if (!snapshot.exists()) {
            alert("Игра не найдена!");
            return;
        }
        
        const game = snapshot.val();
        
        // Проверить уникальность имени
        if (game.players && game.players[name]) {
            alert("Игрок с таким именем уже есть!");
            return;
        }
        
        // Зарегистрироваться
        const playerData = {
            name: name,
            joined: Date.now(),
            score: 0,
            device: /Mobi|Android/i.test(navigator.userAgent) ? "📱 Телефон" : "💻 Компьютер"
        };
        
        db.ref(`games/${currentGameId}/players/${name}`).set(playerData).then(() => {
            // Обновить UI
            displayName.textContent = name;
            displayCode.textContent = code;
            
            // Переключить экран
            switchScreen('waiting');
            
            // НАЧАТЬ ПРОВЕРКУ КИКА (ВАЖНО!)
            checkIfKicked();
            
            // Слушать игру
            listenToGame();
            
            console.log(`✅ Подключен как ${name} к игре ${code}`);
            
        }).catch(error => {
            alert("Ошибка: " + error.message);
        });
        
    }).catch(error => {
        alert("Ошибка сети: " + error.message);
    });
}

function listenToGame() {
    if (!currentGameId || gameListener) return;
    
    console.log(`👂 Слушаю игру ${currentGameId}`);
    
    gameListener = db.ref(`games/${currentGameId}`).on('value', snapshot => {
        const game = snapshot.val();
        if (!game) {
            console.log("Игра удалена");
            leaveGame();
            return;
        }
        
        // ОБНОВЛЕННАЯ ПРОВЕРКА: Если нас нет в списке игроков - ВЫХОДИМ
        if (game.players && !game.players[playerName]) {
            console.log("🚫 Меня нет в списке игроков - выхожу!");
            forceKickPlayer();
            return;
        }
        
        // Обновить счетчик
        if (game.players) {
            roomPlayers.textContent = Object.keys(game.players).length;
        }
        
        const currentQuestionId = game.currentQuestion;
        
        switch (game.status) {
            case "lobby":
            case "waiting":
                handleLobby();
                break;
                
            case "question_active":
                if (currentQuestionId && (!currentQuestion || currentQuestion.id !== currentQuestionId || !hasAnswered)) {
                    handleQuestionActive(game, currentQuestionId);
                }
                break;
                
            case "showing_results":
                handleShowingResults(game, currentQuestionId);
                break;
                
            case "finished":
                handleGameFinished();
                break;
        }
    }, error => {
        console.error("Ошибка слушателя:", error);
    });
}

function handleLobby() {
    if (!waitingScreen.classList.contains('active')) {
        switchScreen('waiting');
    }
    clearTimer();
    
    if (hasAnswered) {
        hasAnswered = false;
        selectedOption = null;
    }
}

function handleQuestionActive(game, questionId) {
    currentQuestion = QUIZ_DATA.questions.find(q => q.id === questionId);
    if (!currentQuestion) return;
    
    hasAnswered = false;
    selectedOption = null;
    
    switchScreen('question');
    displayQuestion(currentQuestion);
    startTimer(45);
}

function displayQuestion(question) {
    const questionIndex = QUIZ_DATA.questions.findIndex(q => q.id === question.id) + 1;
    currentQ.textContent = questionIndex;
    questionType.textContent = getTypeLabel(question.type);
    
    questionText.textContent = question.text;
    
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.innerHTML = `
            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
            <span class="option-text">${option}</span>
        `;
        button.onclick = () => selectAnswer(index, button);
        optionsContainer.appendChild(button);
    });
    
    answerStatus.textContent = "Выберите вариант ответа (45 секунд)";
    answerStatus.style.color = "#00ff88";
    
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.classList.remove('selected');
    });
}

function selectAnswer(answerIndex, buttonElement) {
    if (hasAnswered || !currentQuestion || !currentGameId || !playerName) return;
    
    selectedOption = answerIndex;
    
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    buttonElement.classList.add('selected');
    
    const timeSpent = 45 - parseInt(studentTimer.textContent);
    submitAnswer(answerIndex, timeSpent);
}

function submitAnswer(answerIndex, timeSpent) {
    if (hasAnswered) return;
    
    hasAnswered = true;
    clearTimer();
    
    // Блокировать кнопки
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
    });
    
    // Простая проверка правильности
    const isCorrect = (answerIndex === currentQuestion.correct);
    
    const answerData = {
        answerIndex: answerIndex,
        isCorrect: isCorrect,
        timeSpent: timeSpent,
        timestamp: Date.now()
    };
    
    db.ref(`games/${currentGameId}/answers/${currentQuestion.id}/${playerName}`).set(answerData).then(() => {
        if (isCorrect) {
            answerStatus.innerHTML = '✅ Правильно!';
            answerStatus.style.color = '#00ff88';
            
            db.ref(`games/${currentGameId}/players/${playerName}/score`).transaction(score => {
                return (score || 0) + (currentQuestion.points || 5);
            });
        } else {
            answerStatus.innerHTML = '❌ Неправильно!';
            answerStatus.style.color = '#ff416c';
        }
    }).catch(error => {
        answerStatus.innerHTML = '⚠️ Ошибка';
        answerStatus.style.color = '#ff9e00';
    });
}

function startTimer(seconds) {
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

function updateTimerDisplay(timeLeft) {
    studentTimer.textContent = timeLeft;
    
    if (timeLeft <= 5) {
        studentTimer.style.color = '#ff416c';
    } else if (timeLeft <= 15) {
        studentTimer.style.color = '#ff9e00';
    } else {
        studentTimer.style.color = '#00ff88';
    }
}

function handleTimeUp() {
    if (hasAnswered) return;
    
    hasAnswered = true;
    
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.4';
    });
    
    answerStatus.innerHTML = '⏰ Время вышло!';
    answerStatus.style.color = '#ff9e00';
    
    if (currentGameId && playerName && currentQuestion) {
        const answerData = {
            answerIndex: -1,
            isCorrect: false,
            timeSpent: 45,
            timestamp: Date.now()
        };
        
        db.ref(`games/${currentGameId}/answers/${currentQuestion.id}/${playerName}`).set(answerData);
    }
}

function handleShowingResults(game, questionId) {
    if (!currentQuestion || currentQuestion.id !== questionId) {
        currentQuestion = QUIZ_DATA.questions.find(q => q.id === questionId);
    }
    
    if (!currentQuestion) return;
    
    switchScreen('result');
    
    db.ref(`games/${currentGameId}/answers/${currentQuestion.id}/${playerName}`).once('value').then(snapshot => {
        const userAnswer = snapshot.val();
        showResult(userAnswer, currentQuestion);
    }).catch(() => {
        showResult(null, currentQuestion);
    });
    
    startNextCountdown();
}

function showResult(userAnswer, question) {
    let resultHTML = '';
    
    const correctAnswerText = question.options[question.correct] || `Вариант ${question.correct + 1}`;
    
    if (userAnswer && userAnswer.answerIndex >= 0) {
        const isCorrect = userAnswer.isCorrect;
        const userAnswerText = question.options[userAnswer.answerIndex] || `Вариант ${userAnswer.answerIndex + 1}`;
        
        resultHTML = `
            <div style="color: ${isCorrect ? '#00ff88' : '#ff416c'}; font-size: 24px; margin-bottom: 20px;">
                ${isCorrect ? '✅ ПРАВИЛЬНО!' : '❌ НЕПРАВИЛЬНО'}
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin: 10px 0;">
                <div style="color: #8f8f8f;">Ваш ответ:</div>
                <div style="color: white; font-size: 18px;">${userAnswerText}</div>
            </div>
            <div style="background: rgba(0,255,136,0.1); padding: 15px; border-radius: 10px; margin: 10px 0; border-left: 4px solid #00ff88;">
                <div style="color: #8f8f8f;">Правильный ответ:</div>
                <div style="color: #00ff88; font-size: 18px; font-weight: bold;">${correctAnswerText}</div>
            </div>
        `;
    } else {
        resultHTML = `
            <div style="color: #ff9e00; font-size: 24px; margin-bottom: 20px;">
                ⏰ ВЫ НЕ УСПЕЛИ ОТВЕТИТЬ
            </div>
            <div style="background: rgba(0,255,136,0.1); padding: 15px; border-radius: 10px; margin: 10px 0; border-left: 4px solid #00ff88;">
                <div style="color: #8f8f8f;">Правильный ответ:</div>
                <div style="color: #00ff88; font-size: 18px; font-weight: bold;">${correctAnswerText}</div>
            </div>
        `;
    }
    
    resultContent.innerHTML = resultHTML;
}

function startNextCountdown() {
    let countdown = 5;
    nextCountdown.textContent = countdown;
    
    const interval = setInterval(() => {
        countdown--;
        nextCountdown.textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(interval);
            currentQuestion = null;
            hasAnswered = false;
            selectedOption = null;
        }
    }, 1000);
}

function handleGameFinished() {
    switchScreen('result');
    
    db.ref(`games/${currentGameId}/players/${playerName}`).once('value').then(snapshot => {
        const playerData = snapshot.val();
        
        resultContent.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 32px; color: #00adb5; margin-bottom: 20px;">🏁 ИГРА ЗАВЕРШЕНА</div>
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <div style="color: #00ff88; font-size: 24px; margin-bottom: 10px;">${playerData.score || 0} очков</div>
                    <div style="color: #8f8f8f;">Ваш финальный результат</div>
                </div>
                <button onclick="location.reload()" style="
                    background: #00adb5;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 20px;
                ">
                    🔄 НАЧАТЬ ЗАНОВО
                </button>
            </div>
        `;
    });
}

function leaveGame() {
    console.log("🚪 Выхожу из игры...");
    
    stopAllListeners();
    clearAllTimers();
    
    if (currentGameId && playerName) {
        try {
            db.ref(`games/${currentGameId}/players/${playerName}`).remove();
        } catch (e) {}
    }
    
    resetGameState();
    switchScreen('join');
}

function resetGameState() {
    currentGameId = null;
    playerName = null;
    currentQuestion = null;
    hasAnswered = false;
    selectedOption = null;
    clearTimer();
    playerNameInput.value = '';
    gameCodeInput.value = '';
}

function clearTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function switchScreen(screenName) {
    [joinScreen, waitingScreen, questionScreen, resultScreen].forEach(screen => {
        screen.classList.remove('active');
    });
    
    switch(screenName) {
        case 'join':
            joinScreen.classList.add('active');
            break;
        case 'waiting':
            waitingScreen.classList.add('active');
            break;
        case 'question':
            questionScreen.classList.add('active');
            break;
        case 'result':
            resultScreen.classList.add('active');
            break;
    }
}

function getTypeLabel(type) {
    const labels = {
        oral: "🎤 УСТНОЕ",
        syntax: "📝 СИНТАКСИС",
        punctuation: "🔤 ПУНКТУАЦИЯ",
        spelling: "✍️ ОРФОГРАФИЯ",
        reading: "📖 ТЕКСТ"
    };
    return labels[type] || type;
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Student app loaded");
    
    // Автофокус
    playerNameInput.focus();
    
    // Enter для удобства
    playerNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') gameCodeInput.focus();
    });
    
    gameCodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') joinGame();
    });
    
    // Добавляем глобальную функцию для принудительного кика
    window.forceKickPlayer = forceKickPlayer;
    
    // Дебаг кнопка
    const debugBtn = document.createElement('button');
    debugBtn.textContent = '🐛';
    debugBtn.title = 'Тест кика';
    debugBtn.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: #ff416c;
        color: white;
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 50%;
        font-size: 14px;
        z-index: 9999;
        cursor: pointer;
    `;
    debugBtn.onclick = function() {
        if (confirm("Тест кика - выйти из игры?")) {
            forceKickPlayer();
        }
    };
    document.body.appendChild(debugBtn);
});
