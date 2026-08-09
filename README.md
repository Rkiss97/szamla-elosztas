# Számla elosztó

Interaktív számlaelosztó app OCR-rel (Claude API).

## Telepítés Vercelre

1. Töltsd fel ezt a mappát GitHub-ra (új repo).
2. Menj a [vercel.com](https://vercel.com) oldalra, jelentkezz be GitHub-bal.
3. "Add New Project" → válaszd ki ezt a repo-t.
4. **Environment Variables** részhez add hozzá:
   - Név: `ANTHROPIC_API_KEY`
   - Érték: az Anthropic API kulcsod (sk-ant-... kezdetű)
5. Deploy.

Kész! Az URL-t (pl. `https://szamla-xy.vercel.app`) megoszthatod bárkivel.

## API kulcs beszerzése

[console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key.
