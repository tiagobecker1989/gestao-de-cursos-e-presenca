"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { CheckCircle2, XCircle, ArrowLeft, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { formatarData } from "@/lib/utils";

interface ModuloItem {
  id: string;
  nome: string;
}

interface CursoItem {
  id: string;
  nome: string;
  modulos: ModuloItem[];
  matriculas: {
    aluno: {
      id: string;
      nome: string;
      email: string;
    };
  }[];
}

interface PresencaRegistro {
  id: string;
  alunoId: string;
  moduloId: string;
  data: string | Date;
  presente: boolean;
}

interface HistoricoPresencasClientProps {
  cursos: CursoItem[];
  presencas: PresencaRegistro[];
}

export function HistoricoPresencasClient({ cursos, presencas }: HistoricoPresencasClientProps) {
  const [cursoId, setCursoId] = useState("");
  const [moduloId, setModuloId] = useState("");

  const cursoSelecionado = cursos.find((c) => c.id === cursoId);
  const modulosDisponiveis = cursoSelecionado ? cursoSelecionado.modulos : [];

  const presencasFiltradas = presencas.filter((p) => {
    if (moduloId) return p.moduloId === moduloId;
    if (cursoSelecionado) {
      const idsModulos = cursoSelecionado.modulos.map((m) => m.id);
      return idsModulos.includes(p.moduloId);
    }
    return false;
  });

  const datasUnicasMap: { [dataFormatted: string]: Date } = {};
  presencasFiltradas.forEach((p) => {
    const dataObj = new Date(p.data);
    const dataIso = dataObj.toISOString().split("T")[0];
    datasUnicasMap[dataIso] = dataObj;
  });

  const datasOrdenadas = Object.keys(datasUnicasMap)
    .sort()
    .map((iso) => datasUnicasMap[iso]);

  return (
    <div className="space-y-8">
      <Header
        title="Histórico Completo de Chamadas"
        subtitle="Consulte todas as datas com registro de frequência por módulo e aluno"
        action={
          <div className="flex items-center gap-3">
            <Link href="/presencas">
              <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
                Fazer Chamada
              </Button>
            </Link>
            <Button variant="secondary" onClick={() => window.print()} icon={<FileText className="w-4 h-4" />}>
              Imprimir Relatório
            </Button>
          </div>
        }
      />

      {/* Filtros */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        <Select
          label="Selecione o Curso *"
          options={cursos.map((c) => ({ value: c.id, label: c.nome }))}
          placeholder="Escolha um curso..."
          value={cursoId}
          onChange={(e) => {
            setCursoId(e.target.value);
            setModuloId("");
          }}
        />

        <Select
          label="Filtrar por Módulo (opcional)"
          options={modulosDisponiveis.map((m) => ({ value: m.id, label: m.nome }))}
          placeholder="Todos os módulos"
          value={moduloId}
          disabled={!cursoId}
          onChange={(e) => setModuloId(e.target.value)}
        />
      </div>

      {/* Matriz de Frequência */}
      {!cursoId ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <Calendar className="w-8 h-8 text-sky-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">Selecione um Curso</h3>
          <p className="text-xs text-slate-500 mt-1">
            Escolha um curso para carregar o histórico diário de assiduidade de todos os alunos.
          </p>
        </div>
      ) : cursoSelecionado && datasOrdenadas.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <p className="text-sm text-slate-500">Nenhum registro de chamada encontrado para a seleção atual.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{cursoSelecionado?.nome}</h3>
              <p className="text-xs text-slate-500">
                {datasOrdenadas.length} aula(s) registrada(s) no histórico
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold sticky left-0 bg-slate-50 border-r border-slate-200 min-w-[200px]">
                    Aluno
                  </th>
                  {datasOrdenadas.map((d, i) => (
                    <th key={i} className="py-3 px-3 text-center min-w-[90px]">
                      {formatarData(d)}
                    </th>
                  ))}
                  <th className="py-3 px-4 font-bold text-right">Assiduidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cursoSelecionado?.matriculas.map((m) => {
                  const aluno = m.aluno;
                  const presencasAluno = presencasFiltradas.filter((p) => p.alunoId === aluno.id);
                  const totalPresente = presencasAluno.filter((p) => p.presente).length;
                  const totalAulas = presencasAluno.length;
                  const pct = totalAulas > 0 ? Math.round((totalPresente / totalAulas) * 100) : 100;

                  return (
                    <tr key={aluno.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900 sticky left-0 bg-white border-r border-slate-100">
                        {aluno.nome}
                      </td>
                      {datasOrdenadas.map((d, i) => {
                        const dataIso = d.toISOString().split("T")[0];
                        const reg = presencasAluno.find(
                          (p) => new Date(p.data).toISOString().split("T")[0] === dataIso
                        );

                        return (
                          <td key={i} className="py-3 px-3 text-center border-r border-slate-50">
                            {!reg ? (
                              <span className="text-slate-300">-</span>
                            ) : reg.presente ? (
                              <span className="inline-flex items-center text-emerald-600 font-bold gap-1 bg-emerald-50 px-2 py-0.5 rounded">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Pres.
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-rose-600 font-bold gap-1 bg-rose-50 px-2 py-0.5 rounded">
                                <XCircle className="w-3.5 h-3.5" /> Falta
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                        {pct}% ({totalPresente}/{totalAulas})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
