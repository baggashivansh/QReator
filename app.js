// Initialize utilities
const toast = new Toast();
const themeManager = new ThemeManager();
const historyManager = new HistoryManager();

// Application State
const state = {
  currentType: 'url',
  qrCode: null,
  currentCanvas: null,
  currentContent: null,
  settings: {
    size: 256,
    fgColor: '#000000',
    bgColor: '#ffffff',
    errorLevel: 'M',
    logo: null
  }
};

// DOM Elements
const elements = {
  // Tabs
  tabs: document.querySelectorAll('.tab-btn'),
  formSections: document.querySelectorAll('.form-section'),
  
  // Forms
  urlInput: document.getElementById('urlInput'),
  textInput: document.getElementById('textInput'),
  emailAddress: document.getElementById('emailAddress'),
  emailSubject: document.getElementById('emailSubject'),
  emailBody: document.getElementById('emailBody'),
  phoneNumber: document.getElementById('phoneNumber'),
  smsNumber: document.getElementById('smsNumber'),
  smsMessage: document.getElementById('smsMessage'),
  wifiSSID: document.getElementById('wifiSSID'),
  wifiPassword: document.getElementById('wifiPassword'),
  wifiSecurity: document.getElementById('wifiSecurity'),
  wifiHidden: document.getElementById('wifiHidden'),
  
  // Customization
  qrSize: document.getElementById('qrSize'),
  sizeValue: document.getElementById('sizeValue'),
  fgColor: document.getElementById('fgColor'),
  bgColor: document.getElementById('bgColor'),
  errorLevel: document.getElementById('errorLevel'),
  logoUpload: document.getElementById('logoUpload'),
  logoPreview: document.getElementById('logoPreview'),
  
  // Actions
  generateBtn: document.getElementById('generateBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  shareBtn: document.getElementById('shareBtn'),
  copyBtn: document.getElementById('copyBtn'),
  
  // Preview
  qrPreview: document.getElementById('qrPreview'),
  qrActions: document.getElementById('qrActions'),
  
  // Theme
  themeToggle: document.getElementById('themeToggle'),
  
  // Modals
  historyBtn: document.getElementById('historyBtn'),
  batchBtn: document.getElementById('batchBtn'),
  scanBtn: document.getElementById('scanBtn'),
  historyModal: document.getElementById('historyModal'),
  batchModal: document.getElementById('batchModal'),
  scanModal: document.getElementById('scanModal'),
  historyList: document.getElementById('historyList'),
  batchInput: document.getElementById('batchInput'),
  batchGenerateBtn: document.getElementById('batchGenerateBtn'),
  batchResults: document.getElementById('batchResults'),
  scanUpload: document.getElementById('scanUpload'),
  scanResult: document.getElementById('scanResult')
};

// Tab Switching
elements.tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const type = tab.dataset.type;
    
    // Update active tab
    elements.tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Update active form
    elements.formSections.forEach(section => section.classList.remove('active'));
    const formId = `${type}Form`;
    const activeForm = document.getElementById(formId);
    if (activeForm) {
      activeForm.classList.add('active');
    }
    
    state.currentType = type;
  });
});

// Size Slider
elements.qrSize.addEventListener('input', (e) => {
  state.settings.size = parseInt(e.target.value);
  elements.sizeValue.textContent = state.settings.size;
});

// Color Pickers
elements.fgColor.addEventListener('change', (e) => {
  state.settings.fgColor = e.target.value;
});

elements.bgColor.addEventListener('change', (e) => {
  state.settings.bgColor = e.target.value;
});

// Error Level
elements.errorLevel.addEventListener('change', (e) => {
  state.settings.errorLevel = e.target.value;
});

// Logo Upload
elements.logoUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      state.settings.logo = event.target.result;
      elements.logoPreview.innerHTML = `<img src="${event.target.result}" alt="Logo preview">`;
      elements.logoPreview.classList.add('active');
    };
    reader.readAsDataURL(file);
  }
});

// Get Form Data
function getFormData() {
  switch (state.currentType) {
    case 'url':
      return { url: elements.urlInput.value };
    case 'text':
      return { text: elements.textInput.value };
    case 'email':
      return {
        email: elements.emailAddress.value,
        subject: elements.emailSubject.value,
        body: elements.emailBody.value
      };
    case 'phone':
      return { phone: elements.phoneNumber.value };
    case 'sms':
      return {
        phone: elements.smsNumber.value,
        message: elements.smsMessage.value
      };
    case 'wifi':
      return {
        ssid: elements.wifiSSID.value,
        password: elements.wifiPassword.value,
        security: elements.wifiSecurity.value,
        hidden: elements.wifiHidden.checked
      };
    default:
      return {};
  }
}

