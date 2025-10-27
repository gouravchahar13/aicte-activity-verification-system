import { useState } from "react";
import { GraduationCap, Users } from "lucide-react";

interface LandingPageProps {
  onSelectRole: (role: "student" | "teacher", action: "login" | "signup") => void;
}

export function LandingPage({ onSelectRole }: LandingPageProps) {
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | null>(null);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden p-6 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1618005198919-d3d4b9de0b05?auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-blue-50/70 to-indigo-100/70 backdrop-blur-[2px]"></div>

      {/* Floating gradient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 rounded-full blur-[120px] opacity-40 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-300 rounded-full blur-[160px] opacity-30 animate-pulse delay-1000" />

      {/* Title Section */}
      <div className="text-center mb-16 relative z-10">
        <h1 className="text-6xl font-extrabold text-slate-800 drop-shadow-lg tracking-tight [text-shadow:2px_2px_8px_rgba(0,0,0,0.15)]">
          AICTE Activity Portal
        </h1>
        <p className="text-lg text-slate-600 mt-4 font-medium">
          Streamline your project submission and approval process with ease.
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid md:grid-cols-2 gap-10 mb-16 relative z-10">
        {[
          {
            role: "student",
            title: "Student",
            icon: GraduationCap,
            color: "from-blue-500 to-indigo-500",
            description: "Submit your projects and track progress in real-time.",
          },
          {
            role: "teacher",
            title: "Teacher",
            icon: Users,
            color: "from-emerald-500 to-green-400",
            description: "Review, verify, and approve student projects efficiently.",
          },
        ].map(({ role, title, icon: Icon, color, description }) => (
          <div
            key={role}
            onClick={() => setSelectedRole(role as "student" | "teacher")}
            className={`group relative cursor-pointer bg-gradient-to-br ${color} p-[2px] rounded-3xl transform transition-all duration-500 hover:scale-105 hover:rotate-[1deg] hover:shadow-2xl`}
          >
            <div className="bg-white rounded-3xl p-10 text-center transition-all duration-500 group-hover:translate-y-[-4px] group-hover:shadow-xl">
              <div className="transform group-hover:rotate-6 transition-transform duration-500">
                <Icon
                  className={`w-16 h-16 mx-auto mb-6 ${role === selectedRole ? "text-blue-600" : "text-slate-700"
                    }`}
                />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-2 drop-shadow-sm">
                {title}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Section */}
      {selectedRole && (
        <div className="relative z-10 bg-white/90 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-2xl p-10 text-center w-full max-w-md animate-[fadeIn_0.5s_ease-in-out]">
          <h3 className="text-2xl font-semibold text-slate-800 mb-6">
            Continue as{" "}
            <span
              className={`${selectedRole === "student" ? "text-blue-600" : "text-green-600"
                } font-bold`}
            >
              {selectedRole === "student" ? "Student" : "Teacher"}
            </span>
          </h3>
          <div className="flex justify-center gap-6">
            <button
              onClick={() => onSelectRole(selectedRole, "login")}
              className="px-8 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 shadow-md hover:shadow-lg transform hover:translate-y-[-2px] transition-all"
            >
              Login
            </button>
            <button
              onClick={() => onSelectRole(selectedRole, "signup")}
              className="px-8 py-3 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 shadow-sm hover:shadow-md transform hover:translate-y-[-2px] transition-all"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="absolute bottom-5 text-sm text-slate-500 z-10">
        © 2025 AICTE Verification Portal | Designed with ❤️
      </footer>
    </div>
  );
}
