import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CursoDetalhesClient } from "./CursoDetalhesClient";

export const revalidate = 0;

export default async function CursoDetalhePage({
  params,
}: {
  params: { id: string };
}) {
  const [curso, todosAlunos] = await Promise.all([
    prisma.curso.findUnique({
      where: { id: params.id },
      include: {
        modulos: {
          orderBy: { ordem: "asc" },
          include: {
            conteudos: {
              orderBy: { ordem: "asc" },
            },
          },
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
    }),
    prisma.aluno.findMany({
      select: { id: true, nome: true, email: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  if (!curso) {
    notFound();
  }

  return (
    <div>
      <Header
        title={curso.nome}
        subtitle={curso.descricao || "Sem descrição informada"}
        action={
          <Link href="/cursos">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Voltar
            </Button>
          </Link>
        }
      />

      <CursoDetalhesClient curso={curso} todosAlunos={todosAlunos} />
    </div>
  );
}
