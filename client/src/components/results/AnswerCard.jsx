// src/components/results/AnswerCard.jsx
import React from 'react';

// --- RENDER FUNCTIONS FOR EACH QUESTION TYPE ---

// (ComprehensionBreakdown is safe)
const ComprehensionBreakdown = ({ question, userAnswer }) => (
  <div className="space-y-3">
    {question.mcqs.map((mcq, index) => {
      // This || "No answer" already handles undefined answers
      const userChoice = (userAnswer && userAnswer[mcq._id.toString()]) || "No answer";
      const isMcqCorrect = userChoice === mcq.correctAnswer;
      return (
        <div key={mcq._id} className="text-sm">
          <p className="text-gray-700">Q{index + 1}: {mcq.questionText}</p>
          <p className={`pl-4 ${isMcqCorrect ? 'text-green-600' : 'text-red-600'}`}>Your Answer: {userChoice}</p>
          {!isMcqCorrect && <p className="pl-4 text-green-700">Correct Answer: {mcq.correctAnswer}</p>}
        </div>
      );
    })}
  </div>
);

// --- FIX: Make CategorizeBreakdown safe ---
const CategorizeBreakdown = ({ question, userAnswer }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
    <div>
      <h5 className="font-semibold text-gray-800 mb-2">Your Answer:</h5>
      {/* Add (userAnswer || {}) to prevent crash if userAnswer is undefined */}
      {Object.entries(userAnswer || {}).map(([category, items]) => (
        <div key={category}>
            <p className="text-gray-700 font-medium">{category}:</p>
            <p className="pl-4 text-gray-600">{Array.isArray(items) && items.length > 0 ? items.join(', ') : 'Empty'}</p>
        </div>
      ))}
      {/* Show "No Answer" if the object is empty */}
      {(!userAnswer || Object.keys(userAnswer).length === 0) && (
        <p className="pl-4 text-gray-600">No answer</p>
      )}
    </div>
    <div>
      <h5 className="font-semibold text-green-700 mb-2">Correct Answer:</h5>
      {question.categories.map(category => (
        <div key={category}>
            <p className="text-gray-700 font-medium">{category}:</p>
            <p className="pl-4 text-green-600">{question.items.filter(i => i.category === category).map(i => i.text).join(', ')}</p>
        </div>
      ))}
    </div>
  </div>
);

// --- FIX: Make ClozeBreakdown safe ---
const ClozeBreakdown = ({ question, userAnswer }) => (
    <div className="text-sm">
        <h5 className="font-semibold text-gray-800 mb-2">Your Answer:</h5>
        {/* Add (userAnswer || {}) to prevent crash. This was the error in your screenshot. */}
        <p className="text-gray-700">
          {(userAnswer && Object.keys(userAnswer).length > 0)
            ? Object.values(userAnswer).join(', ')
            : "No answer"
          }
        </p>
        <h5 className="font-semibold text-green-700 my-2">Correct Answer:</h5>
        <p className="text-green-600">{question.options.join(', ')}</p>
    </div>
);

