import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { supabase, Project, Profile } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

type ProjectWithStudent = Project & {
  student: Profile;
};

export function TeacherPortal() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">(
    "pending"
  );

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("projects")
        .select(`*, student:profiles!projects_student_id_fkey(*)`)
        .order("submitted_at", { ascending: false });

      if (filter !== "all") query = query.eq("status", filter);

      const { data, error } = await query;
      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (projectId: string) => {
    setError("");
    setSuccess("");
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          status: "approved",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (error) throw error;
      setSuccess("Project approved successfully!");
      fetchProjects();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to approve project");
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("project-files")
        .download(fileUrl);
      if (error) throw error;
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Failed to download file");
    }
  };

  const pendingCount = projects.filter((p) => p.status === "pending").length;
  const approvedCount = projects.filter((p) => p.status === "approved").length;

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 py-10 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-5xl font-bold text-slate-800 mb-2">
            Project Review Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            Approve or review student submissions in real-time
          </p>
        </motion.div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Total Projects",
              value: projects.length,
              icon: FileText,
              color: "blue",
            },
            {
              title: "Pending Review",
              value: pendingCount,
              icon: Clock,
              color: "yellow",
            },
            {
              title: "Approved",
              value: approvedCount,
              icon: CheckCircle,
              color: "green",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className={`relative overflow-hidden bg-white/80 backdrop-blur-lg border-l-4 border-${card.color}-500 shadow-xl rounded-2xl p-6`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">{card.title}</p>
                  <p className="text-4xl font-bold text-slate-800">
                    {card.value}
                  </p>
                </div>
                <card.icon
                  className={`w-12 h-12 text-${card.color}-500 opacity-80`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 bg-white/80 backdrop-blur-md rounded-lg p-1 shadow-md w-fit mx-auto">
          {["pending", "approved", "all"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-6 py-2 rounded-md font-medium transition-all ${filter === type
                  ? type === "pending"
                    ? "bg-yellow-500 text-white"
                    : type === "approved"
                      ? "bg-green-500 text-white"
                      : "bg-blue-500 text-white"
                  : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* Projects Section */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            className="text-center py-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No projects found</p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                whileHover={{ scale: 1.01 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-slate-200 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                      {project.title}
                    </h3>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p>
                        <span className="font-medium">Student:</span>{" "}
                        {project.student.full_name}
                      </p>
                      <p>
                        <span className="font-medium">Submitted:</span>{" "}
                        {new Date(project.submitted_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {project.status === "approved" ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      Pending
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                  <FileText className="w-4 h-4" />
                  {project.file_name}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      handleDownload(project.file_url, project.file_name)
                    }
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors font-medium flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  {project.status === "pending" && (
                    <button
                      onClick={() => handleApprove(project.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
