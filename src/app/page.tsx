import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { prisma } from "@/lib/prisma";
import { calcularNotaFinalModulo, calcularSituacaoCurso } from "@/lib/calculos";
import { BookOpen, Users, GraduationCap, Award, PlusCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";

export const revalidate = 0;

export default async function DashboardPage() {
  const [totalCursos, totalAlunos, cursosRecentes, alunos] = await Promise.all([
    prisma.curso.count(),
    prisma.aluno.count(),
    prisma.curso.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { modulos: true, matriculas: true },
        },
      },
    }),
    prisma.aluno.findMany({
      include: {
        matriculas: {
          include: {
            curso: {
              include: {
                modulos: true,
              },
            },
          },
        },
        notas: true,
        presencas: true,
      },
    }),
  ]);

  let somaMedias = 0;
  let totalAprovados = 0;
  let totalAlunosComCalculo = 0;

  alunos.forEach((aluno) => {
    aluno.matriculas.forEach((matricula) => {
      const modulosRes = matricula.curso.modulos.map((mod) => {
        const nota = aluno.notas.find((n) => n.moduloId === mod.id);
        const presencas = aluno.presencas
          .filter((p) => p.moduloId === mod.id)
          .map((p) => p.presente);

        const valorNota = nota ? [nota.valor] : [];
        const part = nota ? nota.participativo : false;

        return calcularNotaFinalModulo(valorNota, presencas, part);
      });

      if (modulosRes.length > 0) {
        const resultadoCurso = calcularSituacaoCurso(modulosRes);
        somaMedias += resultadoCurso.mediaFinal;
        if (resultadoCurso.situacao === "APROVADO") {
          totalAprovados++;
        }
        totalAlunosComCalculo++;
      }
    });
  });

  const mediaGeral =
    totalAlunosComCalculo > 0 ? (somaMedias / totalAlunosComCalculo).toFixed(1) : "0.0";
  const taxaAprovacao =
    totalAlunosComCalculo > 0
      ? `${Math.round((totalAprovados / totalAlunosComCalculo) * 100)}%`
      : "0%";

  return (
    <div>
      <Header
        title="Painel de Controle"
        subtitle="Visão geral do desempenho dos alunos e estatísticas dos cursos"
        action={
          <div className="flex items-center gap-3">
            <Link href="/cursos/novo">
              <Button icon={<PlusCircle className="w-4 h-4" />}>Novo Curso</Button>
            </Link>
            <Link href="/alunos/novo">
              <Button variant="outline" icon={<PlusCircle className="w-4 h-4" />}>
                Novo Aluno
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total de Cursos"
          value={totalCursos}
          subtitle="Cursos ativos cadastrados"
          icon={BookOpen}
          variant="sky"
        />
        <StatCard
          title="Total de Alunos"
          value={totalAlunos}
          subtitle="Alunos com matrícula"
          icon={Users}
          variant="indigo"
        />
        <StatCard
          title="Média Geral"
          value={mediaGeral}
          subtitle="Média ponderada geral"
          icon={GraduationCap}
          variant="amber"
        />
        <StatCard
          title="Taxa de Aprovação"
          value={taxaAprovacao}
          subtitle="Aprovados sem recuperação"
          icon={Award}
          variant="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-600" />
              Cursos Recentes
            </h2>
            <Link href="/cursos" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {cursosRecentes.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">Nenhum curso cadastrado ainda.</p>
          ) : (
            <div className="space-y-3">
              {cursosRecentes.map((curso) => (
                <div
                  key={curso.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/60 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">{curso.nome}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {curso._count.modulos} módulos • {curso._count.matriculas} alunos
                    </p>
                  </div>
                  <Link href={`/cursos/${curso.id}`}>
                    <Button variant="ghost" size="sm">
                      Gerenciar
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Alunos Recentes
            </h2>
            <Link href="/alunos" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {alunos.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">Nenhum aluno cadastrado ainda.</p>
          ) : (
            <div className="space-y-3">
              {alunos.slice(0, 5).map((aluno) => {
                let situacaoGlobal = "APROVADO";
                if (aluno.matriculas.length > 0) {
                  const cursoMat = aluno.matriculas[0].curso;
                  const modulosRes = cursoMat.modulos.map((mod) => {
                    const nota = aluno.notas.find((n) => n.moduloId === mod.id);
                    const presencas = aluno.presencas
                      .filter((p) => p.moduloId === mod.id)
                      .map((p) => p.presente);
                    return calcularNotaFinalModulo(
                      nota ? [nota.valor] : [],
                      presencas,
                      nota ? nota.participativo : false
                    );
                  });
                  situacaoGlobal = calcularSituacaoCurso(modulosRes).situacao;
                }

                return (
                  <div
                    key={aluno.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/60 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900">{aluno.nome}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{aluno.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge situacao={situacaoGlobal} />
                      <Link href={`/alunos/${aluno.id}`}>
                        <Button variant="ghost" size="sm">
                          Ficha
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
