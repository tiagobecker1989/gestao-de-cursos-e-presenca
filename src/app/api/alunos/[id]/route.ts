import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const alunoUpdateSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").optional(),
  email: z.string().email("E-mail inválido").optional(),
  cpf: z.string().optional().nullable(),
  ativo: z.boolean().optional(),
  observacaoProfessor: z.string().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    let aluno = await prisma.aluno.findUnique({
      where: { id: params.id },
      include: {
        atividades: {
          orderBy: { data: "desc" },
        },
        matriculas: {
          include: {
            curso: {
              include: {
                professor: {
                  select: { id: true, nome: true, email: true },
                },
                modulos: {
                  orderBy: { ordem: "asc" },
                  include: {
                    conteudos: {
                      orderBy: { ordem: "asc" },
                    },
                  },
                },
              },
            },
          },
        },
        notas: {
          include: {
            modulo: true,
          },
        },
        presencas: {
          include: {
            modulo: true,
          },
          orderBy: {
            data: "desc",
          },
        },
      },
    });

    if (!aluno) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    if (!aluno.tokenAcesso) {
      const tokenAcesso = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      aluno = await prisma.aluno.update({
        where: { id: params.id },
        data: { tokenAcesso },
        include: {
          atividades: { orderBy: { data: "desc" } },
          matriculas: {
            include: {
              curso: {
                include: {
                  professor: { select: { id: true, nome: true, email: true } },
                  modulos: {
                    orderBy: { ordem: "asc" },
                    include: { conteudos: { orderBy: { ordem: "asc" } } },
                  },
                },
              },
            },
          },
          notas: { include: { modulo: true } },
          presencas: { include: { modulo: true }, orderBy: { data: "desc" } },
        },
      });
    }

    return NextResponse.json(aluno);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar ficha do aluno" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = alunoUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const aluno = await prisma.aluno.update({
      where: { id: params.id },
      data: validation.data,
    });

    return NextResponse.json(aluno);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar dados do aluno" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.aluno.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Aluno excluído com sucesso" });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao excluir aluno" },
      { status: 500 }
    );
  }
}
