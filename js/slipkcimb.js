function loadFonts() {
    const fonts = [
        new FontFace('SukhumvitSetLight', 'url(assets/fonts/SukhumvitSet-Light.woff)'),
        new FontFace('SukhumvitSetMedium', 'url(assets/fonts/SukhumvitSet-Medium.woff)'),
        new FontFace('SukhumvitSetSemiBold', 'url(assets/fonts/SukhumvitSet-SemiBold.woff)')
    ];

    return Promise.all(fonts.map(font => font.load().catch(e => console.warn('Font load error:', e)))).then(function(loadedFonts) {
        loadedFonts.forEach(function(font) {
            if (font) document.fonts.add(font);
        });
    });
}

window.onload = function() {
    setCurrentDateTime();
    
    const bankSelect = document.getElementById('bank');
    if(bankSelect) {
        bankSelect.addEventListener('change', window.autoFormatAccount);
    }

    loadFonts().then(function() {
        document.fonts.ready.then(function() {
            updateDisplay();
        });
    }).catch(function() {
        updateDisplay();
    });
};

function setCurrentDateTime() {
    const now = new Date();
    const localDateTime = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok', hour12: false });
    const formattedDateTime = localDateTime.replace(' ', 'T');
    const dtElem = document.getElementById('datetime');
    if (dtElem && !dtElem.value) dtElem.value = formattedDateTime;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}

function formatDate(date) {
    if (!date || date === '-') return '-';
    const options = { day: 'numeric', month: 'short', year: '2-digit' };
    let formattedDate = new Date(date).toLocaleDateString('th-TH', options);
    formattedDate = formattedDate.replace(/ /g, ' ').replace(/\./g, '');
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const day = padZero(formattedDate.split(' ')[0]);
    const month = months[new Date(date).getMonth()];
    const yearCE = new Date(date).getFullYear();
    const yearBE = (yearCE + 543).toString().substring(2); 
    return `${day} ${month} ${yearBE}`;
}

function generateUniqueID() {
    const now = new Date(document.getElementById('datetime')?.value || new Date());
    const year = (now.getFullYear() % 100).toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const time = `${padZero(now.getHours())}${padZero(now.getMinutes())}`;
    const randomPart = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    return `${year}${month}${day}${time}${randomPart}`;
}

