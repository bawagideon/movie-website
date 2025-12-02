import fs from "fs"
import path from "path"

// Load environment variables from .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8")
    envConfig.split("\n").forEach((line) => {
        const [key, value] = line.split("=")
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, "")
        }
    })
}

async function testGemini() {
    console.log("Testing Gemini API connection via REST API...")

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
        console.error("❌ Error: GOOGLE_GENERATIVE_AI_API_KEY is missing in .env.local")
        return
    }

    console.log(`API Key found: ${apiKey.substring(0, 5)}...`)

    const models = ["gemini-2.5-flash"]

    for (const model of models) {
        console.log(`\nTesting model: ${model}`)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: "Hello" }]
                    }]
                })
            })

            const data = await response.json()

            if (!response.ok) {
                console.error(`❌ Failed with ${model}:`, JSON.stringify(data, null, 2))
            } else {
                console.log(`✅ Success with ${model}:`, JSON.stringify(data, null, 2))
                return // Exit on first success
            }
        } catch (error) {
            console.error(`❌ Network error with ${model}:`, error)
        }
    }
}

testGemini()
