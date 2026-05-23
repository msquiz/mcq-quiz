// DOM Elements
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const welcomeScreen = document.getElementById('welcomeScreen');
const quizContainer = document.getElementById('quizContainer');
const resultsContainer = document.getElementById('resultsContainer');
const startBtn = document.getElementById('startBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const restartBtn = document.getElementById('restartBtn');
const newQuizBtn = document.getElementById('newQuizBtn');
const currentQEl = document.getElementById('currentQ');
const totalQEl = document.getElementById('totalQ');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const timeEl = document.getElementById('time');
const finalScoreEl = document.getElementById('finalScore');
const scoreMessageEl = document.getElementById('scoreMessage');
const quizCategoryEl = document.getElementById('quizCategory');
const resultsDetailsEl = document.getElementById('resultsDetails');
const categoryItems = document.querySelectorAll('.category-item');

const translations = {
        en: {
            welcomeTitle: "Test Your Knowledge!",
            startButton: "Start Quiz",
            quizTime: "Time:",
            questionText: "Question",
            ofText: "of",
            previous: "Previous",
            next: "Next",
            submit: "Submit Quiz",
            resultsTitle: "Quiz Results",
            completedText: "You've completed the",
            quizText: "quiz!",
            restart: "Restart Quiz",
            newQuiz: "New Quiz",
			pauseTimer: "Pause Timer",
			resumeTimer: "Resume Timer",
			addTime: "Add 30s More",
			welcomeDesc: "Welcome to MS Quiz, your ultimate destination for challenging quizzes across various categories. Select a category from the sidebar and start testing your knowledge. Each quiz contains multiple-choice questions. After submission, you'll see your score and answers of questions."
			
			
        },
        hi: {
            welcomeTitle: "अपना ज्ञान परखें!",
            startButton: "क्विज़ शुरू करें",
            quizTime: "समय:",
            questionText: "प्रश्न",
            ofText: "/",
            previous: "पिछला",
            next: "अगला",
            submit: "क्विज़ जमा करें",
            resultsTitle: "क्विज़ परिणाम",
            completedText: "आपने पूरा कर लिया है",
            quizText: "क्विज़!",
            restart: "फिर से शुरू करें",
            newQuiz: "नई क्विज़",
			pauseTimer: "टाइमर रोकें",
			resumeTimer: "टाइमर जारी रखें",
			addTime: "30 सेकंड जोड़ें",
			welcomeDesc: "MS Quiz में आपका स्वागत है, जहाँ आप विभिन्न श्रेणियों में चुनौतीपूर्ण क्विज़ में भाग ले सकते हैं। साइडबार से एक श्रेणी चुनें और अपने ज्ञान का परीक्षण शुरू करें। प्रत्येक क्विज़ में बहुविकल्पीय प्रश्न होते हैं। जमा करने के बाद, आप अपना स्कोर और प्रश्नों के उत्तर देख पाएंगे।"
			
        }
    };
// Function to update UI texts based on language
function updateUITexts() {
    const lang = translations[currentLanguage] || translations.en;
    document.querySelector('.welcome-screen h1').textContent = lang.welcomeTitle;
    document.getElementById('startBtn').innerHTML = `${lang.startButton} <i class="fas fa-arrow-right"></i>`;
    document.querySelector('.timer i').nextSibling.textContent = ` ${lang.quizTime} `;
    document.querySelector('.question-number').textContent = `${lang.questionText} `;
    document.getElementById('prevBtn').innerHTML = `<i class="fas fa-arrow-left"></i> ${lang.previous}`;
    document.getElementById('nextBtn').innerHTML = `${lang.next} <i class="fas fa-arrow-right"></i>`;
    document.getElementById('submitBtn').textContent = lang.submit;
    document.querySelector('.results-title').textContent = lang.resultsTitle;
    document.querySelector('.results-header p').innerHTML = `${lang.completedText} <span id="quizCategory">${quizData[currentCategory]?.title || ''}</span> ${lang.quizText}`;
    document.getElementById('restartBtn').innerHTML = `<i class="fas fa-redo"></i> ${lang.restart}`;
    document.getElementById('newQuizBtn').innerHTML = `<i class="fas fa-book"></i> ${lang.newQuiz}`;
// Add these lines inside updateUITexts():
	document.getElementById('pauseTimer').innerHTML = `<i class="fas fa-pause"></i> ${lang.pauseTimer}`;
	document.getElementById('resumeTimer').innerHTML = `<i class="fas fa-play"></i> ${lang.resumeTimer}`;
	document.getElementById('addTime').innerHTML = `<i class="fas fa-plus"></i> ${lang.addTime}`;
	document.querySelector('.welcome-desc').textContent = lang.welcomeDesc;
}

// Add this at the top with other variables
let currentLanguage = 'en';

// Quiz state variables
let currentCategory = 'general';
let currentQuestion = 0;
let score = 0;
let userAnswers = [];
let timer;
let timeLeft = 300; // 5 minutes in seconds
let isTimerPaused = false;
let quizData = {}; // Will be populated with fetched data

// Event Listeners
mobileMenuBtn.addEventListener('click', toggleSidebar);
startBtn.addEventListener('click', startQuiz);
prevBtn.addEventListener('click', showPreviousQuestion);
nextBtn.addEventListener('click', showNextQuestion);
submitBtn.addEventListener('click', submitQuiz);
restartBtn.addEventListener('click', restartQuiz);
newQuizBtn.addEventListener('click', startNewQuiz);
// Add event listeners for the new buttons
document.getElementById('pauseTimer').addEventListener('click', pauseTimer);
document.getElementById('resumeTimer').addEventListener('click', resumeTimer);
document.getElementById('addTime').addEventListener('click', () => addTime(30));

// Add event listeners to category items
categoryItems.forEach(item => {
    item.addEventListener('click', () => {
        // Update active category
        categoryItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Set current category
        currentCategory = item.dataset.category;
        
        // If quiz is already started, reload with new category
        if (!welcomeScreen.classList.contains('active')) {
            startQuiz();
        }
    });
});



// Functions
function toggleSidebar() {
    sidebar.classList.toggle('active');
}

async function loadQuizData(category) {
    try {
        const response = await fetch(`quiz-data/${currentLanguage}/${category}.json`);
        if (!response.ok) {
            throw new Error('Failed to load quiz data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading quiz data:', error);
        return null;
    }
}

// Add language change handler
document.getElementById('languageSelect').addEventListener('change', function() {
    currentLanguage = this.value;
    updateUITexts();

    if (quizContainer.style.display !== 'none') {
        const categoryData = quizData[currentCategory];
        if (categoryData && categoryData.questions) {
            loadQuestion();
            document.querySelector('.quiz-title').textContent = 
                `${categoryData.title} ${currentLanguage === 'hi' ? 'क्विज़' : 'Quiz'}`;
        } else {
           // console.warn('Quiz data not loaded for current category in selected language.');
        }
    }
    
});




async function startQuiz() {
    try {
        // Show loading state
        questionEl.textContent = currentLanguage === 'hi' ? 'लोड हो रहा है...' : 'Loading...';
        
        const data = await loadQuizData(currentCategory);
        if (!data) {
            throw new Error('Failed to load quiz data');
        }
        
        quizData[currentCategory] = data;
        
        // Reset quiz state
        currentQuestion = 0;
        score = 0;
        userAnswers = [];
        timeLeft = 300;
    
    // Update UI
    welcomeScreen.style.display = 'none';
    quizContainer.style.display = 'block';
    resultsContainer.style.display = 'none';
    
    // Set quiz title
        document.querySelector('.quiz-title').textContent = 
            `${quizData[currentCategory].title} ${currentLanguage === 'hi' ? 'क्विज़' : 'Quiz'}`;
        
        startTimer();
        loadQuestion();
    } catch (error) {
        console.error('Error starting quiz:', error);
        questionEl.textContent = currentLanguage === 'hi' 
            ? 'क्विज़ शुरू करने में त्रुटि' 
            : 'Error starting quiz';
    }
}


function startTimer() {
    // Clear existing timer if any
    if (timer) clearInterval(timer);
    
    isTimerPaused = false;
    document.getElementById('pauseTimer').style.display = 'block';
    document.getElementById('resumeTimer').style.display = 'none';
    
    timer = setInterval(() => {
        if (!isTimerPaused) {
            timeLeft--;
            updateTimeDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                submitQuiz();
            }
        }
    }, 1000);
}

function pauseTimer() {
    isTimerPaused = true;
    document.getElementById('pauseTimer').style.display = 'none';
    document.getElementById('resumeTimer').style.display = 'block';
}

function resumeTimer() {
    isTimerPaused = false;
    document.getElementById('pauseTimer').style.display = 'block';
    document.getElementById('resumeTimer').style.display = 'none';
}

function addTime(seconds = 30) {
    timeLeft += seconds;
    updateTimeDisplay();
}

function updateTimeDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Change color when time is running out
    if (timeLeft < 60) {
        timeEl.style.color = 'var(--danger)';
    } else {
        timeEl.style.color = 'var(--primary)';
    }
}

