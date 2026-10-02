"use client";

import React from "react";
import { formatarNota, formatarCPF } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  Star,
  BookOpen,
  Award,
  Calendar,
  Check,
  X,
  Printer,
  QrCode,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "./Button";

interface ModuloDesempenho {
  id: string;
  nome: string;
  qtdConteudos: number;
  notaAvaliacao: number;
  taxaPresenca: number;
  participativo: boolean;
  notaFinal: number;
  aprovado: boolean;
}

interface BoletimStudeProps {
  aluno: {
    id: string;
    nome: string;
    email: string;
    cpf?: string | null;
    tokenAcesso?: string | null;
    observacaoProfessor?: string | null;
  };
  curso: {
    id: string;
    nome: string;
    turma?: string | null;
    cargaHoraria?: number | null;
    professor?: {
      nome: string;
    } | null;
  };
  modulos: ModuloDesempenho[];
  mediaFinalCurso: number;
  situacaoCurso: "APROVADO" | "RECUPERACAO";
  totalPresencasGeral: number;
  totalAulasGeral: number;
  atividades?: {
    id: string;
    data: Date | string;
    atividade: string;
    resultado: string;
  }[];
  isPortalView?: boolean;
}

export function BoletimStude({
  aluno,
  curso,
  modulos,
  mediaFinalCurso,
  situacaoCurso,
  totalPresencasGeral,
  totalAulasGeral,
  atividades = [],
  isPortalView = false,
}: BoletimStudeProps) {
  const modulosConcluidos = modulos.filter((m) => m.aprovado).length;
  const progressoCurso =
    modulos.length > 0 ? Math.round((modulosConcluidos / modulos.length) * 100) : 0;

  const faltasGeral = Math.max(0, totalAulasGeral - totalPresencasGeral);
  const taxaFrequenciaGeral =
    totalAulasGeral > 0 ? Math.round((totalPresencasGeral / totalAulasGeral) * 100) : 100;

  const podeEmitirCertificado = modulos.length > 0 && modulos.every((m) => m.aprovado);

  const handlePrint = () => {
    window.print();
  };

  const portalUrl = typeof window !== "undefined"
    ? `${window.location.origin}/portal/${aluno.tokenAcesso || "token"}`
    : `/portal/${aluno.tokenAcesso || "token"}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-slate-800">
      {/* Botões de Ação no topo */}
      {!isPortalView && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
              Imprimir / Salvar PDF
            </Button>
          </div>

          <div>
            {podeEmitirCertificado ? (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Certificado Liberado para Emissão
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Certificado Bloqueado (Nota &lt; 7.0 em Módulo)
              </span>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENTO IMPRESSO STUDE+ */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg print:shadow-none print:border-none print:p-0 space-y-6">
        {/* Banner Superior Stude+ */}
        <div className="flex items-center justify-between bg-gradient-to-r from-sky-900 via-blue-900 to-sky-800 text-white p-6 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
              S+
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider">Stude+</h1>
              <p className="text-xs text-sky-200">Centro de Educação Profissional</p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-lg font-bold uppercase tracking-wider text-sky-100">
              Relatório de Progresso do Aluno
            </h2>
            <p className="text-xs text-sky-300">Mais conhecimento. Mais oportunidades.</p>
          </div>
        </div>

        {/* Informações de Cabeçalho */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block uppercase">Aluno(a)</span>
            <span className="font-bold text-slate-900 text-sm">{aluno.nome}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase">Curso</span>
            <span className="font-bold text-slate-900 text-sm">{curso.nome}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase">Turma</span>
            <span className="font-bold text-slate-900 text-sm">{curso.turma || "TURMA-01"}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase">Professor(a)</span>
            <span className="font-bold text-slate-900 text-sm">
              {curso.professor?.nome || "Tiago Becker"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase">Período</span>
            <span className="font-bold text-slate-900 text-sm">01/08/2026 – 30/09/2026</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase">Data do Relatório</span>
            <span className="font-bold text-slate-900 text-sm">
              {new Date().toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl">
            <p className="text-xs font-bold text-sky-800 uppercase tracking-wider">Progresso do Curso</p>
            <p className="text-2xl font-black text-sky-900 mt-1">{progressoCurso}%</p>
            <div className="w-full bg-sky-200 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-sky-600 h-full rounded-full transition-all"
                style={{ width: `${progressoCurso}%` }}
              />
            </div>
            <p className="text-[10px] text-sky-700 mt-1">
              {modulosConcluidos} de {modulos.length} módulos concluídos
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Média Geral</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">
              {formatarNota(mediaFinalCurso)} <span className="text-xs font-normal">/ 10</span>
            </p>
            <p className="text-[10px] text-emerald-700 mt-3">Desempenho geral ponderado</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Frequência</p>
            <p className="text-2xl font-black text-blue-900 mt-1">{taxaFrequenciaGeral}%</p>
            <p className="text-[10px] text-blue-700 mt-3">
              {totalPresencasGeral} de {totalAulasGeral} aulas registradas
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status Geral</p>
            <p className="text-base font-extrabold mt-1">
              {situacaoCurso === "APROVADO" ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Aprovado
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Em Recuperação
                </span>
              )}
            </p>
            <p className="text-[10px] text-slate-500 mt-2">
              {podeEmitirCertificado ? "Apto para Certificação" : "Com pendência em módulo"}
            </p>
          </div>
        </div>

        {/* Grade Principal: Desempenho e Frequência */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda: Desempenho Acadêmico */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-sky-800 text-white px-4 py-2.5 font-bold text-sm flex items-center justify-between">
                <span>Desempenho Acadêmico</span>
                <span className="text-xs font-normal opacity-80">Módulo a módulo</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Módulo</th>
                    <th className="py-2.5 px-3 text-center">Conteúdos</th>
                    <th className="py-2.5 px-3 text-center">Nota</th>
                    <th className="py-2.5 px-3 text-center">Aproveitamento</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {modulos.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{m.nome}</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">{m.qtdConteudos}</td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-slate-900">
                        {formatarNota(m.notaFinal)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-700">
                        {Math.round(m.notaFinal * 10)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        {m.aprovado ? (
                          <span className="text-emerald-600 inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Concluído
                          </span>
                        ) : (
                          <span className="text-amber-600 inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Recuperação
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Atividades Realizadas */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-800 text-white px-4 py-2.5 font-bold text-sm">
                Atividades Realizadas
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Data</th>
                    <th className="py-2 px-3">Atividade</th>
                    <th className="py-2 px-3 text-right">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {atividades.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-3 px-3 text-slate-400 text-center italic">
                        Atividades teóricas e práticas aplicadas em aula.
                      </td>
                    </tr>
                  ) : (
                    atividades.map((atv) => (
                      <tr key={atv.id}>
                        <td className="py-2 px-3 text-slate-500">
                          {new Date(atv.data).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{atv.atividade}</td>
                        <td className="py-2 px-3 text-right font-bold">
                          {atv.resultado === "Excelente" ? (
                            <span className="text-amber-600 flex items-center justify-end gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400" /> Excelente
                            </span>
                          ) : atv.resultado === "Reforçar" ? (
                            <span className="text-rose-600 flex items-center justify-end gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Reforçar
                            </span>
                          ) : (
                            <span className="text-emerald-600 flex items-center justify-end gap-1">
                              <Check className="w-3.5 h-3.5" /> Concluído
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Coluna Direita: Frequência e Parecer */}
          <div className="space-y-6">
            {/* Controle de Frequência */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm border-b pb-2 border-slate-200">
                Controle de Frequência
              </h3>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Aulas previstas:</span>
                <span className="font-bold text-slate-900">{totalAulasGeral}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Aulas realizadas (Presenças):</span>
                <span className="font-bold text-emerald-600">{totalPresencasGeral}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Faltas:</span>
                <span className="font-bold text-rose-600">{faltasGeral}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <div className="flex justify-between mb-1 font-bold">
                  <span>Assiduidade:</span>
                  <span className="text-blue-700">{taxaFrequenciaGeral}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${taxaFrequenciaGeral}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Parecer do Professor */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm text-xs space-y-2">
              <h3 className="font-bold text-slate-900 text-sm border-b pb-2 border-slate-200">
                Observação do Professor
              </h3>
              <p className="text-slate-600 leading-relaxed italic">
                {aluno.observacaoProfessor ||
                  "O aluno apresenta bom desempenho nas atividades práticas e teóricas, demonstrando facilidade e evolução constante nos conteúdos do curso."}
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé e Assinaturas */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-6 items-end text-xs">
          <div className="md:col-span-1 text-center md:text-left space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-black flex items-center justify-center">
                S+
              </div>
              <div>
                <p className="font-bold text-slate-900">Stude+</p>
                <p className="text-[10px] text-slate-400">Sapiranga / RS</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">Av. 20 de Setembro, 3550 • (51) 99711-3667</p>
          </div>

          <div className="md:col-span-2 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="border-b border-slate-300 pb-1 mb-1">
                <span className="font-bold block text-slate-800">{curso.professor?.nome || "Tiago Becker"}</span>
              </div>
              <span className="text-[10px] text-slate-400">Professor(a)</span>
            </div>
            <div>
              <div className="border-b border-slate-300 pb-1 mb-1">
                <span className="font-bold block text-slate-800">Coordenação Stude+</span>
              </div>
              <span className="text-[10px] text-slate-400">Coordenação</span>
            </div>
            <div>
              <div className="border-b border-slate-300 pb-1 mb-1">
                <span className="font-bold block text-slate-800">Responsável</span>
              </div>
              <span className="text-[10px] text-slate-400">Assinatura</span>
            </div>
          </div>

          <div className="md:col-span-1 text-right flex flex-col items-center md:items-end">
            <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 flex items-center gap-2">
              <QrCode className="w-8 h-8 text-slate-700" />
              <div className="text-left text-[9px] text-slate-500">
                <p className="font-bold text-slate-700">Acesse o portal</p>
                <p className="truncate max-w-[90px]">{aluno.tokenAcesso || "Portal do Aluno"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
