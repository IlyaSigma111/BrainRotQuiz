// ============================================
// student.js - ИСПРАВЛЕННЫЙ
// ============================================

let currentGameId = null;
let playerName = null;
let currentQuestion = null;
let hasAnswered = false;
let timerInterval = null;
let gameListener = null;

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

// ================ ОСНОВНЫЕ ФУНКЦИИ ================

function joinGame() {
    // Получить данные
    const name = playerNameInput.value.trim();
    const code = gameCodeInput.value.trim();
    
    // Валидация
    if (!name || name.length < 2) {
        alert("Введите имя (минимум 2 символа)");
        return;
    }
    
    if (!code || code.length !== 8 || !/^\d+$/.test(code)) {
        alert("Введите 8 цифр кода игры");
        return;
    }
    
    playerName = name;
    currentGameId = "game_" + code;
    
    // Проверить игру
    db.ref(`games/${currentGameId}`).once('value').then(snapshot => {
        if (!snapshot.exists()) {
            alert("Игра с таким кодом не найдена!\nПроверьте код или попросите учителя создать игру.");
            return;
        }
        
        const game = snapshot.val();
        
        // Проверить статус
        if (game.status === "finished") {
            alert("Эта игра уже завершена");
            return;
        }
        
        // Проверить уникальность имени
        if (game.players && game.players[name]) {
            alert("Игрок с таким именем уже есть в игре");
            return;
        }
        
        // Зарегистрироваться
        const playerData = {
            name: name,
            joined: Date.now(),
            score: 0,
            device: /Mobi|Android/i.test(navigator.userAgent) ? "📱" : "💻"
        };
        
        db.ref(`games/${currentGameId}/players/${name}`).set(playerData).then(() => {
            // Обновить UI
            displayName.textContent = name;
            displayCode.textContent = code;
            
            // Переключить экран
            switchScreen('waiting');
            
            // Начать слушать игру
            listenToGame();
            
            console.log(`✅ Подключен: ${name}`);
            
        }).catch(error => {
            alert("Ошибка подключения: " + error.message);
        });
        
    }).catch(error => {
        alert("Ошибка сети: " + error.message);
    });
}

function listenToGame() {
    if (!currentGameId) return;
    
    gameListener = db.ref(`games/${currentGameId}`).on('value', snapshot => {
        const game = snapshot.val();
        if (!game) {
            alert("Игра была удалена");
            leaveGame();
            return;
        }
        
        // Обновить счетчик игроков
        if (game.players) {
            roomPlayers.textContent = Object.keys(game.players).length;
        }
        
        // Обработка статуса игры
        switch (game.status) {
            case "lobby":
                handleLobby();
                break;
                
            case "question_active":
                handleQuestionActive(game);
                break;
                
            case "showing_results":
                handleShowingResults(game);
                break;
                
            case "finished":
                handleGameFinished();
                break;
        }
    });
}

function handleLobby() {
    if (!hasAnswered) {
        switchScreen('waiting');
        clearTimer();
    }
}

function handleQuestionActive(game) {
    if (hasAnswered || !game.currentQuestion) return;
    
    currentQuestion = QUIZ_DATA.questions.find(q => q.id === game.currentQuestion);
    if (!currentQuestion) return;
    
    // Обновить UI
    switchScreen('question');
    
    // Показать вопрос
    displayQuestion(currentQuestion);
    
    // Запустить таймер
    startTimer(currentQuestion.time);
    
    console.log(`❓ Вопрос: ${currentQuestion.text.substring(0, 30)}...`);
}

function displayQuestion(question) {
    // Обновить метаданные
    currentQ.textContent = QUIZ_DATA.questions.indexOf(question) + 1;
    questionType.textContent = getTypeLabel(question.type);
    
    // Текст вопроса
    questionText.textContent = question.text;
    
    // Варианты ответов
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.innerHTML = `
            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
            <span class="option-text">${option}</span>
        `;
        button.onclick = () => submitAnswer(index);
        optionsContainer.appendChild(button);
    });
    
    // Сбросить статус
    answerStatus.textContent = "Выберите вариант ответа";
    answerStatus.style.color = "#00ff88";
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
    
    if (timeLeft <= 10) {
        studentTimer.style.color = '#ff416c';
        studentTimer.style.animation = 'pulse 0.5s infinite';
    } else if (timeLeft <= 20) {
        studentTimer.style.color = '#ff9e00';
    } else {
        studentTimer.style.color = '#00ff88';
        studentTimer.style.animation = 'none';
    }
}

function submitAnswer(answerIndex) {
    if (hasAnswered || !currentQuestion || !currentGameId || !playerName) return;
    
    hasAnswered = true;
    clearTimer();
    
    // Блокировать кнопки
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
    });
    
    // Подсветить выбранный
    const selectedBtn = document.querySelectorAll('.option-btn')[answerIndex];
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // Проверить правильность
    const isCorrect = (answerIndex === currentQuestion.correct);
    const timeSpent = currentQuestion.time - parseInt(studentTimer.textContent);
    
    // Отправить ответ
    const answerData = {
        answerIndex: answerIndex,
        isCorrect: isCorrect,
        timeSpent: timeSpent,
        timestamp: Date.now()
    };
    
    db.ref(`games/${currentGameId}/answers/${currentQuestion.id}/${playerName}`).set(answerData).then(() => {
        // Показать статус
        if (isCorrect) {
            answerStatus.innerHTML = '✅ Правильно! Ожидайте результатов...';
            answerStatus.style.color = '#00ff88';
            
            // Начислить очки
            db.ref(`games/${currentGameId}/players/${playerName}/score`).transaction(score => {
                return (score || 0) + (currentQuestion.points || 10);
            });
        } else {
            answerStatus.innerHTML = '❌ Неправильно! Ожидайте правильного ответа...';
            answerStatus.style.color = '#ff416c';
        }
        
        console.log(`📤 Ответ отправлен: ${answerIndex} (${isCorrect ? 'правильно' : 'неправильно'})`);
        
    }).catch(error => {
        answerStatus.innerHTML = '⚠️ Ошибка отправки ответа';
        answerStatus.style.color = '#ff9e00';
    });
}

