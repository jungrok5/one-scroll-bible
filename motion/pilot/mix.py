"""Mix each scene's ElevenLabs music + sound effects onto its timeline, from <scene>.sound.json.
   python3 motion/pilot/mix.py patriarch cross …   (no args = every *.sound.json)  →  <scene>.wav next to the scene
   Audio files: pilot/audio/<scene>__<id>.mp3, or pilot/audio/<src>.mp3 when a cue names a shared "src".
   Ducks pull down everything placed before them (for silences before a beat)."""
import numpy as np, subprocess, wave, os, json, sys, glob

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, 'audio')


def load(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<f4').reshape(-1, 2).astype(np.float64)


def find(scene, c):
    for p in (os.path.join(A, f"{scene}__{c.get('src', c['id'])}.mp3"), os.path.join(A, f"{c.get('src', c['id'])}.mp3")):
        if os.path.exists(p): return p
    raise FileNotFoundError(f"{scene}: no audio for cue {c['id']} (src {c.get('src', c['id'])})")


def place(out, x, c):
    if c.get('len') is not None:
        n = int(c['len'] * SR)
        if c.get('loop') and len(x) < n: x = np.tile(x, (n // len(x) + 1, 1))
        x = x[:n]
    x = x * 10 ** (c.get('db', 0) / 20); n = len(x)
    if c.get('fin'): k = min(n, int(c['fin'] * SR)); x[:k] *= np.linspace(0, 1, k)[:, None]
    if c.get('fout'): k = min(n, int(c['fout'] * SR)); x[n - k:] *= np.linspace(1, 0, k)[:, None]
    i = int(c['at'] * SR); j = min(len(out), i + n)
    if j > i: out[i:j] += x[: j - i]


def mix(scene):
    spec = json.load(open(os.path.join(HERE, scene + '.sound.json')))
    out = np.zeros((int(spec['duration'] * SR), 2))
    cues = sorted([*spec.get('music', []), *spec.get('sfx', [])], key=lambda c: c['at'])
    ducks = sorted(spec.get('ducks', []), key=lambda d: d['from'])
    for d in ducks + [None]:                      # place cues up to each duck, then apply it
        while cues and (d is None or cues[0]['at'] < d['from']):
            c = cues.pop(0); place(out, load(find(scene, c)), c)
        if d is None: break
        g = np.ones(len(out)); a, b = int(d['from'] * SR), min(len(out), int(d['to'] * SR)); r = max(1, int(d.get('ramp', .3) * SR)); lo = 10 ** (d['db'] / 20)
        g[a:a + r] = np.linspace(1, lo, len(g[a:a + r])); g[a + r:b] = lo; out *= g[:, None]
    peak = np.abs(out).max() or 1; out = out / peak * .89 if peak > .89 else out
    with wave.open(os.path.join(HERE, scene + '.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())
    print('→', scene + '.wav')


if __name__ == '__main__':
    names = sys.argv[1:] or [os.path.basename(p)[:-11] for p in sorted(glob.glob(os.path.join(HERE, '*.sound.json')))]
    for n in names: mix(n)
