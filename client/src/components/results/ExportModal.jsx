// client/src/components/results/ExportModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

const ExportModal = ({ isOpen, onClose, form, responses }) => {
    if (!isOpen) return null;

    // Define standard fields
    const standardFields = [
        { id: 'username', label: 'Respondent Name', isDefault: true },
        { id: 'userEmail', label: 'Respondent Email', isDefault: true },
        { id: 'userId', label: 'Respondent ID', isDefault: false },
        { id: 'submittedAt', label: 'Submission Date', isDefault: true },
        { id: 'score', label: 'Total Score', isDefault: true },
        { id: 'totalMarks', label: 'Max Marks', isDefault: true },
    ];

    // Generate question fields based on the form
    const questionFields = form?.questions.map((q, index) => ({
        id: q._id, 
        // UPDATED: Now shows only "Question 1", "Question 2", etc.
        label: `Question ${index + 1}`, 
        isDefault: true
    })) || [];

    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const defaults = [...standardFields, ...questionFields]
                .filter(f => f.isDefault)
                .map(f => f.id);
            setSelectedIds(defaults);
        }
    }, [isOpen, form]);

    const toggleField = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        const allIds = [...standardFields, ...questionFields].map(f => f.id);
        setSelectedIds(allIds);
    };

    const handleDeselectAll = () => {
        setSelectedIds([]);
    };

    const handleExport = () => {
        try {
            if (selectedIds.length === 0) {
                toast.error("Please select at least one column to export.");
                return;
            }

            // 1. Prepare Headers
            const allDefinitions = [...standardFields, ...questionFields];
            const orderedSelection = allDefinitions.filter(def => selectedIds.includes(def.id));
            
            // 2. Transform Data
            const exportData = responses.map(response => {
                const rowData = {};

                orderedSelection.forEach(field => {
                    // Handle Standard Fields
                    if (['username', 'userEmail', 'userId', 'score', 'totalMarks'].includes(field.id)) {
                        if (field.id === 'username') {
                            // If username is empty/null, show Anonymous
                            const name = response[field.id];
                            rowData[field.label] = (name && name.trim() !== "") ? name : "Anonymous";
                        } else {
                            rowData[field.label] = response[field.id];
                        }
                    } 
                    else if (field.id === 'submittedAt') {
                        rowData[field.label] = new Date(response.submittedAt).toLocaleString();
                    }
                    // Handle Question Fields - EXPORTING MARKS
                    else {
                        const answerObj = response.answers.find(a => {
                            const aId = a.questionId._id || a.questionId; 
                            return aId.toString() === field.id.toString();
                        });
                        
                        // Default to 0 if no answer found, otherwise show the calculated points
                        rowData[field.label] = answerObj ? (answerObj.points || 0) : 0;
                    }
                });
                return rowData;
            });

            // 3. Generate Excel
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");
            
            // 4. Download
            XLSX.writeFile(workbook, `${form.title.replace(/[^a-z0-9]/gi, '_')}_Marks_Report.xlsx`);
            
            toast.success("Export successful!");
            onClose();

        } catch (error) {
            console.error("Export failed", error);
            toast.error("Failed to export data.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-800">Export Scores</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-gray-600 font-medium">Select columns to include:</p>
                        <div className="space-x-3 text-sm">
                            <button onClick={handleSelectAll} className="text-blue-600 hover:underline">Select All</button>
                            <button onClick={handleDeselectAll} className="text-gray-500 hover:underline">Deselect All</button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Respondent Details</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {standardFields.map(field => (
                                <label key={field.id} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedIds.includes(field.id) ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.includes(field.id)}
                                        onChange={() => toggleField(field.id)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-3"
                                    />
                                    <span className="text-gray-700 text-sm font-medium">{field.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Question Marks</h4>
                        <div className="grid grid-cols-1 gap-2">
                            {questionFields.map(field => (
                                <label key={field.id} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedIds.includes(field.id) ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.includes(field.id)}
                                        onChange={() => toggleField(field.id)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-3"
                                    />
                                    <span className="text-gray-700 text-sm truncate" title={field.label}>{field.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                    <button onClick={handleExport} className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 transition-all flex items-center gap-2">
                        <span>Download Excel</span><span className="text-lg">📥</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ExportModal;