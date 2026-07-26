DO $$
DECLARE
  v_order_user_id text;
  v_order_pack_id text;
BEGIN
  SELECT user_id, pack_id
    INTO STRICT v_order_user_id, v_order_pack_id
    FROM orders
   WHERE id = 'order-001'
     AND status = 'PAID'
     AND updated_at = TIMESTAMPTZ '2026-07-26 08:00:00+00';

  IF (SELECT count(*) FROM payment_events) <> 1 THEN
    RAISE EXCEPTION 'EXPECTED_ONE_PAYMENT_EVENT';
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM payment_events
     WHERE notification_id = 'notification-001'
       AND transaction_id = 'transaction-001'
       AND order_id = 'order-001'
       AND processed_at = TIMESTAMPTZ '2026-07-26 08:00:00+00'
  ) THEN
    RAISE EXCEPTION 'PAYMENT_EVENT_CHANGED';
  END IF;

  IF (SELECT count(*) FROM pack_access) <> 1 THEN
    RAISE EXCEPTION 'EXPECTED_ONE_PACK_ACCESS';
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM pack_access
     WHERE order_id = 'order-001'
       AND user_id = v_order_user_id
       AND pack_id = v_order_pack_id
  ) THEN
    RAISE EXCEPTION 'PACK_ACCESS_NOT_DERIVED_FROM_ORDER';
  END IF;
END
$$;