// Validate Form Data
function validateFormData(data) {
  switch (state.currentType) {
    case 'url':
      if (!Validator.url(data.url)) {
        toast.error('Please enter a valid URL');
        return false;
      }
      break;
    case 'text':
      if (!Validator.notEmpty(data.text)) {
        toast.error('Please enter some text');
        return false;
      }
      break;
    case 'email':
      if (!Validator.email(data.email)) {
        toast.error('Please enter a valid email address');
        return false;
      }
      break;
    case 'phone':
      if (!Validator.phone(data.phone)) {
        toast.error('Please enter a valid phone number');
        return false;
      }
      break;
    case 'sms':
      if (!Validator.phone(data.phone)) {
        toast.error('Please enter a valid phone number');
        return false;
      }
      break;
    case 'wifi':
      if (!Validator.notEmpty(data.ssid)) {
        toast.error('Please enter a network name (SSID)');
        return false;
      }
      break;
  }
  return true;
}

// Generate QR Code Content
function generateContent(data) {
  switch (state.currentType) {
    case 'url':
      return ContentGenerator.url(data);
    case 'text':
      return ContentGenerator.text(data);
    case 'email':
      return ContentGenerator.email(data);
    case 'phone':
      return ContentGenerator.phone(data);
    case 'sms':
      return ContentGenerator.sms(data);
    case 'wifi':
      return ContentGenerator.wifi(data);
    default:
      return '';
  }
}

// Generate QR Code
elements.generateBtn.addEventListener('click', () => {
  const data = getFormData();
  
  if (!validateFormData(data)) {
    return;
  }
  
  const content = generateContent(data);
  state.currentContent = content;
  
  // Clear previous QR code
  elements.qrPreview.innerHTML = '';
  
  // Create container for QR code
  const qrContainer = document.createElement('div');
  qrContainer.style.display = 'inline-block';
  qrContainer.style.position = 'relative';
  elements.qrPreview.appendChild(qrContainer);
  
  // Generate QR code
  try {
    state.qrCode = new QRCode(qrContainer, {
      text: content,
      width: state.settings.size,
      height: state.settings.size,
      colorDark: state.settings.fgColor,
      colorLight: state.settings.bgColor,
      correctLevel: QRCode.CorrectLevel[state.settings.errorLevel]
    });
    
    // Get the canvas
    setTimeout(() => {
      const canvas = qrContainer.querySelector('canvas');
      if (canvas) {
        state.currentCanvas = canvas;
        
        // Add logo if provided
        if (state.settings.logo) {
          addLogoToCanvas(canvas, state.settings.logo);
        }
        
        // Show action buttons
        elements.qrActions.style.display = 'flex';
        
        // Add to history
        historyManager.add({
          type: state.currentType,
          content: content,
          data: data
        });
        
        toast.success('QR Code generated successfully!');
      }
    }, 100);
  } catch (error) {
    toast.error('Error generating QR code');
    console.error(error);
  }
});

// Add Logo to Canvas
function addLogoToCanvas(canvas, logoSrc) {
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = () => {
    const logoSize = canvas.width * 0.2;
    const x = (canvas.width - logoSize) / 2;
    const y = (canvas.height - logoSize) / 2;
    
    // Draw white background for logo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
    
    // Draw logo
    ctx.drawImage(img, x, y, logoSize, logoSize);
  };
  img.src = logoSrc;
}

// Download QR Code
elements.downloadBtn.addEventListener('click', () => {
  if (state.currentCanvas) {
    Downloader.downloadCanvas(state.currentCanvas, `qrcode-${Date.now()}.png`);
    toast.success('QR Code downloaded!');
  }
});

// Share QR Code
elements.shareBtn.addEventListener('click', async () => {
  if (state.currentCanvas) {
    const shared = await Sharing.shareImage(state.currentCanvas, 'QReator QR Code');
    if (shared) {
      toast.success('Shared successfully!');
    } else {
      toast.info('Sharing not supported on this device');
    }
  }
});

// Copy QR Code
elements.copyBtn.addEventListener('click', async () => {
  if (state.currentCanvas) {
    const copied = await Clipboard.copyCanvas(state.currentCanvas);
    if (copied) {
      toast.success('QR Code copied to clipboard!');
    } else {
      toast.error('Failed to copy QR Code');
    }
  }
});

// Theme Toggle
elements.themeToggle.addEventListener('click', () => {
  themeManager.toggle();
  toast.info(`Switched to ${themeManager.getCurrentTheme()} mode`);
});

