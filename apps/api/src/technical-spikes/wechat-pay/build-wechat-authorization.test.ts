import { createVerify, generateKeyPairSync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildWechatAuthorization } from './build-wechat-authorization.js';
import { officialWechatAuthorizationExample } from './official-wechat-samples.js';

const baseInput = {
  method: 'POST' as const,
  path: '/v3/pay/transactions/app',
  timestamp: '1554208460',
  nonce: '593BEC0C930BF1AFEB40B4A08C8FB242',
  body: '{"appid":"wx2421b1c4370ec43b"}',
  mchId: '1900007291',
  serialNo: '408B07E79B8269FEC3D5D3E6AB8ED163A6A380DB',
};

describe('buildWechatAuthorization', () => {
  it('生成只包含五个字段且签名可验证的完整Authorization', () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
    const authorization = buildWechatAuthorization({ ...baseInput, privateKey: privateKeyPem });
    const match =
      /^WECHATPAY2-SHA256-RSA2048 mchid="1900007291",nonce_str="593BEC0C930BF1AFEB40B4A08C8FB242",signature="([A-Za-z0-9+/]+={0,2})",timestamp="1554208460",serial_no="408B07E79B8269FEC3D5D3E6AB8ED163A6A380DB"$/.exec(
        authorization,
      );

    expect(match).not.toBeNull();
    const verifier = createVerify('RSA-SHA256');
    verifier.update(
      'POST\n/v3/pay/transactions/app\n1554208460\n593BEC0C930BF1AFEB40B4A08C8FB242\n{"appid":"wx2421b1c4370ec43b"}\n',
    );
    verifier.end();
    expect(verifier.verify(publicKey, match?.[1] ?? '', 'base64')).toBe(true);
  });

  it.each([
    ['mchId', ''],
    ['mchId', '1900007291"'],
    ['serialNo', 'serial\nnumber'],
    ['serialNo', 'serial,number'],
    ['nonce', 'nonce"value'],
    ['timestamp', '1554208460\\'],
  ] as const)('拒绝不能安全写入Authorization的%s', (name, value) => {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
    expect(() =>
      buildWechatAuthorization({ ...baseInput, [name]: value, privateKey: privateKeyPem }),
    ).toThrow();
  });

  it('官方Authorization样例使用相同认证类型和五个字段', () => {
    const [scheme = '', attributes = ''] = officialWechatAuthorizationExample.split(' ', 2);
    const names = Array.from(attributes.matchAll(/(?:^|,)([a-z_]+)="[^"]*"/g), (match) => match[1]);

    expect(scheme).toBe('WECHATPAY2-SHA256-RSA2048');
    expect(new Set(names)).toEqual(
      new Set(['mchid', 'serial_no', 'nonce_str', 'timestamp', 'signature']),
    );
  });
});
