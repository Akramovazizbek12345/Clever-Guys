// MAVSUM SOZLAMASI
const CURRENT_SEASON_NAME = "Season: D-1";

// TEST VAQTI (Soniya hisobida: 20 daqiqa)
const QUIZ_DURATION_SECONDS = 20 * 60; 
let timerInterval = null;
let timeRemaining = QUIZ_DURATION_SECONDS;

// Telegram Bot API sozlamalari
const TELEGRAM_BOT_TOKEN = '8865131817:AAGMce2DUjmVD46S9A93oW3l7nLkL1CKyWg'; 
const TELEGRAM_CHAT_ID = '-1004313952580';     

let currentUser = null;
let currentSubject = null;
let userCertificates = [];

window.onload = function() {
    // Mavsumlarni yangilash
    document.getElementById('home-season-badge').innerText = `🔥 Faol: ${CURRENT_SEASON_NAME}`;
    document.getElementById('laptop-season-text').innerText = CURRENT_SEASON_NAME;

    const savedUser = localStorage.getItem('cleverguys_user');
    const savedCerts = localStorage.getItem('cleverguys_certs');
    
    if(savedCerts) userCertificates = JSON.parse(savedCerts);
    if(savedUser) {
        currentUser = JSON.parse(savedUser);
        initMainContent();
    }

    // Xavfsizlik cheklovlari
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J')) {
            e.preventDefault();
            return false;
        }
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
    });
}

function saveUser(e) {
    e.preventDefault();
    const firstname = document.getElementById('firstname').value.trim();
    const lastname = document.getElementById('lastname').value.trim();
    currentUser = { firstname, lastname };
    localStorage.setItem('cleverguys_user', JSON.stringify(currentUser));
    initMainContent();
}

function initMainContent() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    document.getElementById('user-display').innerText = `👤 ${currentUser.firstname} ${currentUser.lastname}`;
    renderSubjects();
    updateCertificatesTab();
    navigateTo('home');
}

function logout() {
    localStorage.removeItem('cleverguys_user');
    localStorage.removeItem('cleverguys_certs');
    location.reload();
}

