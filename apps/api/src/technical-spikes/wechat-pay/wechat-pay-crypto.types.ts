export interface WechatRequestSignatureInput {
  method: 'GET' | 'POST';
  path: string;
  timestamp: string;
  nonce: string;
  body: string;
}

export interface WechatAuthorizationInput extends WechatRequestSignatureInput {
  mchId: string;
  serialNo: string;
  privateKey: string;
}

export interface WechatMessageSignatureInput {
  timestamp: string;
  nonce: string;
  body: string;
  signature: string;
  publicKey: string;
}

export interface WechatEncryptedResource {
  algorithm: 'AEAD_AES_256_GCM';
  ciphertext: string;
  nonce: string;
  associatedData: string;
}
