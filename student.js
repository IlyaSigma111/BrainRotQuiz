// ============================================
// student.js - ЛОГИКА ДЛЯ УЧЕНИКА
// ============================================

// Глобальные переменные
let currentGameId = null;
let playerName = null;
let currentQuestionId = null;
let hasAnswered = false;
let timerInterval = null;

// DOM элементы
const joinScreen = document.getElementById('joinScreen');
const waitingScreen = document.getElementById('waitingScreen');
const questionScreen = document.getElementById('questionScreen');
const resultScreen = document.getElementById('resultScreen');
const gameCodeInput = document.getElementById('gameCodeInput');
const playerNameInput = document.getElementById('playerNameInput');
const displayPlayerName = document.getElementById('displayPlayerName');
const displayGameCode = document.getElementById('displayGameCode');
const studentQuestionText = document.getElementById('studentQuestionText');
const optionsGrid = document.getElementById('optionsGrid');
const studentTimer = document.getElementById('studentTimer');
const answerStatus = document.getElementById('answerStatus');
const resultCard = document.getElementById('resultCard');
const currentQuestionNum = document.getElementById('currentQuestionNum');

// ================ ОСНОВНЫЕ ФУНКЦИИ ================

/**
 * Присоединение к игре
 */
function joinGame() {
    const code = gameCodeInput.value.trim();
    const name = playerNameInput.value.trim();
    
    // Валидация
    if (!code || !name) {
        alert("❌ Введите код игры и ваше имя!");
        return;
    }
    
    if (name.length < 2) {
        alert("❌ Имя должно быть не короче 2 символов");
        return;
    }
    
    currentGameId = "game_" + code;
    playerName = name;
    
    // Проверяем существование игры в Firebase
    db.ref(`games/${currentGameId}`).once('value').then(snapshot => {
        if (!snapshot.exists()) {
            alert("❌ Игра с таким кодом не найдена!\nПроверьте код или попросите учителя начать игру.");
            return;
        }
        
        const game = snapshot.val();
        
        // Проверяем статус игры
        if (game.status === "finished") {
            alert("⚠️ Эта игра уже завершена");
            return;
        }
        
        // Регистрируем игрока
        db.ref(`games/${currentGameId}/players/${playerName}`).set({
            name: playerName,
            joined: Date.now(),
            score: 0,
            totalCorrect: 0
        }).then(() => {
            // Переключаем экраны
            joinScreen.style.display = 'none';
            waitingScreen.style.display = 'block';
            displayPlayerName.textContent = playerName;
            displayGameCode.textContent = code;
            
            // Начинаем слушать игру
            listenToGame();
            
            console.log(`✅ Игрок ${playerName} присоединился к игре ${currentGameId}`);
        }).catch(error => {
            console.error("Ошибка регистрации игрока:", error);
            alert("Ошибка подключения. Попробуйте снова.");
        });
        
    }).catch(error => {
        console.error("Ошибка проверки игры:", error);
        alert("Ошибка сети. Проверьте интернет-соединение.");
    });
}

/**
 * Слушаем изменения в игре
 */
function listenToGame() {
    if (!currentGameId) return;
    
    // Подписываемся на изменения игры
    db.ref(`games/${currentGameId}`).on('value', (snapshot) => {
        const game = snapshot.val();
        if (!game) {
            console.error("Игра не найдена");
            return;
        }
        
        // Обновляем номер текущего вопроса
        if (game.currentQuestion) {
            const questionIndex = game.quiz.questions.findIndex(q => q.id === game.currentQuestion);
            if (questionIndex !== -1 && currentQuestionNum) {
                currentQuestionNum.textContent = questionIndex + 1;
            }
        }
        
        // Если игра в ожидании
        if (game.status === "waiting" || game.status === "lobby") {
            waitingScreen.style.display = 'block';
            questionScreen.style.display = 'none';
            resultScreen.style.display = 'none';
            hasAnswered = false;
            clearTimer();
        }
        
        // Если активен вопрос И мы еще не отвечали
        if (game.status === "question_active" && game.currentQuestion && !hasAnswered) {
            currentQuestionId = game.currentQuestion;
            showQuestion(game);
        }
        
        // Если показ результатов
        if (game.status === "showing_results") {
            showQuestionResult(game);
        }
        
        // Если игра завершена
        if (game.status === "finished") {
            showFinalResults(game);
        }
    });
}

