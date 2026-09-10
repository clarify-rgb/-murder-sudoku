from pathlib import Path

path = Path('index.html')
s = path.read_text()
old = ".cell.unavailable{box-shadow:inset 0 0 0 999px rgba(92,92,92,.46)}"
new = ".cell.unavailable{filter:grayscale(100%) brightness(.78) contrast(1.18)}"
if new in s:
    pass
else:
    assert old in s, 'expected previous unavailable-cell style not found'
    s = s.replace(old, new, 1)
    path.write_text(s)
