---
title: The Supreme Directive
description: The Guiding Development Principles behind Cartographer
---

```
          ✧･ﾟ: *✧･ﾟ:* THE SUPREME DIRECTIVE *:･ﾟ✧*:･ﾟ✧

╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║         ✦ ✧ ✨ ✧ ✦ ✧ ✨ ✧ ✦ ✧ ✨ ✧ ✦ ✧ ✨ ✧ ✦ ✧ ✨ ✧ ✦                   ║
║                                                                        ║
║    1.  ⟡  MAKE NO FUCKING ASSUMPTIONS.                                         ║
║                                                                        ║
║    2.  ⟡  READ THE FUCKING DOCS.                                       ║
║                                                                        ║
║    3.  ⟡  DON'T MAKE SHIT UP.                                          ║
║                                                                        ║
║    4.  ⟡  KEEP IT FUCKING SIMPLE.                                      ║
║                                                                        ║
║    5.  ⟡  DON'T BE FUCKING STUPID.                                     ║
║                                                                        ║
║         ✦ ✧ ✨ ✧ ✦ ✧ ✨ ✧ ✦ ✧ ✨ ✧ ✦ ✧ ✨ ✧ ✦ ✧ ✨ ✧ ✦                   ║
║                                                                        ║
║     ✧ COMPLIANCE IS NOT OPTIONAL. VIOLATIONS ARE NOTED. ✧              ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
```

---

## Why It Matters

These five principles are **anti-patterns to software entropy**—they directly counter the forces that destroy codebases:

### 1. Make No Assumptions

**The problem**: Assumption-driven code creates cascading bugs. You assume a field exists, assume it's always populated, assume a user will do X... then your plugin crashes in production.

**Why it matters here**: Cartographer users will configure wildly different schemas. If you assume field names or data structure, the plugin fails silently on real data.

**In practice**: Before writing code, verify. Read the actual library config. Test with actual vault data.

### 2. Read The Fucking Docs

**The problem**: Developers reinvent wheels, duplicate patterns, miss critical requirements, and waste time on "discoveries" already documented.

**Why it matters here**: Obsidian's plugin API has specific patterns (register listeners, cleanup on unload, type safety). The docs exist. Ignoring them = broken behavior on vault reload.

**In practice**: AGENTS.md exists. CARTOGRAPHER-MASTER-SPEC.md exists. Read them before coding. They're not busywork—they're hard-won knowledge.

### 3. Don't Make Shit Up

**The problem**: Feature creep, invented complexity, undocumented behavior. "I'll just add this quick thing..." = technical debt.

**Why it matters here**: Each session has defined deliverables. Sticking to them keeps the project on track. Invented features delay real ones.

**In practice**: If something isn't in the session spec, don't build it. If requirements change, update the spec first.

### 4. Keep It Fucking Simple

**The problem**: Over-engineered solutions are hard to understand, test, debug, and maintain. They hide bugs in complexity.

**Why it matters here**: Cartographer needs to be extensible for future plugins (LVNACY ecosystem). Complex code blocks that extensibility. Simple patterns scale.

**In practice**: If you're reaching for a complex solution, pause. Is there a simpler one? If the code needs explanation, simplify it instead.

### 5. Don't Be Fucking Stupid

**The problem**: Cargo-cult programming, following patterns without understanding, ignoring red flags.

**Why it matters here**: You're writing code that manipulates user vaults. Stupid mistakes = data loss or vault corruption. Intelligence = respect for the tool and user.

**In practice**: If your code feels wrong, it probably is. Question it. If a pattern doesn't make sense, understand why before using it.

---

## The Binding Force

**COMPLIANCE IS NOT OPTIONAL. VIOLATIONS ARE NOTED.**

This isn't advice. It's a contract.

When these principles are honored:
- **Code is predictable** (less debugging)
- **Documentation stays in sync** (less confusion)
- **Patterns are consistent** (faster iteration)
- **Bugs are isolated** (easier fixes)
- **Future developers succeed** (sustainability)

When they're violated:
- Chaos accumulates silently
- The next session starts confused
- Fixes introduce new bugs
- The plugin becomes unmaintainable

---

## For Cartographer Specifically

You are building infrastructure that future plugins will depend on. The decisions you make now cascade through Phase 4, 5, and beyond. 

The Supreme Directive isn't bureaucracy—it's respect for that responsibility.

Every line of code you write, every architectural decision, every shortcut you consider: **measure it against these five principles**.

If it violates any of them, don't do it. Find another way.

---

**Read this before every session. Refer to it when stuck. Let it guide you.**
