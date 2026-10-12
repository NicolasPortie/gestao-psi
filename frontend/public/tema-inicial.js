// Aplica o tema antes da primeira pintura para evitar o "flash" claro em quem prefere escuro.
// Fica em arquivo próprio (e não inline no HTML) para que a política de segurança de conteúdo
// possa proibir scripts embutidos. Mantenha a chave igual à de src/app/core/tema/tema.ts.
(function () {
  try {
    var salvo = localStorage.getItem('gestaopsi:tema');
    var escuro = salvo === 'escuro' || (salvo !== 'claro' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.tema = escuro ? 'escuro' : 'claro';
  } catch (erro) {
    document.documentElement.dataset.tema = 'claro';
  }
})();
