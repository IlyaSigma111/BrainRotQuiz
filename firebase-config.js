// ============================================
// firebase-config.js
// 16 КОРОТКИХ ВОПРОСОВ ОГЭ 2025
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

// 🛠️ ПОЛНЫЙ НАБОР ФУНКЦИЙ ДЛЯ РАБОТЫ С FIREBASE
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
            // Очищаем старые ответы при смене вопроса
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

    // Удалить игрока
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

    // Отправить ответ
    submitAnswer(gameId, questionId, playerName, answerData) {
        const answerRef = db.ref(`games/${gameId}/answers/${questionId}/${playerName}`);
        return answerRef.set({
            ...answerData,
            timestamp: Date.now()
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

    // Рассчитать статистику
    calculateStats(answers, questionId) {
        const question = QUIZ_DATA.questions.find(q => q.id == questionId);
        if (!question) return null;
        
        const stats = {
            total: 0,
            correct: 0,
            byOption: question.options.map(() => 0),
            averageTime: 0,
            times: [],
            players: {}
        };
        
        Object.entries(answers).forEach(([playerName, answer]) => {
            stats.total++;
            stats.players[playerName] = answer;
            
            if (answer.answerIndex >= 0) {
                stats.byOption[answer.answerIndex]++;
                if (answer.isCorrect) {
                    stats.correct++;
                }
            }
            if (answer.timeSpent) {
                stats.times.push(answer.timeSpent);
            }
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
    },

    // Очистить старые игры (админ)
    cleanupOldGames(hours = 24) {
        const cutoff = Date.now() - (hours * 60 * 60 * 1000);
        return db.ref('games').once('value').then((snapshot) => {
            const updates = {};
            snapshot.forEach((child) => {
                const game = child.val();
                if (game.created && game.created < cutoff) {
                    updates[child.key] = null;
                }
            });
            return db.ref('games').update(updates);
        });
    }
};

// 🎯 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ВИКТОРИНОЙ
window.quizUtils = {
    // Получить вопрос по ID
    getQuestionById(id) {
        return QUIZ_DATA.questions.find(q => q.id == id);
    },

    // Получить случайный вопрос
    getRandomQuestion(excludeIds = []) {
        const available = QUIZ_DATA.questions.filter(q => !excludeIds.includes(q.id));
        return available[Math.floor(Math.random() * available.length)];
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

    // Рассчитать итоговый результат
    calculateFinalScore(answers) {
        let totalScore = 0;
        let correctCount = 0;
        
        Object.values(answers).forEach(answer => {
            if (answer.isCorrect) {
                totalScore += answer.points || 1;
                correctCount++;
            }
        });
        
        return {
            score: totalScore,
            correct: correctCount,
            total: Object.keys(answers).length,
            percentage: Math.round((correctCount / Object.keys(answers).length) * 100) || 0
        };
    },

    // Получить все вопросы по типу
    getQuestionsByType(type) {
        return QUIZ_DATA.questions.filter(q => q.type === type);
    },

    // Получить вопросы по сложности
    getQuestionsByDifficulty(difficulty) {
        return QUIZ_DATA.questions.filter(q => q.difficulty === difficulty);
    },

    // Генерация ID для новой игры
    generateGameCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
};

// 📊 СТАТИСТИКА И АНАЛИТИКА
window.quizAnalytics = {
    // Запись события
    logEvent(eventName, data = {}) {
        if (!window.db) return;
        
        const eventRef = db.ref('analytics/events').push();
        return eventRef.set({
            name: eventName,
            data: data,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        });
    },

    // Запись результата игры
    logGameResult(gameId, result) {
        return this.logEvent('game_completed', {
            gameId: gameId,
            quizId: QUIZ_DATA.id,
            result: result
        });
    },

    // Статистика по вопросам
    getQuestionAnalytics(callback) {
        if (!window.db) return;
        
        return db.ref('analytics/question_stats').on('value', (snapshot) => {
            callback(snapshot.val() || {});
        });
    }
};

console.log("✅ Все функции загружены: 16 вопросов + Firebase API + утилиты");
