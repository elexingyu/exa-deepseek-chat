'use client';

import { useChat, Message } from 'ai/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { getAssetPath } from './utils';

interface SearchResult {
  title: string;
  url: string;
  text: string;
  author?: string;
  publishedDate?: string;
  favicon?: string;
}

// Add this helper function before the Page component
const parseMessageContent = (content: string) => {
  // If we find a complete think tag
  if (content.includes('</think>')) {
    const [thinking, ...rest] = content.split('</think>');
    return {
      thinking: thinking.replace('<think>', '').trim(),
      finalResponse: rest.join('</think>').trim(),
      isComplete: true
    };
  }
  // If we only find opening think tag, everything after it is thinking
  if (content.includes('<think>')) {
    return {
      thinking: content.replace('<think>', '').trim(),
      finalResponse: '',
      isComplete: false
    };
  }
  // No think tags, everything is final response
  return {
    thinking: '',
    finalResponse: content,
    isComplete: true
  };
};

export default function Page() {
  const [isSearching, setIsSearching] = useState(false);
  const [isLLMLoading, setIsLLMLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [previousQueries, setPreviousQueries] = useState<string[]>([]);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(true);
  const [loadingDots, setLoadingDots] = useState('');
  const [showModelNotice, setShowModelNotice] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      let count = 0;
      interval = setInterval(() => {
        count = (count + 1) % 4;
        setLoadingDots('.'.repeat(count));
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSearching]);

  const { messages, input, handleInputChange, handleSubmit: handleChatSubmit, setMessages } = useChat({
    api: getAssetPath('/api/chat'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Reset states
    setIsSearching(true);
    setIsLLMLoading(false);
    setSearchResults([]);
    setSearchError(null);

    try {
      // First, get web search results
      const searchResponse = await fetch(getAssetPath('/api/exawebsearch'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: input,
          previousQueries: previousQueries.slice(-3)
        }),
      });

      if (!searchResponse.ok) {
        throw new Error('Search failed');
      }

      const { results } = await searchResponse.json();
      setSearchResults(results);
      // Hide the notice when search results appear
      setShowModelNotice(false);
      setIsSearching(false);
      setIsLLMLoading(true);

      // Format search context
      const searchContext = results.length > 0
        ? `Web Search Results:\n\n${results.map((r: SearchResult, i: number) => 
            `Source [${i + 1}]:\nTitle: ${r.title}\nURL: ${r.url}\n${r.author ? `Author: ${r.author}\n` : ''}${r.publishedDate ? `Date: ${r.publishedDate}\n` : ''}Content: ${r.text}\n---`
          ).join('\n\n')}\n\nInstructions: Based on the above search results, please provide an answer to the user's query. When referencing information, cite the source number in brackets like [1], [2], etc. Use simple english and simple words. Most important: Before coming to the final answer, think out loud, and think step by step. Think deeply, and review your steps, do 3-5 steps of thinking. Wrap the thinking in <think> tags. Start with <think> and end with </think> and then the final answer.`
        : '';

      // Send both system context and user message in one request
      if (searchContext) {
        // First, update the messages state with both messages
        const newMessages: Message[] = [
          ...messages,
          {
            id: Date.now().toString(),
            role: 'system',
            content: searchContext
          }
        ];
        setMessages(newMessages);
      }

      // Then trigger the API call
      handleChatSubmit(e);

      // Update previous queries after successful search
      setPreviousQueries(prev => [...prev, input].slice(-3));

    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
      console.error('Error:', err);
      setIsLLMLoading(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Add effect to watch for complete responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      const { isComplete } = parseMessageContent(lastMessage.content);
      if (isComplete) {
        setIsLLMLoading(false);
      }
    }
  }, [messages]);

  return (
    <>
      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50">
        <div className="md:max-w-4xl mx-auto px-6 py-3 flex justify-between items-center">
        </div>
      </div>

      {/* 主要内容区域 - 调整整体位置 */}
      <div className="max-w-4xl mx-auto px-6 min-h-screen flex flex-col">
        {/* Logo 区域 - 减少上方空间，调整 flex 比例 */}
        <div className="flex-[0.4] flex flex-col items-center justify-end mb-16">
          <Image 
            src={getAssetPath("/42deep.png")} 
            alt="42deep Logo" 
            width={200} 
            height={200} 
            className="object-contain"
            priority
          />
        </div>

        {/* 搜索区域 - 调整 flex 比例 */}
        <div className="flex-[0.6] mb-24">
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <div className="flex gap-2 w-full max-w-4xl">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask something..."
                autoFocus
                className="flex-1 p-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-default)] text-base"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isSearching}
                className="px-5 py-3 bg-[var(--brand-default)] text-white rounded-md hover:bg-[var(--brand-muted)] font-medium w-[120px]"
              >
                {isSearching ? (
                  <span className="inline-flex justify-center items-center">
                    <span>Searching</span>
                    <span className="w-[24px] text-left">{loadingDots}</span>
                  </span>
                ) : (
                  'Search'
                )}
              </button>
            </div>
            
            {/* {showModelNotice && (
              <p className="text-xs md:text-sm text-gray-600 mt-8">
                Switched to DeepSeek V3 model from DeepSeek R1 due to high traffic
              </p>
            )} */}
          </form>
        </div>
      </div>
    </>
  );
}
