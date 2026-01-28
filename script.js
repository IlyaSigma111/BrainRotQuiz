// Учительский скрипт
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Firebase
    let database;
    let currentGameCode;
    let gameRef;
    let playersRef;
    let questionsRef;
    let currentQuestionIndex = 0;
    let gameState = 'waiting';
    let timerInterval;
    
    // Инициализация Firebase
    if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
    }
    database = firebase.database();
    
    // Элементы DOM
    const createGameModal = document.getElementById('create-game-modal');
    const createGameBtn = document.getElementById('create-game');
    const quickStartBtn = document.getElementById('quick-start');
    const startGameBtn = document.getElementById('start-game');
    const nextQuestionBtn = document.getElementById('next-question');
    const endGameBtn = document.getElementById('end-game');
    const newGameBtn = document.getElementById('new-game');
    const copyLinkBtn = document.getElementById('copy-link');
    
    const gameCodeDisplay = document.getElementById('game-code-display');
    const gameLinkDisplay = document.getElementById('game-link');
    const playerCount = document.getElementById('player-count');
    const gameStatus = document.getElementById('game-status');
    const playersList = document.getElementById('players-list');
    
    const waitingScreen = document.getElementById('waiting-screen');
    const questionScreen = document.getElementById('question-screen');
    const resultsScreen = document.getElementById('results-screen');
    const finalScreen = document.getElementById('final-screen');
    
    const displayQuestion = document.getElementById('display-question');
    const displayOptions = document.getElementById('display-options');
    const displayTimer = document.getElementById('display-timer');
    const currentQuestionSpan = document.getElementById('current-question');
    const totalQuestionsSpan = document.getElementById('total-questions');
    
    const questionCountSlider = document.getElementById('question-count');
    const countValue = document.getElementById('count-value');
    
    // Обновление значения слайдера
    questionCountSlider.addEventListener('input', function() {
        countValue.textContent = this.value;
    });
    
    // Выбор темы
    document.querySelectorAll('.topic-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Создание игры
    createGameBtn.addEventListener('click', createNewGame);
    quickStartBtn.addEventListener('click', function() {
        document.getElementById('game-name').value = 'Быстрая игра';
        createNewGame();
    });
    
    function createNewGame() {
        // Генерация кода игры (4 цифры)
        currentGameCode = generateGameCode();
        gameCodeDisplay.textContent = currentGameCode;
        
        // Получаем настройки
        const gameName = document.getElementById('game-name').value || 'Игра';
        const selectedTopic = document.querySelector('.topic-btn.active').dataset.topic;
        const questionCount = parseInt(questionCountSlider.value);
        
        // Создаем ссылку для учеников
        const studentUrl = `${window.location.origin.replace('teacher', 'student')}?game=${currentGameCode}`;
        gameLinkDisplay.textContent = studentUrl;
        
        // Генерируем QR-код
        document.getElementById('qrcode').innerHTML = '';
        new QRCode(document.getElementById('qrcode'), {
            text: studentUrl,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff"
        });
        
        // Создаем ссылки в Firebase
        gameRef = database.ref(`games/${currentGameCode}`);
        playersRef = gameRef.child('players');
        questionsRef = gameRef.child('questions');
        
        // Фильтруем вопросы по теме
        let filteredQuestions = quizQuestions;
        if (selectedTopic === 'oral') {
            filteredQuestions = quizQuestions.filter(q => q.category.includes('Устное'));
        } else if (selectedTopic === 'oge') {
            filteredQuestions = quizQuestions.filter(q => q.category.includes('ОГЭ'));
        }
        
        // Ограничиваем количество вопросов
        const selectedQuestions = filteredQuestions.slice(0, questionCount);
        
        // Сохраняем настройки игры
        gameRef.set({
            code: currentGameCode,
            name: gameName,
            state: 'waiting',
            currentQuestion: 0,
            totalQuestions: selectedQuestions.length,
            topic: selectedTopic,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Сохраняем вопросы
        const questionsData = {};
        selectedQuestions.forEach((q, index) => {
            questionsData[index] = {
                question: q.question,
                options: q.options,
                correct: q.correct,
                category: q.category,
                topic: q.topic,
                hint: q.hint
            };
        });
        questionsRef.set(questionsData);
        
        // Начинаем слушать игроков
        playersRef.on('value', updatePlayersList);
        
        // Слушаем изменения состояния игры
        gameRef.on('value', handleGameUpdate);
        
        // Закрываем модальное окно
        createGameModal.classList.remove('active');
        
        // Активируем кнопки управления
        startGameBtn.disabled = false;
        gameStatus.textContent = 'Ожидание';
    }
    
    function generateGameCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    
    function updatePlayersList(snapshot) {
        const players = snapshot.val() || {};
        const count = Object.keys(players).length;
        playerCount.textContent = count;
        
        let html = '';
        if (count === 0) {
            html = `
                <div class="empty-state">
                    <i class="fas fa-user-plus"></i>
                    <p>Игроки появятся здесь</p>
                </div>
            `;
        } else {
            Object.values(players).forEach(player => {
                html += `
                    <div class="player-item">
                        <div class="player-avatar">
                            ${player.name ? player.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div class="player-info">
                            <div class="player-name">${player.name || 'Аноним'}</div>
                            <div class="player-stats">
                                <span>${player.score || 0} очков</span>
                                <span>${player.correct || 0} верно</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        playersList.innerHTML = html;
    }
    
    function handleGameUpdate(snapshot) {
        const gameData = snapshot.val();
        if (!gameData) return;
        
        gameState = gameData.state;
        currentQuestionIndex = gameData.currentQuestion || 0;
        
        // Обновляем интерфейс в зависимости от состояния
        const screens = {
            'waiting': waitingScreen,
            'question': questionScreen,
            'results': resultsScreen,
            'finished': finalScreen
        };
        
        // Скрываем все экраны
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        
        // Показываем нужный экран
        if (screens[gameState]) {
            screens[gameState].classList.add('active');
        }
        
        // Обновляем статус
        const statusText = {
            'waiting': 'Ожидание игроков',
            'question': 'Вопрос активен',
            'results': 'Показ результатов',
            'finished': 'Игра завершена'
        };
        gameStatus.textContent = statusText[gameState] || 'Неизвестно';
        
        // Обновляем кнопки
        nextQuestionBtn.disabled = gameState !== 'results';
        
        // Если активен вопрос - показываем его
        if (gameState === 'question') {
            showQuestion(currentQuestionIndex);
            startQuestionTimer();
        }
        
        // Если показываем результаты - обновляем статистику
        if (gameState === 'results') {
            showResults(currentQuestionIndex);
        }
        
        // Если игра завершена - показываем финальный лидерборд
        if (gameState === 'finished') {
            showFinalResults();
        }
    }
    
    // Кнопка "Начать игру"
    startGameBtn.addEventListener('click', function() {
        if (!gameRef) return;
        
        gameRef.update({
            state: 'question',
            currentQuestion: 0,
            startedAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        this.disabled = true;
        nextQuestionBtn.disabled = false;
    });
    
    // Кнопка "Следующий вопрос"
    nextQuestionBtn.addEventListener('click', function() {
        if (!gameRef) return;
        
        currentQuestionIndex++;
        
        if (currentQuestionIndex >= (gameRef.totalQuestions || 10)) {
            // Завершаем игру
            endGame();
        } else {
            gameRef.update({
                state: 'question',
                currentQuestion: currentQuestionIndex
            });
        }
    });
    
    // Кнопка "Завершить игру"
    endGameBtn.addEventListener('click', function() {
        endGame();
    });
    
    function endGame() {
        clearInterval(timerInterval);
        
        if (gameRef) {
            gameRef.update({
                state: 'finished',
                finishedAt: firebase.database.ServerValue.TIMESTAMP
            });
        }
    }
    
    // Кнопка "Новая игра"
    newGameBtn.addEventListener('click', function() {
        location.reload();
    });
    
    // Кнопка копирования ссылки
    copyLinkBtn.addEventListener('click', function() {
        const link = gameLinkDisplay.textContent;
        navigator.clipboard.writeText(link).then(() => {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
            setTimeout(() => {
                this.innerHTML = originalText;
            }, 2000);
        });
    });
    
    function showQuestion(index) {
        if (!questionsRef) return;
        
        questionsRef.child(index).once('value').then(snapshot => {
            const question = snapshot.val();
            if (!question) return;
            
            // Обновляем номер вопроса
            gameRef.once('value').then(gameSnapshot => {
                const gameData = gameSnapshot.val();
                currentQuestionSpan.textContent = index + 1;
                totalQuestionsSpan.textContent = gameData.totalQuestions || 10;
            });
            
            // Показываем вопрос
            displayQuestion.textContent = question.question;
            
            // Показываем варианты
            let optionsHtml = '';
            question.options.forEach((option, i) => {
                optionsHtml += `
                    <div class="display-option" data-index="${i}">
                        <div class="option-letter">${String.fromCharCode(65 + i)}</div>
                        <div class="option-text">${option}</div>
                    </div>
                `;
            });
            displayOptions.innerHTML = optionsHtml;
        });
    }
    
    function startQuestionTimer() {
        let timeLeft = 30;
        displayTimer.textContent = timeLeft;
        
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            displayTimer.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                // Автоматически переходим к результатам
                if (gameRef && gameState === 'question') {
                    gameRef.update({
                        state: 'results'
                    });
                }
            }
        }, 1000);
    }
    
    function showResults(questionIndex) {
        if (!questionsRef || !playersRef) return;
        
        // Получаем вопрос
        questionsRef.child(questionIndex).once('value').then(qSnapshot => {
            const question = qSnapshot.val();
            if (!question) return;
            
            // Получаем ответы игроков
            playersRef.once('value').then(pSnapshot => {
                const players = pSnapshot.val() || {};
                
                // Считаем статистику ответов
                const answerCounts = [0, 0, 0, 0];
                let totalAnswers = 0;
                
                Object.values(players).forEach(player => {
                    if (player.answers && player.answers[questionIndex] !== undefined) {
                        const answer = player.answers[questionIndex];
                        if (answer >= 0 && answer < 4) {
                            answerCounts[answer]++;
                            totalAnswers++;
                        }
                    }
                });
                
                // Показываем статистику
                const statsGrid = document.getElementById('answer-stats');
                let statsHtml = '';
                
                question.options.forEach((option, i) => {
                    const count = answerCounts[i];
                    const percentage = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0;
                    const isCorrect = i === question.correct;
                    
                    statsHtml += `
                        <div class="stat-row">
                            <div class="stat-label">
                                <span class="letter">${String.fromCharCode(65 + i)}</span>
                                <span>${option}</span>
                                ${isCorrect ? '<span class="correct-mark">✓ Правильный</span>' : ''}
                            </div>
                            <div class="bar-container">
                                <div class="bar" style="width: ${percentage}%">
                                    ${count} (${percentage}%)
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                statsGrid.innerHTML = statsHtml;
                
                // Показываем мини-лидерборд
                showMiniLeaderboard(players);
            });
        });
    }
    
    function showMiniLeaderboard(players) {
        // Сортируем игроков по очкам
        const sortedPlayers = Object.values(players)
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 5);
        
        let leaderboardHtml = '';
        sortedPlayers.forEach((player, index) => {
            leaderboardHtml += `
                <div class="leaderboard-item">
                    <span class="rank">${index + 1}</span>
                    <span class="name">${player.name || 'Аноним'}</span>
                    <span class="score">${player.score || 0} очков</span>
                </div>
            `;
        });
        
        document.getElementById('mini-leaderboard-content').innerHTML = leaderboardHtml;
    }
    
    function showFinalResults() {
        if (!playersRef) return;
        
        playersRef.once('value').then(snapshot => {
            const players = snapshot.val() || {};
            const sortedPlayers = Object.values(players)
                .sort((a, b) => (b.score || 0) - (a.score || 0));
            
            let finalHtml = '';
            sortedPlayers.forEach((player, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
                
                finalHtml += `
                    <div class="leaderboard-item">
                        <span class="rank">${index + 1} ${medal}</span>
                        <span class="name">${player.name || 'Аноним'}</span>
                        <span class="score">${player.score || 0} очков</span>
                    </div>
                `;
            });
            
            document.getElementById('final-leaderboard').innerHTML = finalHtml;
        });
    }
});
