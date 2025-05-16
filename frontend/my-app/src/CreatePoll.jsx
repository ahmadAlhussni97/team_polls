// src/CreatePoll.js
import React, { useState } from 'react';
import axios from 'axios';

const CreatePoll = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expiresAt, setExpiresAt] = useState('');

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/poll', {
        question,
        options,
        expiresAt,
      });
      console.log('Poll created:', response.data);
      // Redirect or show success message
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  return (
  <form
  onSubmit={handleSubmit}
  className="max-w-xl mx-auto p-6 bg-white shadow-xl rounded-2xl space-y-6"
>
  <h2 className="text-2xl font-bold text-gray-800">🗳️ Create a New Poll</h2>

  {/* Question */}
  <div>
    <label className="block mb-1 text-gray-700 font-medium">Question</label>
    <input
      type="text"
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      required
      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter your poll question"
    />
  </div>

  {/* Options */}
  <div>
    <label className="block mb-1 text-gray-700 font-medium">Options</label>
    <div className="space-y-2">
      {options.map((option, index) => (
        <input
          key={index}
          type="text"
          value={option}
          onChange={(e) => handleOptionChange(index, e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder={`Option ${index + 1}`}
        />
      ))}
    </div>
    <button
      type="button"
      onClick={addOption}
      className="mt-2 text-sm text-blue-600 hover:underline"
    >
      ➕ Add Option
    </button>
  </div>

  {/* Expires At */}
  <div>
    <label className="block mb-1 text-gray-700 font-medium">Expires At</label>
    <input
      type="datetime-local"
      value={expiresAt}
      onChange={(e) => setExpiresAt(e.target.value)}
      required
      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* Submit */}
  <button
    type="submit"
    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
  >
    ✅ Create Poll
  </button>
</form>

  );
};

export default CreatePoll;
