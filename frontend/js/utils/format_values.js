export function formatCurrency(value) {
    let passaString = String(value);    

    if (passaString.includes('D')) {        
        passaString = passaString.replace('D', '').replace(/\./g, '').replace(',', '.');
    } else {        
        passaString = passaString.replace(',', '.');
    }

    const valorFormatado = parseFloat(passaString);
    if (isNaN(valorFormatado)) {
        return '';
    }


    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valorFormatado);
}

export function parseBRL(valor) {
  if (!valor) return 0;
  // Remove R$, pontos de milhar e troca vírgula por ponto
  return parseFloat(valor.toString().replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
}
