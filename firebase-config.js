// ============================================
// firebase-config.js
// ФИКС: правильная проверка ответов + кнопка кика
// ============================================

// 🔥 КОНФИГУРАЦИЯ FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyC9OSllGc8U-au0281HfikJkI5caDkqOYc",
    authDomain: "goydacloud.firebaseapp.com",
    databaseURL: "https://goydacloud-default-rtdb.firebaseio.com",
    projectId: "goydacloud",
    storageBucket: "goydacloud.firebasestorage.app",
    messagingSenderId: "937429390580",
    appId: "1:937429390580:web:7be76b6755a07ff6ae7aa1"
};

// Инициализация Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    window.db = firebase.database();
    console.log("✅ Firebase инициализирован");
} catch (error) {
    console.error("❌ Ошибка Firebase:", error);
    alert("Ошибка подключения к базе данных. Проверьте консоль.");
}

// 📚 16 КОРОТКИХ ВОПРОСОВ ОГЭ 2025
window.QUIZ_DATA = {
    id: "oge_2025_short",
    title: "ОГЭ 2025 - Русский язык (16 ключевых заданий)",
    description: "16 заданий из демоверсии ОГЭ 2025 в коротком формате",
    subject: "Русский язык",
    author: "ФИПИ",
    version: "1.0",
    questions: [
        {
            id: 1,
            type: "syntax",
            text: "В каком предложении есть цитата?",
            options: [
                "Даль говорил о русском слове",
                "Даль говорил, что в слове «не менее жизни»",
                "Даль посвятил жизнь слову",
                "Все предложения с цитатами"
            ],
            correct: 1,
            time: 30,
            explanation: "Правильно: вариант 2. Есть кавычки — это цитирование.",
            points: 1,
            difficulty: "easy",
            source: "Демоверсия ОГЭ 2025"
        },
        {
            id: 2,
            type: "spelling",
            text: "В каком слове пишется буква А?",
            options: [
                "прЕуспевать",
                "рАстаял",
                "пол-Острова",
                "безвредный"
            ],
            correct: 1,
            time: 30,
            explanation: "рАстаял — корень с чередованием -РАСТ-/-РАЩ-",
            points: 1,
            difficulty: "easy",
            source: "Демоверсия ОГЭ 2025"
        },
        {
            id: 3,
            type: "punctuation",
            text: "Где нужно тире?",
            options: [
                "Москва столица России",
                "Москва — столица России",
                "Москва: столица России",
                "Тире не нужно"
            ],
            correct: 1,
            time: 25,
            explanation: "Тире между подлежащим и сказуемым, оба — существительные.",
            points: 1,
            difficulty: "easy",
            source: "Демоверсия ОГЭ 2025"
        },
        {
            id: 4,
            type: "morphology",
            text: "Пароход отплывает, вслед (он) звучит марш.",
            options: [
                "ему",
                "им",
                "нём",
                "него"
            ],
            correct: 0,
            time: 25,
            explanation: "«Вслед ему» — дательный падеж, устойчивое сочетание.",
            points: 1,
            difficulty: "easy",
            source: "Демоверсия ОГЭ 2025"
        },
        {
            id: 5,
            type: "syntax",
            text: "Замените «пробежка утром» на согласование:",
            options: [
                "утренняя пробежка",
                "пробежка по утрам",
                "бег утром",
                "ранняя пробежка"
            ],
            correct: 0,
            time: 25,
            explanation: "«утренняя пробежка» — прилагательное + существительное.",
            points: 1,
            difficulty: "easy",
            source: "Демоверсия ОГЭ 2025"
        },
        {
            id: 6,
            type: "spelling",
            text: "Где пишется Е? «стел.(1)тся туман»",
            options: [
                "Не пишется",
                "Только на месте 1",
                "На местах 1 и 2",
                "Во всех случаях"
            ],
            correct: 1,
            time: 30,
            explanation: "стелЕтся — глагол-исключение, пишется Е.",
            points: 1,
            difficulty: "medium",
            source: "Демоверсия ОГЭ 2025"
        },
        {
            id: 7,
            type: "reading",
            text: "Что говорил Даль о русском слове?",
            options: [
                "В нём много ошибок",
                "В нём не менее жизни, чем в человеке",
                "Оно устаревает",
                "Оно слишком сложное"
            ],
            correct: 1,
            time: 30,
            explanation: "Цитата Даля: «не менее жизни, чем в самом человеке».",
            points: 1,
            difficulty: "easy",
            source: "Демоверсия ОГЭ 2025"
        },
        {
            id: 8,
            type: "lexicology",
            text: "Устаревшее слово «большая дорога»:",
            options: [
                "магистраль",
                "тракт",
                "шоссе",
                "путь"
            ],
            correct: 1,
            time: 30,
            explanation: "Тракт — устаревшее слово для большой грунтовой дороги.",
            points: 1,
            difficulty: "medium",
            source: "Демоверсия ОГЭ 2025"
        },
        {
            id: 9,
            type: "stylistics",
            text: "Где есть олицетворение?",
            options: [
                "земля не уберегла",
                "я сгорал от жажды",
                "мама может спасти",
                "солнце светит ярко"
            ],
            correct: 0,
            time: 30,
            explanation: "«земля не уберегла» — приписывание человеческого качества.",
            points: 1,
            difficulty: "medium",
            source: "Демоверсия ОГЭ 2025"
        },
        {
            id: 10,
            type: "composition",
            text: "Минимальный объём сочинения на ОГЭ:",
            options: [
                "50 слов",
                "70 слов",
                "100 слов",
                "150 слов"
            ],
            correct: 1,
            time: 20,
            explanation: "70 слов — если меньше, работа оценивается в 0 баллов.",
            points: 1,
            difficulty: "easy",
            source: "Демоверсия ОГЭ 2025"
        },
        {
            id: 11,
            type: "exam_rules",
            text: "Сколько времени на весь экзамен?",
            options: [
                "2 часа",
                "3 часа 55 минут",
                "4 часа",
                "3 часа"
            ],
            correct: 1,
            time: 20,
            explanation: "3 часа 55 минут (235 минут) на всю работу.",
            points: 1,
            difficulty: "easy",
            source: "Демоверсия ОГЭ 2025"
        },
        {
            id: 12,
            type: "grading",
            text: "Максимум первичных баллов:",
            options: [
                "30",
                "33",
                "37",
                "40"
            ],
            correct: 2,
            time: 20,
            explanation: "37 первичных баллов — максимум за всю работу.",
            points: 1,
            difficulty: "easy",
            source: "Демоверсия ОГЭ 2025"
        },
        {
            id: 13,
            type: "reading",
            text: "Где похоронена мать в тексте Яковлева?",
            options: [
                "Волковское кладбище",
                "Пискарёвское кладбище",
                "Новодевичье кладбище",
                "Ваганьковское кладбище"
            ],
            correct: 1,
            time: 25,
            explanation: "Пискарёвское кладбище — текст о блокаде Ленинграда.",
            points: 1,
            difficulty: "medium",
            source: "Текст Ю.Я. Яковлева"
        },
        {
            id: 14,
            type: "grammar",
            text: "«Животворная влага» — какая часть речи?",
            options: [
                "Существительное",
                "Прилагательное",
                "Причастие",
                "Наречие"
            ],
            correct: 1,
            time: 25,
            explanation: "Прилагательное, отвечает на вопрос «какая?».",
            points: 1,
            difficulty: "easy",
            source: "Текст Ю.Я. Яковлева"
        },
        {
            id: 15,
            type: "writing",
            text: "Сколько частей в сочинении-рассуждении?",
            options: [
                "2 части",
                "3 части",
                "4 части",
                "Не важно"
            ],
            correct: 1,
            time: 20,
            explanation: "Трёхчастная структура: вступление, основная часть, заключение.",
            points: 1,
            difficulty: "easy",
            source: "Демоверсия ОГЭ 2025"
        },
        {
            id: 16,
            type: "exam_rules",
            text: "Что разрешено на ОГЭ по русскому?",
            options: [
                "Калькулятор",
                "Орфографический словарь",
                "Линейка",
                "Телефон"
            ],
            correct: 1,
            time: 20,
            explanation: "Орфографический словарь — единственное разрешённое пособие.",
            points: 1,
            difficulty: "easy",
            source: "Демоверсия ОГЭ 2025"
        }
    ]
};