function loadImage(src) {
    return new Promise((resolve) => {
        if (!src) { resolve(null); return; }
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

window.autoFormatAccount = function() {
    const bank = document.getElementById('bank')?.value;
    const accInput = document.getElementById('receiveraccount');
    if (!bank || !accInput) return;
    let rawVal = accInput.value.replace(/[^0-9]/g, '');
    if (rawVal.length === 0) return;
    if (bank === 'ธนาคารออมสิน' || bank === 'ธ.ออมสิน' || bank === 'GSB' || 
        bank === 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร' || bank === 'ธ.ก.ส.' || bank === 'BAAC' || 
        rawVal.length === 12) {
        let clean = rawVal.padStart(12, '0');
        accInput.value = `XXXX-XXXX${clean.substring(8, 11)}-${clean.slice(-1)}`;
    } 
    else {
        let clean = rawVal.padStart(10, '0');
        accInput.value = `XX-XXXX${clean.substring(6, 9)}-${clean.slice(-1)}`;
    }
    if (typeof updateDisplay === 'function') {
        updateDisplay();
    }
};

window.updateDisplay = async function() {
    const sendername = document.getElementById('sendername')?.value || '-';
    const senderaccount = document.getElementById('senderaccount')?.value || '-';
    const receivername = document.getElementById('receivername')?.value || '-';
    const receiveraccount = document.getElementById('receiveraccount')?.value || '-';
    const bank = document.getElementById('bank')?.value || '-';
    const amount11 = document.getElementById('amount11')?.value || '0.00';
    const datetime = document.getElementById('datetime')?.value || '-';
    
    const noteToggleElem = document.getElementById('modeSwitch');
    const isNoteMode = noteToggleElem ? noteToggleElem.checked : false;
    const AideMemoire = document.getElementById('AideMemoire') ? document.getElementById('AideMemoire').value : '-';
    
    const selectedImage = document.getElementById('imageSelect')?.value || '';
    const QRCode = document.getElementById('QRCode')?.value || '';

    let bankLogoUrl = '';
    switch (bank) {
        case 'ธ.กสิกรไทย': bankLogoUrl = 'assets/image/logo/KBANK.png'; break;
        case 'ธ.กรุงไทย': bankLogoUrl = 'assets/image/logo/KTB.png'; break;
        case 'ธ.กรุงเทพ': bankLogoUrl = 'assets/image/logo/BBL1.png'; break;
        case 'ธ.ไทยพาณิชย์': bankLogoUrl = 'assets/image/logo/SCB1.png'; break;
        case 'ธ.กรุงศรีอยุธยา': bankLogoUrl = 'assets/image/logo/BAY.png'; break;
        case 'ธ.ทหารไทยธนชาต': bankLogoUrl = 'assets/image/logo/TTB1.png'; break;
        case 'ธ.ออมสิน': bankLogoUrl = 'assets/image/logo/O.png'; break;
        case 'ธ.ก.ส.': bankLogoUrl = 'assets/image/logo/T.png'; break;
        case 'ธ.อาคารสงเคราะห์': bankLogoUrl = 'assets/image/logo/C.png'; break;
        case 'ธ.เกียรตินาคินภัทร': bankLogoUrl = 'assets/image/logo/K.png'; break;
        case 'ธ.ซีไอเอ็มบีไทย': bankLogoUrl = 'assets/image/logo/C-CIMB.png'; break;
        case 'ธ.ยูโอบี': bankLogoUrl = 'assets/image/logo/UOB.png'; break;
        case 'ธ.แลนด์ แอนด์ เฮาส์': bankLogoUrl = 'assets/image/logo/LHBANK.png'; break;
        case 'ธ.ไอซีบีซี': bankLogoUrl = 'assets/image/logo/ICBC.png'; break;
        case 'พร้อมเพย์': bankLogoUrl = 'assets/image/logo/P-Krungsri.png'; break;
        case 'พร้อมเพย์วอลเล็ท': bankLogoUrl = 'assets/image/logo/P-Krungsri1.png'; break;
        case 'MetaAds': bankLogoUrl = 'assets/image/logo/Meta3.png'; break;
        default: bankLogoUrl = '';
    }

    const formattedDate = formatDate(datetime);
    let formattedTime = '';
    if (datetime && datetime !== '-') {
        const d = new Date(datetime);
        if (!isNaN(d.getTime())) formattedTime = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    }

    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let backgroundImageSrc = isNoteMode ? 'assets/image/bs/C1T.jpg' : 'assets/image/bs/C1.jpg';
    canvas.width = isNoteMode ? 899 : 922;
    canvas.height = 1280;

    const [bgImg, bankLogoImg, customStickerImg, cimbLogoImg] = await Promise.all([
        loadImage(backgroundImageSrc),
        loadImage(bankLogoUrl),
        loadImage((selectedImage && !selectedImage.includes('NO.png')) ? selectedImage : null),
        loadImage('assets/image/logo/C-CIMB.png')
    ]);

    if (bgImg) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff4d4f'; ctx.font = '20px SukhumvitSetSemiBold';
        ctx.fillText('❌ หาไฟล์พื้นหลังไม่เจอ!', 50, canvas.height / 2);
    }

    if (isNoteMode) {
        if(bankLogoImg) ctx.drawImage(bankLogoImg, 32, 621, 118, 118); 
        if(cimbLogoImg) ctx.drawImage(cimbLogoImg, 32, 401, 118, 118);
        
        drawText(ctx, `${formattedDate} - ${formattedTime} น.`, 41.7, 336.5, 36, 'SukhumvitSetLight', '#a0a0a0', 'left', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${sendername}`, 182, 450.0, 40, 'SukhumvitSetMedium', '#0f0f0f', 'left', 1.5, 3, 0, 0, 800, 0.25);
        drawText(ctx, `${senderaccount}`, 182, 505.3, 35, 'SukhumvitSetMedium', '#585858', 'left', 1.5, 1, 0, 0, 500, 0.25);
        
        drawText(ctx, `${receivername}`, 182, 670.3, 40, 'SukhumvitSetMedium', '#0f0f0f', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${receiveraccount}`, 182, 725.5, 35, 'SukhumvitSetMedium', '#585858', 'left', 1.5, 1, 0, 0, 500, 0.25);
        
        drawText(ctx, `฿ ${amount11}`, 860, 867.3, 46, 'SukhumvitSetSemiBold', '#000000', 'right', 1.5, 3, 0, 0, 500, 0);

        drawText(ctx, `${generateUniqueID()}`, 41.7, 1035.3, 30, 'SukhumvitSetMedium', '#6a6a6a', 'left', 1.5, 3, 0, 0, 500, 0);
        drawText(ctx, `฿ 0.00`, 41.7, 1130.5, 30, 'SukhumvitSetMedium', '#6a6a6a', 'left', 1.5, 3, 0, 0, 500, 0);
        drawText(ctx, `${AideMemoire}`, 41.7, 1226.4, 30, 'SukhumvitSetMedium', '#6a6a6a', 'left', 1.5, 3, 0, 0, 500, 0);
    } else {
        if(bankLogoImg) ctx.drawImage(bankLogoImg, 32.5, 638, 120, 120); 
        if(cimbLogoImg) ctx.drawImage(cimbLogoImg, 32.5, 412.5, 120, 120);
        
        drawText(ctx, `${formattedDate} - ${formattedTime} น.`, 41.7, 345, 36, 'SukhumvitSetLight', '#a0a0a0', 'left', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${sendername}`, 186.3, 461.0, 40, 'SukhumvitSetMedium', '#0f0f0f', 'left', 1.5, 3, 0, 0, 800, 0.25);
        drawText(ctx, `${senderaccount}`, 186.3, 518.2, 35, 'SukhumvitSetMedium', '#585858', 'left', 1.5, 1, 0, 0, 500, 0.25);
        
        drawText(ctx, `${receivername}`, 186.3, 687.5, 40, 'SukhumvitSetMedium', '#0f0f0f', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${receiveraccount}`, 186.3, 744.6, 35, 'SukhumvitSetMedium', '#585858', 'left', 1.5, 1, 0, 0, 500, 0.25);
        
        drawText(ctx, `฿ ${amount11}`, 881, 890, 46, 'SukhumvitSetSemiBold', '#000000', 'right', 1.5, 3, 0, 0, 500, 0);

        drawText(ctx, `${generateUniqueID()}`, 41.7, 1064.4, 31, 'SukhumvitSetMedium', '#6a6a6a', 'left', 1.5, 3, 0, 0, 500, 0);
        drawText(ctx, `฿ 0.00`, 41.7, 1161.5, 31, 'SukhumvitSetMedium', '#6a6a6a', 'left', 1.5, 3, 0, 0, 500, 0);
    }

    drawText(ctx, `${QRCode}`, 238.9, 599.0, 40, 'SukhumvitSetMedium', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);

    if (customStickerImg) {
        ctx.drawImage(customStickerImg, 0, 0, canvas.width, canvas.height); 
    }
};

function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.shadowColor = shadowColor || 'transparent';
    ctx.shadowBlur = shadowBlur || 0;

    const paragraphs = text.split('<br>');
    let currentY = y;

    paragraphs.forEach(paragraph => {
        const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
        const words = [...segmenter.segment(paragraph)].map(segment => segment.segment);

        let lines = [];
        let currentLine = '';

        words.forEach((word) => {
            const testLine = currentLine + word;
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

            if (testWidth > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        if (currentLine) {
            lines.push(currentLine.trimStart());
        }

        lines.forEach((line, index) => {
            let currentX = x;
            if (align === 'center') {
                currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2;
            } else if (align === 'right') {
                currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
            }

            drawTextLine(ctx, line, currentX, currentY, letterSpacing);
            currentY += lineHeight;
            if (maxLines && index >= maxLines - 1) return;
        });
        currentY += lineHeight;
    });
}

function drawTextLine(ctx, text, x, y, letterSpacing) {
    if (!letterSpacing) {
        ctx.fillText(text, x, y);
        return;
    }

    const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
    const characters = [...segmenter.segment(text)].map(segment => segment.segment);
    let currentPosition = x;

    characters.forEach((char) => {
        ctx.fillText(char, currentPosition, y);
        const charWidth = ctx.measureText(char).width;
        currentPosition += charWidth + letterSpacing;
    });
}

window.downloadImage = function() {
    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'cimb_slip.png';
    link.click();
}