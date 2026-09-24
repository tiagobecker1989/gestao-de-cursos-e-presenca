import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const presencaSchema = z.object({
  alunoId: z.string().min(1, "O ID do aluno é obrigatório"),
  moduloId: z.string().min(1, "O ID do módulo é obrigatório"),
  data: z.string().min(1, "A data da chamada é obrigatória"),
  presente: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = presencaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { alunoId, moduloId, data, presente } = validation.data;
    const dataObj = new Date(data);

    const presenca = await prisma.presenca.upsert({
      where: {
        alunoId_moduloId_data: {
          alunoId,
          moduloId,
          data: dataObj,
        },
      },
      update: {
        presente,
      },
      create: {
        alunoId,
        moduloId,
        data: dataObj,
        presente,
      },
    });

    return NextResponse.json(presenca);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao registrar presença" },
      { status: 500 }
    );
  }
}
