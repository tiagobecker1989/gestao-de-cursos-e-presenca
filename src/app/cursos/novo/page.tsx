"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NovoCursoPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/cursos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          descricao: descricao || undefined,
          cargaHoraria: cargaHoraria ? parseInt(cargaHoraria, 10) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao cadastrar curso");
      }

      router.push(`/cursos/${data.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Header
        title="Novo Curso"
        subtitle="Cadastre um novo curso no sistema"
        action={
          <Link href="/cursos">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Voltar
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <Input
          label="Nome do Curso *"
          placeholder="Ex: Desenvolvimento Web Full Stack"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Descrição</label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 text-sm bg-white border rounded-lg border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
            placeholder="Visão geral e objetivos do curso..."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        <Input
          label="Carga Horária (em horas)"
          type="number"
          placeholder="Ex: 80"
          value={cargaHoraria}
          onChange={(e) => setCargaHoraria(e.target.value)}
        />

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Link href="/cursos">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" isLoading={isLoading} icon={<Save className="w-4 h-4" />}>
            Salvar Curso
          </Button>
        </div>
      </form>
    </div>
  );
}
