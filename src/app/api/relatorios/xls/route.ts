import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcularNotaFinalModulo, calcularSituacaoCurso } from "@/lib/calculos";
import { formatarCPF, formatarNota } from "@/lib/utils";
import ExcelJS from "exceljs";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursoId = searchParams.get("cursoId");

    if (!cursoId) {
      return NextResponse.json(
        { error: "O parâmetro cursoId é obrigatório" },
        { status: 400 }
      );
    }

    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        modulos: {
          orderBy: { ordem: "asc" },
        },
        matriculas: {
          include: {
            aluno: {
              include: {
                notas: true,
                presencas: true,
              },
            },
          },
          orderBy: {
            aluno: { nome: "asc" },
          },
        },
      },
    });

    if (!curso) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "EduGestão";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Relatório Acadêmico");

    // Cabeçalho da Planilha
    worksheet.columns = [
      { header: "Nome do Aluno", key: "alunoNome", width: 25 },
      { header: "E-mail", key: "alunoEmail", width: 28 },
      { header: "CPF", key: "alunoCpf", width: 16 },
      { header: "Módulo", key: "moduloNome", width: 25 },
      { header: "Nota Avaliação", key: "notaAvaliacao", width: 15 },
      { header: "Presença (%)", key: "taxaPresenca", width: 15 },
      { header: "Participativo", key: "participativo", width: 15 },
      { header: "Nota Final Módulo", key: "notaFinalModulo", width: 18 },
      { header: "Situação Módulo", key: "situacaoModulo", width: 18 },
      { header: "Média Final Curso", key: "mediaFinalCurso", width: 18 },
      { header: "Situação Final Curso", key: "situacaoCurso", width: 20 },
    ];

    // Estilizar linha de cabeçalho
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "0284C7" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    // Adicionar dados dos alunos
    curso.matriculas.forEach((matricula) => {
      const aluno = matricula.aluno;

      const resultadosModulos = curso.modulos.map((modulo) => {
        const notaObj = aluno.notas.find((n) => n.moduloId === modulo.id);
        const presencasObj = aluno.presencas
          .filter((p) => p.moduloId === modulo.id)
          .map((p) => p.presente);

        return {
          modulo,
          res: calcularNotaFinalModulo(
            notaObj ? [notaObj.valor] : [],
            presencasObj,
            notaObj ? notaObj.participativo : false
          ),
          notaAvaliacao: notaObj ? notaObj.valor : 0,
        };
      });

      const resumoCurso = calcularSituacaoCurso(resultadosModulos.map((r) => r.res));

      resultadosModulos.forEach(({ modulo, res, notaAvaliacao }) => {
        const row = worksheet.addRow({
          alunoNome: aluno.nome,
          alunoEmail: aluno.email,
          alunoCpf: formatarCPF(aluno.cpf),
          moduloNome: modulo.nome,
          notaAvaliacao: formatarNota(notaAvaliacao),
          taxaPresenca: `${Math.round(res.taxaPresenca * 100)}%`,
          participativo: res.participativo ? "Sim" : "Não",
          notaFinalModulo: formatarNota(res.notaFinal),
          situacaoModulo: res.situacao === "APROVADO" ? "Aprovado" : "Recuperação",
          mediaFinalCurso: formatarNota(resumoCurso.mediaFinal),
          situacaoCurso: resumoCurso.situacao === "APROVADO" ? "APROVADO" : "RECUPERAÇÃO",
        });

        // Estilização de cores da situação
        const cellSituacao = row.getCell("situacaoModulo");
        if (res.situacao === "APROVADO") {
          cellSituacao.font = { color: { argb: "047857" }, bold: true };
        } else {
          cellSituacao.font = { color: { argb: "B45309" }, bold: true };
        }

        const cellSituacaoCurso = row.getCell("situacaoCurso");
        if (resumoCurso.situacao === "APROVADO") {
          cellSituacaoCurso.font = { color: { argb: "047857" }, bold: true };
        } else {
          cellSituacaoCurso.font = { color: { argb: "B45309" }, bold: true };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="relatorio-${curso.nome
          .toLowerCase()
          .replace(/\s+/g, "-")}.xlsx"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao gerar planilha Excel" },
      { status: 500 }
    );
  }
}