function handleTimeUp() {
    if (hasAnswered) return;
    
    hasAnswered = true;
    
    // Блокировать кнопки
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.4';
    });
    
    answerStatus.innerHTML = '⏰ Время вышло! Ответ не принят';
    answerStatus.style.color = '#ff9e00';
}

function handleShowingResults(game) {
    if (!currentQuestion) return;
    
    switchScreen('result');
    
    // Получить результат ответа
    db.ref(`games/${currentGameId}/answers/${currentQuestion.id}/${playerName}`).once('value').then(snapshot => {
        const userAnswer = snapshot.val();
        showResult(userAnswer, currentQuestion);
    }).catch(() => {
        showResult(null, currentQuestion);
    });
    
    // Запустить отсчет
    startNextCountdown();
}

function showResult(userAnswer, question) {
    let resultHTML = '';
    
    if (userAnswer) {
        const isCorrect = userAnswer.isCorrect;
        const userAnswerText = question.options[userAnswer.answerIndex];
        const correctAnswerText = question.options[question.correct];
        
        resultHTML = `
            <div class="result-header" style="color: ${isCorrect ? '#00ff88' : '#ff416c'}; font-size: 24px; margin-bottom: 20px;">
                ${isCorrect ? '✅ ПРАВИЛЬНО!' : '❌ НЕПРАВИЛЬНО'}
            </div>
            
            <div class="result-details">
                <div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
                    <div style="color: #8f8f8f;">Ваш ответ:</div>
                    <div style="color: white; font-size: 18px;">${userAnswerText}</div>
                </div>
                
                <div style="margin: 10px 0; padding: 10px; background: rgba(0,255,136,0.1); border-radius: 5px; border-left: 4px solid #00ff88;">
                    <div style="color: #8f8f8f;">Правильный ответ:</div>
                    <div style="color: #00ff88; font-size: 18px; font-weight: bold;">${correctAnswerText}</div>
                </div>
                
                <div style="margin: 15px 0; padding: 15px; background: rgba(0,173,181,0.1); border-radius: 5px;">
                    <div style="color: #00adb5; font-weight: bold;">💡 Объяснение:</div>
                    <div style="color: white; margin-top: 5px;">${question.explanation}</div>
                </div>
            </div>
        `;
    } else {
        resultHTML = `
            <div class="result-header" style="color: #ff9e00; font-size: 24px; margin-bottom: 20px;">
                ⏰ ВЫ НЕ УСПЕЛИ
            </div>
            
            <div class="result-details">
                <div style="margin: 10px 0; padding: 10px; background: rgba(0,255,136,0.1); border-radius: 5px; border-left: 4px solid #00ff88;">
                    <div style="color: #8f8f8f;">Правильный ответ:</div>
                    <div style="color: #00ff88; font-size: 18px; font-weight: bold;">${question.options[question.correct]}</div>
                </div>
                
                <div style="margin: 15px 0; padding: 15px; background: rgba(0,173,181,0.1); border-radius: 5px;">
                    <div style="color: #00adb5; font-weight: bold;">💡 Объяснение:</div>
                    <div style="color: white; margin-top: 5px;">${question.explanation}</div>
                </div>
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
            hasAnswered = false;
            currentQuestion = null;
        }
    }, 1000);
}

function handleGameFinished() {
    switchScreen('result');
    
    // Получить финальную статистику
    db.ref(`games/${currentGameId}/players/${playerName}`).once('value').then(snapshot => {
        const playerData = snapshot.val();
        
        resultContent.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 32px; color: #00adb5; margin-bottom: 20px;">🏁 ИГРА ЗАВЕРШЕНА</div>
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <div style="color: #00ff88; font-size: 24px; margin-bottom: 10px;">${playerData.score || 0} очков</div>
                    <div style="color: #8f8f8f;">Ваш результат</div>
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
                    🔄 НОВАЯ ИГРА
                </button>
            </div>
        `;
    });
}

function leaveGame() {
    if (currentGameId && playerName) {
        db.ref(`games/${currentGameId}/players/${playerName}`).remove();
    }
    
    // Отписаться от слушателя
    if (gameListener) {
        gameListener();
    }
    
    // Сбросить состояние
    resetGame();
    
    // Вернуться на экран входа
    switchScreen('join');
}

function resetGame() {
    currentGameId = null;
    playerName = null;
    currentQuestion = null;
    hasAnswered = false;
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
    // Скрыть все экраны
    [joinScreen, waitingScreen, questionScreen, resultScreen].forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Показать нужный
    switch(screenName) {
        case 'join': joinScreen.classList.add('active'); break;
        case 'waiting': waitingScreen.classList.add('active'); break;
        case 'question': questionScreen.classList.add('active'); break;
        case 'result': resultScreen.classList.add('active'); break;
    }
}

function getTypeLabel(type) {
    const labels = {
        oral: "🎤 УСТНОЕ",
        spelling: "📝 ОРФОГРАФИЯ",
        punctuation: "🔤 ПУНКТУАЦИЯ",
        syntax: "📚 СИНТАКСИС"
    };
    return labels[type] || type;
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log("Student app loaded");
    
    // Автофокус на поле имени
    playerNameInput.focus();
    
    // Обработчик Enter
    playerNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') gameCodeInput.focus();
    });
    
    gameCodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') joinGame();
    });
});
