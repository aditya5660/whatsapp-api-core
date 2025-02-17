/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: API Endpoint untuk manajemen sesi WhatsApp
 */

/**
 * @swagger
 * /sessions/{sessionId}:
 *   post:
 *     summary: Membuat sesi WhatsApp baru
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           example: "session_id_1"
 *         description: "ID sesi yang unik"
 *     responses:
 *       200:
 *         description: Sesi berhasil dibuat atau sudah ada
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
 *                   example: "Session already exists and connected"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [connected, exists, not_found]
 *                       example: "connected"
 *                     user:
 *                       type: object
 *                       description: "Data pengguna WhatsApp"
 *                     connectionState:
 *                       type: string
 *                       enum: [open, closed, null]
 *                       example: "open"
 *                     qr:
 *                       type: string
 *                       description: "QR code dalam format base64 (hanya untuk sesi baru)"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to create session"
 *                 error:
 *                   type: string
 *                   example: "Connection timeout"
 *
 *   get:
 *     summary: Mengecek status sesi
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           example: "session_id_1"
 *         description: "ID sesi yang ingin dicek"
 *     responses:
 *       200:
 *         description: Status sesi berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [connected, exists, not_found, error]
 *                       example: "connected"
 *                     user:
 *                       type: object
 *                       description: "Data pengguna WhatsApp"
 *                     connectionState:
 *                       type: string
 *                       enum: [open, closed, null]
 *                       example: "open"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sesi tidak ditemukan
 */

/**
 * @swagger
 * /sessions/{sessionId}/logout:
 *   post:
 *     summary: Logout dari sesi WhatsApp
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           example: "session_id_1"
 *         description: "ID sesi yang ingin dilogout"
 *     responses:
 *       200:
 *         description: Berhasil logout
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
 *                   example: "Session logged out successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       example: "session_id_1"
 *                     status:
 *                       type: string
 *                       example: "logged_out"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sesi tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Session not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to logout session"
 *                 error:
 *                   type: string
 *                   example: "Error message details"
 */
