const fs = require('fs');

const filePath = 'src/features/monitoring-detection/MonitoringDetectionClient.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  [/font-\['Montserrat'\]/g, 'font-montserrat'],
  [/bg-\[#eff4eb\]/g, 'bg-greenLight'],
  [/text-\[#2B4D1A\]/g, 'text-greenDark'],
  [/border-\[#dbe6d4\]/g, 'border-greenLightHover'],
  [/bg-\[#fff9e6\]/g, 'bg-yellowLight'],
  [/text-\[#856404\]/g, 'text-yellowDark'],
  [/border-\[#ffeeba\]/g, 'border-yellowLightHover'],
  [/bg-\[#47802B\]/g, 'bg-greenNormal'],
  [/border-black\/10/g, 'border-lineSoft'],
  [/text-\[#243620\]/g, 'text-inkDark'],
  [/bg-\[#2B4D1A\]/g, 'bg-greenDark'],
  [/hover:bg-\[#203a13\]/g, 'hover:bg-greenDarker'],
  [/bg-\[#E9F2FF\]/g, 'bg-surface'],
  [/text-\[#222222\]/g, 'text-ink'],
  [/bg-\[#f8faf7\]/g, 'bg-canvas'],
  [/bg-\[#FBF4D7\]/g, 'bg-yellowLight'],
  [/bg-\[#E3ECDF\]/g, 'bg-greenLight'],
  [/border-\[#2B4D1A\]\/50/g, 'border-greenDark/50'],
  [/bg-\[#F6FAF3\]/g, 'bg-surface'],
  [/bg-\[#356020\]/g, 'bg-moss'],
  [/border-\[#D1D9CA\]/g, 'border-line'],
  [/bg-\[#C7DABA\]/g, 'bg-mossPale'],
  [/bg-\[#396622\]/g, 'bg-greenNormal'],
  [/bg-\[#fbfcfa\]/g, 'bg-canvas'],
  [/text-black\/50/g, 'text-muted'],
  [/text-black\/35/g, 'text-muted\/70'],
  [/(?<!\w)text-black(?!\w)/g, 'text-ink']
];

for (const [regex, replacement] of replacements) {
  content = content.replace(regex, replacement);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replacement completed.');
