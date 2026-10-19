/**
 * Classify the current session's device class. Returns "Mobile" for phones
 * and tablets (banner spatial behaviour is closer to phone than desktop)
 * and "Desktop" otherwise. UA is the primary signal; viewport width is the
 * tiebreak when the UA is unusual or missing.
 */
export type DeviceClass = "Mobile" | "Desktop";

export function detectDevice(): DeviceClass {
    if (typeof navigator === "undefined" || typeof window === "undefined") {
        return "Desktop";
    }
    const ua = navigator.userAgent ?? "";
    if (/Mobi|Android|iPhone|iPod|iPad|Tablet/i.test(ua)) {
        return "Mobile";
    }
    return window.innerWidth <= 1024 ? "Mobile" : "Desktop";
}
