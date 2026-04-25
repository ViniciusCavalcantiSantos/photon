# Stage 1: Builder
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o sse-server main.go

FROM alpine:3.22

# Consolidação: Instala dependências + Cria usuário + Ajusta permissões
RUN apk add --no-cache ca-certificates \
    && addgroup -S appgroup \
    && adduser -S appuser -G appgroup \
    && mkdir -p /app

WORKDIR /app

COPY --from=builder /app/sse-server .

# Permissões finais
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

CMD ["./sse-server"]