import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Send, 
  MessageSquare, 
  FileText, 
  Plus,
  Bot,
  User,
  Clock,
  Search
} from 'lucide-react';
import { apiService } from '../services/api';
import { formatDateTime } from '../utils/utils';
import toast from 'react-hot-toast';

const Chat = () => {
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatSessions();
    fetchPolicies();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatSessions = async () => {
    try {
      setSessionsLoading(true);
      const response = await apiService.chat.getHistory();
      setChatSessions(response.data.data.chatSessions);
    } catch (error) {
      toast.error('Failed to load chat sessions');
      console.error('Chat sessions error:', error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchPolicies = async () => {
    try {
      const response = await apiService.policies.getAll({ limit: 100 });
      setPolicies(response.data.data.policies);
    } catch (error) {
      toast.error('Failed to load policies');
      console.error('Policies error:', error);
    }
  };

  const startNewChat = async (policyId) => {
    if (!policyId) {
      toast.error('Please select a policy');
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.chat.start(policyId);
      const newSession = response.data.data.chatSession;
      
      setCurrentSession(newSession);
      setChatSessions(prev => [newSession, ...prev]);
      setSelectedPolicy(policies.find(p => p._id === policyId));
      
      toast.success('Chat session started');
    } catch (error) {
      toast.error('Failed to start chat');
      console.error('Start chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentSession) return;

    const userMessage = message.trim();
    setMessage('');

    // Add user message immediately for better UX
    const tempMessage = {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setCurrentSession(prev => ({
      ...prev,
      messages: [...prev.messages, tempMessage]
    }));

    try {
      setIsLoading(true);
      const response = await apiService.chat.sendMessage(currentSession._id, {
        message: userMessage
      });

      const { assistantMessage, sources } = response.data.data;
      
      setCurrentSession(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage]
      }));

    } catch (error) {
      toast.error('Failed to send message');
      console.error('Send message error:', error);
      
      // Remove the temporary message on error
      setCurrentSession(prev => ({
        ...prev,
        messages: prev.messages.slice(0, -1)
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatSession = async (sessionId) => {
    try {
      setIsLoading(true);
      const response = await apiService.chat.getSession(sessionId);
      const session = response.data.data.chatSession;
      
      setCurrentSession(session);
      setSelectedPolicy(policies.find(p => p._id === session.policy._id));
    } catch (error) {
      toast.error('Failed to load chat session');
      console.error('Load session error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Policy Assistant</h1>
        <p className="mt-2 text-gray-600">Chat with AI to get insights about your insurance policies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card h-full flex flex-col">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Chat Sessions</h3>
              <button
                onClick={() => {
                  setCurrentSession(null);
                  setSelectedPolicy(null);
                }}
                className="btn btn-primary btn-sm"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {sessionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : chatSessions.length > 0 ? (
                <div className="space-y-2 p-4">
                  {chatSessions.map((session) => (
                    <button
                      key={session._id}
                      onClick={() => loadChatSession(session._id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        currentSession?._id === session._id
                          ? 'bg-primary-50 border border-primary-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {session.sessionTitle}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session.policy?.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDateTime(session.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">No chat sessions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <div className="card h-full flex flex-col">
            {!currentSession ? (
              /* Policy Selection */
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-md w-full text-center">
                  <Bot className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start a New Chat
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Select a policy to start chatting with the AI assistant
                  </p>

                  {/* Policy Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Policy
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={selectedPolicy?._id || ''}
                        onChange={(e) => setSelectedPolicy(policies.find(p => p._id === e.target.value))}
                        className="input pl-10"
                      >
                        <option value="">Choose a policy...</option>
                        {policies.map((policy) => (
                          <option key={policy._id} value={policy._id}>
                            {policy.title} - {policy.insuranceCompany}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => startNewChat(selectedPolicy?._id)}
                    disabled={!selectedPolicy || isLoading}
                    className="btn btn-primary w-full"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Starting...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Start Chat
                      </>
                    )}
                  </button>

                  {policies.length === 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">
                        No policies available
                      </p>
                      <Link
                        to="/policies/upload"
                        className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                      >
                        Upload your first policy →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="card-header border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {selectedPolicy?.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedPolicy?.insuranceCompany} • {selectedPolicy?.policyNumber}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentSession(null);
                        setSelectedPolicy(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {currentSession.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-3 max-w-3xl ${
                        msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                          msg.type === 'user' ? 'bg-primary-600' : 'bg-gray-200'
                        }`}>
                          {msg.type === 'user' ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            msg.type === 'user'
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-500 mb-1">Sources:</p>
                              {msg.sources.map((source, idx) => (
                                <div key={idx} className="text-xs text-gray-400">
                                  Source {idx + 1} (Relevance: {Math.round(source.relevanceScore * 100)}%)
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="text-xs mt-2 opacity-70">
                            {formatDateTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="card-header border-t">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about your policy..."
                      className="flex-1 input"
                      disabled={isLoading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!message.trim() || isLoading}
                      className="btn btn-primary"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  
                  {/* Quick Questions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      "What is covered?",
                      "What are the exclusions?",
                      "What is the premium?",
                      "When does it expire?",
                      "What are the risks?"
                    ].map((question) => (
                      <button
                        key={question}
                        onClick={() => setMessage(question)}
                        className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                        disabled={isLoading}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
