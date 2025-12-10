// Mailchimp Newsletter Subscription Handler

// HTML sanitization function to prevent XSS
function sanitizeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// URL sanitization function to prevent javascript: and data: URLs
function sanitizeUrl(url) {
    if (typeof url !== 'string') return '';
    const trimmedUrl = url.trim().toLowerCase();
    if (trimmedUrl.startsWith('javascript:') || trimmedUrl.startsWith('data:') || trimmedUrl.startsWith('vbscript:')) {
        return '#';
    }
    return url;
}

// Get browser language
const getBrowserLanguage = () => {
    if (!window?.navigator?.language?.split('-')[1]) {
        return window?.navigator?.language?.toUpperCase();
    }
    return window?.navigator?.language?.split('-')[1];
};

// Get default country program
function getDefaultCountryProgram(defaultCountryCode, smsProgramData) {
    if (!smsProgramData || smsProgramData.length === 0) {
        return null;
    }

    const browserLanguage = getBrowserLanguage();

    if (browserLanguage) {
        const foundProgram = smsProgramData.find(
            (program) => program?.countryCode === browserLanguage,
        );
        if (foundProgram) {
            return foundProgram;
        }
    }

    if (defaultCountryCode) {
        const foundProgram = smsProgramData.find(
            (program) => program?.countryCode === defaultCountryCode,
        );
        if (foundProgram) {
            return foundProgram;
        }
    }

    return smsProgramData[0];
}

// Get country unicode flag
function getCountryUnicodeFlag(countryCode) {
    return countryCode.toUpperCase().replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
}

// Get country name
function getCountryName(countryCode) {
    if (window.MC?.smsPhoneData?.smsProgramDataCountryNames && Array.isArray(window.MC.smsPhoneData.smsProgramDataCountryNames)) {
        for (let i = 0; i < window.MC.smsPhoneData.smsProgramDataCountryNames.length; i++) {
            if (window.MC.smsPhoneData.smsProgramDataCountryNames[i].code === countryCode) {
                return window.MC.smsPhoneData.smsProgramDataCountryNames[i].name;
            }
        }
    }
    return countryCode;
}

// Generate dropdown options
function generateDropdownOptions(smsProgramData) {
    if (!smsProgramData || smsProgramData.length === 0) {
        return '';
    }
    
    return smsProgramData.map(program => {
        const flag = getCountryUnicodeFlag(program.countryCode);
        const countryName = getCountryName(program.countryCode);
        const callingCode = program.countryCallingCode || '';
        const sanitizedCountryCode = sanitizeHtml(program.countryCode || '');
        const sanitizedCountryName = sanitizeHtml(countryName || '');
        const sanitizedCallingCode = sanitizeHtml(callingCode || '');
        return '<option value="' + sanitizedCountryCode + '">' + sanitizedCountryName + ' ' + sanitizedCallingCode + '</option>';
    }).join('');
}

// Get default placeholder
function getDefaultPlaceholder(countryCode) {
    const mockPlaceholders = [
        { countryCode: 'US', placeholder: '+1 000 000 0000', helpText: 'Include the US country code +1 before the phone number' },
        { countryCode: 'GB', placeholder: '+44 0000 000000', helpText: 'Include the GB country code +44 before the phone number' },
        { countryCode: 'CA', placeholder: '+1 000 000 0000', helpText: 'Include the CA country code +1 before the phone number' },
        { countryCode: 'AU', placeholder: '+61 000 000 000', helpText: 'Include the AU country code +61 before the phone number' },
    ];

    if (!countryCode || typeof countryCode !== 'string') {
        return mockPlaceholders[0].placeholder;
    }
    
    const selectedPlaceholder = mockPlaceholders.find((item) => item && item.countryCode === countryCode);
    return selectedPlaceholder ? selectedPlaceholder.placeholder : mockPlaceholders[0].placeholder;
}

// Update placeholder
function updatePlaceholder(countryCode, fieldName) {
    if (!countryCode || !fieldName) {
        return;
    }
    
    const phoneInput = document.querySelector('#mce-' + fieldName);
    if (!phoneInput) {
        return;
    }
    
    const placeholder = getDefaultPlaceholder(countryCode);
    if (placeholder) {
        phoneInput.placeholder = placeholder;
    }
}

