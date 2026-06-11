import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import api from "../services/api";
import MaterialCard from "../components/MaterialCard";

function Materials(){

  const navigate=useNavigate();

  const [materials,setMaterials]=useState([]);
  const [file,setFile]=useState(null);
  const [loading,setLoading]=useState(true);
  const [uploading,setUploading]=useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const itemsPerPage = 6;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleDeleteMaterial = async (id, title) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus materi "${title}"? Tindakan ini juga akan menghapus seluruh modul, kuis, dan data riwayat terkait.`)) {
      return;
    }
    try {
      await api.delete(`/materials/${id}`);
      // Refetch materials list
      const res = await api.get("/materials");
      setMaterials(res.data);
      const newTotalPages = Math.ceil(res.data.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error(error);
      showToast("Gagal menghapus materi", "error");
    }
  };

  const totalPages = Math.ceil(materials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMaterials = materials.slice(startIndex, startIndex + itemsPerPage);

  useEffect(()=>{

    let ignore=false;

    async function load(){

      try{

        const res=
          await api.get(
            "/materials"
          );

        if(ignore){
          return;
        }

        setMaterials(
          res.data
        );

      }catch(error){

        console.error(error);

      }finally{

        if(!ignore){
          setLoading(false);
        }

      }

    }

    load();

    return()=>{
      ignore=true;
    };

  },[]);

  const handleUpload=async(e)=>{

    e.preventDefault();

    if(!file){
      return;
    }

    if(file.size > 25 * 1024 * 1024){
      showToast("Ukuran file melebihi batas maksimal 25 MB", "error");
      return;
    }

    try{

      setUploading(true);

      const formData=
        new FormData();

      formData.append(
        "file",
        file
      );

      const res=
        await api.post(
          "/materials/upload",
          formData
        );

      navigate(
        `/materials/${res.data.materialId}`,
        { state: { fromUpload: true } }
      );

    }catch(error){

      console.error(error);

      showToast(
        error.response?.data?.message||
        "Upload gagal",
        "error"
      );

    }finally{

      setUploading(false);

    }

  };

  if(loading){
    return(
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 font-medium">Loading...</div>
      </div>
    );
  }

  return(
    <div className="p-4 md:p-8 h-full overflow-y-auto">

      <h1 className="text-3xl font-extrabold tracking-tight mb-8">
        Materi
      </h1>

      <form
        onSubmit={handleUpload}
        className="bg-white rounded-lg p-6 mb-8 border border-gray-200"
      >

        <h2 className="font-bold text-lg tracking-tight mb-4">
          Upload Materi
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">

          <label className="flex-1 bg-muted rounded-md p-4 cursor-pointer transition-all duration-200 hover:bg-gray-300">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white file:cursor-pointer file:transition-all file:duration-200 hover:file:bg-primary-dark"
              onChange={(e)=>
                setFile(
                  e.target.files[0]
                )
              }
            />
          </label>

          <button
            type="submit"
            disabled={uploading}
            className="bg-primary text-white h-12 px-6 rounded-md font-semibold transition-all duration-200 hover:bg-primary-dark hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
          >
            {
              uploading
                ? "Uploading..."
                : "Upload"
            }
          </button>

        </div>

        <p className="text-xs text-gray-500 mt-3 italic">
          * Format file yang didukung: PDF, DOCX, TXT (Maksimal 25MB)
        </p>

      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {currentMaterials.map(material=>(
          <MaterialCard
            key={material.id}
            material={material}
            onDelete={handleDeleteMaterial}
          />
        ))}

      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 shrink-0">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Sebelumnya
          </button>
          <span className="text-sm font-bold text-gray-500">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Selanjutnya
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-8 z-50 flex items-center gap-3 border px-5 py-3.5 rounded-lg shadow-lg animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800 shadow-green-100/50'
            : 'bg-red-50 border-red-200 text-red-800 shadow-red-100/50'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            toast.type === 'success'
              ? 'bg-green-500 animate-pulse'
              : 'bg-red-500 animate-pulse'
          }`} />
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}

    </div>
  );
}

export default Materials;