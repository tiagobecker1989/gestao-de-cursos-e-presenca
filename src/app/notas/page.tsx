import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { NotasClient } from "./NotasClient";

export const revalidate = 0;

export default async function NotasPage() {
  const [cursos, notasExistentes] = await Promise.all([
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
    prisma.nota.findMany(),
  ]);

  return (
    <div>
      <Header
        title="Lançamento de Notas"
        subtitle="Selecione o curso e módulo para registrar a avaliação dos alunos"
      />

      <NotasClient cursos={cursos} notasExistentes={notasExistentes} />
    </div>
  );
}
