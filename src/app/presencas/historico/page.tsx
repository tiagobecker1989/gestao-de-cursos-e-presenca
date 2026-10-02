import { prisma } from "@/lib/prisma";
import { HistoricoPresencasClient } from "./HistoricoPresencasClient";

export const revalidate = 0;

export default async function HistoricoPresencasPage() {
  const [cursos, presencas] = await Promise.all([
    prisma.curso.findMany({
      include: {
        modulos: {
          orderBy: { ordem: "asc" },
        },
        matriculas: {
          include: {
            aluno: true,
          },
          orderBy: {
            aluno: { nome: "asc" },
          },
        },
      },
      orderBy: { nome: "asc" },
    }),
    prisma.presenca.findMany({
      orderBy: { data: "asc" },
    }),
  ]);

  return <HistoricoPresencasClient cursos={cursos} presencas={presencas} />;
}
