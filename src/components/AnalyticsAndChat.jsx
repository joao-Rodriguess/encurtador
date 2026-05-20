import React, { useState, useEffect } from 'react';
import { 
  subscribeToVisitorLogs, 
  subscribeToComments, 
  deleteComment, 
  subscribeToAllProjectComments, 
  deleteProjectComment 
} from '../firebase/firestore';
import { motion } from 'framer-motion';
import { BarChart3, MessageSquare, Trash2, Globe, Laptop, Clock, Eye, Users } from 'lucide-react';

const AnalyticsAndChat = () => {
  const [logs, setLogs] = useState([]);
  const [comments, setComments] = useState([]);
  const [projectComments, setProjectComments] = useState([]); // Comentários específicos de projetos
  const [activeSubTab, setActiveSubTab] = useState('analytics'); // 'analytics', 'moderation' or 'project_comments'
  const [deletingId, setDeletingId] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [visitorViewMode, setVisitorViewMode] = useState('grouped'); // 'grouped' ou 'all'

  // Subscrever aos logs de visitantes, comentários globais e de projetos
  useEffect(() => {
    const unsubLogs = subscribeToVisitorLogs((data) => {
      setLogs(data);
    });

    const unsubComments = subscribeToComments((data) => {
      setComments(data);
    });

    const unsubProjectComments = subscribeToAllProjectComments((data) => {
      setProjectComments(data);
    });

    return () => {
      unsubLogs();
      unsubComments();
      unsubProjectComments();
    };
  }, []);

  const handleDeleteComment = async (id) => {
    if (!window.confirm('Vossa Majestade realmente deseja banir e excluir este comentário?')) return;
    
    setDeletingId(id);
    try {
      await deleteComment(id);
    } catch (err) {
      alert('Erro ao tentar banir o comentário.');
    }
    setDeletingId(null);
  };

  const handleDeleteProjectComment = async (id, projectId) => {
    if (!window.confirm('Vossa Majestade realmente deseja banir e excluir este comentário de projeto?')) return;
    
    setDeletingId(id);
    try {
      await deleteProjectComment(id, projectId);
    } catch (err) {
      alert('Erro ao tentar banir o comentário do projeto.');
    }
    setDeletingId(null);
  };

  // Cálculos analíticos
  const totalVisits = logs.length;
  const uniqueVisitors = new Set(logs.map((l) => l.ip)).size;
  const totalComments = comments.length + projectComments.length;

  // Processamento e agrupamento dos logs dos últimos 7 dias para plotagem real
  const chartData = React.useMemo(() => {
    const data = [];
    const now = new Date();
    
    // Gerar os últimos 7 dias de forma reversa (de 6 dias atrás até hoje)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      data.push({
        date: d,
        label: label,
        count: 0,
        uniqueCount: 0,
        ips: new Set()
      });
    }
    
    // Mapear logs nos respectivos dias
    logs.forEach(log => {
      if (!log.timestamp) return;
      const logDate = typeof log.timestamp.toDate === 'function' ? log.timestamp.toDate() : new Date(log.timestamp);
      
      data.forEach(day => {
        const start = new Date(day.date);
        const end = new Date(day.date);
        end.setHours(23, 59, 59, 999);
        
        if (logDate >= start && logDate <= end) {
          day.count += 1;
          if (log.ip) {
            day.ips.add(log.ip);
          }
        }
      });
    });
    
    data.forEach(day => {
      day.uniqueCount = day.ips.size;
    });
    
    return data;
  }, [logs]);

  // Obter o valor de pico para escala dinâmica no gráfico
  const maxVal = React.useMemo(() => {
    const counts = chartData.map(d => Math.max(d.count, d.uniqueCount));
    const max = Math.max(...counts, 0);
    return max === 0 ? 10 : Math.ceil(max * 1.2); // Margem de segurança de 20% no topo
  }, [chartData]);

  // Eixos e Ticks do Y
  const yAxisTicks = [0, 0.25, 0.5, 0.75, 1];

  // Geração de coordenadas e paths
  const pointsVisits = chartData.map((d, i) => ({
    x: 55 + i * 86.66,
    y: 195 - (d.count / maxVal) * 155
  }));

  const pointsUnique = chartData.map((d, i) => ({
    x: 55 + i * 86.66,
    y: 195 - (d.uniqueCount / maxVal) * 155
  }));

  const pathDVisits = pointsVisits.reduce((acc, p, i) => i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`, '');
  const areaDVisits = pointsVisits.length > 0 ? `M 55,195 ${pointsVisits.reduce((acc, p) => `${acc} L ${p.x},${p.y}`, '')} L ${pointsVisits[pointsVisits.length - 1].x},195 Z` : '';

  const pathDUnique = pointsUnique.reduce((acc, p, i) => i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`, '');
  const areaDUnique = pointsUnique.length > 0 ? `M 55,195 ${pointsUnique.reduce((acc, p) => `${acc} L ${p.x},${p.y}`, '')} L ${pointsUnique[pointsUnique.length - 1].x},195 Z` : '';

  // Agrupamento de estatísticas por visitante único (IP distinto)
  const uniqueVisitorStats = React.useMemo(() => {
    const statsMap = {};
    
    logs.forEach(log => {
      if (!log.ip) return;
      
      if (!statsMap[log.ip]) {
        statsMap[log.ip] = {
          ip: log.ip,
          totalViews: 0,
          latestLog: log
        };
      }
      
      statsMap[log.ip].totalViews += 1;
    });
    
    // Ordenar pelo acesso mais recente
    return Object.values(statsMap).sort((a, b) => {
      const timeA = a.latestLog.timestamp?.toDate ? a.latestLog.timestamp.toDate() : new Date(a.latestLog.timestamp || 0);
      const timeB = b.latestLog.timestamp?.toDate ? b.latestLog.timestamp.toDate() : new Date(b.latestLog.timestamp || 0);
      return timeB - timeA;
    });
  }, [logs]);

  const parseUA = (ua) => {
    if (!ua) return 'Outro / Desconhecido';
    let os = 'Outro';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Macintosh')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    let browser = 'Outro';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';

    return `${os} / ${browser}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Carregando...';
    const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  // Agrupamentos geográficos
  const countryCounts = logs.reduce((acc, log) => {
    const country = log.country || 'Desconhecido';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  const sortedCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8 font-sans">
      {/* Grade de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -4 }}
          className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0f0f18]/60 flex items-center justify-between shadow-lg"
        >
          <div>
            <span className="text-gray-500 text-xs font-black uppercase tracking-wider">Visualizações do Hub</span>
            <h3 className="text-3xl font-black text-amber-500 mt-2">{totalVisits}</h3>
            <p className="text-[10px] text-gray-500 mt-1">Cliques totais no acervo</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
            <Eye size={24} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0f0f18]/60 flex items-center justify-between shadow-lg"
        >
          <div>
            <span className="text-gray-500 text-xs font-black uppercase tracking-wider">Visitantes Únicos</span>
            <h3 className="text-3xl font-black text-white mt-2">{uniqueVisitors}</h3>
            <p className="text-[10px] text-gray-500 mt-1">Baseado em IPs distintos</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <Users size={24} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0f0f18]/60 flex items-center justify-between shadow-lg"
        >
          <div>
            <span className="text-gray-500 text-xs font-black uppercase tracking-wider">Mensagens Enviadas</span>
            <h3 className="text-3xl font-black text-emerald-500 mt-2">{totalComments}</h3>
            <p className="text-[10px] text-gray-500 mt-1">Chat ({comments.length}) + Projetos ({projectComments.length})</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <MessageSquare size={24} />
          </div>
        </motion.div>
      </div>

      {/* Navegação Secundária (Sub-abas) */}
      <div className="flex flex-wrap gap-4 border-b border-white/5 pb-3">
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex items-center gap-2 pb-2 px-1 text-xs md:text-sm font-black uppercase tracking-wider transition-colors relative ${
            activeSubTab === 'analytics' ? 'text-amber-500' : 'text-gray-500 hover:text-white'
          }`}
        >
          <BarChart3 size={16} />
          <span>Monitoramento de Acessos</span>
          {activeSubTab === 'analytics' && (
            <motion.div layoutId="activeSubTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('moderation')}
          className={`flex items-center gap-2 pb-2 px-1 text-xs md:text-sm font-black uppercase tracking-wider transition-colors relative ${
            activeSubTab === 'moderation' ? 'text-amber-500' : 'text-gray-500 hover:text-white'
          }`}
        >
          <MessageSquare size={16} />
          <span>Moderação do Chat</span>
          {activeSubTab === 'moderation' && (
            <motion.div layoutId="activeSubTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('project_comments')}
          className={`flex items-center gap-2 pb-2 px-1 text-xs md:text-sm font-black uppercase tracking-wider transition-colors relative ${
            activeSubTab === 'project_comments' ? 'text-amber-500' : 'text-gray-500 hover:text-white'
          }`}
        >
          <MessageSquare size={16} />
          <span>Moderação de Projetos</span>
          {activeSubTab === 'project_comments' && (
            <motion.div layoutId="activeSubTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
          )}
        </button>
      </div>

      {/* Conteúdo das Sub-abas */}
      <div>
        {activeSubTab === 'analytics' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gráfico de Acessos Recentes (SVG Nativo) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 px-1">
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Atividade dos Últimos 7 Dias</h4>
                <div className="text-[11px] text-gray-500 font-bold">
                  {hoveredIndex !== null ? (
                    <span className="animate-pulse text-amber-400">
                      📅 {chartData[hoveredIndex].label} — 📊 {chartData[hoveredIndex].count} Visitas | 👤 {chartData[hoveredIndex].uniqueCount} Únicos
                    </span>
                  ) : (
                    <span>Passe o cursor sobre o gráfico para detalhar as datas</span>
                  )}
                </div>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0f0f18]/40 shadow-2xl relative overflow-hidden">
                {/* Legenda do Gráfico */}
                <div className="flex items-center gap-6 mb-4 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-1.5 rounded bg-amber-500 inline-block" />
                    <span className="text-gray-400">Visualizações Totais ({totalVisits})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-1.5 rounded bg-blue-500 inline-block" />
                    <span className="text-gray-400">Visitantes Únicos ({uniqueVisitors})</span>
                  </div>
                </div>
                
                {/* O SVG do Gráfico */}
                <div className="w-full overflow-hidden">
                  <svg viewBox="0 0 600 240" className="w-full h-auto overflow-visible select-none">
                    <defs>
                      <linearGradient id="gradientVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="gradientUnique" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Linhas de Grade e Eixo Y */}
                    {yAxisTicks.map((tick, idx) => {
                      const y = 195 - tick * 155;
                      return (
                        <g key={idx} className="opacity-70">
                          <line 
                            x1="55" 
                            y1={y} 
                            x2="575" 
                            y2={y} 
                            stroke="rgba(255,255,255,0.04)" 
                            strokeDasharray="4 4" 
                          />
                          <text 
                            x="45" 
                            y={y + 3} 
                            textAnchor="end" 
                            fill="rgba(255,255,255,0.3)" 
                            className="text-[10px] font-mono font-bold"
                          >
                            {Math.round(tick * maxVal)}
                          </text>
                        </g>
                      );
                    })}

                    {/* Eixo X e Rótulos dos Dias */}
                    {chartData.map((day, idx) => {
                      const x = 55 + idx * 86.66;
                      return (
                        <g key={idx}>
                          {/* Linha vertical de grade sutil */}
                          <line 
                            x1={x} 
                            y1="30" 
                            x2={x} 
                            y2="195" 
                            stroke="rgba(255,255,255,0.02)" 
                          />
                          {/* Rótulo da data */}
                          <text 
                            x={x} 
                            y="215" 
                            textAnchor="middle" 
                            fill="rgba(255,255,255,0.4)" 
                            className="text-[10px] font-mono font-bold"
                          >
                            {day.label}
                          </text>
                        </g>
                      );
                    })}

                    {/* Linha de Indicador Vertical (Hover) */}
                    {hoveredIndex !== null && (
                      <line
                        x1={55 + hoveredIndex * 86.66}
                        y1="30"
                        x2={55 + hoveredIndex * 86.66}
                        y2="195"
                        stroke="rgba(245, 158, 11, 0.2)"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Área Preenchida - Visitantes Únicos */}
                    {areaDUnique && (
                      <path 
                        d={areaDUnique} 
                        fill="url(#gradientUnique)" 
                      />
                    )}

                    {/* Área Preenchida - Visualizações */}
                    {areaDVisits && (
                      <path 
                        d={areaDVisits} 
                        fill="url(#gradientVisits)" 
                      />
                    )}

                    {/* Linhas Principais (Stroke) */}
                    {pathDUnique && (
                      <path 
                        d={pathDUnique} 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    )}
                    {pathDVisits && (
                      <path 
                        d={pathDVisits} 
                        fill="none" 
                        stroke="#f59e0b" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Pontos Círculos dos Valores */}
                    {chartData.map((day, idx) => {
                      const x = 55 + idx * 86.66;
                      const yVis = 195 - (day.count / maxVal) * 155;
                      const yUniq = 195 - (day.uniqueCount / maxVal) * 155;
                      const isHovered = hoveredIndex === idx;

                      return (
                        <g key={idx}>
                          {/* Visitantes Únicos */}
                          <circle 
                            cx={x} 
                            cy={yUniq} 
                            r={isHovered ? 6 : 4} 
                            fill="#0d0d15" 
                            stroke="#3b82f6" 
                            strokeWidth={isHovered ? 3 : 2} 
                            className="transition-all duration-150"
                          />
                          {/* Visualizações Totais */}
                          <circle 
                            cx={x} 
                            cy={yVis} 
                            r={isHovered ? 6 : 4} 
                            fill="#0d0d15" 
                            stroke="#f59e0b" 
                            strokeWidth={isHovered ? 3 : 2} 
                            className="transition-all duration-150"
                          />
                        </g>
                      );
                    })}

                    {/* Zonas de Hover do Mouse (Invisíveis) */}
                    {chartData.map((_, idx) => {
                      const x = 55 + idx * 86.66;
                      return (
                        <rect
                          key={idx}
                          x={x - 43.33}
                          y="20"
                          width="86.66"
                          height="185"
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredIndex(idx)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Tabela de Acessos Recentes */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} className="text-amber-500" />
                    <span>Fluxo de Visitas Recentes</span>
                  </h4>
                  <div className="flex items-center gap-1 bg-[#09090e]/80 border border-white/5 p-1 rounded-xl">
                    <button
                      onClick={() => setVisitorViewMode('grouped')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        visitorViewMode === 'grouped'
                          ? 'bg-amber-500 text-[#07070a] shadow-lg font-black'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Users size={12} />
                      <span>Visitantes Únicos ({uniqueVisitorStats.length})</span>
                    </button>
                    <button
                      onClick={() => setVisitorViewMode('all')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        visitorViewMode === 'all'
                          ? 'bg-amber-500 text-[#07070a] shadow-lg font-black'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Eye size={12} />
                      <span>Visualização Total ({logs.length})</span>
                    </button>
                  </div>
                </div>

                <div className="glass-panel rounded-2xl border border-white/5 bg-[#0f0f18]/30 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/5 text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">
                          <th className="py-3 px-4">Visitante (IP)</th>
                          <th className="py-3 px-4 text-center">
                            {visitorViewMode === 'grouped' ? 'Visualizações Totais' : 'Situação / Evento'}
                          </th>
                          <th className="py-3 px-4">Localização / Provedor</th>
                          <th className="py-3 px-4">
                            {visitorViewMode === 'grouped' ? 'Última Plataforma' : 'Plataforma'}
                          </th>
                          <th className="py-3 px-4 text-right">
                            {visitorViewMode === 'grouped' ? 'Último Acesso' : 'Horário de Conexão'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs md:text-sm text-gray-300">
                        {visitorViewMode === 'grouped' ? (
                          uniqueVisitorStats.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-gray-600 text-xs">
                                Nenhum visitante único detectado.
                              </td>
                            </tr>
                          ) : (
                            uniqueVisitorStats.slice(0, 15).map((stat) => {
                              const { ip, totalViews, latestLog } = stat;
                              return (
                                <tr key={ip} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="py-3 px-4 font-mono text-[11px] md:text-xs text-amber-500/80 font-bold">{ip}</td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                      {totalViews} {totalViews === 1 ? 'acesso' : 'acessos'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex flex-col">
                                      <span className="flex items-center gap-1.5 font-bold text-white text-[11px] md:text-xs">
                                        <Globe size={10} className="text-gray-500" />
                                        {latestLog.city || 'Desconhecida'}, {latestLog.country || 'Desconhecido'}
                                      </span>
                                      <span className="text-[9px] text-gray-600 truncate max-w-[180px]">{latestLog.org || 'Provedor Desconhecido'}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-400">
                                      <Laptop size={11} className="text-gray-600" />
                                      {parseUA(latestLog.userAgent)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <span className="flex items-center justify-end gap-1 text-[10px] md:text-xs text-gray-500 font-mono">
                                      <Clock size={10} />
                                      {formatDate(latestLog.timestamp)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )
                        ) : (
                          logs.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-gray-600 text-xs">
                                Nenhum log de acesso geral encontrado.
                              </td>
                            </tr>
                          ) : (
                            logs.slice(0, 50).map((log, index) => {
                              return (
                                <tr key={log.id || index} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="py-3 px-4 font-mono text-[11px] md:text-xs text-amber-500/80 font-bold">{log.ip || 'Desconhecido'}</td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      Conexão Registrada
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex flex-col">
                                      <span className="flex items-center gap-1.5 font-bold text-white text-[11px] md:text-xs">
                                        <Globe size={10} className="text-gray-500" />
                                        {log.city || 'Desconhecida'}, {log.country || 'Desconhecido'}
                                      </span>
                                      <span className="text-[9px] text-gray-600 truncate max-w-[180px]">{log.org || 'Provedor Desconhecido'}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-400">
                                      <Laptop size={11} className="text-gray-600" />
                                      {parseUA(log.userAgent)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <span className="flex items-center justify-end gap-1 text-[10px] md:text-xs text-gray-500 font-mono">
                                      <Clock size={10} />
                                      {formatDate(log.timestamp)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                  {visitorViewMode === 'all' && logs.length > 50 && (
                    <div className="py-2.5 px-4 bg-white/[0.02] border-t border-white/5 text-center">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        Exibindo os últimos 50 acessos do fluxo em tempo real. Total de registros: {logs.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
          </div>

            {/* Quadro de Origem (Widget de Países) */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-white uppercase tracking-wider px-1">Top Países de Acesso</h4>
              <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-[#0f0f18]/60 shadow-xl space-y-4">
                {sortedCountries.length === 0 ? (
                  <p className="text-xs text-gray-600 text-center py-6">Sem estatísticas geográficas ainda.</p>
                ) : (
                  sortedCountries.map(([country, count], index) => {
                    const percentage = totalVisits > 0 ? ((count / totalVisits) * 100).toFixed(0) : 0;
                    return (
                      <div key={country} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-gray-300">
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 flex items-center justify-center bg-white/5 rounded text-[10px] text-gray-500 font-black">
                              #{index + 1}
                            </span>
                            {country}
                          </span>
                          <span className="text-amber-500 font-mono">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-amber-500"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : activeSubTab === 'moderation' ? (
          /* Moderação do Chat */
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider px-1">Mensagens em Tempo Real</h4>
            <div className="glass-panel rounded-2xl border border-white/5 bg-[#0f0f18]/30 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5 text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">
                      <th className="py-3 px-4">Autor / IP</th>
                      <th className="py-3 px-4">Mensagem</th>
                      <th className="py-3 px-4">Enviado em</th>
                      <th className="py-3 px-4 text-center">Ações de Moderação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs md:text-sm text-gray-300">
                    {comments.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-gray-600 text-xs">
                          Nenhum comentário enviado ainda.
                        </td>
                      </tr>
                    ) : (
                      comments.map((comment) => (
                        <tr key={comment.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-white text-[11px] md:text-xs">{comment.name}</span>
                              <span className="font-mono text-[9px] text-gray-600 mt-0.5">IP: {comment.ip}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 max-w-xs md:max-w-md">
                            <p className="text-xs md:text-sm text-gray-200 leading-relaxed break-words">{comment.message}</p>
                          </td>
                          <td className="py-4 px-4 text-gray-500 font-mono text-[10px] md:text-xs">
                            {formatDate(comment.timestamp)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              disabled={deletingId === comment.id}
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all border border-red-500/10 flex items-center justify-center mx-auto hover:scale-105 active:scale-95 disabled:opacity-50"
                              title="Banir Mensagem"
                            >
                              <Trash2 size={14} className={deletingId === comment.id ? 'animate-spin' : ''} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Moderação de Projetos */
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider px-1">Comentários dos Projetos em Tempo Real</h4>
            <div className="glass-panel rounded-2xl border border-white/5 bg-[#0f0f18]/30 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5 text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">
                      <th className="py-3 px-4">Projeto</th>
                      <th className="py-3 px-4">Autor / IP</th>
                      <th className="py-3 px-4">Mensagem</th>
                      <th className="py-3 px-4">Enviado em</th>
                      <th className="py-3 px-4 text-center">Ações de Moderação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs md:text-sm text-gray-300">
                    {projectComments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-600 text-xs">
                          Nenhum comentário enviado nos projetos ainda.
                        </td>
                      </tr>
                    ) : (
                      projectComments.map((comment) => (
                        <tr key={comment.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-4 font-bold text-amber-500">
                            {comment.projectTitle || 'Projeto Desconhecido'}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-white text-[11px] md:text-xs">{comment.name}</span>
                              <span className="font-mono text-[9px] text-gray-600 mt-0.5">IP: {comment.ip}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 max-w-xs md:max-w-md">
                            <p className="text-xs md:text-sm text-gray-200 leading-relaxed break-words">{comment.message}</p>
                          </td>
                          <td className="py-4 px-4 text-gray-500 font-mono text-[10px] md:text-xs">
                            {formatDate(comment.timestamp)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              disabled={deletingId === comment.id}
                              onClick={() => handleDeleteProjectComment(comment.id, comment.projectId)}
                              className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all border border-red-500/10 flex items-center justify-center mx-auto hover:scale-105 active:scale-95 disabled:opacity-50"
                              title="Banir Mensagem"
                            >
                              <Trash2 size={14} className={deletingId === comment.id ? 'animate-spin' : ''} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsAndChat;
