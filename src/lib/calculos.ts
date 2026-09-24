export interface ResultadoModulo {
  notaFinal: number;
  aprovado: boolean;
  mediaNotas: number;
  taxaPresenca: number;
  totalAulas: number;
  totalPresencas: number;
  participativo: boolean;
  situacao: "APROVADO" | "RECUPERACAO";
}

export interface ResultadoCurso {
  mediaFinal: number;
  situacao: "APROVADO" | "RECUPERACAO";
  modulosComRecuperacao: number;
  totalModulos: number;
}

export function calcularNotaFinalModulo(
  notas: number[],
  presencas: boolean[],
  participativo: boolean
): ResultadoModulo {
  const mediaNotas =
    notas.length > 0
      ? notas.reduce((acc, curr) => acc + curr, 0) / notas.length
      : 0;

  const totalAulas = presencas.length;
  const totalPresencas = presencas.filter(Boolean).length;
  const taxaPresenca = totalAulas > 0 ? totalPresencas / totalAulas : 1.0;

  const componenteNotas = mediaNotas * 0.8;
  const componentePresenca = taxaPresenca * 10 * 0.1;
  const componenteParticipacao = participativo ? 10 * 0.1 : 0;

  const notaFinalBruta = componenteNotas + componentePresenca + componenteParticipacao;
  const notaFinal = Math.min(10, Math.round(notaFinalBruta * 100) / 100);
  const aprovado = notaFinal >= 7.0;

  return {
    notaFinal,
    aprovado,
    mediaNotas: Math.round(mediaNotas * 100) / 100,
    taxaPresenca: Math.round(taxaPresenca * 100) / 100,
    totalAulas,
    totalPresencas,
    participativo,
    situacao: aprovado ? "APROVADO" : "RECUPERACAO",
  };
}

export function calcularSituacaoCurso(
  modulosResultados: ResultadoModulo[]
): ResultadoCurso {
  if (modulosResultados.length === 0) {
    return {
      mediaFinal: 0,
      situacao: "RECUPERACAO",
      modulosComRecuperacao: 0,
      totalModulos: 0,
    };
  }

  const somaNotasFinais = modulosResultados.reduce(
    (acc, m) => acc + m.notaFinal,
    0
  );
  const mediaFinal = Math.round((somaNotasFinais / modulosResultados.length) * 100) / 100;

  const modulosComRecuperacao = modulosResultados.filter(
    (m) => !m.aprovado
  ).length;

  const aprovado = modulosComRecuperacao === 0;

  return {
    mediaFinal,
    situacao: aprovado ? "APROVADO" : "RECUPERACAO",
    modulosComRecuperacao,
    totalModulos: modulosResultados.length,
  };
}
