// client/src/components/results/AnalyticsDashboard.jsx
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AnalyticsDashboard = ({ form, responses }) => {
  
  // Helper: Prepare data for Multiple Choice / Dropdown
  const getChoiceData = (question) => {
    const counts = {};
    question.options.forEach(opt => counts[opt] = 0);
    
    responses.forEach(res => {
      const answerObj = res.answers.find(a => a.questionId === question._id);
      if (answerObj && answerObj.answer) {
        const val = answerObj.answer;
        if (counts[val] !== undefined) counts[val]++;
      }
    });

    return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
  };

  // Helper: Calculate average score for scorable questions
  const getAverageScore = (question) => {
    let totalPoints = 0;
    let count = 0;
    
    responses.forEach(res => {
      const answerObj = res.answers.find(a => a.questionId === question._id);
      if (answerObj) {
        totalPoints += (answerObj.points || 0);
        count++;
      }
    });
    
    return count === 0 ? 0 : (totalPoints / count).toFixed(1);
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-semibold uppercase">Total Responses</p>
          <p className="text-4xl font-bold text-gray-800">{responses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <p className="text-gray-500 text-sm font-semibold uppercase">Completion Rate</p>
          <p className="text-4xl font-bold text-gray-800">100%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm font-semibold uppercase">Avg. Score</p>
          <p className="text-4xl font-bold text-gray-800">
            {responses.length > 0 
              ? (responses.reduce((acc, curr) => acc + curr.score, 0) / responses.length).toFixed(1)
              : 0}
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Question Breakdown</h2>

      {form.questions.map((question, index) => {
        // Render Charts for Selection Types
        if (['MultipleChoice', 'Dropdown', 'PictureChoice'].includes(question.type)) {
          const data = getChoiceData(question);
          return (
            <div key={question._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {index + 1}. {question.text}
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        }

        // Render Score Cards for Complex Types
        if (['Comprehension', 'Cloze', 'Categorize'].includes(question.type)) {
          const avg = getAverageScore(question);
          return (
            <div key={question._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {index + 1}. {question.type} Task
                </h3>
                <p className="text-gray-500 text-sm">Complex interaction type</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Average Score</p>
                <p className={`text-2xl font-bold ${avg > 7 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {avg} / 10
                </p>
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