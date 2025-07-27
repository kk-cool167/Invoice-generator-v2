# 🦙 Ollama Setup für AI-Enhanced Data Generation

Diese Anleitung hilft Ihnen dabei, Ollama für verbesserte AI-Datengenerierung zu installieren und zu konfigurieren.

## Installation

### Windows
```bash
# Download und Installation von ollama.com
# Oder über winget:
winget install Ollama.Ollama
```

### macOS
```bash
# Download von ollama.com
# Oder über Homebrew:
brew install ollama
```

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

## Empfohlene Modelle für Business Data Generation

### Leichtgewichtige Modelle (Schnell, wenig RAM)
```bash
# Llama 3.2 1B - Sehr schnell, gute Qualität
ollama pull llama3.2:1b

# Qwen2 0.5B - Extrem schnell
ollama pull qwen2:0.5b

# Phi3 Mini - Microsoft's effizienter 3.8B Model
ollama pull phi3:mini
```

### Mittlere Modelle (Ausgewogen)
```bash
# Llama 3.2 3B - Gute Balance zwischen Speed und Qualität
ollama pull llama3.2:3b

# Gemma2 2B - Google's effizienter Model
ollama pull gemma2:2b
```

### Hochqualität Modelle (Langsamer, bessere Ausgaben)
```bash
# Llama 3.2 Latest - Beste Qualität für komplexe Aufgaben
ollama pull llama3.2:latest

# Qwen2.5 7B - Exzellent für strukturierte Ausgaben
ollama pull qwen2.5:7b
```

## Empfohlene Konfiguration

### Für Entwicklung (Schnell)
```bash
ollama pull llama3.2:1b
ollama pull phi3:mini
```

### Für Produktion (Qualität)
```bash
ollama pull llama3.2:3b
ollama pull qwen2.5:7b
```

## Ollama starten

### Als Service (Empfohlen)
```bash
# Startet automatisch auf Port 11434
ollama serve
```

### Test der Installation
```bash
# Test ob Ollama läuft
curl http://localhost:11434/api/tags

# Test einer Generation
ollama run llama3.2:1b "Hello, what's your name?"
```

## Fehlerbehebung

### Ollama startet nicht
1. **Port bereits belegt**: Überprüfen Sie ob Port 11434 frei ist
   ```bash
   netstat -an | grep 11434
   ```

2. **Modell nicht gefunden**: Installieren Sie mindestens ein Modell
   ```bash
   ollama list
   ollama pull llama3.2:1b
   ```

3. **Firewall Probleme**: Stellen Sie sicher dass Port 11434 nicht blockiert ist

### Performance Probleme
1. **RAM-Mangel**: Verwenden Sie kleinere Modelle (1B-3B Parameter)
2. **Langsame Generation**: Reduzieren Sie max_tokens in der Konfiguration
3. **CPU-Last**: Verwenden Sie quantisierte Modelle oder GPU-Acceleration wenn verfügbar

## Integration in die Anwendung

Die Anwendung versucht automatisch Ollama zu verwenden wenn es verfügbar ist:

1. **Ollama läuft** → Verwendet bestes verfügbares Modell
2. **Ollama nicht verfügbar** → Fällt zurück auf verbesserte rule-based generation

### Debug-Informationen anzeigen
1. Öffnen Sie "Create Multiple Materials"
2. Klicken Sie auf den "AI: Model" Button rechts oben
3. Sehen Sie Status und verfügbare Modelle

### Performance-Tuning
Kleinere Modelle für bessere Performance:
- **llama3.2:1b** - Ausgezeichnete Balance
- **qwen2:0.5b** - Extrem schnell
- **phi3:mini** - Microsoft optimiert

### Empfohlene Reihenfolge
1. Installieren Sie Ollama
2. Starten Sie mit `ollama pull llama3.2:1b`
3. Testen Sie in der Anwendung
4. Bei Bedarf weitere Modelle hinzufügen

## System-Anforderungen

### Minimum
- **RAM**: 4GB (für 1B Modelle)
- **Festplatte**: 2GB pro Modell
- **CPU**: Moderne x64 CPU

### Empfohlen
- **RAM**: 8GB+ (für 3B+ Modelle)
- **Festplatte**: 10GB+ für mehrere Modelle
- **GPU**: Optional, beschleunigt Inferenz erheblich

## Unterstützte Modell-Familien

- ✅ **Llama** (Meta) - Beste Allround-Performance
- ✅ **Qwen** (Alibaba) - Exzellent für strukturierte Ausgaben
- ✅ **Phi** (Microsoft) - Sehr effizient
- ✅ **Gemma** (Google) - Gute Balance
- ✅ **Mistral** - Europäische Alternative

Alle Modelle funktionieren automatisch mit der AI-Datengenerierung der Anwendung!