from pathlib import Path
import base64
import io
import tarfile

parts = sorted(Path("scripts/rules-v2-payload-v2").glob("chunk-*.txt"))
assert len(parts) == 11, f"expected 11 Rules v2 payload chunks, got {len(parts)}"
payload = "".join(p.read_text().strip() for p in parts)
data = base64.b64decode(payload, validate=True)

with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
    members = {
        member.name: archive.extractfile(member).read()
        for member in archive.getmembers()
        if member.isfile()
    }

required = {
    "medium-rules-v2.js",
    "rules-v2-semantics.test.js",
    "rules-v2-medium-20.js",
}
assert required.issubset(members), f"missing payload members: {required - set(members)}"

Path("engine/medium-7x7.js").write_bytes(members["medium-rules-v2.js"])
Path("tests/rules-v2-semantics.test.js").write_bytes(members["rules-v2-semantics.test.js"])
Path("tests/rules-v2-medium-20.js").write_bytes(members["rules-v2-medium-20.js"])

# Apply the approved final compliance policy on top of the immutable Rules-v2 semantic payload.
patch = Path("scripts/apply-rules-v2-final-compliance.py").read_text()
exec(compile(patch, "scripts/apply-rules-v2-final-compliance.py", "exec"), {"__name__": "__main__"})
print("installed Rules v2 engine/tests with final compliance policy")
