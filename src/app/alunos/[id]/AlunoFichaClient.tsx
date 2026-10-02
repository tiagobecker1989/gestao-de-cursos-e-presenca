"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import {
  FileText,
  Share2,
  Trash2,
  Power,
  ShieldAlert,
  Save,
  Check,
  Award,
} from "lucide-react";
import Link from "next/link";

interface AlunoFichaClientProps {
  aluno: {
    id: string;
    nome: string;
    email: string;
    ativo: boolean;
    tokenAcesso?: string | null;
    observacaoProfessor?: string | null;
  };
  podeEmitirCertificado: boolean;
}

export function AlunoFichaClient({ aluno, podeEmitirCertificado }: AlunoFichaClientProps) {
  const router = useRouter();
  const [ativo, setAtivo] = useState(aluno.ativo);
  const [observacao, setObservacao] = useState(aluno.observacaoProfessor || "");
  const [isSavingObs, setIsSavingObs] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const portalUrl = typeof window !== "undefined"
    ? `${window.location.origin}/portal/${aluno.tokenAcesso}`
    : `/portal/${aluno.tokenAcesso}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleToggleStatus = async () => {
    try {
      const res = await fetch(`/api/alunos/${aluno.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !ativo }),
      });
      if (res.ok) {
        setAtivo(!ativo);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveObs = async () => {
    setIsSavingObs(true);
    try {
      await fetch(`/api/alunos/${aluno.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observacaoProfessor: observacao }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingObs(false);
    }
  };

  const handleDeleteAluno = async () => {
    if (!confirm(`Tem certeza que deseja remover o aluno ${aluno.nome}? Esta ação excluirá suas notas e presenças.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/alunos/${aluno.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/alunos");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Ações Rápidas */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/alunos/${aluno.id}/boletim`}>
            <Button variant="secondary" size="sm" icon={<FileText className="w-4 h-4 text-sky-400" />}>
              Gerar Boletim Stude+
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            icon={copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-indigo-600" />}
          >
            {copiedLink ? "Link Copiado!" : "Link do Responsável"}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Ativo / Inativo */}
          <Button
            variant={ativo ? "outline" : "danger"}
            size="sm"
            onClick={handleToggleStatus}
            icon={<Power className="w-3.5 h-3.5" />}
          >
            {ativo ? "Status: ATIVO" : "Status: INATIVO"}
          </Button>

          {/* Certificado Trava */}
          {podeEmitirCertificado ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => alert(`Certificado emitido para o aluno ${aluno.nome} com sucesso!`)}
              icon={<Award className="w-4 h-4" />}
            >
              Emitir Certificado
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Certificado Bloqueado (Nota &lt; 7.0)
            </span>
          )}

          {/* Remover Aluno */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteAluno}
            isLoading={isDeleting}
            className="text-rose-600 hover:bg-rose-50"
            icon={<Trash2 className="w-4 h-4" />}
          >
            Remover
          </Button>
        </div>
      </div>

      {/* Editor do Parecer / Observação do Professor */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
          <span>Observação / Parecer Pedagógico do Professor (Visível no Boletim)</span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveObs}
            isLoading={isSavingObs}
            icon={<Save className="w-3.5 h-3.5 text-sky-600" />}
          >
            Salvar Parecer
          </Button>
        </h3>
        <textarea
          rows={3}
          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          placeholder="Escreva comentários pedagógicos sobre a evolução e facilidades do aluno..."
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />
      </div>
    </div>
  );
}