function navigateTo(page) {
    if(timerInterval) {
        if(!confirm("Diqqat! Imtihon tugallanmagan. Sahifadan chiqsangiz joriy natijangiz saqlanmaydi!")) {
            return;
        }
        clearInterval(timerInterval);
        timerInterval = null;
    }

    document.getElementById('page-home').classList.add('hidden');
    document.getElementById('page-subjects').classList.add('hidden');
    document.getElementById('page-certificates').classList.add('hidden');
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.add('hidden');

    document.getElementById('nav-home').className = "px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer text-slate-400 hover:text-white";
    document.getElementById('nav-subjects').className = "px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer text-slate-400 hover:text-white";
    document.getElementById('nav-certificates').className = "px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer text-slate-400 hover:text-white relative";

    if(page === 'home') {
        document.getElementById('page-home').classList.remove('hidden');
        document.getElementById('nav-home').className = "px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer bg-indigo-600 text-white";
    } else if(page === 'subjects') {
        document.getElementById('page-subjects').classList.remove('hidden');
        document.getElementById('nav-subjects').className = "px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer bg-indigo-600 text-white";
    } else if(page === 'certificates') {
        document.getElementById('page-certificates').classList.remove('hidden');
        document.getElementById('nav-certificates').className = "px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer bg-indigo-600 text-white relative";
        renderCertificatesPage();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function confirmExit() {
    navigateTo('subjects');
}

function startQuiz(subId) {
    currentSubject = subjectsData.find(s => s.id === subId);
    
    document.getElementById('page-home').classList.add('hidden');
    document.getElementById('page-subjects').classList.add('hidden');
    document.getElementById('page-certificates').classList.add('hidden');
    document.getElementById('result-screen').classList.add('hidden');
    
    document.getElementById('quiz-screen').classList.remove('hidden');
    document.getElementById('quiz-title').innerText = `${currentSubject.icon} ${currentSubject.name} fani bo'yicha imtihon`;

    const container = document.getElementById('quiz-container');
    container.innerHTML = '';

    currentSubject.q.forEach((quest, qIdx) => {
        let optionsHtml = '';
        quest.a.forEach((opt, oIdx) => {
            optionsHtml += `
                <label class="flex items-center gap-3 bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 rounded-xl p-3.5 cursor-pointer transition group">
                    <input type="radio" name="question-${qIdx}" value="${oIdx}" required class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-700">
                    <span class="text-slate-300 text-sm font-medium group-hover:text-white">${opt}</span>
                </label>
            `;
        });

        container.innerHTML += `
            <div class="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
                <p class="font-semibold text-sm text-slate-200 mb-3 heading-font">${qIdx + 1}. ${quest.s}</p>
                <div class="grid grid-cols-1 gap-2">${optionsHtml}</div>
            </div>
        `;
    });

    timeRemaining = QUIZ_DURATION_SECONDS;
    updateTimerDisplay();
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        if(timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            alert("Vaqt tugadi! Imtihon avtomatik yakunlanadi.");
            autoSubmitQuiz();
        }
    }, 1000);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('quiz-timer').innerText = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function autoSubmitQuiz() {
    processQuizResults();
}

function submitQuiz() {
    const questions = currentSubject.q;
    let allAnswered = true;

    for(let i = 0; i < questions.length; i++) {
        const selected = document.querySelector(`input[name="question-${i}"]:checked`);
        if(!selected) {
            allAnswered = false;
            break;
        }
    }

    if(!allAnswered) {
        alert("Iltimos, barcha savollarga javob bering!");
        return;
    }

    if(timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    processQuizResults();
}

function processQuizResults() {
    const questions = currentSubject.q;
    let correctCount = 0;

    for(let i = 0; i < questions.length; i++) {
        const selected = document.querySelector(`input[name="question-${i}"]:checked`);
        if(selected && parseInt(selected.value) === questions[i].c) {
            correctCount++;
        }
    }

    const percent = Math.round((correctCount / questions.length) * 100);
    
    let level = "Sertifikat berilmadi";
    if(percent >= 90) level = "C1 (Professional)";
    else if(percent >= 75) level = "B2 (Yuqori O'rta)";
    else if(percent >= 60) level = "B1 (O'rta)";
    else if(percent >= 45) level = "A2 (Boshlang'ich yuqori)";
    else if(percent >= 30) level = "A1 (Boshlang'ich)";

    const verifyId = 'CG-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString();

    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    
    document.getElementById('score-text').innerHTML = `
        To'g'ri javoblar: <span class="text-white font-bold">${correctCount}/${questions.length}</span> (${percent}%) <br>
        Belgilangan daraja: <span class="text-emerald-400 font-bold text-2xl">${level}</span>
    `;

    if(percent >= 30) { 
        document.getElementById('certificate-wrapper').classList.remove('hidden');
        document.getElementById('download-pdf-btn').classList.remove('hidden');
        
        const certBox = document.getElementById('certificate-box');
        certBox.className = "p-12 text-center relative overflow-hidden text-slate-900 transition-all duration-300 ";
        if(percent >= 90) certBox.classList.add('cert-gold');
        else if(percent >= 60) certBox.classList.add('cert-silver');
        else certBox.classList.add('cert-bronze');

        document.getElementById('cert-name').innerText = `${currentUser.firstname} ${currentUser.lastname}`;
        document.getElementById('cert-subject').innerText = currentSubject.name;
        document.getElementById('cert-q-count').innerText = questions.length;
        document.getElementById('cert-level').innerText = level.split(' ')[0];
        document.getElementById('cert-percent-display').innerText = `${percent}%`;
        document.getElementById('cert-id').innerText = verifyId;
        document.getElementById('cert-date').innerText = dateStr;
        document.getElementById('cert-season-display').innerText = CURRENT_SEASON_NAME;

        const certStorageKey = `${currentSubject.id}_${CURRENT_SEASON_NAME}`;
        const existingCertIdx = userCertificates.findIndex(c => c.storageId === certStorageKey);
        
        const newCertData = {
            storageId: certStorageKey,
            subjectId: currentSubject.id,
            subjectName: currentSubject.name,
            season: CURRENT_SEASON_NAME,
            icon: currentSubject.icon,
            level: level,
            percent: percent,
            verifyId: verifyId,
            date: dateStr,
            qCount: questions.length
        };

        if(existingCertIdx > -1) {
            if(percent > userCertificates[existingCertIdx].percent) {
                userCertificates[existingCertIdx] = newCertData;
            }
        } else {
            userCertificates.push(newCertData);
        }

        localStorage.setItem('cleverguys_certs', JSON.stringify(userCertificates));
        updateCertificatesTab();
    } else {
        document.getElementById('certificate-wrapper').classList.add('hidden');
        document.getElementById('download-pdf-btn').classList.add('hidden');
        document.getElementById('score-text').innerHTML += "<br><span class='text-rose-400 text-sm font-normal'>(Sertifikat olish uchun kamida 30% to'plashingiz kerak)</span>";
    }

    sendToTelegram(verifyId, level, percent);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateCertificatesTab() {
    const badge = document.getElementById('cert-badge');
    if(userCertificates.length > 0) badge.classList.remove('hidden');
    else badge.classList.add('hidden');
}

function renderSubjects() {
    const grid = document.getElementById('subjects-grid');
    grid.innerHTML = '';
    subjectsData.forEach(sub => {
        grid.innerHTML += `
            <div onclick="startQuiz('${sub.id}')" class="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900 transition-all duration-300 cursor-pointer flex items-center justify-between group">
                <div class="flex items-center gap-4">
                    <div class="w-11 h-11 bg-indigo-950/80 text-indigo-400 rounded-xl flex items-center justify-center text-xl border border-indigo-900/30">
                        ${sub.icon}
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-white heading-font">${sub.name}</h4>
                        <p class="text-xs text-slate-400 mt-0.5">${sub.q.length} ta test savoli</p>
                    </div>
                </div>
                <span class="text-slate-600 group-hover:text-indigo-400 transition text-xs font-bold">Boshlash →</span>
            </div>
        `;
    });
}

function renderCertificatesPage() {
    const noCertsView = document.getElementById('no-certs-view');
    const grid = document.getElementById('my-certificates-grid');
    
    if(userCertificates.length === 0) {
        noCertsView.classList.remove('hidden');
        grid.classList.add('hidden');
    } else {
        noCertsView.classList.add('hidden');
        grid.classList.remove('hidden');
        grid.innerHTML = '';

        userCertificates.forEach(cert => {
            grid.innerHTML += `
                <div class="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center text-lg border border-indigo-500/20">
                                ${cert.icon}
                            </div>
                            <div>
                                <h4 class="text-sm font-bold text-white heading-font">${cert.subjectName}</h4>
                                <p class="text-[10px] text-amber-400 font-semibold">${cert.season}</p>
                            </div>
                        </div>
                        <span class="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-2.5 py-1 rounded text-xs font-bold tracking-wide">
                            ${cert.level.split(' ')[0]}
                        </span>
                    </div>
                    <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 text-xs text-slate-400 flex justify-between items-center">
                        <span>ID: <span class="font-mono text-slate-200 font-semibold">${cert.verifyId}</span></span>
                        <span>Natija: <span class="text-emerald-400 font-bold">${cert.percent}%</span></span>
                    </div>
                    <button onclick="viewAndDownloadStoredCert('${cert.storageId}')" class="w-full text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer">
                        📄 Ko'rish va PDF yuklash
                    </button>
                </div>
            `;
        });
    }
}

function viewAndDownloadStoredCert(storageId) {
    const cert = userCertificates.find(c => c.storageId === storageId);
    if(!cert) return;
    
    document.getElementById('page-home').classList.add('hidden');
    document.getElementById('page-subjects').classList.add('hidden');
    document.getElementById('page-certificates').classList.add('hidden');
    
    document.getElementById('result-screen').classList.remove('hidden');
    document.getElementById('certificate-wrapper').classList.remove('hidden');
    document.getElementById('download-pdf-btn').classList.remove('hidden');

    document.getElementById('score-text').innerHTML = `
        Mavsumiy natija: <span class="text-white font-bold">${cert.percent}%</span> <br>
        Erišilgan daraja: <span class="text-amber-400 font-bold text-2xl">${cert.level}</span>
    `;

    const certBox = document.getElementById('certificate-box');
    certBox.className = "p-12 text-center relative overflow-hidden text-slate-900 transition-all duration-300 ";
    if(cert.percent >= 90) certBox.classList.add('cert-gold');
    else if(cert.percent >= 60) certBox.classList.add('cert-silver');
    else certBox.classList.add('cert-bronze');

    document.getElementById('cert-name').innerText = `${currentUser.firstname} ${currentUser.lastname}`;
    document.getElementById('cert-subject').innerText = cert.subjectName;
    document.getElementById('cert-q-count').innerText = cert.qCount;
    document.getElementById('cert-level').innerText = cert.level.split(' ')[0];
    document.getElementById('cert-percent-display').innerText = `${cert.percent}%`;
    document.getElementById('cert-id').innerText = cert.verifyId;
    document.getElementById('cert-date').innerText = cert.date;
    document.getElementById('cert-season-display').innerText = cert.season;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function downloadPDF() {
    const element = document.getElementById('certificate-box');
    const name = document.getElementById('cert-name').innerText;
    const subject = document.getElementById('cert-subject').innerText;
    const season = document.getElementById('cert-season-display').innerText;
    
    const opt = {
        margin:       0.3,
        filename:     `Sertifikat_${name}_${subject}_${season}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
}

function sendToTelegram(verifyId, level, percent) {
    const message = `🎓 *Cleverguys Yangi Natija!*\\n` +
                    `━━━━━━━━━━━━━━━━━━\\n` +
                    `👤 *Foydalanuvchi:* ${currentUser.firstname} ${currentUser.lastname}\\n` +
                    `📅 *Mavsum:* ${CURRENT_SEASON_NAME}\\n` +
                    `📚 *Fan nomi:* ${currentSubject.name}\\n` +
                    `📊 *Natija:* ${percent}%\\n` +
                    `🏅 *Daraja:* ${level}\\n` +
                    `🆔 *Verify ID:* ${verifyId}\\n` +
                    `━━━━━━━━━━━━━━━━━━`;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        })
    }).catch(err => console.error(err));
}