// Modified loadQuestion function
function loadQuestion() {
    try {
        // Show loading state
        questionEl.textContent = currentLanguage === 'hi' ? 'प्रश्न लोड हो रहा है...' : 'Loading question...';
        
        const questions = quizData[currentCategory].questions;
		const 	question = questions[currentQuestion];
        if (!questions || !questions.length) {
            throw new Error('No questions available');
        }

        const lang = translations[currentLanguage] || translations.en;
        
        // Update question number display
        document.querySelector('.question-number').innerHTML = `
            ${lang.questionText} 
            <span class="current-q">${currentQuestion + 1}</span>
            ${lang.ofText} 
            <span class="total-q">${questions.length}</span>
        `;

        // Set question text and options
        questionEl.textContent = question.question;
        optionsEl.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionEl = document.createElement('div');
            optionEl.classList.add('option');
            
            if (userAnswers[currentQuestion] === option) {
                optionEl.classList.add('selected');
            }
            
            optionEl.innerHTML = `
                <div class="checkmark"></div>
                <span>${option}</span>
            `;
            optionEl.addEventListener('click', () => selectOption(option, optionEl));
            optionsEl.appendChild(optionEl);
        });

        // Update navigation buttons
        prevBtn.style.display = currentQuestion === 0 ? 'none' : 'block';
        nextBtn.style.display = currentQuestion < questions.length - 1 ? 'block' : 'none';
        submitBtn.style.display = currentQuestion === questions.length - 1 ? 'block' : 'none';

    } 
	catch (error) {
        console.error('Error loading question:', error);
        questionEl.textContent = currentLanguage === 'hi' 
            ? 'प्रश्न लोड करने में त्रुटि' 
            : 'Error loading question';
    }
}

