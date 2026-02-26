package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

var rdb *redis.Client
var redisPrefix string
var allowedOrigins []string

func main() {
	redisHost := os.Getenv("REDIS_HOST")
	if redisHost == "" {
		redisHost = "redis"
	}
	redisPort := os.Getenv("REDIS_PORT")
	if redisPort == "" {
		redisPort = "6379"
	}
	redisAddr := redisHost + ":" + redisPort
	redisPassword := os.Getenv("REDIS_PASSWORD")

	redisPrefix = os.Getenv("REDIS_PREFIX")
	if redisPrefix == "" {
		redisPrefix = ""
	}

	allowed := os.Getenv("SSE_ALLOWED_ORIGINS")
	if allowed == "" {
		allowed = "http://localhost:3000"
	}
	allowedOrigins = strings.Split(allowed, ",")

	rdb = redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: redisPassword,
		DB:       0,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if _, err := rdb.Ping(ctx).Result(); err != nil {
		log.Fatalf("Erro ao conectar no Redis: %v", err)
	}
	log.Println("Conectado ao Redis com sucesso!")

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Serviço SSE está rodando.")
	})
	http.HandleFunc("/stream", sseHandler)

	port := os.Getenv("SSE_PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Microsserviço SSE rodando na porta %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func originAllowed(origin string) bool {
	for _, o := range allowedOrigins {
		if strings.TrimSpace(o) == origin {
			return true
		}
	}
	return false
}

func sseHandler(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	if origin != "" && originAllowed(origin) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
	} else {
		w.Header().Set("Access-Control-Allow-Origin", "null")
	}
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cache-Control, X-Requested-With")
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	ticket := r.URL.Query().Get("ticket")
	if ticket == "" {
		http.Error(w, "Ticket required", http.StatusUnauthorized)
		return
	}

	ctx := r.Context()
	redisKey := redisPrefix + "sse_auth:" + ticket

	userID, err := rdb.Get(ctx, redisKey).Result()
	if err == redis.Nil {
		http.Error(w, "Invalid or expired ticket", http.StatusForbidden)
		return
	} else if err != nil {
		log.Printf("Erro no Redis: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// delete single-use ticket
	if err := rdb.Del(ctx, redisKey).Err(); err != nil {
		log.Printf("Falha ao deletar ticket Redis: %v", err)
	}

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, ": conectado ao canal user:%s\n\n", userID)
	flusher.Flush()

	pubsub := rdb.Subscribe(ctx, redisPrefix+"sse:user:"+userID)
	defer pubsub.Close()

	ch := pubsub.Channel()

	log.Printf("Cliente conectado: User %s", userID)

	for {
		select {
		case msg := <-ch:
			var raw json.RawMessage
			if err := json.Unmarshal([]byte(msg.Payload), &raw); err != nil {
				log.Printf("Payload inválido no Redis: %v", err)
				continue
			}

			fmt.Fprintf(w, "data: %s\n\n", msg.Payload)
			flusher.Flush()
		case <-ctx.Done():
			log.Printf("Cliente desconectou: User %s", userID)
			return
		}
	}
}
