// ============================================
// student.js - ПОЛНАЯ ВЕРСИЯ С ФИКСАМИ И ОТЛАДКОЙ
// ============================================

let currentGameId = null;
let playerName = null;
let currentQuestion = null;
let hasAnswered = false;
let timerInterval = null;
let gameListener = null;
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

// ================ УТИЛИТЫ ================

// Универсальная функция для получения правильного ответа
function getCorrectAnswer(question) {
    if (!question || question.correct === undefined || question.correct === null) {
        console.error("❌ Вопрос или correct не определен:", question);
        return null;
    }
    
    let correct = question.correct;
    console.log("🔍 getCorrectAnswer входные данные:", {
        correct: correct,
        type: typeof correct,
        isArray: Array.isArray(correct)
    });
    
    // Если это строка, пытаемся преобразовать
    if (typeof correct === 'string') {
        try {
            if (correct.startsWith('[')) {
                correct = JSON.parse(correct);
            } else if (!isNaN(correct) && correct.trim() !== '') {
                correct = parseInt(correct);
            }
        } catch (e) {
            console.error("❌ Ошибка преобразования correct:", e);
            // Оставляем как есть
        }
    }
    
    console.log("🔍 getCorrectAnswer результат:", {
        correct: correct,
        type: typeof correct,
        isArray: Array.isArray(correct)
    });
    
    return correct;
}

// Проверка правильности ответа
function checkAnswerCorrectness(answerIndex, question) {
    const correctAnswer = getCorrectAnswer(question);
    
    if (correctAnswer === null) {
        console.error("❌ Не удалось определить правильный ответ для вопроса:", question);
        return false;
    }
    
    if (Array.isArray(correctAnswer)) {
        return correctAnswer.includes(answerIndex);
    } else if (typeof correctAnswer === 'number') {
        return (answerIndex === correctAnswer);
    }
    
    console.error("❌ Неподдерживаемый тип correctAnswer:", typeof correctAnswer, correctAnswer);
    return false;
}

// Получение текста правильного ответа
function getCorrectAnswerText(question) {
    const correctAnswer = getCorrectAnswer(question);
    
    if (correctAnswer === null) {
        return "Не удалось определить правильный ответ";
    }
    
    if (Array.isArray(correctAnswer)) {
        const correctOptions = correctAnswer.map(index => {
            return question.options[index] || `Вариант ${index + 1}`;
        });
        return correctOptions.join(', ');
    } else if (typeof correctAnswer === 'number') {
        return question.options[correctAnswer] || `Вариант ${correctAnswer + 1}`;
    }
    
    return "Ошибка формата ответа";
}

// ================ ОСНОВНЫЕ ФУНКЦИИ ================

function joinGame() {
    // Получить данные
    const name = playerNameInput.value.trim();
    const code = gameCodeInput.value.trim();
    
    // Валидация
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
    
    // Проверить игру в Firebase
    db.ref(`games/${currentGameId}`).once('value').then(snapshot => {
        if (!snapshot.exists()) {
            alert("Игра с таким кодом не найдена!\nПроверьте код или попросите учителя создать игру.");
            return;
        }
        
        const game = snapshot.val();
        
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
            device: /Mobi|Android/i.test(navigator.userAgent) ? "📱 Телефон" : "💻 Компьютер"
        };
        
        db.ref(`games/${currentGameId}/players/${name}`).set(playerData).then(() => {
            // Обновить UI
            displayName.textContent = name;
            displayCode.textContent = code;
            
            // Переключить экран
            switchScreen('waiting');
            
            // Начать слушать игру
            listenToGame();
            
            console.log(`✅ Ученик подключен: ${name} к игре ${code}`);
            
        }).catch(error => {
            alert("Ошибка подключения: " + error.message);
        });
        
    }).catch(error => {
        alert("Ошибка сети: " + error.message);
    });
}

function listenToGame() {
    if (!currentGameId || gameListener) return;
    
    console.log(`👂 Начинаю слушать игру: ${currentGameId}`);
    
    gameListener = db.ref(`games/${currentGameId}`).on('value', snapshot => {
        const game = snapshot.val();
        if (!game) {
            alert("Игра была удалена учителем");
            leaveGame();
            return;
        }
        
        // Обновить счетчик игроков
        if (game.players) {
            const playerCount = Object.keys(game.players).length;
            roomPlayers.textContent = playerCount;
        }
        
        // Определить текущий вопрос
        const currentQuestionId = game.currentQuestion;
        
        // Обработка статуса игры
        switch (game.status) {
            case "lobby":
            case "waiting":
                handleLobby();
                break;
                
            case "question_active":
                if (currentQuestionId) {
                    // Если вопрос изменился или мы еще не отвечали
                    if (!currentQuestion || currentQuestion.id !== currentQuestionId || !hasAnswered) {
                        handleQuestionActive(game, currentQuestionId);
                    }
                }
                break;
                
            case "showing_results":
                handleShowingResults(game, currentQuestionId);
                break;
                
            case "finished":
                handleGameFinished();
                break;
        }
    });
}

