package secrets

import "os"

var JwtSecret = getJwtSecret()

func getJwtSecret() []byte {
	secret := os.Getenv("JwtSecret")
	if secret == "" {
		secret = "REMOVED_JWT_SECRET"
	}
	return []byte(secret)
}
