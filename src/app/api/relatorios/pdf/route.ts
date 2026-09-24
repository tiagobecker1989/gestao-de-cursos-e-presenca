import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcularNotaFinalModulo, calcularSituacaoCurso } from "@/lib/calculos";
import { formatarCPF, formatarNota } from "@/lib/utils";
import PDFDocument from "pdfkit";

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

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Uint8Array[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    const bufferPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));
    });

    // Cabeçalho do PDF
    doc
      .fillColor("#0284c7")
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("EduGestão — Relatório Acadêmico", { align: "left" });

    doc
      .fillColor("#475569")
      .fontSize(12)
      .font("Helvetica")
      .text(`Curso: ${curso.nome}`, { align: "left" })
      .text(`Carga Horária: ${curso.cargaHoraria || "-"}h | Total de Módulos: ${curso.modulos.length}`)
      .text(`Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}`)
      .moveDown(1.5);

    doc
      .strokeColor("#e2e8f0")
      .lineWidth(1)
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .stroke()
      .moveDown(1.5);

    if (curso.matriculas.length === 0) {
      doc
        .fontSize(12)
        .fillColor("#64748b")
        .text("Nenhum aluno matriculado neste curso.", { align: "center" });
    } else {
      curso.matriculas.forEach((matricula, index) => {
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
          };
        });

        const resumoCurso = calcularSituacaoCurso(resultadosModulos.map((r) => r.res));

        if (doc.y > 680) {
          doc.addPage();
        }

        // Título do Aluno
        doc
          .fillColor("#0f172a")
          .fontSize(14)
          .font("Helvetica-Bold")
          .text(`${index + 1}. ${aluno.nome}`);

        doc
          .fillColor("#64748b")
          .fontSize(10)
          .font("Helvetica")
          .text(`E-mail: ${aluno.email} | CPF: ${formatarCPF(aluno.cpf)}`)
          .moveDown(0.5);

        // Tabela de Módulos
        doc
          .fillColor("#0f172a")
          .fontSize(9)
          .font("Helvetica-Bold");

        const startY = doc.y;
        doc.text("Módulo", 40, startY, { width: 180 });
        doc.text("Nota Av.", 220, startY, { width: 60, align: "center" });
        doc.text("Presença", 290, startY, { width: 60, align: "center" });
        doc.text("Part. (+1.0)", 365, startY, { width: 60, align: "center" });
        doc.text("Nota Final", 435, startY, { width: 60, align: "center" });
        doc.text("Situação", 500, startY, { width: 55, align: "right" });

        doc.moveDown(0.5);
        doc
          .strokeColor("#cbd5e1")
          .lineWidth(0.5)
          .moveTo(40, doc.y)
          .lineTo(555, doc.y)
          .stroke()
          .moveDown(0.5);

        doc.font("Helvetica").fontSize(9);

        resultadosModulos.forEach(({ modulo, res }) => {
          const rowY = doc.y;

          if (rowY > 730) {
            doc.addPage();
          }

          doc.fillColor("#1e293b").text(modulo.nome, 40, doc.y, { width: 180 });
          doc.text(formatarNota(res.mediaNotas), 220, rowY, { width: 60, align: "center" });
          doc.text(`${Math.round(res.taxaPresenca * 100)}%`, 290, rowY, { width: 60, align: "center" });
          doc.text(res.participativo ? "Sim" : "Não", 365, rowY, { width: 60, align: "center" });
          doc.font("Helvetica-Bold").text(formatarNota(res.notaFinal), 435, rowY, { width: 60, align: "center" });

          if (res.situacao === "APROVADO") {
            doc.fillColor("#047857").text("Aprovado", 500, rowY, { width: 55, align: "right" });
          } else {
            doc.fillColor("#b45309").text("Recuperação", 500, rowY, { width: 55, align: "right" });
          }

          doc.font("Helvetica").moveDown(0.5);
        });

        // Rodapé com Média Final do Aluno no Curso
        doc.moveDown(0.5);
        doc
          .fillColor("#0f172a")
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(
            `Média Final do Curso: ${formatarNota(resumoCurso.mediaFinal)}  |  Situação Final: ${
              resumoCurso.situacao === "APROVADO" ? "APROVADO" : "EM RECUPERAÇÃO"
            }`,
            40,
            doc.y,
            { align: "right" }
          )
          .moveDown(1.5);

        doc
          .strokeColor("#f1f5f9")
          .lineWidth(1)
          .moveTo(40, doc.y)
          .lineTo(555, doc.y)
          .stroke()
          .moveDown(1.5);
      });
    }

    doc.end();

    const pdfBuffer = await bufferPromise;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="relatorio-${curso.nome
          .toLowerCase()
          .replace(/\s+/g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao gerar relatório em PDF" },
      { status: 500 }
    );
  }
}
