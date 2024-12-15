import React, { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SkinCancerDetection = () => {
  const [result, setResult] = useState(null);

  // Mocking result for demonstration purposes
  const handleDetection = () => {
    setResult({
      classification: 'Malignant',
      riskLevel: 85, // High risk for example
      recommendation: 'Immediate consultation with a dermatologist is advised.',
    });
  };

  // Doughnut chart data (mocked for demonstration)
  const chartData = {
    labels: ['Risk Level', 'Remaining'],
    datasets: [
      {
        label: 'Risk Level',
        data: [result ? result.riskLevel : 0, result ? 100 - result.riskLevel : 100],
        backgroundColor: ['#EF4444', '#D1D5DB'],
        borderColor: ['#EF4444', '#D1D5DB'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-black mb-10">Skin Cancer Detection Results</h1>

      {result ? (
        <div className="bg-gray-100 p-8 rounded-lg shadow-xl text-center w-full max-w-2xl">
          {/* Classification Result */}
          <h2 className="text-3xl font-semibold text-black mb-6">
            Classification: <span className={result.classification === 'Malignant' ? 'text-red-600' : 'text-green-600'}>
              {result.classification}
            </span>
          </h2>

          {/* Risk Level with Doughnut Chart */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-1/2">
              <Doughnut data={chartData} />
            </div>
          </div>

          <p className="text-2xl text-black mb-4">
            Risk Level: <span className={result.riskLevel > 50 ? 'text-red-600' : 'text-green-600'}>
              {result.riskLevel}%
            </span>
          </p>

          {/* Recommendation */}
          <p className="text-lg text-gray-700 mb-4">{result.recommendation}</p>

          {/* Additional Information */}
          <div className="text-left border-t border-gray-300 pt-4 mt-4">
            <h3 className="text-xl font-semibold text-black mb-2">What Does This Mean?</h3>
            <p className="text-sm text-gray-700 mb-4">
              Malignant skin lesions often indicate the presence of cancerous cells that need immediate attention. It's important to follow up with a dermatologist for a detailed diagnosis.
            </p>
            <a href="#" className="text-indigo-600 hover:underline">Learn more about skin cancer</a>
          </div>
        </div>
      ) : (
        <button
          onClick={handleDetection}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition mt-10"
        >
          Show Detection Result
        </button>
      )}
    </div>
  );
};

export default SkinCancerDetection;