// Update SMS legal text
function updateSmsLegalText(countryCode, fieldName) {
    if (!countryCode || !fieldName) {
        return;
    }
    
    const programs = window?.MC?.smsPhoneData?.programs;
    if (!programs || !Array.isArray(programs)) {
        return;
    }
    
    const program = programs.find(program => program?.countryCode === countryCode);
    if (!program || !program.requiredTemplate) {
        return;
    }
    
    const legalTextElement = document.querySelector('#legal-text-' + fieldName);
    if (!legalTextElement) {
        return;
    }
    
    const divRegex = new RegExp('</?[div][^>]*>', 'gi');
    const fullAnchorRegex = new RegExp('<a.*?</a>', 'g');
    const anchorRegex = new RegExp('<a href="(.*?)" target="(.*?)">(.*?)</a>');
    
    const requiredLegalText = program.requiredTemplate
        .replace(divRegex, '')
        .replace(fullAnchorRegex, '')
        .slice(0, -1);
    
    const anchorMatches = program.requiredTemplate.match(anchorRegex);
    
    if (anchorMatches && anchorMatches.length >= 4) {
        const linkElement = document.createElement('a');
        linkElement.href = sanitizeUrl(anchorMatches[1]);
        linkElement.target = sanitizeHtml(anchorMatches[2]);
        linkElement.textContent = sanitizeHtml(anchorMatches[3]);
        
        legalTextElement.textContent = requiredLegalText + ' ';
        legalTextElement.appendChild(linkElement);
        legalTextElement.appendChild(document.createTextNode('.'));
    } else {
        legalTextElement.textContent = requiredLegalText + '.';
    }
}

// Initialize SMS phone dropdown
function initializeSmsPhoneDropdown(fieldName) {
    if (!fieldName || typeof fieldName !== 'string') {
        return;
    }
    
    const dropdown = document.querySelector('#country-select-' + fieldName);
    const displayFlag = document.querySelector('#flag-display-' + fieldName);
    
    if (!dropdown || !displayFlag) {
        return;
    }

    const smsPhoneData = window.MC?.smsPhoneData;
    if (smsPhoneData && smsPhoneData.programs && Array.isArray(smsPhoneData.programs)) {
        dropdown.innerHTML = generateDropdownOptions(smsPhoneData.programs);
    }

    const defaultProgram = getDefaultCountryProgram(smsPhoneData?.defaultCountryCode, smsPhoneData?.programs);
    if (defaultProgram && defaultProgram.countryCode) {
        dropdown.value = defaultProgram.countryCode;
        
        const flagSpan = displayFlag?.querySelector('#flag-emoji-' + fieldName);
        if (flagSpan) {
            flagSpan.textContent = getCountryUnicodeFlag(defaultProgram.countryCode);
            flagSpan.setAttribute('aria-label', sanitizeHtml(defaultProgram.countryCode) + ' flag');
        }
        
        updateSmsLegalText(defaultProgram.countryCode, fieldName);
        updatePlaceholder(defaultProgram.countryCode, fieldName);
    }

    displayFlag?.addEventListener('click', function(e) {
        dropdown.focus();
    });

    dropdown?.addEventListener('change', function() {
        const selectedCountry = this.value;
        
        if (!selectedCountry || typeof selectedCountry !== 'string') {
            return;
        }
        
        const flagSpan = displayFlag?.querySelector('#flag-emoji-' + fieldName);
        if (flagSpan) {
            flagSpan.textContent = getCountryUnicodeFlag(selectedCountry);
            flagSpan.setAttribute('aria-label', sanitizeHtml(selectedCountry) + ' flag');
        }

        updateSmsLegalText(selectedCountry, fieldName);
        updatePlaceholder(selectedCountry, fieldName);
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    const smsPhoneFields = document.querySelectorAll('[id^="country-select-"]');
    
    smsPhoneFields.forEach(function(dropdown) {
        const fieldName = dropdown?.id.replace('country-select-', '');
        initializeSmsPhoneDropdown(fieldName);
    });
    
    // Integrate simple signup form UI enhancements (styling + submit state)
    function enhanceSignupForm(formId){
        const form = document.getElementById(formId);
        if(!form) return;

        const btn = form.querySelector('button[type="submit"]');
        if(btn){
            // Ensure button uses site styles (in case loaded separately)
            btn.classList.add('btn');
            // Make sure input uses form styles
            const email = form.querySelector('input[type="email"]');
            if(email) email.classList.add('');

            // Add simple UX for submit: show loading state, then restore
            form.addEventListener('submit', function(e){
                // Avoid interfering if another handler prevents submission
                try{
                    btn.disabled = true;
                    const originalText = btn.textContent;
                    btn.textContent = 'Sending...';
                    btn.setAttribute('aria-busy','true');
                    // restore after a short delay; real submission/reset handled elsewhere
                    setTimeout(()=>{
                        btn.disabled = false;
                        btn.textContent = originalText;
                        btn.removeAttribute('aria-busy');
                    }, 1200);
                }catch(err){
                    // ignore
                }
            });
        }
    }

    // Enhance both signup areas if present
    enhanceSignupForm('signup');
    enhanceSignupForm('cta');
});
