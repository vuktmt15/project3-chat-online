import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import { Button } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import io from "socket.io-client";
import { Link } from "react-router-dom"; // Assuming you're using React Router for navigation
//import MeetingsComponent from "./MeetingsComponent"; // Import your Meetings component

const ENDPOINT = "http://localhost:8000";
var socket;

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
  }, []);

  useEffect(() => {
    socket.on(`update_group_has_user_${user._id}`, () => {
      window.location.reload();
    });
  });

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <>
      <Box
        position="fixed"
        top="0"
        right="150"
        p={3}
        zIndex="1" // Ensure the button is above other elements
      >
        <Link to="/meeting" target="_blank" rel="noopener noreferrer">
          <Button
            onClick={() => window.open("http://localhost:3000", "_blank")}
            variant="outline"
            size="sm"
            fontSize={{ base: "12px", md: "14px", lg: "12px" }}
          >
            + Add Meeting
          </Button>
        </Link>
      </Box>

      <Box
        display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
        flexDir="column"
        alignItems="center"
        p={3}
        bg="white"
        w={{ base: "100%", md: "31%" }}
        borderRadius="lg"
        borderWidth="1px"
        ml={{ base: "0", md: "60px" }} // Adjust the left margin as needed
      >
        <Box
          pb={3}
          px={3}
          fontSize={{ base: "28px", md: "30px" }}
          fontFamily="Work sans"
          display="flex"
          w="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          My Chats
          <Stack direction="row">
            <GroupChatModal>
              <Button
                display="flex"
                fontSize={{ base: "17px", md: "10px", lg: "17px" }}
                rightIcon={<AddIcon />}
              >
                New Group Chat
              </Button>
            </GroupChatModal>
          </Stack>
        </Box>
        <Box
          display="flex"
          flexDir="column"
          p={3}
          bg="#F8F8F8"
          w="100%"
          h="100%"
          borderRadius="lg"
          overflowY="hidden"
        >
          {chats ? (
            <Stack overflowY="scroll">
              {chats.map((chat) => (
                <Box
                  onClick={() => {
                    setSelectedChat(chat);

                    // Click on the group chat
                    if (chat.users.length >= 3) {
                      setNotification(
                        notification.filter((n) => n.chat._id !== chat._id)
                      );
                    }

                    // Click on the single chat
                    if (chat.users.length < 3) {
                      setNotification(
                        notification.filter(
                          (n) => n.sender._id !== chat.latestMessage.sender._id
                        )
                      );
                    }
                  }}
                  cursor="pointer"
                  bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                  color={selectedChat === chat ? "white" : "black"}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  key={chat._id}
                >
                  <Text>
                    {!chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName}
                  </Text>
                  {chat.latestMessage && (
                    <Text fontSize="xs">
                      <b>{chat.latestMessage.sender.name} : </b>
                      {chat.latestMessage.content.length > 50
                        ? chat.latestMessage.content.substring(0, 51) + "..."
                        : chat.latestMessage.content}
                    </Text>
                  )}
                </Box>
              ))}
            </Stack>
          ) : (
            <ChatLoading />
          )}
        </Box>
      </Box>
    </>
  );
};

export default MyChats;
