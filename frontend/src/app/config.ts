let apiUrl: string;

if (process.env.NODE_ENV === "production") {
    apiUrl = "https://ownpage-production.up.railway.app";
} else {
    apiUrl = "http://localhost:8080";
}

export default apiUrl;