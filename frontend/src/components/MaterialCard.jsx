import {Link} from "react-router-dom";
import {LuTrash, LuExternalLink} from "react-icons/lu";

function MaterialCard({material, onDelete}){

  const extension=
    material.file_url
      ?.split(".")
      ?.pop()
      ?.toUpperCase();

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (material.file_url) {
      let backendHost = "http://localhost:5000";
      if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith("http")) {
        backendHost = new URL(import.meta.env.VITE_API_URL).origin;
      } else if (import.meta.env.VITE_API_URL === "/api") {
        backendHost = window.location.origin;
      }

      const url = material.file_url.startsWith("http")
        ? material.file_url
        : `${backendHost}/${material.file_url.replace(/\\/g, "/")}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(material.id, material.title);
  };

  return(
    <Link
      to={`/materials/${material.id}`}
      className="group bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between transition-all duration-200 hover:scale-[1.01] hover:shadow-md h-full cursor-pointer text-left"
    >
      <div>
        <div className="flex justify-between items-start gap-2 mb-3">
          <h3 className="font-bold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors duration-200 truncate flex-1 min-w-0">
            {material.title}
          </h3>
          {extension && (
            <span className="text-[10px] font-extrabold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase shrink-0">
              {extension}
            </span>
          )}
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${
              material.summary_generated ? "bg-secondary" : "bg-gray-300"
            }`} />
            <span className={`text-xs font-semibold ${
              material.summary_generated ? "text-secondary" : "text-gray-400"
            }`}>
              Summary {material.summary_generated ? "Ready" : "Not Generated"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${
              material.learning_path_generated ? "bg-secondary" : "bg-gray-300"
            }`} />
            <span className={`text-xs font-semibold ${
              material.learning_path_generated ? "text-secondary" : "text-gray-400"
            }`}>
              Learning Path {material.learning_path_generated ? "Ready" : "Not Generated"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end pt-4 border-t border-gray-100 gap-1 shrink-0">
        {material.file_url && (
          <button
            onClick={handleDownload}
            title="Lihat Dokumen Asli"
            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-md transition-all cursor-pointer animate-in fade-in"
          >
            <LuExternalLink size={16} />
          </button>
        )}

        <button
          onClick={handleDeleteClick}
          title="Hapus Materi"
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all cursor-pointer"
        >
          <LuTrash size={16} />
        </button>
      </div>
    </Link>
  );
}

export default MaterialCard;