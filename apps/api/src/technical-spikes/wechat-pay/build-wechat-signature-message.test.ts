import { describe, expect, it } from 'vitest';
import {
  buildWechatMessageSignatureMessage,
  buildWechatRequestSignatureMessage,
} from './build-wechat-signature-message.js';
import { officialWechatQueryRequest } from './official-wechat-samples.js';

describe('buildWechatRequestSignatureMessage', () => {
  it('构造带body请求的五行签名原文并保留末尾LF', () => {
    expect(
      buildWechatRequestSignatureMessage({
        method: 'POST',
        path: '/v3/pay/transactions/app',
        timestamp: '1554208460',
        nonce: '593BEC0C930BF1AFEB40B4A08C8FB242',
        body: '{"appid":"wx2421b1c4370ec43b"}',
      }),
    ).toBe(
      'POST\n/v3/pay/transactions/app\n1554208460\n593BEC0C930BF1AFEB40B4A08C8FB242\n{"appid":"wx2421b1c4370ec43b"}\n',
    );
  });

  it('构造空body GET时保留第五行', () => {
    expect(
      buildWechatRequestSignatureMessage({
        method: 'GET',
        path: '/v3/certificates',
        timestamp: '1554208460',
        nonce: '593BEC0C930BF1AFEB40B4A08C8FB242',
        body: '',
      }),
    ).toBe('GET\n/v3/certificates\n1554208460\n593BEC0C930BF1AFEB40B4A08C8FB242\n\n');
  });

  it('逐字保留GET请求中的query', () => {
    expect(
      buildWechatRequestSignatureMessage({
        method: 'GET',
        path: '/v3/pay/transactions/out-trade-no/ORDER_001?mchid=1900007291',
        timestamp: '1554208460',
        nonce: '593BEC0C930BF1AFEB40B4A08C8FB242',
        body: '',
      }),
    ).toBe(
      'GET\n/v3/pay/transactions/out-trade-no/ORDER_001?mchid=1900007291\n1554208460\n593BEC0C930BF1AFEB40B4A08C8FB242\n\n',
    );
  });

  it('与微信官方带query请求样例逐字节一致', () => {
    expect(buildWechatRequestSignatureMessage(officialWechatQueryRequest)).toBe(
      'GET\n/v3/marketing/partnerships?limit=5&offset=10&authorized_data=%7B%22business_type%22%3A%22FAVOR_STOCK%22%2C%22stock_id%22%3A%222433405%22%7D&partner=%7B%22type%22%3A%22APPID%22%2C%22appid%22%3A%22wx4e1916a585d1f4e9%22%2C%22merchant_id%22%3A%222480029552%22%7D\n1554208460\n593BEC0C930BF1AFEB40B4A08C8FB242\n\n',
    );
  });
});

describe('buildWechatMessageSignatureMessage', () => {
  it('使用原始body构造三行验签原文', () => {
    expect(
      buildWechatMessageSignatureMessage({
        timestamp: '1722850421',
        nonce: 'd824f2e086d3c1df967785d13fcd22ef',
        body: '{"code_url":"weixin://wxpay/bizpayurl?pr=JyC91EIz1"}',
      }),
    ).toBe(
      '1722850421\nd824f2e086d3c1df967785d13fcd22ef\n{"code_url":"weixin://wxpay/bizpayurl?pr=JyC91EIz1"}\n',
    );
  });
});
