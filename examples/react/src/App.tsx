import { useEffect, useState } from 'react';
import { BugSpotter } from '@bugspotter/core';

let bugSpotter: BugSpotter;

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState<string>('Not initialized');

  useEffect(() => {
    initializeBugSpotter();
  }, []);

  const initializeBugSpotter = async () => {
    try {
      bugSpotter = new BugSpotter({
        apiKey: 'demo-api-key',
        endpoint: 'https://demo.bugspotter.com', // Replace with your endpoint
        sessionReplay: true,
        enableScreenshots: true,
        enableConsoleCapture: true,
        onReady: () => {
          setStatus('BugSpotter initialized and ready');
          setIsInitialized(true);
        },
        onError: (error: Error) => {
          setStatus(`BugSpotter error: ${error.message}`);
        }
      });

      await bugSpotter.init();
    } catch (error) {
      setStatus(`Failed to initialize BugSpotter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const simulateError = () => {
    throw new Error('This is a simulated error for testing BugSpotter!');
  };

  const reportManualBug = async () => {
    if (!bugSpotter) return;

    try {
      const reportId = await bugSpotter.reportBug({
        title: 'Manual Bug Report',
        description: 'This is a manually reported bug from the React example',
        severity: 'medium',
        tags: ['manual', 'react-example'],
        customData: {
          component: 'App',
          timestamp: new Date().toISOString(),
          userAction: 'Manual report button clicked'
        }
      });
      setStatus(`Bug reported successfully! Report ID: ${reportId}`);
    } catch (error) {
      setStatus(`Failed to report bug: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const captureScreenshot = async () => {
    if (!bugSpotter) return;

    try {
      const screenshot = await bugSpotter.captureScreenshot();
      setStatus(`Screenshot captured: ${screenshot.length} bytes`);
    } catch (error) {
      setStatus(`Failed to capture screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container">
      <h1>BugSpotter React Example</h1>
      
      <div className="status">
        <h3>Status</h3>
        <p>{status}</p>
      </div>

      <div>
        <h3>Demo Actions</h3>
        <button 
          onClick={reportManualBug} 
          disabled={!isInitialized}
        >
          Report Manual Bug
        </button>
        
        <button 
          onClick={captureScreenshot} 
          disabled={!isInitialized}
        >
          Capture Screenshot
        </button>
        
        <button 
          className="danger" 
          onClick={simulateError}
        >
          Simulate Error (Will be auto-reported)
        </button>
      </div>

      <div className="error-demo">
        <h3>Error Boundary Test</h3>
        <p>Click the "Simulate Error" button to test automatic error reporting.</p>
        <p>BugSpotter will automatically capture the error, take a screenshot, and send a bug report.</p>
      </div>

      <div>
        <h3>Features Demonstrated</h3>
        <ul>
          <li>✅ Automatic initialization</li>
          <li>✅ Manual bug reporting</li>
          <li>✅ Screenshot capture</li>
          <li>✅ Session replay (automatic)</li>
          <li>✅ Error boundary integration</li>
          <li>✅ Custom metadata</li>
        </ul>
      </div>
    </div>
  );
}

export default App;