import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Trophy, AlertTriangle, TrendingUp } from 'lucide-react';

const MOCK_STUDENTS = [
  { id: 1, name: 'John Doe', class: '10-A', math: 85, physics: 78, chemistry: 82, attendance: 95 },
  { id: 2, name: 'Sarah Smith', class: '10-A', math: 95, physics: 88, chemistry: 95, attendance: 98 },
  { id: 3, name: 'Michael Brown', class: '9-B', math: 75, physics: 65, chemistry: 70, attendance: 85 },
  { id: 4, name: 'Emma Wilson', class: '9-B', math: 88, physics: 90, chemistry: 85, attendance: 92 },
  { id: 5, name: 'Alex Johnson', class: '11-C', math: 96, physics: 94, chemistry: 92, attendance: 100 },
  { id: 6, name: 'David Lee', class: '11-C', math: 60, physics: 55, chemistry: 65, attendance: 75 },
  { id: 7, name: 'Sophia Martinez', class: '10-A', math: 82, physics: 85, chemistry: 80, attendance: 90 },
  { id: 8, name: 'James Taylor', class: '9-B', math: 70, physics: 72, chemistry: 68, attendance: 88 },
];

export default function Analytics() {
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState('All');

  // Available filters
  const classes = ['All', ...Array.from(new Set(MOCK_STUDENTS.map(s => s.class)))];
  const studentsInClass = useMemo(() => {
    return MOCK_STUDENTS.filter(s => selectedClass === 'All' || s.class === selectedClass);
  }, [selectedClass]);

  // Handle class change (reset student selection)
  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    setSelectedStudent('All');
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return MOCK_STUDENTS.filter(s => {
      const matchClass = selectedClass === 'All' || s.class === selectedClass;
      const matchStudent = selectedStudent === 'All' || s.id.toString() === selectedStudent;
      return matchClass && matchStudent;
    });
  }, [selectedClass, selectedStudent]);

  // Derived KPIs
  const kpis = useMemo(() => {
    if (filteredData.length === 0) return null;

    let totalMath = 0, totalPhysics = 0, totalChemistry = 0;
    let bestStudent = filteredData[0];
    let highestAvg = 0;

    filteredData.forEach(s => {
      totalMath += s.math;
      totalPhysics += s.physics;
      totalChemistry += s.chemistry;

      const avg = (s.math + s.physics + s.chemistry) / 3;
      if (avg > highestAvg) {
        highestAvg = avg;
        bestStudent = s;
      }
    });

    const count = filteredData.length;
    const avgMath = totalMath / count;
    const avgPhysics = totalPhysics / count;
    const avgChemistry = totalChemistry / count;
    
    const overallAvg = (avgMath + avgPhysics + avgChemistry) / 3;

    // Determine area of improvement (lowest average subject)
    const subjects = [
      { name: 'Math', avg: avgMath },
      { name: 'Physics', avg: avgPhysics },
      { name: 'Chemistry', avg: avgChemistry }
    ];
    subjects.sort((a, b) => a.avg - b.avg);
    const improvementArea = subjects[0];

    return {
      overallAvg: overallAvg.toFixed(1),
      bestStudent: { name: bestStudent.name, avg: highestAvg.toFixed(1) },
      improvementArea: { name: improvementArea.name, avg: improvementArea.avg.toFixed(1) }
    };
  }, [filteredData]);

  // Chart data formatting
  const chartData = [
    { subject: 'Math', average: kpis ? parseFloat(kpis.improvementArea.name === 'Math' ? kpis.improvementArea.avg : (filteredData.reduce((acc, s) => acc + s.math, 0)/filteredData.length).toFixed(1)) : 0 },
    { subject: 'Physics', average: kpis ? parseFloat(kpis.improvementArea.name === 'Physics' ? kpis.improvementArea.avg : (filteredData.reduce((acc, s) => acc + s.physics, 0)/filteredData.length).toFixed(1)) : 0 },
    { subject: 'Chemistry', average: kpis ? parseFloat(kpis.improvementArea.name === 'Chemistry' ? kpis.improvementArea.avg : (filteredData.reduce((acc, s) => acc + s.chemistry, 0)/filteredData.length).toFixed(1)) : 0 },
  ];

  const selectStyle = {
    padding: '10px 15px', borderRadius: '8px', 
    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', 
    color: 'white', outline: 'none', cursor: 'pointer', minWidth: '150px'
  };

  return (
    <div className="view-container animate-fade-in" style={{ paddingBottom: '50px' }}>
      <div className="view-header flex-between" style={{ flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1>Student Analytics</h1>
          <p>Monitor comprehensive performance data and uncover insights.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Class</label>
            <select style={selectStyle} value={selectedClass} onChange={handleClassChange}>
              {classes.map(c => <option key={c} value={c} style={{ color: 'black' }}>{c === 'All' ? 'All Classes' : `Class ${c}`}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Student</label>
            <select style={selectStyle} value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
              <option value="All" style={{ color: 'black' }}>All Students</option>
              {studentsInClass.map(s => <option key={s.id} value={s.id} style={{ color: 'black' }}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {kpis && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ padding: '15px', borderRadius: '50%', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent-cyan)' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '24px' }}>{kpis.overallAvg}%</h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Overall Average</p>
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ padding: '15px', borderRadius: '50%', background: 'rgba(255, 215, 0, 0.1)', color: 'var(--accent-gold)' }}>
                <Trophy size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>{kpis.bestStudent.name}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Best Performer ({kpis.bestStudent.avg}%)</p>
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ padding: '15px', borderRadius: '50%', background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>{kpis.improvementArea.name}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Needs Focus ({kpis.improvementArea.avg}%)</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '20px' }}>
        <Card title="Subject Averages">
          <div style={{ height: '300px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="subject" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--panel-border)', borderRadius: '8px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="average" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Detailed Student Data">
        <div style={{ overflowX: 'auto', marginTop: '15px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--panel-border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '15px' }}>Name</th>
                <th style={{ padding: '15px' }}>Class</th>
                <th style={{ padding: '15px' }}>Math</th>
                <th style={{ padding: '15px' }}>Physics</th>
                <th style={{ padding: '15px' }}>Chemistry</th>
                <th style={{ padding: '15px' }}>Average</th>
                <th style={{ padding: '15px' }}>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((s, index) => {
                const avg = ((s.math + s.physics + s.chemistry) / 3).toFixed(1);
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--panel-border)', background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <td style={{ padding: '15px', color: 'var(--text-primary)', fontWeight: '500' }}>{s.name}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent-cyan)', fontSize: '12px' }}>{s.class}</span>
                    </td>
                    <td style={{ padding: '15px', color: s.math < 70 ? '#ff3b30' : 'inherit' }}>{s.math}%</td>
                    <td style={{ padding: '15px', color: s.physics < 70 ? '#ff3b30' : 'inherit' }}>{s.physics}%</td>
                    <td style={{ padding: '15px', color: s.chemistry < 70 ? '#ff3b30' : 'inherit' }}>{s.chemistry}%</td>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{avg}%</td>
                    <td style={{ padding: '15px', color: s.attendance < 85 ? '#ff3b30' : '#34c759' }}>{s.attendance}%</td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>No student data found for the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
