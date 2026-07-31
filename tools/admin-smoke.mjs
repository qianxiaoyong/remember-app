import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:5173';
const results = [];

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, status: 'PASS' });
    console.log(`PASS  ${name}`);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    results.push({ name, status: 'FAIL', detail });
    console.log(`FAIL  ${name}: ${detail}`);
  }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(15000);

await check('登录页加载', async () => {
  await page.goto(`${BASE}/#/login`);
  await page.getByRole('heading', { name: '记得 · 运营后台' }).waitFor();
});

await check('登录成功进入驾驶舱', async () => {
  await page.getByLabel('用户名').fill('admin');
  await page.getByLabel('密码').fill('dev-only-admin-password');
  await page.getByRole('button', { name: /登录/i }).click();
  await page.waitForURL(/#\/(?!login)/);
  await page.getByText('驾驶舱').first().waitFor();
});

await check('知识库列表：单列筛选栏 + 知识库 ID 列名', async () => {
  await page.goto(`${BASE}/#/packs`);
  await page.getByRole('columnheader', { name: '知识库 ID' }).waitFor();
  const searchInputs = page.getByLabel('搜索标题 / 知识库 ID');
  if ((await searchInputs.count()) !== 1) {
    throw new Error(`搜索框数量=${await searchInputs.count()}，期望 1`);
  }
  const statusFilters = page.getByLabel('状态', { exact: true });
  if ((await statusFilters.count()) !== 1) {
    throw new Error(`状态下拉数量=${await statusFilters.count()}，期望 1`);
  }
  await page.getByText('demo-primary-grade3').first().waitFor();
});

await check('知识库编辑页 Tab 切换', async () => {
  await page.getByText('demo-primary-grade3').first().click();
  await page.getByRole('tab', { name: '版本与发布' }).click();
  await page.getByText('选择 zip').waitFor();
  await page.getByText('上传并校验').waitFor();
});

await check('订单列表 + 详情', async () => {
  await page.goto(`${BASE}/#/orders`);
  await page.getByRole('columnheader', { name: '状态' }).waitFor();
  const rows = page.locator('tbody tr');
  if ((await rows.count()) === 0) {
    throw new Error('订单列表为空');
  }
  await rows.first().click();
  await page.getByText('订单详情').waitFor();
  await page.getByText('支付事件').waitFor();
  await page.getByText('退款记录').waitFor();
});

await check('用户权益列表 + 补发入口', async () => {
  await page.goto(`${BASE}/#/pack-access`);
  await page.getByRole('columnheader', { name: '来源' }).waitFor();
  await page.getByText('补发权益').waitFor();
});

await check('兑换码列表 + 批量生成入口', async () => {
  await page.goto(`${BASE}/#/redemption-codes`);
  await page.getByRole('columnheader', { name: '码预览' }).waitFor();
  await page.getByText('批量生成').waitFor();
});

await check('退款创建页 mock 警告', async () => {
  await page.goto(`${BASE}/#/refunds/create`);
  await page.getByText('发起退款').waitFor();
  await page.getByText(/dev\/mock 退款链路/).waitFor();
});

await check('审计日志列表（空态）', async () => {
  await page.goto(`${BASE}/#/audit-logs`);
  await page.getByRole('heading', { name: '审计日志' }).waitFor();
  await page.getByText(/No 审计日志 yet|动作/).waitFor();
});

await browser.close();

const failed = results.filter((item) => item.status === 'FAIL');
console.log('\n--- 汇总 ---');
console.log(`通过 ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) {
  process.exitCode = 1;
}
