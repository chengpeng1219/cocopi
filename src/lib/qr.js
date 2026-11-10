import QRCode from 'qrcode';

function escapeWifiField(value) {
  return String(value ?? '').replace(/([\\;,":])/g, '\\$1');
}

export function buildWifiQrPayload(ssid, password, security = 'WPA') {
  const safeSecurity = security === 'nopass' ? 'nopass' : security;
  const passwordField =
    safeSecurity === 'nopass' ? '' : `P:${escapeWifiField(password)};`;
  return `WIFI:T:${safeSecurity};S:${escapeWifiField(ssid)};${passwordField};`;
}

export function createWifiQrMatrix(ssid, password, { security = 'WPA' } = {}) {
  const payload = buildWifiQrPayload(ssid, password, security);
  const qr = QRCode.create(payload, {
    errorCorrectionLevel: 'M'
  });
  const size = qr.modules.size;

  return {
    payload,
    size,
    modules: Array.from({ length: size }, (_, row) =>
      Array.from({ length: size }, (_, column) => Boolean(qr.modules.get(row, column)))
    )
  };
}

