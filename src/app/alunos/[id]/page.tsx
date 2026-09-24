import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { prisma } from "@/lib/prisma";
import { calcularNotaFinalModulo, calcularSituacaoCurso } from "@/lib/calculos";
import { formatarCPF, formatarNota } from "@/lib/utils";
import { ArrowLeft, User, Mail, CreditCard, BookOpen, Check, X } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function AlunoFichaPage({
  params,
}: {
  params: { id: string };
}) {
  const aluno = await prisma.aluno.findUnique({
    where: { id: params.id },
    include: {
      matriculas: {
        include: {
          curso: {
            include: {
              modulos: {
                orderBy: { ordem: "asc" },
              },
            },
          },
        },
      },
      notas: {
        include: {
          modulo: true,
        },
      },
      presencas: {
        include: {
          modulo: true,
        },
      },
    },
  });

  if (!aluno) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Header
        title={`Ficha do Aluno: ${aluno.nome}`}
        subtitle="Histórico de desempenho acadêmico, notas por módulo e frequência"
        action={
          <Link href="/alunos">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Voltar
            </Button>
          </Link>
        }
      />

      {/* Card Dados Pessoais */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nome Completo</p>
            <p className="text-base font-bold text-slate-900">{aluno.nome}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg border border-sky-100">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">E-mail</p>
            <p className="text-sm font-semibold text-slate-800">{aluno.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-lg border border-slate-200">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CPF</p>
            <p className="text-sm font-semibold font-mono text-slate-800">{formatarCPF(aluno.cpf)}</p>
          </div>
        </div>
      </div>

      {/* Cursos e Boletim do Aluno */}
      {aluno.matriculas.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Este aluno ainda não está matriculado em nenhum curso.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {aluno.matriculas.map((matricula) => {
            const curso = matricula.curso;

            const resultadosModulos = curso.modulos.map((modulo) => {
              const notaObj = aluno.notas.find((n) => n.moduloId === modulo.id);
              const presencasObj = aluno.presencas
                .filter((p) => p.moduloId === modulo.id)
                .map((p) => p.presente);

              const notasArr = notaObj ? [notaObj.valor] : [];
              const part = notaObj ? notaObj.participativo : false;

              const resModulo = calcularNotaFinalModulo(notasArr, presencasObj, part);

              return {
                modulo,
                notaObj,
                resModulo,
              };
            });

            const resumoCurso = calcularSituacaoCurso(
              resultadosModulos.map((r) => r.resModulo)
            );

            return (
              <div
                key={curso.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Cabeçalho do Curso */}
                <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                      Boletim do Curso
                    </span>
                    <h3 className="text-xl font-bold">{curso.nome}</h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Média Final do Curso</p>
                      <p className="text-2xl font-extrabold text-amber-400">
                        {formatarNota(resumoCurso.mediaFinal)}
                      </p>
                    </div>
                    <StatusBadge situacao={resumoCurso.situacao} className="text-sm px-3 py-1.5" />
                  </div>
                </div>

                {/* Tabela de Módulos */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-6 font-semibold">Módulo</th>
                        <th className="py-3.5 px-6 font-semibold text-center">Nota Avaliação (80%)</th>
                        <th className="py-3.5 px-6 font-semibold text-center">Presença (10%)</th>
                        <th className="py-3.5 px-6 font-semibold text-center">Participação (10%)</th>
                        <th className="py-3.5 px-6 font-semibold text-center">Nota Final Módulo</th>
                        <th className="py-3.5 px-6 font-semibold text-right">Situação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {resultadosModulos.map(({ modulo, notaObj, resModulo }, idx) => (
                        <tr key={modulo.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6 font-semibold text-slate-900">
                            {idx + 1}. {modulo.nome}
                          </td>
                          <td className="py-4 px-6 text-center font-medium">
                            {notaObj ? formatarNota(notaObj.valor) : <span className="text-slate-400">-</span>}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="font-semibold text-slate-700">
                              {Math.round(resModulo.taxaPresenca * 100)}%
                            </span>
                            <span className="text-xs text-slate-400 block">
                              ({resModulo.totalPresencas}/{resModulo.totalAulas} aulas)
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {resModulo.participativo ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                <Check className="w-3.5 h-3.5" /> Sim (+1.0)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                <X className="w-3.5 h-3.5" /> Não (0.0)
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center font-extrabold text-slate-900 text-base">
                            {formatarNota(resModulo.notaFinal)}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <StatusBadge situacao={resModulo.situacao} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
