# 0002 微信支付APIv3密码学技术验证

日期：2026-07-26
状态：本地密码学验证通过；真实商户联调未执行

## 范围

本验证只覆盖微信支付APIv3的本地纯密码学边界：请求签名原文、完整Authorization、响应/回调验签原文、RSA-SHA256验签和AES-256-GCM解密。未创建网络客户端、订单服务、Controller、正式`WechatPayClient`或真实支付请求。

## 环境与依据

- Node.js：22.23.1。
- 微信支付带body请求签名文档：`https://pay.wechatpay.cn/doc/v3/merchant/4012365336`。
- 微信支付带query请求签名文档：`https://pay.wechatpay.cn/doc/v3/merchant/4012365337`。
- 微信支付平台证书验签文档：`https://pay.wechatpay.cn/doc/v3/merchant/4013053420`。
- 微信支付回调解密文档：`https://pay.wechatpay.cn/doc/v3/merchant/4012071382`。
- 微信支付官方Postman脚本：`https://github.com/wechatpay-apiv3/wechatpay-postman-script`。
- Postman脚本对照提交：`3bd800e80fe9f718fa44d89ded260b6f96efec9f`（`master`，读取于2026-07-26）。

仓库只保存官方公开样例和运行期生成的临时RSA-2048密钥测试；没有保存官方示例私钥、自建私钥、APIv3 key或真实商户配置。

## 验证结果

- 请求原文严格使用`method\npath-with-query\ntimestamp\nnonce\nbody\n`；空body仍保留第五行，query不重排、不重新编码。
- Authorization认证类型为`WECHATPAY2-SHA256-RSA2048`，且只包含`mchid`、`serial_no`、`nonce_str`、`timestamp`和`signature`。临时公钥能够验证生成的Base64签名。
- 响应和回调严格使用原始body构造`timestamp\nnonce\nbody\n`；body、timestamp、nonce、签名或公钥不匹配时拒绝。
- AES-256-GCM只接受32字节APIv3 key和12字节nonce。Base64解码结果必须长于16字节，末尾16字节作为认证标签，其余部分作为加密内容；nonce、AAD、密文或标签不匹配时抛错。
- 任何密码学失败都不会返回空数据或假成功。

独立上下文安全审查发现并已修复两项P2：

1. Node对Base64输入解码宽松，合法签名尾随非法字符仍可能验签成功。当前实现先校验非空、字符集、长度和重新编码一致性，再把解码后的字节交给验签函数；非法字符、前导空白和缺失padding均拒绝。
2. 初版测试只篡改认证标签，未单独篡改加密内容。当前测试分别翻转加密内容和认证标签字节，两者都必须解密失败。

复审未发现P0/P1；其余签名原文、Authorization、RSA-SHA256、AES-GCM、官方样例、敏感信息和范围边界未发现问题。

执行命令：

```powershell
.\node_modules\.bin\vitest.CMD run apps/api/src/technical-spikes/wechat-pay/build-wechat-signature-message.test.ts apps/api/src/technical-spikes/wechat-pay/build-wechat-authorization.test.ts apps/api/src/technical-spikes/wechat-pay/verify-wechat-message.test.ts apps/api/src/technical-spikes/wechat-pay/decrypt-wechat-resource.test.ts
pnpm --filter @remember/api test
pnpm --filter @remember/api typecheck
pnpm --filter @remember/api build
```

本机pnpm在Windows下无法通过`pnpm --filter @remember/api exec vitest`解析工作区Vitest二进制，因此定向验收改为直接调用仓库锁定的`node_modules/.bin/vitest.CMD`，并保留完整测试文件路径。

## 未验证与生产边界

- 当前没有商户号、商户API证书、平台证书或APIv3 key，未执行真实商户请求、响应或回调联调。
- 生产适配器仍需在验签前校验平台证书序列号与时间戳窗口，并使用原始HTTP body；本Spike不负责证书轮换、网络请求、重放存储或业务幂等。
- 正式`WechatPayClient`仅在支付阶段按独立计划设计；本阶段不提前创建公开接口。
