/**
 * This script generates a secure random string suitable for use as a NextAuth secret
 * Run with: node generate-secret.js
 */

function generateSecret(length = 32) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?'
  let secret = ''
  
  // Create a Uint8Array with random values
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)
  
  // Map random values to characters in our charset
  for (let i = 0; i < length; i++) {
    const randomIndex = randomValues[i] % charset.length
    secret += charset[randomIndex]
  }
  
  return secret
}

const secret = generateSecret(64)
console.log('Your NEXTAUTH_SECRET:')
console.log(secret) 