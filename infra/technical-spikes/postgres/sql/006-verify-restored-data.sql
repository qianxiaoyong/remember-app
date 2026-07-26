DO $$
DECLARE
  v_constraint_count integer;
  v_function_count integer;
BEGIN
  IF (SELECT count(*) FROM orders) <> 2 THEN
    RAISE EXCEPTION 'RESTORED_ORDER_COUNT_MISMATCH';
  END IF;

  IF (SELECT count(*) FROM payment_events) <> 1 OR
     (SELECT count(*) FROM pack_access) <> 1 THEN
    RAISE EXCEPTION 'RESTORED_BUSINESS_COUNT_MISMATCH';
  END IF;

  SELECT count(*)
    INTO v_constraint_count
    FROM pg_constraint
   WHERE conname IN (
     'payment_events_notification_id_key',
     'payment_events_transaction_id_key',
     'pack_access_user_id_pack_id_key',
     'payment_events_order_id_fkey',
     'pack_access_order_id_fkey'
   );

  IF v_constraint_count <> 5 THEN
    RAISE EXCEPTION 'RESTORED_CONSTRAINTS_MISSING';
  END IF;

  SELECT count(*)
    INTO v_function_count
    FROM pg_proc
   WHERE proname = 'process_spike_payment_notification'
     AND pronargs = 4;

  IF v_function_count <> 1 THEN
    RAISE EXCEPTION 'RESTORED_FUNCTION_MISSING';
  END IF;
END
$$;