// (SimpleBreakdown is safe)
const SimpleBreakdown = ({ question, userAnswer, isCorrect }) => (
  <div className="text-sm">
    <p className={`text-gray-700 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
      <strong>Your Answer:</strong> {userAnswer || "No answer"}
    </p>
    {!isCorrect && (
      <p className="text-green-700 mt-1">
        <strong>Correct Answer:</strong> {question.correctAnswer}
      </p>
    )}
  </div>
);

// (CheckboxBreakdown is safe)
const CheckboxBreakdown = ({ question, userAnswer, isCorrect }) => (
  <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <p className={`text-gray-700 font-semibold mb-1 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
        Your Answer:
      </p>
      <ul className="list-disc pl-5">
        {(Array.isArray(userAnswer) && userAnswer.length > 0) ? userAnswer.map(a => <li key={a}>{a}</li>) : <li>No answer</li>}
      </ul>
    </div>
    {!isCorrect && (
      <div>
        <p className="text-green-700 font-semibold mb-1">
          Correct Answer:
        </p>
        <ul className="list-disc pl-5">
          {question.correctAnswers.map(a => <li key={a}>{a}</li>)}
        </ul>
      </div>
    )}
  </div>
);

// --- FIX: Make SubmissionOnlyBreakdown safe ---
const SubmissionOnlyBreakdown = ({ question, userAnswer }) => (
  <div className="text-sm">
    <p className="text-gray-700">
      <strong>Your Submission:</strong>
      {/* Check if userAnswer exists before calling toString() */}
      <span className="block whitespace-pre-wrap mt-1">
        {userAnswer ? userAnswer.toString() : "No answer"}
      </span>
    </p>
  </div>
);


// --- Updated AnswerCard Component ---
const AnswerCard = ({ answerData, index }) => {
  // Graceful check in case questionId is null
  if (!answerData || !answerData.questionId) {
    return (
      <div className="bg-white p-6 rounded-lg border-l-4 border-red-500 shadow-sm">
        <h3 className="text-lg font-semibold text-red-700">
            Question #{index + 1}: Error
        </h3>
        <p className="text-red-600">Could not load question data. It may have been deleted.</p>
      </div>
    );
  }

  const { questionId, answer, points } = answerData;

  // Define which types are scorable
  const SCORABLE_TYPES = [
    'Comprehension', 'Categorize', 'Cloze', 
    'MultipleChoice', 'Checkbox', 'Dropdown', 'PictureChoice'
  ];
  
  const isScorable = SCORABLE_TYPES.includes(questionId.type);
  const wasCorrect = points === 10;
  const wasPartiallyCorrect = points > 0 && points < 10;

  // Determine the display style based on points
  let statusStyle = 'border-gray-300'; // Default for non-scorable
  let statusText = 'Submitted';
  let statusBg = 'bg-gray-100 text-gray-700';

  if (isScorable) {
    if (wasCorrect) {
      statusStyle = 'border-green-500';
      statusText = 'Correct';
      statusBg = 'bg-green-100 text-green-700';
    } else if (wasPartiallyCorrect) {
      statusStyle = 'border-yellow-500';
      statusText = 'Partially Correct';
      statusBg = 'bg-yellow-100 text-yellow-700';
    } else {
      statusStyle = 'border-red-500';
      statusText = 'Incorrect';
      statusBg = 'bg-red-100 text-red-700';
    }
  }

  const renderBreakdown = () => {
    switch (questionId.type) {
      // Complex
      case 'Comprehension':
        return <ComprehensionBreakdown question={questionId} userAnswer={answer} />;
      case 'Categorize':
        return <CategorizeBreakdown question={questionId} userAnswer={answer} />;
      case 'Cloze':
        return <ClozeBreakdown question={questionId} userAnswer={answer} />;
      
      // Simple Scorable
      case 'MultipleChoice':
      case 'Dropdown':
      case 'PictureChoice':
        return <SimpleBreakdown question={questionId} userAnswer={answer} isCorrect={wasCorrect} />;
      case 'Checkbox':
        return <CheckboxBreakdown question={questionId} userAnswer={answer} isCorrect={wasCorrect} />;

      // Simple Non-Scorable
      case 'ShortAnswer':
      case 'LongAnswer': // This is now safe
      case 'Email':
      case 'Switch':
        return <SubmissionOnlyBreakdown question={questionId} userAnswer={answer} />;

      // Fallback
      default:
        return <p>Cannot display breakdown for this question type.</p>;
    }
  };

  return (
    <div className={`bg-white p-6 rounded-lg border-l-4 ${statusStyle} shadow-sm`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
            Question #{index + 1}: {questionId.text || questionId.type}
            {isScorable && <span className="ml-4 text-base font-medium text-gray-600">({points}/10 pts)</span>}
        </h3>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${statusBg}`}>
            {statusText}
        </span>
      </div>
      
      {/* Show passage for complex questions */}
      {(questionId.type === 'Comprehension' || questionId.type === 'Cloze') &&
        <p className="mt-2 text-gray-600 italic text-sm">{questionId.passage || questionId.comprehensionPassage}</p>
      }
      {questionId.type === 'Categorize' &&
        <p className="mt-2 text-gray-600 italic text-sm">Categorize the items</p>
      }
      
      <div className="mt-4 border-t border-gray-200 pt-4">
        {renderBreakdown()}
      </div>
    </div>
  );
};

export default AnswerCard;