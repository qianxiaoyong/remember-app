BEGIN;

UPDATE orders
   SET status = 'PENDING',
       updated_at = TIMESTAMPTZ '2000-01-01 00:00:00+00'
 WHERE id = 'order-001';

SELECT process_spike_payment_notification(
  'notification-001',
  :'transaction_id',
  :'order_id',
  TIMESTAMPTZ '2026-07-26 09:00:00+00'
);

COMMIT;
