import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { PresencasClient } from "./PresencasClient";

export const revalidate = 0;

export default async function PresencasPage() {
  const [cursos, presencasExistentes] = await Promise.all([
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
    prisma.presenca.findMany(),
  ]);

  return (
    <div>
      <Header
        title="Fazer Chamada (Presenças)"
        subtitle="Selecione a data, curso e módulo para controlar a frequência das aulas"
      />

      <PresencasClient cursos={cursos} presencasExistentes={presencasExistentes} />
    </div>
  );
}
