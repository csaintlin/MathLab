"""Generate the shared header and footer for the static site."""
from html import escape
from pathlib import Path
import re

DIST = Path(__file__).resolve().parents[1] / 'dist'

# File, icon, short header name, navigation label, grade, footer hint, optional links.
LESSONS = [
    ('g6-gcd', '▦', '公因數與公倍數觀察室', '動手探索', 6, '先動手，再說說看。', 'g6-gcd-quiz'),
    ('g6-fraction', '▤', '分數分組實驗室', '動手探索', 6, '先動手，再說說看。', 'g6-fraction-quiz'),
    ('g6-ratio', '∶', '比例連動實驗室', '動手探索', 6, '先動手，再說說看。', 'g6-ratio-quiz'),
    ('g6-perimeter', '◔', '圓周滾動與弧長實驗室', '動手探索', 6, '先動手，再說說看。', 'g6-perimeter-quiz'),
    ('g6-circle-area', '◕', '圓形剪拼實驗室', '動手探索', 6, '先動手，再說說看。', 'g6-circle-area-quiz'),
    ('g6-speed', '⇢', '速率競賽實驗室', '動手探索', 6, '先動手，再說說看。', 'g6-speed-quiz'),
    ('g6-scale', '⊡', '比例縮放工作室', '動手探索', 6, '先動手，再說說看。', 'g6-scale-quiz'),
    ('g4-angle', '∠', '旋轉量角器實驗室', '動手探索', 4, '先動手，再說說看。', 'g4-angle-quiz'),
    ('g4-triangle', '△', '三角形變形實驗室', '動手探索', 4, '先動手，再說說看。', 'g4-triangle-quiz'),
    ('g4-rounding', '≈', '數線上的四捨五入', '動手探索', 4, '先動手，再說說看。', 'g4-rounding-quiz'),
    ('g4-area', '▦', '方格圍籬實驗室', '動手探索', 4, '先動手，再說說看。', 'g4-area-quiz'),
    ('g4-charts', '▥', '圖表小小分析師', '動手探索', 4, '先動手，再說說看。', 'g4-charts-quiz'),
    ('g3-millimeter', '↔', '尺子量一量', '動手探索', 3, '先動手，再說說看。', 'g3-millimeter-quiz'),
    ('g3-angle', '∠', '角的開口實驗室', '動手探索', 3, '先動手，再說說看。', 'g3-angle-quiz'),
    ('g3-area', '▦', '方格面積拼圖', '動手探索', 3, '先動手，再說說看。', 'g3-area-quiz'),
    ('g3-volume', '▱', '倒水量一量', '動手探索', 3, '先動手，再說說看。', 'g3-volume-quiz'),
    ('g3-fractions', '▤', '分數長條切一切', '動手探索', 3, '先動手，再說說看。', 'g3-fractions-quiz'),
    ('factors', '⠿', '分群找因數', '分群找因數', 5, '調整 → 分群 → 找因數', 'factors-quiz'),
    ('common-factors', '▦', '分組找公因數', '公因數', 5, '兩種點心都剛好分完，就找到一個公因數。', 'common-factors-quiz'),
    ('common-multiples', '⇢', '數線跳跳看', '公倍數', 5, '共同踩過的位置，藏著公倍數。', 'common-multiples-quiz'),
    ('circle', '◔', '圓來如此', '扇形實驗室', 5, '拖動滑桿，開始你的探索 ↗', 'quiz'),
    ('triangle', '△', '三角形探索室', '探索室', 5, '觀察 → 預測 → 操作 → 說明', 'triangle-quiz'),
    ('polygon', '⬠', '多邊形探索室', '多邊形實驗', 5, '觀察 → 預測 → 操作 → 說明', None),
    ('capacity', '▱', '容量觀察實驗', '動手探索', 2, '先猜一猜，再用測量找答案。', 'capacity-quiz'),
    ('weight', '⚖', '重量比較實驗', '動手探索', 2, '多比一比，找出重量的順序。', 'weight-quiz'),
    ('clock', '◷', '小小時鐘', '動手探索', 2, '慢慢轉、仔細看，每一次動手都是新發現。', 'clock-quiz'),
    ('multiplication', '▦', '餅乾袋乘法', '動手探索', 2, '每袋 1～10 塊 × 1～10 袋', 'multiplication-quiz'),
    ('fractions', '▤', '分數切片實驗室', '分數切片', 5, '觀察 → 操作 → 說明', 'fractions-quiz'),
    ('symmetry', '◈', '摺紙與鏡射實驗室', '摺紙與鏡射', 5, '觀察 → 操作 → 說明', 'symmetry-quiz'),
    ('arithmetic-lab', '▦', '方格分配律與平均', '分配律與平均', 5, '觀察 → 操作 → 說明', 'arithmetic-lab-quiz'),
    ('area', '▱', '面積剪拼實驗室', '面積剪拼', 5, '觀察 → 操作 → 說明', 'area-quiz'),
    ('solids', '⬡', '立體形體觀察室', '立體形體', 5, '觀察 → 操作 → 說明', 'solids-quiz'),
    ('sphere', '◉', '把球切開看', '球的切面', 5, '觀察 → 操作 → 說明', 'sphere-quiz'),
]
RELATED = {
    'factors': ('common-factors.html', '公因數'),
    'common-factors': ('common-multiples.html', '公倍數'),
    'common-multiples': ('factors.html', '因數'),
    'polygon': ('triangle.html', '三角形探索室'),
    'solids': ('sphere.html', '把球切開看'),
    'sphere': ('solids.html', '柱體與錐體'),
}
QUIZ_HINTS = {
    'quiz': '所有角度皆為整數，分母取自 360 的因數。',
    'triangle-quiz': '先思考，再操作，最後說明理由。',
}
ASSETS = '<link rel="stylesheet" href="site-shell.css">\n<script src="site-shell.js" defer></script>\n'


