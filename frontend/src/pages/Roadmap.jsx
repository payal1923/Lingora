import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config/api";

export default function Roadmap() {

    const [lessons, setLessons] = useState([]);
    const [progress, setProgress] = useState({

        completed: 0,

        total: 0,

        percentage: 0

    });
    const navigate = useNavigate();

    useEffect(() => {

        loadRoadmap();

    }, []);

    const loadRoadmap = async () => {

        try {

            const user = JSON.parse(localStorage.getItem("user"));

            const [roadmapResponse, progressResponse] = await Promise.all([

                axios.get(`${API_URL}/roadmap/${user.user_id}`),

                axios.get(`${API_URL}/learning-progress/${user.user_id}`),

            ]);

            setLessons(roadmapResponse.data);

            setProgress(progressResponse.data);

        }

        catch (error) {
            console.log("Roadmap Error:", error);

            if (error.response) {
                console.log("Response:", error.response.data);
            } else {
                console.log("Message:", error.message);
            }

            alert(error.message);
        }

    };

    return (

        <div className="min-h-screen overflow-x-hidden bg-slate-100 p-3 sm:p-6 lg:p-10">

            <div className="mb-6 min-w-0 rounded-3xl bg-white p-4 shadow-xl sm:mb-10 sm:p-8">

                <h1 className="typo-page-title text-blue-600">

                    📚 Learning Roadmap

                </h1>

                <p className="typo-body text-slate-500 mt-3">

                    Master English one lesson at a time.

                </p>

                {/* Progress */}

                <div className="mt-8">

                    <div className="mb-3 flex flex-wrap justify-between gap-2 typo-secondary">

                        <span className="font-semibold">

                            Progress

                        </span>

                        <span className="font-bold text-blue-600">

                            {progress.percentage}%

                        </span>

                    </div>

                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">

                        <div

                            className="h-full bg-blue-600 transition-all duration-700"

                            style={{

                                width: `${progress.percentage}%`

                            }}

                        />

                    </div>

                    <p className="mt-3 typo-body text-slate-600">

                        {progress.completed} / {progress.total} Lessons Completed

                    </p>

                </div>

            </div>

            <div className="space-y-4 sm:space-y-6">

                {lessons.map((lesson, index) => (

                    <div key={lesson.id}>

                        <div

                            onClick={() => {

                                if (!lesson.locked) {

                                    navigate(`/lesson/${lesson.id}`);

                                }

                            }}

                            className={`min-h-[44px] min-w-0 rounded-3xl shadow-lg p-4 flex flex-col items-start gap-4 transition-all duration-300 sm:p-6 sm:flex-row sm:items-center sm:justify-between

    ${lesson.completed

                                    ? "bg-green-100 border-2 border-green-400"

                                    : lesson.locked

                                        ? "bg-gray-200 opacity-70"

                                        : "bg-white hover:shadow-2xl hover:scale-[1.02] cursor-pointer"

                                }`}

                        >

                            <div className="min-w-0">

                                <h2 className="break-words typo-card-title text-slate-900">

                                    {lesson.completed
                                        ? "✅"
                                        : lesson.locked
                                            ? "🔒"
                                            : "📖"}{" "}

                                    {lesson.title}

                                </h2>

                                <p className="break-words typo-secondary text-slate-500 mt-2">

                                    {lesson.description}

                                </p>

                            </div>

                            <div className="shrink-0 text-left sm:text-right">

                                <div className="typo-card-title text-yellow-500">

                                    ⭐ {lesson.xp_reward} XP

                                </div>

                                <div className="mt-2 typo-badge">

                                    {lesson.completed
                                        ? "Completed"

                                        : lesson.locked
                                            ? "Locked"

                                            : "Available"}

                                </div>

                            </div>

                        </div>

                        {index !== lessons.length - 1 && (

                            <div className="flex justify-center py-2 sm:py-4">

                                <div className="text-3xl text-blue-500">

                                    ⬇

                                </div>

                            </div>

                        )}

                    </div>

                ))}

            </div>

        </div>

    );

}