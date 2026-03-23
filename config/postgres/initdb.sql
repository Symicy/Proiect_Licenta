-- Creăm baza de date separată pentru serverul de rețea LoRaWAN
CREATE DATABASE chirpstack;

-- Ne conectăm la baza de date proaspăt creată pentru a activa extensiile necesare
\c chirpstack;

-- ChirpStack v4 necesită aceste două extensii PostgreSQL pentru a funcționa corect
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS hstore;