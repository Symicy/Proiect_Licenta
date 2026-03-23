# Folosim imaginea oficială Go
FROM golang:1.21-alpine

# Instalăm uneltele necesare
RUN apk add --no-cache gcc musl-dev make git bash

# Setăm directorul de lucru principal
WORKDIR /app

# Copiem tot codul sursă
COPY . .

# Descărcăm dependențele
RUN go mod download

# Instalăm utilitarul statik
RUN go install github.com/rakyll/statik@latest

# Compilăm
RUN make build

# Expunem portul
EXPOSE 8000

# Mutăm contextul în folderul bin
WORKDIR /app/bin

# MAGIA AICI: Redenumim binarul pentru a evita coliziunea de nume
RUN mv lwnsimulator lwn_app_exec

# Lansăm aplicația folosind noul nume
CMD ["./lwn_app_exec"]