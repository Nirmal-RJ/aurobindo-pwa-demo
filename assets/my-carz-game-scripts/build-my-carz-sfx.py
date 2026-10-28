"""Generate original My Carz PCM effects using only Python's standard library."""
import math, random, struct, wave
from pathlib import Path
RATE = 44100
DEST = Path(__file__).resolve().parent.parent / 'my-carz-game-assets' / 'audio'
def save(name, duration, sound):
    rng = random.Random(20261028)
    data = [sound(i / RATE, rng) for i in range(round(duration * RATE))]
    peak = max(abs(x) for pair in data for x in pair) or 1
    pcm = b''.join(struct.pack('<hh', *(round(v / peak * 27000) for v in pair)) for pair in data)
    with wave.open(str(DEST / name), 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(RATE); f.writeframes(pcm)
def go(t, rng):
    envelope = min(1, t / .012) * max(0, 1 - t / .72) ** 1.5
    rev = math.sin(2 * math.pi * (180 * t + 260 * t * t)) * .24
    chord = sum(math.sin(2 * math.pi * f * t) for f in (523.25, 659.25, 783.99)) / 3
    punch = math.sin(2 * math.pi * (85 * t - 20 * t * t)) * math.exp(-t * 15)
    v = envelope * (.55 * chord + rev + .25 * punch)
    return v, v
noise_state = 0
def whoosh(t, rng):
    global noise_state
    noise_state += .12 * (rng.uniform(-1, 1) - noise_state)
    envelope = math.sin(math.pi * t / .38) ** 1.6
    v = (noise_state * 2 + .09 * math.sin(2 * math.pi * (700 * t + 1800 * t * t))) * envelope
    pan = t / .38
    return v * math.sqrt(pan), v * math.sqrt(1 - pan)
boom_state = 0
def explosion(t, rng):
    global boom_state
    noise = rng.uniform(-1, 1)
    boom_state += .045 * (noise - boom_state)
    envelope = min(1, t / .005) * max(0, 1 - t / 1.6) ** 1.5
    sub = math.sin(2 * math.pi * (64 * t - 13 * t * t)) * math.exp(-t * 3.4)
    crack = noise * math.exp(-t * 23) * .45
    rumble = boom_state * 3.2 * math.exp(-t * 1.1)
    v = envelope * (.65 * sub + crack + rumble)
    return v, v * .97
def diamond_lost(t, rng):
    # Soft descending minor notes with a short, click-free release.
    note = min(2, int(t / .12))
    local = t - note * .12
    frequency = (622.25, 466.16, 311.13)[note]
    envelope = min(1, local / .008) * math.exp(-local * 24) * max(0, 1 - t / .36)
    v = envelope * (math.sin(2 * math.pi * frequency * t) + .18 * math.sin(4 * math.pi * frequency * t))
    return v, v
if __name__ == '__main__':
    import sys
    if '--diamond-loss-only' not in sys.argv:
        save('my-carz-go.wav', .72, go)
        save('my-carz-question-whoosh.wav', .38, whoosh)
        save('my-carz-explosion.wav', 1.6, explosion)
    save('my-carz-diamond-lost.wav', .36, diamond_lost)
    print('Generated requested original sound effects')