console.log(`✅ Загружено ${QUIZ_DATA.questions.length} коротких вопросов`);

// 🛠️ ФУНКЦИИ ДЛЯ РАБОТЫ С FIREBASE (С ФИКСОМ ПРОВЕРКИ ОТВЕТОВ)
window.firebaseAPI = {
    // Создать новую игру
    createGame(gameData) {
        const gameId = "game_" + Date.now();
        const gameRef = db.ref('games/' + gameId);
        
        const fullGameData = {
            ...gameData,
            id: gameId,
            created: Date.now(),
            status: "lobby",
            currentQuestion: null,
            players: {},
            answers: {},
            settings: {
                timer: 30,
                showLeaderboard: true,
                quizId: QUIZ_DATA.id,
                questionCount: QUIZ_DATA.questions.length
            }
        };
        
        return gameRef.set(fullGameData).then(() => gameId);
    },

    // Получить данные игры
    getGame(gameId, callback) {
        return db.ref('games/' + gameId).on('value', (snapshot) => {
            callback(snapshot.val());
        });
    },

    // Отписаться от обновлений игры
    unsubscribeGame(gameId) {
        return db.ref('games/' + gameId).off();
    },

    // Обновить статус игры
    updateGameStatus(gameId, status, questionId = null) {
        const updates = {
            status: status,
            updated: Date.now()
        };
        
        if (questionId) {
            updates.currentQuestion = questionId;
            updates[`answers/${questionId}`] = null;
        }
        
        return db.ref('games/' + gameId).update(updates);
    },

    // Добавить игрока
    addPlayer(gameId, playerData) {
        const playerRef = db.ref(`games/${gameId}/players/${playerData.name}`);
        return playerRef.set({
            ...playerData,
            joined: Date.now(),
            score: 0,
            answers: {},
            lastActive: Date.now()
        });
    },

    // Удалить игрока (КИК)
    removePlayer(gameId, playerName) {
        return db.ref(`games/${gameId}/players/${playerName}`).remove();
    },

    // Обновить счёт игрока
    updatePlayerScore(gameId, playerName, scoreDelta) {
        const playerRef = db.ref(`games/${gameId}/players/${playerName}/score`);
        return playerRef.transaction((currentScore) => {
            return (currentScore || 0) + scoreDelta;
        });
    },

    // Отправить ответ (С ФИКСОМ ПРАВИЛЬНОСТИ)
    submitAnswer(gameId, questionId, playerName, answerData) {
        const question = QUIZ_DATA.questions.find(q => q.id == questionId);
        if (!question) {
            console.error("Вопрос не найден:", questionId);
            return Promise.reject("Вопрос не найден");
        }
        
        // ПРАВИЛЬНАЯ ПРОВЕРКА ОТВЕТА
        const isCorrect = answerData.answerIndex === question.correct;
        const points = isCorrect ? question.points : 0;
        
        // Обновляем данные ответа
        const fixedAnswerData = {
            ...answerData,
            isCorrect: isCorrect,
            points: points,
            timestamp: Date.now()
        };
        
        const answerRef = db.ref(`games/${gameId}/answers/${questionId}/${playerName}`);
        
        // Отправляем ответ
        return answerRef.set(fixedAnswerData).then(() => {
            // Если ответ правильный, обновляем счёт игрока
            if (isCorrect) {
                return this.updatePlayerScore(gameId, playerName, points);
            }
            return Promise.resolve();
        });
    },

    // Получить статистику по вопросу
    getQuestionStats(gameId, questionId, callback) {
        return db.ref(`games/${gameId}/answers/${questionId}`).on('value', (snapshot) => {
            const answers = snapshot.val() || {};
            callback(this.calculateStats(answers, questionId));
        });
    },

    // Отписаться от статистики
    unsubscribeStats(gameId, questionId) {
        return db.ref(`games/${gameId}/answers/${questionId}`).off();
    },

    // Рассчитать статистику (С ФИКСОМ)
    calculateStats(answers, questionId) {
        const question = QUIZ_DATA.questions.find(q => q.id == questionId);
        if (!question) return null;
        
        const stats = {
            total: 0,
            correct: 0,
            byOption: question.options.map(() => 0),
            averageTime: 0,
            times: [],
            players: {},
            detailedAnswers: []
        };
        
        Object.entries(answers).forEach(([playerName, answer]) => {
            stats.total++;
            stats.players[playerName] = answer;
            
            // ПРОВЕРЯЕМ ПРАВИЛЬНОСТЬ
            const isCorrect = answer.answerIndex === question.correct;
            
            // Исправляем если неправильно записано в базе
            if (answer.isCorrect !== isCorrect) {
                console.log(`Исправляем правильность для ${playerName}: было ${answer.isCorrect}, должно быть ${isCorrect}`);
                answer.isCorrect = isCorrect;
            }
            
            if (answer.answerIndex >= 0) {
                stats.byOption[answer.answerIndex]++;
                if (isCorrect) {
                    stats.correct++;
                }
            }
            
            if (answer.timeSpent) {
                stats.times.push(answer.timeSpent);
            }
            
            stats.detailedAnswers.push({
                player: playerName,
                answerIndex: answer.answerIndex,
                isCorrect: isCorrect,
                timeSpent: answer.timeSpent,
                timestamp: answer.timestamp
            });
        });
        
        if (stats.times.length > 0) {
            stats.averageTime = Math.round(stats.times.reduce((a, b) => a + b) / stats.times.length);
        }
        
        return stats;
    },

    // Получить таблицу лидеров
    getLeaderboard(gameId, callback) {
        return db.ref(`games/${gameId}/players`).on('value', (snapshot) => {
            const players = snapshot.val() || {};
            const leaderboard = Object.entries(players)
                .map(([name, data]) => ({
                    name,
                    score: data.score || 0,
                    answers: data.answers || {}
                }))
                .sort((a, b) => b.score - a.score);
            
            callback(leaderboard);
        });
    },

    // Завершить игру
    endGame(gameId) {
        return db.ref(`games/${gameId}`).update({
            status: "ended",
            ended: Date.now()
        });
    }
};

