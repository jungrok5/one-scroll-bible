"""Synthesised sound for the three pilot scenes (numpy only, no samples).
   python3 motion/pilot/sound.py  →  patriarch.wav, cross.wav, rise.wav next to this file.
   Cue times match the scene timelines in the .html files."""
import numpy as np, wave, os

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(7)


def T(d): return np.arange(int(d * SR)) / SR
def buf(d): return np.zeros((int(d * SR), 2))
def nhz(n): return 440.0 * 2 ** ((n - 69) / 12)            # MIDI note → Hz


def shaped_noise(d, lo, hi, tilt=0.0):
    """Noise with a band-limited spectrum (FFT shaping) — wind, murmur, rain, scrapes."""
    n = int(d * SR); X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    band = 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4)
    X *= band * (np.maximum(f, 20) / 1000.0) ** tilt
    y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)


def env(n, a, r, hold=None):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4))
    if hold is not None: e *= np.where(t > hold, np.exp(-(t - hold) / r), 1.0)
    else: e *= np.exp(-np.maximum(t - a, 0) / r)
    return e


def place(out, sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR); sig = np.asarray(sig)
    if sig.ndim == 1: sig = np.stack([sig * np.sqrt(.5 - pan / 2), sig * np.sqrt(.5 + pan / 2)], 1)
    j = min(len(out), i + len(sig)); out[i:j] += sig[: j - i] * gain


def pluck(f, d=2.4, bright=1.0):          # oud-ish: harmonics that die faster as they rise
    t = T(d); y = sum((0.6 ** k) * np.sin(2 * np.pi * f * (k + 1) * t + k) * np.exp(-t * (2.2 + k * 1.6 / bright)) for k in range(8))
    return y * np.minimum(1, t / .004)


def bell(f, d=4.0):                         # celesta / glock: inharmonic partials
    t = T(d); y = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * dk) for m, a, dk in [(1, 1, 1.2), (2.76, .45, 2.4), (5.4, .25, 4), (8.93, .12, 7)])
    return y * np.minimum(1, t / .002)


def pad(fs, d, a=2.0, r=2.5, bright=.5):   # soft strings: detuned harmonic stacks, slow swell
    t = T(d); y = np.zeros_like(t)
    for f in fs:
        for det in (-0.12, 0.0, 0.11):
            ff = f * 2 ** (det / 12); y += sum((bright ** k) / (k + 1) * np.sin(2 * np.pi * ff * (k + 1) * t + rng.random() * 6) for k in range(6))
    e = np.minimum(1, t / a) * np.minimum(1, (d - t) / r).clip(0); return y * e / (len(fs) * 3)


def piano(f, d=4.0):
    t = T(d); y = sum((0.55 ** k) * np.sin(2 * np.pi * f * (k + 1) * (1 + .0004 * k * k) * t) * np.exp(-t * (1.1 + .9 * k)) for k in range(7))
    return y * np.minimum(1, t / .003)


def thump(f0=55, d=.6, drop=.5):            # low body hit; pitch falls
    t = T(d); ph = 2 * np.pi * np.cumsum(f0 * (1 + drop * np.exp(-t * 30))) / SR
    return np.sin(ph) * np.exp(-t * 7) * np.minimum(1, t / .002)


def reverb(x, secs=2.6, mix=.3, damp=2.2):
    n = int(secs * SR); t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-t * damp)[:, None]
    ir[:, 0] = np.convolve(ir[:, 0], np.ones(8) / 8, 'same'); ir[:, 1] = np.convolve(ir[:, 1], np.ones(8) / 8, 'same')
    L = len(x) + n; N = 1 << (L - 1).bit_length(); out = np.zeros((len(x), 2))
    for c in range(2):
        y = np.fft.irfft(np.fft.rfft(x[:, c], N) * np.fft.rfft(ir[:, c], N), N)[: len(x)]
        out[:, c] = y / (np.abs(ir[:, c]).sum() ** .5 * 6)
    return x * (1 - mix) + out * mix