/**
 * Показать вопрос
 */
function showQuestion(game) {
    if (!game.quiz || !game.quiz.questions) return;
    
    const question = game.quiz.questions.find(q => q.id === currentQuestionId);
    if (!question) return;
    
    // Переключаем экраны
    waitingScreen.style.display = 'none';
    questionScreen.style.display = 'block';
    resultScreen.style.display = 'none';
    
    // Отображаем вопрос
    studentQuestionText.textContent = question.text;
    
    // Отображаем варианты ответов
    optionsGrid.innerHTML = '';
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.setAttribute('data-index', index);
        button.innerHTML = `
            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
            <span class="option-text">${option}</span>
        `;
        button.onclick = () => submitAnswer(index, question);
        optionsGrid.appendChild(button);
    });
    
    // Запускаем таймер
    startStudentTimer(question.time);
    
    // Показываем тип вопроса
    if (answerStatus) {
        answerStatus.innerHTML = `<div class="question-type-badge">${getTypeLabel(question.type)}</div>`;
    }
    
    console.log(`📝 Вопрос ${question.id} загружен: ${question.text.substring(0, 50)}...`);
}

/**
 * Запустить таймер для ученика
 */
function startStudentTimer(seconds) {
    if (timerInterval) clearInterval(timerInterval);
    
    let timeLeft = seconds;
    if (studentTimer) {
        studentTimer.textContent = timeLeft;
        studentTimer.className = 'question-timer';
    }
    
    timerInterval = setInterval(() => {
        timeLeft--;
        
        if (studentTimer) {
            studentTimer.textContent = timeLeft;
            
            // Меняем цвет при малом времени
            if (timeLeft <= 5) {
                studentTimer.className = 'question-timer warning';
            }
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (!hasAnswered) {
                timeUp();
            }
        }
    }, 1000);
}

/**
 * Время вышло
 */
function timeUp() {
    hasAnswered = true;
    answerStatus.innerHTML = '<div class="time-up">⏰ Время вышло! Ответ не засчитан</div>';
    
    // Блокируем кнопки
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
    });
    
    // Через 3 секунды скрываем вопрос
    setTimeout(() => {
        questionScreen.style.display = 'none';
        waitingScreen.style.display = 'block';
    }, 3000);
}

/**
 * Отправить ответ
 */
