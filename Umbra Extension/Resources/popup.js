const $ = (id) => document.getElementById(id);
const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

let host = null;
try { ({ host } = await browser.tabs.sendMessage(tab.id, { type: 'getHost' })); } catch {}

const { enabled = true, disabledSites = [] } =
  await browser.storage.local.get(['enabled', 'disabledSites']);

$('global').checked = enabled;
if (host) { $('host').textContent = host; $('site').checked = !disabledSites.includes(host); }
else $('site').disabled = true;   // e.g. Safari's own pages

$('global').onchange = (e) => browser.storage.local.set({ enabled: e.target.checked });
$('site').onchange = async (e) => {
  const { disabledSites = [] } = await browser.storage.local.get('disabledSites');
  const s = new Set(disabledSites);
  e.target.checked ? s.delete(host) : s.add(host);
  browser.storage.local.set({ disabledSites: [...s] });
};
