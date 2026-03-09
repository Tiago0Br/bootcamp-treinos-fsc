-- CreateTable
CREATE TABLE "user_train_data" (
    "user_id" TEXT NOT NULL,
    "weight_in_grams" INTEGER NOT NULL,
    "height_in_centimeters" INTEGER NOT NULL,
    "age" INTEGER NOT NULL,
    "body_fat_percentage" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_train_data_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "user_train_data" ADD CONSTRAINT "user_train_data_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
