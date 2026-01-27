// import { useEffect, useState } from "react";
// import { Send } from "lucide-react";
// import Footer from "../ts/Footer";
// import { isAuthenticated } from "../interface/authenticator";

// interface Message {
//   id: number;
//   content: string;
//   username: string;
//   timestamp: string;
// }

// export default function ChatPage() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState("");

//   useEffect(() => {
//     // --- WEBSOCKET ---
//     const ws = new WebSocket("/ws/");
//     ws.onopen = () => {
//       console.log("WebSocket connecté !");
//       ws.send(JSON.stringify({ type: "wsChat" }));
//     };

//     ws.onmessage = (event) => {
//       try {
//         const msg = JSON.parse(event.data);
//         if (msg.type === "new_message") {
//           setMessages((prev) => [...prev, msg.data]);
//         }
//       } catch (e) {
//         console.error("Erreur WS:", e);
//       }
//     };

//     ws.onclose = () => {
//       console.log("WebSocket déconnecté");
//     };

//     // --- FETCH MESSAGES INITIAUX --- \\
//     async function fetchMessages() {
//       try {
//         const res = await fetch("/api/messages", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ id_group: undefined }),
//         });
//         const data: Message[] = await res.json();
//         setMessages(data);
//       } catch (err) {
//         console.error("Erreur fetch messages:", err);
//       }
//     }

//     fetchMessages();

//     return () => ws.close(); // cleanup WebSocket à la fermeture
//   }, []);

//   const sendMessage = async () => {
//     console.log(newMessage);
//     if (!newMessage.trim()) return;

//     const auth = await isAuthenticated();
//     const id = auth?.id || null;
//     console.log(id);

//     try {
//       await fetch("/api/hello", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content: newMessage, id, id_group: undefined }),
//       });
//       setNewMessage(""); // reset input
//     } catch (err) {
//       console.error("Erreur envoi message:", err);
//     }

//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-[#FFF9E5]">
//       <div className="text-center">
//         <h2 className="text-2xl text-[#8B5A3C] mt-4">Chat</h2>
//       </div>

//       <div className="flex-1 max-w-4xl w-full mx-auto bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border-4 border-[#FEE96E] flex flex-col overflow-hidden">
//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-6 space-y-4">
//           {messages.map((msg) => (
//             <div key={msg.id} className={`flex ${ msg.username === "user" ? "justify-start" : "justify-end"}`}>
//               <div className={`max-w-md px-6 py-3 rounded-3xl ${ msg.username === "user" ? "bg-[#FEE96E] text-[#8B5A3C]" : "bg-gray-200 text-gray-800" }`} >
//                 <p>{msg.content}</p>
//                 <p className="text-xs mt-1 opacity-70">
//                   {new Date(msg.timestamp).toLocaleTimeString("fr-FR", {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Input */}
//         <div className="p-6 border-t-4 border-[#FEE96E] flex-none">
//           <div className="flex gap-4">
//             <input
//               type="text"
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//               placeholder="Tapez votre message..."
//               className="flex-1 px-6 py-3 rounded-full border-2 border-[#FEE96E] focus:outline-none focus:border-[#8B5A3C]"
//             />
//             <button onClick={sendMessage} className="bg-[#FEE96E] text-[#8B5A3C] px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
//               <Send className="w-5 h-5" />
//               Envoyer
//             </button>
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// }
