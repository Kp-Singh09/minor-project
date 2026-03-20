// client/src/pages/RenderGateway.jsx
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { MessageSquareText, AlignCenter, AlignJustify, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RenderGateway() {
    const { formId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const forced = searchParams.get('forced');
    const recommended = searchParams.get('recommended');
    const allowed = searchParams.get('allowed'); 

    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        if (forced) {
            setRedirecting(true);
            setTimeout(() => navigate(`/form/${formId}/${forced}`), 500);
        }
    }, [forced, formId, navigate]);

    if (redirecting || forced) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white">
                <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
                <p className="font-mono text-sm text-indigo-400 uppercase tracking-widest animate-pulse">Initializing {forced} interface...</p>
            </div>
        );
    }

    const availableModes = [];
    if (recommended) availableModes.push(recommended);
    if (allowed) {
        allowed.split(',').forEach(mode => {
            if (mode && mode !== recommended) availableModes.push(mode);
        });
    }

    if (availableModes.length === 0) {
        availableModes.push('scroll', 'focus', 'chat');
    }

    const modeConfig = {
        'chat': { icon: <MessageSquareText size={32} />, title: 'Conversational', desc: 'Interact naturally, one message at a time.', color: 'from-pink-500 to-rose-500' },
        'focus': { icon: <AlignCenter size={32} />, title: 'Focus Flow', desc: 'Adaptive progression, one module at a time.', color: 'from-indigo-500 to-blue-500' },
        'scroll': { icon: <AlignJustify size={32} />, title: 'Document View', desc: 'See all questions vertically at once.', color: 'from-emerald-500 to-teal-500' }
    };

    const handleSelect = (mode) => {
        navigate(`/form/${formId}/${mode}`);
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-4xl text-center"
            >
                <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Select Neural Interface</h1>
                <p className="text-white/50 font-mono text-sm uppercase tracking-widest mb-12">Choose how you want to experience this module</p>

                {/* FIXED: Replaced grid with flex-wrap and justify-center for automatic centering */}
                <div className="flex flex-wrap justify-center items-stretch gap-6">
                    {availableModes.map((mode) => {
                        const config = modeConfig[mode];
                        if (!config) return null;
                        const isRecommended = mode === recommended;

                        return (
                            <motion.button
                                key={mode}
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => handleSelect(mode)}
                                className={`relative p-8 rounded-2xl border flex flex-col items-center text-center transition-all bg-white/5 hover:bg-white/10 w-full sm:w-[300px] flex-shrink-0 ${
                                    isRecommended ? 'border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'border-white/10'
                                }`}
                            >
                                {isRecommended && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                        Recommended
                                    </div>
                                )}
                                
                                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br ${config.color} text-white shadow-lg`}>
                                    {config.icon}
                                </div>
                                
                                <h3 className="text-xl font-bold text-white mb-2">{config.title}</h3>
                                <p className="text-sm text-white/50">{config.desc}</p>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}