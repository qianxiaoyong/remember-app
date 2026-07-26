export const officialWechatAuthorizationExample =
  'WECHATPAY2-SHA256-RSA2048 mchid="1900007291",nonce_str="593BEC0C930BF1AFEB40B4A08C8FB242",signature="jnks4dlrPw3ZX+ozVvSK39oa0t7OMBsg83BHAwd8BRdUFiVaQNTLTvci+wURgP1OQBbKYhFGvt7iqYpDSTQkp7Uq1sltaQKyncCyrA1g88m5bsKERQfPyT0ahSwKTYJ1CAn9QiJuSJRq1QsQs07eehbU/k9BCS51jTyc1Jpsi2H77HF9f/BnjXAOP3/sPObg6V5Ee4EzwLox684hhuMuIwHo7D8KFk3LIHOKDcNI4It1aCXydFWNpNK+SG86VUDe5kwoDpw4Ulqfu9z8OFDGbDs9TCxEv8iqQzbpxOlEVoOe2kalSYM5kApQb3nZcxdUtoE0liJGW3RGUNE0t4v01A==",timestamp="1554208460",serial_no="408B07E79B8269FEC3D5D3E6AB8ED163A6A380DB"';

export const officialWechatQueryRequest = {
  method: 'GET',
  path: '/v3/marketing/partnerships?limit=5&offset=10&authorized_data=%7B%22business_type%22%3A%22FAVOR_STOCK%22%2C%22stock_id%22%3A%222433405%22%7D&partner=%7B%22type%22%3A%22APPID%22%2C%22appid%22%3A%22wx4e1916a585d1f4e9%22%2C%22merchant_id%22%3A%222480029552%22%7D',
  timestamp: '1554208460',
  nonce: '593BEC0C930BF1AFEB40B4A08C8FB242',
  body: '',
} as const;

export const officialWechatSources = {
  requestSigning: 'https://pay.wechatpay.cn/doc/v3/merchant/4012365336',
  querySigning: 'https://pay.wechatpay.cn/doc/v3/merchant/4012365337',
  messageVerification: 'https://pay.wechatpay.cn/doc/v3/merchant/4013053420',
  callbackDecryption: 'https://pay.wechatpay.cn/doc/v3/merchant/4012071382',
  postmanRepository: 'https://github.com/wechatpay-apiv3/wechatpay-postman-script',
  postmanCommit: '3bd800e80fe9f718fa44d89ded260b6f96efec9f',
} as const;
