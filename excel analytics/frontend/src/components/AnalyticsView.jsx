import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
export default function AnalyticsView({ fileId }) {
  const [rows, setRows] = useState([]);
  const [column, setColumn] = useState('');
  const [groupBy, setGroupBy] = useState('');
  const [columns, setColumns] = useState([]);
  const [chartData, setChartData] = useState(null);
  useEffect(()=>{
    if (!fileId) return;
    axios.get(`http://localhost:5000/api/files/${fileId}/rows`).then(r=>{
      setRows(r.data.rows);
      setColumns(Object.keys(r.data.rows[0] || {}));
    }).catch(()=>{});
  }, [fileId]);
  async function runGroup() {
    if (!column) return alert('Select column');
    const q = { column, groupBy };
    const res = await axios.get(`http://localhost:5000/api/files/${fileId}/analytics`, { params: q });
    const labels = res.data.map(x => x.group);
    const sums = res.data.map(x => x.sum);
    setChartData({
      labels,
      datasets: [{ label: `${column} sum by ${groupBy}`, data: sums }]
    });
  }
  return (
    <div>
      <h3>Analytics</h3>
      <div>
        <label>Column (numeric): </label>
        <select value={column} onChange={e=>setColumn(e.target.value)}>
          <option value="">Select</option>
          {columns.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label>Group By (optional): </label>
        <select value={groupBy} onChange={e=>setGroupBy(e.target.value)}>
          <option value="">None</option>
          {columns.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={runGroup}>Run</button>
      </div>
      {chartData && (
        <div style={{ width: 700, maxWidth: '100%' }}>
          <Bar data={chartData} />
        </div>
      )}
      <h4>Preview Rows (first 5)</h4>
      <pre>{JSON.stringify(rows.slice(0,5), null, 2)}</pre>
    </div>
  );
}
