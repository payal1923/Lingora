import LessonCard from "./LessonCard";
import { SPEAKING_COURSE, getLevelById } from "../../data/speakingCourseData";

/**
 * LessonGrid
 * ----------
 * Renders the 15 lesson cards for the active level in a responsive grid,
 * with a vertical progress timeline on the left (desktop) / top (mobile).
 *
 * @param {string} activeLevel
 * @param {object} statusMap  - { "beginner-1": { status, score }, ... }
 * @param {function} onSelectLesson(lesson)
 */
export default function LessonGrid({ activeLevel, statusMap = {}, onSelectLesson }) {
    const level = getLevelById(activeLevel);
    const lessons = (SPEAKING_COURSE[activeLevel] || []).map((l, idx) => ({
        key: `${activeLevel}-${idx + 1}`,
        title: l.title,
        level: level?.name || activeLevel,
        levelId: activeLevel,
        lessonIndex: idx + 1,
        vocabulary: l.vocabulary,
        sentences: l.sentences,
        conversation: l.conversation,
    }));

    const completedCount = lessons.filter(
        (l) => statusMap[l.key]?.status === "completed"
    ).length;

    return (
        <div className="space-y-5">
            {/* Level header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{level?.emoji}</span>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
                            {level?.name} Level
                        </h2>
                        <p className="text-sm text-slate-500">
                            {completedCount} of {lessons.length} lessons complete
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-40 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${level?.gradient} transition-all duration-500`}
                            style={{ width: `${(completedCount / lessons.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm font-bold text-slate-600">
                        {Math.round((completedCount / lessons.length) * 100)}%
                    </span>
                </div>
            </div>

            {/* Lesson grid with timeline */}
            <div className="flex gap-4 sm:gap-6">
                {/* Timeline rail (desktop) */}
                <div className="hidden sm:flex flex-col items-center pt-6">
                    <div className="relative w-1 flex-1 rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className={`absolute top-0 left-0 w-full bg-gradient-to-b ${level?.gradient} transition-all duration-700`}
                            style={{ height: `${(completedCount / lessons.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Cards */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {lessons.map((lesson) => {
                        const s = statusMap[lesson.key] || { status: "available", score: 0 };
                        return (
                            <LessonCard
                                key={lesson.key}
                                lesson={lesson}
                                status={s.status}
                                score={s.score}
                                onClick={onSelectLesson}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
