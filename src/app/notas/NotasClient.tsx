"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Select } from "@/components/Select";
import { Input } from "@/components/Input";
import { Checkbox } from "@/components/Checkbox";
import { Save, CheckCircle2 } from "lucide-react";

interface ModuloOption {
  id: string;
  nome: string;
}

interface CursoItem {
  id: string;
  nome: string;
  modulos: ModuloOption[];
  matriculas: {
    aluno: {
      id: string;
      nome: string;
      email: string;
    };
  }[];
}

interface NotaExistente {
  alunoId: string;
  moduloId: string;
  valor: number;
  participativo: boolean;
  observacao?: string | null;
}

interface NotasClientProps {
  cursos: CursoItem[];
  notasExistentes: NotaExistente[];
}

export function NotasClient({ cursos, notasExistentes }: NotasClientProps) {
  const [cursoId, setCursoId] = useState("");
  const [moduloId, setModuloId] = useState("");

  const [valoresNotas, setValoresNotas] = useState<{ [alunoId: string]: string }>({});
  const [participativos, setParticipativos] = useState<{ [alunoId: string]: boolean }>({});
  const [observacoes, setObservacoes] = useState<{ [alunoId: string]: string }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cursoSelecionado = cursos.find((c) => c.id === cursoId);
  const modulosDisponiveis = cursoSelecionado ? cursoSelecionado.modulos : [];

  const handleSelectModulo = (selectedModuloId: string) => {
    setModuloId(selectedModuloId);
    setSuccessMessage(null);
    setError(null);

    if (!selectedModuloId) return;

    const notasDoModulo = notasExistentes.filter((n) => n.moduloId === selectedModuloId);

    const novosValores: { [key: string]: string } = {};
    const novosPart: { [key: string]: boolean } = {};
    const novasObs: { [key: string]: string } = {};

    notasDoModulo.forEach((n) => {
      novosValores[n.alunoId] = n.valor.toString();
      novosPart[n.alunoId] = n.participativo;
      novasObs[n.alunoId] = n.observacao || "";
    });

    setValoresNotas(novosValores);
    setParticipativos(novosPart);
    setObservacoes(novasObs);
  };

  const handleSaveNotas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduloId || !cursoSelecionado) return;

    setIsLoading(true);
    setSuccessMessage(null);
    setError(null);

    try {
      const promises = cursoSelecionado.matriculas.map((m) => {
        const alunoId = m.aluno.id;
        const valorStr = valoresNotas[alunoId];
        if (valorStr === undefined || valorStr === "") return null;

        const valor = parseFloat(valorStr);
        if (isNaN(valor)) return null;

        return fetch("/api/notas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            alunoId,
            moduloId,
            valor,
            participativo: !!participativos[alunoId],
            observacao: observacoes[alunoId] || undefined,
          }),
        });
      });

      const results = await Promise.all(promises.filter(Boolean));
      const hasErrors = results.some((r) => r && !r.ok);

      if (hasErrors) {
        throw new Error("Ocorreu um erro ao salvar algumas notas. Tente novamente.");
      }

      setSuccessMessage("Notas salvas com sucesso!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Seleção de Curso e Módulo */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="1. Selecione o Curso *"
          options={cursos.map((c) => ({ value: c.id, label: c.nome }))}
          placeholder="Escolha um curso..."
          value={cursoId}
          onChange={(e) => {
            setCursoId(e.target.value);
            setModuloId("");
          }}
        />

        <Select
          label="2. Selecione o Módulo *"
          options={modulosDisponiveis.map((m) => ({ value: m.id, label: m.nome }))}
          placeholder="Escolha um módulo..."
          value={moduloId}
          disabled={!cursoId}
          onChange={(e) => handleSelectModulo(e.target.value)}
        />
      </div>

      {/* Tabela de Lançamento */}
      {cursoId && moduloId && cursoSelecionado && (
        <form onSubmit={handleSaveNotas} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMessage}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {cursoSelecionado.matriculas.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">Nenhum aluno matriculado neste curso.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Aluno</th>
                    <th className="py-3.5 px-4 font-semibold w-40">Nota (0 a 10)</th>
                    <th className="py-3.5 px-4 font-semibold w-44">Participativo?</th>
                    <th className="py-3.5 px-4 font-semibold">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cursoSelecionado.matriculas.map((m) => {
                    const aluno = m.aluno;
                    return (
                      <tr key={aluno.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-900">
                          <div>
                            <p className="text-slate-900">{aluno.nome}</p>
                            <p className="text-xs text-slate-400 font-normal">{aluno.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            placeholder="0.0 - 10.0"
                            value={valoresNotas[aluno.id] || ""}
                            onChange={(e) =>
                              setValoresNotas({ ...valoresNotas, [aluno.id]: e.target.value })
                            }
                          />
                        </td>
                        <td className="py-4 px-4">
                          <Checkbox
                            label="Aluno Participativo"
                            description="+1.0 pt na média final"
                            checked={!!participativos[aluno.id]}
                            onChange={(e) =>
                              setParticipativos({
                                ...participativos,
                                [aluno.id]: e.target.checked,
                              })
                            }
                          />
                        </td>
                        <td className="py-4 px-4">
                          <Input
                            placeholder="Anotações sobre o aluno..."
                            value={observacoes[aluno.id] || ""}
                            onChange={(e) =>
                              setObservacoes({ ...observacoes, [aluno.id]: e.target.value })
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" isLoading={isLoading} icon={<Save className="w-4 h-4" />}>
              Salvar Todas as Notas
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
