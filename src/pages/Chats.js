import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  Loader2,
  Image as ImageIcon,
  X,
  ZoomIn,
} from "lucide-react";
import {
  getMessages,
  sendMessage,
  markAsRead,
  getConversationsByStore,
} from "../api/ConversationApi";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/socketContext";
const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);

  // Image handling states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  // Typing states
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeoutRef = useRef(null);

  // Socket
  const {
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    sendMessage: socketSendMessage,
    onNewMessage,
    onMessageRead,
    onTyping,
    emitTyping,
    markAsRead: socketMarkAsRead,
  } = useSocket();

  const { user } = useAuth();

  const SHOP_ID = user?.storeId;
  const SENDER_TYPE = "shop";
  const SENDER_ID = user?.id || user?._id;

  // Lắng nghe tin nhắn mới từ socket
  useEffect(() => {
    if (!isConnected) return;

    const cleanup1 = onNewMessage(async (data) => {
      const { message, conversationId } = data;
      console.log("New message received:", message);
      // Cập nhật tin nhắn nếu đang xem conversation này
      if (
        selectedChat !== null &&
        conversations[selectedChat]?.id === conversationId
      ) {
        const newMsg = {
          id: message._id,
          text: message.content,
          sender: message.sender_type,
          time: formatTime(message.created_at),
          messageType: message.message_type,
          imageUrl: message.message_type === "image" ? message.content : null,
        };
        setMessages((prev) => [...prev, newMsg]);
      }

      // Cập nhật conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: getLastMessageDisplay(message),
                time: formatTime(message.created_at),
                unread:
                  message.sender_type !== SENDER_TYPE
                    ? (conv.unread || 0) + 1
                    : conv.unread,
              }
            : conv
        )
      );
    });

    const cleanup2 = onMessageRead((data) => {
      const { conversationId, messageIds } = data;

      // Cập nhật trạng thái đã đọc cho conversations
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unread: 0 } : conv
        )
      );
    });

    const cleanup3 = onTyping((data) => {
      const { conversationId, userId, userType, isTyping } = data;

      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: isTyping ? { userId, userType } : null,
      }));

      // Tự động xóa typing sau 3 giây
      if (isTyping) {
        setTimeout(() => {
          setTypingUsers((prev) => ({
            ...prev,
            [conversationId]: null,
          }));
        }, 3000);
      }
    });

    return () => {
      if (cleanup1) cleanup1();
      if (cleanup2) cleanup2();
      if (cleanup3) cleanup3();
    };
  }, [sendingMessage, isConnected, selectedChat, conversations]);

  // Join/leave conversation khi chuyển chat
  useEffect(() => {
    if (selectedChat !== null && conversations[selectedChat]) {
      const conversationId = conversations[selectedChat].id;
      joinConversation(conversationId);
      loadMessages(conversationId);

      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [selectedChat]);

  useEffect(() => {
    if (SHOP_ID) {
      loadConversations();
    }
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getConversationsByStore({ storeId: SHOP_ID });

      if (response.status === 200 && response.data.success) {
        const transformedConversations = response.data.data.map((conv) => ({
          id: conv._id,
          name: conv.metadata?.customer_name || "Khách hàng",
          avatar: getInitials(conv.metadata?.customer_name || "K"),
          lastMessage: getLastMessageDisplay(conv.last_message),
          time: formatTime(conv.last_message?.sent_at || conv.updated_at),
          unread: conv.unread_count?.shop || 0,
          online: onlineUsers.has(conv.customer_id), // Kiểm tra online status
          customer_id: conv.customer_id,
          shop_id: conv.shop_id,
          status: conv.status,
        }));

        setConversations(transformedConversations);

        if (transformedConversations.length > 0 && selectedChat === null) {
          setSelectedChat(0);
        }
      } else {
        setError("Không thể tải danh sách cuộc trò chuyện");
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      setError("Không thể tải danh sách cuộc trò chuyện");
    } finally {
      setLoading(false);
    }
  };

  const getLastMessageDisplay = (lastMessage) => {
    if (!lastMessage) return "Chưa có tin nhắn";

    if (lastMessage.message_type === "image") {
      return "📷 Đã gửi một ảnh";
    }

    return lastMessage.content || "Tin nhắn";
  };

  const loadMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      const response = await getMessages(conversationId);

      if (response.status === 200 && response.data.success) {
        const transformedMessages = response.data.data.map((msg) => ({
          id: msg._id,
          text: msg.content,
          sender: msg.sender_type,
          time: formatTime(msg.created_at),
          reply_to: msg.reply_to,
          messageType: msg.message_type,
          imageUrl: msg.message_type === "image" ? msg.content : null,
        }));

        setMessages(transformedMessages);

        // Mark as read bằng socket
        socketMarkAsRead(
          conversationId,
          transformedMessages.map((msg) => msg.id)
        );
        await markAsRead(conversationId, SENDER_TYPE);
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, unread: 0 } : conv
          )
        );
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      setError("Không thể tải tin nhắn");
    } finally {
      setMessagesLoading(false);
    }
  };

  // Handle typing
  const handleTyping = (value) => {
    setNewMessage(value);

    if (selectedChat !== null && conversations[selectedChat]) {
      const conversationId = conversations[selectedChat].id;

      // Emit typing
      emitTyping(conversationId, value.length > 0);

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(conversationId, false);
      }, 1000);
    }
  };

  const handleSendImage = async () => {
    if (!selectedImage || selectedChat === null || uploadingImage) return;

    const currentConversation = conversations[selectedChat];
    if (!currentConversation) return;

    try {
      setUploadingImage(true);

      const imageUrl = await uploadImageToServer(selectedImage);

      const messageData = {
        sender_id: SENDER_ID,
        sender_type: SENDER_TYPE,
        content: imageUrl,
        message_type: "image",
      };

      // Gửi qua socket thay vì API trực tiếp
      socketSendMessage(currentConversation.id, messageData);

      // Clear image selection
      removeSelectedImage();
    } catch (error) {
      console.error("Error sending image:", error);
      setError("Không thể gửi ảnh");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || selectedChat === null || sendingMessage) return;

    const currentConversation = conversations[selectedChat];
    if (!currentConversation) return;

    try {
      setSendingMessage(true);

      const messageData = {
        sender_id: SENDER_ID,
        sender_type: SENDER_TYPE,
        content: newMessage.trim(),
        message_type: "text",
      };

      socketSendMessage(currentConversation.id, messageData);
      await sendMessage(currentConversation.id, messageData);
      setNewMessage("");

      // Stop typing
      emitTyping(currentConversation.id, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Không thể gửi tin nhắn");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Image handling functions
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        alert("Vui lòng chọn file ảnh");
      }
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const uploadImageToServer = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    return `https://picsum.photos/400/300?random=${Date.now()}`;
  };

  const openFullScreenImage = (imageUrl) => {
    setFullScreenImage(imageUrl);
  };

  const closeFullScreenImage = () => {
    setFullScreenImage(null);
  };

  const renderMessageContent = (message) => {
    if (message.messageType === "image" && message.imageUrl) {
      return (
        <div className="space-y-2">
          <img
            src={message.imageUrl}
            alt="Sent image"
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => openFullScreenImage(message.imageUrl)}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />
          <div style={{ display: "none" }} className="text-sm opacity-75">
            📷 Ảnh không thể tải
          </div>
          <p
            className={`text-xs mt-1 ${
              message.sender === "shop" ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {message.time}
          </p>
        </div>
      );
    }

    return (
      <>
        <p className="text-sm">{message.text}</p>
        <p
          className={`text-xs mt-1 ${
            message.sender === "shop" ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {message.time}
        </p>
      </>
    );
  };

  // Utility functions
  const getInitials = (name) => {
    if (!name) return "K";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    if (diffInMinutes < 10080)
      return `${Math.floor(diffInMinutes / 1440)} ngày trước`;

    return date.toLocaleDateString("vi-VN");
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentConversation =
    selectedChat !== null ? conversations[selectedChat] : null;

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Đang tải cuộc trò chuyện...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadConversations}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!SHOP_ID) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Vui lòng đăng nhập để sử dụng chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800 mb-3">
            Customer Messages
          </h1>
          <div className="relative">
            <Search
              className="text-gray-400 w-4 h-4"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Không có cuộc trò chuyện nào
            </div>
          ) : (
            filteredConversations.map((conversation, index) => (
              <div
                key={conversation.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat === index
                    ? "bg-blue-50 border-r-2 border-r-blue-500"
                    : ""
                }`}
                onClick={() => setSelectedChat(index)}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {conversation.avatar}
                    </div>
                    {conversation.online && (
                      <div
                        className="w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                        style={{
                          position: "absolute",
                          bottom: "-4px",
                          right: "-4px",
                        }}
                      ></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {conversation.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unread > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Side - Chat Interface */}
      <div className="flex-1 flex flex-col bg-white">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {currentConversation.avatar}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-medium text-gray-900">
                      {currentConversation.name}
                    </h2>
                    <div className="flex text-sm text-gray-500">
                      <>
                        {currentConversation.online
                          ? "Online"
                          : typingUsers[currentConversation.id]
                          ? "Đang nhập..."
                          : "Last seen 2 hours ago"}
                      </>
                      {currentConversation.online && (
                        <div className="m-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full items-center justify-center"></div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang tải tin nhắn...</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Chưa có tin nhắn nào
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "shop"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === "shop"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {renderMessageContent(message)}
                    </div>
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {typingUsers[currentConversation.id] && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">
                        đang nhập...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={removeSelectedImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Ảnh đã chọn
                    </p>
                    <p className="text-xs text-gray-500">
                      Nhấn gửi để gửi ảnh này
                    </p>
                  </div>
                  <button
                    onClick={handleSendImage}
                    disabled={uploadingImage}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Gửi ảnh"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end space-x-2">
                <label className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  <ImageIcon className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    rows={1}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sendingMessage}
                    style={{
                      minHeight: "40px",
                      maxHeight: "120px",
                    }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Chọn một cuộc trò chuyện để bắt đầu
          </div>
        )}
      </div>

      {/* Full Screen Image Modal */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={closeFullScreenImage}
        >
          <div className="relative max-w-4xl max-h-4xl">
            <button
              onClick={closeFullScreenImage}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={fullScreenImage}
              alt="Full screen view"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;