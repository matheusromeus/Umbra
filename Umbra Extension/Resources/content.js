browser.runtime.sendMessage({ greeting: "hello" }).then((response) => {
    console.log("Received response: ", response);
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received request: ", request);
});

const STYLE_ID = 'umbra-style';
const CSS = `
  html { filter: invert(1) hue-rotate(180deg) !important; background: #fff !important; }
  img, video, picture, canvas, iframe, svg image, [style*="background-image"] {
    filter: invert(1) hue-rotate(180deg) !important;
  }`;

const isTop = window === window.top;
const host = isTop
  ? location.hostname
  : new URL(location.ancestorOrigins?.[location.ancestorOrigins.length - 1] ?? location.href).hostname;

function apply(on) {
  let el = document.getElementById(STYLE_ID);
  if (on && !el) {
    el = Object.assign(document.createElement('style'), { id: STYLE_ID, textContent: CSS });
    document.documentElement.appendChild(el);
  } else if (!on && el) el.remove();
}

async function sync() {
  const { enabled = true, disabledSites = [] } =
    await browser.storage.local.get(['enabled', 'disabledSites']);
  apply(enabled && !disabledSites.includes(host));
}

apply(true);   // go dark immediately, no white flash
sync();        // then correct it from saved settings
browser.storage.onChanged.addListener(sync);

browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'getHost' && isTop) return Promise.resolve({ host });
});
