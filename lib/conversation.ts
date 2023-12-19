import { Types } from "mongoose";
import { connectToDB } from "./dbConnection";
import { Conversation, Member, Profile } from "./modals/modals";

export const getOrCreateConversation = async (
  memberOneId: string,
  memberTwoId: string
) => {
  // MemberOne will always considered as the sender of the message.
  // MemberTwo will always considered as the receiver of the message.

  let conversation =
    // Find those conversations that we initiated.
    (await findConversation(memberOneId, memberTwoId)) ||
    // Find those conversations that we received.
    (await findConversation(memberTwoId, memberOneId));

  // If no conversation found, then we will create one.

  if (!conversation)
    conversation = await createNewConversation(memberOneId, memberTwoId);

  return conversation;
};

const findConversation = async (memberOneId: string, memberTwoId: string) => {
  try {
    connectToDB();

    const memberOneObjectId = new Types.ObjectId(memberOneId);
    const memberTwoObjectId = new Types.ObjectId(memberTwoId);

    const conversation: any = await Conversation.findOne({
      memberOneId: memberOneObjectId,
      memberTwoId: memberTwoObjectId,
    });

    if (conversation?._id) {
      const memberOne = await Member.findById(memberOneObjectId).populate({
        path: "profileId",
        model: Profile,
      });

      const memberTwo = await Member.findById(memberTwoObjectId).populate({
        path: "profileId",
        model: Profile,
      });

      return {
        conversationId: conversation?._id?.toString(),
        memberOne,
        memberTwo,
      };
    }

    return null;
  } catch (error: any) {
    console.log("Error while finding the conversation", error.message);
  }
};

const createNewConversation = async (
  memberOneId: string,
  memberTwoId: string
) => {
  try {
    connectToDB();

    const memberOneObjectId = new Types.ObjectId(memberOneId);
    const memberTwoObjectId = new Types.ObjectId(memberTwoId);

    const conversation = await Conversation.create({
      memberOneId: memberOneObjectId,
      memberTwoId: memberTwoObjectId,
    });

    if (conversation?._id) {
      const memberOne = await Member.findById(memberOneObjectId).populate({
        path: "profileId",
        model: Profile,
      });

      const memberTwo = await Member.findById(memberTwoObjectId).populate({
        path: "profileId",
        model: Profile,
      });

      return {
        conversationId: conversation?._id?.toString(),
        memberOne,
        memberTwo,
      };
    }

    return null;
  } catch (error: any) {
    console.log("Error while creating a new conversation", error.message);
  }
};