function selectOption(option, optionElement) {
    // Remove selected class from all options in this question
    const options = optionsEl.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Add selected class to clicked option
    optionElement.classList.add('selected');
    
    // Store user's answer
    userAnswers[currentQuestion] = option;
}

function showPreviousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
    }
}

function showNextQuestion() {
    if (currentQuestion < quizData[currentCategory].questions.length - 1) {
        currentQuestion++;
        loadQuestion();
    }
}

function submitQuiz() {
    // Stop timer
    clearInterval(timer);
    
    // Calculate score
    quizData[currentCategory].questions.forEach((question, index) => {
        if (userAnswers[index] === question.answer) {
            score++;
        }
    });
    
    // Show results
    showResults();
}

function showResults() {
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    // Set results header
    quizCategoryEl.textContent = quizData[currentCategory].title;
    
    // Set score
    const totalQuestions = quizData[currentCategory].questions.length;
    finalScoreEl.textContent = `${score}/${totalQuestions}`;
    
    // Set score message
    const percentage = (score / totalQuestions) * 100;
    let message = '';
    
    if (percentage >= 80) {
        message = 'Excellent! You have great knowledge in this area.';
    } else if (percentage >= 60) {
        message = 'Good job! You know quite a bit about this topic.';
    } else if (percentage >= 40) {
        message = 'Not bad! Keep learning to improve your score.';
    } else {
        message = 'Keep studying! You can do better next time.';
    }
    
    scoreMessageEl.textContent = message;
    
    // Clear previous results
    resultsDetailsEl.innerHTML = '';
    
    // Add detailed results
    quizData[currentCategory].questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.answer;
        
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        resultItem.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        // Apply color for correct or incorrect ansder...
	const userAnswerText = userAnswer || (currentLanguage === 'hi' ? 'उत्तर नहीं दिया' : 'Not answered');
	const userAnswerClass = isCorrect ? 'correct-feedback' : 'incorrect-feedback';

	resultItem.innerHTML = `
		<div class="result-question">${index + 1}. ${question.question}</div>
		<div>${currentLanguage === 'hi' ? 'आपका उत्तर' : 'Your answer'}: <span class="user-answer ${userAnswerClass}">${userAnswerText}</span></div>
		<div>${currentLanguage === 'hi' ? 'सही उत्तर' : 'Correct answer'}: <span class="correct-answer">${question.answer}</span></div>
	`;
        
        resultsDetailsEl.appendChild(resultItem);
    });
}

function restartQuiz() {
    // Reset to first question
    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    timeLeft = 300;
    
    // Show quiz container
    resultsContainer.style.display = 'none';
    quizContainer.style.display = 'block';
	
	// Reset timer controls
    isTimerPaused = false;
    document.getElementById('pauseTimer').style.display = 'block';
    document.getElementById('resumeTimer').style.display = 'none';
    
    // Start timer and load first question
    startTimer();
    loadQuestion();
}

function startNewQuiz() {
    // Return to welcome screen
    resultsContainer.style.display = 'none';
    welcomeScreen.style.display = 'block';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set total questions (will be updated when quiz starts)
    totalQEl.textContent = '5';
});
