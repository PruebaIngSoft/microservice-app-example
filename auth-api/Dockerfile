FROM golang:1.25-alpine AS builder
WORKDIR /app

# Copiar solo los módulos primero
COPY go.mod go.sum ./
RUN go mod download

# Copiar el resto del código
COPY . .

RUN go build -o auth-api .

FROM alpine:3.18
WORKDIR /root/
COPY --from=builder /app/auth-api .
CMD ["./auth-api"]
