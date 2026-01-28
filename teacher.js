// Учительский скрипт - ИСПРАВЛЕННАЯ ВЕРСИЯ
document.addEventListener('DOMContentLoaded', function() {
    // Элементы формы
    const createGameBtn = document.getElementById('create-game-btn');
    const gameNameInput = document.getElementById('game-name');
    const topicButtons = document.querySelectorAll('.topic-btn');
    const questionCountSlider = document.getElementById('question-count');
    const questionCountDisplay = document.getElementById('question-count-display');
    
    // Элементы информации об игре
    const gameInfoCard = document.getElementById('game-info-card');
    const controlCard = document.getElementById('control-card');
    const playersCard = document.getElementById('players-card');
    
    const gameCodeDisplay = document.getElementById('game-code-display');
    const gameLinkBox = document.getElementById('game-link-box');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    
    // Элементы управления
    const startGameBtn = document.getElementById('start-game-btn');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const endGameBtn = document.getElementById('end-game-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    
    // Элементы статистики
    const playerCountSpan = document.getElementById('player-count');
    const gameStatusSpan = document.getElementById('game-status');
    const playersList = document.getElementById('players-list');
    const playersCountSpan = document.getElementById('players-count');
    const bigPlayerCount = document.getElementById('big-player-count');
    const bigGameCode = document.getElementById('big-game-code');
    const instructionCode = document.getElementById('instruction-code');
    
    // Экранные элементы
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
    
    // Firebase переменные
    let database;
    let gameRef;
    let playersRef;
    let currentGameCode = '';
    let currentQuestionIndex = 0;
    let timerInterval;
    let selectedTopic = 'all';
    
    // === ИНИЦИАЛИЗАЦИЯ ===
    function init() {
        console.log('Инициализация учительского интерфейса...');
        
        // Инициализация Firebase
        try {
            firebase.initializeApp(firebaseConfig);
            database = firebase.database();
            console.log('Firebase успешно подключен');
        } catch (error) {
            console.error('Ошибка Firebase:', error);
            alert('Ошибка подключения к базе данных. Проверьте интернет.');
        }
        
        // Настройка слайдера
        questionCountSlider.addEventListener('input', function() {
            questionCountDisplay.textContent = this.value;
        });
        
        // Настройка кнопок тем
        topicButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                console.log('Выбрана тема:', this.dataset.topic);
                topicButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                selectedTopic = this.dataset.topic;
            });
        });
        
        // Привязка обработчиков событий
        createGameBtn.addEventListener('click', handleCreateGame);
        startGameBtn.addEventListener('click', handleStartGame);
        nextQuestionBtn.addEventListener('click', handleNextQuestion);
        endGameBtn.addEventListener('click', handleEndGame);
        newGameBtn.addEventListener('click', handleNewGame);
        copyLinkBtn.addEventListener('click', handleCopyLink);
        
        // Устанавливаем активной тему "Все темы"
        document.querySelector('.topic-btn[data-topic="all"]').classList.add('active');
        
        console.log('Инициализация завершена');
    }
    
    // === СОЗДАНИЕ ИГРЫ ===
    function handleCreateGame() {
        console.log('Нажата кнопка "Создать игру"');
        
        // Получаем данные формы
        const gameName = gameNameInput.value.trim() || 'Классная игра';
        const questionCount = parseInt(questionCountSlider.value);
        
        console.log('Данные формы:', {
            gameName,
            selectedTopic,
            questionCount
        });
        
        // Проверяем Firebase
        if (!database) {
            alert('Firebase не подключен. Проверьте интернет соединение.');
            return;
        }
        
        // Генерируем код игры
        currentGameCode = generateGameCode();
        console.log('Сгенерирован код игры:', currentGameCode);
        
        // Показываем код игры
        gameCodeDisplay.textContent = currentGameCode;
        bigGameCode.textContent = currentGameCode;
        instructionCode.textContent = currentGameCode;
        
        // Создаем ссылку для учеников
        let studentUrl = '';
        if (window.location.hostname.includes('github.io')) {
            // GitHub Pages
            const baseUrl = window.location.origin;
            studentUrl = baseUrl.replace('brain-quiz-teacher', 'brain-quiz-student');
        } else {
            // Локальная разработка
            studentUrl = window.location.origin;
        }
        
        // Если studentUrl содержит teacher, заменяем на student
        if (studentUrl.includes('teacher')) {
            studentUrl = studentUrl.replace('teacher', 'student');
        }
        
        // Если студентский сайт на другом домене
        if (!studentUrl.includes('student')) {
            studentUrl = studentUrl + '/student';
        }
        
        const fullUrl = `${studentUrl}?game=${currentGameCode}`;
        gameLinkBox.textContent = fullUrl;
        
        // Генерируем QR-код
        generateQRCodeCanvas(fullUrl);
        
        // Показываем карточки управления
        gameInfoCard.style.display = 'block';
        controlCard.style.display = 'block';
        playersCard.style.display = 'block';
        
        // Переключаем на экран ожидания
        switchScreen('waiting');
        
        // Создаем игру в Firebase
        createGameInFirebase(gameName, questionCount);
        
        alert(`Игра "${gameName}" создана!\nКод: ${currentGameCode}\nПокажите этот код ученикам`);
    }
    
    function generateGameCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    
    function createGameInFirebase(gameName, questionCount) {
        console.log('Создание игры в Firebase...');
        
        // Фильтруем вопросы по теме
        let questionsToUse = [...quizQuestions];
        if (selectedTopic === 'oral') {
            questionsToUse = quizQuestions.filter(q => q.category.includes('Устное'));
        } else if (selectedTopic === 'oge') {
            questionsToUse = quizQuestions.filter(q => q.category.includes('ОГЭ'));
        }
        
        // Берем нужное количество вопросов
        questionsToUse = questionsToUse.slice(0, questionCount);
        
        // Создаем ссылку на игру в Firebase
        gameRef = database.ref(`games/${currentGameCode}`);
        
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
            console.log('Настройки игры сохранены');
            
            // Сохраняем вопросы
            const questionsData = {};
            questionsToUse.forEach((q, index) => {
                questionsData[index] = {
                    id: q.id,
                    question: q.question,
                    options: q.options,
                    correct: q.correct,
                    category: q.category,
                    hint: q.hint || ''
                };
            });
            
            return gameRef.child('questions').set(questionsData);
        }).then(() => {
            console.log('Вопросы сохранены:', questionsToUse.length);
            
            // Начинаем слушать игроков
            playersRef = gameRef.child('players');
            playersRef.on('value', handlePlayersUpdate);
            
            // Слушаем изменения игры
            gameRef.on('value', handleGameUpdate);
            
            // Активируем кнопку старта
            startGameBtn.disabled = false;
            
        }).catch(error => {
            console.error('Ошибка создания игры:', error);
            alert('Ошибка создания игры: ' + error.message);
        });
    }
    
    // === ГЕНЕРАЦИЯ QR-КОДА ===
    function generateQRCodeCanvas(text) {
        const canvas = document.getElementById('qrcode');
        if (!canvas) {
            console.error('Canvas для QR-кода не найден');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const size = 180;
        canvas.width = size;
        canvas.height = size;
        
        // Очищаем canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        
        // Рисуем рамку
        ctx.strokeStyle = '#4a6ee0';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, size - 4, size - 4);
        
        // Рисуем заголовок
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('BRAIN QUIZ', size / 2, 30);
        
        // Рисуем код игры крупно
        ctx.fillStyle = '#4a6ee0';
        ctx.font = 'bold 32px Inter';
        ctx.fillText(currentGameCode, size / 2, size / 2);
        
        // Рисуем подпись
        ctx.fillStyle = '#666';
        ctx.font = '10px Inter';
        ctx.fillText('Отсканируйте или введите код', size / 2, size - 15);
        
        console.log('QR-код сгенерирован для кода:', currentGameCode);
    }
    
    // === ОБНОВЛЕНИЕ ИГРОКОВ ===
    function handlePlayersUpdate(snapshot) {
        const players = snapshot.val() || {};
        const count = Object.keys(players).length;
        
        console.log('Обновление списка игроков:', count);
        
        // Обновляем счетчики
        playerCountSpan.textContent = count;
        playersCountSpan.textContent = count;
        bigPlayerCount.textContent = count;
        
        // Обновляем список игроков
        let html = '';
        if (count === 0) {
            html = '<div class="empty">Ожидание подключения игроков...</div>';
        } else {
            Object.values(players).forEach(player => {
                html += `
                    <div class="player-item">
                        <div class="player-avatar">
                            ${player.name ? player.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div class="player-name">${player.name || 'Аноним'}</div>
                        <div class="player-score">${player.score || 0} очков</div>
                    </div>
                `;
            });
        }
        
        playersList.innerHTML = html;
    }
    
    // === ОБНОВЛЕНИЕ ИГРЫ ===
    function handleGameUpdate(snapshot) {
        const gameData = snapshot.val();
        if (!gameData) {
            console.log('Игра не найдена в Firebase');
            return;
        }
        
        const state = gameData.state || 'waiting';
        currentQuestionIndex = gameData.currentQuestion || 0;
        
        console.log('Обновление состояния игры:', state, 'вопрос:', currentQuestionIndex);
        
        // Обновляем статус
        const statusTexts = {
            'waiting': 'Ожидание игроков',
            'question': 'Вопрос активен',
            'results': 'Результаты',
            'finished': 'Завершено'
        };
        gameStatusSpan.textContent = statusTexts[state] || 'Неизвестно';
        
        // Переключаем экраны
        switchScreen(state);
        
        // Обновляем информацию
        if (gameData.totalQuestions) {
            totalQuestionsSpan.textContent = gameData.totalQuestions;
        }
        
        // Обработка разных состояний
        switch(state) {
            case 'question':
                showQuestion(currentQuestionIndex);
                startTimer();
                nextQuestionBtn.disabled = true;
                break;
                
            case 'results':
                showResults(currentQuestionIndex);
                nextQuestionBtn.disabled = false;
                break;
                
            case 'finished':
                showFinalResults();
                nextQuestionBtn.disabled = true;
                startGameBtn.disabled = true;
                break;
        }
    }
    
    function switchScreen(screenName) {
        console.log('Переключение экрана на:', screenName);
        
        // Скрываем все экраны
        Object.values(screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
        
        // Показываем нужный экран
        if (screens[screenName]) {
            screens[screenName].classList.add('active');
        }
    }
    
    // === ПОКАЗ ВОПРОСА ===
    function showQuestion(index) {
        if (!gameRef) return;
        
        console.log('Показ вопроса:', index);
        
        gameRef.child(`questions/${index}`).once('value').then(snapshot => {
            const question = snapshot.val();
            if (!question) {
                console.error('Вопрос не найден:', index);
                return;
            }
            
            // Обновляем интерфейс
            currentQuestionSpan.textContent = index + 1;
            questionCategory.textContent = question.category;
            questionText.textContent = question.question;
            
            // Показываем варианты ответов
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
            
        }).catch(error => {
            console.error('Ошибка загрузки вопроса:', error);
        });
    }
    
    function startTimer() {
        clearInterval(timerInterval);
        let timeLeft = 30;
        questionTimer.textContent = timeLeft;
        
        timerInterval = setInterval(() => {
            timeLeft--;
            questionTimer.textContent = timeLeft;
            
            // Меняем цвет при малом времени
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
    
    // === ПОКАЗ РЕЗУЛЬТАТОВ ===
    function showResults(questionIndex) {
        if (!gameRef || !playersRef) return;
        
        console.log('Показ результатов для вопроса:', questionIndex);
        
        // Получаем вопрос
        gameRef.child(`questions/${questionIndex}`).once('value').then(qSnapshot => {
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
                                <span class="stat-text">${option}</span>
                                ${isCorrect ? '<span class="correct-mark">✓ Правильный</span>' : ''}
                            </div>
                            <div class="bar-container">
                                <div class="bar" style="width: ${Math.max(10, percentage)}%">
                                    <span class="bar-text">${count} (${percentage}%)</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                statsContainer.innerHTML = statsHtml;
                
                // Показываем мини-лидерборд
                showMiniLeaderboard(players);
                
            }).catch(error => {
                console.error('Ошибка загрузки игроков:', error);
            });
            
        }).catch(error => {
            console.error('Ошибка загрузки вопроса:', error);
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
                    <span class="score">${player.score || 0} очков</span>
                </div>
            `;
        });
        
        const quickLeaderboard = document.getElementById('quick-leaderboard');
        if (quickLeaderboard) {
            quickLeaderboard.innerHTML = html;
        }
    }
    
    function showFinalResults() {
        if (!playersRef) return;
        
        console.log('Показ финальных результатов');
        
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
                        <span class="score">${player.score || 0} очков</span>
                    </div>
                `;
            });
            
            const finalLeaderboard = document.getElementById('final-leaderboard');
            if (finalLeaderboard) {
                finalLeaderboard.innerHTML = html;
            }
        }).catch(error => {
            console.error('Ошибка загрузки финальных результатов:', error);
        });
    }
    
    // === ОБРАБОТЧИКИ КНОПОК ===
    function handleStartGame() {
        console.log('Нажата кнопка "Начать игру"');
        
        if (gameRef) {
            gameRef.update({
                state: 'question',
                currentQuestion: 0
            });
            startGameBtn.disabled = true;
        } else {
            alert('Сначала создайте игру!');
        }
    }
    
    function handleNextQuestion() {
        console.log('Нажата кнопка "Следующий вопрос"');
        
        if (!gameRef) return;
        
        const nextIndex = currentQuestionIndex + 1;
        
        gameRef.once('value').then(snapshot => {
            const gameData = snapshot.val();
            const totalQuestions = gameData.totalQuestions || 10;
            
            if (nextIndex < totalQuestions) {
                gameRef.update({
                    state: 'question',
                    currentQuestion: nextIndex
                });
            } else {
                gameRef.update({ state: 'finished' });
            }
        }).catch(error => {
            console.error('Ошибка перехода к следующему вопросу:', error);
        });
    }
    
    function handleEndGame() {
        console.log('Нажата кнопка "Завершить игру"');
        
        if (gameRef) {
            if (confirm('Завершить игру досрочно?')) {
                gameRef.update({ state: 'finished' });
            }
        }
    }
    
    function handleNewGame() {
        console.log('Нажата кнопка "Новая игра"');
        location.reload();
    }
    
    function handleCopyLink() {
        const link = gameLinkBox.textContent;
        if (link && link !== '...') {
            navigator.clipboard.writeText(link).then(() => {
                alert('Ссылка скопирована в буфер обмена!');
            }).catch(err => {
                console.error('Ошибка копирования:', err);
                alert('Не удалось скопировать ссылку');
            });
        }
    }
    
    // Запуск инициализации
    init();
});
