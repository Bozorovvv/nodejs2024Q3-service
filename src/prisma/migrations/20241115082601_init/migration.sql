/*
  Warnings:

  - You are about to drop the `Favorites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AlbumToFavorites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ArtistToFavorites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TrackToFavorites` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AlbumToFavorites" DROP CONSTRAINT "_AlbumToFavorites_A_fkey";

-- DropForeignKey
ALTER TABLE "_AlbumToFavorites" DROP CONSTRAINT "_AlbumToFavorites_B_fkey";

-- DropForeignKey
ALTER TABLE "_ArtistToFavorites" DROP CONSTRAINT "_ArtistToFavorites_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArtistToFavorites" DROP CONSTRAINT "_ArtistToFavorites_B_fkey";

-- DropForeignKey
ALTER TABLE "_TrackToFavorites" DROP CONSTRAINT "_TrackToFavorites_A_fkey";

-- DropForeignKey
ALTER TABLE "_TrackToFavorites" DROP CONSTRAINT "_TrackToFavorites_B_fkey";

-- DropTable
DROP TABLE "Favorites";

-- DropTable
DROP TABLE "_AlbumToFavorites";

-- DropTable
DROP TABLE "_ArtistToFavorites";

-- DropTable
DROP TABLE "_TrackToFavorites";

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "artists" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "albums" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tracks" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);
