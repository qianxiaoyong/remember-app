BEGIN;

SELECT CASE
  WHEN process_spike_payment_notification(
    :'notification_id',
    :'transaction_id',
    :'order_id',
    TIMESTAMPTZ :'processed_at'
  ) THEN 'true'
  ELSE 'false'
END AS spike_processed \gset

\if :spike_processed
  \echo SPIKE_PROCESSED=true
\else
  \echo SPIKE_PROCESSED=false
\endif

COMMIT;
