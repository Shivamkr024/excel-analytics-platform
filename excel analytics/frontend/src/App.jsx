import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import AnalyticsView from './components/AnalyticsView';
import './App.css';
function App(){
  const [fileId, setFileId] = useState(null);
  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Excel Analytics Platform</h1>
      <UploadForm onUploaded={setFileId} />
      <hr />
      {fileId ? <AnalyticsView fileId={fileId} /> : <p>Select/upload a file to analyze.</p>}
    </div>
  );
}
export default App;
