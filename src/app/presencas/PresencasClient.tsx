"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Select } from "@/components/Select";
import { Input } from "@/components/Input";
import { CheckCircle2, XCircle, Save } from "lucide-react";

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

interface PresencaExistente {
  alunoId: string;
  moduloId: string;
  data: string | Date;
  presente: boolean;
}

interface PresencasClientProps {
  cursos: CursoItem[];
  presencasExistentes: PresencaExistente[];
}

export function PresencasClient({ cursos, presencasExistentes }: PresencasClientProps) {
  const [cursoId, setCursoId] = useState("");
  const [moduloId, setModuloId] = useState("");
  const [dataChamada, setDataChamada] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [estadosPresenca, setEstadosPresenca] = useState<{ [alunoId: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cursoSelecionado = cursos.find((c) => c.id === cursoId);
  const modulosDisponiveis = cursoSelecionado ? cursoSelecionado.modulos : [];

  const carregarPresencas = (selectedModuloId: string, selectedDate: string) => {
    setModuloId(selectedModuloId);
    setSuccessMessage(null);
    setError(null);

    if (!selectedModuloId || !selectedDate || !cursoSelecionado) return;

    const dataAlvo = new Date(selectedDate).toISOString().split("T")[0];

    const presencasDoModulo = presencasExistentes.filter((p) => {
      const dataP = new Date(p.data).toISOString().split("T")[0];
      return p.moduloId === selectedModuloId && dataP === dataAlvo;
    });

    const novosEstados: { [key: string]: boolean } = {};

    cursoSelecionado.matriculas.forEach((m) => {
      const p = presencasDoModulo.find((item) => item.alunoId === m.aluno.id);
      novosEstados[m.aluno.id] = p ? p.presente : true;
    });

    setEstadosPresenca(novosEstados);
  };

  const handleTogglePresenca = (alunoId: string) => {
    setEstadosPresenca((prev) => ({
      ...prev,
      [alunoId]: !prev[alunoId],
    }));
  };

  const handleSavePresencas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduloId || !cursoSelecionado || !dataChamada) return;

    setIsLoading(true);
    setSuccessMessage(null);
    setError(null);

    try {
      const promises = cursoSelecionado.matriculas.map((m) => {
        const alunoId = m.aluno.id;
        const presente = estadosPresenca[alunoId] ?? true;

        return fetch("/api/presencas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            alunoId,
            moduloId,
            data: dataChamada,
            presente,
          }),
        });
      });

      const results = await Promise.all(promises);
      const hasErrors = results.some((r) => !r.ok);

      if (hasErrors) {
        throw new Error("Erro ao salvar presenças de alguns alunos.");
      }

      setSuccessMessage("Chamada realizada e salva com sucesso!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Filtros de Chamada */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
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
          onChange={(e) => carregarPresencas(e.target.value, dataChamada)}
        />

        <Input
          label="3. Data da Chamada *"
          type="date"
          value={dataChamada}
          onChange={(e) => {
            setDataChamada(e.target.value);
            if (moduloId) carregarPresencas(moduloId, e.target.value);
          }}
        />
      </div>

      {/* Tabela da Chamada */}
      {cursoId && moduloId && cursoSelecionado && (
        <form onSubmit={handleSavePresencas} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
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
                    <th className="py-3.5 px-6 font-semibold">Aluno</th>
                    <th className="py-3.5 px-6 font-semibold">E-mail</th>
                    <th className="py-3.5 px-6 font-semibold text-center">Status de Presença</th>
                    <th className="py-3.5 px-6 font-semibold text-right">Ação Rápida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cursoSelecionado.matriculas.map((m) => {
                    const aluno = m.aluno;
                    const isPresente = estadosPresenca[aluno.id] ?? true;

                    return (
                      <tr key={aluno.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900">{aluno.nome}</td>
                        <td className="py-4 px-6 text-slate-500 text-xs">{aluno.email}</td>
                        <td className="py-4 px-6 text-center">
                          {isPresente ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Presente
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-4 h-4 text-rose-600" /> Ausente (Falta)
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            type="button"
                            variant={isPresente ? "danger" : "primary"}
                            size="sm"
                            onClick={() => handleTogglePresenca(aluno.id)}
                          >
                            {isPresente ? "Marcar Falta" : "Marcar Presença"}
                          </Button>
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
              Salvar Chamada
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
