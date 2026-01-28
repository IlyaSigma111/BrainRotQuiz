// Учительский скрипт - упрощенная версия
document.addEventListener('DOMContentLoaded', function() {
    // Элементы
    const createGameBtn = document.getElementById('create-game-btn');
    const gameNameInput = document.getElementById('game-name');
    const topicButtons = document.querySelectorAll('.topic-btn');
    const questionCountSlider = document.getElementById('question-count');
    const questionCountDisplay = document.getElementById('question-count-display');
    
    const gameInfoCard = document.getElementById('game-info-card');
    const controlCard = document.getElementById('control-card');
    const playersCard = document.getElementById('players-card');
    
    const gameCodeDisplay = document.getElementById('game-code-display');
    const gameLinkBox = document.getElementById('game-link-box');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const qrcodeDiv = document.getElementById('qrcode');
    
    const startGameBtn = document.getElementById('start-game-btn');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const endGameBtn = document.getElementById('end-game-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    
    const playerCountSpan = document.getElementById('player-count');
    const gameStatusSpan = document.getElementById('game-status');
    const playersList = document.getElementById('players-list');
    const playersCountSpan = document.getElementById('players-count');
    const bigPlayerCount = document.getElementById('big-player-count');
    
    const screens = {
        welcome: document.getElementById('welcome-screen'),
        waiting: document.getElementById('waiting-screen'),
        question: document.getElementById('question-screen'),
        results: document.getElementById('results-screen'),
        final: document.getElementById('final-screen')
    };
    
    const questionText = document.getElementById('question-text');
    const questionCategory = document.getElementById('question-category');
    const questionTimer = document.getElementById('question-timer');
    const currentQuestionSpan = document.getElementById('current-question');
    const totalQuestionsSpan = document.getElementById('total-questions');
    const optionsGrid = document.getElementById('options-grid');
    
    // Firebase
    let database;
    let gameRef;
    let playersRef;
    let currentGameCode = '';
    let currentQuestionIndex = 0;
    let timerInterval;
    
    // Инициализация Firebase
    try {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
            database = firebase.database();
            console.log('Firebase подключен');
        }
    } catch (error) {
        console.error('Ошибка Firebase:', error);
        alert('Проверьте подключение к интернету');
    }
    
    // Обновление счетчика вопросов
    questionCountSlider.addEventListener('input', function() {
        questionCountDisplay.textContent = this.value;
    });
    
    // Выбор темы
    topicButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            topicButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Создание игры
    createGameBtn.addEventListener('click', createGame);
    
    function createGame() {
        if (!database) {
            alert('Firebase не подключен. Проверьте интернет.');
            return;
        }
        
        const gameName = gameNameInput.value.trim() || 'Игра';
        const selectedTopic = document.querySelector('.topic-btn.active').dataset.topic;
        const questionCount = parseInt(questionCountSlider.value);
        
        // Генерация кода игры
        currentGameCode = generateGameCode();
        gameCodeDisplay.textContent = currentGameCode;
        
        // Создаем URL для учеников
        let studentUrl;
        if (window.location.hostname.includes('github.io')) {
            // GitHub Pages
            studentUrl = window.location.href.replace('brain-quiz-teacher', 'brain-quiz-student');
        } else {
            // Локальная разработка
            studentUrl = window.location.origin + '/student';
        }
        
        studentUrl = studentUrl.replace('/teacher', '/student');
        const fullUrl = `${studentUrl}?game=${currentGameCode}`;
        
        // Показываем ссылку
        gameLinkBox.textContent = fullUrl;
        
        // Генерируем QR-код
        qrcodeDiv.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrcodeDiv, {
                text: fullUrl,
                width: 180,
                height: 180,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
        
        // Создаем игру в Firebase
        gameRef = database.ref(`games/${currentGameCode}`);
        
        // Фильтруем вопросы
        let questionsToUse = [...quizQuestions];
        if (selectedTopic === 'oral') {
            questionsToUse = quizQuestions.filter(q => q.category.includes('Устное'));
        } else if (selectedTopic === 'oge') {
            questionsToUse = quizQuestions.filter(q => q.category.includes('ОГЭ'));
        }
        
        questionsToUse = questionsToUse.slice(0, questionCount);
        
        // Сохраняем настройки игры
        gameRef.set({
            code: currentGameCode,
            name: gameName,
            state: 'waiting',
            currentQuestion: 0,
            totalQuestions: questionsToUse.length,
            topic: selectedTopic,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            console.log('Игра создана, код:', currentGameCode);
            
            // Сохраняем вопросы
            const questionsData = {};
            questionsToUse.forEach((q, index) => {
                questionsData[index] = {
                    question: q.question,
                    options: q.options,
                    correct: q.correct,
                    category: q.category,
                    hint: q.hint || ''
                };
            });
            
            return gameRef.child('questions').set(questionsData);
        }).then(() => {
            // Показываем карточки управления
            gameInfoCard.style.display = 'block';
            controlCard.style.display = 'block';
            playersCard.style.display = 'block';
            
            // Переключаем на экран ожидания
            switchScreen('waiting');
            
            // Слушаем игроков
            playersRef = gameRef.child('players');
            playersRef.on('value', updatePlayersList);
            
            // Слушаем состояние игры
            gameRef.on('value', handleGameUpdate);
            
            // Активируем кнопки
            startGameBtn.disabled = false;
            gameStatusSpan.textContent = 'Ожидание игроков';
            
            alert(`Игра "${gameName}" создана!\nКод: ${currentGameCode}\nПокажите этот код ученикам`);
        }).catch(error => {
            console.error('Ошибка создания игры:', error);
            alert('Ошибка создания игры: ' + error.message);
        });
    }
    
    function generateGameCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    
    function updatePlayersList(snapshot) {
        const players = snapshot.val() || {};
        const count = Object.keys(players).length;
        
        playerCountSpan.textContent = count;
        playersCountSpan.textContent = count;
        bigPlayerCount.textContent = count;
        
        let html = '';
        if (count === 0) {
            html = '<div class="empty">Нет подключенных игроков</div>';
        } else {
            Object.values(players).forEach(player => {
                html += `
                    <div class="player-item">
                        <div class="player-avatar">
                            ${player.name ? player.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div class="player-name">${player.name || 'Аноним'}</div>
                        <div class="player-score">${player.score || 0}</div>
                    </div>
                `;
            });
        }
        
        playersList.innerHTML = html;
    }
    
    function handleGameUpdate(snapshot) {
        const gameData = snapshot.val();
        if (!gameData) return;
        
        const state = gameData.state || 'waiting';
        currentQuestionIndex = gameData.currentQuestion || 0;
        
        // Обновляем статус
        const statusTexts = {
            'waiting': 'Ожидание',
            'question': 'Вопрос активен',
            'results': 'Результаты',
            'finished': 'Завершено'
        };
        gameStatusSpan.textContent = statusTexts[state] || 'Неизвестно';
        
        // Переключаем экраны
        switchScreen(state);
        
        // Обновляем информацию о вопросе
        if (gameData.totalQuestions) {
            totalQuestionsSpan.textContent = gameData.totalQuestions;
        }
        
        // Если активен вопрос
        if (state === 'question') {
            showQuestion(currentQuestionIndex);
            startTimer();
            nextQuestionBtn.disabled = true;
        }
        
        // Если показываем результаты
        if (state === 'results') {
            showResults(currentQuestionIndex);
            nextQuestionBtn.disabled = false;
        }
        
        // Если игра завершена
        if (state === 'finished') {
            showFinalResults();
            nextQuestionBtn.disabled = true;
            startGameBtn.disabled = true;
        }
    }
    
    function switchScreen(screenName) {
        // Скрываем все экраны
        Object.values(screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Показываем нужный экран
        if (screens[screenName]) {
            screens[screenName].classList.add('active');
        }
    }
    
    function showQuestion(index) {
        if (!gameRef) return;
        
        gameRef.child(`questions/${index}`).once('value').then(snapshot => {
            const question = snapshot.val();
            if (!question) return;
            
            currentQuestionSpan.textContent = index + 1;
            questionCategory.textContent = question.category;
            questionText.textContent = question.question;
            
            // Показываем варианты
            let optionsHtml = '';
            question.options.forEach((option, i) => {
                optionsHtml += `
                    <div class="option-card" data-index="${i}">
                        <div class="option-letter">${String.fromCharCode(65 + i)}</div>
                        <div class="option-text">${option}</div>
                    </div>
                `;
            });
            
            optionsGrid.innerHTML = optionsHtml;
        });
    }
    
    function startTimer() {
        clearInterval(timerInterval);
        let timeLeft = 30;
        questionTimer.textContent = timeLeft;
        
        timerInterval = setInterval(() => {
            timeLeft--;
            questionTimer.textContent = timeLeft;
            
            if (timeLeft <= 10) {
                questionTimer.style.color = '#ef4444';
            }
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                // Автоматически переходим к результатам
                if (gameRef) {
                    gameRef.update({ state: 'results' });
                }
            }
        }, 1000);
    }
    
    function showResults(questionIndex) {
        if (!gameRef || !playersRef) return;
        
        // Получаем вопрос
        gameRef.child(`questions/${questionIndex}`).once('value').then(qSnapshot => {
            const question = qSnapshot.val();
            if (!question) return;
            
            // Получаем ответы игроков
            playersRef.once('value').then(pSnapshot => {
                const players = pSnapshot.val() || {};
                
                // Считаем статистику
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
                const statsContainer = document.getElementById('stats-container');
                let statsHtml = '';
                
                question.options.forEach((option, i) => {
                    const count = answerCounts[i];
                    const percentage = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0;
                    const isCorrect = i === question.correct;
                    
                    statsHtml += `
                        <div class="stat-row">
                            <div class="stat-label">
                                <span class="stat-letter">${String.fromCharCode(65 + i)}</span>
                                <span>${option}</span>
                                ${isCorrect ? '<span style="color:#10b981; margin-left:10px;">✓ Правильный</span>' : ''}
                            </div>
                            <div class="bar-container">
                                <div class="bar" style="width: ${Math.max(10, percentage)}%">
                                    ${count} (${percentage}%)
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                statsContainer.innerHTML = statsHtml;
                
                // Показываем мини-лидерборд
                showMiniLeaderboard(players);
            });
        });
    }
    
    function showMiniLeaderboard(players) {
        const sortedPlayers = Object.values(players)
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 5);
        
        let html = '';
        sortedPlayers.forEach((player, index) => {
            html += `
                <div class="leaderboard-item">
                    <span class="rank">${index + 1}</span>
                    <span class="name">${player.name || 'Аноним'}</span>
                    <span class="score">${player.score || 0}</span>
                </div>
            `;
        });
        
        document.getElementById('quick-leaderboard').innerHTML = html;
    }
    
    function showFinalResults() {
        if (!playersRef) return;
        
        playersRef.once('value').then(snapshot => {
            const players = snapshot.val() || {};
            const sortedPlayers = Object.values(players)
                .sort((a, b) => (b.score || 0) - (a.score || 0));
            
            let html = '';
            sortedPlayers.forEach((player, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                
                html += `
                    <div class="leaderboard-item">
                        <span class="rank">${index + 1} ${medal}</span>
                        <span class="name">${player.name || 'Аноним'}</span>
                        <span class="score">${player.score || 0}</span>
                    </div>
                `;
            });
            
            document.getElementById('final-leaderboard').innerHTML = html;
        });
    }
    
    // Кнопка "Начать игру"
    startGameBtn.addEventListener('click', function() {
        if (gameRef) {
            gameRef.update({
                state: 'question',
                currentQuestion: 0
            });
            this.disabled = true;
        }
    });
    
    // Кнопка "Следующий вопрос"
    nextQuestionBtn.addEventListener('click', function() {
        if (!gameRef) return;
        
        const nextIndex = currentQuestionIndex + 1;
        
        gameRef.once('value').then(snapshot => {
            const gameData = snapshot.val();
            if (nextIndex < (gameData.totalQuestions || 10)) {
                gameRef.update({
                    state: 'question',
                    currentQuestion: nextIndex
                });
            } else {
                gameRef.update({ state: 'finished' });
            }
        });
    });
    
    // Кнопка "Завершить игру"
    endGameBtn.addEventListener('click', function() {
        if (gameRef) {
            gameRef.update({ state: 'finished' });
        }
    });
    
    // Кнопка "Новая игра"
    newGameBtn.addEventListener('click', function() {
        location.reload();
    });
    
    // Кнопка копирования ссылки
    copyLinkBtn.addEventListener('click', function() {
        const link = gameLinkBox.textContent;
        if (link && link !== '...') {
            navigator.clipboard.writeText(link).then(() => {
                alert('Ссылка скопирована!');
            });
        }
    });
});
