import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { prisma } from "@/lib/prisma";
import { PlusCircle, BookOpen, Layers, Users, Clock } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function CursosPage() {
  const cursos = await prisma.curso.findMany({
    include: {
      _count: {
        select: {
          modulos: true,
          matriculas: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <Header
        title="Gestão de Cursos"
        subtitle="Gerencie a estrutura de cursos, módulos, conteúdos e matrículas"
        action={
          <Link href="/cursos/novo">
            <Button icon={<PlusCircle className="w-4 h-4" />}>Novo Curso</Button>
          </Link>
        }
      />

      {cursos.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto my-12 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Nenhum curso cadastrado</h3>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            Comece criando o primeiro curso para adicionar módulos, conteúdos e alunos.
          </p>
          <Link href="/cursos/novo">
            <Button icon={<PlusCircle className="w-4 h-4" />}>Criar Primeiro Curso</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((curso) => (
            <div
              key={curso.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                    <BookOpen className="w-5 h-5" />
                  </span>
                  {curso.cargaHoraria && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      <Clock className="w-3 h-3" />
                      {curso.cargaHoraria}h
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-lg text-slate-900 mb-2">{curso.nome}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-6">
                  {curso.descricao || "Sem descrição informada."}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100 mb-5">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Layers className="w-4 h-4 text-sky-500" />
                    {curso._count.modulos} módulos
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users className="w-4 h-4 text-indigo-500" />
                    {curso._count.matriculas} alunos
                  </span>
                </div>

                <Link href={`/cursos/${curso.id}`} className="block">
                  <Button variant="outline" className="w-full">
                    Visualizar Grade
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
