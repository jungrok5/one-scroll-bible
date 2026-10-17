"""Mix the ElevenLabs music + sound effects (motion/pilot/audio/*.mp3) onto each pilot's timeline.
   python3 motion/pilot/mix.py  →  patriarch.wav, cross.wav, rise.wav (replacing the synthesised ones from sound.py)
   Cue times match the scene timelines in the .html files."""
import numpy as np, subprocess, wave, os

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, 'audio')


def load(name):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', os.path.join(A, name + '.mp3'), '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<f4').reshape(-1, 2).astype(np.float64)


def cue(out, name, at, db=0.0, length=None, fin=0.0, fout=0.0, loop=False):
    x = load(name)
    if length is not None:
        n = int(length * SR)
        if loop and len(x) < n: x = np.tile(x, (n // len(x) + 1, 1))
        x = x[:n]
    x = x * 10 ** (db / 20)
    n = len(x)
    if fin: k = min(n, int(fin * SR)); x[:k] *= np.linspace(0, 1, k)[:, None]
    if fout: k = min(n, int(fout * SR)); x[n - k:] *= np.linspace(1, 0, k)[:, None]
    i = int(at * SR); j = min(len(out), i + n); out[i:j] += x[: j - i]


def duck(out, a, b, db, ramp=.3):            # pull everything down between a and b (silences before a beat)
    g = np.ones(len(out)); ia, ib, r = int(a * SR), int(b * SR), int(ramp * SR); lo = 10 ** (db / 20)
    g[ia:ia + r] = np.linspace(1, lo, r); g[ia + r:ib] = lo; out *= g[:, None]


def write(name, x):
    peak = np.abs(x).max(); x = x / peak * .89 if peak > .89 else x
    with wave.open(os.path.join(HERE, name), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())
    print('→', name)


def patriarch():
    out = np.zeros((26 * SR, 2))
    cue(out, 'wind', 0, -13, 26, fin=1.5, fout=2, loop=True)
    cue(out, 'crickets', 11, -21, 15, fin=3, fout=2, loop=True)
    cue(out, 'm_patriarch', 0, -2, 26, fin=.5, fout=1.5)
    return out


def cross():
    out = np.zeros((39 * SR, 2))
    cue(out, 'crowd', 0, -9, 9, fin=.5, fout=4)                       # the crowd fades as darkness falls
    cue(out, 'hillwind', 0, -20, 9, fin=1, loop=True)
    cue(out, 'm_tension', 0, -4, 9, fin=1.5)
    cue(out, 'thunder', 4.0, -5, 5)
    duck(out, 8.92, 9.0, -60, ramp=.08)                              # hard cut into the blows
    for t in (9.0, 10.3, 11.6): cue(out, 'hammer', t, 0, 1.4)
    cue(out, 'hillwind', 13.0, -12, 14.4, fin=.4, loop=True)
    cue(out, 'm_lament', 13.0, -3, 14.4, fin=.3)
    duck_seg = np.ones(len(out)); a, b = int(24.2 * SR), int(25.8 * SR)   # near silence before the drop lands
    duck_seg[a:b] = np.linspace(1, .06, b - a); duck_seg[b:int(27.4 * SR)] = .06; out *= duck_seg[:, None]
    cue(out, 'drip', 25.85, -2, 1)
    cue(out, 'm_piano', 27.4, -4, 7, fin=.3, fout=.6)
    for t in (29.0, 32.2): cue(out, 'heartbeat', t, -3, 1.5)
    cue(out, 'bell', 35.0, -6, 4, fout=1)
    return out


def rise():
    out = np.zeros((27 * SR, 2))
    cue(out, 'wind', 0, -26, 8, fin=1.5, fout=1, loop=True)
    cue(out, 'stone', 5.3, -1, 3)
    cue(out, 'shimmer', 7.25, -3, 3)
    cue(out, 'm_rise', 7.5, -2, 19.5, fout=1.2)
    for t, db in ((8.2, -10), (10.6, -13), (12.8, -16)): cue(out, 'knife', t, db, 4, fout=.5)
    cue(out, 'birds', 10.0, -15, 16, fin=2, fout=2, loop=True)
    return out


if __name__ == '__main__':
    write('patriarch.wav', patriarch()); write('cross.wav', cross()); write('rise.wav', rise())
