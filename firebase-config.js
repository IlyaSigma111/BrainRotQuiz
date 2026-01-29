// ============================================
// firebase-config.js
// СЛОЖНЫЕ ВОПРОСЫ ОГЭ 2025 + ФИКС ОТВЕТОВ + КНОПКА КИКА
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

// 📚 СЛОЖНЫЕ РЕАЛЬНЫЕ ВОПРОСЫ ОГЭ 2025 (не очевидные!)
window.QUIZ_DATA = {
    id: "oge_2025_hard",
    title: "ОГЭ 2025 - Русский язык (сложные задания)",
    description: "16 сложных заданий из демоверсии ОГЭ 2025",
    subject: "Русский язык",
    author: "ФИПИ",
    version: "1.0",
    questions: [
        {
            id: 1,
            type: "punctuation",
            text: "В каком предложении тире ставится?",
            options: [
                "Чтение вот лучший способ познания мира",
                "Пушкин великий русский поэт",
                "Лес как будто замер в ожидании",
                "Он не то чтобы злой просто устал"
            ],
            correct: 1,
            time: 30,
            explanation: "Тире между подлежащим и сказуемым, выраженными именами существительными. Вариант 2 — единственный, где оба существительные.",
            points: 1,
            difficulty: "medium",
            source: "ОГЭ 2025"
        },
        {
            id: 2,
            type: "spelling",
            text: "В каком слове пишется Ь?",
            options: [
                "проч..тать книгу",
                "съ..ёжиться от холода",
                "объ..яснить правило",
                "под..езд к дому"
            ],
            correct: 2,
            time: 30,
            explanation: "Ь пишется после приставки, оканчивающейся на согласную, перед Е, Ё, Ю, Я. 'Объяснить' — приставка ОБ-, перед Я нужен Ь.",
            points: 1,
            difficulty: "hard",
            source: "ОГЭ 2025"
        },
        {
            id: 3,
            type: "syntax",
            text: "Какое предложение осложнено обособленным обстоятельством?",
            options: [
                "Улыбаясь, она вошла в комнату",
                "Девушка, улыбающаяся всем, казалась счастливой",
                "Её улыбка, искренняя и добрая, всех радовала",
                "Улыбка девушки была подобна солнцу"
            ],
            correct: 0,
            time: 35,
            explanation: "Деепричастный оборот 'улыбаясь' — обособленное обстоятельство. Остальные: 2 — определение, 3 — определение, 4 — простое.",
            points: 1,
            difficulty: "medium",
            source: "ОГЭ 2025"
        },
        {
            id: 4,
            type: "lexicology",
            text: "В каком слове лексическое значение указано неверно?",
            options: [
                "Абзац — красная строка",
                "Аннотация — краткое изложение содержания",
                "Архаизм — устаревшее слово",
                "Афоризм — длинное повествование"
            ],
            correct: 3,
            time: 30,
            explanation: "Афоризм — краткое выразительное изречение, а не длинное повествование.",
            points: 1,
            difficulty: "medium",
            source: "ОГЭ 2025"
        },
        {
            id: 5,
            type: "spelling",
            text: "В каком слове на месте пропуска пишется И?",
            options: [
                "ц..рковой артист",
                "ц..пленок вылупился",
                "ц..кловое движение",
                "ц..фровой формат"
            ],
            correct: 1,
            time: 35,
            explanation: "И пишется в корне слова 'цыпленок' (исключение). В остальных — Ы после Ц.",
            points: 1,
            difficulty: "hard",
            source: "ОГЭ 2025"
        },
        {
            id: 6,
            type: "morphology",
            text: "В каком слове суффикс -ЕСК-?",
            options: [
                "нищенский",
                "матросский",
                "человеческий",
                "братский"
            ],
            correct: 2,
            time: 40,
            explanation: "Нищен-СК-ий (суффикс -СК-). Матрос-СК-ий (-СК-). Человеч-ЕСК-ий (-ЕСК-). Брат-СК-ий (-СК-). Правильно: человеческий.",
            points: 1,
            difficulty: "hard",
            source: "ОГЭ 2025"
        },
        {
            id: 7,
            type: "punctuation",
            text: "Где нужно двоеточие?",
            options: [
                "Небо было чистым и звёздным",
                "Я знаю завтра будет дождь",
                "Он собрал вещи одежду книги документы",
                "Она сказала я приду завтра"
            ],
            correct: 1,
            time: 30,
            explanation: "Двоеточие в бессоюзном сложном предложении, где вторая часть раскрывает содержание первой. 'Я знаю: завтра будет дождь'.",
            points: 1,
            difficulty: "medium",
            source: "ОГЭ 2025"
        },
        {
            id: 8,
            type: "syntax",
            text: "Какое предложение односоставное безличное?",
            options: [
                "Мне не спится",
                "Я не сплю",
                "Спать хочется",
                "Ты скоро уснёшь"
            ],
            correct: 0,
            time: 35,
            explanation: "'Мне не спится' — безличное (нет подлежащего, действие происходит само по себе). Остальные: 2 — двусоставное, 3 — безличное, но есть составное именное сказуемое, 4 — двусоставное.",
            points: 1,
            difficulty: "hard",
            source: "ОГЭ 2025"
        },
        {
            id: 9,
            type: "spelling",
            text: "В каком слове пишется НН?",
            options: [
                "кова..ая решётка",
                "нежда..ый гость",
                "пута..ые следы",
                "смышлё..ый ребёнок"
            ],
            correct: 1,
            time: 40,
            explanation: "'Нежданный' — НН (исключение). 'Кованая' — одна Н (прилагательное). 'Путаные' — одна Н (причастие без зависимых слов). 'Смышлёный' — одна Н (суффикс -ЁН-).",
            points: 1,
            difficulty: "hard",
            source: "ОГЭ 2025"
        },
        {
            id: 10,
            type: "word_formation",
            text: "Какое слово образовано приставочно-суффиксальным способом?",
            options: [
                "подстаканник",
                "перечитать",
                "морозный",
                "выбежать"
            ],
            correct: 0,
            time: 45,
            explanation: "'Подстаканник' — приставка ПОД- + суффикс -НИК. Остальные: 2 — приставочный, 3 — суффиксальный, 4 — приставочный.",
            points: 1,
            difficulty: "hard",
            source: "ОГЭ 2025"
        },
        {
            id: 11,
            type: "stylistics",
            text: "Какое средство выразительности: 'Время — лекарь'?",
            options: [
                "Сравнение",
                "Метафора",
                "Метонимия",
                "Гипербола"
            ],
            correct: 1,
            time: 25,
            explanation: "Метафора — скрытое сравнение (время как лекарь). Нет союзов 'как', 'словно', 'будто' для сравнения.",
            points: 1,
            difficulty: "medium",
            source: "ОГЭ 2025"
        },
        {
            id: 12,
            type: "punctuation",
            text: "Где запятая не нужна?",
            options: [
                "Он пришёл, но ничего не сказал",
                "Деревья, кусты, трава — всё зеленело",
                "Я устал, а работать надо",
                "Он человек умный, и добрый"
            ],
            correct: 3,
            time: 30,
            explanation: "Запятая перед И не ставится, если однородные члены соединены парным союзом И...И. Должно быть: 'Он человек умный и добрый'.",
            points: 1,
            difficulty: "medium",
            source: "ОГЭ 2025"
        },
        {
            id: 13,
            type: "spelling",
            text: "В каком слове НЕ пишется раздельно?",
            options: [
                "(не)громкий, а тихий звук",
                "(не)заметная ошибка",
                "(не)выполненное задание",
                "(не)годуя на судьбу"
            ],
            correct: 3,
            time: 35,
            explanation: "НЕ с деепричастиями пишется раздельно: 'негодуя'. Остальные: 1 — раздельно (противопоставление), 2 — слитно (прилагательное), 3 — слитно (причастие без зависимых слов).",
            points: 1,
            difficulty: "hard",
            source: "ОГЭ 2025"
        },
        {
            id: 14,
            type: "syntax",
            text: "Какое предложение сложноподчинённое?",
            options: [
                "Я приду, когда закончу работу",
                "Светило солнце, и пели птицы",
                "Утро было ясное, солнечное",
                "Он ушёл — все вздохнули с облегчением"
            ],
            correct: 0,
            time: 30,
            explanation: "Сложноподчинённое с придаточным времени. 2 — сложносочинённое, 3 — простое, 4 — бессоюзное.",
            points: 1,
            difficulty: "medium",
            source: "ОГЭ 2025"
        },
        {
            id: 15,
            type: "morphology",
            text: "Какое слово является причастием?",
            options: [
                "бегущий",
                "бегство",
                "бегло",
                "бегун"
            ],
            correct: 0,
            time: 25,
            explanation: "'Бегущий' — причастие (форма глагола, отвечает на вопрос 'какой?'). Остальные: 2 — существительное, 3 — наречие, 4 — существительное.",
            points: 1,
            difficulty: "easy",
            source: "ОГЭ 2025"
        },
        {
            id: 16,
            type: "lexicology",
            text: "Какое словосочетание со связью ПРИМЫКАНИЕ?",
            options: [
                "читать быстро",
                "чтение книги",
                "книжный шкаф",
                "школьная тетрадь"
            ],
            correct: 0,
            time: 30,
            explanation: "'Читать быстро' — глагол + наречие (примыкание). 2 — управление, 3 и 4 — согласование.",
            points: 1,
            difficulty: "medium",
            source: "ОГЭ 2025"
        }
    ]
};

