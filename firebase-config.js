// ============================================
// firebase-config.js - ГЛАВНЫЙ КОНФИГУРАЦИОННЫЙ ФАЙЛ
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

// 📚 30 КОРОТКИХ ЗАДАНИЙ ОГЭ 2026 (25 СЕКУНД КАЖДОЕ)
window.QUIZ_DATA = {
    id: "oge_2026_short",
    title: "ОГЭ 2026 - Русский язык (30 заданий)",
    description: "30 коротких заданий для быстрой проверки знаний",
    subject: "Русский язык",
    author: "Издательство 'Национальное образование'",
    version: "2026.1",
    timePerQuestion: 25,
    questions: [
        // ЗАДАНИЯ 1-10: СИНТАКСИС И ПУНКТУАЦИЯ
        {
            id: 1,
            type: "syntax",
            text: "Найдите грамматическую основу: «Из гнезда вылупляются птенцы».",
            options: [
                "1) вылупляются",
                "2) вылупляются птенцы",
                "3) из гнезда вылупляются",
                "4) птенцы вылупляются"
            ],
            correct: 1,
            time: 25,
            explanation: "Правильно: 'вылупляются птенцы' — подлежащее + сказуемое.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 2,
            type: "syntax",
            text: "Найдите грамматическую основу: «Птицы начинают петь на рассвете».",
            options: [
                "1) птицы начинают",
                "2) начинают петь",
                "3) птицы петь",
                "4) петь на рассвете"
            ],
            correct: 0,
            time: 25,
            explanation: "Правильно: 'птицы начинают' — составное глагольное сказуемое.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 3,
            type: "syntax",
            text: "Какое предложение является сложноподчинённым?",
            options: [
                "1) Солнце светит ярко.",
                "2) Когда идёт дождь, мы остаёмся дома.",
                "3) Дети играют и смеются.",
                "4) Весна пришла неожиданно."
            ],
            correct: 1,
            time: 25,
            explanation: "Предложение 2 сложноподчинённое с придаточным времени.",
            points: 1,
            difficulty: "medium"
        },
        {
            id: 4,
            type: "punctuation",
            text: "Где нужно поставить запятую? «Ученики читают книги() которые лежат на столе».",
            options: [
                "1) Перед 'которые'",
                "2) Перед 'лежат'",
                "3) Запятая не нужна",
                "4) После 'книги'"
            ],
            correct: 0,
            time: 25,
            explanation: "Запятая перед союзным словом 'которые' (придаточное определительное).",
            points: 1,
            difficulty: "medium"
        },
        {
            id: 5,
            type: "punctuation",
            text: "Где нужна запятая? «Мы любим школу() и радуемся() когда там интересно».",
            options: [
                "1) Обе запятые нужны",
                "2) Только первая",
                "3) Только вторая",
                "4) Ни одной"
            ],
            correct: 2,
            time: 25,
            explanation: "Запятая перед 'когда' (придаточное изъяснительное).",
            points: 1,
            difficulty: "medium"
        },
        {
            id: 6,
            type: "spelling",
            text: "Выберите правильное написание: «Бе..конечная дорога».",
            options: [
                "1) бесконечная",
                "2) безконечная",
                "3) бесконечная",
                "4) бесконечная"
            ],
            correct: 0,
            time: 25,
            explanation: "Приставка БЕС- перед глухим согласным К.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 7,
            type: "spelling",
            text: "Выберите правильное написание: «В течени.. дня».",
            options: [
                "1) течении",
                "2) течениие",
                "3) течение",
                "4) течени"
            ],
            correct: 0,
            time: 25,
            explanation: "Существительное с предлогом 'в течении' (чего?) дня.",
            points: 1,
            difficulty: "medium"
        },
        {
            id: 8,
            type: "spelling",
            text: "Как правильно: «Он не знает() этого правила»?",
            options: [
                "1) незнает (слитно)",
                "2) не знает (раздельно)",
                "3) ни знает",
                "4) незнаеть"
            ],
            correct: 1,
            time: 25,
            explanation: "Частица НЕ с глаголом пишется раздельно.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 9,
            type: "spelling",
            text: "Вставьте букву: «Никуда не ден..шься от холода».",
            options: [
                "1) е",
                "2) и",
                "3) я",
                "4) ь"
            ],
            correct: 1,
            time: 25,
            explanation: "Глагол II спряжения: денИшься.",
            points: 1,
            difficulty: "medium"
        },
        {
            id: 10,
            type: "spelling",
            text: "Вставьте букву: «Листва колыш..тся на ветру».",
            options: [
                "1) е",
                "2) и",
                "3) я",
                "4) а"
            ],
            correct: 0,
            time: 25,
            explanation: "Глагол I спряжения: колышЕтся.",
            points: 1,
            difficulty: "medium"
        },
        // ЗАДАНИЯ 11-20: ОРФОГРАФИЯ И МОРФОЛОГИЯ
        {
            id: 11,
            type: "morphology",
            text: "Как правильно: «месяц первых заморозк..»?",
            options: [
                "1) заморозки",
                "2) заморозков",
                "3) заморозок",
                "4) заморозке"
            ],
            correct: 1,
            time: 25,
            explanation: "Родительный падеж множественного числа: заморозкОВ.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 12,
            type: "word_formation",
            text: "Замените словосочетание «пенал ученика» на синонимичное со связью согласование.",
            options: [
                "1) ученический пенал",
                "2) пенал для ученика",
                "3) пенал у ученика",
                "4) пенал от ученика"
            ],
            correct: 0,
            time: 25,
            explanation: "Согласование: прилагательное + существительное.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 13,
            type: "stylistics",
            text: "Найдите эпитет: «непроглядная темнота».",
            options: [
                "1) непроглядная",
                "2) темнота",
                "3) оба слова",
                "4) нет эпитета"
            ],
            correct: 0,
            time: 25,
            explanation: "«Непроглядная» — эпитет (образное определение).",
            points: 1,
            difficulty: "medium"
        },
        {
            id: 14,
            type: "spelling",
            text: "Как правильно: «замир..ть от удивления»?",
            options: [
                "1) замиреть",
                "2) замереть",
                "3) замирать",
                "4) замерять"
            ],
            correct: 2,
            time: 25,
            explanation: "Чередование И/А: замирать (от 'мир').",
            points: 1,
            difficulty: "hard"
        },
        {
            id: 15,
            type: "spelling",
            text: "Как пишется: «комар..ый укус»?",
            options: [
                "1) комариный",
                "2) комаринный",
                "3) комарийный",
                "4) комаринныйй"
            ],
            correct: 0,
            time: 25,
            explanation: "Суффикс -ИН- пишется с одной Н.",
            points: 1,
            difficulty: "medium"
        },
        {
            id: 16,
            type: "spelling",
            text: "Как правильно: «не прочит..на книга»?",
            options: [
                "1) прочитана",
                "2) прочитанна",
                "3) прочитанна",
                "4) прочитанная"
            ],
            correct: 0,
            time: 25,
            explanation: "Краткое страдательное причастие: прочитанА.",
            points: 1,
            difficulty: "medium"
        },
        {
            id: 17,
            type: "syntax",
            text: "Найдите грамматическую основу: «Живопись стала популярной с древних времён».",
            options: [
                "1) живопись стала",
                "2) стала популярной",
                "3) живопись популярной",
                "4) популярной с времён"
            ],
            correct: 0,
            time: 25,
            explanation: "Правильно: 'живопись стала' — подлежащее + часть сказуемого.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 18,
            type: "syntax",
            text: "Найдите грамматическую основу: «Спорт — основа здорового образа жизни».",
            options: [
                "1) спорт — основа",
                "2) основа жизни",
                "3) спорт жизни",
                "4) здорового образа"
            ],
            correct: 0,
            time: 25,
            explanation: "Тире между подлежащим и сказуемым.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 19,
            type: "syntax",
            text: "Найдите грамматическую основу: «Люди уважают труд учителей».",
            options: [
                "1) люди уважают",
                "2) уважают труд",
                "3) люди труд",
                "4) труд учителей"
            ],
            correct: 0,
            time: 25,
            explanation: "Подлежащее 'люди', сказуемое 'уважают'.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 20,
            type: "syntax",
            text: "Найдите грамматическую основу: «В сказках заключена мудрость».",
            options: [
                "1) в сказках заключена",
                "2) заключена мудрость",
                "3) сказках мудрость",
                "4) мудрость заключена"
            ],
            correct: 1,
            time: 25,
            explanation: "Сказуемое 'заключена', подлежащее 'мудрость'.",
            points: 1,
            difficulty: "easy"
        },
        // ЗАДАНИЯ 21-30: ОРФОГРАФИЯ
        {
            id: 21,
            type: "spelling",
            text: "Как пишется: «бадминт..н»?",
            options: [
                "1) бадминтон",
                "2) бадминтен",
                "3) бадминтан",
                "4) бадминтин"
            ],
            correct: 0,
            time: 25,
            explanation: "Слово 'бадминтон' словарное, проверяется по словарю.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 22,
            type: "spelling",
            text: "Как правильно: «голубоглаз..й ребёнок»?",
            options: [
                "1) голубоглазый",
                "2) голубоглазий",
                "3) голубоглазой",
                "4) голубоглази"
            ],
            correct: 0,
            time: 25,
            explanation: "Сложное прилагательное 'голубоглазый' пишется слитно.",
            points: 1,
            difficulty: "medium"
        },
        {
            id: 23,
            type: "spelling",
            text: "Как пишется: «разгор..лся спор»?",
            options: [
                "1) разгорелся",
                "2) разгарелся",
                "3) разгорэлся",
                "4) разгорился"
            ],
            correct: 0,
            time: 25,
            explanation: "Чередование О/А в корне ГОР-ГАР.",
            points: 1,
            difficulty: "medium"
        },
        {
            id: 24,
            type: "spelling",
            text: "Как правильно: «цыпл..чий пух»?",
            options: [
                "1) цыплячий",
                "2) циплячий",
                "3) цыпличый",
                "4) ципличий"
            ],
            correct: 0,
            time: 25,
            explanation: "После Ц в корне пишется Ы (исключение).",
            points: 1,
            difficulty: "hard"
        },
        {
            id: 25,
            type: "spelling",
            text: "Как пишется: «несвобод.. человека»?",
            options: [
                "1) несвобода",
                "2) не свобода",
                "3) несвабода",
                "4) не свабода"
            ],
            correct: 0,
            time: 25,
            explanation: "Слово 'несвобода' пишется слитно (без НЕ не употребляется).",
            points: 1,
            difficulty: "medium"
        },
        {
            id: 26,
            type: "spelling",
            text: "Как правильно: «раст..пливать печь»?",
            options: [
                "1) растопливать",
                "2) растапливать",
                "3) ростапливать",
                "4) растаплевать"
            ],
            correct: 1,
            time: 25,
            explanation: "В корне СТАПЛ- перед суффиксом -ИВА- пишется А.",
            points: 1,
            difficulty: "hard"
        },
        {
            id: 27,
            type: "spelling",
            text: "Как пишется: «пр..образ» (предшественник)?",
            options: [
                "1) прообраз",
                "2) преобраз",
                "3) приобраз",
                "4) праобраз"
            ],
            correct: 0,
            time: 25,
            explanation: "Приставка ПРО- со значением 'предшествующий'.",
            points: 1,
            difficulty: "medium"
        },
        {
            id: 28,
            type: "spelling",
            text: "Как пишется: «пр..митивный» (простой)?",
            options: [
                "1) примитивный",
                "2) премитивный",
                "3) проимитивный",
                "4) прамитивный"
            ],
            correct: 0,
            time: 25,
            explanation: "Приставка ПРИ- в значении 'близкий к чему-то'.",
            points: 1,
            difficulty: "medium"
        },
        {
            id: 29,
            type: "spelling",
            text: "Как пишется: «бе..шумный»?",
            options: [
                "1) бесшумный",
                "2) безшумный",
                "3) бешшумный",
                "4) бешумный"
            ],
            correct: 0,
            time: 25,
            explanation: "Приставка БЕС- перед глухим согласным Ш.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 30,
            type: "spelling",
            text: "Как пишется: «и..пугать»?",
            options: [
                "1) испугать",
                "2) исспугать",
                "3) изпугать",
                "4) ипугать"
            ],
            correct: 0,
            time: 25,
            explanation: "Приставка ИС- перед глухим согласным П.",
            points: 1,
            difficulty: "easy"
        }
    ]
};

