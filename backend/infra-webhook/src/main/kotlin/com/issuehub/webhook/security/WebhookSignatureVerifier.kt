package com.issuehub.webhook.security

import org.springframework.stereotype.Component
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

@Component
class WebhookSignatureVerifier {

    fun verifyJiraSignature(payload: ByteArray, signature: String, secret: String): Boolean {
        val computed = computeHmacSha256(payload, secret)
        return timingSafeEquals(computed, signature)
    }

    fun verifyGitHubSignature(payload: ByteArray, signature: String, secret: String): Boolean {
        val computed = "sha256=" + computeHmacSha256(payload, secret)
        return timingSafeEquals(computed, signature)
    }

    private fun computeHmacSha256(data: ByteArray, secret: String): String {
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(secret.toByteArray(), "HmacSHA256"))
        val hash = mac.doFinal(data)
        return hash.joinToString("") { "%02x".format(it) }
    }

    private fun timingSafeEquals(a: String, b: String): Boolean {
        if (a.length != b.length) return false
        var result = 0
        for (i in a.indices) {
            result = result or (a[i].code xor b[i].code)
        }
        return result == 0
    }
}
