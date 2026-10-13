# Imagens do produto

O Vínculo é uma ferramenta de trabalho, então quase não tem imagem. A regra é simples:

- **Não há ilustração, padrão nem arte decorativa.** A única arte do produto é a marca (`frontend/public/favicon.svg`) e as marcas de estado.
- **Fotografia só na tela de acesso**, e só de **ambiente de consultório**: sala, poltronas, luz natural. Sem pessoas, para não depender de autorização de imagem nem sugerir pacientes reais.
- A foto é decorativa (`alt=""`) e fica atrás de nada: o texto nunca é escrito sobre ela.

## Foto da tela de acesso

| Item | Valor |
| --- | --- |
| Arquivos | `frontend/public/imagens/consultorio-poltronas-960.webp` (127 KiB) e `consultorio-poltronas-1440.webp` (214 KiB) |
| Cena | Consultório de psicologia com duas poltronas voltadas uma para a outra, em verde-musgo e linho claro, mesa de apoio, plantas e luz natural |
| Origem | Imagem criada para o Vínculo a partir da direção de arte abaixo; não retrata um consultório real |
| Direitos | Do autor do projeto, com uso comercial permitido |
| Criada em | 14 de outubro de 2026 |
| Alterações | Original de 1024 × 1536 px convertido para WebP com FFmpeg, qualidade 82, nas larguras 960 e 1440 px. A versão 1440 é ampliada. Sem alterações de cor |

A cena não tem pessoas, marcas, obras de arte nem dados clínicos. Ela substituiu a foto de banco usada antes.

### Direção de arte

Fotografia editorial realista de um pequeno consultório brasileiro de psicoterapia, acolhedor e profissional: exatamente duas poltronas voltadas uma para a outra em leve ângulo, uma verde-musgo e outra de linho claro; luz natural filtrada por cortina; parede clara, madeira natural, mesa pequena com água e lenços e plantas discretas. Composição vertical 2:3, com as poltronas como foco e visíveis no recorte horizontal. Sem pessoas, texto, logotipos, padrões decorativos, equipamentos médicos ou aparência de hospital ou spa.

### Como o front-end usa a foto

No desktop (a partir de 1024 px), a foto fica à esquerda do formulário, numa grade 7:5 sob o cabeçalho comum da marca e do menu de aparência. No celular, vira uma faixa entre o cabeçalho e o formulário. A composição total tem largura máxima de 1600 px. Não há slogans, marcas de estado ou texto sobre a imagem.

`frontend/src/app/components/layout/layout-autenticacao.tsx`: um `<img>` com `srcSet` (960 e 1440 px), `width` e `height` definidos para não deslocar o layout, e dois enquadramentos (`posicaoPainel`: `50% 72%` no desktop e `posicaoFaixa`: `50% 65%` na faixa do celular). No tema escuro a foto é escurecida (`brightness-[0.82]`) para não ofuscar. A política de segurança do nginx já permite imagens da própria origem (`img-src 'self'`).

A foto se revela uma vez por `clip-path` e opacidade em 300 ms, com o `--ease-out` do sistema. Em `prefers-reduced-motion: reduce`, aparece estática.

## Trocar por outra foto (por exemplo, do próprio consultório)

1. Exporte uma imagem **vertical (2:3)** de pelo menos 1440 px de largura, de ambiente vazio, luz natural e tons neutros e quentes (nada azulado nem saturado).
2. Gere as duas larguras em WebP, por exemplo: `ffmpeg -i original.jpg -vf scale=960:-2 -c:v libwebp -quality 78 consultorio-poltronas-960.webp` (repita com 1440).
3. Substitua os arquivos em `frontend/public/imagens/` mantendo os nomes (ou ajuste `FOTO.caminho`).
4. Ajuste `posicaoPainel` e `posicaoFaixa` até o assunto principal ficar à vista no painel e na faixa do celular.
5. Atualize a tabela acima com a origem e a licença, e confirme que a licença permite uso comercial.
