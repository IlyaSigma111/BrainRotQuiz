// В функции handleQuestionActive в student.js обновим:
function handleQuestionActive(game) {
    if (hasAnswered || !game.currentQuestion) return;
    
    // ОБНОВЛЕНИЕ: Проверяем, не отвечали ли мы уже на этот вопрос
    if (currentQuestion && currentQuestion.id === game.currentQuestion && hasAnswered) {
        return; // Уже ответили на этот вопрос
    }
    
    // Сбрасываем состояние ответа для нового вопроса
    hasAnswered = false;
    selectedOption = null;
    
    currentQuestion = QUIZ_DATA.questions.find(q => q.id === game.currentQuestion);
    if (!currentQuestion) return;
    
    // Обновить UI
    switchScreen('question');
    
    // Показать вопрос
    displayQuestion(currentQuestion);
    
    // Запустить таймер на 25 секунд
    startTimer(25); // ВМЕСТО currentQuestion.time
    
    console.log(`❓ Вопрос ${currentQuestion.id}: ${currentQuestion.text.substring(0, 30)}...`);
}

// В функции startTimer изменим на 25 секунд:
function startTimer(seconds) {
    clearTimer();
    
    let timeLeft = 25; // ВСЕГДА 25 секунд
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
