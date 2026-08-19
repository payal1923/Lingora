import { ArrowLeft, Bot, Clock3, GaugeCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChatHeader({
    topic,
    difficulty,
    duration,
}) {

    const navigate = useNavigate();

    return (

        <div className="bg-white shadow-md sticky top-0 z-50">

            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

                {/* Left */}

                <div className="flex items-center gap-4">

                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 rounded-full hover:bg-slate-100 transition flex items-center justify-center"
                    >
                        <ArrowLeft />
                    </button>

                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg">

                        <Bot size={26} />

                    </div>

                    <div>

                        <h2 className="text-2xl font-bold">

                            Lingora AI

                        </h2>

                        <p className="text-green-600 text-sm font-semibold">

                            ● Online

                        </p>

                    </div>

                </div>

                {/* Right */}

                <div className="hidden md:flex items-center gap-6">

                    <div className="flex items-center gap-2 text-slate-600">

                        <Bot size={18} />

                        <span>{topic}</span>

                    </div>

                    <div className="flex items-center gap-2 text-slate-600">

                        <GaugeCircle size={18} />

                        <span>{difficulty}</span>

                    </div>

                    <div className="flex items-center gap-2 text-slate-600">

                        <Clock3 size={18} />

                        <span>{duration}</span>

                    </div>

                </div>

            </div>

        </div>

    );

}