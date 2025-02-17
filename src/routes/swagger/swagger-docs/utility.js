/**
 * @swagger
 * tags:
 *   name: Utility
 *   description: API Endpoint untuk utilitas dan helper
 */

/**
 * @swagger
 * /utility/groups/{sessionId}:
 *   get:
 *     summary: Mendapatkan daftar grup
 *     tags: [Utility]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           example: "session_id_1"
 *         description: "ID sesi yang ingin dicek grupnya"
 *     responses:
 *       200:
 *         description: Daftar grup berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Groups retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     groups:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "123456789@g.us"
 *                           subject:
 *                             type: string
 *                             example: "My Group"
 *                           creation:
 *                             type: number
 *                             example: 1625097600
 *                           owner:
 *                             type: string
 *                             example: "6285123456789@s.whatsapp.net"
 *                           desc:
 *                             type: string
 *                             example: "Group Description"
 *                           participants:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   example: "6285123456789@s.whatsapp.net"
 *                                 admin:
 *                                   type: string
 *                                   enum: [null, "admin", "superadmin"]
 *                                   example: "admin"
 *                           participant_count:
 *                             type: integer
 *                             example: 50
 *                           ephemeral:
 *                             type: number
 *                             nullable: true
 *                             example: null
 *                           announce:
 *                             type: boolean
 *                             example: false
 *                           restrict:
 *                             type: boolean
 *                             example: false
 *
 * /utility/check-number:
 *   post:
 *     summary: Mengecek apakah nomor terdaftar di WhatsApp
 *     tags: [Utility]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - phone
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: "session_id_1"
 *               phone:
 *                 type: string
 *                 example: "6285123456789"
 *     responses:
 *       200:
 *         description: Pengecekan nomor berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Number checked successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     phone:
 *                       type: string
 *                       example: "6285123456789"
 *                     exists:
 *                       type: boolean
 *                       example: true
 *                     whatsapp_id:
 *                       type: string
 *                       example: "6285123456789@s.whatsapp.net"
 */
