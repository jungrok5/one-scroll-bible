"""Download ElevenLabs results: paste lines of signed content URLs on stdin; the session id in each URL path
   is mapped to a file name via sessions-*.txt (one 'session_id name' per line)."""
import sys, re, glob, os, subprocess
D = os.path.dirname(os.path.abspath(__file__)); m = {}
for f in glob.glob(os.path.join(D, 'sessions-*.txt')):
    for l in open(f):
        if l.strip(): s, n = l.split(); m[s] = n
for u in re.findall(r'https://storage\.googleapis\.com/\S+?content\.mp3\?[^\s"\']+', sys.stdin.read()):
    sid = re.search(r'content_generation/([^/]+)/', u).group(1)
    if sid in m and not os.path.exists(os.path.join(D, m[sid] + '.mp3')):
        subprocess.run(['curl', '-sS', '-o', os.path.join(D, m[sid] + '.mp3'), u], check=True); print('✓', m[sid])
