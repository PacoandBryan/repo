import React, { useState, useRef, useEffect } from 'react';
import { Flower, Send, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CherryBlossomChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage = inputText;
        const newMessages = [...messages, { text: userMessage, isBot: false }];
        setMessages(newMessages);
        setInputText('');
        setIsLoading(true);

        // Convert messages to API format
        const apiMessages = newMessages.map(msg => ({
            role: msg.isBot ? "assistant" : "user",
            content: msg.text
        }));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

        try {
            const response = await fetch('http://localhost:5002/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: apiMessages }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('QUOTA_EXCEEDED');
                }
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            setMessages(prev => [...prev, { text: data.response, isBot: true }]);
        } catch (error: any) {
            console.error('Chat error:', error);
            let errorMessage = '¡¡¡Lo siento, hubo un error al conectar con el servidor!!!';

            if (error.name === 'AbortError') {
                errorMessage = '¡¡¡La respuesta está tardando demasiado!!! Por favor, intenta de nuevo en unos momentos!!!';
            } else if (error.message === 'QUOTA_EXCEEDED') {
                errorMessage = '¡¡¡Estamos recibiendo muchas consultas en este momento!!! 😊 ¡¡¡Por favor, espera un momentito e intenta de nuevo!!!';
            }

            setMessages(prev => [...prev, { text: errorMessage, isBot: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-pink-200 w-80 sm:w-96 flex flex-col overflow-hidden mb-4"
                        style={{ height: '500px' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-pink-300 to-pink-400 p-4 flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <Flower className="w-6 h-6 animate-spin-slow" />
                                <span className="font-bold text-lg">Ayuda diky</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-pink-50/50 space-y-4">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl ${msg.isBot
                                            ? 'bg-white text-pink-900 border border-pink-100 rounded-tl-none shadow-sm'
                                            : 'bg-gradient-to-br from-pink-400 to-pink-500 text-white rounded-tr-none shadow-md'
                                            }`}
                                    >
                                        <div className="text-sm markdown-body">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-pink-100">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={isLoading}
                                    placeholder={isLoading ? "Escribiendo..." : "Escribe un mensaje..."}
                                    className="flex-1 px-4 py-2 border border-pink-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent text-sm placeholder-pink-300 text-pink-800 disabled:opacity-50 disabled:bg-gray-50"
                                />
                                <button
                                    onClick={handleSend}
                                    className="bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-full transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!inputText.trim() || isLoading}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`pointer-events-auto p-4 rounded-full shadow-lg transition-colors flex items-center justify-center ${isOpen
                    ? 'bg-pink-400 text-white rotate-180'
                    : 'bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:from-pink-500 hover:to-pink-600'
                    }`}
            >
                {isOpen ? (
                    <X className="w-7 h-7" />
                ) : (
                    <MessageCircle className="w-7 h-7" />
                )}
            </motion.button>
        </div>
    );
};

export default CherryBlossomChatbot;
