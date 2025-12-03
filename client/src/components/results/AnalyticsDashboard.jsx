// client/src/components/results/AnalyticsDashboard.jsx
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  if (percent === 0) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold pointer-events-none">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const AnalyticsDashboard = ({ form, responses }) => {
  const [chartType, setChartType] = useState('bar'); 

  // --- HELPER 1: Get data for Choice-based questions ---
  const getChoiceData = (question) => {
    const counts = {};
    question.options.forEach(opt => counts[opt] = 0);
    
    responses.forEach(res => {
      const answerObj = res.answers.find(a => {
        const aId = a.questionId._id || a.questionId;
        const qId = question._id;
        return aId.toString() === qId.toString();
      });

      if (answerObj && answerObj.answer) {
        const val = answerObj.answer;
        if (counts[val] !== undefined) {
          counts[val]++;
        }
      }
    });

    return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
  };

  // --- HELPER 2: Get text answers ---
  const getTextAnswers = (question) => {
    return responses
      .map(res => {
        const answerObj = res.answers.find(a => {
          const aId = a.questionId._id || a.questionId;
          return aId.toString() === question._id.toString();
        });
        return answerObj ? answerObj.answer : null;
      })
      .filter(ans => ans && typeof ans === 'string' && ans.trim() !== '')
      .slice(0, 5);
  };

  // --- HELPER 3: Calculate Average Score ---
  const getAverageScore = (question) => {
    let totalPoints = 0;
    let count = 0;
    responses.forEach(res => {
      const answerObj = res.answers.find(a => {
        const aId = a.questionId._id || a.questionId;
        return aId.toString() === question._id.toString();
      });
      if (answerObj) {
        totalPoints += (answerObj.points || 0);
        count++;
      }
    });
    return count === 0 ? 0 : (totalPoints / count).toFixed(1);
  };

  // --- HELPER 4: Calculate Dynamic Height (TIGHTER) ---
  const getDynamicHeight = (itemCount) => {
    // Pie: 250px is enough for radius 110 (220px diameter) + padding
    if (chartType === 'pie') return 250; 
    
    // Bar: 40px per item is enough (was 50). +50px buffer. Min 150.
    return Math.max(150, (itemCount * 40) + 50);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      
      {/* --- Top Stats --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Responses</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{responses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Completion Rate</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">100%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Avg. Score</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {responses.length > 0 
              ? (responses.reduce((acc, curr) => acc + curr.score, 0) / responses.length).toFixed(1)
              : 0}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Question Breakdown</h2>
        <div className="bg-gray-200 p-1 rounded-lg flex text-sm">
          <button 
            onClick={() => setChartType('bar')}
            className={`px-4 py-1.5 rounded-md font-medium transition-all ${chartType === 'bar' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Bar
          </button>
          <button 
            onClick={() => setChartType('pie')}
            className={`px-4 py-1.5 rounded-md font-medium transition-all ${chartType === 'pie' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Pie
          </button>
        </div>
      </div>

      {form.questions.map((question, index) => {
        // --- TYPE A: Selection Questions ---
        if (['MultipleChoice', 'Dropdown', 'PictureChoice', 'Switch'].includes(question.type)) {
          const data = getChoiceData(question);
          const totalAnswers = data.reduce((sum, item) => sum + item.count, 0);
          
          // Calculate height dynamically
          const chartHeight = getDynamicHeight(data.length);

          return (
            <div key={question._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="mb-2"> {/* Reduced margin here */}
                <h3 className="text-lg font-semibold text-gray-800">
                  {index + 1}. {question.text}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{totalAnswers} responses</p>
              </div>
              
              <div style={{ height: `${chartHeight}px`, width: '100%' }}>
                {totalAnswers === 0 ? (
                   <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
                      No data available yet
                   </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart 
                        data={data} 
                        layout="vertical" 
                        // Zeroed margins to remove extra whitespace
                        margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" allowDecimals={false} hide />
                        <YAxis dataKey="name" type="category" width={140} tick={{fontSize: 12, fill: '#4B5563'}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          cursor={{ fill: '#F3F4F6' }}
                        />
                        <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20}>
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <PieChart margin={{ top: 0, bottom: 0 }}>
                        <Pie
                          data={data}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={110} 
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend 
                          layout="vertical" 
                          verticalAlign="middle" 
                          align="right"
                          wrapperStyle={{ fontSize: '12px', paddingLeft: '20px' }} 
                        />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          );
        }

        // --- TYPE B: Text Questions ---
        if (['ShortAnswer', 'LongAnswer', 'Email'].includes(question.type)) {
          const textAnswers = getTextAnswers(question);
          return (
            <div key={question._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {index + 1}. {question.text}
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto border border-gray-200">
                {textAnswers.length > 0 ? (
                  <ul className="space-y-2">
                    {textAnswers.map((ans, idx) => (
                      <li key={idx} className="bg-white p-3 rounded shadow-sm text-gray-700 text-sm border-l-4 border-blue-400">
                        {ans}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-center italic py-4">No text responses yet.</p>
                )}
              </div>
            </div>
          );
        }

        // --- TYPE C: Complex Questions ---
        if (['Comprehension', 'Cloze', 'Categorize'].includes(question.type)) {
          const avg = getAverageScore(question);
          return (
            <div key={question._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {index + 1}. {question.type} Task
                </h3>
                <p className="text-gray-500 text-sm">
                  Average Score based on all submissions.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Avg Score</p>
                  <p className={`text-3xl font-bold ${avg > 7 ? 'text-green-600' : avg > 4 ? 'text-yellow-600' : 'text-red-500'}`}>
                    {avg} <span className="text-sm text-gray-400 font-normal">/ 10</span>
                  </p>
                </div>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default AnalyticsDashboard;