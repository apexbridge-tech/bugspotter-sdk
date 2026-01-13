import { useEffect, useState } from 'react';
import { BugSpotter } from '@bugspotter/sdk';

let bugSpotter: BugSpotter | null = null;

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState<string>('Not initialized');

  useEffect(() => {
    initializeBugSpotter();
  }, []);

  const initializeBugSpotter = async () => {
    try {
      // Use BugSpotter.init() - it's a static method
      bugSpotter = await BugSpotter.init({
        auth: {
          type: 'api-key',
          apiKey: 'demo-api-key-replace-with-yours',
          projectId: 'proj-12345678-1234-1234-1234-123456789abc', // Replace with your project ID
        },
        endpoint: 'https://demo.bugspotter.com/api/v1/reports', // Replace with your endpoint
        showWidget: true,
        widgetOptions: {
          position: 'bottom-right',
          icon: '🐛',
        },
      });

      setStatus('BugSpotter initialized and ready');
      setIsInitialized(true);
    } catch (error) {
      setStatus(`Failed to initialize BugSpotter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const simulateError = () => {
    console.error('Test error logged to console');
    throw new Error('This is a simulated error for testing BugSpotter!');
  };

  const captureReport = async () => {
    if (!bugSpotter) return;

    try {
      console.log('User action: Capturing bug report');
      const report = await bugSpotter.capture();
      setStatus(`Report captured! Console logs: ${report.console.length}, Network requests: ${report.network.length}`);
    } catch (error) {
      setStatus(`Failed to capture report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const submitReport = async () => {
    if (!bugSpotter) return;

    try {
      const report = await bugSpotter.capture();
      await bugSpotter.submit({
        title: 'Manual Bug Report from React',
        description: 'This is a manually reported bug from the React example',
        report,
      });
      setStatus('Bug report submitted successfully!');
    } catch (error) {
      setStatus(`Failed to submit report: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          onClick={captureReport} 
          disabled={!isInitialized}
        >
          Capture Report (Local)
        </button>
        
        <button 
          onClick={submitReport} 
          disabled={!isInitialized}
        >
          Submit Bug Report
        </button>
        
        <button 
          className="danger" 
          onClick={simulateError}
        >
          Simulate Error
        </button>
      </div>

      <div className="error-demo">
        <h3>Usage Notes</h3>
        <p>The widget in the bottom-right corner allows users to report bugs interactively.</p>
        <p>Click "Capture Report" to see what data is collected (console logs, network, metadata).</p>
        <p>Click "Submit Bug Report" to send a report to your backend.</p>
      </div>

      <div>
        <h3>Features Demonstrated</h3>
        <ul>
          <li>✅ SDK initialization with BugSpotter.init()</li>
          <li>✅ Automatic widget display</li>
          <li>✅ Console log capture</li>
          <li>✅ Network request tracking</li>
          <li>✅ Session replay (automatic)</li>
          <li>✅ Manual report submission</li>
        </ul>
      </div>
    </div>
  );
}

export default App;