function submitAnswer(answerIndex, question) {
    if (hasAnswered || !currentGameId || !playerName || !currentQuestionId) {
        return;
    }
    
    hasAnswered = true;
    clearInterval(timerInterval);
    
    // Блокируем все кнопки
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
    });
    
    // Подсвечиваем выбранный ответ
    const selectedBtn = document.querySelector(`.option-btn[data-index="${answerIndex}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // Проверяем правильность
    const isCorrect = (answerIndex === question.correct);
    
    // Отправляем ответ в Firebase
    db.ref(`games/${currentGameId}/answers/${currentQuestionId}/${playerName}`).set({
        answer: answerIndex,
        isCorrect: isCorrect,
        timestamp: Date.now(),
        timeSpent: question.time - parseInt(studentTimer.textContent)
    }).then(() => {
        // Показываем статус ответа
        if (answerStatus) {
            answerStatus.innerHTML = isCorrect 
                ? '<div class="answer-correct">✅ Ответ принят! Ожидайте результатов...</div>'
                : '<div class="answer-wrong">❌ Ответ принят! Ожидайте результатов...</div>';
        }
        
        // Обновляем счет игрока
        if (isCorrect) {
            db.ref(`games/${currentGameId}/players/${playerName}/score`).transaction(current => {
                return (current || 0) + 100;
            });
            db.ref(`games/${currentGameId}/players/${playerName}/totalCorrect`).transaction(current => {
                return (current || 0) + 1;
            });
        }
        
        // Переключаем на экран ожидания через 2 секунды
        setTimeout(() => {
            questionScreen.style.display = 'none';
            waitingScreen.style.display = 'block';
        }, 2000);
        
    }).catch(error => {
        console.error("Ошибка отправки ответа:", error);
        answerStatus.innerHTML = '<div class="answer-error">⚠️ Ошибка отправки ответа</div>';
    });
}

/**
 * Показать результат вопроса
 */
function showQuestionResult(game) {
    waitingScreen.style.display = 'none';
    questionScreen.style.display = 'none';
    resultScreen.style.display = 'block';
    
    const question = game.quiz.questions.find(q => q.id === currentQuestionId);
    if (!question) return;
    
    // Получаем ответ пользователя
    db.ref(`games/${currentGameId}/answers/${currentQuestionId}/${playerName}`).once('value').then(snapshot => {
        const userAnswer = snapshot.val();
        
        let resultHTML = '';
        
        if (userAnswer) {
            const isCorrect = userAnswer.isCorrect;
            const userAnswerText = question.options[userAnswer.answer];
            const correctAnswerText = question.options[question.correct];
            
            resultHTML = `
                <h3>${isCorrect ? '✅ Правильно!' : '❌ Неправильно'}</h3>
                <div class="result-details">
                    <p><strong>Ваш ответ:</strong> ${userAnswerText}</p>
                    <p><strong>Правильный ответ:</strong> ${correctAnswerText}</p>
                    <p><strong>Объяснение:</strong> ${question.explanation || 'Нет объяснения'}</p>
                    <p><strong>Время:</strong> ${question.time - userAnswer.timeSpent} сек.</p>
                </div>
            `;
        } else {
            resultHTML = `
                <h3>⏰ Вы не успели ответить</h3>
                <div class="result-details">
                    <p><strong>Правильный ответ:</strong> ${question.options[question.correct]}</p>
                    <p><strong>Объяснение:</strong> ${question.explanation || 'Нет объяснения'}</p>
                </div>
            `;
        }
        
        if (resultCard) {
            resultCard.innerHTML = resultHTML;
        }
        
        // Сбрасываем флаг для следующего вопроса
        setTimeout(() => {
            hasAnswered = false;
            currentQuestionId = null;
        }, 5000);
        
    }).catch(error => {
        console.error("Ошибка получения результата:", error);
    });
}

/**
 * Показать финальные результаты
 */
function showFinalResults(game) {
    resultScreen.style.display = 'block';
    resultScreen.innerHTML = `
        <h2>🏆 Игра завершена!</h2>
        <div class="final-results">
            <h3>Ваши результаты:</h3>
            <div class="score-card">
                <p>Имя: <strong>${playerName}</strong></p>
                <p>Правильных ответов: <strong>${game.players[playerName]?.totalCorrect || 0}/${game.quiz.questions.length}</strong></p>
                <p>Общий счет: <strong>${game.players[playerName]?.score || 0} очков</strong></p>
            </div>
            <button onclick="location.reload()" class="btn-primary">🔄 Новая игра</button>
        </div>
    `;
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
 * Получить метку типа вопроса
 */
function getTypeLabel(type) {
    const labels = {
        oral: "🎤 Устное собеседование",
        spelling: "📝 Орфография", 
        punctuation: "🔤 Пунктуация",
        syntax: "📚 Синтаксис",
        reading: "📖 Чтение",
        writing: "✍️ Письмо"
    };
    return labels[type] || type;
}

// ================ ИНИЦИАЛИЗАЦИЯ ================

// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log("student.js загружен");
    
    // Обработчик нажатия Enter в полях ввода
    if (gameCodeInput && playerNameInput) {
        gameCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') joinGame();
        });
        
        playerNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') joinGame();
        });
    }
    
    // Проверяем Firebase
    if (typeof firebase === 'undefined') {
        console.error("Firebase не загружен!");
        alert("Ошибка загрузки Firebase. Проверьте интернет-соединение.");
    }
    
    if (typeof db === 'undefined') {
        console.error("Firebase Database не инициализирован!");
    }
});

// ================ ГЛОБАЛЬНЫЙ ЭКСПОРТ ================
window.joinGame = joinGame;
window.submitAnswer = submitAnswer;
