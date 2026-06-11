import {useEffect,useState} from "react";
import {LuBookOpen,LuCircleCheck,LuLoader,LuClock,LuBrain,LuChartBar,LuTrophy} from "react-icons/lu";
import api from "../services/api";

function Dashboard(){

  const [stats,setStats]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{

    let ignore=false;

    async function load(){

      try{

        const res=
          await api.get(
            "/dashboard/stats"
          );

        if(ignore){
          return;
        }

        setStats(res.data);

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

  if(loading){
    return(
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 font-medium">Loading...</div>
      </div>
    );
  }

  if(!stats){
    return(
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 font-medium">Gagal memuat dashboard</div>
      </div>
    );
  }

  return(
    <div className="p-4 md:p-8 h-full overflow-y-auto">

      <h1 className="text-3xl font-extrabold tracking-tight mb-8">
        Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        <div className="bg-blue-100 rounded-lg p-6 transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-800/60">
              Total Materi
            </div>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <LuBookOpen size={20} className="text-primary" strokeWidth={2.5}/>
            </div>
          </div>
          <div className="text-4xl font-extrabold text-primary">
            {stats.totalMaterials}
          </div>
        </div>

        <div className="bg-emerald-100 rounded-lg p-6 transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800/60">
              Materi Selesai
            </div>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <LuCircleCheck size={20} className="text-secondary" strokeWidth={2.5}/>
            </div>
          </div>
          <div className="text-4xl font-extrabold text-secondary">
            {stats.completedMaterials}
          </div>
        </div>

        <div className="bg-amber-100 rounded-lg p-6 transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-800/60">
              Sedang Dipelajari
            </div>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <LuLoader size={20} className="text-accent" strokeWidth={2.5}/>
            </div>
          </div>
          <div className="text-4xl font-extrabold text-accent">
            {stats.inProgressMaterials}
          </div>
        </div>

        <div className="bg-purple-100 rounded-lg p-6 transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-purple-800/60">
              Belum Dimulai
            </div>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <LuClock size={20} className="text-purple-600" strokeWidth={2.5}/>
            </div>
          </div>
          <div className="text-4xl font-extrabold text-purple-600">
            {stats.notStartedMaterials}
          </div>
        </div>

      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg p-8 mb-8 border border-gray-200">

        <h2 className="font-bold text-lg tracking-tight mb-4">
          Progress Belajar
        </h2>

        <div className="flex justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">Overall Progress</span>
          <span className="text-sm font-bold text-primary">{stats.overallProgress}%</span>
        </div>

        <div className="w-full bg-muted rounded-md h-3">

          <div
            className="bg-primary h-3 rounded-md transition-all duration-500"
            style={{
              width:`${stats.overallProgress}%`
            }}
          />

        </div>

      </div>

      {/* Quiz Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

        <div className="bg-blue-100 rounded-lg p-6 transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-800/60">
              Quiz Diselesaikan
            </div>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <LuBrain size={20} className="text-primary" strokeWidth={2.5}/>
            </div>
          </div>
          <div className="text-4xl font-extrabold text-primary">
            {stats.totalQuizAttempts}
          </div>
        </div>

        <div className="bg-emerald-100 rounded-lg p-6 transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800/60">
              Rata-rata Nilai
            </div>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <LuChartBar size={20} className="text-secondary" strokeWidth={2.5}/>
            </div>
          </div>
          <div className="text-4xl font-extrabold text-secondary">
            {stats.averageScore}%
          </div>
        </div>

        <div className="bg-amber-100 rounded-lg p-6 transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-800/60">
              Nilai Tertinggi
            </div>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <LuTrophy size={20} className="text-accent" strokeWidth={2.5}/>
            </div>
          </div>
          <div className="text-4xl font-extrabold text-accent">
            {stats.bestScore}%
          </div>
        </div>

      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-lg p-6 border border-gray-200">

          <h2 className="font-bold text-lg tracking-tight mb-5">
            Materi Terbaru
          </h2>

          <div className="space-y-3">

            {stats.recentMaterials.map(item=>(
              <div
                key={item.id}
                className="bg-muted rounded-md p-4 font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50"
              >
                {item.title}
              </div>
            ))}

          </div>

        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">

          <h2 className="font-bold text-lg tracking-tight mb-5">
            Aktivitas Terakhir
          </h2>

          <div className="space-y-3">

            {stats.recentActivities.map((item, index) => {
              let icon = <LuCircleCheck size={16} className="text-secondary shrink-0" strokeWidth={2.5}/>;
              let text = `Menyelesaikan modul ${item.title}`;
              let hoverBg = "hover:bg-green-50";

              if (item.type === "quiz") {
                icon = <LuTrophy size={16} className="text-accent shrink-0" strokeWidth={2.5}/>;
                text = `Menyelesaikan kuis ${item.title} (Skor: ${item.score_pct}%)`;
                hoverBg = "hover:bg-amber-50";
              } else if (item.type === "material") {
                icon = <LuBookOpen size={16} className="text-primary shrink-0" strokeWidth={2.5}/>;
                text = `Mengunggah materi ${item.title}`;
                hoverBg = "hover:bg-blue-50";
              }

              return (
                <div
                  key={index}
                  className={`bg-muted rounded-md p-4 transition-all duration-200 ${hoverBg} flex items-center gap-2`}
                >
                  {icon}
                  <span className="font-medium text-gray-700">
                    {text}
                  </span>
                </div>
              );
            })}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;