// 🎯 ИНСТРУМЕНТЫ УЧИТЕЛЯ С КНОПКОЙ КИКА
window.teacherTools = {
    // Показать детальную статистику по вопросу
    showQuestionStats(gameId, questionId) {
        firebaseAPI.getQuestionStats(gameId, questionId, (stats) => {
            if (!stats) {
                console.log("Нет статистики по этому вопросу");
                return;
            }
            
            const question = QUIZ_DATA.questions.find(q => q.id == questionId);
            console.log("📊 ДЕТАЛЬНАЯ СТАТИСТИКА:");
            console.log(`Вопрос: ${question.text.substring(0, 50)}...`);
            console.log(`Всего ответов: ${stats.total}`);
            console.log(`Правильных: ${stats.correct} (${Math.round((stats.correct/stats.total)*100)}%)`);
            console.log("Распределение по вариантам:");
            
            stats.byOption.forEach((count, index) => {
                const percentage = Math.round((count/stats.total)*100);
                const isCorrect = index === question.correct;
                console.log(`${index+1}) ${question.options[index].substring(0,30)}...: ${count} (${percentage}%) ${isCorrect ? '✓' : '✗'}`);
            });
            
            console.log(`Среднее время: ${stats.averageTime} сек.`);
            
            // Показываем ответы конкретных игроков
            console.log("Ответы игроков:");
            stats.detailedAnswers.forEach(answer => {
                console.log(`${answer.player}: ${answer.answerIndex >= 0 ? 'вариант ' + (answer.answerIndex + 1) : 'не ответил'} - ${answer.isCorrect ? 'правильно ✓' : 'неправильно ✗'} (${answer.timeSpent} сек.)`);
            });
        });
    },
    
    // Создать кнопку кика игрока
    createKickButton(gameId, playerName) {
        const kickBtn = document.createElement('button');
        kickBtn.className = 'kick-btn';
        kickBtn.innerHTML = '❌';
        kickBtn.title = 'Исключить игрока';
        kickBtn.onclick = (e) => {
            e.stopPropagation();
            this.kickPlayer(gameId, playerName);
        };
        return kickBtn;
    },
    
    // Кик игрока с подтверждением
    kickPlayer(gameId, playerName) {
        if (confirm(`Точно исключить игрока "${playerName}" из игры?\n\nИгрок не сможет продолжить участие.`)) {
            firebaseAPI.removePlayer(gameId, playerName)
                .then(() => {
                    console.log(`✅ Игрок ${playerName} исключён`);
                    alert(`Игрок ${playerName} исключён из игры`);
                })
                .catch(error => {
                    console.error('❌ Ошибка при исключении игрока:', error);
                    alert('Не удалось исключить игрока');
                });
        }
    },
    
    // Отобразить таблицу лидеров с кнопками кика
    renderLeaderboardWithControls(gameId, leaderboard, container, isTeacher = false) {
        container.innerHTML = '';
        
        leaderboard.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'leaderboard-player';
            playerDiv.dataset.player = player.name;
            
            playerDiv.innerHTML = `
                <div class="player-rank">${index + 1}</div>
                <div class="player-name">${player.name}</div>
                <div class="player-score">${player.score} баллов</div>
                <div class="player-answers">${Object.keys(player.answers || {}).length} ответов</div>
            `;
            
            // Добавляем кнопку кика только учителю
            if (isTeacher) {
                const kickBtn = this.createKickButton(gameId, player.name);
                playerDiv.querySelector('.player-answers').after(kickBtn);
            }
            
            container.appendChild(playerDiv);
        });
    },
    
    // Показать панель управления игрой
    showGameControls(gameId) {
        // Удаляем старую панель если есть
        const oldPanel = document.querySelector('.teacher-controls');
        if (oldPanel) oldPanel.remove();
        
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'teacher-controls';
        controlsDiv.innerHTML = `
            <h3>👨‍🏫 Панель учителя</h3>
            <button onclick="teacherTools.showCurrentStats('${gameId}')">📊 Текущая статистика</button>
            <button onclick="teacherTools.pauseGame('${gameId}')">⏸️ Пауза</button>
            <button onclick="teacherTools.nextQuestion('${gameId}')">➡️ Следующий вопрос</button>
            <button onclick="teacherTools.endGameEarly('${gameId}')" style="background:#f44336">🏁 Завершить досрочно</button>
            <div id="teacher-stats"></div>
        `;
        
        document.body.appendChild(controlsDiv);
        this.injectTeacherStyles();
    },
    
    // Показать текущую статистику
    showCurrentStats(gameId) {
        firebaseAPI.getLeaderboard(gameId, (leaderboard) => {
            const statsDiv = document.getElementById('teacher-stats');
            const totalAnswers = leaderboard.reduce((sum, p) => sum + Object.keys(p.answers || {}).length, 0);
            const avgScore = leaderboard.length > 0 ? Math.round(leaderboard.reduce((sum, p) => sum + p.score, 0) / leaderboard.length) : 0;
            
            statsDiv.innerHTML = `
                <div class="stats-summary">
                    <h4>📈 Сводка:</h4>
                    <p>👥 Игроков: <strong>${leaderboard.length}</strong></p>
                    <p>🎯 Средний балл: <strong>${avgScore}</strong></p>
                    <p>📝 Всего ответов: <strong>${totalAnswers}</strong></p>
                    <p>🥇 Лучший: <strong>${leaderboard[0] ? leaderboard[0].name + ' (' + leaderboard[0].score + ' баллов)' : 'нет'}</strong></p>
                </div>
            `;
        });
    },
    
    // Поставить игру на паузу
    pauseGame(gameId) {
        firebaseAPI.updateGameStatus(gameId, 'paused')
            .then(() => alert('⏸️ Игра на паузе'))
            .catch(err => console.error('❌ Ошибка паузы:', err));
    },
    
    // Перейти к следующему вопросу
    nextQuestion(gameId) {
        db.ref('games/' + gameId).once('value').then((snapshot) => {
            const game = snapshot.val();
            const currentId = game.currentQuestion || 0;
            const nextId = currentId + 1;
            
            if (nextId <= QUIZ_DATA.questions.length) {
                firebaseAPI.updateGameStatus(gameId, 'question', nextId)
                    .then(() => alert(`➡️ Переход к вопросу ${nextId}`));
            } else {
                alert('🏁 Это был последний вопрос!');
            }
        });
    },
    
    // Досрочно завершить игру
    endGameEarly(gameId) {
        if (confirm('🏁 Точно завершить игру досрочно?\n\nВсе игроки увидят результаты сейчас.')) {
            firebaseAPI.endGame(gameId)
                .then(() => alert('Игра завершена!'))
                .catch(err => console.error('❌ Ошибка завершения:', err));
        }
    },
    
    // Внедрить стили для панели учителя
    injectTeacherStyles() {
        if (document.querySelector('#teacher-styles')) return;
        
        const styles = `
        <style id="teacher-styles">
        .teacher-controls {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 300px;
            border: 2px solid #4CAF50;
        }
        .teacher-controls h3 {
            margin-top: 0;
            color: #333;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
        }
        .teacher-controls button {
            display: block;
            width: 100%;
            margin: 5px 0;
            padding: 10px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }
        .teacher-controls button:hover {
            background: #45a049;
            transform: translateY(-1px);
        }
        .kick-btn {
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            cursor: pointer;
            margin-left: 10px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .kick-btn:hover {
            background: #cc0000;
            transform: scale(1.1);
        }
        .leaderboard-player {
            display: flex;
            align-items: center;
            padding: 10px;
            margin: 5px 0;
            background: #f5f5f5;
            border-radius: 5px;
            transition: all 0.3s;
        }
        .leaderboard-player:hover {
            background: #e8f5e9;
        }
        .player-rank {
            font-weight: bold;
            width: 30px;
            color: #666;
        }
        .player-name {
            flex: 1;
            font-weight: bold;
        }
        .player-score {
            width: 80px;
            text-align: right;
            color: #4CAF50;
            font-weight: bold;
        }
        .player-answers {
            width: 80px;
            text-align: right;
            color: #666;
            font-size: 12px;
        }
        .stats-summary {
            margin-top: 15px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
            border-left: 4px solid #4CAF50;
        }
        .stats-summary h4 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .stats-summary p {
            margin: 5px 0;
            font-size: 14px;
        }
        </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
};

// 📊 ФУНКЦИЯ ДЛЯ ОТОБРАЖЕНИЯ СТАТИСТИКИ В РЕАЛЬНОМ ВРЕМЕНИ
window.realTimeStats = {
    // Создать виджет статистики
    createStatsWidget(gameId, questionId, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="stats-widget">
                <h4>📈 Статистика ответов</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">Всего ответили</div>
                        <div class="stat-value" id="total-answers">0</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Правильно</div>
                        <div class="stat-value correct" id="correct-answers">0</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Неправильно</div>
                        <div class="stat-value wrong" id="wrong-answers">0</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Среднее время</div>
                        <div class="stat-value" id="avg-time">0с</div>
                    </div>
                </div>
                <div class="options-stats" id="options-stats"></div>
                <div class="player-list" id="player-answers-list"></div>
            </div>
        `;
        
        // Подписываемся на обновления статистики
        firebaseAPI.getQuestionStats(gameId, questionId, (stats) => {
            this.updateStatsWidget(stats);
        });
    },
    
    // Обновить виджет статистики
    updateStatsWidget(stats) {
        if (!stats) return;
        
        document.getElementById('total-answers').textContent = stats.total;
        document.getElementById('correct-answers').textContent = stats.correct;
        document.getElementById('wrong-answers').textContent = stats.total - stats.correct;
        document.getElementById('avg-time').textContent = stats.averageTime + 'с';
        
        // Отображаем статистику по вариантам
        const question = QUIZ_DATA.questions.find(q => q.id == stats.questionId);
        const optionsContainer = document.getElementById('options-stats');
        if (optionsContainer && question) {
            optionsContainer.innerHTML = '<h5>Ответы по вариантам:</h5>';
            
            question.options.forEach((option, index) => {
                const count = stats.byOption[index] || 0;
                const percentage = stats.total > 0 ? Math.round((count/stats.total)*100) : 0;
                const isCorrect = index === question.correct;
                
                const optionDiv = document.createElement('div');
                optionDiv.className = `option-stat ${isCorrect ? 'correct-option' : ''}`;
                optionDiv.innerHTML = `
                    <div class="option-text">${index + 1}. ${option.substring(0, 40)}...</div>
                    <div class="option-bar">
                        <div class="bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="option-count">${count} (${percentage}%) ${isCorrect ? '✓' : ''}</div>
                `;
                
                optionsContainer.appendChild(optionDiv);
            });
        }
        
        // Отображаем ответы игроков
        const playerList = document.getElementById('player-answers-list');
        if (playerList && stats.detailedAnswers) {
            playerList.innerHTML = '<h5>Ответы игроков:</h5>';
            
            stats.detailedAnswers.forEach(answer => {
                const playerDiv = document.createElement('div');
                playerDiv.className = `player-answer ${answer.isCorrect ? 'correct' : 'wrong'}`;
                playerDiv.innerHTML = `
                    <span class="player-name">${answer.player}</span>
                    <span class="player-choice">Вариант ${answer.answerIndex + 1}</span>
                    <span class="player-time">${answer.timeSpent}с</span>
                    <span class="player-status">${answer.isCorrect ? '✓' : '✗'}</span>
                `;
                playerList.appendChild(playerDiv);
            });
        }
    }
};

// 🎮 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
window.quizUtils = {
    // Получить вопрос по ID
    getQuestionById(id) {
        return QUIZ_DATA.questions.find(q => q.id == id);
    },
    
    // Проверить ответ
    checkAnswer(questionId, answerIndex) {
        const question = this.getQuestionById(questionId);
        if (!question) return { correct: false, points: 0 };
        
        const isCorrect = question.correct === answerIndex;
        return {
            correct: isCorrect,
            points: isCorrect ? question.points : 0,
            correctIndex: question.correct,
            explanation: question.explanation
        };
    },
    
    // Получить роль текущего пользователя
    getCurrentUserRole() {
        return localStorage.getItem('userRole') || 'student';
    },
    
    // Установить роль пользователя
    setUserRole(role) {
        localStorage.setItem('userRole', role);
        console.log(`Роль установлена: ${role}`);
    }
};

console.log("✅ Файл загружен: 16 вопросов + фикс проверки ответов + кнопка кика");
