import React, { useState } from "react";
import {
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
} from "lucide-react";

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(0);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data for conversations
  const conversations = [
    {
      id: 1,
      name: "Nguyễn Thị Hoa",
      avatar: "NH",
      lastMessage: "Váy xanh có size M không ạ?",
      time: "2 phút trước",
      unread: 2,
      online: true,
      messages: [
        {
          id: 1,
          text: "Chào shop! Em quan tâm đến chiếc váy hè màu xanh trong catalog ạ",
          sender: "customer",
          time: "10:30",
        },
        {
          id: 2,
          text: "Chào chị Hoa! Cảm ơn chị đã quan tâm. Chị đang nói về chiếc váy nào cụ thể ạ?",
          sender: "store",
          time: "10:32",
        },
        {
          id: 3,
          text: "Chiếc có họa tiết hoa, mã sản phẩm #BD2024 ạ",
          sender: "customer",
          time: "10:35",
        },
        {
          id: 4,
          text: "Tuyệt vời! Đó là một trong những sản phẩm bán chạy nhất của shop. Chị cần size nào ạ?",
          sender: "store",
          time: "10:36",
        },
        {
          id: 5,
          text: "Váy xanh có size M không ạ?",
          sender: "customer",
          time: "10:38",
        },
      ],
    },
    {
      id: 2,
      name: "Trần Văn Minh",
      avatar: "TM",
      lastMessage: "Cảm ơn shop đã phản hồi nhanh!",
      time: "15 phút trước",
      unread: 0,
      online: false,
      messages: [
        {
          id: 1,
          text: "Khi nào shop nhập lại giày sneaker đen vậy ạ?",
          sender: "customer",
          time: "9:45",
        },
        {
          id: 2,
          text: "Chào anh Minh! Shop dự kiến có hàng mới vào thứ 6 tuần sau. Anh có muốn shop báo khi có hàng không ạ?",
          sender: "store",
          time: "9:47",
        },
        {
          id: 3,
          text: "Được lắm ạ! Shop nhớ báo em nhé.",
          sender: "customer",
          time: "9:48",
        },
        {
          id: 4,
          text: "Cảm ơn shop đã phản hồi nhanh!",
          sender: "customer",
          time: "9:50",
        },
      ],
    },
    {
      id: 3,
      name: "Lê Thị Mai",
      avatar: "LM",
      lastMessage: "Đặt số lượng lớn có được giảm giá không ạ?",
      time: "1 giờ trước",
      unread: 1,
      online: true,
      messages: [
        {
          id: 1,
          text: "Em muốn đặt 20 chiếc áo cotton organic của shop",
          sender: "customer",
          time: "8:30",
        },
        {
          id: 2,
          text: "Tuyệt vời! Với đơn hàng trên 15 sản phẩm, shop có giảm giá 15% ạ.",
          sender: "store",
          time: "8:32",
        },
        {
          id: 3,
          text: "Đặt số lượng lớn có được giảm giá không ạ?",
          sender: "customer",
          time: "8:35",
        },
      ],
    },
    {
      id: 4,
      name: "Phạm Đức Long",
      avatar: "PL",
      lastMessage: "Chính sách đổi trả của shop như thế nào ạ?",
      time: "3 giờ trước",
      unread: 0,
      online: false,
      messages: [
        {
          id: 1,
          text: "Em nhận được hàng rồi nhưng size không vừa ạ",
          sender: "customer",
          time: "6:15",
        },
        {
          id: 2,
          text: "Shop rất tiếc về điều này! Shop hỗ trợ đổi size miễn phí trong vòng 30 ngày ạ.",
          sender: "store",
          time: "6:18",
        },
        {
          id: 3,
          text: "Chính sách đổi trả của shop như thế nào ạ?",
          sender: "customer",
          time: "6:20",
        },
      ],
    },
    {
      id: 5,
      name: "Võ Thị Lan",
      avatar: "VL",
      lastMessage: "Được rồi, em đặt hàng ngay ạ",
      time: "Hôm qua",
      unread: 0,
      online: false,
      messages: [
        {
          id: 1,
          text: "Áo khoác này có màu trắng không ạ?",
          sender: "customer",
          time: "Hôm qua 14:30",
        },
        {
          id: 2,
          text: "Có ạ! Shop có màu trắng size S, M và L. Chị cần size nào ạ?",
          sender: "store",
          time: "Hôm qua 14:32",
        },
        {
          id: 3,
          text: "Được rồi, em đặt hàng ngay ạ",
          sender: "customer",
          time: "Hôm qua 14:35",
        },
      ],
    },
  ];

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentConversation = conversations[selectedChat];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to your backend
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
          {filteredConversations.map((conversation, index) => (
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
                  <div className="flex items-center space-x-1">
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unread > 0 && (
                      <div className="mt-2">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                          {conversation.unread}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Chat Interface */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {currentConversation.avatar}
                </div>
                {currentConversation.online && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <h2 className="font-medium text-gray-900">
                  {currentConversation.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {currentConversation.online
                    ? "Online"
                    : "Last seen 2 hours ago"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Info className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentConversation.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "store" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === "store"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === "store"
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <textarea
                rows={1}
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  minHeight: "40px",
                  maxHeight: "120px",
                }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