console.log(`✅ Загружено ${QUIZ_DATA.questions.length} коротких заданий (по 25 сек)`);

// 🛠️ СИСТЕМА МОДЕРАТОРОВ
window.moderatorSystem = {
    MODERATOR_PASSWORD: "JojoTop1",
    
    isModerator() {
        return localStorage.getItem('isModerator') === 'true';
    },
    
    setModerator(status) {
        localStorage.setItem('isModerator', status);
        console.log(`🔧 Статус модератора: ${status ? 'ВКЛ' : 'ВЫКЛ'}`);
    },
    
    showPasswordModal() {
        const modalHTML = `
            <div id="moderatorModal" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                padding: 20px;
            ">
                <div style="
                    background: #1a1a2e;
                    padding: 30px;
                    border-radius: 15px;
                    max-width: 400px;
                    width: 100%;
                    border: 3px solid #00adb5;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                ">
                    <h3 style="color: #00ff88; text-align: center; margin-bottom: 20px;">
                        🔧 Режим модератора
                    </h3>
                    <p style="color: #8f8f8f; text-align: center; margin-bottom: 20px;">
                        Введите пароль для доступа к функциям модератора
                    </p>
                    <input type="password" 
                           id="moderatorPassword" 
                           placeholder="Пароль"
                           style="
                                width: 100%;
                                padding: 15px;
                                background: rgba(255,255,255,0.1);
                                border: 2px solid #393e46;
                                border-radius: 8px;
                                color: white;
                                font-size: 16px;
                                margin-bottom: 15px;
                           ">
                    <div style="display: flex; gap: 10px;">
                        <button onclick="moderatorSystem.checkPassword()" 
                                style="
                                    flex: 1;
                                    padding: 15px;
                                    background: #00adb5;
                                    color: white;
                                    border: none;
                                    border-radius: 8px;
                                    font-weight: bold;
                                    cursor: pointer;
                                ">
                            Войти
                        </button>
                        <button onclick="moderatorSystem.hideModal()"
                                style="
                                    padding: 15px 25px;
                                    background: #ff416c;
                                    color: white;
                                    border: none;
                                    border-radius: 8px;
                                    font-weight: bold;
                                    cursor: pointer;
                                ">
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        setTimeout(() => {
            const input = document.getElementById('moderatorPassword');
            if (input) input.focus();
        }, 100);
    },
    
    checkPassword() {
        const input = document.getElementById('moderatorPassword');
        if (!input) return;
        
        if (input.value === this.MODERATOR_PASSWORD) {
            this.setModerator(true);
            this.hideModal();
            this.showModeratorControls();
            alert('✅ Вы вошли как модератор!');
        } else {
            alert('❌ Неверный пароль!');
            input.value = '';
            input.focus();
        }
    },
    
    hideModal() {
        const modal = document.getElementById('moderatorModal');
        if (modal) modal.remove();
    },
    
    showModeratorControls() {
        const style = document.createElement('style');
        style.textContent = `
            .moderator-badge {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #ff9e00, #ff6d00);
                color: white;
                padding: 10px 15px;
                border-radius: 25px;
                font-weight: bold;
                z-index: 9999;
                box-shadow: 0 4px 15px rgba(255, 106, 0, 0.3);
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
            }
            
            .moderator-panel {
                position: fixed;
                bottom: 80px;
                right: 20px;
                background: #1a1a2e;
                border: 2px solid #ff9e00;
                border-radius: 10px;
                padding: 15px;
                z-index: 9998;
                min-width: 250px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                display: none;
            }
            
            .moderator-panel.active {
                display: block;
            }
            
            .moderator-btn {
                width: 100%;
                padding: 10px;
                margin: 5px 0;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid #ff9e00;
                color: white;
                border-radius: 5px;
                cursor: pointer;
                text-align: left;
            }
        `;
        document.head.appendChild(style);
        
        if (!document.getElementById('moderatorBadge')) {
            const badge = document.createElement('div');
            badge.id = 'moderatorBadge';
            badge.className = 'moderator-badge';
            badge.innerHTML = '🔧 Модератор';
            badge.onclick = () => {
                const panel = document.getElementById('moderatorPanel');
                if (panel) panel.classList.toggle('active');
            };
            document.body.appendChild(badge);
            
            const panel = document.createElement('div');
            panel.id = 'moderatorPanel';
            panel.className = 'moderator-panel';
            panel.innerHTML = `
                <h4 style="color: #ff9e00; margin-top: 0; margin-bottom: 10px;">Управление игрой</h4>
                <button class="moderator-btn" onclick="moderatorSystem.kickLastPlayer()">
                    🚫 Удалить последнего
                </button>
                <button class="moderator-btn" onclick="moderatorSystem.listPlayers()">
                    📋 Список игроков
                </button>
                <button class="moderator-btn" onclick="moderatorSystem.exitModerator()">
                    🚪 Выйти
                </button>
            `;
            document.body.appendChild(panel);
        }
    },
    
    kickLastPlayer() {
        if (!window.currentGameId) {
            alert('Сначала создайте игру!');
            return;
        }
        
        db.ref(`games/${currentGameId}/players`).once('value').then(snapshot => {
            const players = snapshot.val();
            if (!players) {
                alert('Нет игроков в игре');
                return;
            }
            
            const playerNames = Object.keys(players);
            const lastPlayer = playerNames[playerNames.length - 1];
            
            if (confirm(`Удалить игрока "${lastPlayer}"?`)) {
                db.ref(`games/${currentGameId}/players/${lastPlayer}`).remove()
                    .then(() => alert(`Игрок ${lastPlayer} удален`));
            }
        });
    },
    
    listPlayers() {
        if (!window.currentGameId) {
            alert('Сначала создайте игру!');
            return;
        }
        
        db.ref(`games/${currentGameId}/players`).once('value').then(snapshot => {
            const players = snapshot.val();
            if (!players) {
                alert('Нет игроков');
                return;
            }
            
            const list = Object.keys(players).map(name => `• ${name}`).join('\n');
            alert(`Игроки (${Object.keys(players).length}):\n\n${list}`);
        });
    },
    
    exitModerator() {
        this.setModerator(false);
        const badge = document.getElementById('moderatorBadge');
        const panel = document.getElementById('moderatorPanel');
        if (badge) badge.remove();
        if (panel) panel.remove();
        alert('Режим модератора выключен');
    }
};

// 🎯 ДОБАВЛЯЕМ ВОЗМОЖНОСТЬ КИКА В СПИСКЕ ИГРОКОВ
window.enhancedPlayerList = {
    renderWithKickButtons(gameId, players, container, isTeacher = false, isModerator = false) {
        if (!container) return;
        
        if (players.length === 0) {
            container.innerHTML = '<div class="empty-lobby"><p>Ожидаем игроков...</p></div>';
            return;
        }
        
        container.innerHTML = players.map((player, index) => `
            <div class="player-card">
                <div class="player-avatar">${player.name.charAt(0)}</div>
                <div class="player-name">${player.name}</div>
                <div class="player-score">${player.score || 0} очков</div>
                ${(isTeacher || isModerator) ? `
                    <button onclick="enhancedPlayerList.kickPlayer('${gameId}', '${player.name}')"
                            style="background:red;color:white;border:none;padding:5px;border-radius:3px;cursor:pointer">
                        Удалить
                    </button>
                ` : ''}
            </div>
        `).join('');
    },
    
    kickPlayer(gameId, playerName) {
        if (confirm(`Удалить игрока "${playerName}"?`)) {
            db.ref(`games/${gameId}/players/${playerName}`).remove()
                .then(() => alert(`Игрок ${playerName} удален`));
        }
    }
};

// 🔧 ИНИЦИАЛИЗАЦИЯ ДЛЯ ГЛАВНОЙ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
    const signature = document.querySelector('.home-footer p:last-child');
    if (signature) {
        signature.innerHTML = signature.innerHTML.replace(
            'ИльяСигма111',
            '<span id="moderatorSignature" style="color: #00ff88; cursor: pointer;">ИльяСигма111</span>'
        );
        
        document.getElementById('moderatorSignature').onclick = function() {
            moderatorSystem.showPasswordModal();
        };
    }
});

console.log("✅ 30 коротких заданий загружены (25 сек каждое)");
console.log("Все задания решаемы без контекста текстов");
console.log("Пароль для модераторов: JojoTop1");
