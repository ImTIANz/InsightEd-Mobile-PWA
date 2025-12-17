import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; 
import { onAuthStateChanged } from "firebase/auth";
import BottomNav from './BottomNav';
import LoadingScreen from '../components/LoadingScreen';

const SchoolForms = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [loading, setLoading] = useState(true);
    const [schoolProfile, setSchoolProfile] = useState(null);
    const [headProfile, setHeadProfile] = useState(null);

    // --- 1. DATA CONTENT ---
    const formsData = [
        { 
            id: 'profile', 
            name: "School Profile", 
            emoji: "🏫",
            description: "General school identification and classification.",
            route: "/school-profile", 
        },
        { 
            id: 'head', 
            name: "School Information (Head)", 
            emoji: "👨‍💼",
            description: "Contact details and position of the School Head.",
            route: "/school-information", 
        },
        { 
            id: 'enrolment', 
            name: "Enrolment per Grade Level", 
            emoji: "📊",
            description: "Total number of enrollees for Grades 1 through 12.",
            route: "/enrolment", 
        },
        { 
            id: 'classes', 
            name: "Organized Classes", 
            emoji: "🗂️",
            description: "Number of sections/classes organized per grade level.",
            route: "/organized-classes", 
        },
        { 
            id: 'teachers', 
            name: "Teaching Personnel", 
            emoji: "👩‍🏫",
            description: "Summary of teaching staff by level.",
            route: "/teaching-personnel", 
        },
        { 
            id: 'infra', 
            name: "Shifting & Modality", 
            emoji: "🔄",
            description: "Shifting schedules and learning delivery modes.",
            route: "/shifting-modality", 
        },
        { 
            id: 'resources', 
            name: "School Resources", 
            emoji: "💻",
            description: "Inventory of equipment and facilities.",
            route: "/school-resources", 
        },
        { 
            id: 'specialization', 
            name: "Teacher Specialization", 
            emoji: "🎓",
            description: "Count of teachers by subject specialization.",
            route: "/teacher-specialization", 
        },
    ];

    // --- 2. FETCH DATA (To determine status) ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Check School Profile (Contains Enrolment, Classes, Teachers, Modalities)
                    const profileRes = await fetch(`/api/school-by-user/${user.uid}`);
                    const profileJson = await profileRes.json();
                    if (profileJson.exists) setSchoolProfile(profileJson.data);

                    // Check School Head Info (Separate Table)
                    const headRes = await fetch(`/api/school-head/${user.uid}`);
                    const headJson = await headRes.json();
                    if (headJson.exists) setHeadProfile(headJson.data);

                } catch (error) { console.error("Error loading status:", error); }
            }
            setTimeout(() => setLoading(false), 600);
        });
        return () => unsubscribe();
    }, []);

    // --- 3. STATUS LOGIC (Updated) ---
    const getStatus = (id) => {
        if (!schoolProfile && id !== 'profile') return 'locked'; // Lock everything if profile missing

        switch (id) {
            case 'profile':
                return schoolProfile ? 'completed' : 'pending';
            
            case 'head':
                return headProfile ? 'completed' : 'pending';
            
            case 'enrolment':
                // Check if Total Enrollment is > 0
                return (schoolProfile?.total_enrollment > 0) ? 'completed' : 'pending';
            
            case 'classes':
                // Check if any class count > 0 (Summing common levels)
                if (!schoolProfile) return 'pending';
                const totalClasses = (schoolProfile.classes_kinder || 0) + 
                                     (schoolProfile.classes_grade_1 || 0) + 
                                     (schoolProfile.classes_grade_6 || 0) + 
                                     (schoolProfile.classes_grade_10 || 0) + 
                                     (schoolProfile.classes_grade_12 || 0);
                return totalClasses > 0 ? 'completed' : 'pending';

            case 'teachers':
                // Check if any teacher count > 0
                if (!schoolProfile) return 'pending';
                const totalTeachers = (schoolProfile.teachers_es || 0) + 
                                      (schoolProfile.teachers_jhs || 0) + 
                                      (schoolProfile.teachers_shs || 0);
                return totalTeachers > 0 ? 'completed' : 'pending';

            case 'infra': // Shifting & Modality
                // Check if at least one shift strategy is set OR ADMs are checked
                if (!schoolProfile) return 'pending';
                const hasShift = schoolProfile.shift_kinder || schoolProfile.shift_g1 || schoolProfile.shift_g7 || schoolProfile.shift_g11;
                const hasAdm = schoolProfile.adm_mdl || schoolProfile.adm_odl || schoolProfile.adm_others;
                return (hasShift || hasAdm) ? 'completed' : 'pending';

            default:
                return 'pending'; 
        }
    };

    const StatusBadge = ({ status }) => {
        if (status === 'completed') return <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-green-200">Completed</span>;
        if (status === 'pending') return <span className="bg-orange-50 text-orange-600 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-orange-100 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span> Pending</span>;
        return <span className="bg-gray-100 text-gray-400 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-gray-200">Locked</span>;
    };

    // --- COMPONENT: FORM CARD ---
    const FormCard = ({ item }) => {
        const status = getStatus(item.id);
        const isLocked = status === 'locked';

        return (
            <div 
                onClick={() => !isLocked && navigate(item.route)}
                className={`p-5 rounded-2xl border flex items-center justify-between transition-all duration-200 relative overflow-hidden group
                    ${isLocked 
                        ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' 
                        : 'bg-white border-gray-100 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98]'
                    }
                `}
            >
                {/* Status Color Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 
                    ${status === 'completed' ? 'bg-[#004A99]' : status === 'pending' ? 'bg-orange-400' : 'bg-gray-300'}`} 
                />

                <div className="flex items-center gap-4 ml-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110
                        ${isLocked ? 'bg-gray-200 grayscale' : 'bg-blue-50 text-blue-600'}
                    `}>
                        {item.emoji}
                    </div>
                    <div>
                        <h3 className={`font-bold text-sm ${isLocked ? 'text-gray-500' : 'text-gray-800'}`}>{item.name}</h3>
                        <p className="text-[10px] text-gray-400 leading-tight max-w-[180px] mt-0.5">{item.description}</p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={status} />
                    {!isLocked && <span className="text-gray-300 group-hover:text-[#004A99] transition text-xl">&rarr;</span>}
                </div>
            </div>
        );
    };

    if (loading) return <LoadingScreen message="Loading Forms Menu..." />;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24 relative">
            
            {/* --- HEADER --- */}
            <div className="bg-[#004A99] px-6 pt-12 pb-24 rounded-b-[3rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="relative z-10 flex items-center gap-4">
                    <button onClick={() => navigate('/schoolhead-dashboard')} className="text-white/80 hover:text-white text-2xl transition">&larr;</button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">School Forms</h1>
                        <p className="text-blue-200 text-xs mt-1">Select a module to update your data.</p>
                    </div>
                </div>
            </div>

            {/* --- FORM LIST (Grid Layout) --- */}
            <div className="px-5 -mt-12 relative z-20 grid gap-4 md:grid-cols-2">
                {formsData.map((form) => (
                    <FormCard key={form.id} item={form} />
                ))}
            </div>

            <BottomNav active="forms" />
        </div>
    );
};

export default SchoolForms;