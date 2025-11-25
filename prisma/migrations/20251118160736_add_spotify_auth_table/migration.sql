-- CreateTable
CREATE TABLE "public"."SpotifyAuthState" (
    "id" SERIAL NOT NULL,
    "state" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpotifyAuthState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyAuthState_state_key" ON "public"."SpotifyAuthState"("state");

-- CreateIndex
CREATE INDEX "SpotifyAuthState_state_idx" ON "public"."SpotifyAuthState"("state");
