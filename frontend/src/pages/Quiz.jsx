import {useEffect,useState} from "react";
import {useNavigate,useParams} from "react-router-dom";
import {LuPartyPopper,LuThumbsUp,LuBookOpen} from "react-icons/lu";
import api from "../services/api";

function Quiz(){

  const {id}=useParams();
  const navigate=useNavigate();

  const [questions,setQuestions]=useState([]);
  const [answers,setAnswers]=useState({});
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(true);
  const [materialTitle,setMaterialTitle]=useState("");

  useEffect(()=>{

    let ignore=false;

    async function loadQuiz(){

      try{

        const res=
          await api.get(
            `/quizzes/${id}`
          );

        if(ignore){
          return;
        }

        if(res.data.material_id){
          navigate(`/materials/${res.data.material_id}?type=quiz`, { replace: true });
        }

      }catch(error){

        console.error(error);

      }

    }

    loadQuiz();

    return()=>{
      ignore=true;
    };

  },[id, navigate]);

  const handleChange=(
    questionId,
    value
  )=>{

    setAnswers(prev=>({
      ...prev,
      [questionId]:value
    }));

  };

  const submitQuiz=async()=>{

    try{

      const res=
        await api.post(
          `/quizzes/${id}/submit`,
          {
            answers
          }
        );

      setResult(
        res.data
      );

    }catch(error){

      console.error(error);

    }

  };

  if(loading){
    return(
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 font-medium">Loading...</div>
      </div>
    );
  }

  if(result){

    const percentage=result.percentage;
    const scoreColor=
      percentage>=80
        ? "text-secondary"
        : percentage>=60
        ? "text-accent"
        : "text-red-500";

    return(
      <div className="flex items-center justify-center min-h-[60vh]">

        <div className="bg-white rounded-lg p-12 text-center max-w-md w-full border border-gray-200">

          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">
              {percentage>=80 ? <LuPartyPopper size={40} className="text-secondary"/> : percentage>=60 ? <LuThumbsUp size={40} className="text-accent"/> : <LuBookOpen size={40} className="text-red-500"/>}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Hasil Quiz
          </h1>

          <p className="text-gray-500 mb-8">
            Berikut hasil quiz kamu
          </p>

          <div className={`text-6xl font-extrabold mb-2 ${scoreColor}`}>
            {result.percentage}%
          </div>

          <p className="text-gray-500 font-medium mb-8">
            {result.score} / {result.total} Benar
          </p>

          <button
            onClick={()=>
              navigate(
                "/quiz-history"
              )
            }
            className="bg-primary text-white h-14 px-8 rounded-md font-semibold transition-all duration-200 hover:bg-primary-dark hover:scale-105 cursor-pointer"
          >
            Lihat Riwayat
          </button>

        </div>

      </div>
    );
  }

  return(
    <div className="p-4 md:p-8 h-full overflow-y-auto">

      <div className="mb-8">
        {materialTitle&&(
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-md mb-2 inline-block">
            Materi: {materialTitle}
          </span>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight">
          Final Quiz
        </h1>
      </div>

      <div className="space-y-6">

        {questions.map(
          (question,index)=>(
            <div
              key={question.id}
              className="bg-white rounded-lg p-8 border border-gray-200"
            >

              <h2 className="font-bold text-lg tracking-tight mb-6">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white rounded-md text-sm font-extrabold mr-3">
                  {index+1}
                </span>
                {question.question}
              </h2>

              <div className="space-y-3">
                {["A","B","C","D"].map(
                  option=>{

                    const text=
                      question[
                        `option_${option.toLowerCase()}`
                      ];

                    const isSelected=
                      answers[
                        question.id
                      ]===option;

                    return(
                      <label
                        key={option}
                        className={`flex items-center gap-4 rounded-md p-4 cursor-pointer transition-all duration-200 border-2 ${
                          isSelected
                            ? "bg-primary/10 border-primary"
                            : "bg-muted border-transparent hover:bg-gray-300"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-white text-gray-500"
                        }`}>
                          {option}
                        </div>

                        <input
                          type="radio"
                          name={`q-${question.id}`}
                          value={option}
                          checked={isSelected}
                          onChange={(e)=>
                            handleChange(
                              question.id,
                              e.target.value
                            )
                          }
                          className="hidden"
                        />

                        <span className={`font-medium ${
                          isSelected
                            ? "text-foreground"
                            : "text-gray-600"
                        }`}>
                          {text}
                        </span>

                      </label>
                    );

                  }
                )}
              </div>

            </div>
          )
        )}

      </div>

      <button
        onClick={submitQuiz}
        className="mt-8 bg-secondary text-white h-14 px-8 rounded-md font-bold text-base transition-all duration-200 hover:bg-secondary-dark hover:scale-105 cursor-pointer"
      >
        Submit Quiz
      </button>

    </div>
  );
}

export default Quiz;