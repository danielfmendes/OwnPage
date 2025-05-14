package secrets

import "os"

var JwtSecret = getJwtSecret()

func getJwtSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "REMOVED_JWT_SECRET"
	}
	return []byte(secret)
}
