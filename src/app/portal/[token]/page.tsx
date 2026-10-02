import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calcularNotaFinalModulo, calcularSituacaoCurso } from "@/lib/calculos";
import { BoletimStude } from "@/components/BoletimStude";

export const revalidate = 0;

export default async function PortalResponsavelPage({
  params,
}: {
  params: { token: string };
}) {
  const aluno = await prisma.aluno.findUnique({
    where: { tokenAcesso: params.token },
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
                  conteudos: {
                    select: { id: true },
                  },
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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow border max-w-md text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Portal do Responsável</h2>
          <p className="text-sm text-slate-500">
            O aluno <span className="font-semibold text-slate-900">{aluno.nome}</span> ainda não possui matrículas ativas em cursos.
          </p>
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
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <BoletimStude
        aluno={aluno}
        curso={curso}
        modulos={modulosDesempenho}
        mediaFinalCurso={resumoCurso.mediaFinal}
        situacaoCurso={resumoCurso.situacao}
        totalPresencasGeral={totalPresencasGeral}
        totalAulasGeral={totalAulasGeral}
        atividades={aluno.atividades}
        isPortalView={true}
      />
    </div>
  );
}