def write(name, x):
    x = np.tanh(x / (np.abs(x).max() + 1e-9) * 1.4) * .89
    with wave.open(os.path.join(HERE, name), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes())
    print('→', name, f'{len(x) / SR:.1f}s')


# ---------------- 03 족장: dusk wind, an oud melody, then the stars ring ----------------
def patriarch():
    D = 26; out = buf(D)
    wind = shaped_noise(D, 120, 700, -.5) * (.55 + .45 * np.sin(T(D) * .35 + 1)) * .16
    place(out, np.stack([wind, np.roll(wind, 900)], 1), 0)
    place(out, pad([nhz(38), nhz(45)], D, a=4, r=3, bright=.35), 0, .5)                  # D drone
    mel = [(1.2, 62), (2.4, 65), (3.2, 67), (4.6, 69), (6.4, 67), (7.4, 65), (8.2, 64), (9.8, 62), (11.6, 57)]
    for t0, n in mel: place(out, pluck(nhz(n)), t0, .5, -.2)
    cr = buf(D - 11); c = np.sin(2 * np.pi * 4600 * T(D - 11)) * ((np.sin(2 * np.pi * 28 * T(D - 11)) > .2) * (np.sin(2 * np.pi * .9 * T(D - 11)) > .4))
    place(out, c * .025 * np.minimum(1, T(D - 11) / 3), 11, 1, .6)                         # crickets
    scale = [74, 76, 78, 81, 83, 86, 88, 90, 93, 95]                                        # D major pentatonic, rising
    times = 14.5 + 7.5 * (np.arange(46) / 46) ** .6
    for i, t0 in enumerate(times): place(out, bell(nhz(scale[min(9, i // 5 + (i % 3))])), t0, .1 + .08 * (i / 46), (rng.random() - .5) * 1.4)
    place(out, pad([nhz(50), nhz(57), nhz(62), nhz(66), nhz(69), nhz(76)], 6.2, a=1.6, r=2.5, bright=.55), 19.8, 1.1)   # the promise chord
    place(out, thump(36.7, 3, .1) * .5, 21.6, .7)
    return reverb(out, 3.2, .32)


# ---------------- 11 십자가: crowd and wind, darkness, three blows, a drone, one drop, a heartbeat ----------------
def cross():
    D = 39; out = buf(D); t = T(D)
    wind = shaped_noise(D, 80, 900, -.6) * (.6 + .4 * np.sin(t * .27)) * .2
    place(out, np.stack([wind, np.roll(wind, 1200)], 1), 0)
    mur = shaped_noise(9.5, 250, 1400) * (.6 + .4 * np.sin(T(9.5) * 3.1) * np.sin(T(9.5) * 1.7)) * np.clip(1 - (T(9.5) - 4) / 5, 0, 1) * .22
    place(out, mur, 0, 1, -.1)
    drone = pad([nhz(26), nhz(33)], 9, a=4, r=.05, bright=.6) * np.clip((T(9) - 3.6) / 5, 0, 1); place(out, drone, 0, 1.2)
    for t0 in (9.0, 10.3, 11.6):                                                             # the blows; each cut to black is a hard silence after
        hit = thump(70, 1.2, .8) * 1.0 + shaped_noise(1.2, 900, 6000) * env(int(1.2 * SR), .001, .05) * .6
        clank = sum(np.sin(2 * np.pi * f * T(1.2)) * np.exp(-T(1.2) * 9) for f in (1630, 2410, 3770)) * .18
        place(out, hit + clank, t0, 1.0)
    out[int(12.4 * SR):int(13 * SR)] *= np.linspace(1, 0, int(.6 * SR))[:, None]
    cel = pad([nhz(38), nhz(45), nhz(50)], 11.6, a=3, r=1.6, bright=.55)                     # low strings under Isaiah 53
    place(out, cel, 13.0, 1.4)
    rain = shaped_noise(14.4, 2000, 9000, -.2) * .05; place(out, np.stack([rain, np.roll(rain, 700)], 1), 13.0)
    out[int(24.4 * SR):int(25.9 * SR)] *= np.linspace(1, .12, int(1.5 * SR))[:, None]       # silence before the drop lands
    drip = np.sin(2 * np.pi * 1180 * T(.5) * (1 - .25 * T(.5))) * np.exp(-T(.5) * 14); place(out, drip * .5, 25.9, 1)
    for t0, n in [(28.2, 62), (29.4, 65), (30.6, 69), (31.8, 67)]: place(out, piano(nhz(n), 4), t0, .45, .1)
    for t0 in (29.0, 32.2):                                                                   # heartbeat
        place(out, thump(48, .4, .3), t0, .9); place(out, thump(44, .4, .3), t0 + .28, .6)
    i0 = int(33.6 * SR); out[i0:] *= np.exp(-np.arange(len(out) - i0) / SR * 6)[:, None]
    place(out, bell(nhz(38), 5) * .6 + thump(36.7, 5, .05) * .4, 35.1, .8)                  # “다 이루었다”
    return reverb(out, 3.6, .3, 1.8)


# ---------------- 12 부활: dawn hush, the stone, light, knife scrapes, birds, the theme in major ----------------
def rise():
    D = 27; out = buf(D)
    room = shaped_noise(D, 60, 500, -.8) * .05; place(out, np.stack([room, np.roll(room, 500)], 1), 0)
    g = shaped_noise(2.8, 40, 400) * (.6 + .4 * np.abs(np.sin(T(2.8) * 9))) * np.sin(np.pi * T(2.8) / 2.8) * .9      # the stone grinds
    place(out, g, 5.3, 1, .25); place(out, thump(42, 1.6, .2), 7.95, .9)
    swell = pad([nhz(48), nhz(55), nhz(60), nhz(64), nhz(67), nhz(72)], 19, a=.9, r=4, bright=.6)
    place(out, swell, 7.6, 1.6)
    place(out, bell(nhz(84), 5) + bell(nhz(79), 5) * .7, 7.7, .35)
    for i in range(90):                                                                       # palette-knife scrapes as colour is re-laid
        t0 = 8.1 + 6.5 * (i / 90) ** 1.2 + rng.random() * .1; s = shaped_noise(.18, 1800, 7000) * env(int(.18 * SR), .01, .05) * .07
        place(out, s, t0, 1, (rng.random() - .5) * 1.6)
    harp = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84]
    for i, n in enumerate(harp): place(out, pluck(nhz(n), 3, 1.6) * .35, 9.0 + i * .32, 1, (i / 10 - .5))
    for t0 in (10.4, 12.2, 13.1, 15.6, 18.0, 21.4):                                             # birds
        tt = T(.35); place(out, np.sin(2 * np.pi * np.cumsum(3200 + 900 * np.sin(tt * 40)) / SR) * env(len(tt), .01, .08) * .06, t0, 1, .5)
    place(out, pad([nhz(53), nhz(57), nhz(60), nhz(65)], 8, a=2, r=3, bright=.5), 16.5, 1.1)
    place(out, pad([nhz(48), nhz(55), nhz(64), nhz(67), nhz(72)], 7, a=2, r=4, bright=.5), 20.5, 1.2)
    for t0, n in [(16.2, 72), (17.0, 76), (17.8, 79), (19.4, 77), (20.6, 76), (21.8, 72)]: place(out, piano(nhz(n)), t0, .35, -.15)
    out[int((D - 1.2) * SR):] *= np.linspace(1, 0, len(out) - int((D - 1.2) * SR))[:, None]
    return reverb(out, 3.0, .3)


if __name__ == '__main__':
    write('patriarch.wav', patriarch()); write('cross.wav', cross()); write('rise.wav', rise())
