import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Progress from "./pages/Progress";
import TestAPI from "./testAPI";
import Vocabulary from "./pages/Vocabulary";
import GrammarChecker from "./pages/GrammarChecker";
import SpeakingPractice from "./pages/SpeakingPractice";
import Leaderboard from "./pages/Leaderboard";
import AIChat from "./pages/AIChat";
import Conversation from "./pages/Conversation";
import ConversationChat from "./pages/ConversationChat";
import Profile from "./pages/Profile";
import DailyChallenge from "./pages/DailyChallenge";
import Welcome from "./pages/Welcome";
import Roadmap from "./pages/Roadmap";
import Lesson from "./pages/Lesson";
import { useState } from "react";
import SplashScreen from "./components/SplashScreen";
import ForgotPassword from "./pages/ForgotPassword";
import OnboardingLanguage from "./pages/onboarding/OnboardingLanguage";
import OnboardingName from "./pages/onboarding/OnboardingName";
import OnboardingProfilePicture from "./pages/onboarding/OnboardingProfilePicture";
import OnboardingEnglishPreference from "./pages/onboarding/OnboardingEnglishPreference";
import OnboardingTeacherStyle from "./pages/onboarding/OnboardingTeacherStyle";
import OnboardingWelcome from "./pages/onboarding/OnboardingWelcome";
import OnboardingAge from "./pages/onboarding/OnboardingAge";
import OnboardingEnglishLevel from "./pages/onboarding/OnboardingEnglishLevel";
import OnboardingLearningGoal from "./pages/onboarding/OnboardingLearningGoal";
import OnboardingCorrectionStyle from "./pages/onboarding/OnboardingCorrectionStyle";
import OnboardingInterests from "./pages/onboarding/OnboardingInterests";
import OnboardingSpeakingFrequency from "./pages/onboarding/OnboardingSpeakingFrequency";
import OnboardingDailyGoal from "./pages/onboarding/OnboardingDailyGoal";
import OnboardingAssessmentIntro from "./pages/onboarding/OnboardingAssessmentIntro";
import OnboardingAssessment from "./pages/onboarding/OnboardingAssessment";
import OnboardingAssessmentAnalysis from "./pages/onboarding/OnboardingAssessmentAnalysis";
import OnboardingPersonalizationReady from "./pages/onboarding/OnboardingPersonalizationReady";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() => setShowSplash(false)}
      />
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* Welcome Landing Page */}
        <Route
          path="/"
          element={
            localStorage.getItem("user")
              ? <Navigate to="/dashboard" replace />
              : <Welcome />
          }
        />

        {/* Optional Home Page */}
        <Route
          path="/home"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/progress"
          element={
            <MainLayout>
              <Progress />
            </MainLayout>
          }
        />

        <Route path="/test" element={<TestAPI />} />

        <Route
          path="/vocabulary"
          element={
            <MainLayout>
              <Vocabulary />
            </MainLayout>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <MainLayout>
              <Leaderboard />
            </MainLayout>
          }
        />

        <Route
          path="/ai-chat"
          element={
            <MainLayout>
              <AIChat />
            </MainLayout>
          }
        />

        <Route
          path="/grammar-check"
          element={
            <MainLayout>
              <GrammarChecker />
            </MainLayout>
          }
        />

        <Route
          path="/speaking-practice"
          element={
            <MainLayout>
              <SpeakingPractice />
            </MainLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <MainLayout>
              <Profile />
            </MainLayout>
          }
        />

        <Route
          path="/daily-challenge"
          element={
            <MainLayout>
              <DailyChallenge />
            </MainLayout>
          }
        />

        <Route
          path="/conversation"
          element={
            <MainLayout>
              <Conversation />
            </MainLayout>
          }
        />

        <Route
          path="/conversation-chat"
          element={
            <MainLayout>
              <ConversationChat />
            </MainLayout>
          }
        />

        <Route
          path="/roadmap"
          element={
            <MainLayout>
              <Roadmap />
            </MainLayout>
          }
        />

        <Route
          path="/lesson/:id"
          element={
            <MainLayout>
              <Lesson />
            </MainLayout>
          }
        />

        <Route
          path="/onboarding/language"
          element={<OnboardingLanguage />}
        />

        <Route
          path="/onboarding/name"
          element={<OnboardingName />}
        />

        <Route
          path="/onboarding/profile-picture"
          element={<OnboardingProfilePicture />}
        />

        <Route
          path="/onboarding/english-preference"
          element={<OnboardingEnglishPreference />}
        />

        <Route
          path="/onboarding/teacher-style"
          element={<OnboardingTeacherStyle />}
        />

        <Route
          path="/onboarding/welcome"
          element={<OnboardingWelcome />}
        />

        <Route
          path="/onboarding/age"
          element={<OnboardingAge />}
        />

        <Route
          path="/onboarding/english-level"
          element={<OnboardingEnglishLevel />}
        />

        <Route
          path="/onboarding/learning-goal"
          element={<OnboardingLearningGoal />}
        />

        <Route
          path="/onboarding/correction-style"
          element={<OnboardingCorrectionStyle />}
        />

        <Route
          path="/onboarding/interests"
          element={<OnboardingInterests />}
        />

        <Route
          path="/onboarding/speaking-frequency"
          element={<OnboardingSpeakingFrequency />}
        />

        <Route
          path="/onboarding/daily-goal"
          element={<OnboardingDailyGoal />}
        />

        <Route
          path="/onboarding/assessment-intro"
          element={<OnboardingAssessmentIntro />}
        />

        <Route
          path="/onboarding/assessment"
          element={<OnboardingAssessment />}
        />

        <Route
          path="/onboarding/assessment-analysis"
          element={<OnboardingAssessmentAnalysis />}
        />

        <Route
          path="/onboarding/personalization-ready"
          element={<OnboardingPersonalizationReady />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;