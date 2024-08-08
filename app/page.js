'use client'
import Image from 'next/image'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome to Target! How can I help you today?`,
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim()) return;  // Don't send empty messages
    setIsLoading(true)

    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
  
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
    setIsLoading(false)
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      overflow="hidden"
      sx={{
        p: {xs:1, sm:2, md:3}, boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <Box 
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        p={2}
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        sx={{ mb:0.5 }}
      >
        <Box 
          sx={{ 
            display: 'flex', alignItems: 'center',
            mb: {xs: 1, sm: 0},
          }}
        >
          <Image src="/target.svg" alt="Target Icon" width={50} height={50} />
        </Box>
        <Typography 
          variant="h6" fontWeight="bold"
          sx={{
            textAlign: 'center',
            fontSize: {xs:'1rem', sm:'1.25rem'},
            marginTop: {xs:1, sm:0}, flex:1,
          }}
        >
          Have any questions? Ask Tyler - Target's Support Assistant!
        </Typography>
      </Box>

      {/* Chatbot Content */}
      <Stack
        direction={'column'}
        width="100%"
        maxWidth="500px"
        height="calc(100vh - 100px)"
        border="1px solid black"
        p={2}
        spacing={3}
        sx={{
          overflow: "hidden", mx: "auto",
        }}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          sx={{ maxHeight: '100%' }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                borderRadius={6}
                p={2}
                maxWidth="90%"
                sx={{ wordBreak: 'break-word'}}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>

      {/* Footer */}
      <Box 
        width="100%" p={2} textAlign="center"
        sx={{
          mt: "auto",
          fontSize: {xs: '0.8rem', sm:'1rem'},
        }}
      >
        <Typography variant="body2" color="secondary.main">
          © 2024 Target Support. All rights reserved.
        </Typography>
      </Box>
    </Box>
  )
}