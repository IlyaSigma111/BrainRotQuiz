// Основная игровая логика Brain Rot Quiz
document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
    const modeScreen = document.getElementById('mode-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultsScreen = document.getElementById('results-screen');
    const leaderboardScreen = document.getElementById('leaderboard-screen');
    
    const nameModal = document.getElementById('name-modal');
    const playerNameInput = document.getElementById('player-name-input');
    const saveNameBtn = document.getElementById('save-name-btn');
    
    // Игровые переменные
    let currentQuestionIndex = 0;
    let score = 0;
    let correctCount = 0;
    let streak = 0;
    let bestStreak = 0;
    let totalTime = 0;
    let timer;
    let timeLeft;
    let playerName = "Мозго-Воин";
    let selectedTopic = 'all';
    
    const questionTime = 30; // секунд на вопрос
    let questions = [];
    
    // Инициализация
    function initGame() {
        // Загружаем вопросы по выбранной теме
        questions = getQuestionsByTopic(selectedTopic);
        
        // Сброс статистики
        currentQuestionIndex = 0;
        score = 0;
        correctCount = 0;
        streak = 0;
        bestStreak = 0;
        totalTime = 0;
        
        // Обновление интерфейса
        document.getElementById('total-q').textContent = questions.length;
        document.getElementById('score').textContent = score;
        document.getElementById('streak').textContent = streak;
        
        // Показываем модальное окно для имени, если имя не установлено
        if (!localStorage.getItem('brainQuizPlayerName')) {
            nameModal.classList.add('active');
        } else {
            playerName = localStorage.getItem('brainQuizPlayerName');
            startGame();
        }
    }
    
    // Обработчик сохранения имени
    saveNameBtn.addEventListener('click', function() {
        const name = playerNameInput.value.trim();
        if (name) {
            playerName = name;
            localStorage.setItem('brainQuizPlayerName', name);
            nameModal.classList.remove('active');
            startGame();
        } else {
            playerNameInput.style.borderColor = 'var(--secondary)';
            playerNameInput.placeholder = 'Введи имя, мозго-воин!';
        }
    });
    
    // Начало игры
    function startGame() {
        modeScreen.classList.remove('active');
        gameScreen.classList.add('active');
        
        document.getElementById('player-name').textContent = playerName;
        loadQuestion();
    }
    
    // Загрузка вопроса
    function loadQuestion() {
        clearInterval(timer);
        
        if (currentQuestionIndex >= questions.length) {
            endGame();
            return;
        }
        
        const question = questions[currentQuestionIndex];
        
        // Обновляем интерфейс
        document.getElementById('current-q').textContent = currentQuestionIndex + 1;
        document.getElementById('question-category').textContent = question.category;
        document.getElementById('question-difficulty').textContent = getDifficultyText(question.difficulty || 2);
        document.getElementById('question-text').textContent = question.question;
        document.getElementById('hint-text').textContent = question.hint || 'Подсказка не предусмотрена';
        
        // Обновляем прогресс-бар
        const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
        document.querySelector('.progress-fill').style.width = `${progressPercent}%`;
        
        // Очищаем контейнер вариантов
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        // Создаем варианты ответов
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <div class="option-letter">${String.fromCharCode(65 + index)}</div>
                <div class="option-text">${option}</div>
            `;
            
            optionElement.addEventListener('click', () => checkAnswer(index, question.correct));
            optionsContainer.appendChild(optionElement);
        });
        
        // Скрываем фидбэк
        document.querySelector('.feedback-container').style.display = 'none';
        
        // Запускаем таймер
        timeLeft = questionTime;
        document.getElementById('timer').textContent = timeLeft;
        
        timer = setInterval(() => {
            timeLeft--;
            document.getElementById('timer').textContent = timeLeft;
            totalTime++;
            
            // Обновляем визуализацию таймера
            updateTimerVisual();
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                showTimeOut();
            }
        }, 1000);
    }
    
    // Визуализация таймера
    function updateTimerVisual() {
        const timerElement = document.getElementById('timer');
        if (timeLeft <= 10) {
            timerElement.style.color = 'var(--secondary)';
            timerElement.classList.add('pulse');
        } else if (timeLeft <= 20) {
            timerElement.style.color = 'orange';
        } else {
            timerElement.style.color = 'var(--primary)';
            timerElement.classList.remove('pulse');
        }
    }
    
    // Проверка ответа
    function checkAnswer(selectedIndex, correctIndex) {
        clearInterval(timer);
        
        const options = document.querySelectorAll('.option');
        const isCorrect = selectedIndex === correctIndex;
        
        // Подсвечиваем ответы
        options.forEach((option, index) => {
            option.style.pointerEvents = 'none';
            
            if (index === correctIndex) {
                option.classList.add('correct-answer');
            } else if (index === selectedIndex && !isCorrect) {
                option.classList.add('wrong-answer');
            }
        });
        
        // Обработка результата
        if (isCorrect) {
            // Вычисляем очки: базовые + бонус за скорость
            const basePoints = 100;
            const speedBonus = timeLeft * 10; // Максимум 300 очков за скорость
            const streakBonus = streak * 50; // Бонус за серию
            const totalPoints = basePoints + speedBonus + streakBonus;
            
            score += totalPoints;
            correctCount++;
            streak++;
            
            if (streak > bestStreak) {
                bestStreak = streak;
            }
            
            // Показываем успех
            showFeedback(`🎯 БАМ! Правильно! +${totalPoints} очков 
            (${speedBonus} за скорость + ${streakBonus} за серию)`, true, totalPoints);
        } else {
            streak = 0;
            showFeedback(`💥 Промах! Правильный ответ: ${String.fromCharCode(65 + correctIndex)}`, false, 0);
        }
        
        // Обновляем статистику
        document.getElementById('score').textContent = score;
        document.getElementById('streak').textContent = streak;
        
        // Сохраняем в Firebase
        saveGameResult();
    }
    
    // Таймаут
    function showTimeOut() {
        streak = 0;
        showFeedback('⏰ Время вышло! Твой мозг замедлился...', false, 0);
        document.getElementById('streak').textContent = streak;
    }
    
    // Показать фидбэк
    function showFeedback(text, isSuccess, points) {
        const feedbackContainer = document.querySelector('.feedback-container');
        const feedbackContent = document.getElementById('feedback-content');
        
        feedbackContent.innerHTML = `
            <div class="feedback-message ${isSuccess ? 'success' : 'error'}">
                <h3>${text}</h3>
                ${points > 0 ? `<div class="points-animation">+${points}</div>` : ''}
            </div>
        `;
        
        feedbackContainer.style.display = 'block';
        
        // Добавляем кнопку "Далее"
        const nextBtn = document.getElementById('next-btn');
        nextBtn.onclick = nextQuestion;
        
        // Автоматический переход через 3 секунды
        setTimeout(() => {
            if (document.querySelector('.feedback-container').style.display === 'block') {
                nextQuestion();
            }
        }, 3000);
    }
    
    // Следующий вопрос
    function nextQuestion() {
        currentQuestionIndex++;
        
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            endGame();
        }
    }
    
    // Завершение игры
    function endGame() {
        clearInterval(timer);
        gameScreen.classList.remove('active');
        resultsScreen.classList.add('active');
        
        // Обновляем результаты
        const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
        const brainLevel = getBrainLevel(accuracy, score);
        
        document.getElementById('final-score').textContent = score;
        document.getElementById('correct-count').textContent = `${correctCount}/${questions.length} (${accuracy}%)`;
        document.getElementById('best-streak').textContent = bestStreak;
        document.getElementById('total-time').textContent = `${totalTime}с`;
        document.getElementById('brain-level').textContent = brainLevel;
        
        // Отображаем достижения
        showAchievements();
        
        // Сохраняем в лидерборд
        saveToLeaderboard();
    }
    
    // Определение уровня мозга
    function getBrainLevel(accuracy, score) {
        if (accuracy >= 90 && score > 2000) return 'ГЕНИЙ 🧠💎';
        if (accuracy >= 80) return 'ПРОФИ 🧠🔥';
        if (accuracy >= 60) return 'СПЕЦИАЛИСТ 🧠⚡';
        if (accuracy >= 40) return 'УЧЕНИК 🧠📚';
        return 'НОВИЧОК 🧠🌱';
    }
    
    // Показать достижения
    function showAchievements() {
        const achievements = [];
        
        if (correctCount === questions.length) {
            achievements.push({ title: '💯 Идеальный результат', desc: 'Все ответы верны!' });
        }
        
        if (bestStreak >= 5) {
            achievements.push({ title: '🔥 Горячая серия', desc: `${bestStreak} правильных ответов подряд` });
        }
        
        if (score > 1500) {
            achievements.push({ title: '🏆 Высший балл', desc: `${score} очков - невероятно!` });
        }
        
        if (totalTime < questions.length * 15) {
            achievements.push({ title: '⚡ Скорострел', desc: 'Отвечал быстрее всех' });
        }
        
        const achievementsList = document.getElementById('achievements-list');
        achievementsList.innerHTML = achievements.map(ach => `
            <div class="achievement-item">
                <div class="achievement-icon">${ach.title.split(' ')[0]}</div>
                <div class="achievement-info">
                    <h4>${ach.title}</h4>
                    <p>${ach.desc}</p>
                </div>
            </div>
        `).join('');
    }
    
    // Сохранение в Firebase
    function saveGameResult() {
        if (!window.database) return;
        
        const gameRef = window.database.ref('games').push();
        gameRef.set({
            player: playerName,
            score: score,
            correct: correctCount,
            total: questions.length,
            streak: streak,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }
    
    function saveToLeaderboard() {
        if (!window.database) return;
        
        const leaderboardRef = window.database.ref('leaderboard').push();
        leaderboardRef.set({
            player: playerName,
            score: score,
            accuracy: Math.round((correctCount / questions.length) * 100),
            date: new Date().toISOString().split('T')[0],
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }
    
    // Загрузка вопросов по теме
    function getQuestionsByTopic(topic) {
        // Берем базовые вопросы из quiz-data.js
        let filteredQuestions = [...quizQuestions];
        
        if (topic === 'oral') {
            filteredQuestions = quizQuestions.filter(q => q.category.includes('Устное'));
        } else if (topic === 'oge') {
            filteredQuestions = quizQuestions.filter(q => q.category.includes('ОГЭ'));
        } else if (topic === 'random') {
            // Перемешиваем вопросы
            filteredQuestions = [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
        }
        
        // Добавляем сложность
        return filteredQuestions.map(q => ({
            ...q,
            difficulty: Math.floor(Math.random() * 3) + 1 // 1-3
        }));
    }
    
    function getDifficultyText(level) {
        switch(level) {
            case 1: return 'Легкая';
            case 2: return 'Средняя';
            case 3: return 'Сложная';
            default: return 'Средняя';
        }
    }
    
    // Обработчики кнопок режимов
    document.querySelectorAll('[data-action="start-solo"]').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedTopic = 'all';
            initGame();
        });
    });
    
    document.querySelectorAll('[data-action="start-battle"]').forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Режим Battle будет в следующем обновлении! 🚀');
        });
    });
    
    document.querySelectorAll('[data-topic]').forEach(btn => {
        btn.addEventListener('click', function() {
            selectedTopic = this.getAttribute('data-topic');
            initGame();
        });
    });
    
    // Кнопки результатов
    document.getElementById('play-again-btn').addEventListener('click', () => {
        resultsScreen.classList.remove('active');
        modeScreen.classList.add('active');
    });
    
    document.getElementById('leaderboard-btn').addEventListener('click', () => {
        resultsScreen.classList.remove('active');
        leaderboardScreen.classList.add('active');
        loadLeaderboard();
    });
    
    document.getElementById('back-to-main').addEventListener('click', () => {
        leaderboardScreen.classList.remove('active');
        modeScreen.classList.add('active');
    });
    
    // Загрузка лидерборда
    function loadLeaderboard() {
        if (!window.database) return;
        
        const leaderboardRef = window.database.ref('leaderboard');
        leaderboardRef.orderByChild('score').limitToLast(20).once('value')
            .then(snapshot => {
                const scores = [];
                snapshot.forEach(child => {
                    scores.push(child.val());
                });
                
                scores.sort((a, b) => b.score - a.score);
                displayLeaderboard(scores);
            });
    }
    
    function displayLeaderboard(scores) {
        const leaderboardContent = document.getElementById('leaderboard-content');
        
        if (scores.length === 0) {
            leaderboardContent.innerHTML = '<p class="no-data">Пока нет результатов. Будь первым! 🏆</p>';
            return;
        }
        
        let html = '';
        scores.forEach((score, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
            const isCurrentPlayer = score.player === playerName;
            
            html += `
                <div class="leaderboard-item ${isCurrentPlayer ? 'current-player' : ''}">
                    <div class="rank">${index + 1} ${medal}</div>
                    <div class="player">${score.player}</div>
                    <div class="score">${score.score} очков</div>
                    <div class="accuracy">${score.accuracy || 0}%</div>
                </div>
            `;
        });
        
        leaderboardContent.innerHTML = html;
    }
    
    // Бонусные кнопки
    document.getElementById('hint-btn').addEventListener('click', function() {
        if (score >= 50) {
            score -= 50;
            document.getElementById('score').textContent = score;
            
            // Показываем подсказку
            document.getElementById('hint-box').style.display = 'flex';
            this.disabled = true;
            
            setTimeout(() => {
                this.disabled = false;
            }, 5000);
        }
    });
    
    document.getElementById('skip-btn').addEventListener('click', function() {
        if (score >= 100) {
            score -= 100;
            document.getElementById('score').textContent = score;
            nextQuestion();
        }
    });
    
    // Инициализация при загрузке
    updateOnlineStats();
});