console.log(`✅ Загружено ${QUIZ_DATA.questions.length} сложных вопросов ОГЭ`);

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
            correctAnswer: question.correct, // Сохраняем правильный ответ
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
            const stats = this.calculateStats(answers, questionId);
            stats.questionId = questionId; // Добавляем ID вопроса
            callback(stats);
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
                // Обновляем в базе
                db.ref(`games/${gameId}/answers/${questionId}/${playerName}/isCorrect`).set(isCorrect);
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
                timestamp: answer.timestamp,
                playerAnswer: answer.answerIndex >= 0 ? question.options[answer.answerIndex] : "Не ответил",
                correctAnswer: question.options[question.correct]
            });
        });
        
        if (stats.times.length > 0) {
            stats.averageTime = Math.round(stats.times.reduce((a, b) => a + b) / stats.times.length);
        }
        
        // Сортируем по времени ответа
        stats.detailedAnswers.sort((a, b) => a.timeSpent - b.timeSpent);
        
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
                console.log(`${index+1}) ${question.options[index].substring(0,30)}...: ${count} (${percentage}%) ${isCorrect ? '✓ ПРАВИЛЬНО' : '✗'}`);
            });
            
            console.log(`Среднее время: ${stats.averageTime} сек.`);
            
            // Показываем ответы конкретных игроков
            console.log("Ответы игроков:");
            stats.detailedAnswers.forEach(answer => {
                const status = answer.isCorrect ? '✓ ПРАВИЛЬНО' : '✗ ОШИБКА';
                console.log(`${answer.player}: вариант ${answer.answerIndex + 1} - ${status} (${answer.timeSpent} сек.)`);
            });
            
            // Показываем в интерфейсе если есть дисплей
            this.displayStatsInUI(stats, question);
        });
    },
    
    // Отобразить статистику в интерфейсе
    displayStatsInUI(stats, question) {
        const statsDiv = document.getElementById('teacher-stats-display') || this.createStatsDisplay();
        
        let html = `<h3>📊 Статистика вопроса</h3>`;
        html += `<p><strong>Всего ответили:</strong> ${stats.total} игроков</p>`;
        html += `<p><strong>Правильных ответов:</strong> ${stats.correct} (${Math.round((stats.correct/stats.total)*100)}%)</p>`;
        html += `<p><strong>Среднее время:</strong> ${stats.averageTime} сек.</p>`;
        
        html += `<h4>Распределение по вариантам:</h4>`;
        stats.byOption.forEach((count, index) => {
            const percentage = Math.round((count/stats.total)*100);
            const isCorrect = index === question.correct;
            const barWidth = Math.max(10, percentage);
            html += `
                <div class="option-stat ${isCorrect ? 'correct' : ''}">
                    <div class="option-label">
                        <strong>${index + 1}.</strong> ${question.options[index].substring(0, 40)}...
                        ${isCorrect ? '<span class="correct-badge">✓ ПРАВИЛЬНЫЙ</span>' : ''}
                    </div>
                    <div class="option-bar">
                        <div class="bar-fill" style="width: ${barWidth}%"></div>
                        <span class="bar-text">${count} (${percentage}%)</span>
                    </div>
                </div>
            `;
        });
        
        html += `<h4>Ответы игроков:</h4>`;
        html += `<div class="player-answers-list">`;
        stats.detailedAnswers.forEach(answer => {
            const statusClass = answer.isCorrect ? 'correct' : 'incorrect';
            const statusText = answer.isCorrect ? '✓ Правильно' : '✗ Ошибка';
            html += `
                <div class="player-answer ${statusClass}">
                    <span class="player-name">${answer.player}</span>
                    <span class="player-choice">Вариант ${answer.answerIndex + 1}</span>
                    <span class="player-time">${answer.timeSpent}с</span>
                    <span class="player-status">${statusText}</span>
                </div>
            `;
        });
        html += `</div>`;
        
        statsDiv.innerHTML = html;
    },
    
    // Создать дисплей для статистики
    createStatsDisplay() {
        const div = document.createElement('div');
        div.id = 'teacher-stats-display';
        div.className = 'teacher-stats-display';
        document.body.appendChild(div);
        return div;
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
                    this.showNotification(`Игрок ${playerName} исключён из игры`, 'success');
                    
                    // Обновляем интерфейс
                    const playerElement = document.querySelector(`[data-player="${playerName}"]`);
                    if (playerElement) {
                        playerElement.style.opacity = '0.5';
                        playerElement.style.textDecoration = 'line-through';
                        const kickBtn = playerElement.querySelector('.kick-btn');
                        if (kickBtn) kickBtn.remove();
                    }
                })
                .catch(error => {
                    console.error('❌ Ошибка при исключении игрока:', error);
                    this.showNotification('Не удалось исключить игрока', 'error');
                });
        }
    },
    
    // Показать уведомление
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 5px;
            z-index: 10000;
            animation: slideIn 0.3s;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },
    
    // Отобразить таблицу лидеров с кнопками кика
    renderLeaderboardWithControls(gameId, leaderboard, container, isTeacher = false) {
        container.innerHTML = '';
        
        leaderboard.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'leaderboard-player';
            playerDiv.dataset.player = player.name;
            
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            
            playerDiv.innerHTML = `
                <div class="player-rank">${medal}</div>
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
            <div class="teacher-header">
                <h3>👨‍🏫 Панель учителя</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="teacher-buttons">
                <button onclick="teacherTools.showCurrentStats('${gameId}')" class="btn-stats">📊 Текущая статистика</button>
                <button onclick="teacherTools.showQuestionStats('${gameId}', ${window.currentQuestionId || 1})" class="btn-question">📝 Статистика вопроса</button>
                <button onclick="teacherTools.pauseGame('${gameId}')" class="btn-pause">⏸️ Пауза</button>
                <button onclick="teacherTools.nextQuestion('${gameId}')" class="btn-next">➡️ Следующий вопрос</button>
                <button onclick="teacherTools.endGameEarly('${gameId}')" class="btn-end">🏁 Завершить игру</button>
            </div>
            <div id="teacher-stats" class="stats-container"></div>
        `;
        
        document.body.appendChild(controlsDiv);
        this.injectTeacherStyles();
        
        // Сохраняем текущий ID вопроса
        db.ref('games/' + gameId).once('value').then(snapshot => {
            window.currentQuestionId = snapshot.val().currentQuestion;
        });
    },
    
    // Показать текущую статистику
    showCurrentStats(gameId) {
        firebaseAPI.getLeaderboard(gameId, (leaderboard) => {
            const statsDiv = document.getElementById('teacher-stats');
            const totalAnswers = leaderboard.reduce((sum, p) => sum + Object.keys(p.answers || {}).length, 0);
            const avgScore = leaderboard.length > 0 ? Math.round(leaderboard.reduce((sum, p) => sum + p.score, 0) / leaderboard.length) : 0;
            
            statsDiv.innerHTML = `
                <div class="stats-summary">
                    <h4>📈 Сводка игры:</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${leaderboard.length}</div>
                            <div class="stat-label">Игроков</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${avgScore}</div>
                            <div class="stat-label">Средний балл</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${totalAnswers}</div>
                            <div class="stat-label">Ответов</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${leaderboard[0] ? leaderboard[0].score : 0}</div>
                            <div class="stat-label">Лучший счёт</div>
                        </div>
                    </div>
                    <div class="leaderboard-mini">
                        <h5>🏆 Топ-3:</h5>
                        ${leaderboard.slice(0, 3).map((p, i) => `
                            <div class="top-player">
                                <span class="top-medal">${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                                <span class="top-name">${p.name}</span>
                                <span class="top-score">${p.score} баллов</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
    },
    
    // Поставить игру на паузу
    pauseGame(gameId) {
        if (confirm('⏸️ Поставить игру на паузу?')) {
            firebaseAPI.updateGameStatus(gameId, 'paused')
                .then(() => this.showNotification('Игра на паузе', 'info'))
                .catch(err => {
                    console.error('❌ Ошибка паузы:', err);
                    this.showNotification('Ошибка при паузе', 'error');
                });
        }
    },
    
    // Перейти к следующему вопросу
    nextQuestion(gameId) {
        db.ref('games/' + gameId).once('value').then((snapshot) => {
            const game = snapshot.val();
            const currentId = game.currentQuestion || 0;
            const nextId = currentId + 1;
            
            if (nextId <= QUIZ_DATA.questions.length) {
                firebaseAPI.updateGameStatus(gameId, 'question', nextId)
                    .then(() => {
                        this.showNotification(`➡️ Переход к вопросу ${nextId}`, 'info');
                        window.currentQuestionId = nextId;
                    });
            } else {
                this.showNotification('🏁 Это был последний вопрос!', 'info');
            }
        });
    },
    
    // Досрочно завершить игру
    endGameEarly(gameId) {
        if (confirm('🏁 Точно завершить игру досрочно?\n\nВсе игроки увидят результаты сейчас.')) {
            firebaseAPI.endGame(gameId)
                .then(() => this.showNotification('Игра завершена!', 'success'))
                .catch(err => {
                    console.error('❌ Ошибка завершения:', err);
                    this.showNotification('Ошибка при завершении', 'error');
                });
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
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            z-index: 1000;
            width: 320px;
            border: 2px solid #4CAF50;
            font-family: 'Segoe UI', Arial, sans-serif;
        }
        .teacher-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e0e0e0;
        }
        .teacher-header h3 {
            margin: 0;
            color: #2c3e50;
            font-size: 18px;
        }
        .close-btn {
            background: #ff4444;
            color: white;
            border: none;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .close-btn:hover {
            background: #cc0000;
        }
        .teacher-buttons {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 15px;
        }
        .teacher-buttons button {
            padding: 12px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
            text-align: left;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .btn-stats { background: #3498db; color: white; }
        .btn-question { background: #9b59b6; color: white; }
        .btn-pause { background: #f39c12; color: white; }
        .btn-next { background: #2ecc71; color: white; }
        .btn-end { background: #e74c3c; color: white; }
        
        .teacher-buttons button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .btn-stats:hover { background: #2980b9; }
        .btn-question:hover { background: #8e44ad; }
        .btn-pause:hover { background: #e67e22; }
        .btn-next:hover { background: #27ae60; }
        .btn-end:hover { background: #c0392b; }
        
        .stats-container {
            max-height: 300px;
            overflow-y: auto;
        }
        .stats-summary {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #4CAF50;
        }
        .stats-summary h4 {
            margin-top: 0;
            color: #2c3e50;
            font-size: 16px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin: 15px 0;
        }
        .stat-item {
            background: white;
            padding: 10px;
            border-radius: 6px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #4CAF50;
        }
        .stat-label {
            font-size: 12px;
            color: #7f8c8d;
            margin-top: 4px;
        }
        .leaderboard-mini {
            margin-top: 15px;
        }
        .leaderboard-mini h5 {
            margin: 0 0 10px 0;
            color: #2c3e50;
        }
        .top-player {
            display: flex;
            align-items: center;
            padding: 8px;
            margin: 5px 0;
            background: white;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .top-medal {
            font-size: 18px;
            margin-right: 10px;
        }
        .top-name {
            flex: 1;
            font-weight: 500;
        }
        .top-score {
            color: #4CAF50;
            font-weight: bold;
        }
        
        /* Стили для кнопки кика */
        .kick-btn {
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            margin-left: 10px;
        }
        .kick-btn:hover {
            background: #cc0000;
            transform: scale(1.1);
        }
        
        /* Стили для статистики вопросов */
        .teacher-stats-display {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 15px 50px rgba(0,0,0,0.2);
            z-index: 1001;
            width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            border: 3px solid #4CAF50;
        }
        .option-stat {
            margin: 10px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 6px;
        }
        .option-stat.correct {
            border-left: 4px solid #4CAF50;
            background: #e8f5e9;
        }
        .option-label {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .correct-badge {
            background: #4CAF50;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .option-bar {
            height: 20px;
            background: #e0e0e0;
            border-radius: 10px;
            position: relative;
            overflow: hidden;
        }
        .bar-fill {
            height: 100%;
            background: #2196F3;
            transition: width 0.5s;
        }
        .bar-text {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: white;
            font-weight: bold;
            font-size: 12px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        .player-answers-list {
            margin-top: 15px;
        }
        .player-answer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            margin: 4px 0;
            border-radius: 6px;
            font-size: 14px;
        }
        .player-answer.correct {
            background: #e8f5e9;
            color: #2e7d32;
        }
        .player-answer.incorrect {
            background: #ffebee;
            color: #c62828;
        }
        .player-name {
            font-weight: 500;
        }
        .player-choice, .player-time, .player-status {
            font-size: 12px;
            opacity: 0.8;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
};

console.log("✅ Файл загружен: сложные вопросы + фикс ответов + кнопка кика");

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
        if (role === 'teacher') {
            teacherTools.showNotification('Вы вошли как учитель', 'success');
        }
    },
    
    // Получить случайный вопрос
    getRandomQuestion() {
        const randomIndex = Math.floor(Math.random() * QUIZ_DATA.questions.length);
        return QUIZ_DATA.questions[randomIndex];
    }
};

// Инициализация
console.log("✅ Готово! Сложные вопросы ОГЭ + инструменты учителя");
console.log("Используйте teacherTools.showGameControls('game_id') для панели учителя");
console.log("Используйте quizUtils.setUserRole('teacher') для входа как учитель");
