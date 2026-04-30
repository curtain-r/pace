import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

export async function chatWithPet(petPersonality, petName, userMessage) {
  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `你是一只名叫「${petName}」的宠物。你的性格是：${petPersonality}。
请用可爱、简短的方式回复主人的话，可以加入一些拟声词和颜文字。
回复控制在50字以内。`,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
    max_tokens: 200,
  })

  return response.choices[0].message.content || '...'
}
