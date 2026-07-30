-- CreateTable
CREATE TABLE "learning_states" (
    "user_id" UUID NOT NULL,
    "knowledge_id" TEXT NOT NULL,
    "pack_id" TEXT NOT NULL,
    "easiness" DOUBLE PRECISION NOT NULL,
    "interval_days" INTEGER NOT NULL,
    "repetitions" INTEGER NOT NULL,
    "due_at" TIMESTAMPTZ(6) NOT NULL,
    "client_version" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "learning_states_pkey" PRIMARY KEY ("user_id","knowledge_id")
);

-- CreateTable
CREATE TABLE "sync_processed_events" (
    "event_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "knowledge_id" TEXT NOT NULL,
    "processed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_processed_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateIndex
CREATE INDEX "learning_states_user_id_idx" ON "learning_states"("user_id");

-- CreateIndex
CREATE INDEX "sync_processed_events_user_id_idx" ON "sync_processed_events"("user_id");

-- AddForeignKey
ALTER TABLE "learning_states" ADD CONSTRAINT "learning_states_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_processed_events" ADD CONSTRAINT "sync_processed_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
