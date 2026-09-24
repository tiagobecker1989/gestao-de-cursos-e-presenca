import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { prisma } from "@/lib/prisma";
import { formatarCPF } from "@/lib/utils";
import { PlusCircle, Users, Mail, CreditCard, BookOpen } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function AlunosPage() {
  const alunos = await prisma.aluno.findMany({
    include: {
      matriculas: {
        include: {
          curso: true,
        },
      },
    },
    orderBy: {
      nome: "asc",
    },
  });

  return (
    <div>
      <Header
        title="Gestão de Alunos"
        subtitle="Consulte e gerencie todos os alunos cadastrados no sistema"
        action={
          <Link href="/alunos/novo">
            <Button icon={<PlusCircle className="w-4 h-4" />}>Novo Aluno</Button>
          </Link>
        }
      />

      {alunos.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto my-12 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Nenhum aluno cadastrado</h3>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            Cadastre os alunos para realizar matrículas e lançamento de notas e presenças.
          </p>
          <Link href="/alunos/novo">
            <Button icon={<PlusCircle className="w-4 h-4" />}>Cadastrar Primeiro Aluno</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6 font-semibold">Nome do Aluno</th>
                  <th className="py-4 px-6 font-semibold">E-mail</th>
                  <th className="py-4 px-6 font-semibold">CPF</th>
                  <th className="py-4 px-6 font-semibold">Cursos Matriculados</th>
                  <th className="py-4 px-6 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alunos.map((aluno) => (
                  <tr key={aluno.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                        {aluno.nome.substring(0, 2).toUpperCase()}
                      </div>
                      {aluno.nome}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {aluno.email}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <span className="flex items-center gap-1.5 font-mono text-xs">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        {formatarCPF(aluno.cpf)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                        <BookOpen className="w-3 h-3" />
                        {aluno.matriculas.length} curso(s)
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link href={`/alunos/${aluno.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver Ficha
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
