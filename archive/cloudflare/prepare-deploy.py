from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
output = root / "dist"
if output.exists():
    shutil.rmtree(output)
output.mkdir()
public_files = [
    "index.html", "styles.css", "launch.css", "script.js", "inquiry.js",
    "omnia-story.js", "native-intelligence.js", "assets", "admin", "_headers", "_routes.json",
]
for name in public_files:
    source = root / name
    if source.is_dir():
        shutil.copytree(source, output / name)
    else:
        shutil.copy2(source, output / name)
print("Prepared public website in dist/. Functions remain in functions/ for Cloudflare Pages.")
