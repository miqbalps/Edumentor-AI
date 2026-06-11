import {useEffect,useState} from "react";
import {LuSquarePen, LuCircleCheck, LuBookOpen, LuChevronRight, LuTrash} from "react-icons/lu";
import api from "../services/api";

function QuizHistory(){

  const [history,setHistory]=useState([]);
  const [loading,setLoading]=useState(true);

  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const itemsPerPage = 5;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleDeleteAttempt = async (e, attemptId) => {
    e.stopPropagation();
    if (!window.confirm("Apakah Anda yakin ingin menghapus riwayat kuis ini?")) {
      return;
    }
    try {
      await api.delete(`/quizzes/attempts/${attemptId}`);
      const res = await api.get("/quizzes/history");
      setHistory(res.data);
      const newTotalPages = Math.ceil(res.data.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error(error);
      showToast("Gagal menghapus riwayat kuis", "error");
    }
  };

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHistory = history.slice(startIndex, startIndex + itemsPerPage);

  useEffect(()=>{

    let ignore=false;

    async function loadHistory(){

      try{

        const res=
          await api.get(
            "/quizzes/history"
          );

        if(ignore){
          return;
        }

        setHistory(
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

    loadHistory();

    return()=>{
      ignore=true;
    };

  },[]);

  const handleViewDetails = async (attemptId) => {
    if (!attemptId) return;
    try {
      setLoadingReview(true);
      setSelectedQuizId(attemptId);
      const res = await api.get(`/quizzes/attempts/${attemptId}/review`);
      setReviewData(res.data);
    } catch (error) {
      console.error(error);
      showToast("Gagal memuat detail kuis", "error");
      setSelectedQuizId(null);
    } finally {
      setLoadingReview(false);
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
        Quiz History
      </h1>

      {history.length===0&&(
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <LuSquarePen size={40} className="text-gray-300 mx-auto mb-4"/>
          <div className="text-gray-400 font-medium">
            Belum ada riwayat quiz
          </div>
        </div>
      )}

      <div className="space-y-4">

        {currentHistory.map(item=>{

          const percentage=Math.round(
            (
              item.score/
              item.total_questions
            )*100
          );

          const scoreColor=
            percentage>=80
              ? "text-secondary"
              : percentage>=60
              ? "text-accent"
              : "text-red-500";

          const bgColor=
            percentage>=80
              ? "bg-green-50"
              : percentage>=60
              ? "bg-amber-50"
              : "bg-red-50";

          return(

            <div
              key={item.id}
              onClick={() => handleViewDetails(item.id)}
              className={`bg-white rounded-lg p-6 flex items-center justify-between transition-all duration-200 hover:scale-[1.01] hover:${bgColor} border border-gray-200 cursor-pointer group`}
            >

              <div>
                <h2 className="font-bold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h2>

                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm font-medium text-gray-500">
                    {item.score} / {item.total_questions} Benar
                  </span>

                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {
                      new Date(
                        item.created_at
                      ).toLocaleDateString("id-ID",{
                        day:"numeric",
                        month:"short",
                        year:"numeric"
                      })
                    }
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`text-3xl font-extrabold ${scoreColor} mr-2`}>
                  {percentage}%
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(item.id);
                  }}
                  className="bg-primary text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-primary-dark hover:scale-105 transition-all cursor-pointer hidden sm:block"
                >
                  Lihat Detail
                </button>
                <button
                  onClick={(e) => handleDeleteAttempt(e, item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all cursor-pointer"
                  title="Hapus Riwayat"
                >
                  <LuTrash size={16} />
                </button>
                <LuChevronRight size={20} className="text-gray-400 group-hover:text-primary transition-colors shrink-0" />
              </div>

            </div>

          );

        })}

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

      {/* Modal Review Kuis */}
      {selectedQuizId && (
        <div
          onClick={() => {
            setSelectedQuizId(null);
            setReviewData(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg border border-gray-200 w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl"
          >
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 shrink-0 bg-gray-50 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Review Kuis</span>
                <h2 className="font-extrabold text-xl text-foreground tracking-tight mt-0.5">
                  {reviewData ? reviewData.quiz_title : "Memuat..."}
                </h2>
              </div>
              <button 
                onClick={() => {
                  setSelectedQuizId(null);
                  setReviewData(null);
                }}
                className="text-gray-400 hover:text-gray-600 font-extrabold text-xl p-2 cursor-pointer transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
              {loadingReview ? (
                <div className="py-16 text-center text-gray-400 font-medium">
                  Memuat detail pertanyaan kuis...
                </div>
              ) : reviewData ? (
                reviewData.questions.map((question, index) => {
                  const userAnswer = reviewData.user_answers?.[question.id];
                  const isUserCorrect = userAnswer === question.correct_answer;
                  const hasUserAnswer = userAnswer !== undefined && userAnswer !== null;

                  return (
                    <div key={question.id} className="bg-white rounded-lg p-6 border border-gray-200 text-left shadow-sm">
                      <h3 className="font-bold text-base tracking-tight mb-4 flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-white rounded-md text-xs font-extrabold mr-3 shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-800 flex-1">{question.question}</span>
                        {hasUserAnswer && (
                          <span className={`ml-3 px-2.5 py-1 rounded-md text-xs font-bold shrink-0 ${
                            isUserCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {isUserCorrect ? "Benar" : "Salah"}
                          </span>
                        )}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {["A", "B", "C", "D"].map((option) => {
                          const text = question[`option_${option.toLowerCase()}`];
                          const isOptionCorrect = question.correct_answer === option;
                          const isOptionSelected = userAnswer === option;

                          let optionStyle = "bg-white border-gray-150 text-gray-600";
                          let badgeStyle = "bg-gray-100 text-gray-400";

                          if (isOptionCorrect && (isUserCorrect || !hasUserAnswer)) {
                            optionStyle = "bg-green-50/70 border-secondary text-secondary font-semibold";
                            badgeStyle = "bg-secondary text-white shadow-sm";
                          } else if (isOptionSelected && !isUserCorrect) {
                            optionStyle = "bg-red-50/70 border-red-500 text-red-600 font-semibold";
                            badgeStyle = "bg-red-500 text-white shadow-sm";
                          }

                          return (
                            <div
                              key={option}
                              className={`flex items-center gap-3 rounded-md p-3 border-2 text-sm transition-all duration-200 ${optionStyle}`}
                            >
                              <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${badgeStyle}`}>
                                {option}
                              </div>
                              <span>{text}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Penjelasan - ditampilkan jika benar */}
                      {question.explanation && (!hasUserAnswer || isUserCorrect) && (
                        <div className="bg-blue-50/50 border-l-4 border-primary rounded-r-md p-4 mt-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                            Penjelasan Jawaban:
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed font-medium">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 shrink-0 bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setSelectedQuizId(null);
                  setReviewData(null);
                }}
                className="bg-primary text-white h-11 px-6 rounded-md font-semibold transition-all duration-200 hover:bg-primary-dark cursor-pointer text-sm shadow-sm"
              >
                Tutup Review
              </button>
            </div>

          </div>
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

export default QuizHistory;