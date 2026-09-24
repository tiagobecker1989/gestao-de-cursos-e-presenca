"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import {
  FileText,
  FileSpreadsheet,
  Plus,
  Users,
  Layers,
  FileCode,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

interface AlunoOption {
  id: string;
  nome: string;
  email: string;
}

interface CursoDetalhesClientProps {
  curso: any;
  todosAlunos: AlunoOption[];
}

export function CursoDetalhesClient({ curso, todosAlunos }: CursoDetalhesClientProps) {
  const router = useRouter();
  const [isModuloModalOpen, setIsModuloModalOpen] = useState(false);
  const [isConteudoModalOpen, setIsConteudoModalOpen] = useState(false);
  const [isMatriculaModalOpen, setIsMatriculaModalOpen] = useState(false);

  const [nomeModulo, setNomeModulo] = useState("");
  const [moduloIdSelecionado, setModuloIdSelecionado] = useState("");
  const [tituloConteudo, setTituloConteudo] = useState("");
  const [descricaoConteudo, setDescricaoConteudo] = useState("");
  const [alunoIdMatricula, setAlunoIdMatricula] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateModulo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/modulos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cursoId: curso.id,
          nome: nomeModulo,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar módulo");
      }

      setNomeModulo("");
      setIsModuloModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConteudo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/conteudos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduloId: moduloIdSelecionado,
          titulo: tituloConteudo,
          descricao: descricaoConteudo || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao adicionar conteúdo");
      }

      setTituloConteudo("");
      setDescricaoConteudo("");
      setIsConteudoModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatricularAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/matriculas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alunoId: alunoIdMatricula,
          cursoId: curso.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao matricular aluno");
      }

      setAlunoIdMatricula("");
      setIsMatriculaModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const alunosNaoMatriculados = todosAlunos.filter(
    (a) => !curso.matriculas.some((m: any) => m.alunoId === a.id)
  );

  return (
    <div className="space-y-8">
      {/* Export & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModuloModalOpen(true)}
            icon={<Plus className="w-4 h-4 text-sky-600" />}
          >
            Adicionar Módulo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMatriculaModalOpen(true)}
            icon={<UserPlus className="w-4 h-4 text-indigo-600" />}
          >
            Matricular Aluno
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <a href={`/api/relatorios/pdf?cursoId=${curso.id}`} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" icon={<FileText className="w-4 h-4 text-rose-400" />}>
              Exportar PDF
            </Button>
          </a>
          <a href={`/api/relatorios/xls?cursoId=${curso.id}`} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" icon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />}>
              Exportar Excel
            </Button>
          </a>
        </div>
      </div>

      {/* Grid com Módulos e Alunos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna 1 & 2: Módulos & Conteúdos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-600" />
              Módulos e Conteúdos
            </h2>
          </div>

          {curso.modulos.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
              <p className="text-sm text-slate-500 mb-4">Nenhum módulo cadastrado neste curso.</p>
              <Button size="sm" onClick={() => setIsModuloModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
                Adicionar Módulo
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {curso.modulos.map((modulo: any, index: number) => (
                <div
                  key={modulo.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                        Módulo {index + 1}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{modulo.nome}</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setModuloIdSelecionado(modulo.id);
                        setIsConteudoModalOpen(true);
                      }}
                      icon={<Plus className="w-3.5 h-3.5 text-sky-600" />}
                    >
                      Conteúdo
                    </Button>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Tópicos & Conteúdos
                    </h4>
                    {modulo.conteudos.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Nenhum conteúdo cadastrado.</p>
                    ) : (
                      <ul className="space-y-2">
                        {modulo.conteudos.map((cont: any) => (
                          <li
                            key={cont.id}
                            className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-start gap-2.5"
                          >
                            <FileCode className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-slate-800">{cont.titulo}</p>
                              {cont.descricao && (
                                <p className="text-slate-500 mt-0.5">{cont.descricao}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coluna 3: Alunos Matriculados */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Alunos Matriculados ({curso.matriculas.length})
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            {curso.matriculas.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 mb-4">Nenhum aluno matriculado neste curso.</p>
                <Button size="sm" variant="outline" onClick={() => setIsMatriculaModalOpen(true)}>
                  Matricular Aluno
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {curso.matriculas.map((m: any) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-xs text-slate-900">{m.aluno.nome}</p>
                      <p className="text-[11px] text-slate-500">{m.aluno.email}</p>
                    </div>
                    <Link href={`/alunos/${m.aluno.id}`}>
                      <Button variant="ghost" size="sm">
                        Ficha
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Adicionar Módulo */}
      <Modal
        isOpen={isModuloModalOpen}
        onClose={() => setIsModuloModalOpen(false)}
        title="Novo Módulo do Curso"
      >
        <form onSubmit={handleCreateModulo} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          <Input
            label="Nome do Módulo *"
            placeholder="Ex: Módulo 1 - Fundamentos"
            value={nomeModulo}
            onChange={(e) => setNomeModulo(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModuloModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Salvar Módulo
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Adicionar Conteúdo */}
      <Modal
        isOpen={isConteudoModalOpen}
        onClose={() => setIsConteudoModalOpen(false)}
        title="Adicionar Conteúdo ao Módulo"
      >
        <form onSubmit={handleCreateConteudo} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          <Input
            label="Título do Tópico *"
            placeholder="Ex: Introdução ao React Server Components"
            value={tituloConteudo}
            onChange={(e) => setTituloConteudo(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Descrição</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 text-sm bg-white border rounded-lg border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Resumo do que é abordado..."
              value={descricaoConteudo}
              onChange={(e) => setDescricaoConteudo(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsConteudoModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Salvar Conteúdo
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Matricular Aluno */}
      <Modal
        isOpen={isMatriculaModalOpen}
        onClose={() => setIsMatriculaModalOpen(false)}
        title="Matricular Aluno neste Curso"
      >
        <form onSubmit={handleMatricularAluno} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          <Select
            label="Selecione o Aluno *"
            options={alunosNaoMatriculados.map((a) => ({
              value: a.id,
              label: `${a.nome} (${a.email})`,
            }))}
            placeholder="Escolha um aluno..."
            value={alunoIdMatricula}
            onChange={(e) => setAlunoIdMatricula(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsMatriculaModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={!alunoIdMatricula}>
              Matricular Aluno
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
