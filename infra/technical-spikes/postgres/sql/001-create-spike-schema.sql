CREATE TABLE orders (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  pack_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING', 'PAID')),
  updated_at timestamptz NOT NULL
);

CREATE TABLE payment_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  notification_id text NOT NULL UNIQUE,
  transaction_id text NOT NULL UNIQUE,
  order_id text NOT NULL REFERENCES orders(id),
  processed_at timestamptz NOT NULL
);

CREATE TABLE pack_access (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id text NOT NULL,
  pack_id text NOT NULL,
  order_id text NOT NULL REFERENCES orders(id),
  granted_at timestamptz NOT NULL,
  UNIQUE (user_id, pack_id)
);

CREATE OR REPLACE FUNCTION process_spike_payment_notification(
  p_notification_id text,
  p_transaction_id text,
  p_order_id text,
  p_processed_at timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_existing payment_events%ROWTYPE;
  v_order orders%ROWTYPE;
  v_inserted_notification_id text;
BEGIN
  SELECT *
    INTO v_existing
    FROM payment_events
   WHERE notification_id = p_notification_id
   FOR UPDATE;

  IF FOUND THEN
    IF v_existing.transaction_id <> p_transaction_id OR
       v_existing.order_id <> p_order_id THEN
      RAISE EXCEPTION 'PAYMENT_NOTIFICATION_CONFLICT';
    END IF;
    RETURN false;
  END IF;

  SELECT *
    INTO v_order
    FROM orders
   WHERE id = p_order_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PAYMENT_ORDER_NOT_FOUND';
  END IF;

  INSERT INTO payment_events (
    notification_id,
    transaction_id,
    order_id,
    processed_at
  )
  VALUES (
    p_notification_id,
    p_transaction_id,
    p_order_id,
    p_processed_at
  )
  ON CONFLICT (notification_id) DO NOTHING
  RETURNING notification_id INTO v_inserted_notification_id;

  IF v_inserted_notification_id IS NULL THEN
    SELECT *
      INTO STRICT v_existing
      FROM payment_events
     WHERE notification_id = p_notification_id
     FOR UPDATE;

    IF v_existing.transaction_id <> p_transaction_id OR
       v_existing.order_id <> p_order_id THEN
      RAISE EXCEPTION 'PAYMENT_NOTIFICATION_CONFLICT';
    END IF;
    RETURN false;
  END IF;

  UPDATE orders
     SET status = 'PAID',
         updated_at = p_processed_at
   WHERE id = v_order.id;

  INSERT INTO pack_access (user_id, pack_id, order_id, granted_at)
  VALUES (v_order.user_id, v_order.pack_id, v_order.id, p_processed_at)
  ON CONFLICT (user_id, pack_id) DO NOTHING;

  RETURN true;
END
$$;
