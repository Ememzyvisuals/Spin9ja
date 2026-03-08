// Anti-Cheat System - Device Fingerprinting & Fraud Detection

export interface DeviceFingerprint {
  fingerprint: string;
  components: {
    screen: string;
    timezone: string;
    language: string;
    platform: string;
    hardware: string;
    webgl: string;
    canvas: string;
    audio: string;
  };
}

// Generate a unique device fingerprint
export const generateFingerprint = async (): Promise<DeviceFingerprint> => {
  const components = {
    screen: getScreenFingerprint(),
    timezone: getTimezoneFingerprint(),
    language: getLanguageFingerprint(),
    platform: getPlatformFingerprint(),
    hardware: getHardwareFingerprint(),
    webgl: getWebGLFingerprint(),
    canvas: await getCanvasFingerprint(),
    audio: await getAudioFingerprint(),
  };

  const combinedString = Object.values(components).join('|');
  const fingerprint = await hashString(combinedString);

  return { fingerprint, components };
};

// Screen resolution and color depth
const getScreenFingerprint = (): string => {
  const { width, height, colorDepth, pixelDepth } = window.screen;
  const { devicePixelRatio } = window;
  return `${width}x${height}x${colorDepth}x${pixelDepth}x${devicePixelRatio}`;
};

// Timezone
const getTimezoneFingerprint = (): string => {
  const offset = new Date().getTimezoneOffset();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `${offset}|${timezone}`;
};

// Language preferences
const getLanguageFingerprint = (): string => {
  const { language, languages } = navigator;
  return `${language}|${(languages || []).join(',')}`;
};

// Platform info
const getPlatformFingerprint = (): string => {
  const { platform, vendor, maxTouchPoints } = navigator;
  const ua = navigator.userAgent;
  return `${platform}|${vendor}|${maxTouchPoints}|${ua.length}`;
};

// Hardware info
const getHardwareFingerprint = (): string => {
  const { hardwareConcurrency, deviceMemory } = navigator as any;
  return `${hardwareConcurrency || 0}|${deviceMemory || 0}`;
};

// WebGL renderer info
const getWebGLFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    if (!gl) return 'no-webgl';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'no-debug-info';

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return `${vendor}|${renderer}`;
  } catch {
    return 'webgl-error';
  }
};

// Canvas fingerprint
const getCanvasFingerprint = async (): Promise<string> => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Spin9ja 🇳🇬', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Spin9ja 🇳🇬', 4, 17);

    const dataUrl = canvas.toDataURL();
    return await hashString(dataUrl);
  } catch {
    return 'canvas-error';
  }
};

// Audio fingerprint
const getAudioFingerprint = async (): Promise<string> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);

    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(0);

    const fingerprint = await new Promise<string>((resolve) => {
      scriptProcessor.onaudioprocess = (event) => {
        const data = event.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          sum += Math.abs(data[i]);
        }
        resolve(sum.toString());
      };

      setTimeout(() => resolve('audio-timeout'), 100);
    });

    oscillator.stop();
    audioContext.close();

    return fingerprint;
  } catch {
    return 'audio-error';
  }
};

// Hash a string using SHA-256
const hashString = async (str: string): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback to simple hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
};

// Check for automated browsers
export const isAutomatedBrowser = (): boolean => {
  const checks = [
    'webdriver' in navigator,
    '__webdriver_evaluate' in document,
    '__selenium_evaluate' in document,
    '__webdriver_script_function' in document,
    '__webdriver_script_func' in document,
    '__webdriver_script_fn' in document,
    '__fxdriver_evaluate' in document,
    '__driver_unwrapped' in document,
    '__webdriver_unwrapped' in document,
    '__driver_evaluate' in document,
    '__selenium_unwrapped' in document,
    '__fxdriver_unwrapped' in document,
    (navigator as any).webdriver === true,
    (window as any).callPhantom !== undefined,
    (window as any)._phantom !== undefined,
    (window as any).phantom !== undefined,
  ];

  return checks.some(check => check === true);
};

// Check for incognito/private mode
export const isIncognito = async (): Promise<boolean> => {
  try {
    const storage = window.localStorage;
    storage.setItem('test', 'test');
    storage.removeItem('test');
    
    // Check storage quota (reduced in incognito)
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const { quota } = await navigator.storage.estimate();
      if (quota && quota < 120000000) return true;
    }
    
    return false;
  } catch {
    return true;
  }
};

// Calculate fraud score (0-100)
export const calculateFraudScore = async (
  existingDevice: boolean,
  sameIPCount: number,
  isSelfReferral: boolean
): Promise<number> => {
  let score = 0;

  // Device already registered
  if (existingDevice) score += 40;

  // Multiple accounts on same IP
  if (sameIPCount > 0) score += Math.min(sameIPCount * 10, 30);

  // Self-referral attempt
  if (isSelfReferral) score += 50;

  // Automated browser
  if (isAutomatedBrowser()) score += 30;

  // Incognito mode
  if (await isIncognito()) score += 10;

  return Math.min(score, 100);
};

// Get client IP (approximate, for grouping)
export const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
};

// Store fingerprint locally
export const storeFingerprint = (fingerprint: string): void => {
  try {
    localStorage.setItem('spin9ja_device', fingerprint);
  } catch {
    // Storage not available
  }
};

// Get stored fingerprint
export const getStoredFingerprint = (): string | null => {
  try {
    return localStorage.getItem('spin9ja_device');
  } catch {
    return null;
  }
};
