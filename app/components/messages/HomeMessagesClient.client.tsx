import { useEffect, useState } from "react";
import { Form, Link, useActionData, useNavigation, useRevalidator } from "@remix-run/react";
import { useUser } from "@clerk/remix";
import { useSupabase } from "~/hooks/useSupabase";
import type { loader, action } from "~/routes/_index";
import type { SerializeFrom } from "@remix-run/node";

const EMOJIS = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🫣', '🤗', '🫡', '🤔', '🫢', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🫠', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🫥', '🤐', '🥴', '🤢', '🤮', '🤧', '😷'];
const EMOJIS_PER_PAGE = 32;

interface Message {
    id: string;
    user_id: string;
    username: string;
    content: string;
    status: string;
    created_at: string;
}

type LoaderData = SerializeFrom<typeof loader>;

interface HomeMessagesClientProps {
    messages: LoaderData['messages'];
    userId: LoaderData['userId'];
    canPost: LoaderData['canPost'];
    defaultAvatar: LoaderData['defaultAvatar'];
}

export default function HomeMessagesClient({ messages, userId, canPost, defaultAvatar }: HomeMessagesClientProps) {
    const actionData = useActionData<typeof action>();
    const { user: clerkUser } = useUser();
    const { supabase } = useSupabase();
    const revalidator = useRevalidator();
    const navigation = useNavigation();
    
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiPage, setEmojiPage] = useState(0);
    
    const isSubmitting = navigation.state === "submitting";

    useEffect(() => {
        if (!supabase) return;
        
        const channel = supabase
            .channel('messages-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: 'status=eq.approved' },
                () => {
                    revalidator.revalidate();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, revalidator]);

    // Clear message input on successful submission
    useEffect(() => {
        if (actionData && 'success' in actionData && actionData.success) {
            setMessage("");
            setShowEmojiPicker(false);
        }
    }, [actionData]);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.emoji-picker') && !target.closest('.emoji-trigger')) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showEmojiPicker]);
    
    const addEmoji = (emoji: string) => {
        setMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const getCurrentPageEmojis = () => {
        const startIndex = emojiPage * EMOJIS_PER_PAGE;
        return EMOJIS.slice(startIndex, startIndex + EMOJIS_PER_PAGE);
    };

    const totalEmojiPages = Math.ceil(EMOJIS.length / EMOJIS_PER_PAGE);

    const getUserDisplayName = (msg: Message) => {
        return msg.username || `User ${msg.user_id.substring(0, 8)}`;
    };

    const getUserAvatar = (msg: Message) => {
        // If it's the current user, try to get their avatar from Clerk
        if (msg.user_id === userId?.toString() && clerkUser?.imageUrl) {
            return clerkUser.imageUrl;
        }
        return defaultAvatar;
    };

    const currentUserName = clerkUser ? ((clerkUser.firstName || clerkUser.lastName) ? `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() : (clerkUser.username || clerkUser.emailAddresses?.[0]?.emailAddress.split('@')[0] || '')) : '';

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden p-8 max-w-4xl mx-auto">
            {/* Messages Display */}
            {messages.length > 0 ? (
                <div className="mb-8">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {messages.slice(0, 5).map((msg) => {
                            const isOwnMessage = msg.user_id === userId?.toString();
                            return (
                                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`} key={msg.id}>
                                    <div className={`flex items-start space-x-3 max-w-xs ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        <img 
                                            src={getUserAvatar(msg)} 
                                            alt="Avatar" 
                                            className="w-8 h-8 rounded-full flex-shrink-0"
                                            loading="lazy"
                                        />
                                        <div className={`rounded-2xl px-4 py-2 shadow-md ${
                                            isOwnMessage 
                                                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-tr-sm' 
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                                        }`}>
                                            <div className="text-xs opacity-70 mb-1">
                                                {getUserDisplayName(msg)}
                                            </div>
                                            <p className="text-sm">{msg.content}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {messages.length > 5 && (
                            <div className="text-center">
                                <p className="text-gray-500 text-sm">
                                    还有 {messages.length - 5} 条留言...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500 mb-8">
                    <p>还没有留言，来发表第一条吧！</p>
                </div>
            )}

            {/* Success/Error Messages */}
            {actionData && 'success' in actionData && actionData.success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                    {actionData.success}
                </div>
            )}
            {actionData && 'error' in actionData && actionData.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {actionData.error}
                </div>
            )}

            {/* Message Form */}
            {!userId ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl">
                    <p className="text-gray-600">
                        请 <Link to="/sign-in" className="text-purple-600 hover:text-purple-700 font-medium" prefetch="intent">登录</Link> 后发表留言
                    </p>
                </div>
            ) : (
                /* 直接显示留言表单，无时间限制 */
                        <Form method="post" className="space-y-4">
                            {currentUserName && (
                                <p className="text-sm text-gray-500">
                                    已登录为 <span className="font-medium text-purple-600">{currentUserName}</span>
                                </p>
                            )}
                            <div className="relative">
                                <textarea
                                    name="content"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="分享您的想法..."
                                    rows={3}
                                    required
                                />
                                <button
                                    type="button"
                                    className="emoji-trigger absolute bottom-3 right-3 text-xl hover:scale-110 transition-transform"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    title="添加表情"
                                >
                                    😊
                                </button>
                                {showEmojiPicker && (
                                    <div className="emoji-picker absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                                        <div className="text-sm text-gray-600 mb-2">选择表情</div>
                                        <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                                            {getCurrentPageEmojis().map((emoji, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    className="w-8 h-8 text-lg hover:bg-gray-100 rounded transition-colors"
                                                    onClick={() => addEmoji(emoji)}
                                                    title={emoji}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                        {totalEmojiPages > 1 && (
                                            <div className="flex justify-between items-center mt-2 text-sm">
                                                <button
                                                    type="button"
                                                    className="px-2 py-1 text-gray-600 disabled:opacity-50"
                                                    onClick={() => setEmojiPage(Math.max(0, emojiPage - 1))}
                                                    disabled={emojiPage === 0}
                                                >
                                                    ←
                                                </button>
                                                <span className="text-gray-500">
                                                    {emojiPage + 1}/{totalEmojiPages}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="px-2 py-1 text-gray-600 disabled:opacity-50"
                                                    onClick={() => setEmojiPage(Math.min(totalEmojiPages - 1, emojiPage + 1))}
                                                    disabled={emojiPage === totalEmojiPages - 1}
                                                >
                                                    →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting || !message.trim()} 
                                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                                >
                                    {isSubmitting ? '发送中...' : '发送留言'}
                                </button>
                            </div>
                        </Form>
            )}
        </div>
    );
} 