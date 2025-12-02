// client/src/components/FormCreator/ImportModal.jsx
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import api from '../../api/axiosConfig';
import { toast } from 'react-hot-toast';

const ImportModal = ({ type, onDataReady, onBack, onCancel }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [pastedText, setPastedText] = useState("");
    const fileInputRef = useRef(null);

    // --- SHARED HELPER: Process Workbook Object ---
    const processWorkbook = (wb) => {
        try {
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            const formattedQuestions = data.map(row => {
                // Flexible column matching
                const correctVal = row['Correct Answer'] || row['Answer'] || row['Correct'];
                
                return {
                    type: 'MultipleChoice',
                    text: row['Question'] || row['question'],
                    options: [
                        row['Option 1'] || row['Option A'],
                        row['Option 2'] || row['Option B'],
                        row['Option 3'] || row['Option C'],
                        row['Option 4'] || row['Option D']
                    ].filter(Boolean),
                    correctAnswer: correctVal
                };
            }).filter(q => q.text && q.options.length >= 2);

            if (formattedQuestions.length === 0) {
                toast.error("No valid questions found. Please check the format.");
            } else {
                onDataReady(formattedQuestions);
            }
        } catch (error) {
            console.error("Parse Error:", error);
            toast.error("Failed to parse data.");
        }
    };

    // --- LOGIC 1: PASTE IMPORT (CSV) ---
    const handlePasteImport = () => {
        if (!pastedText.trim()) {
            toast.error("Please paste some data first.");
            return;
        }
        setIsProcessing(true);
        try {
            // Parse CSV string directly
            const wb = XLSX.read(pastedText, { type: 'string' });
            processWorkbook(wb);
        } catch (error) {
            console.error("Paste Error:", error);
            toast.error("Invalid CSV format.");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- LOGIC 2: FILE IMPORT (Excel/CSV) ---
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        const reader = new FileReader();
        
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                processWorkbook(wb);
            } catch (error) {
                toast.error("Failed to read file.");
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    // --- LOGIC 3: IMAGE IMPORT (Unchanged) ---
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        const reader = new FileReader();
        
        reader.onloadend = async () => {
            const base64String = reader.result;
            try {
                const response = await api.post('/api/ai/image-to-question', { 
                    imageBase64: base64String 
                });
                
                const questions = response.data.questions;
                if (questions && questions.length > 0) {
                    onDataReady(questions);
                } else {
                    toast.error("AI couldn't find any questions.");
                }
            } catch (error) {
                console.error("AI Error:", error);
                toast.error("Failed to process image.");
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl mx-auto relative">
            <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 text-2xl hover:text-gray-600">&times;</button>
            
            <div className="flex items-center justify-center gap-2 mb-6 relative">
                <h2 className="text-2xl font-bold text-gray-900">
                    Import from {type === 'image' ? 'Image' : 'Excel / CSV'}
                </h2>
                
                {/* --- HOVERABLE REQUIRED FORMAT TOOLTIP --- */}
                {type === 'file' && (
                    <div className="group relative">
                        <span className="cursor-help text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                            Required Format ℹ️
                        </span>
                        {/* Tooltip Content */}
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-96 p-4 bg-gray-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            <p className="font-bold mb-2 text-gray-300">Expected Columns:</p>
                            <table className="w-full mb-3 border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-gray-600 text-gray-400">
                                        <th className="py-1">Question</th>
                                        <th className="py-1">Option 1...</th>
                                        <th className="py-1">Correct Answer</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-gray-300">
                                        <td className="py-1">2 + 2?</td>
                                        <td className="py-1">3, 4, 5, 6</td>
                                        <td className="py-1">4</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className="font-bold mb-1 text-gray-300">CSV Example:</p>
                            <code className="block bg-gray-900 p-2 rounded border border-gray-700 text-green-400 font-mono break-words">
                                Question,Option 1,Option 2,Option 3,Option 4,Correct Answer
                            </code>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-6">
                
                {/* --- SECTION 1: PASTE CSV (Only for file type) --- */}
                {type === 'file' && (
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Paste CSV Data Directly</label>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-md h-32 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={`Question,Option 1,Option 2,Option 3,Option 4,Correct Answer\nWhat is 2+2?,3,4,5,6,4`}
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                        />
                        <button
                            onClick={handlePasteImport}
                            disabled={isProcessing || !pastedText.trim()}
                            className="w-full py-2 bg-gray-100 text-gray-700 font-semibold rounded-md border border-gray-300 hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Import from Text
                        </button>
                    </div>
                )}

                {/* --- DIVIDER --- */}
                {type === 'file' && (
                    <div className="flex items-center gap-4">
                        <div className="flex-grow h-px bg-gray-200"></div>
                        <span className="text-gray-400 text-sm font-medium">OR UPLOAD FILE</span>
                        <div className="flex-grow h-px bg-gray-200"></div>
                    </div>
                )}

                {/* --- SECTION 2: FILE / IMAGE UPLOAD --- */}
                <div className={`border-2 border-dashed border-gray-300 rounded-lg ${type === 'file' ? 'p-6' : 'p-10'} flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors`}>
                    {isProcessing ? (
                        <div className="text-blue-600 font-semibold animate-pulse flex flex-col items-center">
                            <span className="text-3xl mb-2">⚙️</span>
                            Processing {type === 'image' ? 'Image AI...' : 'File...'}
                        </div>
                    ) : (
                        <>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                accept={type === 'image' ? "image/*" : ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"}
                                onChange={type === 'image' ? handleImageUpload : handleFileUpload}
                                className="hidden" 
                            />
                            <button 
                                onClick={() => fileInputRef.current.click()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md flex items-center gap-2"
                            >
                                <span className="text-xl">{type === 'image' ? '🖼️' : '📂'}</span>
                                Select {type === 'image' ? 'Image' : 'File'}
                            </button>
                            {/* Removed the instruction text below button as requested */}
                        </>
                    )}
                </div>
            </div>

            <div className="flex justify-center mt-8">
                <button onClick={onBack} disabled={isProcessing} className="text-gray-500 hover:text-gray-700 underline text-sm">
                    Back
                </button>
            </div>
        </div>
    );
};

export default ImportModal;