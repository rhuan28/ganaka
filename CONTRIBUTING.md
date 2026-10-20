# Contributing to Ganaka

Thank you for your interest. A few rules keep the engine trustworthy.

## The principle

Every number the engine gives needs a provenance: a rule written in `docs/spec/` and, in the `pl9`
mode, the check against PL9's printouts on the bench (`packages/oracle`). A change that alters a
number comes with the rule and the test that proves it.

## The `corrected` mode

The `corrected` mode differs from `pl9` only by the corrections described in
`docs/spec/corrections.md`, each with the defect, the proof and the decision. To propose a
correction, open an issue with the defect and the proof before any code.

## Before sending

```bash
pnpm typecheck
pnpm test
```

- Tests first: the test that fails before the change and passes after it.
- Code, comments and documentation in English.
- No proprietary third-party material (code, data or text from closed programs).

## License

Contributions are made under the AGPL-3.0-or-later, the project's license.
