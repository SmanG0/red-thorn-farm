// tweaks-app.jsx — Redthorn site tweaks
// Exposes palette / density / hero tweaks via the TweaksPanel starter.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "parchment",
  "density": "regular",
  "showMarquee": true,
  "navCta": "Order →",
  "heroTilt": true
}/*EDITMODE-END*/;

const PALETTE_OPTIONS = [
  { id: 'parchment', label: 'Parchment',  swatch: ['#ede5cf', '#6b1d14', '#43543a'] },
  { id: 'forest',    label: 'Forest',     swatch: ['#1c2419', '#d4513a', '#9bb088'] },
  { id: 'oxblood',   label: 'Oxblood',    swatch: ['#e8e0c8', '#5a1a14', '#2d3a26'] },
  { id: 'bright',    label: 'Bright',     swatch: ['#faf8f1', '#a83a2a', '#5b7745'] },
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // apply tweaks to <body> data attrs / DOM
  React.useEffect(() => {
    document.body.dataset.palette = t.palette;
    document.body.dataset.density = t.density;
  }, [t.palette, t.density]);

  React.useEffect(() => {
    const m = document.querySelector('.marquee');
    if (m) m.style.display = t.showMarquee ? '' : 'none';
  }, [t.showMarquee]);

  React.useEffect(() => {
    const cta = document.querySelector('.nav-cta');
    if (cta) cta.textContent = t.navCta;
  }, [t.navCta]);

  React.useEffect(() => {
    const photo = document.querySelector('.hero-photo');
    const craft = document.querySelector('.craft-photo');
    if (photo) photo.style.transform = t.heroTilt ? '' : 'rotate(0deg)';
    if (craft) craft.style.transform = t.heroTilt ? '' : 'rotate(0deg)';
  }, [t.heroTilt]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Theme" />
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:6}}>
        {PALETTE_OPTIONS.map(opt => {
          const active = t.palette === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTweak('palette', opt.id)}
              style={{
                appearance:'none',
                background: active ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.4)',
                border: active ? '1.5px solid rgba(41,38,27,.5)' : '1px solid rgba(41,38,27,.18)',
                borderRadius:8,
                padding:'8px',
                cursor:'pointer',
                display:'flex',
                flexDirection:'column',
                alignItems:'flex-start',
                gap:6,
                textAlign:'left',
                font:'inherit',
                color:'inherit',
              }}>
              <div style={{display:'flex', gap:3, width:'100%'}}>
                {opt.swatch.map((c,i) => (
                  <div key={i} style={{flex:1, height:18, borderRadius:3, background:c, boxShadow:'inset 0 0 0 1px rgba(0,0,0,.08)'}} />
                ))}
              </div>
              <span style={{fontSize:11, fontWeight:500}}>{opt.label}</span>
            </button>
          );
        })}
      </div>

      <TweakSection label="Layout" />
      <TweakRadio
        label="Density"
        value={t.density}
        options={['compact', 'regular', 'comfy']}
        onChange={(v) => setTweak('density', v)}
      />
      <TweakToggle
        label="Photo tilt"
        value={t.heroTilt}
        onChange={(v) => setTweak('heroTilt', v)}
      />
      <TweakToggle
        label="Show marquee strip"
        value={t.showMarquee}
        onChange={(v) => setTweak('showMarquee', v)}
      />

      <TweakSection label="Copy" />
      <TweakText
        label="Nav CTA"
        value={t.navCta}
        onChange={(v) => setTweak('navCta', v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<App />);
