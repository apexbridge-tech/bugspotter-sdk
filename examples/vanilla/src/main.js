import { BugSpotter } from '@bugspotter/core';

let bugSpotter;
let isInitialized = false;

// DOM elements
const statusElement = document.getElementById('status');
const reportBugButton = document.getElementById('report-bug');
const captureScreenshotButton = document.getElementById('capture-screenshot');
const simulateErrorButton = document.getElementById('simulate-error');

// Update status
function updateStatus(message) {
    if (statusElement) {
        statusElement.textContent = message;
    }
    console.log('BugSpotter Status:', message);
}

// Initialize BugSpotter
async function initializeBugSpotter() {
    try {
        bugSpotter = new BugSpotter({
            apiKey: 'demo-api-key',
            endpoint: 'https://demo.bugspotter.com', // Replace with your endpoint
            sessionReplay: true,
            enableScreenshots: true,
            enableConsoleCapture: true,
            onReady: () => {
                updateStatus('BugSpotter initialized and ready');
                isInitialized = true;
                enableButtons();
            },
            onError: (error) => {
                updateStatus(`BugSpotter error: ${error.message}`);
            }
        });

        await bugSpotter.init();
    } catch (error) {
        updateStatus(`Failed to initialize BugSpotter: ${error.message}`);
    }
}

// Enable buttons after initialization
function enableButtons() {
    if (reportBugButton) reportBugButton.disabled = false;
    if (captureScreenshotButton) captureScreenshotButton.disabled = false;
}

// Simulate an error for testing
function simulateError() {
    throw new Error('This is a simulated error for testing BugSpotter!');
}

// Report a manual bug
async function reportManualBug() {
    if (!bugSpotter) return;

    try {
        const reportId = await bugSpotter.reportBug({
            title: 'Manual Bug Report',
            description: 'This is a manually reported bug from the Vanilla JS example',
            severity: 'medium',
            tags: ['manual', 'vanilla-example'],
            customData: {
                component: 'VanillaJS App',
                timestamp: new Date().toISOString(),
                userAction: 'Manual report button clicked'
            }
        });
        updateStatus(`Bug reported successfully! Report ID: ${reportId}`);
    } catch (error) {
        updateStatus(`Failed to report bug: ${error.message}`);
    }
}

// Capture a screenshot
async function captureScreenshot() {
    if (!bugSpotter) return;

    try {
        const screenshot = await bugSpotter.captureScreenshot();
        updateStatus(`Screenshot captured: ${screenshot.length} bytes`);
    } catch (error) {
        updateStatus(`Failed to capture screenshot: ${error.message}`);
    }
}

// Set up event listeners
function setupEventListeners() {
    if (reportBugButton) {
        reportBugButton.addEventListener('click', reportManualBug);
    }
    
    if (captureScreenshotButton) {
        captureScreenshotButton.addEventListener('click', captureScreenshot);
    }
    
    if (simulateErrorButton) {
        simulateErrorButton.addEventListener('click', simulateError);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeBugSpotter();
});