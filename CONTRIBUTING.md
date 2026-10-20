# Como contribuir com o Ganaka

Obrigado pelo interesse. Algumas regras mantêm o motor confiável.

## O princípio

Todo número que o motor dá precisa ter procedência: uma regra escrita em `docs/spec/` e, no modo
`pl9`, a conferência contra as impressões do PL9 na bancada (`packages/oracle`). Uma mudança que
altere um número traz a regra e o teste que a prova.

## O modo `corrected`

O modo `corrected` só difere do `pl9` por correções descritas em `docs/spec/correcoes.md`, cada uma
com o defeito, a prova e a decisão. Para propor uma correção, abra uma issue com o defeito e a prova
antes do código.

## Antes de enviar

```bash
pnpm typecheck
pnpm test
```

- Testes primeiro: o teste que falha antes da mudança e passa depois.
- Código e comentários em inglês; documentação em português.
- Nada de material proprietário de terceiros (código, dados ou textos de programas fechados).

## Licença

Contribuições entram sob a AGPL-3.0-or-later, a licença do projeto.