def update(page, icon, name, brand_url, links, hint, current, layout):
    path = DIST / f'{page}.html'
    html = path.read_text()
    html = re.sub(r'(<body\b)(?: data-site-layout="[^"]*")?', rf'\1 data-site-layout="{layout}"', html, count=1)
    nav = []
    for url, title in links:
        active = ' aria-current="page"' if url == current else ''
        nav.append(f'    <a href="{escape(url)}"{active}>{escape(title)}</a>')
    navigation = '\n'.join(nav)
    header = f'''<header class="site-header">
  <a class="site-brand" href="{escape(brand_url)}"><span class="site-logo" aria-hidden="true">{icon}</span><span class="site-brand-name">{escape(name)}</span><span class="site-brand-sub">數學探索室</span></a>
  <nav class="site-nav" aria-label="頁面導覽">
{navigation}
  </nav>
  <button class="site-fullscreen" type="button" hidden><span aria-hidden="true">⛶</span> <span class="site-fullscreen-text">全螢幕</span></button>
</header>'''
    footer = f'''<footer class="site-footer">
  <span>小小數學所 · 把抽象的數學，變成看得見的發現。</span>
  <span>{escape(hint)}</span>
</footer>'''
    html, header_count = re.subn(r'<header\b[^>]*>.*?</header>', lambda _: header, html, flags=re.S)
    html, footer_count = re.subn(r'\s*<footer\b[^>]*>.*?</footer>\s*', '', html, flags=re.S)
    assert header_count == footer_count == 1, path
    assert html.count('</main>') == 1, path
    html = html.replace('</main>', f'</main>\n{footer}\n')
    if ASSETS not in html:
        html = html.replace('</head>', ASSETS + '</head>')
    path.write_text(html)


update('index', '＋', '小小數學所', './', [('./', '數學入口'), ('#grades', '找我的年級')],
       '國小一年級 — 六年級', './', 'portal')
for slug, icon, name, nav_name, grade, hint, quiz in LESSONS:
    lesson_url = f'{slug}.html'
    links = [(f'./#grade-{grade}', '數學入口'), (lesson_url, nav_name)]
    if quiz:
        links.append((f'{quiz}.html', '隨機練習'))
    if slug in RELATED:
        links.append(RELATED[slug])
    update(slug, icon, name, lesson_url, links, hint, lesson_url, 'lesson')
    if quiz:
        quiz_hint = QUIZ_HINTS.get(quiz, '每一次練習，都是新的發現。')
        update(quiz, icon, name, lesson_url, links, quiz_hint, f'{quiz}.html', 'quiz')