function handleLobby() {
    // Если мы не на экране ожидания, переключиться
    if (!waitingScreen.classList.contains('active')) {
        switchScreen('waiting');
    }
    clearTimer();
    
    // Сбросить состояние ответа при возврате в лобби
    if (hasAnswered) {
        hasAnswered = false;
        selectedOption = null;
    }
}

function handleQuestionActive(game, questionId) {
    // Найти вопрос в базе
    currentQuestion = QUIZ_DATA.questions.find(q => q.id === questionId);
    if (!currentQuestion) {
        console.error(`❌ Вопрос ${questionId} не найден в базе`);
        return;
    }
    
    console.log("🔍 Загружен вопрос:", {
        id: currentQuestion.id,
        correct: currentQuestion.correct,
        type: typeof currentQuestion.correct
    });
    
    // Сбросить состояние ответа
    hasAnswered = false;
    selectedOption = null;
    
    // Обновить UI
    switchScreen('question');
    
    // Показать вопрос
    displayQuestion(currentQuestion);
    
    // Запустить таймер НА 45 СЕКУНД
    startTimer(45);
    
    console.log(`❓ Вопрос ${currentQuestion.id}: ${currentQuestion.type}`);
}

function displayQuestion(question) {
    // Обновить метаданные
    const questionIndex = QUIZ_DATA.questions.findIndex(q => q.id === question.id) + 1;
    currentQ.textContent = questionIndex;
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
        button.onclick = () => selectAnswer(index, button);
        optionsContainer.appendChild(button);
    });
    
    // Сбросить статус
    answerStatus.textContent = "Выберите вариант ответа (45 секунд)";
    answerStatus.style.color = "#00ff88";
    
    // Разблокировать кнопки
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.classList.remove('selected');
    });
}

function selectAnswer(answerIndex, buttonElement) {
    if (hasAnswered || !currentQuestion || !currentGameId || !playerName) return;
    
    selectedOption = answerIndex;
    
    // Подсветить выбранный вариант
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    buttonElement.classList.add('selected');
    
    // Рассчитать оставшееся время (45 секунд)
    const timeSpent = 45 - parseInt(studentTimer.textContent);
    
    // Отправить ответ НЕМЕДЛЕННО
    submitAnswer(answerIndex, timeSpent);
}

