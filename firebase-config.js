// === КОНФИГУРАЦИЯ FIREBASE ===
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
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// === БАЗА ВОПРОСОВ ПО ОГЭ И УСТНОМУ СОБЕСЕДОВАНИЮ ===
const QUIZ_DATA = {
    quizId: "oge_russian_v1",
    title: "Подготовка к ОГЭ и устному собеседованию",
    questions: [
        // Блок 1: Устное собеседование (10 вопросов)
        {
            id: 1,
            type: "oral",
            text: "Опишите фотографию. На ней изображена библиотека, где ученики готовятся к экзаменам.",
            options: [
                "1. Просто «ученики в библиотеке»",
                "2. Подробное описание: обстановка, действия, эмоции",
                "3. Перечисление предметов в помещении"
            ],
            correct: 1,
            time: 45,
            explanation: "Нужно дать развернутое описание с деталями."
        },
        {
            id: 2,
            type: "oral", 
            text: "Выразите мнение: Должны ли школьники самостоятельно выбирать книги для чтения?",
            options: [
                "1. Да, это развивает вкус и ответственность",
                "2. Нет, учитель лучше знает",
                "3. Можно советоваться с учителем"
            ],
            correct: 0,
            time: 60,
            explanation: "Мнение должно быть аргументированным."
        },
        {
            id: 3,
            type: "oral",
            text: "Диалог: Обсудите с другом планы на летние каникулы.",
            options: [
                "1. Только рассказать о своих планах",
                "2. Только задать вопросы другу", 
                "3. И рассказать, и спросить"
            ],
            correct: 2,
            time: 50,
            explanation: "Диалог предполагает двустороннее общение."
        },
        // Блок 2: Орфография (10 вопросов)
        {
            id: 11,
            type: "spelling",
            text: "В каком слове пишется НН?",
            options: ["Оловя..ый", "Деревя..ый", "Стекля..ый"],
            correct: 1,
            time: 20,
            explanation: "ДеревяННый — исключение из правила."
        },
        {
            id: 12, 
            type: "spelling",
            text: "Выберите правильное написание:",
            options: ["Пол-лимона", "Пол лимона", "Пол-лимон"],
            correct: 0,
            time: 15,
            explanation: "Слова с «пол-» через дефис пишутся, если следующая буква Л."
        },
        // Блок 3: Пунктуация (10 вопросов)
        {
            id: 21,
            type: "punctuation",
            text: "Где нужна запятая? «Я вернулся домой(1) и(2) когда начал читать(3) сразу уснул.»",
            options: ["1. 1, 2", "2. 2, 3", "3. 1, 3"],
            correct: 1,
            time: 25,
            explanation: "Запятая перед И в сложном предложении."
        },
        {
            id: 22,
            type: "punctuation",
            text: "Где нужно двоеточие? «У него три увлечения( ) музыка, шахматы и программирование.»",
            options: [
                "1. После «увлечения»",
                "2. После «музыка»", 
                "3. Двоеточие не нужно"
            ],
            correct: 0,
            time: 20,
            explanation: "Двоеточие при однородных членах после обобщающего слова."
        },
        // ... Добавьте остальные 24 вопроса по аналогии
    ]
};

// === ФУНКЦИИ ДЛЯ РАБОТЫ С FIREBASE ===
const firebaseAPI = {
    // Начать новую игру (учитель)
    startNewGame() {
        const gameId = "game_" + Date.now();
        const gameData = {
            id: gameId,
            status: "waiting",
            currentQuestion: null,
            players: {},
            quiz: QUIZ_DATA
        };
        
        db.ref('games/' + gameId).set(gameData);
        return gameId;
    },

    // Получить данные игры (ученик)
    getGame(gameId, callback) {
        db.ref('games/' + gameId).on('value', (snapshot) => {
            callback(snapshot.val());
        });
    },

    // Отправить ответ (ученик)
    submitAnswer(gameId, playerName, questionId, answerIndex) {
        const answerRef = db.ref(`games/${gameId}/answers/${questionId}/${playerName}`);
        answerRef.set({
            answer: answerIndex,
            timestamp: Date.now()
        });
    },

    // Получить статистику по вопросу (учитель)
    getQuestionStats(gameId, questionId, callback) {
        db.ref(`games/${gameId}/answers/${questionId}`).on('value', (snapshot) => {
            const answers = snapshot.val() || {};
            const stats = { total: 0, correct: 0, byAnswer: [0, 0, 0, 0] };
            
            Object.values(answers).forEach(answer => {
                stats.total++;
                stats.byAnswer[answer.answer]++;
                if(answer.answer === QUIZ_DATA.questions.find(q => q.id === questionId)?.correct) {
                    stats.correct++;
                }
            });
            
            callback(stats);
        });
    }
};

// Экспорт для использования в других файлах
window.firebaseAPI = firebaseAPI;
window.QUIZ_DATA = QUIZ_DATA;
