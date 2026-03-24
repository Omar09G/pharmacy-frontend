export const successTemplate = (title: string, message: string) => `
  <div style="display:flex;align-items:center;gap:12px">
    <div style="width:56px;height:56px;background:linear-gradient(135deg,#f472b6,#7c3aed);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <div style="text-align:left">
      <div style="font-weight:700;font-size:16px;color:#111;margin-bottom:4px">${title}</div>
      <div style="font-size:13px;color:#444;line-height:1.2">${message}</div>
    </div>
  </div>
`;

export const errorTemplate = (message: string) => `
  <div style="display:flex;align-items:center;gap:12px;min-width:220px">
    <div style="width:56px;height:56px;background:linear-gradient(135deg,#fb7185,#ef4444);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 9v4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 17h.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12c-2.5 5-6.5 7-9 7s-6.5-2-9-7c2.5-5 6.5-7 9-7s6.5 2 9 7z" stroke="rgba(255,255,255,0.15)" strokeWidth="0"/>
      </svg>
    </div>
    <div style="text-align:left">
      <div style="font-weight:700;font-size:15px;color:#111;margin-bottom:4px">Error</div>
      <div style="font-size:13px;color:#444;line-height:1.2">${message}</div>
    </div>
  </div>
`;

export const infoTemplate = (title: string, message: string) => `
  <div style="display:flex;align-items:center;gap:12px;min-width:220px">
    <div style="width:56px;height:56px;background:linear-gradient(135deg,#60a5fa,#3b82f6);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="white" strokeWidth="0" />
        <path d="M12 8v4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 15h.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <div style="text-align:left">
      <div style="font-weight:700;font-size:15px;color:#111;margin-bottom:4px">${title}</div>
      <div style="font-size:13px;color:#444;line-height:1.2">${message}</div>
    </div>
  </div>
`;

export default { successTemplate, errorTemplate, infoTemplate };
