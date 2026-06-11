import {useEffect,useState} from "react";
import {useNavigate,useParams,useLocation} from "react-router-dom";
import MarkdownRenderer from "../components/MarkdownRenderer";
import {LuFileText,LuBookOpen,LuSquarePen,LuBot,LuLock,LuLockOpen,LuCircleCheck,LuSparkles,LuChevronLeft,LuChevronRight,LuPartyPopper,LuThumbsUp,LuPencil,LuCheck,LuTrash,LuExternalLink,LuX} from "react-icons/lu";
import api from "../services/api";

function MaterialDetail(){

  const {id}=useParams();
  const navigate=useNavigate();
  const location=useLocation();

  const [material,setMaterial]=useState(null);
  const [modules,setModules]=useState([]);
  const [progress,setProgress]=useState(null);
  const [quiz,setQuiz]=useState(null);

  const queryParams = new URLSearchParams(location.search);
  const initialType = queryParams.get("type") || "summary";
  const [selectedType,setSelectedType]=useState(initialType);
  const [selectedModule,setSelectedModule]=useState(null);

  const [generatingSummary,setGeneratingSummary]=useState(false);
  const [generatingPath,setGeneratingPath]=useState(false);
  const [generatingQuiz,setGeneratingQuiz]=useState(false);

  const [question,setQuestion]=useState("");
  const [chat,setChat]=useState([]);
  const [asking,setAsking]=useState(false);

  const [quizQuestions,setQuizQuestions]=useState([]);
  const [quizAnswers,setQuizAnswers]=useState({});
  const [quizResult,setQuizResult]=useState(null);
  const [loadingQuizQuestions,setLoadingQuizQuestions]=useState(false);
  const [toast, setToast] = useState(null);
  const [retakingQuiz, setRetakingQuiz] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  const handleSaveTitle = async () => {
    if (!tempTitle || !tempTitle.trim()) {
      showToast("Judul materi tidak boleh kosong", "error");
      return;
    }
    try {
      await api.put(`/materials/${id}`, { title: tempTitle });
      setMaterial(prev => ({ ...prev, title: tempTitle }));
      setIsEditingTitle(false);
      showToast("Judul materi berhasil diperbarui!", "success");
    } catch (error) {
      console.error(error);
      showToast("Gagal memperbarui judul", "error");
    }
  };

  const handleDownloadSource = () => {
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

  const handleDeleteMaterialDetail = async () => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus materi "${material.title}"? Tindakan ini juga akan menghapus seluruh modul, kuis, dan data riwayat terkait.`)) {
      return;
    }
    try {
      await api.delete(`/materials/${id}`);
      navigate("/materials");
    } catch (error) {
      console.error(error);
      showToast("Gagal menghapus materi", "error");
    }
  };

  useEffect(()=>{

    let ignore=false;

    async function load(){

      try{

        const [
          materialRes,
          modulesRes,
          progressRes,
          quizRes
        ]=await Promise.all([
          api.get(`/materials/${id}`),
          api.get(`/materials/${id}/modules`),
          api.get(`/materials/${id}/progress`),
          api.get(`/quizzes/material/${id}`)
        ]);

        if(ignore){
          return;
        }

        setMaterial(materialRes.data);
        setModules(modulesRes.data);
        setProgress(progressRes.data);
        setQuiz(quizRes.data);

      }catch(error){

        console.error(error);

      }

    }

    load();

    return()=>{
      ignore=true;
    };

  },[id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    if (type) {
      setSelectedType(type);
      if (type !== "module") {
        setSelectedModule(null);
      }
    }
  }, [location.search]);

  useEffect(() => {
    if (location.state?.fromUpload) {
      showToast("Materi berhasil diunggah!", "success");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const reloadData=async()=>{

    try{

      const [
        materialRes,
        modulesRes,
        progressRes,
        quizRes
      ]=await Promise.all([
        api.get(`/materials/${id}`),
        api.get(`/materials/${id}/modules`),
        api.get(`/materials/${id}/progress`),
        api.get(`/quizzes/material/${id}`)
      ]);

      setMaterial(materialRes.data);
      setModules(modulesRes.data);
      setProgress(progressRes.data);
      setQuiz(quizRes.data);

    }catch(error){

      console.error(error);

    }

  };

  const isModuleUnlocked=(index)=>{

    if(index===0){
      return true;
    }

    return !!modules[
      index-1
    ]?.completed;

  };

  const allModulesCompleted=
    modules.length>0 &&
    modules.every(
      module=>
        module.completed===true||module.completed===1
    );

  const generateSummary=async()=>{

    try{

      setGeneratingSummary(true);

      await api.post(
        `/ai/summary/${id}`
      );

      await reloadData();
      showToast("Ringkasan materi berhasil dibuat!", "success");

    }catch(error){

      console.error(error);
      showToast("Gagal membuat ringkasan materi", "error");

    }finally{

      setGeneratingSummary(false);

    }

  };

  const generateLearningPath=async()=>{

    try{

      setGeneratingPath(true);

      await api.post(
        `/ai/learning-path/${id}`
      );

      await reloadData();
      showToast("Learning Path berhasil dibuat!", "success");

    }catch(error){

      console.error(error);
      showToast("Gagal membuat Learning Path", "error");

    }finally{

      setGeneratingPath(false);

    }

  };

  const generateQuiz=async()=>{

    try{

      setGeneratingQuiz(true);

      await api.post(
        `/ai/quiz/${id}`
      );

      await reloadData();
      setSelectedType("quiz");
      setSelectedModule(null);
      showToast("Kuis kognitif berhasil dibuat!", "success");

    }catch(error){

      console.error(error);
      showToast("Gagal membuat kuis", "error");

    }finally{

      setGeneratingQuiz(false);

    }

  };

  const completeModule=async(moduleId)=>{

    try{

      await api.post(
        `/materials/modules/${moduleId}/complete`
      );

      await reloadData();
      showToast("Modul telah diselesaikan!", "success");

    }catch(error){

      console.error(error);
      showToast("Gagal menyelesaikan modul", "error");

    }

  };

  const askTutor=async()=>{

    if(!question.trim()){
      return;
    }

    try{

      setAsking(true);

      const res=
        await api.post(
          `/ai/tutor/${id}`,
          {
            question
          }
        );

      setChat(prev=>[
        ...prev,
        {
          question,
          answer:res.data.answer
        }
      ]);

      setQuestion("");

    }catch(error){

      console.error(error);
      showToast("Gagal bertanya ke Tutor AI", "error");

    }finally{

      setAsking(false);

    }

  };

  const loadQuizDetails=async(quizId)=>{
    try{
      setLoadingQuizQuestions(true);
      const res=await api.get(`/quizzes/${quizId}`);
      setQuizQuestions(res.data.questions || []);
      setQuizResult(null);
      setQuizAnswers({});
    }catch(error){
      console.error(error);
    }finally{
      setLoadingQuizQuestions(false);
    }
  };

  const handleQuizSubmit=async()=>{
    if(!quiz) return;
    try{
      const res=await api.post(`/quizzes/${quiz.id}/submit`,{
        answers:quizAnswers
      });
      setQuizResult(res.data);
      setRetakingQuiz(false);
      await reloadData();
      showToast("Kuis telah diselesaikan!", "success");
    }catch(error){
      console.error(error);
      showToast("Gagal mengirim jawaban kuis", "error");
    }
  };

  useEffect(()=>{
    if(selectedType==="quiz" && quiz){
      loadQuizDetails(quiz.id);
    }
  },[selectedType,quiz]);

  // Build learning path steps for bottom navigation
  const steps = [];
  steps.push({
    type: "summary",
    title: "Ringkasan Materi",
    locked: false,
  });

  modules.forEach((mod, index) => {
    steps.push({
      type: "module",
      module: mod,
      title: mod.title,
      locked: !isModuleUnlocked(index),
    });
  });

  if (modules.length > 0) {
    steps.push({
      type: "quiz",
      title: "Final Quiz",
      locked: !allModulesCompleted,
    });
  }

  let currentStepIndex = -1;
  if (selectedType === "summary") {
    currentStepIndex = 0;
  } else if (selectedType === "module" && selectedModule) {
    currentStepIndex = steps.findIndex(
      (s) => s.type === "module" && s.module?.id === selectedModule.id
    );
  } else if (selectedType === "quiz") {
    currentStepIndex = steps.findIndex((s) => s.type === "quiz");
  }

  const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
  const nextStep = currentStepIndex !== -1 && currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : null;
  const displayAttempt = quizResult || (!retakingQuiz ? quiz?.latest_attempt : null);

  if(!material){

    return(
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 font-medium">Loading...</div>
      </div>
    );

  }

  return(
    <div className="h-[calc(100vh-64px)] flex flex-col min-h-0 bg-page-bg">

      <div className="p-4 md:p-8 flex-1 min-h-0 overflow-y-auto lg:overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">

          {/* Main Content */}
          <div className="col-span-1 lg:col-span-8 flex flex-col h-full min-h-0">

            <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-full min-h-0 overflow-hidden">

              {/* Scrollable Content Area */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto">

              {/* Title Header with Inline Edit Icon */}
              <div className="mb-4">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      className="text-2xl font-extrabold tracking-tight text-foreground border-2 border-primary rounded px-2.5 py-1 flex-1 bg-white focus:outline-none focus-visible:outline-none"
                    />
                    <button
                      onClick={handleSaveTitle}
                      title="Simpan"
                      className="w-10 h-10 flex items-center justify-center bg-secondary text-white rounded hover:bg-secondary-dark transition-all cursor-pointer shrink-0"
                    >
                      <LuCheck size={20} />
                    </button>
                    <button
                      onClick={() => setIsEditingTitle(false)}
                      title="Batal"
                      className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-all cursor-pointer shrink-0"
                    >
                      <LuX size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                      {material.title}
                    </h1>
                    <button
                      onClick={() => {
                        setTempTitle(material.title);
                        setIsEditingTitle(true);
                      }}
                      title="Edit Judul"
                      className="text-gray-400 hover:text-primary p-1 rounded transition-colors cursor-pointer shrink-0 mt-1"
                    >
                      <LuPencil size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons: Document Source & Delete */}
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4 shrink-0">
                {material.file_url && (
                  <button
                    onClick={handleDownloadSource}
                    title="Lihat Dokumen Asli"
                    className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3.5 py-2 rounded-md text-xs font-bold hover:bg-gray-50 hover:text-primary transition-all cursor-pointer"
                  >
                    <LuExternalLink size={14} /> Dokumen Asli
                  </button>
                )}

                <button
                  onClick={handleDeleteMaterialDetail}
                  title="Hapus Materi"
                  className="flex items-center gap-1.5 border border-red-200 text-red-600 px-3.5 py-2 rounded-md text-xs font-bold hover:bg-red-50 transition-all cursor-pointer"
                >
                  <LuTrash size={14} /> Hapus Materi
                </button>
              </div>

              {progress&&(
                <>
                  <div className="mb-2 text-sm font-medium text-gray-500">
                    {progress.completedModules}
                    {" / "}
                    {progress.totalModules}
                    {" Modul Selesai"}
                  </div>

                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Progress Belajar</span>
                    <span className="text-sm font-bold text-primary">{progress.percentage}%</span>
                  </div>

                  <div className="w-full bg-muted rounded-md h-3 mb-8">
                    <div
                      className="bg-primary h-3 rounded-md transition-all duration-500"
                      style={{
                        width:`${progress.percentage}%`
                      }}
                    />
                  </div>
                </>
              )}

              {/* Summary Section */}
            {selectedType==="summary"&&(
              <>
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  Ringkasan Materi
                </h2>

                {material.summary?(
                  <MarkdownRenderer content={material.summary} />
                ):(
                  <button
                    onClick={generateSummary}
                    disabled={generatingSummary}
                    className="bg-primary text-white h-14 px-6 rounded-md font-semibold transition-all duration-200 hover:bg-primary-dark hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
                  >
                    {
                      generatingSummary
                        ? "Generating..."
                        : "Generate Summary"
                    }
                  </button>
                )}
              </>
            )}

            {/* Module Section */}
            {selectedType==="module"&&selectedModule&&(
              <>
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                  {selectedModule.title}
                </h2>

                <div className="inline-block text-xs font-semibold bg-muted text-gray-500 px-3 py-1 rounded-md uppercase tracking-wider mb-6">
                  {selectedModule.estimated_minutes} menit
                </div>

                <MarkdownRenderer content={selectedModule.content} />

                {!selectedModule.completed&&(
                  <button
                    onClick={()=>
                      completeModule(
                        selectedModule.id
                      )
                    }
                    className="mt-8 bg-secondary text-white h-14 px-6 rounded-md font-semibold transition-all duration-200 hover:bg-secondary-dark hover:scale-105 cursor-pointer"
                  >
                    Tandai Selesai
                  </button>
                )}

                {!!selectedModule.completed&&(
                  <div className="mt-8 bg-green-50 rounded-md p-4 text-secondary font-bold flex items-center gap-2">
                    <LuCircleCheck size={18} /> Modul sudah selesai
                  </div>
                )}
              </>
            )}

            {/* Quiz Section */}
            {selectedType==="quiz"&&(
              <>
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  Final Quiz
                </h2>

                {!quiz ? (
                  <>
                    <p className="text-gray-600 mb-6">
                      Quiz ini menguji seluruh materi yang telah dipelajari.
                    </p>
                    <button
                      onClick={generateQuiz}
                      disabled={generatingQuiz}
                      className="bg-accent text-white h-14 px-6 rounded-md font-semibold transition-all duration-200 hover:bg-accent-dark hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
                    >
                      {generatingQuiz ? "Generating..." : "Generate Quiz"}
                    </button>
                  </>
                ) : loadingQuizQuestions ? (
                  <div className="py-12 text-center text-gray-400 font-medium">
                    Memuat pertanyaan quiz...
                  </div>
                ) : displayAttempt ? (
                  <div className="text-center py-8 bg-slate-50 border border-gray-200 rounded-lg p-6 max-w-lg mx-auto shadow-sm">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                      {displayAttempt.percentage>=80 ? <LuPartyPopper size={32} className="text-secondary"/> : displayAttempt.percentage>=60 ? <LuThumbsUp size={32} className="text-accent"/> : <LuBookOpen size={32} className="text-red-500"/>}
                    </div>

                    <h3 className="text-xl font-extrabold tracking-tight mb-1 text-foreground">
                      Kuis Telah Diselesaikan!
                    </h3>
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
                      Hasil Pengerjaan Terakhir
                    </p>

                    <div className={`text-5xl font-extrabold mb-2 ${
                      displayAttempt.percentage>=80
                        ? "text-secondary"
                        : displayAttempt.percentage>=60
                        ? "text-accent"
                        : "text-red-500"
                    }`}>
                      {displayAttempt.percentage}%
                    </div>

                    <p className="text-gray-500 text-sm font-bold mb-8">
                      {displayAttempt.score} / {displayAttempt.total_questions || displayAttempt.total} Jawaban Benar
                    </p>

                    <button
                      onClick={() => {
                        setRetakingQuiz(true);
                        setQuizResult(null);
                        setQuizAnswers({});
                      }}
                      className="bg-primary text-white h-12 px-8 rounded-md font-bold transition-all duration-200 hover:bg-primary-dark hover:scale-105 cursor-pointer text-sm shadow-sm"
                    >
                      Kerjakan Ulang Kuis
                    </button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-gray-600 mb-8 text-left">
                      Jawablah semua pertanyaan di bawah ini dengan memilih satu jawaban yang paling tepat.
                    </p>

                    {quizQuestions.map((question, index) => (
                      <div
                        key={question.id}
                        className="bg-muted rounded-lg p-6 border border-gray-200/50 mb-6 text-left"
                      >
                        <h3 className="font-bold text-base tracking-tight mb-4 flex items-start">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-white rounded-md text-xs font-extrabold mr-3 shrink-0 mt-0.5">
                            {index+1}
                          </span>
                          <span className="text-gray-800">{question.question}</span>
                        </h3>

                        <div className="space-y-2.5">
                          {["A","B","C","D"].map((option) => {
                            const text = question[`option_${option.toLowerCase()}`];
                            const isSelected = quizAnswers[question.id] === option;

                            return (
                              <label
                                key={option}
                                className={`flex items-center gap-3 rounded-md p-3 cursor-pointer transition-all duration-200 border-2 text-sm ${
                                  isSelected
                                    ? "bg-primary/10 border-primary"
                                    : "bg-white border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                                  isSelected
                                    ? "bg-primary text-white"
                                    : "bg-gray-150 text-gray-500"
                                }`}>
                                  {option}
                                </div>

                                <input
                                  type="radio"
                                  name={`q-${question.id}`}
                                  value={option}
                                  checked={isSelected}
                                  onChange={(e) =>
                                    setQuizAnswers(prev => ({
                                      ...prev,
                                      [question.id]: e.target.value
                                    }))
                                  }
                                  className="hidden"
                                />

                                <span className={`font-medium ${
                                  isSelected ? "text-foreground" : "text-gray-600"
                                }`}>
                                  {text}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={handleQuizSubmit}
                      className="w-full bg-secondary text-white h-14 rounded-md font-bold text-base transition-all duration-200 hover:bg-secondary-dark hover:scale-[1.02] cursor-pointer mt-8"
                    >
                      Submit Quiz
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Tutor Section */}
            {selectedType==="tutor"&&(
              <>
                <h2 className="text-2xl font-bold tracking-tight mb-6">
                  AI Tutor
                </h2>

                <div className="space-y-4 mb-6">

                  {chat.map((item,index)=>(
                    <div
                      key={index}
                      className="space-y-3"
                    >
                      {/* User message */}
                      <div className="flex justify-end">
                        <div className="bg-primary text-white rounded-lg rounded-tr-none p-4 max-w-[80%]">
                          <div className="text-xs font-semibold uppercase tracking-wider mb-1 text-blue-100">
                            Anda
                          </div>
                          <div className="font-medium">
                            {item.question}
                          </div>
                        </div>
                      </div>

                      {/* AI answer */}
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg rounded-tl-none p-4 max-w-[80%] border border-gray-200/50">
                          <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-gray-500">
                            EduMentor AI
                          </div>
                          <MarkdownRenderer content={item.answer} />
                        </div>
                      </div>
                    </div>
                  ))}

                </div>

                <div className="bg-muted rounded-lg p-4">
                  <textarea
                    value={question}
                    onChange={(e)=>
                      setQuestion(
                        e.target.value
                      )
                    }
                    rows={3}
                    className="w-full bg-white border border-gray-200 focus:border-primary focus-visible:outline-none focus:outline-none rounded-md p-4 mb-3 text-foreground font-medium placeholder:text-gray-400 transition-all duration-200 resize-none"
                    placeholder="Tanyakan sesuatu tentang materi ini..."
                  />

                  <button
                    onClick={() => {
                      askTutor();
                    }}
                    disabled={asking}
                    className="bg-primary text-white h-12 px-6 rounded-md font-semibold transition-all duration-200 hover:bg-primary-dark hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
                  >
                    {
                      asking
                        ? "Thinking..."
                        : "Kirim"
                    }
                  </button>
                </div>
              </>
            )}

            </div> {/* This closes the scrollable content area */}

          </div>

        </div>

        {/* Sidebar Panel - statis mentrok scrollable */}
        <div className="col-span-1 lg:col-span-4 flex flex-col h-full min-h-0">

          <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-full min-h-0 overflow-hidden">

            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200 shrink-0 flex justify-between items-center bg-gray-50">

              <h2 className="font-bold text-lg tracking-tight">
                Learning Path
              </h2>

              {modules.length===0&&(
                <button
                  onClick={generateLearningPath}
                  disabled={generatingPath}
                  className="bg-primary text-white px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 hover:bg-primary-dark hover:scale-105 disabled:opacity-60 cursor-pointer"
                >
                  {
                    generatingPath
                      ? "Generating..."
                      : "Generate"
                  }
                </button>
              )}

            </div>

            {/* Scrollable Modules List */}
            <div className="flex-1 p-6 overflow-y-auto space-y-2">

              {/* Summary Button */}
              <button
                onClick={()=>{
                  setSelectedType("summary");
                  setSelectedModule(null);
                }}
                className={`w-full text-left rounded-lg p-4 font-medium transition-all duration-200 cursor-pointer border-2 ${
                  selectedType==="summary"
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-muted border-transparent text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="flex items-center gap-2"><LuFileText size={18}/> Ringkasan Materi</span>
              </button>

              {/* Module Buttons */}
              {modules.map((module,index)=>{

                const unlocked=
                  isModuleUnlocked(index);

                return(

                  <button
                    key={module.id}
                    disabled={!unlocked}
                    onClick={()=>{

                      if(!unlocked){
                        return;
                      }

                      setSelectedType(
                        "module"
                      );

                      setSelectedModule(
                        module
                      );

                    }}
                    className={`w-full text-left rounded-lg p-4 transition-all duration-200 border-2 ${
                      selectedType==="module"&&selectedModule?.id===module.id
                        ? "bg-primary/10 border-primary"
                        : unlocked
                        ? "bg-muted border-transparent hover:bg-gray-200 cursor-pointer"
                        : "bg-muted border-transparent opacity-50 cursor-not-allowed"
                    }`}
                  >

                    <div className="flex justify-between items-center">

                      <div className="font-medium text-sm text-gray-500 uppercase tracking-wider">
                        Modul {index+1}
                      </div>

                      <div className="text-lg">
                        {
                          module.completed
                            ? <LuCircleCheck size={18} className="text-secondary"/>
                            : unlocked
                            ? <LuLockOpen size={18} className="text-gray-400"/>
                            : <LuLock size={18} className="text-gray-400"/>
                        }
                      </div>

                    </div>

                    <div className="font-semibold text-foreground mt-1">
                      {module.title}
                    </div>

                  </button>

                );

              })}

              {/* Quiz & Tutor Buttons */}
              <div className="pt-4 mt-4 border-t-2 border-gray-200 space-y-2">

                <button
                  disabled={
                    !allModulesCompleted
                  }
                  onClick={()=>{
                    if(!allModulesCompleted){
                      return;
                    }

                    setSelectedType(
                      "quiz"
                    );

                    setSelectedModule(
                      null
                    );
                  }}
                  className={`w-full text-left rounded-lg p-4 transition-all duration-200 border-2 ${
                    selectedType==="quiz"
                      ? "bg-accent/10 border-accent text-accent font-bold"
                      : allModulesCompleted
                      ? "bg-muted border-transparent hover:bg-gray-200 cursor-pointer"
                      : "bg-muted border-transparent opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="font-semibold flex items-center gap-2"><LuSquarePen size={18}/> Final Quiz</div>

                  {
                    !allModulesCompleted&&(
                      <div className="text-xs font-medium text-red-400 mt-1">
                        Selesaikan semua modul terlebih dahulu
                      </div>
                    )
                  }

                </button>

                <button
                  onClick={()=>{
                    setSelectedType("tutor");
                    setSelectedModule(null);
                  }}
                  className={`w-full text-left rounded-lg p-4 font-semibold transition-all duration-200 cursor-pointer border-2 ${
                    selectedType==="tutor"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted border-transparent text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="flex items-center gap-2"><LuBot size={18}/> AI Tutor</span>
                </button>

              </div>

            </div>

          </div>

        </div>
      </div>
    </div>

      {/* Bottom Navigation as Page Footer */}
      {selectedType !== "tutor" && currentStepIndex !== -1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-6 md:px-8 py-4 bg-white shrink-0">
          {/* Previous Button */}
          <div className="w-1/3 flex justify-start">
            {prevStep ? (
              <button
                onClick={() => {
                  if (prevStep.type === "summary") {
                    setSelectedType("summary");
                    setSelectedModule(null);
                  } else if (prevStep.type === "module") {
                    setSelectedType("module");
                    setSelectedModule(prevStep.module);
                  }
                }}
                className="flex items-center gap-3 text-sm text-gray-500 hover:text-primary transition-colors duration-200 cursor-pointer group text-left min-w-0"
              >
                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-200 shrink-0">
                  <LuChevronLeft size={16} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:inline">Sebelumnya</span>
                  <span className="truncate max-w-[80px] sm:max-w-[150px] md:max-w-[180px] font-semibold text-gray-700 group-hover:text-primary">
                    {prevStep.title}
                  </span>
                </div>
              </button>
            ) : (
              <div />
            )}
          </div>

          {/* Current Item Title */}
          <div className="w-1/3 flex justify-center text-center">
            <span className="text-sm font-bold text-foreground px-2 sm:px-4 truncate max-w-[100px] sm:max-w-[180px] md:max-w-[240px]">
              {steps[currentStepIndex].title}
            </span>
          </div>

          {/* Next Button */}
          <div className="w-1/3 flex justify-end">
            {nextStep ? (
              <button
                onClick={async () => {
                  // If current module is incomplete, complete it
                  if (selectedType === "module" && selectedModule && !selectedModule.completed) {
                    await completeModule(selectedModule.id);
                  }

                  // Navigate to the next step
                  if (nextStep.type === "module") {
                    setSelectedType("module");
                    setSelectedModule(nextStep.module);
                  } else if (nextStep.type === "quiz") {
                    setSelectedType("quiz");
                    setSelectedModule(null);
                  }
                }}
                className="flex items-center gap-3 text-sm text-gray-500 hover:text-primary transition-colors duration-200 text-right group min-w-0 cursor-pointer"
              >
                <div className="flex flex-col min-w-0 items-end">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:inline">Selanjutnya</span>
                  <span className="truncate max-w-[80px] sm:max-w-[150px] md:max-w-[180px] font-semibold text-gray-700 group-hover:text-primary">
                    {nextStep.title}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-200 shrink-0">
                  <LuChevronRight size={16} />
                </div>
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-8 z-50 flex items-center gap-3 border px-5 py-3.5 rounded-lg shadow-lg animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800 shadow-green-100/50'
            : toast.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800 shadow-red-100/50'
            : 'bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100/50'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            toast.type === 'success'
              ? 'bg-green-500 animate-pulse'
              : toast.type === 'error'
              ? 'bg-red-500 animate-pulse'
              : 'bg-blue-500 animate-pulse'
          }`} />
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}

    </div>
  );
}

export default MaterialDetail;