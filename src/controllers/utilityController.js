const whatsappService = require("../services/whatsappService");
const { sendResponse } = require("../utils/response");
const httpStatusCode = require("../constants/httpStatusCode");
const Joi = require("joi");

module.exports = {
  async getGroups(req, res) {
    const { sessionId } = req.params;

    try {
      const client = whatsappService.getSession(sessionId);
      if (!client) {
        return sendResponse(res, httpStatusCode.NOT_FOUND, "Session not found");
      }

      console.log(`[${sessionId}] Fetching group list...`);
      const groups = await whatsappService.groupFetchAllParticipating(client);
      if (!groups) {
        return sendResponse(res, httpStatusCode.NOT_FOUND, "Groups not found");
      }

      // Format data grup
      const formattedGroups = Object.entries(groups).map(([id, group]) => ({
        id: id,
        subject: group.subject,
        creation: group.creation,
        owner: group.owner,
        desc: group.desc,
        participants: group.participants.map((participant) => ({
          id: participant.id,
          admin: participant.admin || null,
        })),
        participant_count: group.participants.length,
        ephemeral: group.ephemeral || null,
        announce: group.announce || false,
        restrict: group.restrict || false,
      }));

      return sendResponse(
        res,
        httpStatusCode.OK,
        "Groups retrieved successfully",
        {
          groups: formattedGroups,
        }
      );
    } catch (error) {
      console.error(`[${sessionId}] Error getting groups:`, error);
      return sendResponse(
        res,
        httpStatusCode.INTERNAL_SERVER_ERROR,
        "Failed to get groups",
        error.message
      );
    }
  },

  async checkNumber(req, res) {
    const schema = Joi.object({
      sessionId: Joi.string().required(),
      phone: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return sendResponse(
        res,
        httpStatusCode.BAD_REQUEST,
        error.details[0].message
      );
    }

    const { sessionId, phone } = req.body;
    const formattedPhone = whatsappService.formatPhone(phone);

    try {
      const client = whatsappService.getSession(sessionId);
      if (!client) {
        return sendResponse(res, httpStatusCode.NOT_FOUND, "Session not found");
      }

      console.log(`[${sessionId}] Checking number ${formattedPhone}`);
      const exists = await whatsappService.isExists(client, formattedPhone);
      const phoneNumber = formattedPhone.replace(/[^0-9]/g, "");

      return sendResponse(
        res,
        httpStatusCode.OK,
        "Number checked successfully",
        {
          phone: phoneNumber,
          exists: exists,
          whatsapp_id: formattedPhone,
        }
      );
    } catch (error) {
      console.error(`[${sessionId}] Error checking number:`, error);
      return sendResponse(
        res,
        httpStatusCode.INTERNAL_SERVER_ERROR,
        "Failed to check number",
        error.message
      );
    }
  },
};