function submitAnswer(answerIndex, timeSpent) {
    if (hasAnswered) return;
    
    hasAnswered = true;
    clearTimer();
    
    console.log("🔍 submitAnswer вызван:", {
        answerIndex,
        currentQuestionId: currentQuestion?.id,
        currentQuestionCorrect: currentQuestion?.correct,
        playerName,
        timeSpent
    });
    
    // Блокировать кнопки
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
    });
    
    // Проверка правильности
    const isCorrect = checkAnswerCorrectness(answerIndex, currentQuestion);
    
    console.log("🔍 Результат проверки:", isCorrect);
    
    // Отправить ответ в Firebase
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
                return (score || 0) + (currentQuestion.points || 5);
            });
        } else {
            answerStatus.innerHTML = '❌ Неправильно! Ожидайте правильного ответа...';
            answerStatus.style.color = '#ff416c';
        }
        
        console.log(`📤 Ответ отправлен: вариант ${answerIndex} (${isCorrect ? 'правильно' : 'неправильно'})`);
        
    }).catch(error => {
        console.error("Ошибка отправки ответа:", error);
        answerStatus.innerHTML = '⚠️ Ошибка отправки ответа';
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
    
    // Менять цвет в зависимости от времени
    if (timeLeft <= 5) {
        studentTimer.style.color = '#ff416c';
        studentTimer.style.animation = 'pulse 0.5s infinite';
    } else if (timeLeft <= 15) {
        studentTimer.style.color = '#ff9e00';
        studentTimer.style.animation = 'none';
    } else {
        studentTimer.style.color = '#00ff88';
        studentTimer.style.animation = 'none';
    }
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
    
    // Отправить пустой ответ
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
    
    // Получить результат ответа
    db.ref(`games/${currentGameId}/answers/${currentQuestion.id}/${playerName}`).once('value').then(snapshot => {
        const userAnswer = snapshot.val();
        showResult(userAnswer, currentQuestion);
    }).catch(() => {
        showResult(null, currentQuestion);
    });
    
    // Запустить отсчет до следующего вопроса
    startNextCountdown();
}

function showResult(userAnswer, question) {
    console.log("🔍 showResult вызван:", {
        userAnswer,
        questionId: question?.id,
        questionCorrect: question?.correct,
        questionOptions: question?.options?.length
    });
    
    let resultHTML = '';
    
    if (userAnswer && userAnswer.answerIndex >= 0) {
        const isCorrect = userAnswer.isCorrect;
        const userAnswerText = question.options[userAnswer.answerIndex] || `Вариант ${userAnswer.answerIndex + 1}`;
        
        // Получение правильного ответа
        const correctAnswerText = getCorrectAnswerText(question);
        
        console.log("🔍 Данные для отображения:", {
            isCorrect,
            userAnswerText,
            correctAnswerText
        });
        
        resultHTML = `
            <div class="result-header" style="color: ${isCorrect ? '#00ff88' : '#ff416c'}; font-size: 24px; margin-bottom: 20px;">
                ${isCorrect ? '✅ ПРАВИЛЬНО!' : '❌ НЕПРАВИЛЬНО'}
                ${userAnswer.timeSpent ? `<div style="font-size: 16px; color: #8f8f8f;">Время: ${userAnswer.timeSpent} сек.</div>` : ''}
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
                    <div style="color: white; margin-top: 5px;">${question.explanation || 'Объяснение отсутствует'}</div>
                </div>
            </div>
        `;
    } else {
        // Получение правильного ответа
        const correctAnswerText = getCorrectAnswerText(question);
        
        console.log("🔍 Пользователь не ответил, правильный ответ:", correctAnswerText);
        
        resultHTML = `
            <div class="result-header" style="color: #ff9e00; font-size: 24px; margin-bottom: 20px;">
                ⏰ ВЫ НЕ УСПЕЛИ ОТВЕТИТЬ
            </div>
            
            <div class="result-details">
                <div style="margin: 10px 0; padding: 10px; background: rgba(0,255,136,0.1); border-radius: 5px; border-left: 4px solid #00ff88;">
                    <div style="color: #8f8f8f;">Правильный ответ:</div>
                    <div style="color: #00ff88; font-size: 18px; font-weight: bold;">${correctAnswerText}</div>
                </div>
                
                <div style="margin: 15px 0; padding: 15px; background: rgba(0,173,181,0.1); border-radius: 5px;">
                    <div style="color: #00adb5; font-weight: bold;">💡 Объяснение:</div>
                    <div style="color: white; margin-top: 5px;">${question.explanation || 'Объяснение отсутствует'}</div>
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
            // Готовимся к следующему вопросу
            currentQuestion = null;
            hasAnswered = false;
            selectedOption = null;
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
    if (currentGameId && playerName) {
        db.ref(`games/${currentGameId}/players/${playerName}`).remove();
    }
    
    // Отписаться от слушателя
    if (gameListener) {
        gameListener();
        gameListener = null;
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
    // Скрыть все экраны
    [joinScreen, waitingScreen, questionScreen, resultScreen].forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Показать нужный экран
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
        grammar: "📖 ГРАММАТИКА",
        syntax: "📝 СИНТАКСИС",
        punctuation: "🔤 ПУНКТУАЦИЯ",
        spelling: "✍️ ОРФОГРАФИЯ",
        morphology: "📚 МОРФОЛОГИЯ",
        reading: "📖 ЧТЕНИЕ",
        stylistics: "🎨 СТИЛИСТИКА",
        lexicology: "📖 ЛЕКСИКОЛОГИЯ",
        writing: "📝 ИЗЛОЖЕНИЕ",
        composition: "✍️ СОЧИНЕНИЕ",
        exam_rules: "📋 ПРАВИЛА ОГЭ",
        grading: "📊 ОЦЕНИВАНИЕ"
    };
    return labels[type] || type;
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Student app loaded");
    console.log("🔍 QUIZ_DATA доступен:", !!window.QUIZ_DATA);
    console.log("🔍 Firebase доступен:", !!window.db);
    
    if (window.QUIZ_DATA && window.QUIZ_DATA.questions) {
        console.log(`📚 Загружено ${QUIZ_DATA.questions.length} вопросов`);
        // Логируем правильные ответы для отладки
        QUIZ_DATA.questions.forEach((q, i) => {
            console.log(`🔍 Вопрос ${i+1} (id: ${q.id}) - correct:`, q.correct, "type:", typeof q.correct);
        });
    }
    
    // Автофокус на поле имени
    playerNameInput.focus();
    
    // Обработчик Enter для перехода между полями
    playerNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            gameCodeInput.focus();
        }
    });
    
    gameCodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            joinGame();
        }
    });
    
    // Проверка Firebase
    if (!window.db) {
        console.error("❌ Firebase не загружен!");
        alert("Ошибка загрузки базы данных. Обновите страницу.");
    }
    
    if (!window.QUIZ_DATA) {
        console.error("❌ QUIZ_DATA не загружен!");
        alert("Ошибка загрузки вопросов. Обновите страницу.");
    }
});

// Стили для анимации пульсации
const timerStyles = document.createElement('style');
timerStyles.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.05); }
    }
`;
document.head.appendChild(timerStyles);
