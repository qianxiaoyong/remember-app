import { Admin, CustomRoutes, Resource } from 'react-admin';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import HistoryIcon from '@mui/icons-material/History';
import ReplayIcon from '@mui/icons-material/Replay';
import { Route } from 'react-router-dom';
import { AdminLoginPage } from './auth/admin-login-page.js';
import { CatalogTaxonomyPage } from './resources/catalog-taxonomy.js';
import { authProvider } from './auth/auth-provider.js';
import { dataProvider } from './data/data-provider.js';
import { Dashboard } from './dashboard/Dashboard.js';
import { AdminLayout } from './layout/admin-layout.js';
import { AuditLogList } from './resources/audit-logs.js';
import { OrderList, OrderShow } from './resources/orders.js';
import { RedemptionBatchCreate, RedemptionCodeList, RefundCreate } from './resources/operations.js';
import { PackAccessGrantCreate, PackAccessList } from './resources/pack-access.js';
import { PackCreate, PackEdit, PackList } from './resources/packs.js';
import PeopleIcon from '@mui/icons-material/People';
import { UserList, UserShow } from './resources/users.js';
import { adminTheme } from './theme/admin-theme.js';
import { LexiconDetailPage, LexiconListPage } from './resources/lexicon/index.js';
import { adminI18nProvider } from './i18n/admin-i18n.js';

export function AdminApp() {
  return (
    <Admin
      title="记得 · 运营后台"
      theme={adminTheme}
      layout={AdminLayout}
      loginPage={AdminLoginPage}
      dashboard={Dashboard}
      authProvider={authProvider}
      dataProvider={dataProvider}
      i18nProvider={adminI18nProvider}
      requireAuth
    >
      <CustomRoutes>
        <Route path="/catalog-taxonomy" element={<CatalogTaxonomyPage />} />
        <Route path="/lexicon" element={<LexiconListPage />} />
        <Route path="/lexicon/:lemmaKey" element={<LexiconDetailPage />} />
      </CustomRoutes>
      <Resource
        name="users"
        list={UserList}
        show={UserShow}
        options={{ label: 'App 用户' }}
        icon={PeopleIcon}
      />
      <Resource
        name="packs"
        list={PackList}
        edit={PackEdit}
        create={PackCreate}
        options={{ label: '知识库' }}
        icon={InventoryIcon}
      />
      <Resource
        name="orders"
        list={OrderList}
        show={OrderShow}
        options={{ label: '订单' }}
        icon={ReceiptIcon}
      />
      <Resource
        name="pack-access"
        list={PackAccessList}
        create={PackAccessGrantCreate}
        options={{ label: '用户权益' }}
        icon={VpnKeyIcon}
      />
      <Resource
        name="refunds"
        create={RefundCreate}
        options={{ label: '退款' }}
        icon={ReplayIcon}
      />
      <Resource
        name="redemption-codes"
        list={RedemptionCodeList}
        create={RedemptionBatchCreate}
        options={{ label: '兑换码' }}
        icon={CardGiftcardIcon}
      />
      <Resource
        name="audit-logs"
        list={AuditLogList}
        options={{ label: '审计日志' }}
        icon={HistoryIcon}
      />
    </Admin>
  );
}
