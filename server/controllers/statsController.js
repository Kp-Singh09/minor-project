import Form from '../models/Form.js';
import Response from '../models/Response.js';

// --- CONTROLLER TO GET STATS FOR THE CURRENT USER ---
export const getUserStats = async (req, res) => {
    try {
        const { userId } = req.params;

        const formCount = await Form.countDocuments({ userId });
        const userForms = await Form.find({ userId }).select('_id');
        const formIds = userForms.map(form => form._id);

        const totalResponsesReceived = await Response.countDocuments({ formId: { $in: formIds } });
        
        const score = (formCount * 10) + (totalResponsesReceived * 2);

        res.status(200).json({
            formCount,
            totalResponsesReceived,
            score
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Could not fetch user stats.' });
    }
};

// --- CONTROLLER TO GET THE GLOBAL LEADERBOARD ---
export const getLeaderboard = async (req, res) => {
    try {
        // This is a more advanced query that groups responses by user to calculate scores
        const userScores = await Response.aggregate([
            // Stage 1: Get all responses and populate form owner
            {
                $lookup: {
                    from: "forms",
                    localField: "formId",
                    foreignField: "_id",
                    as: "formInfo"
                }
            },
            { $unwind: "$formInfo" },
            
            // Stage 2: Group by the form owner's ID and count responses
            {
                $group: {
                    _id: "$formInfo.userId",
                    username: { $first: "$formInfo.username" },
                    responseCount: { $sum: 1 },
                }
            },
             // Stage 3: Look up form count for each user
            {
                $lookup: {
                    from: "forms",
                    localField: "_id",
                    foreignField: "userId",
                    as: "userForms"
                }
            },
            
            // Stage 4: Calculate score
            {
                $project: {
                    userId: "$_id",
                    username: "$username",
                    score: { $add: [ { $multiply: [{ $size: "$userForms" }, 10] }, { $multiply: ["$responseCount", 2] } ] },
                    _id: 0
                }
            },
            // Stage 5: Sort by score descending
            { $sort: { score: -1 } },
            // Stage 6: Limit to top 10 for the leaderboard
            { $limit: 10 }
        ]);

        res.status(200).json(userScores);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Could not fetch leaderboard.' });
    }
};