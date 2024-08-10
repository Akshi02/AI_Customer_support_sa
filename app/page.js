'use client'
import Image from 'next/image'
import { Box, Button, Stack, TextField, Typography, CircularProgress, InputAdornment } from '@mui/material'
import { Send } from '@mui/icons-material'
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
  const [showSuggestions, setShowSuggestions] = useState(true)

  const suggestedQuestions = [
    "What are your store hours?",
    "Where is my order?",
    "What is your return policy?",
    "How can I apply for a job?",
  ]

  const sendMessage = async (msg = message) => {
    if (!msg.trim()) return;  // Don't send empty messages
    setIsLoading(true)
    setShowSuggestions(false)  // Hide suggestions after first message

    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: msg },
      { role: 'assistant', content: '' },
    ])
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: msg }]),
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

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
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
      sx={{ p: 3, bgcolor: '#f4f4f9' }}
    >
      {/* Header */}
      <Box 
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        p={2}
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        maxWidth="500px"
        sx={{ 
          bgcolor: 'white',
          boxShadow: 1,
          borderRadius: 2,
          mb: 2,
          border: '1px solid #e0e0e0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 0 } }}>
          <Image src="/target.svg" alt="Target Icon" width={50} height={50} />
        </Box>
        <Typography 
          variant="h6" 
          fontWeight="bold"
          sx={{
            textAlign: 'center',
            fontSize: { xs: '1rem', sm: '1.25rem' },
            mt: { xs: 1, sm: 0 },
            flex: 1,
          }}
        >
          Ask Tyler - Target's Support Assistant!
        </Typography>
      </Box>

      {/* Chatbot Content */}
      <Stack
        direction="column"
        width="100%"
        maxWidth="500px"
        height="calc(100vh - 150px)"
        p={2}
        spacing={2}
        sx={{
          bgcolor: 'white',
          boxShadow: 1,
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          sx={{ maxHeight: '100%', pb: 2 }}
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
                display="flex"
                alignItems="center" // Ensures that the text and image are aligned
                bgcolor={
                  message.role === 'assistant'
                    ? '#E3F2FD'
                    : '#FFCDD2'
                }
                color="black"
                borderRadius={4}
                p={2}
                maxWidth="85%"
                sx={{ wordBreak: 'break-word', boxShadow: 1 }}
              >
                {message.role === 'user' && (
                  <Image
                    src="/image.png" 
                    alt="Chat Icon"
                    width={27} 
                    height={27} 
                    style={{ marginRight: '8px' }}
                  />
                )}
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>

        {/* Suggested Questions */}
        {showSuggestions && (
          <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
            {suggestedQuestions.map((question, index) => (
              <Button 
                key={index}
                variant="outlined" 
                onClick={() => sendMessage(question)}
                fullWidth
                sx={{
                  borderColor: '#90CAF9',
                  color: '#1E88E5',
                  '&:hover': {
                    borderColor: '#1E88E5',
                    bgcolor: '#E3F2FD',
                  },
                }}
              >
                {question}
              </Button>
            ))}
          </Stack>
        )}

        {/* User Input */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            InputProps={{
              endAdornment: (
                isLoading && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                )
              ),
            }}
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 1,
              borderColor: '#e0e0e0',
            }}
          />
          <Button 
            variant="contained" 
            onClick={() => sendMessage()} 
            disabled={isLoading}
            sx={{
              bgcolor: '#1E88E5',
              '&:hover': {
                bgcolor: '#1565C0',
              },
              '&:disabled': {
                bgcolor: '#90CAF9',
              },
              minWidth: 50, 
            }}
          >
            <Send /> 
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}