import re
import os

file_path = 'src/features/monitoring-detection/MonitoringDetectionClient.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (r"font-\['Montserrat'\]", "font-montserrat"),
    (r"bg-\[#eff4eb\]", "bg-greenLight"),
    (r"text-\[#2B4D1A\]", "text-greenDark"),
    (r"border-\[#dbe6d4\]", "border-greenLightHover"),
    (r"bg-\[#fff9e6\]", "bg-yellowLight"),
    (r"text-\[#856404\]", "text-yellowDark"),
    (r"border-\[#ffeeba\]", "border-yellowLightHover"),
    (r"bg-\[#47802B\]", "bg-greenNormal"),
    (r"border-black/10", "border-lineSoft"),
    (r"text-\[#243620\]", "text-inkDark"),
    (r"bg-\[#2B4D1A\]", "bg-greenDark"),
    (r"hover:bg-\[#203a13\]", "hover:bg-greenDarker"),
    (r"bg-\[#E9F2FF\]", "bg-surface"),
    (r"text-\[#222222\]", "text-ink"),
    (r"bg-\[#f8faf7\]", "bg-canvas"),
    (r"bg-\[#FBF4D7\]", "bg-yellowLight"),
    (r"bg-\[#E3ECDF\]", "bg-greenLight"),
    (r"border-\[#2B4D1A\]/50", "border-greenDark/50"),
    (r"bg-\[#F6FAF3\]", "bg-surface"),
    (r"bg-\[#356020\]", "bg-moss"),
    (r"border-\[#D1D9CA\]", "border-line"),
    (r"bg-\[#C7DABA\]", "bg-mossPale"),
    (r"bg-\[#396622\]", "bg-greenNormal"),
    (r"bg-\[#fbfcfa\]", "bg-canvas"),
    (r"text-black/50", "text-muted"),
    (r"text-black/35", "text-muted/70"),
    (r"(?<!-)text-black(?!\w)", "text-ink")
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Replacements completed.')
