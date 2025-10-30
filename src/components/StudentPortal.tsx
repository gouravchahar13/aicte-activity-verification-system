import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, Project } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { extractTextFromFile } from "./ExtractText";
import { checkPlagiarism } from "./GeminiCheck";

export function StudentPortal() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("student_id", user?.id)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      if (!validTypes.includes(selectedFile.type)) {
        setError("Please upload a PDF, DOCX, or TXT file");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setError("Please provide both title and file");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const text = await extractTextFromFile(file);
      const isPlagiarized = await checkPlagiarism(text);
      if (isPlagiarized) {
        setError(
          "Your project appears to contain plagiarized content. Please revise it before submitting."
        );
        setSubmitting(false);
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      await supabase.from("projects").insert({
        title: title.trim(),
        student_id: user?.id,
        file_url: fileName,
        file_name: file.name,
      });

      setSuccess("Project submitted successfully!");
      setTitle("");
      setFile(null);
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      fetchProjects();
    } catch (err: any) {
      setError(err.message || "Failed to submit project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10 bg-gradient-to-b from-slate-50 to-slate-100 rounded-3xl shadow-2xl mt-6">
      {/* Submission Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-lg bg-white/70 rounded-2xl shadow-2xl p-8 border border-slate-200"
      >
        <h2 className="text-4xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          📄 Submit New Project
        </h2>

        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 shadow-md"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2 shadow-md"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
              placeholder="Enter your project title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Upload File (PDF, DOCX, TXT)
            </label>
            <div className="relative group">
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all cursor-pointer"
              />
              <Upload className="absolute right-3 top-3 w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            {file && (
              <p className="mt-3 text-sm text-slate-600 flex items-center gap-2 italic">
                <FileText className="w-4 h-4" />
                {file.name}
              </p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold tracking-wide flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {submitting ? "Submitting..." : "Submit Project"}
          </motion.button>
        </form>
      </motion.div>

      {/* Projects List */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="backdrop-blur-lg bg-white/70 rounded-2xl shadow-2xl p-8 border border-slate-200"
      >
        <h2 className="text-4xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          📚 My Projects
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No projects submitted yet</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                whileHover={{ scale: 1.02, boxShadow: "0px 10px 25px rgba(0,0,0,0.1)" }}
                className="border border-slate-200 rounded-xl p-6 bg-gradient-to-r from-slate-50 to-slate-100 transition-transform"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-2">
                      Submitted:{" "}
                      {new Date(project.submitted_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {project.file_name}
                    </p>
                  </div>
                  <div>
                    {project.status === "approved" ? (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium shadow-sm">
                        <CheckCircle className="w-4 h-4" />
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium shadow-sm">
                        <Clock className="w-4 h-4" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
