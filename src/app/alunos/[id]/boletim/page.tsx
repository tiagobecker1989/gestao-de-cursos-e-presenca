import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calcularNotaFinalModulo, calcularSituacaoCurso } from "@/lib/calculos";
import { BoletimStude } from "@/components/BoletimStude";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function AlunoBoletimPage({
  params,
}: {
  params: { id: string };
}) {
  const aluno = await prisma.aluno.findUnique({
    where: { id: params.id },
    include: {
      atividades: {
        orderBy: { data: "desc" },
      },
      matriculas: {
        include: {
          curso: {
            include: {
              professor: {
                select: { id: true, nome: true },
              },
              modulos: {
                orderBy: { ordem: "asc" },
                include: {
                  conteudos: { select: { id: true } },
                },
              },
            },
          },
        },
      },
      notas: true,
      presencas: true,
    },
  });

  if (!aluno) {
    notFound();
  }

  if (aluno.matriculas.length === 0) {
    return (
      <div>
        <Header
          title={`Boletim: ${aluno.nome}`}
          subtitle="Relatório de Progresso do Aluno"
          action={
            <Link href={`/alunos/${aluno.id}`}>
              <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
                Voltar
              </Button>
            </Link>
          }
        />
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto">
          <p className="text-sm text-slate-500">Este aluno ainda não está matriculado em nenhum curso.</p>
        </div>
      </div>
    );
  }

  const matricula = aluno.matriculas[0];
  const curso = matricula.curso;

  const modulosDesempenho = curso.modulos.map((modulo) => {
    const notaObj = aluno.notas.find((n) => n.moduloId === modulo.id);
    const presencasObj = aluno.presencas
      .filter((p) => p.moduloId === modulo.id)
      .map((p) => p.presente);

    const res = calcularNotaFinalModulo(
      notaObj ? [notaObj.valor] : [],
      presencasObj,
      notaObj ? notaObj.participativo : false
    );

    return {
      id: modulo.id,
      nome: modulo.nome,
      qtdConteudos: modulo.conteudos.length,
      notaAvaliacao: notaObj ? notaObj.valor : 0,
      taxaPresenca: res.taxaPresenca,
      participativo: res.participativo,
      notaFinal: res.notaFinal,
      aprovado: res.aprovado,
    };
  });

  const resumoCurso = calcularSituacaoCurso(
    modulosDesempenho.map((m) => ({
      notaFinal: m.notaFinal,
      aprovado: m.aprovado,
      mediaNotas: m.notaAvaliacao,
      taxaPresenca: m.taxaPresenca,
      totalAulas: 0,
      totalPresencas: 0,
      participativo: m.participativo,
      situacao: m.aprovado ? "APROVADO" : "RECUPERACAO",
    }))
  );

  const totalPresencasGeral = aluno.presencas.filter((p) => p.presente).length;
  const totalAulasGeral = aluno.presencas.length;

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <Header
          title={`Boletim Stude+: ${aluno.nome}`}
          subtitle="Relatório de progresso escolar pronto para impressão e entrega ao responsável"
          action={
            <Link href={`/alunos/${aluno.id}`}>
              <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
                Voltar à Ficha
              </Button>
            </Link>
          }
        />
      </div>

      <BoletimStude
        aluno={aluno}
        curso={curso}
        modulos={modulosDesempenho}
        mediaFinalCurso={resumoCurso.mediaFinal}
        situacaoCurso={resumoCurso.situacao}
        totalPresencasGeral={totalPresencasGeral}
        totalAulasGeral={totalAulasGeral}
        atividades={aluno.atividades}
      />
    </div>
  );
}
