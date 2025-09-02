import React, { useState, useEffect } from 'react';
import axios from 'axios';
export default function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [filesList, setFilesList] = useState([]);
  useEffect(()=> fetchFiles(), []);
  function fetchFiles(){
    axios.get('http://localhost:5000/api/files').then(res => setFilesList(res.data)).catch(()=>{});
  }
  async function handleSubmit(e){
    e.preventDefault();
    if (!file) return alert('Choose file');
    const fd = new FormData();
    fd.append('file', file);
    const res = await axios.post('http://localhost:5000/api/files/upload', fd);
    alert('Uploaded: rows=' + res.data.rowsCount);
    fetchFiles();
    onUploaded(res.data.fileId);
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={e=>setFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>
      <h3>Uploaded Files</h3>
      <ul>
        {filesList.map(f => (
          <li key={f._id}>
            <button onClick={()=>onUploaded(f._id)}>{f.originalName}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
