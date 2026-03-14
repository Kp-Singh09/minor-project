// server/controllers/statsController.js
import Form from '../models/Form.js';
import Response from '../models/Response.js';

// --- GET DETAILED USER STATS ---
export const getUserStats = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Find all forms created by this user
        // Note: We use 'creatorId' as defined in your Form.js, not 'userId'
        const userForms = await Form.find({ creatorId: userId }).select('_id title');
        const formIds = userForms.map(form => form._id);
        const formCount = formIds.length;

        if (formCount === 0) {
            return res.status(200).json({
                totalResponses: 0,
                totalForms: 0,
                completionRate: 0,
                avgAccuracy: 0,
                aiGradedCount: 0,
                recentActivity: []
            });
        }

        // 2. Aggregate Responses for these forms
        const stats = await Response.aggregate([
            { $match: { formId: { $in: formIds } } },
            {
                $group: {
                    _id: null,
                    totalResponses: { $sum: 1 },
                    totalScore: { $sum: "$score" },
                    totalMaxScore: { $sum: "$totalMarks" },
                    aiGraded: { 
                        $sum: { $cond: [{ $eq: ["$status", "Graded"] }, 1, 0] }
                    }
                }
            }
        ]);

        const totalResponses = stats[0]?.totalResponses || 0;
        const totalScore = stats[0]?.totalScore || 0;
        const totalMaxScore = stats[0]?.totalMaxScore || 0;
        const aiGradedCount = stats[0]?.aiGraded || 0;

        // 3. Calculate Derived Metrics
        // Accuracy: (Total Score Obtained / Total Max Score) * 100
        const avgAccuracy = totalMaxScore > 0 
            ? ((totalScore / totalMaxScore) * 100).toFixed(1) 
            : 0;

        // Completion Rate: (For now, we assume 100% of submitted are 'complete'. 
        // In a real view-tracking system, this would be Submissions / Views)
        const completionRate = totalResponses > 0 ? 100 : 0;

        res.status(200).json({
            totalResponses,
            totalForms: formCount,
            completionRate,
            avgAccuracy,
            aiGradedCount
        });

    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: 'Server Error: Could not calculate neural analytics.' });
    }
};

// --- GET GLOBAL LEADERBOARD (Optimized) ---
export const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Response.aggregate([
            // 1. Group by formId to get submission counts per form
            {
                $group: {
                    _id: "$formId",
                    submissionCount: { $sum: 1 }
                }
            },
            // 2. Lookup Form details to get the creator
            {
                $lookup: {
                    from: "forms",
                    localField: "_id",
                    foreignField: "_id",
                    as: "form"
                }
            },
            { $unwind: "$form" },
            // FILTER: Ensure the form has a valid creatorId to prevent null crashes on frontend
            { $match: { "form.creatorId": { $ne: null, $exists: true, $ne: "" } } },
            // 3. Group by Creator (User)
            {
                $group: {
                    _id: "$form.creatorId",
                    totalSubmissions: { $sum: "$submissionCount" },
                    formsCreated: { $sum: 1 } // Counts unique forms that have responses
                }
            },
            // 4. Calculate Score: (Forms * 10) + (Submissions * 2)
            {
                $project: {
                    userId: "$_id",
                    score: { 
                        $add: [
                            { $multiply: ["$formsCreated", 10] }, 
                            { $multiply: ["$totalSubmissions", 2] }
                        ] 
                    },
                    totalSubmissions: 1,
                    formsCreated: 1
                }
            },
            { $sort: { score: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error("Leaderboard Error:", error);
        res.status(500).json({ message: 'Server Error: Could not fetch leaderboard.' });
    }
};