// History Modal
elements.historyBtn.addEventListener('click', () => {
  showHistory();
  elements.historyModal.classList.add('active');
});

function showHistory() {
  const history = historyManager.getAll();
  elements.historyList.innerHTML = '';
  
  if (history.length === 0) {
    elements.historyList.innerHTML = '<p class="info-text" style="text-align: center; padding: 32px;">No history yet. Generate your first QR code!</p>';
    return;
  }
  
  history.forEach(item => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
      <div class="history-info">
        <div class="history-type">${item.type.toUpperCase()}</div>
        <div class="history-content">${truncate(item.content, 50)}</div>
      </div>
      <div class="history-actions">
        <button class="btn btn-secondary glass-btn" onclick="regenerateFromHistory('${item.id}')" style="padding: 8px 12px; font-size: 12px;">Regenerate</button>
        <button class="btn btn-secondary glass-btn" onclick="deleteFromHistory('${item.id}')" style="padding: 8px 12px; font-size: 12px;">Delete</button>
      </div>
    `;
    elements.historyList.appendChild(historyItem);
  });
}

function truncate(str, length) {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

window.regenerateFromHistory = function(id) {
  const history = historyManager.getAll();
  const item = history.find(h => h.id === id);
  if (item) {
    // Close modal
    elements.historyModal.classList.remove('active');
    
    // Set form data
    state.currentType = item.type;
    
    // Activate correct tab
    elements.tabs.forEach(tab => {
      if (tab.dataset.type === item.type) {
        tab.click();
      }
    });
    
    // Fill form
    const data = item.data;
    switch (item.type) {
      case 'url':
        elements.urlInput.value = data.url;
        break;
      case 'text':
        elements.textInput.value = data.text;
        break;
      case 'email':
        elements.emailAddress.value = data.email;
        elements.emailSubject.value = data.subject || '';
        elements.emailBody.value = data.body || '';
        break;
      case 'phone':
        elements.phoneNumber.value = data.phone;
        break;
      case 'sms':
        elements.smsNumber.value = data.phone;
        elements.smsMessage.value = data.message || '';
        break;
      case 'wifi':
        elements.wifiSSID.value = data.ssid;
        elements.wifiPassword.value = data.password || '';
        elements.wifiSecurity.value = data.security || 'WPA';
        elements.wifiHidden.checked = data.hidden || false;
        break;
    }
    
    toast.success('Form filled from history');
  }
};

window.deleteFromHistory = function(id) {
  historyManager.remove(id);
  showHistory();
  toast.success('Item deleted from history');
};

// Batch Generation
elements.batchBtn.addEventListener('click', () => {
  elements.batchModal.classList.add('active');
});

elements.batchGenerateBtn.addEventListener('click', () => {
  const input = elements.batchInput.value;
  const lines = input.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    toast.error('Please enter at least one URL or text');
    return;
  }
  
  elements.batchResults.innerHTML = '';
  
  lines.forEach((line, index) => {
    const container = document.createElement('div');
    container.className = 'batch-item';
    
    const qrContainer = document.createElement('div');
    qrContainer.style.display = 'inline-block';
    
    try {
      new QRCode(qrContainer, {
        text: line,
        width: 200,
        height: 200,
        colorDark: state.settings.fgColor,
        colorLight: state.settings.bgColor,
        correctLevel: QRCode.CorrectLevel[state.settings.errorLevel]
      });
      
      const label = document.createElement('p');
      label.style.marginTop = '8px';
      label.style.fontSize = '12px';
      label.style.color = 'var(--color-text-secondary)';
      label.textContent = truncate(line, 40);
      
      container.appendChild(qrContainer);
      container.appendChild(label);
      elements.batchResults.appendChild(container);
    } catch (error) {
      console.error('Error generating QR code for:', line);
    }
  });
  
  toast.success(`Generated ${lines.length} QR codes!`);
});

// Scan QR Code
elements.scanBtn.addEventListener('click', () => {
  elements.scanModal.classList.add('active');
});

elements.scanUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    elements.scanResult.classList.add('active');
    elements.scanResult.innerHTML = '<p class="info-text">QR code scanning requires additional libraries. This is a placeholder for future implementation.</p>';
    toast.info('Scan feature coming soon!');
  }
});

// Modal Close Buttons
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const modalId = btn.dataset.modal;
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  });
});

// Modal Overlay Click to Close
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', () => {
    overlay.parentElement.classList.remove('active');
  });
});

// Initialize
console.log('QReator initialized');
toast.success('Welcome to QReator!');